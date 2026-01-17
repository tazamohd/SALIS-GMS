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
          <div className="relative backdrop-blur-xl bg-card rounded-2xl p-6 border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary shadow-lg shadow-primary/25">
                <Filter className="w-4 h-4 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Filters</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filters.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <Label htmlFor={filter.id} className="text-sm font-medium text-muted-foreground">
                    {filter.label}
                  </Label>
                  {filter.type === "select" && filter.options && (
                    <Select value={filter.value} onValueChange={filter.onChange}>
                      <SelectTrigger
                        id={filter.id}
                        className="bg-input border-border focus:ring-primary"
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
                        className="bg-input border-border focus:ring-primary"
                        data-testid={`filter-${filter.id}`}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
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
            <div className="relative backdrop-blur-xl bg-card rounded-2xl border border-border shadow-lg overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-200">
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-bold text-foreground">{section.title}</h3>
                {section.description && (
                  <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
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
