import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Database, LucideIcon } from "lucide-react";
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
          <Skeleton key={i} className="h-16 w-full" />
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
      <div className="table-responsive">
        <Table className={cn(stickyHeader && "table-sticky-header")}>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "text-high-contrast",
                    column.className,
                    column.sortable && "cursor-pointer hover:bg-accent/50"
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                  data-testid={`table-header-${column.key}`}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortKey === column.key && (
                      <span aria-label={`Sorted ${sortOrder}ending`}>
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
                  onRowClick && "interactive-hover cursor-pointer",
                  "focus-visible-ring"
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
                    className={column.className}
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

      {pagination && pagination.totalPages > 1 && (
        <Pagination data-testid="table-pagination">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                className={cn(
                  "btn-touch focus-visible-ring",
                  pagination.currentPage === 1 && "pointer-events-none opacity-50"
                )}
                data-testid="pagination-previous"
                aria-label="Go to previous page"
              />
            </PaginationItem>

            {[...Array(pagination.totalPages)].map((_, i) => {
              const page = i + 1;
              const isNearCurrent =
                Math.abs(page - pagination.currentPage) <= 1 ||
                page === 1 ||
                page === pagination.totalPages;

              if (!isNearCurrent) {
                if (page === 2 || page === pagination.totalPages - 1) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              }

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => pagination.onPageChange(page)}
                    isActive={page === pagination.currentPage}
                    className="btn-touch focus-visible-ring"
                    data-testid={`pagination-page-${page}`}
                    aria-label={`Go to page ${page}`}
                    aria-current={page === pagination.currentPage ? "page" : undefined}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                className={cn(
                  "btn-touch focus-visible-ring",
                  pagination.currentPage === pagination.totalPages &&
                    "pointer-events-none opacity-50"
                )}
                data-testid="pagination-next"
                aria-label="Go to next page"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
