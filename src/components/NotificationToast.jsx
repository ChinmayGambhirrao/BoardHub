import React from "react";
import { useSocket } from "../contexts/SocketContext";
import { X } from "lucide-react";

const NotificationToast = () => {
  const { notifications } = useSocket();

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-600 border-green-500";
      case "warning":
        return "bg-yellow-600 border-yellow-500";
      case "error":
        return "bg-red-600 border-red-500";
      default:
        return "bg-blue-600 border-blue-500";
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationColor(
            notification.type
          )} text-white px-4 py-3 rounded-lg shadow-lg border max-w-sm animate-in slide-in-from-right duration-300`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg">
              {getNotificationIcon(notification.type)}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
              <p className="text-xs opacity-75 mt-1">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
