const prisma = require("../config/prisma");

// ==================== GET ACTIVITIES BY TICKET ====================
exports.getActivitiesByTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        project: {
          OR: [{ createdById: userId }, { members: { some: { id: userId } } }],
        },
      },
    });

    if (!ticket) {
      return next(
        new AppError("Ticket not found or you don't have access", 404),
      );
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { ticketId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          ticket: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.activity.count({ where: { ticketId } }),
    ]);

    res.json({
      success: true,
      activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET ACTIVITIES BY PROJECT ====================
exports.getActivitiesByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ createdById: userId }, { members: { some: { id: userId } } }],
      },
    });

    if (!project) {
      return next(
        new AppError("Project not found or you don't have access", 404),
      );
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { projectId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          ticket: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.activity.count({ where: { projectId } }),
    ]);

    res.json({
      success: true,
      activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CREATE ACTIVITY HELPER ====================
exports.createActivity = async (data) => {
  try {
    const activity = await prisma.activity.create({
      data: {
        action: data.action,
        type: data.type || "CREATED",
        metadata: data.metadata || {},
        userId: data.userId,
        ticketId: data.ticketId || null,
        projectId: data.projectId || null,
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
      if (data.ticketId) {
        global.io.to(`ticket:${data.ticketId}`).emit("activityAdded", activity);
      }
      if (data.projectId) {
        global.io
          .to(`project:${data.projectId}`)
          .emit("activityAdded", activity);
      }
    }

    return activity;
  } catch (error) {
    console.error("Failed to create activity:", error);
    return null;
  }
};
