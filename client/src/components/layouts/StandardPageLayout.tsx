import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SkipLink } from "@/components/SkipLink";
import { cn } from "@/lib/utils";

interface PageAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "secondary" | "destructive";
}

interface StandardPageLayoutProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: PageAction[];
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function StandardPageLayout({
  title,
  description,
  icon,
  actions = [],
  children,
  className,
  contentClassName,
}: StandardPageLayoutProps) {
  return (
    <div className={cn("flex-1 min-h-screen relative overflow-hidden", className)}>
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-purple-50/50 to-blue-50 dark:from-black dark:via-purple-950/30 dark:to-black"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/40 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/40 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-200/30 dark:bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative p-4 sm:p-6 lg:p-8">
        <SkipLink />
        
        <PageHeader
          title={title}
          description={description}
          icon={icon}
          actions={actions}
        />
        
        <main id="main-content" className={cn("content-spacing", contentClassName)} tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
