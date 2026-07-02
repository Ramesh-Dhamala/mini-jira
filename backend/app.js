// backend/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const path = require("path");
const swagger = require("./swagger");
// Example route with Swagger annotations:
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */

const app = express();

// ==================== SECURITY MIDDLEWARE ====================
app.use(helmet());

// ==================== CORS ====================
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ==================== RATE LIMITING ====================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // ✅ Increased from 100 to 1000
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);
app.use("/api/docs", swagger.serve, swagger.setup);
// ==================== LOGGING ====================
app.use(morgan("dev"));

// ==================== BODY PARSERS ====================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ==================== STATIC FILES ====================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// backend/app.js - Add after mounting routes

// ==================== ROUTES ====================
console.log("📁 Loading routes...");

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/sprints", require("./routes/sprintRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes")); // ✅ Make sure this is here
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/attachments", require("./routes/attachmentRoutes"));
app.use("/api/activities", require("./routes/activityRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
// Add this to app.js
app.use("/api/search", require("./routes/searchRoutes"));

console.log("✅ All routes loaded!");

// ==================== HEALTH CHECK ====================
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ==================== ERROR HANDLER ====================
const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

module.exports = app;


