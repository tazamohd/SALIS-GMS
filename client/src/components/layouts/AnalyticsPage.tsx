import { ReactNode } from "react";
import { LucideIcon, Calendar, Filter } from "lucide-react";
import { StandardPageLayout } from "./StandardPageLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FilterControl {
  id: string;
  label: string;
  type: "select" | "date";
  options?: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}

interface ChartSection {
  title: string;
  description?: string;
  content: ReactNode;
}

interface AnalyticsPageProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  filters?: FilterControl[];
  sections: ChartSection[];
  className?: string;
}

export function AnalyticsPage({
  title,
  description,
  icon,
  filters = [],
  sections,
  className,
}: AnalyticsPageProps) {
  return (
    <StandardPageLayout
      title={title}
      description={description}
      icon={icon}
      className={className}
    >
      {/* Filters */}
      {filters.length > 0 && (
        <div className="group relative mb-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/30 to-purple-500/30 rounded-3xl blur opacity-50"></div>
          <div className="relative backdrop-blur-xl bg-white/70 dark:bg-black/20 rounded-3xl p-6 border border-violet-200/50 dark:border-white/10 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg shadow-violet-500/25">
                <Filter className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filters.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <Label htmlFor={filter.id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {filter.label}
                  </Label>
                  {filter.type === "select" && filter.options && (
                    <Select value={filter.value} onValueChange={filter.onChange}>
                      <SelectTrigger
                        id={filter.id}
                        className="bg-white/80 dark:bg-white/10 border-purple-200 dark:border-white/20 focus:ring-purple-500"
                        data-testid={`filter-${filter.id}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {filter.type === "date" && (
                    <div className="relative">
                      <Input
                        id={filter.id}
                        type="date"
                        value={filter.value}
                        onChange={(e) => filter.onChange(e.target.value)}
                        className="bg-white/80 dark:bg-white/10 border-purple-200 dark:border-white/20 focus:ring-purple-500"
                        data-testid={`filter-${filter.id}`}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500 dark:text-purple-400 pointer-events-none" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chart Sections */}
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur opacity-50"></div>
            <div className="relative backdrop-blur-xl bg-white/70 dark:bg-black/20 rounded-3xl border border-blue-200/50 dark:border-white/10 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200/50 dark:border-white/10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{section.title}</h3>
                {section.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{section.description}</p>
                )}
              </div>
              <div className="p-6">
                {section.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </StandardPageLayout>
  );
}
