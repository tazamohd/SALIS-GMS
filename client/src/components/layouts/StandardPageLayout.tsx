import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SkipLink } from "@/components/SkipLink";
import { cn } from "@/lib/utils";

interface PageAction {
  label: string | ReactNode;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "secondary" | "destructive";
  customRender?: ReactNode;
  testId?: string;
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
      {/* Brand Background - Clean Dark/Light Theme */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#0E1117]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#0A5ED7]/5 to-transparent dark:from-[#0BB3FF]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#0BB3FF]/5 to-transparent dark:from-[#0A5ED7]/5 rounded-full blur-3xl" />
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
