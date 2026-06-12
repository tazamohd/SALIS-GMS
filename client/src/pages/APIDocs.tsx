import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen,
  Search,
  Server,
  Lock,
  Unlock,
  Layers,
  ArrowDownUp,
  Code2,
  Filter,
} from "lucide-react";

interface Endpoint {
  method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  path: string;
  description: string;
  module: string;
  authRequired: boolean;
}

interface EndpointsResponse {
  total: number;
  modules: number;
  endpoints: Endpoint[];
  grouped: Record<string, Endpoint[]>;
}

interface StatsResponse {
  total: number;
  modulesCount: number;
  modules: string[];
  methods: Record<string, number>;
  authRequired: number;
  publicEndpoints: number;
}

const METHOD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  GET: { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-300 dark:border-emerald-700" },
  POST: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300", border: "border-blue-300 dark:border-blue-700" },
  PATCH: { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300", border: "border-amber-300 dark:border-amber-700" },
  PUT: { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-300", border: "border-orange-300 dark:border-orange-700" },
  DELETE: { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-300", border: "border-red-300 dark:border-red-700" },
};

const METHOD_FILTERS = ["ALL", "GET", "POST", "PATCH", "PUT", "DELETE"] as const;

function MethodBadge({ method }: { method: string }) {
  const colors = METHOD_COLORS[method] || METHOD_COLORS.GET;
  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${colors.bg} ${colors.text} ${colors.border} min-w-[60px]`}>
      {method}
    </span>
  );
}

export default function APIDocs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedMethod, setSelectedMethod] = useState<string>("ALL");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const { data: stats, isLoading: statsLoading } = useQuery<StatsResponse>({
    queryKey: ["/api/docs/stats"],
    queryFn: async () => {
      const res = await fetch("/api/docs/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const { data: endpointsData, isLoading: endpointsLoading } = useQuery<EndpointsResponse>({
    queryKey: ["/api/docs/endpoints"],
    queryFn: async () => {
      const res = await fetch("/api/docs/endpoints");
      if (!res.ok) throw new Error("Failed to fetch endpoints");
      return res.json();
    },
  });

  const filteredGrouped = useMemo(() => {
    if (!endpointsData) return {};

    let filtered = endpointsData.endpoints;

    if (selectedModule !== "all") {
      filtered = filtered.filter((e) => e.module === selectedModule);
    }

    if (selectedMethod !== "ALL") {
      filtered = filtered.filter((e) => e.method === selectedMethod);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.path.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.module.toLowerCase().includes(q)
      );
    }

    const grouped: Record<string, Endpoint[]> = {};
    for (const ep of filtered) {
      if (!grouped[ep.module]) grouped[ep.module] = [];
      grouped[ep.module].push(ep);
    }
    return grouped;
  }, [endpointsData, selectedModule, selectedMethod, searchQuery]);

  const filteredCount = useMemo(() => {
    return Object.values(filteredGrouped).reduce((sum, arr) => sum + arr.length, 0);
  }, [filteredGrouped]);

  const toggleModule = (mod: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(mod)) next.delete(mod);
      else next.add(mod);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedModules(new Set(Object.keys(filteredGrouped)));
  };

  const collapseAll = () => {
    setExpandedModules(new Set());
  };

  const isLoading = statsLoading || endpointsLoading;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] text-white shadow-lg">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-[#E6EAF0]">
            API Documentation
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            Complete catalog of all system API endpoints
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-[#E2E8F0] dark:border-[#1E293B]">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Server className="h-5 w-5 text-[#0A5ED7] mb-1.5" />
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-[#E6EAF0]">
              {stats?.total ?? "--"}
            </p>
            <p className="text-xs text-[#64748B]">Total Endpoints</p>
          </CardContent>
        </Card>
        <Card className="border-[#E2E8F0] dark:border-[#1E293B]">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Layers className="h-5 w-5 text-[#7C3AED] mb-1.5" />
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-[#E6EAF0]">
              {stats?.modulesCount ?? "--"}
            </p>
            <p className="text-xs text-[#64748B]">Modules</p>
          </CardContent>
        </Card>
        <Card className="border-[#E2E8F0] dark:border-[#1E293B]">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="h-5 w-5 rounded bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold mb-1.5">
              GET
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats?.methods?.GET ?? "--"}
            </p>
            <p className="text-xs text-[#64748B]">GET</p>
          </CardContent>
        </Card>
        <Card className="border-[#E2E8F0] dark:border-[#1E293B]">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="h-5 w-5 rounded bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold mb-1.5">
              POST
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats?.methods?.POST ?? "--"}
            </p>
            <p className="text-xs text-[#64748B]">POST</p>
          </CardContent>
        </Card>
        <Card className="border-[#E2E8F0] dark:border-[#1E293B]">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="h-5 w-5 rounded bg-amber-500 flex items-center justify-center text-white text-[9px] font-bold mb-1.5">
              PTCH
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {(stats?.methods?.PATCH ?? 0) + (stats?.methods?.PUT ?? 0) || "--"}
            </p>
            <p className="text-xs text-[#64748B]">PATCH/PUT</p>
          </CardContent>
        </Card>
        <Card className="border-[#E2E8F0] dark:border-[#1E293B]">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="h-5 w-5 rounded bg-red-500 flex items-center justify-center text-white text-[9px] font-bold mb-1.5">
              DEL
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats?.methods?.DELETE ?? "--"}
            </p>
            <p className="text-xs text-[#64748B]">DELETE</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-[#E2E8F0] dark:border-[#1E293B]">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
              <Input
                placeholder="Search endpoints by path, description, or module..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#1E293B]"
              />
            </div>

            {/* Module Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#94A3B8] hidden md:block" />
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="w-[200px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#1E293B]">
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {(stats?.modules ?? []).map((mod) => (
                    <SelectItem key={mod} value={mod}>
                      {mod}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Method Filters */}
            <div className="flex gap-1 flex-wrap">
              {METHOD_FILTERS.map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={selectedMethod === m ? "default" : "outline"}
                  className={
                    selectedMethod === m
                      ? "bg-[#0A5ED7] hover:bg-[#0A5ED7]/90 text-white text-xs px-3"
                      : "text-xs px-3 border-[#E2E8F0] dark:border-[#1E293B]"
                  }
                  onClick={() => setSelectedMethod(m)}
                >
                  {m}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick actions and result count */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B]">
            <p className="text-sm text-[#64748B]">
              Showing <span className="font-semibold text-[#0B1F3B] dark:text-[#E6EAF0]">{filteredCount}</span> endpoints
              in <span className="font-semibold text-[#0B1F3B] dark:text-[#E6EAF0]">{Object.keys(filteredGrouped).length}</span> modules
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={expandAll} className="text-xs text-[#64748B]">
                Expand All
              </Button>
              <Button variant="ghost" size="sm" onClick={collapseAll} className="text-xs text-[#64748B]">
                Collapse All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0A5ED7]" />
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(filteredGrouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([moduleName, eps]) => {
              const isExpanded = expandedModules.has(moduleName);
              return (
                <Card
                  key={moduleName}
                  className="border-[#E2E8F0] dark:border-[#1E293B] overflow-hidden"
                >
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(moduleName)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Code2 className="h-4 w-4 text-[#0A5ED7]" />
                      <span className="font-semibold text-[#0B1F3B] dark:text-[#E6EAF0] capitalize">
                        {moduleName.replace(/-/g, " ")}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0A5ED7]/20 dark:text-[#0BB3FF] text-xs"
                      >
                        {eps.length} endpoint{eps.length > 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <ArrowDownUp
                      className={`h-4 w-4 text-[#94A3B8] transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Endpoints Table */}
                  {isExpanded && (
                    <div className="border-t border-[#E2E8F0] dark:border-[#1E293B]">
                      <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                        {eps.map((ep, i) => (
                          <div
                            key={`${ep.method}-${ep.path}-${i}`}
                            className="flex items-center gap-4 px-4 py-3 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/30 transition-colors"
                          >
                            <MethodBadge method={ep.method} />
                            <code className="text-sm font-mono text-[#0B1F3B] dark:text-[#E6EAF0] flex-shrink-0 min-w-[260px]">
                              {ep.path}
                            </code>
                            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] flex-1 truncate">
                              {ep.description}
                            </p>
                            {ep.authRequired ? (
                              <Badge
                                variant="outline"
                                className="border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1 flex-shrink-0"
                              >
                                <Lock className="h-3 w-3" />
                                Auth
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1 flex-shrink-0"
                              >
                                <Unlock className="h-3 w-3" />
                                Public
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}

          {Object.keys(filteredGrouped).length === 0 && (
            <Card className="border-[#E2E8F0] dark:border-[#1E293B]">
              <CardContent className="p-12 text-center">
                <Search className="h-10 w-10 text-[#94A3B8] mx-auto mb-3" />
                <p className="text-[#64748B] dark:text-[#94A3B8]">
                  No endpoints match your filters. Try adjusting your search or filters.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
