import React from "react";
import { useSocket } from "../contexts/SocketContext";

const UserPresence = () => {
  const { activeUsers, isConnected } = useSocket();

  // Debug logging
  console.log("UserPresence - activeUsers:", activeUsers);
  console.log("UserPresence - isConnected:", isConnected);

  if (!isConnected) {
    return null;
  }

  // Show current user as well
  const allUsers = activeUsers.length > 0 ? activeUsers : [];

  return (
    <div className="relative">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700 min-w-[100px] max-w-[150px]">
        <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Online ({allUsers.length})
        </h3>
        {allUsers.length > 0 ? (
          <div className="flex space-x-1">
            {allUsers.slice(0, 3).map((user) => (
              <div key={user.userId} className="relative" title={user.name}>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border border-white dark:border-gray-700 flex items-center justify-center shadow-sm">
                  <span className="text-xs text-white font-semibold">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-gray-800 shadow-sm"></div>
              </div>
            ))}
            {allUsers.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold">
                  +{allUsers.length - 3}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No other users online
          </p>
        )}
      </div>
    </div>
  );
};

export default UserPresence;
