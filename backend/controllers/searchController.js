const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

// ==================== SEARCH USERS ====================
exports.searchUsers = async (req, res, next) => {
  try {
    const { query, limit = 10, page = 1 } = req.query;
    const userId = req.user.id;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        users: [],
        message: "Search query must be at least 2 characters",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          AND: [
            { NOT: { id: userId } },
            {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { name: "asc" },
      }),
      prisma.user.count({
        where: {
          AND: [
            { NOT: { id: userId } },
            {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            },
          ],
        },
      }),
    ]);

    // Check follow status for each user
    const usersWithFollowStatus = await Promise.all(
      users.map(async (user) => {
        const follow = await prisma.follow.findFirst({
          where: {
            followerId: userId,
            followingId: user.id,
          },
        });
        return {
          ...user,
          followStatus: follow ? follow.status : null,
        };
      }),
    );

    res.json({
      success: true,
      users: usersWithFollowStatus,
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

// ==================== FOLLOW / UNFOLLOW ====================
exports.followUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already following
    const existing = await prisma.follow.findFirst({
      where: {
        followerId: currentUserId,
        followingId: userId,
      },
    });

    if (existing) {
      // If already following, unfollow (toggle)
      await prisma.follow.delete({
        where: { id: existing.id },
      });

      return res.json({
        success: true,
        message: "Unfollowed successfully",
        action: "unfollow",
      });
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: userId,
        status: "ACCEPTED", // Auto-accept for now (could be PENDING)
      },
    });

    // Create notification
    const { createNotification } = require("./notificationController");
    await createNotification({
      userId: userId,
      message: `${req.user.name} started following you`,
      type: "info",
      link: `/profile/${currentUserId}`,
    });

    res.json({
      success: true,
      message: "Followed successfully",
      action: "follow",
      follow,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET FOLLOWERS ====================
exports.getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const targetUserId = userId || currentUserId;

    const followers = await prisma.follow.findMany({
      where: {
        followingId: targetUserId,
        status: "ACCEPTED",
      },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    res.json({
      success: true,
      followers: followers.map((f) => f.follower),
      count: followers.length,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET FOLLOWING ====================
exports.getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const targetUserId = userId || currentUserId;

    const following = await prisma.follow.findMany({
      where: {
        followerId: targetUserId,
        status: "ACCEPTED",
      },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    res.json({
      success: true,
      following: following.map((f) => f.following),
      count: following.length,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== SEARCH TICKETS ====================
exports.searchTickets = async (req, res, next) => {
  try {
    const {
      query,
      status,
      priority,
      type,
      assigneeId,
      projectId,
      sprintId,
      limit = 20,
      page = 1,
    } = req.query;

    const userId = req.user.id;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      project: {
        OR: [{ createdById: userId }, { members: { some: { id: userId } } }],
      },
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (assigneeId) where.assigneeId = assigneeId;
    if (projectId) where.projectId = projectId;
    if (sprintId) where.sprintId = sprintId;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          assignee: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          project: {
            select: { id: true, name: true },
          },
          sprint: {
            select: { id: true, name: true },
          },
          _count: {
            select: { comments: true, attachments: true },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.ticket.count({ where }),
    ]);

    res.json({
      success: true,
      tickets,
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

// ==================== SEARCH PROJECTS ====================
exports.searchProjects = async (req, res, next) => {
  try {
    const { query, status, limit = 10, page = 1 } = req.query;
    const userId = req.user.id;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      OR: [{ createdById: userId }, { members: { some: { id: userId } } }],
    };

    if (query) {
      where.AND = [
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
      ];
    }
    if (status) where.status = status;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          members: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          _count: {
            select: { tickets: true, sprints: true },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      success: true,
      projects,
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
