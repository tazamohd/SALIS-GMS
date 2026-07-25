import { LucideIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageAction {
  label: string | ReactNode;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "secondary" | "destructive";
  customRender?: ReactNode;
  testId?: string;
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
              <div className="absolute inset-0 bg-[#0A5ED7] rounded-xl blur-md opacity-20 dark:opacity-30"></div>
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] shadow-lg">
                <Icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-[#0A5ED7] rounded-xl blur-md opacity-20 dark:opacity-30"></div>
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] shadow-lg">
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
          <div className="flex flex-wrap gap-2 items-center">
            {actions.map((action, index) => (
              action.customRender ? (
                <div key={index} data-testid={action.testId || `page-header-action-${index}`}>
                  {action.customRender}
                </div>
              ) : (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || "default"}
                  className={cn(
                    "btn-touch focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A5ED7] focus-visible:ring-offset-2 shadow-md transition-all duration-200",
                    action.variant === "outline" || action.variant === "secondary"
                      ? "bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:bg-gray-50 dark:hover:bg-[#1a2030] text-[#0F172A] dark:text-[#E6EAF0]"
                      : "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C0] hover:to-[#0AA3EE] text-white"
                  )}
                  data-testid={action.testId || `page-header-action-${index}`}
                >
                  {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                  {action.label}
                </Button>
              )
            ))}
          </div>
        )}
      </div>
      
      {children}
    </div>
  );
}
