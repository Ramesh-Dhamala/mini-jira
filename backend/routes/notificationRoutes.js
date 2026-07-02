// backend/routes/notificationRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorize, ROLES } = require("../middleware/roles");

const {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  deleteReadNotifications,
  createNotificationAPI,
} = require("../controllers/notificationController");

router.use(protect);

// Notification routes
router.get("/", getNotifications);
router.get("/unread/count", getUnreadCount);
router.put("/read-all", markAllRead);
router.delete("/read", deleteReadNotifications);
router.put("/:id/read", markRead);
router.delete("/:id", deleteNotification);

// Admin only - create notification
router.post("/", authorize(ROLES.ADMIN), createNotificationAPI);

module.exports = router;
