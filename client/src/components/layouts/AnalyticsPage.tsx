import { ReactNode } from "react";
import { LucideIcon, Calendar } from "lucide-react";
import { StandardPageLayout } from "./StandardPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>Customize your analytics view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filters.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <Label htmlFor={filter.id} className="text-sm font-medium">
                    {filter.label}
                  </Label>
                  {filter.type === "select" && filter.options && (
                    <Select value={filter.value} onValueChange={filter.onChange}>
                      <SelectTrigger
                        id={filter.id}
                        className="btn-touch focus-visible-ring"
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
                        className="input-touch focus-visible-ring"
                        data-testid={`filter-${filter.id}`}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart Sections */}
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              {section.description && (
                <CardDescription>{section.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {section.content}
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPageLayout>
  );
}
