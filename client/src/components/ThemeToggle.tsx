import { Moon, Sun, Monitor, Sparkles, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type Theme } from "@/hooks/useTheme";

const THEME_CONFIG: Record<Theme, { label: string; icon: typeof Sun; description: string; color: string }> = {
  light: { label: "Light", icon: Sun, description: "Corporate Steel", color: "text-amber-500" },
  dark: { label: "Dark", icon: Moon, description: "Deep Space", color: "text-sky-400" },
  system: { label: "System", icon: Monitor, description: "Auto-detect", color: "text-gray-400" },
  "kingdom-future": { label: "Kingdom Future", icon: Sparkles, description: "Saudi Vision 2030", color: "text-emerald-500" },
  "neural-dark": { label: "Neural Dark", icon: Cpu, description: "AI & Cyberpunk", color: "text-purple-500" },
};

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const getIcon = () => {
    if (theme === "kingdom-future") return <Sparkles className="h-[1.2rem] w-[1.2rem] text-emerald-500" />;
    if (theme === "neural-dark") return <Cpu className="h-[1.2rem] w-[1.2rem] text-purple-500" />;
    if (resolvedTheme === "dark") return <Moon className="h-[1.2rem] w-[1.2rem]" />;
    return <Sun className="h-[1.2rem] w-[1.2rem]" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          data-testid="button-theme-toggle"
        >
          {getIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center gap-3"
          data-testid="menu-theme-light"
        >
          <Sun className="h-4 w-4 text-amber-500" />
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
          <Moon className="h-4 w-4 text-sky-400" />
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
          <Monitor className="h-4 w-4 text-gray-400" />
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
