// backend/routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  deleteReadNotifications,
} = require("../controllers/notificationController");

router.use(protect);

// ✅ These routes should exist
router.get("/", getNotifications);
router.get("/unread/count", getUnreadCount); // ✅ This should work
router.put("/read-all", markAllRead);
router.delete("/read", deleteReadNotifications);
router.put("/:id/read", markRead);
router.delete("/:id", deleteNotification);

module.exports = router;
