import { useState, useCallback } from "react";
import type { Theme } from "@/types";

interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export function useTheme(initialTheme: Theme = "light"): UseThemeReturn {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);
  
  return {
    theme,
    toggleTheme,
    setTheme,
  };
}

export function useThemeSync(theme: Theme): void {
  useState(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  });
}
