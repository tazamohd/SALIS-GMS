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
    <div className={cn("flex-1 p-4 sm:p-6 lg:p-8 bg-background min-h-screen", className)}>
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
  );
}
