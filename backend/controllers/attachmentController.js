const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const path = require("path");
const fs = require("fs");

// ==================== UPLOAD ATTACHMENT ====================
exports.uploadAttachment = async (req, res, next) => {
  try {
    const { ticketId } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return next(new AppError("No file uploaded", 400));
    }

    // Check ticket access
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

    const attachment = await prisma.attachment.create({
      data: {
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        ticketId,
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Emit socket event
    if (global.io) {
      global.io.to(`ticket:${ticketId}`).emit("attachmentAdded", attachment);
    }

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      attachment,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET ATTACHMENTS BY TICKET ====================
exports.getAttachmentsByTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

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

    const attachments = await prisma.attachment.findMany({
      where: { ticketId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      attachments,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE ATTACHMENT ====================
exports.deleteAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const attachment = await prisma.attachment.findFirst({
      where: {
        id,
        OR: [
          { uploadedById: userId },
          { ticket: { project: { createdById: userId } } },
        ],
      },
    });

    if (!attachment) {
      return next(
        new AppError("Attachment not found or you don't have permission", 404),
      );
    }

    // Delete file from disk
    const filePath = path.join(
      __dirname,
      "../uploads",
      path.basename(attachment.fileUrl),
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.attachment.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Attachment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
