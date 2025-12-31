import { cn } from "@/lib/utils";

type StatusVariant = "blue" | "orange" | "gray" | "navy";

interface StatusPillProps {
  children: React.ReactNode;
  variant?: StatusVariant;
  className?: string;
}

const variantClasses: Record<StatusVariant, string> = {
  blue: "bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0BB3FF]/15 dark:text-[#0BB3FF]",
  orange: "bg-[#F97316]/10 text-[#F97316]",
  gray: "bg-[#9BA4B0]/10 text-[#6B7280] dark:bg-[#9BA4B0]/15 dark:text-[#9BA4B0]",
  navy: "bg-[#0B1F3B]/10 text-[#0B1F3B] dark:bg-[#0B1F3B]/30 dark:text-[#E6EAF0]",
};

export function StatusPill({ children, variant = "blue", className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface StatusDotProps {
  status: "active" | "inactive" | "warning" | "pending";
  className?: string;
}

const dotColors: Record<string, string> = {
  active: "bg-[#0BB3FF]",
  inactive: "bg-[#9BA4B0]",
  warning: "bg-[#F97316]",
  pending: "bg-[#0A5ED7]",
};

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block w-2 h-2 rounded-full",
        dotColors[status],
        className
      )}
    />
  );
}
