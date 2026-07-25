import type { UseQueryResult } from "@tanstack/react-query";
import { PageSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

interface QueryWrapperProps<T> {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Wrapper for React Query results that handles loading, error, and success states.
 *
 * Usage:
 * ```tsx
 * const query = useQuery({ queryKey: ["items"], queryFn: fetchItems });
 *
 * <QueryWrapper query={query}>
 *   {(data) => <ItemsList items={data} />}
 * </QueryWrapper>
 * ```
 */
export function QueryWrapper<T>({
  query,
  children,
  loadingFallback,
}: QueryWrapperProps<T>) {
  if (query.isLoading) {
    return <>{loadingFallback ?? <PageSkeleton />}</>;
  }

  if (query.isError) {
    const message =
      query.error instanceof Error
        ? query.error.message
        : "An unexpected error occurred";

    return (
      <div className="flex items-center justify-center min-h-[300px] p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">
                  Failed to load data
                </h3>
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => query.refetch()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (query.data === undefined || query.data === null) {
    return null;
  }

  return <>{children(query.data)}</>;
}

export default QueryWrapper;
