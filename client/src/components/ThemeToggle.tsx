import { Moon, Sun, Monitor, Sparkles, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system" | "kingdom-future" | "neural-dark";

const THEME_CONFIG: Record<Theme, { label: string; icon: typeof Sun; description: string }> = {
  light: { label: "Light", icon: Sun, description: "Corporate Steel" },
  dark: { label: "Dark", icon: Moon, description: "Deep Space" },
  system: { label: "System", icon: Monitor, description: "Auto-detect" },
  "kingdom-future": { label: "Kingdom Future", icon: Sparkles, description: "Saudi Vision 2030" },
  "neural-dark": { label: "Neural Dark", icon: Cpu, description: "AI & Cyberpunk" },
};

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme") as Theme;
    return stored || "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "kingdom-future", "neural-dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else if (theme === "kingdom-future" || theme === "neural-dark") {
      root.classList.add(theme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const currentConfig = THEME_CONFIG[theme];
  const CurrentIcon = currentConfig.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          data-testid="button-theme-toggle"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 kingdom-future:-rotate-90 kingdom-future:scale-0 neural-dark:-rotate-90 neural-dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <Sparkles className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all kingdom-future:rotate-0 kingdom-future:scale-100" />
          <Cpu className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all neural-dark:rotate-0 neural-dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center gap-3"
          data-testid="menu-theme-light"
        >
          <Sun className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="font-medium">Light</span>
            <span className="text-xs text-muted-foreground">Corporate Steel</span>
          </div>
          {theme === "light" && <span className="ml-auto text-xs text-primary">Active</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center gap-3"
          data-testid="menu-theme-dark"
        >
          <Moon className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="font-medium">Dark</span>
            <span className="text-xs text-muted-foreground">Deep Space</span>
          </div>
          {theme === "dark" && <span className="ml-auto text-xs text-primary">Active</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center gap-3"
          data-testid="menu-theme-system"
        >
          <Monitor className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="font-medium">System</span>
            <span className="text-xs text-muted-foreground">Auto-detect preference</span>
          </div>
          {theme === "system" && <span className="ml-auto text-xs text-primary">Active</span>}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">Premium Themes</span>
        </div>
        
        <DropdownMenuItem
          onClick={() => setTheme("kingdom-future")}
          className="flex items-center gap-3"
          data-testid="menu-theme-kingdom-future"
        >
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <div className="flex flex-col">
            <span className="font-medium">Kingdom Future</span>
            <span className="text-xs text-muted-foreground">Saudi Vision 2030</span>
          </div>
          {theme === "kingdom-future" && <span className="ml-auto text-xs text-emerald-500">Active</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("neural-dark")}
          className="flex items-center gap-3"
          data-testid="menu-theme-neural-dark"
        >
          <Cpu className="h-4 w-4 text-purple-500" />
          <div className="flex flex-col">
            <span className="font-medium">Neural Dark</span>
            <span className="text-xs text-muted-foreground">AI & Cyberpunk</span>
          </div>
          {theme === "neural-dark" && <span className="ml-auto text-xs text-purple-500">Active</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
