import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Database, LucideIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyState?: {
    icon: LucideIcon;
    title: string;
    description: string;
    actions?: Array<{
      label: string;
      onClick: () => void;
      icon?: LucideIcon;
    }>;
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
  };
  onRowClick?: (item: T) => void;
  className?: string;
  stickyHeader?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyState,
  pagination,
  onRowClick,
  className,
  stickyHeader = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const compare = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortOrder === "asc" ? compare : -compare;
      })
    : data;

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)} data-testid="table-loading">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl bg-purple-100/50 dark:bg-white/5" />
        ))}
      </div>
    );
  }

  if (!isLoading && data.length === 0 && emptyState) {
    return <EmptyState {...emptyState} />;
  }

  const defaultEmptyState = {
    icon: Database,
    title: "No data found",
    description: "There are no records to display at the moment.",
  };

  if (!isLoading && data.length === 0) {
    return <EmptyState {...defaultEmptyState} />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Glassmorphism Table Container */}
      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur opacity-50"></div>
        <div className="relative backdrop-blur-xl bg-white/70 dark:bg-black/20 rounded-3xl border border-blue-200/50 dark:border-white/10 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table className={cn(stickyHeader && "table-sticky-header")}>
              <TableHeader>
                <TableRow className="border-b border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        "text-gray-600 dark:text-white/60 text-xs font-semibold uppercase tracking-wider py-4 px-6",
                        column.className,
                        column.sortable && "cursor-pointer hover:text-purple-600 dark:hover:text-purple-400"
                      )}
                      onClick={() => column.sortable && handleSort(column.key)}
                      data-testid={`table-header-${column.key}`}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {column.sortable && sortKey === column.key && (
                          <span className="text-purple-600 dark:text-purple-400" aria-label={`Sorted ${sortOrder}ending`}>
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className={cn(
                      "border-b border-gray-100 dark:border-white/5 hover:bg-purple-50/50 dark:hover:bg-white/5 transition-colors",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(item)}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        onRowClick(item);
                      }
                    }}
                    data-testid={`table-row-${rowIndex}`}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn("py-4 px-6 text-gray-800 dark:text-white/80", column.className)}
                        data-testid={`table-cell-${rowIndex}-${column.key}`}
                      >
                        {column.render
                          ? column.render(item)
                          : item[column.key]?.toString() || "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-200/50 dark:border-white/10 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-700 dark:text-white border-gray-200 dark:border-white/20 disabled:opacity-30"
                data-testid="pagination-previous"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Prev
              </Button>
              
              <div className="flex gap-2">
                {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      size="sm"
                      onClick={() => pagination.onPageChange(page)}
                      className={
                        page === pagination.currentPage
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
                          : "bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-700 dark:text-white border-gray-200 dark:border-white/20"
                      }
                      variant={page === pagination.currentPage ? "default" : "outline"}
                      data-testid={`pagination-page-${page}`}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-700 dark:text-white border-gray-200 dark:border-white/20 disabled:opacity-30"
                data-testid="pagination-next"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
