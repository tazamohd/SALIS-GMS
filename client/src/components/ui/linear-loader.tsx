import { cn } from "@/lib/utils";

interface LinearLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LinearLoader({ className, size = "md" }: LinearLoaderProps) {
  const sizeClasses = {
    sm: "h-0.5",
    md: "h-1",
    lg: "h-1.5",
  };

  return (
    <div
      className={cn(
        "w-full bg-muted overflow-hidden rounded-full",
        sizeClasses[size],
        className
      )}
      role="progressbar"
      aria-label="Loading"
    >
      <div
        className="h-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] animate-linear-progress"
        style={{
          width: "40%",
          animation: "linear-progress 1.5s ease-in-out infinite",
        }}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <LinearLoader className="w-48" size="md" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}
