const prisma = require("../config/prisma");

// ==================== GET USER STATS ====================
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all projects user is part of
    const userProjects = await prisma.project.findMany({
      where: {
        OR: [{ createdById: userId }, { members: { some: { id: userId } } }],
      },
      select: { id: true },
    });

    const projectIds = userProjects.map((p) => p.id);

    // Get all stats in parallel
    const [
      ticketsCreated,
      ticketsCompleted,
      commentsCount,
      projectsCount,
      totalTickets,
    ] = await Promise.all([
      // Tickets created by user
      prisma.ticket.count({
        where: { createdById: userId },
      }),

      // Tickets completed by user (assigned and done)
      prisma.ticket.count({
        where: {
          assigneeId: userId,
          status: "DONE",
        },
      }),

      // Comments by user
      prisma.comment.count({
        where: { userId },
      }),

      // Projects user is part of
      prisma.project.count({
        where: {
          OR: [{ createdById: userId }, { members: { some: { id: userId } } }],
        },
      }),

      // Total tickets in user's projects
      prisma.ticket.count({
        where: { projectId: { in: projectIds } },
      }),
    ]);

    // Calculate completion rate
    const completionRate =
      totalTickets > 0
        ? Math.round((ticketsCompleted / totalTickets) * 100)
        : 0;

    // Get recent activity
    const recentActivity = await prisma.activity.findMany({
      where: { userId },
      include: {
        ticket: {
          select: { id: true, title: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    res.json({
      success: true,
      stats: {
        ticketsCreated,
        ticketsCompleted,
        comments: commentsCount,
        projects: projectsCount,
        completionRate,
        sprintHealth: 92, // You can calculate this based on active sprints
        recentActivity: recentActivity.map((a) => ({
          action: a.action,
          ticketTitle: a.ticket?.title,
          projectName: a.project?.name,
          createdAt: a.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    next(error);
  }
};

// ==================== UPDATE USER PROFILE ====================
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email, bio } = req.body;

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
      },
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

const path = require("path");
const fs = require("fs");

// ==================== UPLOAD AVATAR ====================
exports.uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // File URL
    const fileUrl = `/uploads/${req.file.filename}`;

    // Update user avatar
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: fileUrl,
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
      },
    });

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      user,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    next(error);
  }
};

// ==================== GET USER STATS ====================
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userProjects = await prisma.project.findMany({
      where: {
        OR: [{ createdById: userId }, { members: { some: { id: userId } } }],
      },
      select: { id: true },
    });

    const projectIds = userProjects.map((p) => p.id);

    const [
      ticketsCreated,
      ticketsCompleted,
      commentsCount,
      projectsCount,
      totalTickets,
    ] = await Promise.all([
      prisma.ticket.count({ where: { createdById: userId } }),
      prisma.ticket.count({
        where: {
          assigneeId: userId,
          status: "DONE",
        },
      }),
      prisma.comment.count({ where: { userId } }),
      prisma.project.count({
        where: {
          OR: [{ createdById: userId }, { members: { some: { id: userId } } }],
        },
      }),
      prisma.ticket.count({
        where: { projectId: { in: projectIds } },
      }),
    ]);

    const completionRate =
      totalTickets > 0
        ? Math.round((ticketsCompleted / totalTickets) * 100)
        : 0;

    const recentActivity = await prisma.activity.findMany({
      where: { userId },
      include: {
        ticket: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    res.json({
      success: true,
      stats: {
        ticketsCreated,
        ticketsCompleted,
        comments: commentsCount,
        projects: projectsCount,
        completionRate,
        sprintHealth: 92,
        recentActivity: recentActivity.map((a) => ({
          action: a.action,
          ticketTitle: a.ticket?.title,
          projectName: a.project?.name,
          createdAt: a.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    next(error);
  }
};

// ==================== UPDATE USER PROFILE ====================
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email, bio } = req.body;

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
      },
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