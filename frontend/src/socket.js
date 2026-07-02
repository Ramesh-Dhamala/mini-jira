// frontend/src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;
let isConnected = false;

export const initializeSocket = (userId) => {
  // Don't re-initialize if already connected
  if (socket && isConnected) {
    // But make sure user is in their room
    if (userId) {
      socket.emit("user:join", userId);
    }
    return socket;
  }

  // Close existing socket if any
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  // Connection events
  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket.id);
    isConnected = true;

    // Join user's personal room
    if (userId) {
      socket.emit("user:join", userId);
      console.log("👤 User joined room:", userId);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected");
    isConnected = false;
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error);
    isConnected = false;
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
    if (userId) {
      socket.emit("user:join", userId);
    }
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn("⚠️ Socket not initialized. Call initializeSocket first.");
    return null;
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
    console.log("🔌 Socket manually disconnected");
  }
};

export const emitEvent = (event, data) => {
  const socket = getSocket();
  if (socket) {
    socket.emit(event, data);
  }
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  emitEvent,
};
