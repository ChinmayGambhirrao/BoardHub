import React from "react";
import { useSocket } from "../contexts/SocketContext";

const UserPresence = () => {
  const { activeUsers, isConnected } = useSocket();

  if (!isConnected || activeUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400">Active users:</span>
        <div className="flex -space-x-2">
          {activeUsers.slice(0, 5).map((user, index) => (
            <div key={user.userId} className="relative" title={user.name}>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full border-2 border-gray-700"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-gray-700 flex items-center justify-center">
                  <span className="text-xs text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
            </div>
          ))}
        </div>
        {activeUsers.length > 5 && (
          <span className="text-xs text-gray-400 ml-1">
            +{activeUsers.length - 5} more
          </span>
        )}
      </div>
    </div>
  );
};

export default UserPresence;
