import { LucideIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "secondary" | "destructive";
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: PageAction[];
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions = [],
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8 space-y-4", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon ? (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 dark:opacity-75 animate-pulse"></div>
              <div className="relative p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl shadow-purple-500/25">
                <Icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 dark:opacity-75 animate-pulse"></div>
              <div className="relative p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl shadow-purple-500/25">
                <Sparkles className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </div>
          )}
          <div>
            <h1 className="text-3xl md:text-4xl font-montserrat font-black bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-purple-600/80 dark:text-purple-300/80">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || "default"}
                className={cn(
                  "btn-touch focus-visible-ring shadow-lg transition-all duration-300",
                  action.variant === "outline" || action.variant === "secondary"
                    ? "bg-white/80 dark:bg-white/10 backdrop-blur-xl border-purple-200 dark:border-white/20 hover:bg-purple-50 dark:hover:bg-white/20 text-purple-700 dark:text-white"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/25"
                )}
                data-testid={`page-header-action-${index}`}
              >
                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {children}
    </div>
  );
}
