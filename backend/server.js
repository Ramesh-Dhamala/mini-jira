const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const prisma = require("./config/prisma");

const server = http.createServer(app);

// Socket.io setup with better configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Make io accessible globally
global.io = io;

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join user to their personal room for notifications
  socket.on("user:join", (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`👤 User ${userId} joined their room`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

// Graceful shutdown handling
const gracefulShutdown = async () => {
  console.log("🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("💀 Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Error handling for uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("🔥 Uncaught Exception:", error);
  gracefulShutdown();
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("⚠️ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown();
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
});

module.exports = { server, io };
