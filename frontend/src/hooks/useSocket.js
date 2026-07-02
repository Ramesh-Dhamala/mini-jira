// frontend/src/hooks/useSocket.js
import { useEffect, useState, useCallback } from "react";
import { getSocket } from "../socket";

export const useSocket = (eventName, callback) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = getSocket();
    if (!socketInstance) {
      console.warn("⚠️ Socket not available for useSocket");
      return;
    }

    setSocket(socketInstance);
    setIsConnected(socketInstance.connected);

    const handleConnect = () => {
      setIsConnected(true);
      console.log("🔌 useSocket: Connected");
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log("🔌 useSocket: Disconnected");
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);

    // ✅ Set up event listener if eventName and callback provided
    if (eventName && callback) {
      console.log(`📡 Setting up socket listener for: ${eventName}`);
      socketInstance.on(eventName, callback);
    }

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      if (eventName && callback) {
        socketInstance.off(eventName, callback);
        console.log(`📡 Removed socket listener for: ${eventName}`);
      }
    };
  }, [eventName, callback]);

  const emit = useCallback(
    (event, data) => {
      if (socket && isConnected) {
        socket.emit(event, data);
        return true;
      }
      console.warn(`⚠️ Cannot emit ${event}: socket not connected`);
      return false;
    },
    [socket, isConnected],
  );

  return { isConnected, socket, emit };
};

export default useSocket;
