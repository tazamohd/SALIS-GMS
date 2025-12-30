import { Search, X, Filter } from "lucide-react";
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
    <div className={cn("group relative", className)} data-testid="filter-bar">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-50"></div>
      <div className="relative flex flex-col sm:flex-row gap-3 p-4 backdrop-blur-xl bg-white/70 dark:bg-black/20 border border-purple-200/50 dark:border-white/10 rounded-2xl shadow-lg">
        {onSearchChange && (
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-500 dark:text-purple-400"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-white/80 dark:bg-white/10 border-purple-200 dark:border-white/20 focus:ring-purple-500 focus:border-purple-500"
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
              className="w-full sm:w-[180px] bg-white/80 dark:bg-white/10 border-purple-200 dark:border-white/20 focus:ring-purple-500"
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
            className="bg-white/80 dark:bg-white/10 border-purple-200 dark:border-white/20 hover:bg-purple-50 dark:hover:bg-white/20 text-purple-700 dark:text-white whitespace-nowrap"
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
