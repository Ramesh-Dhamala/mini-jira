const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  getDashboard,
  getQuickStats,
} = require("../controllers/dashboardController");

// All routes require authentication
router.use(protect);

router.get("/", getDashboard);
router.get("/stats", getQuickStats);

module.exports = router;
