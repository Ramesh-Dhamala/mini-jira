const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if ticket exists and user has access
 */
const getTicketWithAccess = async (ticketId, userId) => {
  return await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      project: {
        OR: [
          { createdById: userId },
          { members: { some: { id: userId } } }, // ✅ Fixed: 'members' not 'members'
        ],
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

// ==================== TICKET CONTROLLERS ====================

/**
 * @desc    Create a new ticket
 * @route   POST /api/tickets
 * @access  Private
 */
exports.createTicket = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      type,
      storyPoints,
      projectId,
      sprintId,
      assigneeId,
    } = req.body;

    const userId = req.user.id;

    // ✅ Log for debugging
    console.log("📝 Creating ticket:", { title, projectId, userId });

    // Validate required fields
    if (!title || title.trim().length < 3) {
      return next(
        new AppError("Ticket title must be at least 3 characters", 400),
      );
    }

    if (!projectId) {
      return next(new AppError("Project ID is required", 400));
    }

    // Check if project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { createdById: userId },
          { members: { some: { id: userId } } }, // ✅ Fixed: 'members' not 'members'
        ],
      },
    });

    if (!project) {
      return next(
        new AppError("Project not found or you don't have access", 404),
      );
    }

    // Check sprint if provided
    if (sprintId) {
      const sprint = await prisma.sprint.findFirst({
        where: {
          id: sprintId,
          projectId,
        },
      });

      if (!sprint) {
        return next(new AppError("Sprint not found in this project", 404));
      }
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        title: title.trim(),
        description: description?.trim() || "",
        status: status || "TODO",
        priority: priority || "MEDIUM",
        type: type || "TASK",
        storyPoints: storyPoints || 0,
        project: {
          connect: { id: projectId },
        },
        sprint: sprintId ? { connect: { id: sprintId } } : undefined,
        createdBy: {
          connect: { id: userId },
        },
        assignee: assigneeId ? { connect: { id: assigneeId } } : undefined,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        sprint: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Emit socket event
    if (global.io) {
      global.io.to(`project:${projectId}`).emit("ticketCreated", ticket);
    }

    res.status(201).json({
      success: true,
      message: "Ticket created successfully! 🎫",
      ticket,
    });
  } catch (error) {
    console.error("❌ Ticket creation error:", error);
    next(error);
  }
};

/**
 * @desc    Get tickets by project
 * @route   GET /api/tickets/project/:projectId
 * @access  Private
 */
// backend/controllers/ticketController.js
exports.getTicketsByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    
    console.log(`📋 Getting tickets for project: ${projectId}`);
    
    // Check project access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { createdById: userId },
          { members: { some: { id: userId } } }
        ]
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you don't have access"
      });
    }

    const tickets = await prisma.ticket.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        },
        sprint: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("❌ Error in getTicketsByProject:", error);
    next(error);
  }
};

/**
 * @desc    Get tickets by sprint
 * @route   GET /api/tickets/sprint/:sprintId
 * @access  Private
 */
exports.getTicketsBySprint = async (req, res, next) => {
  try {
    const { sprintId } = req.params;
    const userId = req.user.id;

    // Check if sprint exists and user has access
    const sprint = await prisma.sprint.findFirst({
      where: {
        id: sprintId,
        project: {
          OR: [
            { createdById: userId },
            { members: { some: { id: userId } } }, // ✅ Fixed: 'members' not 'members'
          ],
        },
      },
    });

    if (!sprint) {
      return next(
        new AppError("Sprint not found or you don't have access", 404),
      );
    }

    const tickets = await prisma.ticket.findMany({
      where: { sprintId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        priority: "asc",
      },
    });

    res.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search tickets
 * @route   GET /api/tickets/search
 * @access  Private
 */
exports.searchTickets = async (req, res, next) => {
  try {
    const { search, priority, status, type, projectId } = req.query;
    const userId = req.user.id;

    // Build where clause
    const where = {
      project: {
        OR: [
          { createdById: userId },
          { members: { some: { id: userId } } }, // ✅ Fixed: 'members' not 'members'
        ],
      },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (priority) where.priority = priority;
    if (status) where.status = status;
    if (type) where.type = type;
    if (projectId) where.projectId = projectId;

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        sprint: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single ticket
 * @route   GET /api/tickets/:id
 * @access  Private
 */
exports.getTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        project: {
          OR: [
            { createdById: userId },
            { members: { some: { id: userId } } }, // ✅ Fixed: 'members' not 'members'
          ],
        },
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        sprint: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            user: {
              // ✅ Changed from 'author' to 'user'
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        attachments: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    });

    if (!ticket) {
      return next(
        new AppError("Ticket not found or you don't have access", 404),
      );
    }

    res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update ticket
 * @route   PUT /api/tickets/:id
 * @access  Private
 */
exports.updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      type,
      storyPoints,
      assigneeId,
      sprintId,
    } = req.body;
    const userId = req.user.id;

    // Check access
    const existingTicket = await getTicketWithAccess(id, userId);
    if (!existingTicket) {
      return next(
        new AppError("Ticket not found or you don't have access", 404),
      );
    }

    // Prepare update data
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || "";
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (type) updateData.type = type;
    if (storyPoints !== undefined) updateData.storyPoints = storyPoints;
    if (assigneeId) updateData.assignee = { connect: { id: assigneeId } };
    if (sprintId) updateData.sprint = { connect: { id: sprintId } };

    const ticket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        sprint: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Emit socket event
    if (global.io) {
      global.io.to(`project:${ticket.projectId}`).emit("ticketUpdated", ticket);
    }

    res.json({
      success: true,
      message: "Ticket updated successfully! ✅",
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Move ticket to different status (Kanban)
 * @route   PUT /api/tickets/:id/status
 * @access  Private
 */
exports.moveTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validate status - Added REVIEW
    const validStatuses = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
    if (!status || !validStatuses.includes(status)) {
      return next(
        new AppError(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          400,
        ),
      );
    }

    // Check access
    const existingTicket = await getTicketWithAccess(id, userId);
    if (!existingTicket) {
      return next(
        new AppError("Ticket not found or you don't have access", 404),
      );
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Emit socket event
    if (global.io) {
      global.io.to(`project:${ticket.projectId}`).emit("ticketMoved", ticket);
    }

    res.json({
      success: true,
      message: `Ticket moved to ${status} ✅`,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete ticket
 * @route   DELETE /api/tickets/:id
 * @access  Private
 */
exports.deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is ticket creator or project owner
    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        OR: [{ createdById: userId }, { project: { createdById: userId } }],
      },
    });

    if (!ticket) {
      return next(
        new AppError(
          "Ticket not found or you don't have permission to delete",
          404,
        ),
      );
    }

    await prisma.ticket.delete({
      where: { id },
    });

    // Emit socket event
    if (global.io) {
      global.io
        .to(`project:${ticket.projectId}`)
        .emit("ticketDeleted", { ticketId: id });
    }

    res.json({
      success: true,
      message: `Ticket "${ticket.title}" deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ticket statistics by project
 * @route   GET /api/tickets/stats/:projectId
 * @access  Private
 */
exports.getTicketStats = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check project access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { createdById: userId },
          { members: { some: { id: userId } } }, // ✅ Fixed: 'members' not 'members'
        ],
      },
    });

    if (!project) {
      return next(
        new AppError("Project not found or you don't have access", 404),
      );
    }

    const stats = await prisma.$transaction([
      prisma.ticket.count({ where: { projectId, status: "TODO" } }),
      prisma.ticket.count({ where: { projectId, status: "IN_PROGRESS" } }),
      prisma.ticket.count({ where: { projectId, status: "REVIEW" } }),
      prisma.ticket.count({ where: { projectId, status: "DONE" } }),
      prisma.ticket.count({ where: { projectId, priority: "HIGH" } }),
      prisma.ticket.count({ where: { projectId, priority: "CRITICAL" } }),
      prisma.ticket.aggregate({
        where: { projectId },
        _sum: { storyPoints: true },
      }),
    ]);

    const [todo, inProgress, review, done, high, critical, totalPoints] = stats;

    res.json({
      success: true,
      stats: {
        total: todo + inProgress + review + done,
        todo,
        inProgress,
        review,
        done,
        highPriority: high,
        critical: critical,
        totalStoryPoints: totalPoints._sum.storyPoints || 0,
        completionRate:
          todo + inProgress + review + done > 0
            ? Math.round((done / (todo + inProgress + review + done)) * 100)
            : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

