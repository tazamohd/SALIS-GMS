import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onClearFilters?: () => void;
  showClearButton?: boolean;
  className?: string;
}

export function FilterBar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onClearFilters,
  showClearButton = true,
  className,
}: FilterBarProps) {
  const hasActiveFilters =
    searchValue ||
    filters.some((f) => f.value && f.value !== "all" && f.value !== "");

  return (
    <div className={cn("", className)} data-testid="filter-bar">
      <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] rounded-2xl shadow-sm">
        {onSearchChange && (
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#0A5ED7] dark:text-[#0BB3FF]"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] focus:ring-[#0A5ED7] focus:border-[#0A5ED7]"
              data-testid="filter-search-input"
              aria-label="Search"
            />
          </div>
        )}

        {filters.map((filter) => (
          <Select
            key={filter.id}
            value={filter.value}
            onValueChange={filter.onChange}
          >
            <SelectTrigger
              className="w-full sm:w-[180px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] focus:ring-[#0A5ED7]"
              data-testid={`filter-${filter.id}`}
              aria-label={filter.label}
            >
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  data-testid={`filter-${filter.id}-option-${option.value}`}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {showClearButton && hasActiveFilters && onClearFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#0A5ED7]/5 dark:hover:bg-[#0BB3FF]/10 text-[#0A5ED7] dark:text-[#0BB3FF] whitespace-nowrap focus-visible:ring-[#0A5ED7]"
            data-testid="filter-clear-button"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
