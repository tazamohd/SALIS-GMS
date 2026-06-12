import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Plus,
  Send,
  CheckCircle,
  XCircle,
  ArrowRightCircle,
  Trash2,
  TrendingUp,
  DollarSign,
  BarChart3,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  type: "labor" | "parts";
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Estimate {
  id: string;
  estimateNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehiclePlate: string;
  lineItems: LineItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  status: string;
  notes: string;
  validUntil: string;
  convertedJobCardId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EstimateStats {
  totalEstimates: number;
  conversionRate: number;
  avgValue: number;
  pendingCount: number;
  byStatus: Record<string, number>;
  funnel: { created: number; sent: number; approved: number; converted: number };
}

// ── Helpers ────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  expired: { label: "Expired", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  converted: { label: "Converted", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
};

const SAR = (v: number) => `SAR ${v.toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function emptyLineItem(): { type: "labor" | "parts"; description: string; quantity: number; unitPrice: number } {
  return { type: "parts", description: "", quantity: 1, unitPrice: 0 };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function EstimatesQuotations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Data fetching ──
  const { data: estimates = [], isLoading } = useQuery<Estimate[]>({
    queryKey: ["/api/estimates", statusFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);
      const qs = params.toString();
      const res = await fetch(`/api/estimates${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch estimates");
      return res.json();
    },
  });

  const { data: stats } = useQuery<EstimateStats>({
    queryKey: ["/api/estimates/stats"],
    queryFn: async () => {
      const res = await fetch("/api/estimates/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  // ── Mutations ──
  const statusMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      const res = await fetch(`/api/estimates/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update status");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/estimates/stats"] });
      toast({ title: "Status updated", description: "Estimate status has been updated." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create estimate");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/estimates/stats"] });
      toast({ title: "Estimate created", description: "New estimate has been created as a draft." });
      setActiveTab("all");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // ── Create form state ──
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: new Date().getFullYear(),
    vehiclePlate: "",
    vehicleVin: "",
    notes: "",
    validDays: 14,
  });
  const [lineItems, setLineItems] = useState<ReturnType<typeof emptyLineItem>[]>([emptyLineItem()]);

  const formSubtotal = useMemo(
    () => lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0),
    [lineItems]
  );
  const formVat = Math.round(formSubtotal * 0.15 * 100) / 100;
  const formTotal = Math.round((formSubtotal + formVat) * 100) / 100;

  function addLineItem() {
    setLineItems([...lineItems, emptyLineItem()]);
  }
  function removeLineItem(idx: number) {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== idx));
  }
  function updateLineItem(idx: number, field: string, value: any) {
    setLineItems(lineItems.map((li, i) => (i === idx ? { ...li, [field]: value } : li)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({ ...formData, lineItems });
    setFormData({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: new Date().getFullYear(),
      vehiclePlate: "",
      vehicleVin: "",
      notes: "",
      validDays: 14,
    });
    setLineItems([emptyLineItem()]);
  }

  function getActions(est: Estimate) {
    const actions: { label: string; action: string; icon: React.ReactNode; variant: "default" | "outline" | "destructive" }[] = [];
    switch (est.status) {
      case "draft":
        actions.push({ label: "Send", action: "send", icon: <Send className="h-3.5 w-3.5" />, variant: "default" });
        break;
      case "sent":
        actions.push({ label: "Approve", action: "approve", icon: <CheckCircle className="h-3.5 w-3.5" />, variant: "default" });
        actions.push({ label: "Reject", action: "reject", icon: <XCircle className="h-3.5 w-3.5" />, variant: "destructive" });
        break;
      case "approved":
        actions.push({ label: "Convert to Job Card", action: "convert", icon: <ArrowRightCircle className="h-3.5 w-3.5" />, variant: "default" });
        break;
      case "expired":
        actions.push({ label: "Re-send", action: "send", icon: <Send className="h-3.5 w-3.5" />, variant: "outline" });
        break;
    }
    return actions;
  }

  // ── Render ──
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white flex items-center gap-2">
            <FileText className="h-7 w-7 text-[#0A5ED7]" />
            Estimates & Quotations
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Create, send, and manage customer estimates with VAT calculations
          </p>
        </div>
        <Button onClick={() => setActiveTab("create")} className="bg-[#0A5ED7] hover:bg-[#0A5ED7]/90">
          <Plus className="h-4 w-4 mr-2" /> New Estimate
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Total Estimates</p>
              <p className="text-xl font-bold text-[#0B1F3B] dark:text-white">{stats?.totalEstimates ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Conversion Rate</p>
              <p className="text-xl font-bold text-[#0B1F3B] dark:text-white">{stats?.conversionRate ?? 0}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Average Value</p>
              <p className="text-xl font-bold text-[#0B1F3B] dark:text-white">{SAR(stats?.avgValue ?? 0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Pending (Sent)</p>
              <p className="text-xl font-bold text-[#0B1F3B] dark:text-white">{stats?.pendingCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All Estimates</TabsTrigger>
          <TabsTrigger value="create">Create Estimate</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* ── All Estimates Tab ── */}
        <TabsContent value="all" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder="Search by estimate #, customer, vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2 text-[#64748B]" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 dark:bg-slate-900">
                    <th className="text-left p-3 font-medium text-[#64748B]">Estimate #</th>
                    <th className="text-left p-3 font-medium text-[#64748B]">Customer</th>
                    <th className="text-left p-3 font-medium text-[#64748B]">Vehicle</th>
                    <th className="text-left p-3 font-medium text-[#64748B]">Date</th>
                    <th className="text-right p-3 font-medium text-[#64748B]">Total (incl. VAT)</th>
                    <th className="text-center p-3 font-medium text-[#64748B]">Status</th>
                    <th className="text-right p-3 font-medium text-[#64748B]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-[#64748B]">Loading estimates...</td>
                    </tr>
                  ) : estimates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-[#64748B]">No estimates found.</td>
                    </tr>
                  ) : (
                    estimates.map((est) => {
                      const sc = statusConfig[est.status] || statusConfig.draft;
                      const actions = getActions(est);
                      return (
                        <tr key={est.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-3">
                            <span className="font-semibold text-[#0A5ED7]">{est.estimateNumber}</span>
                          </td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-[#0B1F3B] dark:text-white">{est.customerName}</p>
                              <p className="text-xs text-[#64748B]">{est.customerPhone}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <p className="text-[#0B1F3B] dark:text-white">
                              {est.vehicleYear} {est.vehicleMake} {est.vehicleModel}
                            </p>
                            <p className="text-xs text-[#64748B]">{est.vehiclePlate}</p>
                          </td>
                          <td className="p-3 text-[#64748B]">
                            {new Date(est.createdAt).toLocaleDateString("en-GB")}
                          </td>
                          <td className="p-3 text-right font-semibold text-[#0B1F3B] dark:text-white">
                            {SAR(est.total)}
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className={`${sc.color} border-0`}>
                              {sc.label}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {actions.map((a) => (
                                <Button
                                  key={a.action}
                                  variant={a.variant}
                                  size="sm"
                                  className="h-7 text-xs gap-1"
                                  onClick={() => statusMutation.mutate({ id: est.id, action: a.action })}
                                  disabled={statusMutation.isPending}
                                >
                                  {a.icon}
                                  {a.label}
                                </Button>
                              ))}
                              {est.convertedJobCardId && (
                                <span className="text-xs text-purple-600 dark:text-purple-400 ml-1">
                                  JC: {est.convertedJobCardId}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── Create Estimate Tab ── */}
        <TabsContent value="create" className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Customer Name *</Label>
                    <Input
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="e.g., Ahmed Al-Rashidi"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        placeholder="ahmed@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        placeholder="+966 5XX XXX XXXX"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Make *</Label>
                      <Input
                        required
                        value={formData.vehicleMake}
                        onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                        placeholder="Toyota"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Input
                        value={formData.vehicleModel}
                        onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                        placeholder="Camry"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input
                        type="number"
                        value={formData.vehicleYear}
                        onChange={(e) => setFormData({ ...formData, vehicleYear: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Plate #</Label>
                      <Input
                        value={formData.vehiclePlate}
                        onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                        placeholder="ABC 1234"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>VIN</Label>
                      <Input
                        value={formData.vehicleVin}
                        onChange={(e) => setFormData({ ...formData, vehicleVin: e.target.value })}
                        placeholder="1HGBH41JXMN109186"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Line Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Line Items</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="h-4 w-4 mr-1" /> Add Row
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50 dark:bg-slate-900">
                        <th className="text-left p-2 font-medium text-[#64748B] w-[120px]">Type</th>
                        <th className="text-left p-2 font-medium text-[#64748B]">Description</th>
                        <th className="text-right p-2 font-medium text-[#64748B] w-[80px]">Qty</th>
                        <th className="text-right p-2 font-medium text-[#64748B] w-[120px]">Unit Price</th>
                        <th className="text-right p-2 font-medium text-[#64748B] w-[120px]">Line Total</th>
                        <th className="w-[50px]" />
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((li, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">
                            <Select
                              value={li.type}
                              onValueChange={(v) => updateLineItem(idx, "type", v)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="parts">Parts</SelectItem>
                                <SelectItem value="labor">Labor</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Input
                              value={li.description}
                              onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                              placeholder="Description..."
                              className="h-8 text-xs"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min={1}
                              value={li.quantity}
                              onChange={(e) => updateLineItem(idx, "quantity", Number(e.target.value))}
                              className="h-8 text-xs text-right"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              value={li.unitPrice}
                              onChange={(e) => updateLineItem(idx, "unitPrice", Number(e.target.value))}
                              className="h-8 text-xs text-right"
                            />
                          </td>
                          <td className="p-2 text-right font-medium text-[#0B1F3B] dark:text-white">
                            {SAR(li.quantity * li.unitPrice)}
                          </td>
                          <td className="p-2 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                              onClick={() => removeLineItem(idx)}
                              disabled={lineItems.length === 1}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-4 flex justify-end">
                  <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Subtotal</span>
                      <span className="font-medium text-[#0B1F3B] dark:text-white">{SAR(formSubtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">VAT (15%)</span>
                      <span className="font-medium text-[#0B1F3B] dark:text-white">{SAR(formVat)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold text-[#0B1F3B] dark:text-white">Total</span>
                      <span className="font-bold text-lg text-[#0A5ED7]">{SAR(formTotal)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes + Validity + Submit */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardContent className="p-4 space-y-2">
                  <Label>Notes</Label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes for the estimate..."
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Valid for (days)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.validDays}
                      onChange={(e) => setFormData({ ...formData, validDays: Number(e.target.value) })}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#0A5ED7] hover:bg-[#0A5ED7]/90"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Estimate"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </TabsContent>

        {/* ── Analytics Tab ── */}
        <TabsContent value="analytics" className="mt-4 space-y-6">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#0A5ED7]" /> Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.funnel ? (
                <div className="space-y-3">
                  {[
                    { label: "Created", value: stats.funnel.created, color: "bg-blue-500" },
                    { label: "Sent", value: stats.funnel.sent, color: "bg-indigo-500" },
                    { label: "Approved", value: stats.funnel.approved, color: "bg-emerald-500" },
                    { label: "Converted to Job Card", value: stats.funnel.converted, color: "bg-purple-500" },
                  ].map((step) => {
                    const pct = stats.funnel.created > 0 ? (step.value / stats.funnel.created) * 100 : 0;
                    return (
                      <div key={step.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#0B1F3B] dark:text-white font-medium">{step.label}</span>
                          <span className="text-[#64748B]">{step.value} ({Math.round(pct)}%)</span>
                        </div>
                        <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${step.color} rounded-full transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[#64748B] text-sm">Loading funnel data...</p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Avg Estimate Value */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-500" /> Average Estimate Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-4xl font-bold text-[#0A5ED7]">{SAR(stats?.avgValue ?? 0)}</p>
                  <p className="text-sm text-[#64748B] mt-2">
                    across {stats?.totalEstimates ?? 0} estimates
                  </p>
                </div>
                {stats && (
                  <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {stats.conversionRate}%
                      </p>
                      <p className="text-xs text-[#64748B]">Conversion Rate</p>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {stats.pendingCount}
                      </p>
                      <p className="text-xs text-[#64748B]">Awaiting Response</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* By Status (Pie-like) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-500" /> Estimates by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.byStatus ? (
                  <div className="space-y-3">
                    {Object.entries(stats.byStatus).map(([status, count]) => {
                      const sc = statusConfig[status] || statusConfig.draft;
                      const pct = stats.totalEstimates > 0 ? (count / stats.totalEstimates) * 100 : 0;
                      const barColor: Record<string, string> = {
                        draft: "bg-slate-400",
                        sent: "bg-blue-500",
                        approved: "bg-emerald-500",
                        rejected: "bg-red-500",
                        expired: "bg-orange-500",
                        converted: "bg-purple-500",
                      };
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <Badge variant="outline" className={`${sc.color} border-0 text-xs`}>
                                {sc.label}
                              </Badge>
                            </span>
                            <span className="text-[#64748B] font-medium">{count} ({Math.round(pct)}%)</span>
                          </div>
                          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColor[status] || "bg-slate-400"} rounded-full transition-all duration-700`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[#64748B] text-sm">Loading status data...</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
