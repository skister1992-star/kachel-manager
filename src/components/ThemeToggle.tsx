import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
  const isDark = document.documentElement.classList.contains("dark");

  const toggle = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggle}>
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </Button>
  );
};

export default ThemeToggle;