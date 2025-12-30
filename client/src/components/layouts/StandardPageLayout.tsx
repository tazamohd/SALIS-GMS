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
      {/* Brand Background Gradient - Purple/Pink Logo Colors */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50/40 to-fuchsia-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl motion-safe:animate-pulse motion-safe:[animation-duration:8s]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-200/30 dark:bg-pink-500/10 rounded-full blur-3xl motion-safe:animate-pulse motion-safe:[animation-duration:10s]"></div>
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
