import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Building2, Truck, Users, Shield, Activity,
  CreditCard, Plus, Search, CheckCircle, XCircle, AlertTriangle,
  Phone, Eye, RefreshCw, TrendingUp, MessageSquare,
  Clock, LayoutDashboard, Crown,
  Server, Database, Cpu, HardDrive, Wifi
} from "lucide-react";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const BRAND_BLUE = "#0A5ED7";
const BRAND_CYAN = "#0BB3FF";
const BRAND_NAVY = "#0B1F3B";
const BRAND_ORANGE = "#F97316";

const garageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  ownerName: z.string().min(2, "Owner name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Valid phone required"),
  address: z.string().min(5, "Address required"),
  city: z.string().min(2, "City required"),
  country: z.string().min(2, "Country required"),
  subscriptionPlan: z.enum(["STARTER", "PRO", "ENTERPRISE"]),
  vatNumber: z.string().optional(),
  maxBranches: z.coerce.number().min(1).max(500),
});

type GarageFormData = z.infer<typeof garageSchema>;

const PLAN_COLORS: Record<string, string> = {
  STARTER: "text-gray-500 bg-gray-100 dark:bg-gray-800",
  PRO: "text-blue-500 bg-blue-50 dark:bg-blue-900/30",
  ENTERPRISE: "text-purple-500 bg-purple-50 dark:bg-purple-900/30",
};

// ── Real platform data (no mocks) ──────────────────────────────────────

interface PlatformStats {
  totalGarages: number;
  activeGarages: number;
  totalUsers: number;
  totalSuppliers: number;
  monthlyRevenue: number;
  supportTickets: number;
  pendingApplications: number;
  pendingSubscriptionRequests: number;
  planMix: { plan: string; count: number }[];
  roleCounts: { role: string; count: number }[];
  uptimeSeconds: number;
}

interface PlatformGarageRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  business_type: string | null;
  subscription_plan: string | null;
  is_active: boolean;
  user_count: string | number;
  created_at: string;
}

interface PlatformSupplierRow {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  payment_terms: string | null;
  is_active: boolean;
  created_at: string;
  garage: string | null;
}

interface SupportTicketRow {
  id: string;
  garage_id: string | null;
  garage: string | null;
  subject: string;
  priority: string | null;
  status: string;
  category: string | null;
  created_at: string;
}

function usePlatformStats() {
  return useQuery<PlatformStats>({
    queryKey: ["/api/platform-admin/stats"],
    queryFn: async () => (await apiRequest("GET", "/api/platform-admin/stats")).json(),
  });
}

function usePlatformGarages() {
  return useQuery<PlatformGarageRow[]>({
    queryKey: ["/api/platform-admin/garages"],
    queryFn: async () => (await apiRequest("GET", "/api/platform-admin/garages")).json(),
  });
}

const PLAN_CHART_COLORS: Record<string, string> = {
  STARTER: "#94a3b8",
  PRO: BRAND_BLUE,
  ENTERPRISE: "#7c3aed",
};

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function OverviewTab() {
  const { t } = useTranslation();
  const stats = usePlatformStats();
  const s = stats.data;
  const pendingTotal = (s?.pendingApplications ?? 0) + (s?.pendingSubscriptionRequests ?? 0);
  const planDistribution = (s?.planMix ?? []).map((p) => ({
    name: p.plan, value: p.count, color: PLAN_CHART_COLORS[p.plan] ?? "#64748b",
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("platformAdmin.totalGarages", "Total Garages"), value: s?.totalGarages ?? "…", active: s?.activeGarages ?? null, icon: Building2, color: BRAND_BLUE },
          { label: t("platformAdmin.suppliers", "Suppliers"), value: s?.totalSuppliers ?? "…", active: null, icon: Truck, color: "#7c3aed" },
          { label: t("platformAdmin.pendingApprovals", "Pending Approvals"), value: pendingTotal, active: null, icon: Clock, color: BRAND_ORANGE },
          { label: t("platformAdmin.platformUsers", "Platform Users"), value: s?.totalUsers?.toLocaleString() ?? "…", active: null, icon: Users, color: "#d97706" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[#64748B] dark:text-[#9BA4B0] font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#0F172A] dark:text-white mt-1">{stat.value}</p>
                  {stat.active !== null && (
                    <p className="text-xs text-green-500 mt-1">{stat.active} {t("platformAdmin.active", "active")}</p>
                  )}
                </div>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] border-0 text-white">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium opacity-90">{t("platformAdmin.monthlyRevenue", "Monthly Revenue")}</p>
              <TrendingUp className="h-4 w-4 opacity-80" />
            </div>
            <p className="text-3xl font-bold">SAR {(s?.monthlyRevenue ?? 0).toLocaleString()}</p>
            <p className="text-xs mt-1 opacity-80">{t("platformAdmin.mrrNote", "MRR from active subscription plans")}</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#64748B] dark:text-[#9BA4B0] font-medium">{t("platformAdmin.openSupportTickets", "Open Support Tickets")}</p>
              <MessageSquare className="h-4 w-4 text-[#F97316]" />
            </div>
            <p className="text-3xl font-bold text-[#0F172A] dark:text-white">{s?.supportTickets ?? "…"}</p>
            <p className="text-xs text-[#64748B] mt-1">{t("platformAdmin.unresolvedNote", "unresolved across all garages")}</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#64748B] dark:text-[#9BA4B0] font-medium">{t("platformAdmin.serverUptime", "Server Uptime")}</p>
              <Activity className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-[#0F172A] dark:text-white">{s ? formatUptime(s.uptimeSeconds) : "…"}</p>
            <p className="text-xs text-[#64748B] mt-1">{t("platformAdmin.sinceRestart", "since last restart")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#0F172A] dark:text-white">{t("platformAdmin.planDistribution", "Subscription Plan Distribution")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            {planDistribution.length === 0 ? (
              <p className="text-sm text-[#64748B] py-8">{t("platformAdmin.noActiveSubs", "No active subscriptions yet.")}</p>
            ) : (
              <>
                <ResponsiveContainer width="60%" height={160}>
                  <PieChart>
                    <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {planDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {planDistribution.map((plan) => (
                    <div key={plan.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: plan.color }} />
                      <div>
                        <p className="text-xs font-medium text-[#0F172A] dark:text-white">{plan.name}</p>
                        <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{plan.value} {t("platformAdmin.garagesLower", "garages")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <RecentGaragesCard />
      </div>
    </div>
  );
}

function RecentGaragesCard() {
  const { t } = useTranslation();
  const garages = usePlatformGarages();
  const recent = (garages.data ?? []).slice(0, 6);
  return (
    <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-[#0F172A] dark:text-white">{t("platformAdmin.recentProviders", "Recently Onboarded Providers")}</CardTitle>
      </CardHeader>
      <CardContent>
        {garages.isLoading ? (
          <p className="text-sm text-[#64748B]">{t("common.loading", "Loading…")}</p>
        ) : recent.length === 0 ? (
          <p className="text-sm text-[#64748B]">{t("platformAdmin.noProviders", "No providers yet.")}</p>
        ) : (
          <div className="space-y-2">
            {recent.map((g) => (
              <div key={g.id} className="flex items-center gap-3 py-2 border-b border-[#E2E8F0] dark:border-[#232A36] last:border-0">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND_BLUE}15` }}>
                  <Building2 className="h-4 w-4" style={{ color: BRAND_BLUE }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F172A] dark:text-[#E6EAF0] truncate">{g.name}</p>
                  <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{g.business_type ?? "garage"} · {Number(g.user_count)} {t("platformAdmin.users", "users")}</p>
                </div>
                <Badge variant="outline" className={`text-xs ${PLAN_COLORS[g.subscription_plan ?? ""] ?? ""}`}>{g.subscription_plan ?? "—"}</Badge>
                <span className="text-xs text-[#64748B] dark:text-[#9BA4B0] whitespace-nowrap">{new Date(g.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GaragesTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [planFilter, setPlanFilter] = useState("ALL");
  const garages = usePlatformGarages();

  const form = useForm<GarageFormData>({
    resolver: zodResolver(garageSchema),
    defaultValues: {
      name: "", ownerName: "", email: "", phone: "", address: "",
      city: "", country: "Saudi Arabia", subscriptionPlan: "STARTER",
      vatNumber: "", maxBranches: 1,
    },
  });

  const createGarageMutation = useMutation({
    mutationFn: (data: GarageFormData) => apiRequest("POST", "/api/platform-admin/garages", data),
    onSuccess: () => {
      toast({ title: t("platformAdmin.garageCreated", "Garage created successfully"), description: t("platformAdmin.garageCreatedDesc", "The garage account is now active.") });
      qc.invalidateQueries({ queryKey: ["/api/platform-admin/garages"] });
      setDialogOpen(false);
      form.reset();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "suspended" }) =>
      apiRequest("PATCH", `/api/platform-admin/garages/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/platform-admin/garages"] });
      toast({ title: t("platformAdmin.statusUpdated", "Status updated") });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = (garages.data ?? []).filter(g => {
    const q = search.toLowerCase();
    const matchSearch = g.name.toLowerCase().includes(q) ||
      (g.email ?? "").toLowerCase().includes(q) ||
      (g.address ?? "").toLowerCase().includes(q);
    const matchPlan = planFilter === "ALL" || g.subscription_plan === planFilter;
    return matchSearch && matchPlan;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <Input placeholder={t("platformAdmin.searchGarages", "Search garages...")} value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64 h-9" />
          </div>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder={t("platformAdmin.allPlans", "All Plans")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("platformAdmin.allPlans", "All Plans")}</SelectItem>
              <SelectItem value="STARTER">Starter</SelectItem>
              <SelectItem value="PRO">Pro</SelectItem>
              <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="h-9 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0 hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          {t("platformAdmin.newGarage", "New Garage")}
        </Button>
      </div>

      <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
        {garages.isLoading ? (
          <CardContent className="py-8"><p className="text-sm text-[#64748B]">{t("common.loading", "Loading…")}</p></CardContent>
        ) : filtered.length === 0 ? (
          <CardContent className="py-8"><p className="text-sm text-[#64748B]" data-testid="no-garages">{t("platformAdmin.noGaragesMatch", "No garages match.")}</p></CardContent>
        ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
              <TableHead>{t("platformAdmin.garage", "Garage")}</TableHead>
              <TableHead>{t("myOfferings.type", "Type")}</TableHead>
              <TableHead>{t("providerSignup.plan", "Plan")}</TableHead>
              <TableHead>{t("platformAdmin.users", "Users")}</TableHead>
              <TableHead>{t("platformAdmin.joined", "Joined")}</TableHead>
              <TableHead>{t("common.status", "Status")}</TableHead>
              <TableHead>{t("platformAdmin.actions", "Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((garage) => (
              <TableRow key={garage.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`garage-row-${garage.id}`}>
                <TableCell>
                  <div>
                    <p className="font-semibold text-sm text-[#0F172A] dark:text-white">{garage.name}</p>
                    <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{garage.email ?? garage.phone ?? "—"}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{garage.business_type ?? "garage"}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={PLAN_COLORS[garage.subscription_plan ?? ""] ?? ""}>
                    {garage.subscription_plan ?? "—"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{Number(garage.user_count)}</TableCell>
                <TableCell className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{new Date(garage.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={garage.is_active ? "text-green-500 border-green-200 bg-green-50 dark:bg-green-900/20" : "text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20"}>
                    {garage.is_active ? t("platformAdmin.active", "active") : t("platformAdmin.suspended", "suspended")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost" size="sm"
                    className="h-7 px-2 text-xs text-[#F97316] hover:text-[#F97316]"
                    disabled={statusMutation.isPending}
                    data-testid={`toggle-garage-${garage.id}`}
                    onClick={() => statusMutation.mutate({ id: garage.id, status: garage.is_active ? "suspended" : "active" })}
                  >
                    {garage.is_active
                      ? <><XCircle className="h-3.5 w-3.5 mr-1" /> {t("platformAdmin.suspend", "Suspend")}</>
                      : <><CheckCircle className="h-3.5 w-3.5 mr-1" /> {t("platformAdmin.activate", "Activate")}</>}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#0B1F3B] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#0F172A] dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#0A5ED7]" />
              {t("platformAdmin.registerNewGarage", "Register New Garage")}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => createGarageMutation.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>{t("platformAdmin.garageName", "Garage Name")}</FormLabel>
                    <FormControl><Input placeholder="Al-Rashid Auto Center" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="ownerName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("providerSignup.ownerName", "Owner name")}</FormLabel>
                    <FormControl><Input placeholder="Mohammed Al-Rashid" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.email", "Email")}</FormLabel>
                    <FormControl><Input type="email" placeholder="owner@garage.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.phone", "Phone")}</FormLabel>
                    <FormControl><Input placeholder="+966 50 000 0000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="vatNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("platformAdmin.vatNumber", "VAT/TRN Number")}</FormLabel>
                    <FormControl><Input placeholder="310XXXXXXXXXX" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>{t("myOfferings.address", "Address")}</FormLabel>
                    <FormControl><Input placeholder="Street, district..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.city", "City")}</FormLabel>
                    <FormControl><Input placeholder="Riyadh" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="country" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.country", "Country")}</FormLabel>
                    <FormControl><Input placeholder="Saudi Arabia" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="subscriptionPlan" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("platformAdmin.subscriptionPlan", "Subscription Plan")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="STARTER">Starter</SelectItem>
                        <SelectItem value="PRO">Pro</SelectItem>
                        <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="maxBranches" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("platformAdmin.maxBranches", "Max Branches")}</FormLabel>
                    <FormControl><Input type="number" min={1} max={500} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel", "Cancel")}</Button>
                <Button type="submit" disabled={createGarageMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0">
                  {createGarageMutation.isPending ? t("platformAdmin.creating", "Creating...") : t("platformAdmin.createGarage", "Create Garage")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SuppliersTab() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const suppliers = useQuery<PlatformSupplierRow[]>({
    queryKey: ["/api/platform-admin/suppliers"],
    queryFn: async () => (await apiRequest("GET", "/api/platform-admin/suppliers")).json(),
  });

  const filtered = (suppliers.data ?? []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contact_person ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (s.garage ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input placeholder={t("platformAdmin.searchSuppliers", "Search suppliers or garages...")} value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-72 h-9" />
        </div>
        <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">
          {t("platformAdmin.suppliersNote", "Read-only oversight of every garage's procurement suppliers. Platform-level parts vendors onboard via the marketplace.")}
        </p>
      </div>

      <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
        {suppliers.isLoading ? (
          <CardContent className="py-8"><p className="text-sm text-[#64748B]">{t("common.loading", "Loading…")}</p></CardContent>
        ) : filtered.length === 0 ? (
          <CardContent className="py-8"><p className="text-sm text-[#64748B]" data-testid="no-suppliers">{t("platformAdmin.noSuppliers", "No suppliers registered by any garage yet.")}</p></CardContent>
        ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
              <TableHead>{t("platformAdmin.supplier", "Supplier")}</TableHead>
              <TableHead>{t("platformAdmin.garage", "Garage")}</TableHead>
              <TableHead>{t("common.country", "Country")}</TableHead>
              <TableHead>{t("platformAdmin.paymentTerms", "Payment Terms")}</TableHead>
              <TableHead>{t("platformAdmin.added", "Added")}</TableHead>
              <TableHead>{t("common.status", "Status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((supplier) => (
              <TableRow key={supplier.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`supplier-row-${supplier.id}`}>
                <TableCell>
                  <div>
                    <p className="font-semibold text-sm text-[#0F172A] dark:text-white">{supplier.name}</p>
                    <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{supplier.contact_person ?? supplier.email ?? "—"}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-[#64748B] dark:text-[#9BA4B0]">{supplier.garage ?? "—"}</TableCell>
                <TableCell className="text-sm text-[#64748B] dark:text-[#9BA4B0]">{supplier.country ?? "—"}</TableCell>
                <TableCell className="text-sm">{supplier.payment_terms ?? "—"}</TableCell>
                <TableCell className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{new Date(supplier.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={supplier.is_active ? "text-green-500 border-green-200 bg-green-50 dark:bg-green-900/20" : "text-gray-500 border-gray-200"}>
                    {supplier.is_active ? t("platformAdmin.active", "active") : t("platformAdmin.inactive", "inactive")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </Card>
    </div>
  );
}

function SupportTab() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketRow | null>(null);
  const [newStatus, setNewStatus] = useState<string>("open");

  const tickets = useQuery<SupportTicketRow[]>({
    queryKey: ["/api/platform-admin/support-tickets"],
    queryFn: async () => (await apiRequest("GET", "/api/platform-admin/support-tickets")).json(),
  });

  const updateTicket = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/platform-admin/support-tickets/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/platform-admin/support-tickets"] });
      qc.invalidateQueries({ queryKey: ["/api/platform-admin/stats"] });
      toast({ title: t("platformAdmin.ticketUpdated", "Ticket updated") });
      setSelectedTicket(null);
    },
    onError: (e: Error) => toast({ title: t("providerBookings.updateFailed", "Update failed"), description: e.message, variant: "destructive" }),
  });

  const priorityColors: Record<string, string> = {
    HIGH: "text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20",
    URGENT: "text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20",
    MEDIUM: "text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20",
    LOW: "text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-900/20",
  };

  const statusColors: Record<string, string> = {
    open: "text-[#F97316] border-orange-200 bg-orange-50 dark:bg-orange-900/20",
    in_progress: "text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-900/20",
    resolved: "text-green-500 border-green-200 bg-green-50 dark:bg-green-900/20",
    closed: "text-green-500 border-green-200 bg-green-50 dark:bg-green-900/20",
  };

  const all = tickets.data ?? [];
  const filtered = all.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) ||
      (t.garage ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
        {[
          { label: t("platformAdmin.open", "Open"), value: all.filter(t => t.status === "open").length, color: BRAND_ORANGE },
          { label: t("platformAdmin.inProgress", "In Progress"), value: all.filter(t => t.status === "in_progress").length, color: BRAND_BLUE },
          { label: t("platformAdmin.resolved", "Resolved"), value: all.filter(t => t.status === "resolved" || t.status === "closed").length, color: "#059669" },
          { label: t("platformAdmin.total", "Total"), value: all.length, color: "#7c3aed" },
        ].map((s) => (
          <Card key={s.label} className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 items-center justify-between">
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <Input placeholder={t("platformAdmin.searchTickets", "Search tickets...")} value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64 h-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("platformAdmin.allStatus", "All Status")}</SelectItem>
              <SelectItem value="open">{t("platformAdmin.open", "Open")}</SelectItem>
              <SelectItem value="in_progress">{t("platformAdmin.inProgress", "In Progress")}</SelectItem>
              <SelectItem value="resolved">{t("platformAdmin.resolved", "Resolved")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
        {tickets.isLoading ? (
          <CardContent className="py-8"><p className="text-sm text-[#64748B]">{t("common.loading", "Loading…")}</p></CardContent>
        ) : filtered.length === 0 ? (
          <CardContent className="py-8"><p className="text-sm text-[#64748B]" data-testid="no-tickets">{t("platformAdmin.noTickets", "No support tickets.")}</p></CardContent>
        ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
              <TableHead>{t("platformAdmin.ticket", "Ticket")}</TableHead>
              <TableHead>{t("platformAdmin.garage", "Garage")}</TableHead>
              <TableHead>{t("platformAdmin.subject", "Subject")}</TableHead>
              <TableHead>{t("myOfferings.category", "Category")}</TableHead>
              <TableHead>{t("platformAdmin.priority", "Priority")}</TableHead>
              <TableHead>{t("common.status", "Status")}</TableHead>
              <TableHead>{t("platformAdmin.date", "Date")}</TableHead>
              <TableHead>{t("platformAdmin.actions", "Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ticket) => (
              <TableRow key={ticket.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`ticket-row-${ticket.id}`}>
                <TableCell className="font-mono text-xs font-bold text-[#0A5ED7]">{ticket.id.slice(0, 8)}…</TableCell>
                <TableCell>
                  <p className="text-sm font-medium text-[#0F172A] dark:text-white">{ticket.garage ?? "—"}</p>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <p className="text-sm truncate">{ticket.subject}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{ticket.category ?? "—"}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${priorityColors[(ticket.priority ?? "").toUpperCase()] ?? ""}`}>
                    {ticket.priority ?? "—"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${statusColors[ticket.status] ?? ""}`}>
                    {ticket.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#0A5ED7]"
                    onClick={() => { setSelectedTicket(ticket); setNewStatus(ticket.status); }}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> {t("platformAdmin.view", "View")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        {selectedTicket && (
          <DialogContent className="max-w-2xl bg-white dark:bg-[#0B1F3B]">
            <DialogHeader>
              <DialogTitle className="text-[#0F172A] dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#0A5ED7]" />
                {t("platformAdmin.ticket", "Ticket")} {selectedTicket.id.slice(0, 8)}…
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg p-3">
                  <p className="text-xs text-[#64748B] mb-1">{t("platformAdmin.garage", "Garage")}</p>
                  <p className="text-sm font-medium text-[#0F172A] dark:text-white">{selectedTicket.garage ?? "—"}</p>
                </div>
                <div className="bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg p-3">
                  <p className="text-xs text-[#64748B] mb-1">{t("platformAdmin.opened", "Opened")}</p>
                  <p className="text-sm font-medium text-[#0F172A] dark:text-white">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg p-3">
                <p className="text-xs text-[#64748B] mb-1">{t("platformAdmin.subject", "Subject")}</p>
                <p className="text-sm font-medium text-[#0F172A] dark:text-white">{selectedTicket.subject}</p>
              </div>
              <div className="flex gap-3 justify-end">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-36" data-testid="ticket-status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">{t("platformAdmin.open", "Open")}</SelectItem>
                    <SelectItem value="in_progress">{t("platformAdmin.inProgress", "In Progress")}</SelectItem>
                    <SelectItem value="resolved">{t("platformAdmin.resolved", "Resolved")}</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0"
                  disabled={updateTicket.isPending || newStatus === selectedTicket.status}
                  data-testid="ticket-save"
                  onClick={() => updateTicket.mutate({ id: selectedTicket.id, status: newStatus })}
                >
                  {updateTicket.isPending ? t("common.saving", "Saving…") : t("platformAdmin.updateStatus", "Update Status")}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

interface SystemHealth {
  uptimeSeconds: number;
  dbOk: boolean;
  dbLatencyMs: number;
  dbConnections: number;
  memoryRssMb: number;
  memoryHeapUsedMb: number;
  nodeVersion: string;
  integrations: { name: string; configured: boolean; operational?: boolean }[];
}

function SystemHealthTab() {
  const { t } = useTranslation();
  const health = useQuery<SystemHealth>({
    queryKey: ["/api/platform-admin/system-health"],
    queryFn: async () => (await apiRequest("GET", "/api/platform-admin/system-health")).json(),
    refetchInterval: 30_000,
  });
  const h = health.data;

  const metrics = h ? [
    { label: t("platformAdmin.dbLatency", "DB Latency"), value: `${h.dbLatencyMs}ms`, good: h.dbLatencyMs < 200, icon: Wifi },
    { label: t("platformAdmin.dbConnections", "DB Connections"), value: h.dbConnections, good: h.dbConnections < 300, icon: Database },
    { label: t("platformAdmin.memoryRss", "Memory (RSS)"), value: `${h.memoryRssMb} MB`, good: true, icon: HardDrive },
    { label: t("platformAdmin.heapUsed", "Heap Used"), value: `${h.memoryHeapUsedMb} MB`, good: true, icon: HardDrive },
    { label: t("platformAdmin.serverUptime", "Server Uptime"), value: formatUptime(h.uptimeSeconds), good: true, icon: Server },
    { label: "Node.js", value: h.nodeVersion, good: true, icon: Cpu },
  ] : [];

  return (
    <div className="space-y-4">
      <Card className={h && !h.dbOk
        ? "bg-gradient-to-r from-red-500/10 to-red-400/5 border border-red-200 dark:border-red-900/40"
        : "bg-gradient-to-r from-green-500/10 to-green-400/5 border border-green-200 dark:border-green-900/40"}>
        <CardContent className="pt-4 pb-4 flex items-center gap-3">
          {h && !h.dbOk
            ? <AlertTriangle className="h-6 w-6 text-red-500" />
            : <CheckCircle className="h-6 w-6 text-green-500" />}
          <div>
            <p className="font-bold text-[#0F172A] dark:text-white">
              {health.isLoading ? t("platformAdmin.checking", "Checking…") : h && !h.dbOk ? t("platformAdmin.dbUnreachable", "Database Unreachable") : t("platformAdmin.coreOperational", "Core Systems Operational")}
            </p>
            <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">
              {t("platformAdmin.liveMetricsNote", "Live metrics measured from the running server")}{h ? ` · ${t("platformAdmin.refreshedEvery", "refreshed every 30s")}` : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <m.icon className="h-4 w-4 text-[#64748B] dark:text-[#9BA4B0]" />
                <div className={`h-2 w-2 rounded-full ${m.good ? "bg-green-400" : "bg-[#F97316]"}`} />
              </div>
              <p className="text-xl font-bold text-[#0F172A] dark:text-white">{m.value}</p>
              <p className="text-xs text-[#64748B] dark:text-[#9BA4B0] mt-1">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[#0F172A] dark:text-white">{t("platformAdmin.integrations", "Integrations")}</CardTitle>
          <CardDescription className="text-xs text-[#64748B] dark:text-[#9BA4B0]">
            {t("platformAdmin.integrationsNote", "Configured from environment keys — unconfigured integrations run in stub/dev mode.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(h?.integrations ?? []).map((svc) => (
              <div key={svc.name} className="flex items-center justify-between py-2 border-b border-[#E2E8F0] dark:border-[#232A36] last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${svc.operational === false ? "bg-red-400" : svc.configured ? "bg-green-400" : "bg-slate-300 dark:bg-slate-600"}`} />
                  <span className="text-sm text-[#0F172A] dark:text-[#E6EAF0]">{svc.name}</span>
                </div>
                <Badge variant="outline" className={svc.operational === false
                  ? "text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20 text-xs"
                  : svc.configured
                    ? "text-green-500 border-green-200 bg-green-50 dark:bg-green-900/20 text-xs"
                    : "text-slate-500 border-slate-200 text-xs"}>
                  {svc.operational === false ? t("platformAdmin.down", "down") : svc.configured ? t("platformAdmin.configured", "configured") : t("platformAdmin.notConfigured", "not configured")}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const ROLE_CATALOG: Record<string, { name: string; color: string; description: string }> = {
  PLATFORM_ADMIN: { name: "Platform Admin", color: "#7c3aed", description: "Full platform control, all tenants, system settings" },
  SUPER_ADMIN: { name: "Super Admin", color: "#7c3aed", description: "Full platform control, all tenants, system settings" },
  ADMIN: { name: "System Administrator", color: BRAND_BLUE, description: "Full access within their garage/tenant" },
  MANAGER: { name: "Service Manager", color: "#059669", description: "Service operations, HR, limited finance" },
  ADVISOR: { name: "Service Advisor", color: "#d97706", description: "Customer intake, job cards, estimates" },
  TECHNICIAN: { name: "Technician", color: "#64748b", description: "Assigned jobs, time clock, parts lookup" },
  ACCOUNTANT: { name: "Accountant", color: "#0891b2", description: "Finance, invoices, reports, accounting" },
  PURCHASE_AGENT: { name: "Purchase Agent", color: "#7c3aed", description: "Purchase orders, suppliers, inventory" },
  HR_MANAGER: { name: "HR Manager", color: "#be185d", description: "Staff, payroll, leave, performance" },
  CUSTOMER: { name: "Customer", color: "#84cc16", description: "Customer portal, booking, vehicle history" },
};

function RBACTab() {
  const { t } = useTranslation();
  const stats = usePlatformStats();
  const roles = (stats.data?.roleCounts ?? []).map((r) => {
    const meta = ROLE_CATALOG[r.role] ?? { name: r.role, color: "#64748b", description: "Custom role" };
    return { code: r.role, users: r.count, ...meta };
  });

  return (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[#0F172A] dark:text-white">{t("platformAdmin.rolesMatrix", "Platform Roles & Permissions Matrix")}</CardTitle>
          <CardDescription className="text-xs text-[#64748B] dark:text-[#9BA4B0]">
            {t("platformAdmin.rolesMatrixNote", "Live user counts per role across the platform. PLATFORM_ADMIN has unrestricted access to all tenants and settings.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.isLoading ? (
            <p className="text-sm text-[#64748B]">{t("common.loading", "Loading…")}</p>
          ) : roles.length === 0 ? (
            <p className="text-sm text-[#64748B]">{t("platformAdmin.noUsers", "No users yet.")}</p>
          ) : (
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.code} className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7]/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: `${role.color}15` }}>
                    <Shield className="h-4 w-4" style={{ color: role.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-[#0F172A] dark:text-white">{role.name}</p>
                      <Badge variant="outline" className="text-xs font-mono">{role.code}</Badge>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{role.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#0F172A] dark:text-white">{role.users.toLocaleString()}</p>
                  <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{t("platformAdmin.users", "users")}</p>
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Sidebar deep-links (/platform-admin/<segment>) → tab ids.
const TAB_ALIASES: Record<string, string> = {
  garages: "garages", suppliers: "suppliers", support: "support",
  billing: "billing", system: "system", approvals: "approvals",
  roles: "rbac", rbac: "rbac", users: "rbac", analytics: "overview",
};

export default function PlatformAdmin() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const params = useParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState(TAB_ALIASES[params.tab ?? ""] ?? "overview");

  const tabs = [
    { id: "overview", label: t("platformAdmin.tabOverview", "Overview"), icon: LayoutDashboard },
    { id: "approvals", label: t("platformAdmin.tabApprovals", "Approvals"), icon: CheckCircle },
    { id: "garages", label: t("platformAdmin.tabGarages", "Garages"), icon: Building2 },
    { id: "billing", label: t("platformAdmin.tabBilling", "Billing"), icon: CreditCard },
    { id: "suppliers", label: t("platformAdmin.tabSuppliers", "Suppliers"), icon: Truck },
    { id: "support", label: t("platformAdmin.tabSupport", "Help & Support"), icon: MessageSquare },
    { id: "rbac", label: t("platformAdmin.tabRbac", "Roles & RBAC"), icon: Shield },
    { id: "system", label: t("platformAdmin.tabSystem", "System Health"), icon: Activity },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center shadow-lg">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0B1F3B] dark:text-white">{t("platformAdmin.title", "Platform Administration")}</h1>
            <p className="text-sm text-[#64748B] dark:text-[#9BA4B0]">
              {t("platformAdmin.subtitle", "SALIS AUTO · Super Admin Control Center")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0 px-3 py-1 text-xs font-semibold">
            {t("platformAdmin.badge", "PLATFORM ADMIN")}
          </Badge>
          <Button variant="outline" size="sm" className="h-9 gap-2 border-[#E2E8F0] dark:border-[#232A36]">
            <RefreshCw className="h-3.5 w-3.5" />
            {t("platformAdmin.refresh", "Refresh")}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36] h-auto flex-wrap gap-1 p-1">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white">
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6"><OverviewTab /></TabsContent>
        <TabsContent value="approvals" className="mt-6"><ApprovalsTab /></TabsContent>
        <TabsContent value="garages" className="mt-6"><GaragesTab /></TabsContent>
        <TabsContent value="billing" className="mt-6"><PlatformBillingTab /></TabsContent>
        <TabsContent value="suppliers" className="mt-6"><SuppliersTab /></TabsContent>
        <TabsContent value="support" className="mt-6"><SupportTab /></TabsContent>
        <TabsContent value="rbac" className="mt-6"><RBACTab /></TabsContent>
        <TabsContent value="system" className="mt-6"><SystemHealthTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Approvals tab — real onboarding + subscription-request review queues.
// ═══════════════════════════════════════════════════════════════════════

interface GarageApplicationRow {
  id: string;
  providerType: string;
  businessName: string;
  ownerName: string;
  email: string;
  city: string | null;
  requestedPlan: string;
  taxNumber: string | null;
  commercialRegistration: string | null;
  verificationStatus: string;
  status: string;
  createdAt: string;
}

interface SubscriptionRequestRow {
  id: string;
  garageId: string;
  currentPlan: string | null;
  requestedPlan: string;
  status: string;
  createdAt: string;
}

function ApprovalsTab() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const apps = useQuery<GarageApplicationRow[]>({
    queryKey: ["/api/platform-admin/garage-applications", "pending"],
    queryFn: async () => (await apiRequest("GET", "/api/platform-admin/garage-applications?status=pending")).json(),
  });
  const subs = useQuery<SubscriptionRequestRow[]>({
    queryKey: ["/api/platform-admin/subscription-requests", "pending"],
    queryFn: async () => (await apiRequest("GET", "/api/platform-admin/subscription-requests?status=pending")).json(),
  });

  const act = useMutation({
    mutationFn: async ({ url, invalidate }: { url: string; invalidate: any[] }) => {
      await apiRequest("POST", url, {});
      return invalidate;
    },
    onSuccess: (invalidate) => {
      qc.invalidateQueries({ queryKey: invalidate });
      toast({ title: t("platformAdmin.done", "Done"), description: t("platformAdmin.requestProcessed", "Request processed.") });
    },
    onError: (e: Error) => toast({ title: t("platformAdmin.actionFailed", "Action failed"), description: e.message, variant: "destructive" }),
  });

  const badge = (s: string) =>
    s === "verified" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
    : s === "manual_review" ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20"
    : "text-slate-600 bg-slate-50 dark:bg-slate-800/40";

  return (
    <div className="space-y-6">
      {/* Provider onboarding applications */}
      <Card className="border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#0A5ED7]" /> {t("platformAdmin.providerApplications", "Provider applications")}
            <Badge variant="outline" className="ml-2">{apps.data?.length ?? 0} {t("platformAdmin.pending", "pending")}</Badge>
          </CardTitle>
          <CardDescription>{t("platformAdmin.applicationsNote", "Garages, parts stores and insurers awaiting review (verified ones auto-approve).")}</CardDescription>
        </CardHeader>
        <CardContent>
          {apps.isLoading ? <p className="text-sm text-[#64748B]">{t("common.loading", "Loading…")}</p>
          : (apps.data?.length ?? 0) === 0 ? <p className="text-sm text-[#64748B]" data-testid="no-pending-apps">{t("platformAdmin.noPendingApps", "No pending applications.")}</p>
          : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("platformAdmin.business", "Business")}</TableHead><TableHead>{t("myOfferings.type", "Type")}</TableHead><TableHead>{t("platformAdmin.taxCr", "Tax / CR")}</TableHead>
                  <TableHead>{t("platformAdmin.verification", "Verification")}</TableHead><TableHead className="text-right">{t("providerBookings.action", "Action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.data!.map((a) => (
                  <TableRow key={a.id} data-testid={`app-row-${a.id}`}>
                    <TableCell>
                      <div className="font-medium">{a.businessName}</div>
                      <div className="text-xs text-[#64748B]">{a.ownerName} · {a.email}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{a.providerType}</Badge></TableCell>
                    <TableCell className="text-xs">{a.taxNumber}<br />{a.commercialRegistration}</TableCell>
                    <TableCell><span className={`text-xs px-2 py-1 rounded ${badge(a.verificationStatus)}`}>{a.verificationStatus}</span></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" data-testid={`approve-app-${a.id}`}
                        onClick={() => act.mutate({ url: `/api/platform-admin/garage-applications/${a.id}/approve`, invalidate: ["/api/platform-admin/garage-applications"] })}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"><CheckCircle className="h-3.5 w-3.5 mr-1" />{t("platformAdmin.approve", "Approve")}</Button>
                      <Button size="sm" variant="outline" data-testid={`reject-app-${a.id}`}
                        onClick={() => act.mutate({ url: `/api/platform-admin/garage-applications/${a.id}/reject`, invalidate: ["/api/platform-admin/garage-applications"] })}
                        className="h-8"><XCircle className="h-3.5 w-3.5 mr-1" />{t("platformAdmin.reject", "Reject")}</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Subscription change requests */}
      <Card className="border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#0A5ED7]" /> {t("platformAdmin.subscriptionRequests", "Subscription requests")}
            <Badge variant="outline" className="ml-2">{subs.data?.length ?? 0} {t("platformAdmin.pending", "pending")}</Badge>
          </CardTitle>
          <CardDescription>{t("platformAdmin.subRequestsNote", "Garages requesting a plan change.")}</CardDescription>
        </CardHeader>
        <CardContent>
          {subs.isLoading ? <p className="text-sm text-[#64748B]">{t("common.loading", "Loading…")}</p>
          : (subs.data?.length ?? 0) === 0 ? <p className="text-sm text-[#64748B]" data-testid="no-pending-subs">{t("platformAdmin.noPendingSubs", "No pending requests.")}</p>
          : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>{t("platformAdmin.garage", "Garage")}</TableHead><TableHead>{t("platformAdmin.change", "Change")}</TableHead><TableHead className="text-right">{t("providerBookings.action", "Action")}</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {subs.data!.map((s) => (
                  <TableRow key={s.id} data-testid={`sub-row-${s.id}`}>
                    <TableCell className="text-xs font-mono">{s.garageId.slice(0, 8)}…</TableCell>
                    <TableCell>{s.currentPlan ?? "—"} → <span className="font-semibold">{s.requestedPlan}</span></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" data-testid={`approve-sub-${s.id}`}
                        onClick={() => act.mutate({ url: `/api/platform-admin/subscription-requests/${s.id}/approve`, invalidate: ["/api/platform-admin/subscription-requests"] })}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"><CheckCircle className="h-3.5 w-3.5 mr-1" />{t("platformAdmin.approve", "Approve")}</Button>
                      <Button size="sm" variant="outline" data-testid={`reject-sub-${s.id}`}
                        onClick={() => act.mutate({ url: `/api/platform-admin/subscription-requests/${s.id}/reject`, invalidate: ["/api/platform-admin/subscription-requests"] })}
                        className="h-8"><XCircle className="h-3.5 w-3.5 mr-1" />{t("platformAdmin.reject", "Reject")}</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Billing tab — list every garage's subscription + allow platform admins
// to force-change the plan (bypass Stripe checkout in dev).
// ═══════════════════════════════════════════════════════════════════════

interface GarageSubscriptionRow {
  subscriptionId: string;
  garageId: string;
  garageName: string | null;
  plan: "STARTER" | "PRO" | "ENTERPRISE";
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAt: string | null;
  canceledAt: string | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
}

function PlatformBillingTab() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data = [], isLoading } = useQuery<GarageSubscriptionRow[]>({
    queryKey: ["/api/subscriptions/all"],
  });

  const planMutation = useMutation({
    mutationFn: async ({ garageId, plan }: { garageId: string; plan: string }) => {
      const res = await apiRequest("PATCH", `/api/subscriptions/${garageId}`, { plan });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/subscriptions/all"] });
      toast({ title: t("platformAdmin.planUpdated", "Plan updated") });
    },
    onError: (err: Error) =>
      toast({ title: t("providerBookings.updateFailed", "Update failed"), description: err.message, variant: "destructive" }),
  });

  const totals = data.reduce(
    (acc: Record<string, number>, row) => {
      acc[row.plan] = (acc[row.plan] ?? 0) + 1;
      return acc;
    },
    { STARTER: 0, PRO: 0, ENTERPRISE: 0 },
  );

  const planStyles: Record<string, string> = {
    STARTER: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
    PRO: "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white",
    ENTERPRISE: "bg-gradient-to-r from-[#7C5CFF] to-[#F97316] text-white",
  };
  const statusStyles: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-600",
    trialing: "bg-sky-500/15 text-sky-600",
    past_due: "bg-amber-500/15 text-amber-600",
    canceled: "bg-red-500/15 text-red-600",
    unpaid: "bg-red-500/15 text-red-600",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["STARTER", "PRO", "ENTERPRISE"] as const).map((p) => (
          <Card key={p} className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#64748B] uppercase tracking-wide">{p} {t("platformAdmin.garagesLower", "garages")}</div>
                  <div className="text-3xl font-extrabold text-[#0B1F3B] dark:text-white mt-1" data-testid={`count-${p}`}>
                    {totals[p]}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${planStyles[p]}`}>{p}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t("platformAdmin.allGarageSubs", "All garage subscriptions")}</CardTitle>
          <CardDescription className="text-[#64748B]">
            {t("platformAdmin.billingNote", "Override a garage's plan directly. In production this should require a refund flow when downgrading mid-cycle.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-[#64748B]">{t("common.loading", "Loading…")}</p>
          ) : data.length === 0 ? (
            <p className="text-[#64748B] text-sm">
              {t("platformAdmin.noSubsYet", "No subscriptions yet. Garages will appear here once they log in.")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] dark:border-[#232A36] text-left text-[#64748B]">
                    <th className="py-2 px-2 font-medium">{t("platformAdmin.garage", "Garage")}</th>
                    <th className="py-2 px-2 font-medium">{t("providerSignup.plan", "Plan")}</th>
                    <th className="py-2 px-2 font-medium">{t("common.status", "Status")}</th>
                    <th className="py-2 px-2 font-medium">{t("platformAdmin.renews", "Renews")}</th>
                    <th className="py-2 px-2 font-medium">Stripe</th>
                    <th className="py-2 px-2 font-medium">{t("platformAdmin.override", "Override")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr
                      key={row.subscriptionId}
                      className="border-b border-[#E2E8F0]/40 dark:border-[#232A36]/60"
                      data-testid={`row-${row.garageId}`}
                    >
                      <td className="py-2 px-2">
                        <div className="font-semibold text-[#0B1F3B] dark:text-white">
                          {row.garageName ?? t("platformAdmin.unnamedGarage", "Unnamed garage")}
                        </div>
                        <div className="text-xs text-[#64748B] font-mono">{row.garageId.slice(0, 8)}…</div>
                      </td>
                      <td className="py-2 px-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${planStyles[row.plan]}`}>
                          {row.plan}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                            statusStyles[row.status] ?? "bg-slate-500/15 text-slate-500"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-[#64748B]">
                        {row.currentPeriodEnd ? new Date(row.currentPeriodEnd).toLocaleDateString() : "—"}
                        {row.cancelAt && (
                          <div className="text-xs text-red-500">
                            {t("platformAdmin.cancels", "cancels")} {new Date(row.cancelAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2 text-[#64748B] text-xs font-mono">
                        {row.stripeSubscriptionId ? row.stripeSubscriptionId.slice(0, 12) + "…" : "dev mode"}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex gap-1">
                          {(["STARTER", "PRO", "ENTERPRISE"] as const).map((p) => (
                            <button
                              key={p}
                              data-testid={`set-${row.garageId}-${p}`}
                              disabled={p === row.plan || planMutation.isPending}
                              onClick={() => planMutation.mutate({ garageId: row.garageId, plan: p })}
                              className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                                p === row.plan
                                  ? "bg-[#0A5ED7]/10 text-[#0A5ED7] cursor-default"
                                  : "bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36] text-[#64748B] hover:border-[#0BB3FF]"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
