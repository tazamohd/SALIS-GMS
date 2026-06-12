import { ReactNode, useState, useEffect, useLayoutEffect, useRef } from "react";
import { LucideIcon, Database } from "lucide-react";
import { StandardPageLayout } from "./StandardPageLayout";
import { FilterBar, FilterConfig } from "@/components/FilterBar";
import { DataTable, Column } from "@/components/DataTable";

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
  
  // Filtering & Search - Controlled Mode
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: (Omit<FilterConfig, "value" | "onChange"> & { defaultValue?: string })[];
  filterValues?: Record<string, string>;
  onFilterChange?: (id: string, value: string) => void;
  onClearFilters?: () => void;
  
  // Pagination - Controlled Mode
  pagination?: {
    enabled: boolean;
    pageSize?: number;
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
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
  
  // Mode: "controlled" for server-side, "uncontrolled" for client-side filtering
  mode?: "controlled" | "uncontrolled";
}

export function StandardTablePage<T extends Record<string, any>>({
  title,
  description,
  icon,
  actions = [],
  data,
  isLoading = false,
  columns,
  searchValue: controlledSearchValue,
  onSearchChange: controlledSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  filterValues: controlledFilterValues,
  onFilterChange: controlledFilterChange,
  onClearFilters: controlledClearFilters,
  pagination = { enabled: true, pageSize: 10 },
  emptyState,
  onRowClick,
  stickyHeader = true,
  additionalContent,
  mode = "uncontrolled",
}: StandardTablePageProps<T>) {
  // Internal state for uncontrolled mode
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const [internalFilterValues, setInternalFilterValues] = useState<Record<string, string>>(
    Object.fromEntries(filters.map(f => [f.id, f.defaultValue || "all"]))
  );
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);

  // Track previous filter defaults to detect changes
  const prevDefaultsRef = useRef<Map<string, string>>(new Map());

  // Initialize ref with current defaults before effects run (useLayoutEffect runs synchronously)
  useLayoutEffect(() => {
    if (prevDefaultsRef.current.size === 0) {
      // First render - seed with current defaults
      prevDefaultsRef.current = new Map(
        filters.map(f => [f.id, f.defaultValue || "all"])
      );
    }
  }, []);

  // Reinitialize filter state when filter structure or defaults change (not on every render)
  useEffect(() => {
    if (mode === "controlled") {
      // Don't reinit in controlled mode - caller manages state
      return;
    }

    setInternalFilterValues(prev => {
      const result: Record<string, string> = {};
      
      filters.forEach(filter => {
        const newDefault = filter.defaultValue || "all";
        const prevDefault = prevDefaultsRef.current.get(filter.id);
        
        // If default changed, use new default
        if (prevDefault !== undefined && prevDefault !== newDefault) {
          result[filter.id] = newDefault;
        }
        // If filter already has a selection, preserve it
        else if (prev[filter.id] !== undefined) {
          result[filter.id] = prev[filter.id];
        }
        // New filter, use default
        else {
          result[filter.id] = newDefault;
        }
      });
      
      return result;
    });

    // Update ref with current defaults for next comparison
    prevDefaultsRef.current = new Map(
      filters.map(f => [f.id, f.defaultValue || "all"])
    );
  }, [filters, mode]);

  // Determine if search is controlled (both value AND handler provided)
  const isSearchControlled = mode === "controlled" && controlledSearchValue !== undefined && controlledSearchChange !== undefined;
  
  // Use controlled or internal state
  const searchValue = isSearchControlled ? controlledSearchValue : internalSearchValue;
  
  // For filters in controlled mode, merge provided values with defaults for missing keys
  const filterValues = mode === "controlled" 
    ? {
        ...Object.fromEntries(filters.map(f => [f.id, f.defaultValue || "all"])),
        ...(controlledFilterValues || {}),
      }
    : internalFilterValues;
    
  const currentPage = mode === "controlled" ? (pagination.currentPage || 1) : internalCurrentPage;

  // Handlers
  const handleSearchChange = (value: string) => {
    if (isSearchControlled) {
      controlledSearchChange(value);
    } else {
      setInternalSearchValue(value);
      if (mode === "uncontrolled") {
        setInternalCurrentPage(1);
      }
    }
  };

  const handleFilterChange = (id: string, value: string) => {
    if (mode === "controlled") {
      controlledFilterChange?.(id, value);
    } else {
      setInternalFilterValues((prev) => ({ ...prev, [id]: value }));
      setInternalCurrentPage(1);
    }
  };

  const handleClearFilters = () => {
    if (mode === "controlled") {
      controlledClearFilters?.();
    } else {
      setInternalSearchValue("");
      setInternalFilterValues(Object.fromEntries(filters.map(f => [f.id, f.defaultValue || "all"])));
      setInternalCurrentPage(1);
    }
  };

  const handlePageChange = (page: number) => {
    if (mode === "controlled") {
      pagination.onPageChange?.(page);
    } else {
      setInternalCurrentPage(page);
    }
  };

  // Client-side filtering (only in uncontrolled mode)
  const processedData = mode === "uncontrolled" ? data.filter((item) => {
    const matchesSearch =
      !searchValue ||
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchValue.toLowerCase())
      );

    const matchesFilters = filters.every((filter) => {
      const filterValue = filterValues[filter.id];
      if (!filterValue || filterValue === "all") return true;
      return item[filter.id] === filterValue;
    });

    return matchesSearch && matchesFilters;
  }) : data;

  // Build filter configs
  const filterConfigs: FilterConfig[] = filters.map((filter) => ({
    ...filter,
    value: filterValues[filter.id] || "all",
    onChange: (value: string) => handleFilterChange(filter.id, value),
  }));

  // Pagination
  const pageSize = pagination.pageSize || 10;
  const totalPages = mode === "controlled" 
    ? (pagination.totalPages || 1)
    : Math.ceil(processedData.length / pageSize);
  
  const paginatedData = (mode === "uncontrolled" && pagination.enabled)
    ? processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : processedData;

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
        onSearchChange={handleSearchChange}
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
          pagination.enabled && totalPages > 1 && (mode === "uncontrolled" || pagination.onPageChange)
            ? {
                currentPage,
                totalPages,
                onPageChange: handlePageChange,
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
