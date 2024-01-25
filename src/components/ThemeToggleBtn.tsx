import { useTheme } from "next-themes";
import React from "react";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

function ThemeToggleBtn() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full"
      onClick={() => {
        if (theme === "dark") {
          setTheme("light");
        } else {
          setTheme("dark");
        }
      }}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] translate-x-2 scale-0 transition-all dark:scale-100" />
      <Moon className="h-[1.2rem] w-[1.2rem] -translate-x-2 scale-100 transition-all dark:scale-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default ThemeToggleBtn;
