const { Prisma } = require("@prisma/client");

module.exports = (err, req, res, next) => {
  // Log error for debugging
  console.error("❌ Error:", err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === "P2002") {
      statusCode = 409;
      const field = err.meta?.target?.[0] || "field";
      message = `${field} already exists.`;
    }
    // Record not found
    else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found.";
    }
    // Foreign key constraint violation
    else if (err.code === "P2003") {
      statusCode = 409;
      message = "Cannot delete because it's referenced by other records.";
    }
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided.";
  }

  // Send response (hide details in production)
  const response = {
    success: false,
    message: message,
  };

  // Add errors if present
  if (errors) {
    response.errors = errors;
  }

  // Add stack trace in development only
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
