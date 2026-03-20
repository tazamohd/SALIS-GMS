import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { TabsPageLayout } from "@/components/layouts";
import {
  ShieldCheck,
  FileText,
  Plus,
  ClipboardList,
  BarChart3,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Contract {
  id: number;
  customerId: number;
  customerName: string;
  vehicleId: number;
  vehicleName: string;
  licensePlate: string;
  planType: "Basic" | "Standard" | "Premium";
  coverageType: string;
  coverageAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  monthlyPremium: number;
  claimsCount: number;
  createdAt: string;
}

interface Claim {
  id: number;
  claimNumber: string;
  contractId: number;
  contractRef: string;
  customerId: number;
  customerName: string;
  jobCardId: number | null;
  description: string;
  amount: number;
  status: string;
  submittedAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  notes: string;
}

interface Stats {
  activeContracts: number;
  totalContracts: number;
  claimsThisMonth: number;
  approvalRate: number;
  monthlyRevenue: number;
  avgClaimValue: number;
  totalClaims: number;
  claimsByMonth: { month: string; count: number; amount: number }[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const statusBadge = (status: string) => {
  const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    active: { variant: "default", label: "Active" },
    expired: { variant: "secondary", label: "Expired" },
    cancelled: { variant: "destructive", label: "Cancelled" },
    pending: { variant: "outline", label: "Pending" },
    approved: { variant: "default", label: "Approved" },
    rejected: { variant: "destructive", label: "Rejected" },
    completed: { variant: "secondary", label: "Completed" },
  };
  const cfg = map[status] || { variant: "outline" as const, label: status };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};

const planBadge = (plan: string) => {
  const colors: Record<string, string> = {
    Basic: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    Standard: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    Premium: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[plan] || ""}`}>
      {plan}
    </span>
  );
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const currency = (n: number) =>
  new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(n);

// ---------------------------------------------------------------------------
// Active Contracts Tab
// ---------------------------------------------------------------------------
function ActiveContractsTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data } = useQuery<{ contracts: Contract[] }>({
    queryKey: ["/api/warranty/contracts", statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/warranty/contracts?${params}`);
      if (!res.ok) throw new Error("Failed to fetch contracts");
      return res.json();
    },
  });
  const contracts = data?.contracts ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer, vehicle, plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium">Customer</th>
                  <th className="px-4 py-3 text-left font-medium">Vehicle</th>
                  <th className="px-4 py-3 text-left font-medium">Plan</th>
                  <th className="px-4 py-3 text-left font-medium">Coverage Period</th>
                  <th className="px-4 py-3 text-left font-medium">Amount</th>
                  <th className="px-4 py-3 text-center font-medium">Claims</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No contracts found
                    </td>
                  </tr>
                ) : (
                  contracts.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{c.customerName}</td>
                      <td className="px-4 py-3">
                        <div>{c.vehicleName}</div>
                        <div className="text-xs text-muted-foreground">{c.licensePlate}</div>
                      </td>
                      <td className="px-4 py-3">{planBadge(c.planType)}</td>
                      <td className="px-4 py-3 text-xs">
                        {fmt(c.startDate)} — {fmt(c.endDate)}
                      </td>
                      <td className="px-4 py-3">{currency(c.coverageAmount)}</td>
                      <td className="px-4 py-3 text-center">{c.claimsCount}</td>
                      <td className="px-4 py-3 text-center">{statusBadge(c.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Claims Tab
// ---------------------------------------------------------------------------
function ClaimsTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data } = useQuery<{ claims: Claim[] }>({
    queryKey: ["/api/warranty/claims", statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/warranty/claims?${params}`);
      if (!res.ok) throw new Error("Failed to fetch claims");
      return res.json();
    },
  });
  const claimsList = data?.claims ?? [];

  const updateClaim = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/warranty/claims/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resolvedBy: "Current User" }),
      });
      if (!res.ok) throw new Error("Failed to update claim");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranty/claims"] });
      queryClient.invalidateQueries({ queryKey: ["/api/warranty/stats"] });
      toast({ title: "Claim updated successfully" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search claims..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium">Claim #</th>
                  <th className="px-4 py-3 text-left font-medium">Contract Ref</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {claimsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No claims found
                    </td>
                  </tr>
                ) : (
                  claimsList.map((cl) => (
                    <tr key={cl.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium">{cl.claimNumber}</td>
                      <td className="px-4 py-3 text-xs">{cl.contractRef}</td>
                      <td className="px-4 py-3 max-w-[260px] truncate">{cl.description}</td>
                      <td className="px-4 py-3 text-right font-medium">{currency(cl.amount)}</td>
                      <td className="px-4 py-3 text-center">{statusBadge(cl.status)}</td>
                      <td className="px-4 py-3 text-xs">{fmt(cl.submittedAt)}</td>
                      <td className="px-4 py-3 text-center">
                        {cl.status === "pending" && (
                          <div className="flex gap-1 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => updateClaim.mutate({ id: cl.id, status: "approved" })}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => updateClaim.mutate({ id: cl.id, status: "rejected" })}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {cl.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => updateClaim.mutate({ id: cl.id, status: "completed" })}
                          >
                            Complete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// New Contract Tab
// ---------------------------------------------------------------------------
function NewContractTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    customerName: "",
    vehicleName: "",
    licensePlate: "",
    planType: "Standard" as "Basic" | "Standard" | "Premium",
    coverageAmount: 15000,
    monthlyPremium: 300,
    startDate: new Date().toISOString().slice(0, 10),
    durationMonths: "12",
  });

  const premiums: Record<string, number> = { Basic: 150, Standard: 300, Premium: 450 };
  const coverages: Record<string, number> = { Basic: 8000, Standard: 15000, Premium: 25000 };

  const endDate = (() => {
    const d = new Date(form.startDate);
    d.setMonth(d.getMonth() + parseInt(form.durationMonths));
    return d.toISOString().slice(0, 10);
  })();

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/warranty/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          vehicleName: form.vehicleName,
          licensePlate: form.licensePlate,
          planType: form.planType,
          coverageType:
            form.planType === "Premium"
              ? "Full Coverage"
              : form.planType === "Standard"
              ? "Powertrain"
              : "Engine & Transmission",
          coverageAmount: form.coverageAmount,
          monthlyPremium: form.monthlyPremium,
          startDate: form.startDate,
          endDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to create contract");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranty/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/warranty/stats"] });
      toast({ title: "Contract created successfully" });
      setForm({
        customerName: "",
        vehicleName: "",
        licensePlate: "",
        planType: "Standard",
        coverageAmount: 15000,
        monthlyPremium: 300,
        startDate: new Date().toISOString().slice(0, 10),
        durationMonths: "12",
      });
    },
  });

  const handlePlanChange = (plan: string) => {
    const p = plan as "Basic" | "Standard" | "Premium";
    setForm((prev) => ({
      ...prev,
      planType: p,
      monthlyPremium: premiums[p],
      coverageAmount: coverages[p],
    }));
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Create New Warranty / Service Contract</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                required
                placeholder="e.g. Ahmed Al-Rashidi"
                value={form.customerName}
                onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Vehicle</Label>
              <Input
                required
                placeholder="e.g. 2024 Toyota Camry"
                value={form.vehicleName}
                onChange={(e) => setForm((p) => ({ ...p, vehicleName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>License Plate</Label>
              <Input
                placeholder="e.g. ABC 1234"
                value={form.licensePlate}
                onChange={(e) => setForm((p) => ({ ...p, licensePlate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Plan Type</Label>
              <Select value={form.planType} onValueChange={handlePlanChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic — Engine & Transmission</SelectItem>
                  <SelectItem value="Standard">Standard — Powertrain</SelectItem>
                  <SelectItem value="Premium">Premium — Full Coverage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={form.durationMonths} onValueChange={(v) => setForm((p) => ({ ...p, durationMonths: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                  <SelectItem value="18">18 Months</SelectItem>
                  <SelectItem value="24">24 Months</SelectItem>
                  <SelectItem value="36">36 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Coverage Amount (SAR)</Label>
              <Input
                type="number"
                value={form.coverageAmount}
                onChange={(e) => setForm((p) => ({ ...p, coverageAmount: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Monthly Premium (SAR)</Label>
              <Input
                type="number"
                value={form.monthlyPremium}
                onChange={(e) => setForm((p) => ({ ...p, monthlyPremium: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="rounded-lg border p-4 bg-muted/30 text-sm space-y-1">
            <p><span className="font-medium">End Date:</span> {fmt(endDate)}</p>
            <p><span className="font-medium">Total Contract Value:</span> {currency(form.monthlyPremium * parseInt(form.durationMonths))}</p>
          </div>

          <Button type="submit" disabled={create.isPending} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            {create.isPending ? "Creating..." : "Create Contract"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Analytics Tab
// ---------------------------------------------------------------------------
function AnalyticsTab() {
  const { data } = useQuery<Stats>({
    queryKey: ["/api/warranty/stats"],
    queryFn: async () => {
      const res = await fetch("/api/warranty/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  if (!data) {
    return <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>;
  }

  const maxAmount = Math.max(...data.claimsByMonth.map((m) => m.amount), 1);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Contracts</p>
                <p className="text-2xl font-bold">{data.activeContracts}</p>
                <p className="text-xs text-muted-foreground mt-1">of {data.totalContracts} total</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">{currency(data.monthlyRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">from active premiums</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Claims Rate</p>
                <p className="text-2xl font-bold">{data.approvalRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">{data.claimsThisMonth} this month</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Claim Value</p>
                <p className="text-2xl font-bold">{currency(data.avgClaimValue)}</p>
                <p className="text-xs text-muted-foreground mt-1">{data.totalClaims} total claims</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims by month bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Claims by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.claimsByMonth.map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="w-16 text-sm text-muted-foreground shrink-0">{m.month}</span>
                <div className="flex-1 h-8 bg-muted/30 rounded-md overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-md transition-all duration-500"
                    style={{ width: `${Math.max((m.amount / maxAmount) * 100, 2)}%` }}
                  />
                  <span className="absolute inset-0 flex items-center px-3 text-xs font-medium">
                    {m.count} claim{m.count !== 1 ? "s" : ""} — {currency(m.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Submit Claim Dialog (accessible from the main page)
// ---------------------------------------------------------------------------
function SubmitClaimDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ contractId: "", description: "", amount: "", jobCardId: "", notes: "" });

  const { data: contractsData } = useQuery<{ contracts: Contract[] }>({
    queryKey: ["/api/warranty/contracts", "active"],
    queryFn: async () => {
      const res = await fetch("/api/warranty/contracts?status=active");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: open,
  });

  const submit = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/warranty/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: parseInt(form.contractId),
          description: form.description,
          amount: parseFloat(form.amount),
          jobCardId: form.jobCardId ? parseInt(form.jobCardId) : null,
          notes: form.notes,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit claim");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranty/claims"] });
      queryClient.invalidateQueries({ queryKey: ["/api/warranty/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/warranty/contracts"] });
      toast({ title: "Warranty claim submitted" });
      setForm({ contractId: "", description: "", amount: "", jobCardId: "", notes: "" });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Warranty Claim</DialogTitle>
          <DialogDescription>Create a new claim linked to an active service contract.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit.mutate();
          }}
        >
          <div className="space-y-2">
            <Label>Contract</Label>
            <Select value={form.contractId} onValueChange={(v) => setForm((p) => ({ ...p, contractId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select contract" />
              </SelectTrigger>
              <SelectContent>
                {(contractsData?.contracts ?? []).map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.customerName} — {c.vehicleName} ({c.planType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              required
              placeholder="Describe the issue..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Claim Amount (SAR)</Label>
              <Input
                type="number"
                required
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Job Card ID (optional)</Label>
              <Input
                type="number"
                placeholder="e.g. 1001"
                value={form.jobCardId}
                onChange={(e) => setForm((p) => ({ ...p, jobCardId: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              placeholder="Additional notes..."
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submit.isPending}>
              {submit.isPending ? "Submitting..." : "Submit Claim"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function WarrantyContracts() {
  const [activeTab, setActiveTab] = useState("contracts");
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);

  return (
    <>
      <TabsPageLayout
        title="Warranty & Service Contracts"
        description="Manage warranty plans, service contracts, and process claims"
        icon={ShieldCheck}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        primaryAction={{
          label: "Submit Claim",
          icon: Plus,
          onClick: () => setClaimDialogOpen(true),
        }}
        tabs={[
          {
            id: "contracts",
            label: "Active Contracts",
            icon: FileText,
            content: <ActiveContractsTab />,
          },
          {
            id: "claims",
            label: "Claims",
            icon: ClipboardList,
            content: <ClaimsTab />,
          },
          {
            id: "new-contract",
            label: "New Contract",
            icon: Plus,
            content: <NewContractTab />,
          },
          {
            id: "analytics",
            label: "Analytics",
            icon: BarChart3,
            content: <AnalyticsTab />,
          },
        ]}
      />
      <SubmitClaimDialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen} />
    </>
  );
}
