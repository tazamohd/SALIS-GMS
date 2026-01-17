import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type Theme } from "@/hooks/useTheme";
import { useTranslation } from "react-i18next";

const THEME_CONFIG: Record<Theme, { labelKey: string; icon: typeof Sun; descKey: string; color: string }> = {
  light: { labelKey: "userSettings.themeLight", icon: Sun, descKey: "userSettings.themeLightDesc", color: "text-amber-500" },
  dark: { labelKey: "userSettings.themeDark", icon: Moon, descKey: "userSettings.themeDarkDesc", color: "text-emerald-400" },
  system: { labelKey: "userSettings.themeSystem", icon: Monitor, descKey: "userSettings.themeSystemDesc", color: "text-gray-400" },
};

export function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const getIcon = () => {
    if (resolvedTheme === "dark") return <Moon className="h-[1.2rem] w-[1.2rem] text-emerald-400" />;
    return <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500" />;
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
          <span className="sr-only">{t('userSettings.toggleTheme', 'Toggle theme')}</span>
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
            <span className="font-medium">{t('userSettings.themeLight', 'Light')}</span>
            <span className="text-xs text-muted-foreground">{t('userSettings.themeLightDesc', 'Light mode')}</span>
          </div>
          {theme === "light" && <span className="ml-auto text-xs text-primary">{t('common.active', 'Active')}</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center gap-3"
          data-testid="menu-theme-dark"
        >
          <Moon className="h-4 w-4 text-emerald-400" />
          <div className="flex flex-col">
            <span className="font-medium">{t('userSettings.themeDark', 'Dark')}</span>
            <span className="text-xs text-muted-foreground">{t('userSettings.themeDarkDesc', 'Dark mode')}</span>
          </div>
          {theme === "dark" && <span className="ml-auto text-xs text-primary">{t('common.active', 'Active')}</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center gap-3"
          data-testid="menu-theme-system"
        >
          <Monitor className="h-4 w-4 text-gray-400" />
          <div className="flex flex-col">
            <span className="font-medium">{t('userSettings.themeSystem', 'System')}</span>
            <span className="text-xs text-muted-foreground">{t('userSettings.themeSystemDesc', 'Auto-detect')}</span>
          </div>
          {theme === "system" && <span className="ml-auto text-xs text-primary">{t('common.active', 'Active')}</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
