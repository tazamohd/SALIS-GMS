import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "kingdom-future" | "kingdom-future-light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: string;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(theme: Theme) {
  const root = window.document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.remove("light", "dark");
  root.classList.add(theme === "kingdom-future" ? "dark" : "light");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme;
      if (stored === "kingdom-future" || stored === "kingdom-future-light") {
        return stored;
      }
    }
    return "kingdom-future"; // Default to dark mode
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const isDark = theme === "kingdom-future";

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme: theme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
