import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { user, token } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(
      import.meta.env.VITE_API_URL || "http://localhost:5001",
      {
        auth: {
          token: token,
        },
      }
    );

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
      setActiveUsers([]);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    // User presence events
    newSocket.on("user-joined", (userData) => {
      setActiveUsers((prev) => {
        const existing = prev.find((u) => u.userId === userData.userId);
        if (!existing) {
          return [...prev, userData];
        }
        return prev;
      });

      // Add notification
      addNotification(`${userData.name} joined the board`, "info");
    });

    newSocket.on("user-left", (userData) => {
      setActiveUsers((prev) =>
        prev.filter((u) => u.userId !== userData.userId)
      );

      // Add notification
      addNotification(`${userData.name} left the board`, "info");
    });

    // Card events
    newSocket.on("card-created", (data) => {
      addNotification(`${data.createdBy.name} created a new card`, "success");
    });

    newSocket.on("card-updated", (data) => {
      addNotification(`${data.updatedBy.name} updated a card`, "info");
    });

    newSocket.on("card-deleted", (data) => {
      addNotification(`${data.deletedBy.name} deleted a card`, "warning");
    });

    newSocket.on("card-moved", (data) => {
      addNotification(`${data.movedBy.name} moved a card`, "info");
    });

    // List events
    newSocket.on("list-created", (data) => {
      addNotification(`${data.createdBy.name} created a new list`, "success");
    });

    newSocket.on("list-updated", (data) => {
      addNotification(`${data.updatedBy.name} updated a list`, "info");
    });

    newSocket.on("list-deleted", (data) => {
      addNotification(`${data.deletedBy.name} deleted a list`, "warning");
    });

    // Board events
    newSocket.on("board-updated", (data) => {
      addNotification(`${data.updatedBy.name} updated the board`, "info");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  const addNotification = (message, type = "info") => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 5000);
  };

  const joinBoard = (boardId) => {
    if (socket && isConnected) {
      socket.emit("join-board", boardId);
    }
  };

  const leaveBoard = (boardId) => {
    if (socket && isConnected) {
      socket.emit("leave-board", boardId);
    }
  };

  const emitCardCreated = (data) => {
    if (socket && isConnected) {
      socket.emit("card-created", data);
    }
  };

  const emitCardUpdated = (data) => {
    if (socket && isConnected) {
      socket.emit("card-updated", data);
    }
  };

  const emitCardDeleted = (data) => {
    if (socket && isConnected) {
      socket.emit("card-deleted", data);
    }
  };

  const emitCardMoved = (data) => {
    if (socket && isConnected) {
      socket.emit("card-moved", data);
    }
  };

  const emitListCreated = (data) => {
    if (socket && isConnected) {
      socket.emit("list-created", data);
    }
  };

  const emitListUpdated = (data) => {
    if (socket && isConnected) {
      socket.emit("list-updated", data);
    }
  };

  const emitListDeleted = (data) => {
    if (socket && isConnected) {
      socket.emit("list-deleted", data);
    }
  };

  const emitBoardUpdated = (data) => {
    if (socket && isConnected) {
      socket.emit("board-updated", data);
    }
  };

  const value = {
    socket,
    isConnected,
    activeUsers,
    notifications,
    joinBoard,
    leaveBoard,
    emitCardCreated,
    emitCardUpdated,
    emitCardDeleted,
    emitCardMoved,
    emitListCreated,
    emitListUpdated,
    emitListDeleted,
    emitBoardUpdated,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
