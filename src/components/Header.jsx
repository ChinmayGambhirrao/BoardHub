// import useState from "react";
import { useNavigate } from "react-router-dom";
import { boardAPI } from "../api";

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
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";

const MENU_ITEMS = [
  { label: "Profile", key: "profile" },
  { label: "Settings", key: "settings" },
  { label: "Log out", key: "logout" },
];

export default function Header() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { user } = useAuth();
  const [boardName, setBoardName] = useState("");
  const navigate = useNavigate();

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
    <header className="bg-card text-card-foreground py-1 relative z-50 w-full border-b border-border transition-colors duration-300">
      <div className="flex items-center justify-between px-2 sm:px-4 flex-wrap w-full">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center min-w-0">
            <button className="p-2 hover:bg-accent rounded transition-colors duration-200">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-foreground"
                fill="currentColor"
              >
                <path d="M4 5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zm6 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V5zm6 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V5zM4 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2zm6 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2zm6 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2zM4 17a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2zm6 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2zm6 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2z" />
              </svg>
            </button>
            <Link to="/" className="flex items-center ml-2 min-w-0">
              <span className="font-bold text-lg truncate text-foreground">
                BoardHub
              </span>
            </Link>
          </div>
          {/* Nav links - hidden on mobile */}
          <div className="hidden sm:flex items-center space-x-2">
            <Button
              variant="ghost"
              className="text-foreground hover:bg-accent h-8 px-3 py-1 transition-colors duration-200"
            >
              Boards
            </Button>
            <Button
              variant="ghost"
              className="text-foreground hover:bg-accent h-8 px-3 py-1 transition-colors duration-200"
            >
              Templates
            </Button>
            <Button
              variant="ghost"
              className="text-foreground hover:bg-accent h-8 px-3 py-1 transition-colors duration-200"
            >
              Home
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          {/* Search bar - hidden on mobile, show icon only */}
          <div className="hidden sm:block relative min-w-0">
            <Input
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Search"
              className="bg-muted border-border h-8 w-64 text-sm pl-8 focus:bg-background focus:text-foreground min-w-0 transition-colors duration-200"
            />
            <Search className="absolute left-2 top-1.5 h-4 w-4 text-muted-foreground" />
          </div>
          <button
            className="sm:hidden p-2 hover:bg-accent rounded transition-colors duration-200"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-foreground" />
          </button>
          <Button
            variant="primary"
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-3 py-1 min-w-0 transition-colors duration-200"
            onClick={async () => {
              if (!boardName.trim()) return;
              try {
                const res = await boardAPI.createBoard({
                  title: boardName.trim(),
                });
                setBoardName(""); // Clear the input
                navigate(`/board/${res.data._id}`); // Use singular 'board' to match Dashboard
              } catch (error) {
                alert("Failed to create board");
              }
            }}
          >
            Create
          </Button>
          <Button
            variant="ghost"
            className="text-foreground hover:bg-accent p-1 h-8 w-8 min-w-0 transition-colors duration-200"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            className="text-foreground hover:bg-accent p-1 h-8 w-8 min-w-0 transition-colors duration-200"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full hover:bg-accent z-50 min-w-0 transition-colors duration-200"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-lg p-8 w-full max-w-xs shadow-lg relative border border-border transition-colors duration-300">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
              onClick={() => setShowProfileModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-foreground mb-4">Profile</h2>
            <div className="text-foreground mb-2">Name: {user?.name}</div>
            <div className="text-foreground mb-2">Email: {user?.email}</div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-lg p-8 w-full max-w-xs shadow-lg relative border border-border transition-colors duration-300">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
              onClick={() => setShowSettingsModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-foreground mb-4">Settings</h2>
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
