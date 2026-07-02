const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

// ==================== CREATE COMMENT ====================
exports.createComment = async (req, res, next) => {
  try {
    const { content, ticketId, parentId } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return next(new AppError("Comment content is required", 400));
    }

    // Check if ticket exists and user has access
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        project: {
          OR: [{ createdById: userId }, { members: { some: { id: userId } } }],
        },
      },
      include: {
        project: true,
        assignee: true,
      },
    });

    if (!ticket) {
      return next(
        new AppError("Ticket not found or you don't have access", 404),
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId,
        ticketId,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Create notification for ticket assignee/creator
    const { createNotification } = require("./notificationController");

    // Notify ticket assignee
    if (ticket.assigneeId && ticket.assigneeId !== userId) {
      await createNotification({
        userId: ticket.assigneeId,
        message: `${req.user.name} commented on ticket "${ticket.title}"`,
        type: "info",
        ticketId: ticket.id,
        projectId: ticket.projectId,
        link: `/tickets/${ticket.id}`,
      });
    }

    // Notify ticket creator if different
    if (
      ticket.createdById !== userId &&
      ticket.createdById !== ticket.assigneeId
    ) {
      await createNotification({
        userId: ticket.createdById,
        message: `${req.user.name} commented on ticket "${ticket.title}"`,
        type: "info",
        ticketId: ticket.id,
        projectId: ticket.projectId,
        link: `/tickets/${ticket.id}`,
      });
    }

    // Emit socket event
    if (global.io) {
      global.io.to(`ticket:${ticketId}`).emit("commentAdded", comment);
      global.io.to(`project:${ticket.projectId}`).emit("commentAdded", comment);
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET COMMENTS BY TICKET ====================
exports.getCommentsByTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check access
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

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          ticketId,
          parentId: null, // Get top-level comments only
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
          _count: {
            select: { replies: true },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.comment.count({
        where: {
          ticketId,
          parentId: null,
        },
      }),
    ]);

    res.json({
      success: true,
      comments,
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

// ==================== UPDATE COMMENT ====================
exports.updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return next(new AppError("Comment content is required", 400));
    }

    const comment = await prisma.comment.findFirst({
      where: {
        id,
        userId, // Only author can edit
      },
    });

    if (!comment) {
      return next(
        new AppError("Comment not found or you don't have permission", 404),
      );
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content: content.trim(),
        isEdited: true,
      },
      include: {
        user: {
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
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE COMMENT ====================
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await prisma.comment.findFirst({
      where: {
        id,
        OR: [
          { userId }, // Author can delete
          { ticket: { project: { createdById: userId } } }, // Project owner can delete
        ],
      },
    });

    if (!comment) {
      return next(
        new AppError("Comment not found or you don't have permission", 404),
      );
    }

    // Delete replies first
    await prisma.comment.deleteMany({
      where: { parentId: id },
    });

    await prisma.comment.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
