const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard
 * @access  Private
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user's projects
    const userProjects = await prisma.project.findMany({
      where: {
        OR: [
          { createdById: userId },
          { members: { some: { id: userId } } }
        ]
      },
      select: { id: true }
    });

    const projectIds = userProjects.map(p => p.id);

    // If no projects, return empty stats
    if (projectIds.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalProjects: 0,
          totalTickets: 0,
          assignedTickets: 0,
          completedTickets: 0,
          pendingTickets: 0,
          completionRate: 0,
          ticketsByPriority: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
          ticketsByStatus: { TODO: 0, IN_PROGRESS: 0, DONE: 0 },
          recentActivity: [],
          sprintHealth: null,
        }
      });
    }

    // Get all stats in parallel
    const [
      totalProjects,
      totalTickets,
      assignedTickets,
      completedTickets,
      pendingTickets,
      criticalTickets,
      highTickets,
      mediumTickets,
      lowTickets,
      todoTickets,
      inProgressTickets,
      doneTickets,
    ] = await Promise.all([
      prisma.project.count({ where: { id: { in: projectIds } } }),
      prisma.ticket.count({ where: { projectId: { in: projectIds } } }),
      prisma.ticket.count({
        where: {
          projectId: { in: projectIds },
          assigneeId: userId,
        }
      }),
      prisma.ticket.count({
        where: {
          projectId: { in: projectIds },
          status: "DONE",
        }
      }),
      prisma.ticket.count({
        where: {
          projectId: { in: projectIds },
          status: { not: "DONE" },
        }
      }),
      prisma.ticket.count({
        where: {
          projectId: { in: projectIds },
          priority: "CRITICAL",
        }
      }),
      prisma.ticket.count({
        where: {
          projectId: { in: projectIds },
          priority: "HIGH",
        }
      }),
      prisma.ticket.count({
        where: {
          projectId: { in: projectIds },
          priority: "MEDIUM",
        }
      }),
      prisma.ticket.count({
        where: {
          projectId: { in: projectIds },
          priority: "LOW",
        }
      }),
      prisma.ticket.count({
        where: {
          projectId: { in: projectIds },
          status: "TODO",
        }
      }),
      prisma.ticket.count({
        where: {
          projectId: { in: projectIds },
          status: "IN_PROGRESS",
        }
      }),
      prisma.ticket.count({
        where: {
          projectId: { in: projectIds },
          status: "DONE",
        }
      }),
    ]);

    const totalTicketsCount = totalTickets || 0;
    const completedTicketsCount = completedTickets || 0;
    const completionRate = totalTicketsCount > 0 
      ? Math.round((completedTicketsCount / totalTicketsCount) * 100) 
      : 0;

    res.json({
      success: true,
      stats: {
        totalProjects,
        totalTickets: totalTicketsCount,
        assignedTickets,
        completedTickets: completedTicketsCount,
        pendingTickets,
        completionRate,
        ticketsByPriority: {
          CRITICAL: criticalTickets,
          HIGH: highTickets,
          MEDIUM: mediumTickets,
          LOW: lowTickets,
        },
        ticketsByStatus: {
          TODO: todoTickets,
          IN_PROGRESS: inProgressTickets,
          DONE: doneTickets,
        },
        recentActivity: [],
        sprintHealth: null,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get quick dashboard stats
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
exports.getQuickStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userProjects = await prisma.project.findMany({
      where: {
        OR: [
          { createdById: userId },
          { members: { some: { id: userId } } }
        ]
      },
      select: { id: true }
    });

    const projectIds = userProjects.map(p => p.id);

    if (projectIds.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalProjects: 0,
          openTickets: 0,
          completedTickets: 0,
          activeSprints: 0,
          completionRate: 0,
        }
      });
    }

    const [totalProjects, openTickets, completedTickets, activeSprints] = await Promise.all([
      prisma.project.count({ where: { id: { in: projectIds } } }),
      prisma.ticket.count({
        where: {
          projectId: { in: projectIds },
          status: { not: "DONE" }
        }
      }),
      prisma.ticket.count({
        where: {
          projectId: { in: projectIds },
          status: "DONE"
        }
      }),
      prisma.sprint.count({
        where: {
          projectId: { in: projectIds },
          status: "ACTIVE"
        }
      }),
    ]);

    const total = openTickets + completedTickets;
    const completionRate = total > 0 ? Math.round((completedTickets / total) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalProjects,
        openTickets,
        completedTickets,
        activeSprints,
        completionRate,
      }
    });
  } catch (error) {
    next(error);
  }
};