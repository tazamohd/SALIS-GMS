import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Users, Car, Package, FileText, Wrench, Calendar, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface SearchResult {
  id: string;
  type: "customer" | "vehicle" | "part" | "invoice" | "jobcard" | "appointment";
  title: string;
  subtitle: string;
  href: string;
}

interface SmartSearchProps {
  className?: string;
  placeholder?: string;
}

const typeConfig = {
  customer: { icon: Users, label: "Customer", color: "bg-[#0A5ED7]/10 text-[#0A5ED7] dark:text-[#0BB3FF]" },
  vehicle: { icon: Car, label: "Vehicle", color: "bg-[#0BB3FF]/10 text-[#0BB3FF]" },
  part: { icon: Package, label: "Part", color: "bg-[#0B1F3B]/10 text-[#0B1F3B] dark:bg-[#E6EAF0]/10 dark:text-[#E6EAF0]" },
  invoice: { icon: FileText, label: "Invoice", color: "bg-[#22c55e]/10 text-[#22c55e]" },
  jobcard: { icon: Wrench, label: "Job Card", color: "bg-[#0A5ED7]/15 text-[#0A5ED7] dark:text-[#0BB3FF]" },
  appointment: { icon: Calendar, label: "Appointment", color: "bg-[#64748B]/10 text-[#64748B] dark:text-[#9BA4B0]" },
};

export function SmartSearch({ className, placeholder }: SmartSearchProps) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: ["/api/search", query],
    queryFn: async () => {
      if (query.length < 2) return [];
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: query.length >= 2,
    staleTime: 1000,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    setLocation(result.href);
    setQuery("");
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(e.target.value.length >= 2);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#64748B] dark:text-[#9BA4B0]" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t("common.smartSearch", "Search customers, vehicles, parts...")}
          className="pl-10 pr-10 h-10 bg-[#F8FAFC] dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0F172A] dark:text-[#E6EAF0] placeholder:text-[#64748B] dark:placeholder:text-[#9BA4B0] focus:border-[#0A5ED7] dark:focus:border-[#0BB3FF] focus:ring-[#0A5ED7]/20 dark:focus:ring-[#0BB3FF]/20 font-poppins text-sm"
          data-testid="input-smart-search"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] rounded-xl shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-6 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-[#0A5ED7] dark:text-[#0BB3FF] animate-spin" />
              <span className="ml-2 text-[#64748B] dark:text-[#9BA4B0] text-sm">{t("common.searching", "Searching...")}</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center">
              <Search className="w-8 h-8 mx-auto text-[#64748B] dark:text-[#9BA4B0] mb-2" />
              <p className="text-[#64748B] dark:text-[#9BA4B0] text-sm">{t("common.noResults", "No results found")}</p>
              <p className="text-[#9BA4B0] dark:text-[#64748B] text-xs mt-1">{t("common.tryDifferentSearch", "Try a different search term")}</p>
            </div>
          ) : (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-[#64748B] dark:text-[#9BA4B0] uppercase tracking-wider">
                {results.length} {t("common.results", "results")}
              </div>
              {results.map((result, index) => {
                const config = typeConfig[result.type];
                const Icon = config.icon;
                
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full px-4 py-3 flex items-center gap-3 transition-colors text-left",
                      index === selectedIndex
                        ? "bg-[#0A5ED7]/5 dark:bg-[#0BB3FF]/10"
                        : "hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
                    )}
                    data-testid={`search-result-${result.type}-${result.id}`}
                  >
                    <div className={cn("p-2 rounded-lg", config.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#0F172A] dark:text-[#E6EAF0] text-sm truncate">
                        {result.title}
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-[#9BA4B0] truncate">
                        {result.subtitle}
                      </div>
                    </div>
                    <Badge className={cn("text-xs shrink-0", config.color)}>
                      {config.label}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
