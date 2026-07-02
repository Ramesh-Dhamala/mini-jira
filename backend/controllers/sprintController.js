const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if sprint exists and user has access
 */
const getSprintWithAccess = async (sprintId, userId) => {
  return await prisma.sprint.findFirst({
    where: {
      id: sprintId,
      project: {
        OR: [
          { createdById: userId },
          { members: { some: { id: userId } } }, // ✅ Fixed: 'members' not 'team'
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

/**
 * Validate sprint dates
 */
const validateSprintDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new AppError("Start date must be before end date", 400);
  }

  return { start, end };
};

// ==================== SPRINT CONTROLLERS ====================

/**
 * @desc    Create a new sprint
 * @route   POST /api/sprints
 * @access  Private
 */

exports.createSprint = async (req, res, next) => {
  try {
    const { name, goal, startDate, endDate, projectId } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || name.trim().length < 3) {
      return next(
        new AppError("Sprint name must be at least 3 characters", 400),
      );
    }

    if (!projectId) {
      return next(new AppError("Project ID is required", 400));
    }

    // Validate dates
    const { start, end } = validateSprintDates(startDate, endDate);

    // Check if project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { createdById: userId },
          { members: { some: { id: userId } } }, // ✅ Fixed: 'members' not 'team'
        ],
      },
    });

    if (!project) {
      return next(
        new AppError("Project not found or you don't have access", 404),
      );
    }

    // Check for overlapping sprints
    const overlappingSprint = await prisma.sprint.findFirst({
      where: {
        projectId,
        OR: [
          {
            AND: [{ startDate: { lte: end } }, { endDate: { gte: start } }],
          },
        ],
      },
    });

    if (overlappingSprint) {
      return next(
        new AppError("Sprint dates overlap with existing sprint", 409),
      );
    }

    // Create sprint
    const sprint = await prisma.sprint.create({
      data: {
        name: name.trim(),
        goal: goal?.trim() || "",
        startDate: start,
        endDate: end,
        status: "PLANNING",
        project: {
          connect: { id: projectId },
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    // Emit socket event
    if (global.io) {
      global.io.to(`project:${projectId}`).emit("sprintCreated", sprint);
    }

    res.status(201).json({
      success: true,
      message: "Sprint created successfully! 🏃",
      sprint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all sprints for a project
 * @route   GET /api/sprints/project/:projectId
 * @access  Private
 */
exports.getSprintsByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { status } = req.query;

    // Check project access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { createdById: userId },
          { members: { some: { id: userId } } }, // ✅ Fixed: 'members' not 'team'
        ],
      },
    });

    if (!project) {
      return next(
        new AppError("Project not found or you don't have access", 404),
      );
    }

    // Build filter
    const where = { projectId };
    if (status) where.status = status;

    const sprints = await prisma.sprint.findMany({
      where,
      include: {
        _count: {
          select: {
            tickets: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    res.json({
      success: true,
      count: sprints.length,
      sprints,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single sprint by ID
 * @route   GET /api/sprints/:id
 * @access  Private
 */
exports.getSprint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sprint = await prisma.sprint.findFirst({
      where: {
        id,
        project: {
          OR: [
            { createdById: userId },
            { members: { some: { id: userId } } }, // ✅ Fixed: 'members' not 'team'
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
        tickets: {
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
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    if (!sprint) {
      return next(
        new AppError("Sprint not found or you don't have access", 404),
      );
    }

    // Calculate sprint stats
    const totalTickets = sprint.tickets.length;
    const completedTickets = sprint.tickets.filter(
      (t) => t.status === "DONE",
    ).length;
    const totalPoints = sprint.tickets.reduce(
      (sum, t) => sum + (t.storyPoints || 0),
      0,
    );
    const completedPoints = sprint.tickets
      .filter((t) => t.status === "DONE")
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    res.json({
      success: true,
      sprint: {
        ...sprint,
        stats: {
          totalTickets,
          completedTickets,
          completionRate:
            totalTickets > 0
              ? Math.round((completedTickets / totalTickets) * 100)
              : 0,
          totalPoints,
          completedPoints,
          pointsCompletionRate:
            totalPoints > 0
              ? Math.round((completedPoints / totalPoints) * 100)
              : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update sprint details
 * @route   PUT /api/sprints/:id
 * @access  Private
 */
exports.updateSprint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, goal, startDate, endDate, status } = req.body;
    const userId = req.user.id;

    // Check access
    const existingSprint = await getSprintWithAccess(id, userId);
    if (!existingSprint) {
      return next(
        new AppError("Sprint not found or you don't have access", 404),
      );
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (goal !== undefined) updateData.goal = goal?.trim() || "";
    if (status) updateData.status = status;

    // Validate and add dates if provided
    if (startDate && endDate) {
      const { start, end } = validateSprintDates(startDate, endDate);

      // Check for overlapping sprints (excluding current)
      const overlappingSprint = await prisma.sprint.findFirst({
        where: {
          projectId: existingSprint.projectId,
          id: { not: id },
          OR: [
            {
              AND: [{ startDate: { lte: end } }, { endDate: { gte: start } }],
            },
          ],
        },
      });

      if (overlappingSprint) {
        return next(
          new AppError("Sprint dates overlap with existing sprint", 409),
        );
      }

      updateData.startDate = start;
      updateData.endDate = end;
    }

    const sprint = await prisma.sprint.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    // Emit socket event
    if (global.io) {
      global.io.to(`project:${sprint.projectId}`).emit("sprintUpdated", sprint);
    }

    res.json({
      success: true,
      message: "Sprint updated successfully! ✅",
      sprint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update sprint status
 * @route   PUT /api/sprints/:id/status
 * @access  Private
 */
exports.updateSprintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validate status
    const validStatuses = ["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return next(
        new AppError(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          400,
        ),
      );
    }

    // Check access
    const existingSprint = await getSprintWithAccess(id, userId);
    if (!existingSprint) {
      return next(
        new AppError("Sprint not found or you don't have access", 404),
      );
    }

    // If completing sprint, check if all tickets are done
    if (status === "COMPLETED") {
      const incompleteTickets = await prisma.ticket.count({
        where: {
          sprintId: id,
          status: { not: "DONE" },
        },
      });

      if (incompleteTickets > 0) {
        return next(
          new AppError(
            `Cannot complete sprint. ${incompleteTickets} ticket(s) are not completed.`,
            400,
          ),
        );
      }
    }

    const sprint = await prisma.sprint.update({
      where: { id },
      data: { status },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    // Emit socket event
    if (global.io) {
      global.io
        .to(`project:${sprint.projectId}`)
        .emit("sprintStatusUpdated", sprint);
    }

    res.json({
      success: true,
      message: `Sprint status updated to ${status} ✅`,
      sprint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete sprint
 * @route   DELETE /api/sprints/:id
 * @access  Private
 */
exports.deleteSprint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user has permission (project owner or admin)
    const sprint = await prisma.sprint.findFirst({
      where: {
        id,
        project: {
          OR: [
            { createdById: userId },
            { members: { some: { id: userId, role: "ADMIN" } } }, // ✅ Fixed: 'members' not 'team'
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

    if (!sprint) {
      return next(
        new AppError("Sprint not found or you don't have permission", 404),
      );
    }

    // Check if sprint has tickets
    const ticketCount = await prisma.ticket.count({
      where: { sprintId: id },
    });

    if (ticketCount > 0) {
      // Move tickets to backlog (remove sprint association)
      await prisma.ticket.updateMany({
        where: { sprintId: id },
        data: { sprintId: null },
      });
    }

    // Delete sprint
    await prisma.sprint.delete({
      where: { id },
    });

    // Emit socket event
    if (global.io) {
      global.io
        .to(`project:${sprint.projectId}`)
        .emit("sprintDeleted", { sprintId: id });
    }

    res.json({
      success: true,
      message: `Sprint "${sprint.name}" deleted successfully. ${ticketCount > 0 ? `${ticketCount} tickets moved to backlog.` : ""}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active sprint for project
 * @route   GET /api/sprints/active/:projectId
 * @access  Private
 */
exports.getActiveSprint = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check project access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { createdById: userId },
          { members: { some: { id: userId } } }, // ✅ Fixed: 'members' not 'team'
        ],
      },
    });

    if (!project) {
      return next(
        new AppError("Project not found or you don't have access", 404),
      );
    }

    const sprint = await prisma.sprint.findFirst({
      where: {
        projectId,
        status: "ACTIVE",
      },
      include: {
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    if (!sprint) {
      return res.json({
        success: true,
        sprint: null,
        message: "No active sprint found",
      });
    }

    res.json({
      success: true,
      sprint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get sprint report/analytics
 * @route   GET /api/sprints/:id/report
 * @access  Private
 */
exports.getSprintReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sprint = await prisma.sprint.findFirst({
      where: {
        id,
        project: {
          OR: [
            { createdById: userId },
            { members: { some: { id: userId } } }
          ]
        }
      },
      include: {
        tickets: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    if (!sprint) {
      return next(new AppError("Sprint not found or you don't have access", 404));
    }

    // Generate report
    const totalTickets = sprint.tickets.length;
    const completedTickets = sprint.tickets.filter(t => t.status === "DONE");
    const inProgressTickets = sprint.tickets.filter(t => t.status === "IN_PROGRESS");
    const todoTickets = sprint.tickets.filter(t => t.status === "TODO");

    // Points breakdown
    const totalPoints = sprint.tickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedPoints = completedTickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    // Priority breakdown
    const priorityBreakdown = {
      CRITICAL: sprint.tickets.filter(t => t.priority === "CRITICAL").length,
      HIGH: sprint.tickets.filter(t => t.priority === "HIGH").length,
      MEDIUM: sprint.tickets.filter(t => t.priority === "MEDIUM").length,
      LOW: sprint.tickets.filter(t => t.priority === "LOW").length,
    };

    // Assignee breakdown
    const assigneeBreakdown = {};
    sprint.tickets.forEach(ticket => {
      if (ticket.assigneeId) {
        const name = ticket.assignee?.name || "Unassigned";
        assigneeBreakdown[name] = (assigneeBreakdown[name] || 0) + 1;
      }
    });

    // Type breakdown
    const typeBreakdown = {
      TASK: sprint.tickets.filter(t => t.type === "TASK").length,
      BUG: sprint.tickets.filter(t => t.type === "BUG").length,
      STORY: sprint.tickets.filter(t => t.type === "STORY").length,
      EPIC: sprint.tickets.filter(t => t.type === "EPIC").length,
    };

    res.json({
      success: true,
      report: {
        sprint: {
          id: sprint.id,
          name: sprint.name,
          status: sprint.status,
          startDate: sprint.startDate,
          endDate: sprint.endDate,
          projectId: sprint.projectId,
        },
        summary: {
          totalTickets,
          completedTickets: completedTickets.length,
          inProgressTickets: inProgressTickets.length,
          todoTickets: todoTickets.length,
          completionRate: totalTickets > 0 ? Math.round((completedTickets.length / totalTickets) * 100) : 0,
          totalPoints,
          completedPoints,
          pointsCompletionRate: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0,
        },
        breakdown: {
          priority: priorityBreakdown,
          assignee: assigneeBreakdown,
          type: typeBreakdown,
        },
      }
    });
  } catch (error) {
    next(error);
  }
};
