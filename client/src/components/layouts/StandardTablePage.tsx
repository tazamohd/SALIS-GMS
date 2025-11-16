import { ReactNode, useState } from "react";
import { LucideIcon, Plus, Database } from "lucide-react";
import { StandardPageLayout } from "./StandardPageLayout";
import { FilterBar, FilterConfig } from "@/components/FilterBar";
import { DataTable, Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";

interface PageAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "secondary" | "destructive";
}

interface StandardTablePageProps<T> {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: PageAction[];
  
  // Data
  data: T[];
  isLoading?: boolean;
  columns: Column<T>[];
  
  // Filtering & Search
  searchPlaceholder?: string;
  filters?: Omit<FilterConfig, "value" | "onChange">[];
  
  // Pagination
  pagination?: {
    enabled: boolean;
    pageSize?: number;
  };
  
  // Empty State
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
  
  // Table interaction
  onRowClick?: (item: T) => void;
  stickyHeader?: boolean;
  
  // Additional content
  additionalContent?: ReactNode;
}

export function StandardTablePage<T extends Record<string, any>>({
  title,
  description,
  icon,
  actions = [],
  data,
  isLoading = false,
  columns,
  searchPlaceholder = "Search...",
  filters = [],
  pagination = { enabled: true, pageSize: 10 },
  emptyState,
  onRowClick,
  stickyHeader = true,
  additionalContent,
}: StandardTablePageProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    Object.fromEntries(filters.map(f => [f.id, "all"]))
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Apply search and filters
  const filteredData = data.filter((item) => {
    // Search across all string fields
    const matchesSearch =
      !searchValue ||
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchValue.toLowerCase())
      );

    // Apply each filter
    const matchesFilters = filters.every((filter) => {
      const filterValue = filterValues[filter.id];
      if (!filterValue || filterValue === "all") return true;
      return item[filter.id] === filterValue;
    });

    return matchesSearch && matchesFilters;
  });

  // Handle filter changes
  const handleFilterChange = (id: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [id]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setFilterValues(Object.fromEntries(filters.map(f => [f.id, "all"])));
    setCurrentPage(1);
  };

  // Build filter configs with state
  const filterConfigs: FilterConfig[] = filters.map((filter) => ({
    ...filter,
    value: filterValues[filter.id],
    onChange: (value: string) => handleFilterChange(filter.id, value),
  }));

  // Pagination
  const pageSize = pagination.pageSize || 10;
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = pagination.enabled
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData;

  const defaultEmptyState = {
    icon: Database,
    title: "No records found",
    description: "There are no records to display at the moment.",
  };

  return (
    <StandardPageLayout
      title={title}
      description={description}
      icon={icon}
      actions={actions}
    >
      {additionalContent}
      
      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={searchPlaceholder}
        filters={filterConfigs}
        onClearFilters={handleClearFilters}
      />

      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        emptyState={emptyState || defaultEmptyState}
        pagination={
          pagination.enabled && totalPages > 1
            ? {
                currentPage,
                totalPages,
                onPageChange: setCurrentPage,
                pageSize,
              }
            : undefined
        }
        onRowClick={onRowClick}
        stickyHeader={stickyHeader}
        className="mt-6"
      />
    </StandardPageLayout>
  );
}
