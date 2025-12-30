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
              <div className="absolute inset-0 bg-purple-600 rounded-xl blur-md opacity-30 dark:opacity-40 motion-safe:animate-pulse motion-safe:[animation-duration:4s]"></div>
              <div className="relative p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
                <Icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-purple-600 rounded-xl blur-md opacity-30 dark:opacity-40 motion-safe:animate-pulse motion-safe:[animation-duration:4s]"></div>
              <div className="relative p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
                <Sparkles className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </div>
          )}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
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
                  "btn-touch focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 shadow-md transition-all duration-200",
                  action.variant === "outline" || action.variant === "secondary"
                    ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
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
