const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const authController = require("../controllers/authController");
const { protect, validate } = require("../middleware/authMiddleware");
const { authorize, ROLES } = require("../middleware/roles");
const { getUserStats } = require("../controllers/userController"); // ✅ Import this
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require("../validators/authValidator");

// ==================== RATE LIMITING ====================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

// ==================== PUBLIC ROUTES ====================
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register,
);
router.post("/login", authLimiter, validate(loginSchema), authController.login);

// ==================== PROTECTED ROUTES ====================
router.use(protect);

// Profile routes
router.get("/me", authController.getMe);
router.post("/logout", authController.logout);
router.put(
  "/profile",
  validate(updateProfileSchema),
  authController.updateProfile,
);
router.put(
  "/password",
  validate(changePasswordSchema),
  authController.changePassword,
);

// ✅ ADD THIS - User Stats
router.get("/stats", getUserStats);

// Admin only routes
router.get("/users", authorize(ROLES.ADMIN), authController.getAllUsers);
router.delete("/users/:id", authorize(ROLES.ADMIN), authController.deleteUser);
router.put(
  "/users/:id/role",
  authorize(ROLES.ADMIN),
  authController.changeUserRole,
);

module.exports = router;
