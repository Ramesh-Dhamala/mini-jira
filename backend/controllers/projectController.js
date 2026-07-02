const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if user has access to project
 */
const checkProjectAccess = async (projectId, userId) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ createdById: userId }, { members: { some: { id: userId } } }], // ✅ Fixed
    },
  });
  return project;
};

// ==================== PROJECT CONTROLLERS ====================

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, dueDate, status } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || name.trim().length < 3) {
      return next(
        new AppError("Project name must be at least 3 characters", 400),
      );
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || "ACTIVE",
        progress: 0,
        createdBy: {
          connect: { id: userId },
        },
        members: {
          // ✅ Fixed: 'members' not 'team'
          connect: { id: userId },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          // ✅ Fixed: 'members' not 'team'
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            tickets: true,
            sprints: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully! 🚀",
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all projects for current user
 * @route   GET /api/projects
 * @access  Private
 */
exports.getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, search } = req.query;

    // Build filter
    const where = {
      OR: [{ createdById: userId }, { members: { some: { id: userId } } }], // ✅ Fixed
    };

    // Add status filter
    if (status) {
      where.status = status;
    }

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          // ✅ Fixed: 'members' not 'team'
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            tickets: true,
            sprints: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
exports.getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check access
    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [{ createdById: userId }, { members: { some: { id: userId } } }], // ✅ Fixed
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          // ✅ Fixed: 'members' not 'team'
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        sprints: {
          include: {
            _count: {
              select: { tickets: true },
            },
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
        },
        _count: {
          select: {
            tickets: true,
            sprints: true,
          },
        },
      },
    });

    if (!project) {
      return next(
        new AppError("Project not found or you don't have access", 404),
      );
    }

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, dueDate, progress } = req.body;
    const userId = req.user.id;

    // Check if project exists and user has access
    const existingProject = await checkProjectAccess(id, userId);
    if (!existingProject) {
      return next(
        new AppError("Project not found or you don't have access", 404),
      );
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || "";
    if (status) updateData.status = status;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (progress !== undefined) updateData.progress = progress;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          // ✅ Fixed: 'members' not 'team'
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Project updated successfully! ✅",
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is project owner
    const project = await prisma.project.findFirst({
      where: {
        id,
        createdById: userId,
      },
    });

    if (!project) {
      return next(
        new AppError("Project not found or you are not the owner", 404),
      );
    }

    // Delete project (cascade will handle related records)
    await prisma.project.delete({
      where: { id },
    });

    // Emit socket event
    if (global.io) {
      global.io.emit("projectDeleted", { projectId: id });
    }

    res.json({
      success: true,
      message: `Project "${project.name}" deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add team member to project
 * @route   POST /api/projects/:id/members
 * @access  Private (Project Owner/Admin)
 */
exports.addTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user.id;

    // Check if user is project owner
    const project = await prisma.project.findFirst({
      where: {
        id,
        createdById: currentUserId,
      },
    });

    if (!project) {
      return next(
        new AppError("Project not found or you are not the owner", 404),
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Add user to members
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        members: {
          // ✅ Fixed: 'members' not 'team'
          connect: { id: userId },
        },
      },
      include: {
        members: {
          // ✅ Fixed: 'members' not 'team'
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: `User "${user.name}" added to project successfully! 👥`,
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get members for a project
 * @route   GET /api/projects/:id/members
 * @access  Private
 */
exports.getProjectMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [{ createdById: userId }, { members: { some: { id: userId } } }],
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!project) {
      return next(
        new AppError("Project not found or you don't have access", 404),
      );
    }

    res.json({
      success: true,
      members: project.members,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add team member to project
 * @route   POST /api/projects/:id/members
 * @access  Private (Project Owner/Admin)
 */
exports.addTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, email } = req.body;
    const currentUserId = req.user.id;

    // Check if user is project owner
    const project = await prisma.project.findFirst({
      where: {
        id,
        createdById: currentUserId,
      },
    });

    if (!project) {
      return next(
        new AppError("Project not found or you are not the owner", 404),
      );
    }

    // Determine member to add by email or id
    let user;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    }

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Prevent duplicate connection
    const alreadyMember = await prisma.project.findFirst({
      where: {
        id,
        members: { some: { id: user.id } },
      },
    });

    if (alreadyMember) {
      return next(
        new AppError("User is already a member of this project", 400),
      );
    }

    // Add user to members
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        members: {
          connect: { id: user.id },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: `User "${user.name}" added to project successfully! 👥`,
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove team member from project
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Private (Project Owner/Admin)
 */
exports.removeTeamMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const currentUserId = req.user.id;

    // Check if user is project owner
    const project = await prisma.project.findFirst({
      where: {
        id,
        createdById: currentUserId,
      },
    });

    if (!project) {
      return next(
        new AppError("Project not found or you are not the owner", 404),
      );
    }

    // Remove user from members
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        members: {
          // ✅ Fixed: 'members' not 'team'
          disconnect: { id: userId },
        },
      },
      include: {
        members: {
          // ✅ Fixed: 'members' not 'team'
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Team member removed successfully.",
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};
