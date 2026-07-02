const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require("../validators/authValidator");

// ==================== CONSTANTS ====================
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate JWT token for authenticated user
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
};

/**
 * Remove password field from user object
 */
const excludePassword = (user) => {
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Format user response
 */
const formatUserResponse = (user, token = null) => {
  const response = {
    success: true,
    user: excludePassword(user),
  };

  if (token) {
    response.token = token;
  }

  return response;
};

/**
 * Check if email exists (excluding current user)
 */
const checkEmailExists = async (email, excludeUserId = null) => {
  const where = { email };
  if (excludeUserId) {
    where.NOT = { id: excludeUserId };
  }

  const user = await prisma.user.findFirst({ where });
  return !!user;
};

// ==================== AUTH CONTROLLERS ====================

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    console.log("📝 Request body received:", req.body);
    console.log("📝 Content-Type:", req.headers["content-type"]);

    let validatedData;
    try {
      validatedData = registerSchema.parse(req.body);
    } catch (validationError) {
      console.log("❌ Validation Error:", validationError.errors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationError.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const { name, email, password, role } = validatedData;
    console.log("✅ Validated data:", { name, email, role });

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists. Please login instead.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userRole = role || "MEMBER";

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: userRole,
      },
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome aboard 🎉",
      ...formatUserResponse(user, token),
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    next(error);
  }
};

// ==================== ✅ ADDED LOGIN FUNCTION ====================

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    console.log("📝 Login request for:", req.body.email);

    let validatedData;
    try {
      validatedData = loginSchema.parse(req.body);
    } catch (validationError) {
      console.log("❌ Login Validation Error:", validationError.errors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationError.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please try again.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please try again.",
      });
    }

    const token = generateToken(user.id, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    res.json({
      success: true,
      message: "Welcome back! 🚀",
      ...formatUserResponse(user, token),
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            projectsCreated: true,
            projectsMember: true,
            ticketsAssigned: true,
            ticketsCreated: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: "Logged out successfully. See you soon! 👋",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const { name, email, avatar } = validatedData;
    const userId = req.user.id;

    if (email) {
      const emailExists = await checkEmailExists(
        email.toLowerCase().trim(),
        userId,
      );

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email address is already taken by another user.",
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (avatar) updateData.avatar = avatar;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Profile updated successfully! ✅",
      user: excludePassword(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const validatedData = changePasswordSchema.parse(req.body);
    const { currentPassword, newPassword } = validatedData;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect. Please try again.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: "Password changed successfully! 🔒",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            projectsCreated: true,
            projectsMember: true,
            ticketsAssigned: true,
            ticketsCreated: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user account (Admin only)
 * @route   DELETE /api/auth/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: `User ${user.name} has been deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user role (Admin only)
 * @route   PUT /api/auth/users/:id/role
 * @access  Private/Admin
 */
exports.changeUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // ✅ FIX: Updated to match your schema
    const validRoles = ["ADMIN", "MANAGER", "MEMBER", "DEVELOPER", "VIEWER"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    res.json({
      success: true,
      message: `User ${user.name}'s role has been changed to ${role}.`,
      user: excludePassword(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};
// backend/controllers/authController.js

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, bio } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined,
        bio: bio || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};