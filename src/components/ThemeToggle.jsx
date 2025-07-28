import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-8 w-8 rounded-full hover:bg-white/10 transition-all duration-300"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300" />
      ) : (
        <Moon className="h-4 w-4 rotate-0 scale-100 transition-all duration-300" />
      )}
    </Button>
  );
}
