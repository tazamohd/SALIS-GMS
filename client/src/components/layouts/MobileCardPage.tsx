import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-card border-b px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">
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
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))
        ) : items.length === 0 ? (
          emptyState || (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No items found</p>
            </div>
          )
        ) : (
          items.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "interactive-card",
                item.onClick && "cursor-pointer active:scale-98"
              )}
              onClick={item.onClick}
              data-testid={`mobile-card-${item.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {item.icon && (
                    <div className="flex-shrink-0">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {item.title}
                      </h3>
                      {item.badge}
                    </div>
                    {item.subtitle && (
                      <p className="text-sm text-muted-foreground truncate">
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
