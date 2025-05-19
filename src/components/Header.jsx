import { Search, Bell, HelpCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { authAPI } from "../api";

const MENU_ITEMS = [
  { label: "Profile", key: "profile" },
  { label: "Settings", key: "settings" },
  { label: "Log out", key: "logout" },
];

export default function Header() {
  const [user, setUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authAPI.getCurrentUser();
        setUser(res.data);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Compute initials from name or email
  const getInitials = (user) => {
    if (!user) return "?";
    if (user.name) {
      const parts = user.name.trim().split(" ");
      return parts.length === 1
        ? parts[0][0].toUpperCase()
        : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (user.email) return user.email[0].toUpperCase();
    return "?";
  };

  const handleMenuClick = (key) => {
    if (key === "profile") setShowProfileModal(true);
    if (key === "settings") setShowSettingsModal(true);
    if (key === "logout") authAPI.logout().then(() => window.location.reload());
  };

  return (
    <header className="bg-[#1D2125] text-white py-1 relative z-50">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <button className="p-2 hover:bg-white/10 rounded">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-white"
                fill="currentColor"
              >
                <path d="M4 5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zm6 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V5zm6 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V5zM4 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2zm6 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2zm6 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2zM4 17a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2zm6 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2zm6 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2z" />
              </svg>
            </button>
            <Link to="/" className="flex items-center ml-2">
              <span className="font-bold text-lg">BoardHub</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 h-8 px-3 py-1"
            >
              Boards
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 h-8 px-3 py-1"
            >
              Templates
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 h-8 px-3 py-1"
            >
              Home
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              placeholder="Search"
              className="bg-white/10 border-none h-8 w-64 text-sm pl-8 focus:bg-white focus:text-black"
            />
            <Search className="absolute left-2 top-1.5 h-4 w-4 text-white" />
          </div>

          <Button
            variant="primary"
            className="bg-[#1976d2] hover:bg-[#1565c0] text-white h-8 px-3 py-1"
          >
            Create
          </Button>

          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 p-1 h-8 w-8"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 p-1 h-8 w-8"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full hover:bg-white/10 z-50"
              >
                <Avatar className="h-8 w-8 bg-orange-500">
                  <AvatarFallback>{getInitials(user)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "-"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {MENU_ITEMS.map((item) => (
                <DropdownMenuItem
                  key={item.key}
                  onClick={() => handleMenuClick(item.key)}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#22272b] rounded-lg p-8 w-full max-w-xs shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-white/70 hover:text-white"
              onClick={() => setShowProfileModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-4">Profile</h2>
            <div className="text-white mb-2">Name: {user?.name}</div>
            <div className="text-white mb-2">Email: {user?.email}</div>
            {/* Add more profile info or edit form here if needed */}
            <Button
              className="mt-4 w-full"
              onClick={() => setShowProfileModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#22272b] rounded-lg p-8 w-full max-w-xs shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-white/70 hover:text-white"
              onClick={() => setShowSettingsModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-4">Settings</h2>
            {/* Add settings form or content here */}
            <Button
              className="mt-4 w-full"
              onClick={() => setShowSettingsModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
