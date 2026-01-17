import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getResolvedTheme(theme: Theme): string {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function applyTheme(theme: Theme) {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  const resolvedTheme = getResolvedTheme(theme);
  root.classList.add(resolvedTheme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme;
      return stored || "system";
    }
    return "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState<string>(() => getResolvedTheme(theme));

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    setResolvedTheme(getResolvedTheme(newTheme));
  };

  useEffect(() => {
    applyTheme(theme);
    setResolvedTheme(getResolvedTheme(theme));

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme(theme);
        setResolvedTheme(getResolvedTheme(theme));
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
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
