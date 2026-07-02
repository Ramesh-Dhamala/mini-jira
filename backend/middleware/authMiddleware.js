const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login first.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed. Please login again.",
    });
  }
};

// Zod validation middleware (if using Zod)
// backend/middleware/authMiddleware.js
exports.validate = (schema) => {
  return (req, res, next) => {
    try {
      // ✅ Only validate if there is a body
      if (req.method === "GET") {
        return next(); // Skip validation for GET requests
      }
      schema.parse(req.body);
      next();
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided.",
        errors: err.errors,
      });
    }
  };
};