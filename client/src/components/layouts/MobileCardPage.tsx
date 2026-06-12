import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileCardItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  rightContent?: ReactNode;
}

interface MobileCardPageProps {
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
  items: MobileCardItem[];
  isLoading?: boolean;
  emptyState?: ReactNode;
  className?: string;
}

export function MobileCardPage({
  title,
  subtitle,
  headerActions,
  items,
  isLoading = false,
  emptyState,
  className,
}: MobileCardPageProps) {
  return (
    <div className={cn("flex flex-col min-h-screen relative overflow-hidden", className)}>
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-purple-50/50 to-blue-50 dark:from-black dark:via-purple-950/30 dark:to-black" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/40 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/40 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Mobile Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 dark:bg-black/30 border-b border-purple-200/50 dark:border-white/10 px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-purple-600/80 dark:text-purple-300/80 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="ml-4 flex-shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-50 animate-pulse" />
              <div className="relative backdrop-blur-xl bg-white/70 dark:bg-black/20 rounded-2xl p-4 border border-purple-200/50 dark:border-white/10">
                <div className="h-16 bg-purple-100/50 dark:bg-white/5 rounded-xl animate-pulse" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          emptyState || (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-500 dark:text-white/40">No items found</p>
            </div>
          )
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group relative",
                item.onClick && "cursor-pointer"
              )}
              onClick={item.onClick}
              data-testid={`mobile-card-${item.id}`}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-all duration-300" />
              <div className="relative backdrop-blur-xl bg-white/70 dark:bg-black/20 rounded-2xl p-4 border border-purple-200/50 dark:border-white/10 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] hover:-translate-y-0.5">
                <div className="flex items-center gap-4">
                  {item.icon && (
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
                        <item.icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                      {item.badge}
                    </div>
                    {item.subtitle && (
                      <p className="text-sm text-gray-600 dark:text-white/60 truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  
                  {item.rightContent && (
                    <div className="flex-shrink-0">
                      {item.rightContent}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
