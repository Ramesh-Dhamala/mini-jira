// backend/controllers/notificationController.js
const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

// ==================== GET NOTIFICATIONS ====================
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;

    const where = { userId };
    if (unreadOnly === "true") {
      where.read = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: parseInt(offset),
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET UNREAD COUNT ====================
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    res.json({
      success: true,
      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== MARK AS READ ====================
exports.markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      return next(new AppError("Notification not found", 404));
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json({
      success: true,
      message: "Notification marked as read",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== MARK ALL AS READ ====================
exports.markAllRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });

    res.json({
      success: true,
      message: `Marked ${result.count} notifications as read`,
      data: {
        updatedCount: result.count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE NOTIFICATION ====================
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      return next(new AppError("Notification not found", 404));
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE READ NOTIFICATIONS ====================
exports.deleteReadNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        read: true,
      },
    });

    res.json({
      success: true,
      message: `Deleted ${result.count} read notifications`,
      data: {
        deletedCount: result.count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CREATE NOTIFICATION (Helper) ====================
exports.createNotification = async (data) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        message: data.message,
        type: data.type || "info",
        ticketId: data.ticketId || null,
        projectId: data.projectId || null,
        link: data.link || null,
        metadata: data.metadata || {},
        read: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (global.io) {
      global.io.to(`user:${data.userId}`).emit("notification", notification);
    }

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
};

// ==================== CREATE NOTIFICATION VIA API ====================
exports.createNotificationAPI = async (req, res, next) => {
  try {
    const { userId, message, type, ticketId, projectId, link } = req.body;

    // Only admins can create notifications via API
    if (req.user.role !== "ADMIN") {
      return next(new AppError("Only admins can create notifications", 403));
    }

    const notification = await exports.createNotification({
      userId,
      message,
      type,
      ticketId,
      projectId,
      link,
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};
