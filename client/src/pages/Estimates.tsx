import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText, Plus, Trash2, Wrench, Send, CheckCircle, XCircle, Clock,
  DollarSign, X, ChevronDown, ChevronUp, Eye, Edit, ArrowRight,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { StandardPageLayout } from "@/components/layouts";
import { EmptyState } from "@/components/ui/empty-state";
import type { Estimate, EstimateItem, Garage, User, Vehicle } from "@shared/schema";

// --- Constants ---
const VAT_RATE = 15; // Saudi Arabia VAT

const STATUS_CONFIG: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  draft:    { color: "bg-[#64748B]/10 text-[#64748B]", icon: Clock, label: "Draft" },
  sent:     { color: "bg-[#0A5ED7]/10 text-[#0A5ED7]", icon: Send, label: "Sent" },
  approved: { color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", icon: CheckCircle, label: "Approved" },
  rejected: { color: "bg-red-500/10 text-red-600 dark:text-red-400", icon: XCircle, label: "Rejected" },
  expired:  { color: "bg-[#F97316]/10 text-[#F97316]", icon: Clock, label: "Expired" },
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft:    ["sent"],
  sent:     ["approved", "rejected"],
  approved: [],
  rejected: ["draft"],
  expired:  ["draft"],
};

// --- Types ---
interface LineItem {
  itemType: "service" | "part" | "labor";
  description: string;
  quantity: number;
  unitPrice: number;
}

interface EstimateFormData {
  title: string;
  garageId: string;
  customerId: string;
  vehicleId: string;
  validUntil: string;
  notes: string;
  items: LineItem[];
}

const emptyForm: EstimateFormData = {
  title: "",
  garageId: "",
  customerId: "",
  vehicleId: "",
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  notes: "",
  items: [],
};

const emptyLineItem: LineItem = { itemType: "service", description: "", quantity: 1, unitPrice: 0 };

// --- Helpers ---
function calcTotals(items: LineItem[]) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxAmount = subtotal * (VAT_RATE / 100);
  return { subtotal, taxAmount, total: subtotal + taxAmount };
}

function invalidateEstimates() {
  queryClient.invalidateQueries({
    predicate: (q) =>
      typeof q.queryKey[0] === "string" &&
      (q.queryKey[0] === "/api/estimates" || q.queryKey[0].startsWith("/api/estimates")),
  });
}

// ========================
// Main Page Component
// ========================
export function Estimates() {
  const { t } = useTranslation();
  const { toast } = useToast();

  // --- Filters ---
  const [selectedGarageId, setSelectedGarageId] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // --- Dialog states ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [viewingEstimate, setViewingEstimate] = useState<Estimate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Estimate | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // --- Data queries ---
  const estimateUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedGarageId !== "all") params.append("garage_id", selectedGarageId);
    if (statusFilter !== "all") params.append("status", statusFilter);
    const qs = params.toString();
    return `/api/estimates${qs ? `?${qs}` : ""}`;
  }, [selectedGarageId, statusFilter]);

  const { data: estimates = [], isLoading } = useQuery<Estimate[]>({ queryKey: [estimateUrl] });
  const { data: garages = [] } = useQuery<Garage[]>({ queryKey: ["/api/garages"] });
  const { data: customers = [] } = useQuery<User[]>({ queryKey: ["/api/customers"] });
  const { data: vehicles = [] } = useQuery<Vehicle[]>({ queryKey: ["/api/vehicles"] });

  // --- Filtered + searched ---
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return estimates;
    const q = searchQuery.toLowerCase();
    return estimates.filter(
      (e) =>
        e.estimateNumber?.toLowerCase().includes(q) ||
        e.title?.toLowerCase().includes(q) ||
        customers.find((c) => c.id === e.customerId)?.fullName?.toLowerCase().includes(q),
    );
  }, [estimates, searchQuery, customers]);

  // --- Summary stats ---
  const stats = useMemo(() => {
    const all = estimates;
    const draft = all.filter((e) => e.status === "draft").length;
    const sent = all.filter((e) => e.status === "sent").length;
    const approved = all.filter((e) => e.status === "approved").length;
    const totalValue = all.reduce((s, e) => s + parseFloat(e.totalAmount || "0"), 0);
    return { total: all.length, draft, sent, approved, totalValue };
  }, [estimates]);

  // --- Mutations ---
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/estimates/${id}`, {
        status,
        sentAt: status === "sent" ? new Date() : undefined,
        approvedAt: status === "approved" ? new Date() : undefined,
        rejectedAt: status === "rejected" ? new Date() : undefined,
      });
    },
    onSuccess: () => {
      invalidateEstimates();
      toast({ title: "Success", description: "Estimate status updated" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update status", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/estimates/${id}`),
    onSuccess: () => {
      invalidateEstimates();
      toast({ title: "Success", description: "Estimate deleted" });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to delete", variant: "destructive" });
    },
  });

  const convertToJobCardMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("POST", `/api/estimates/${id}/convert-to-job-card`),
    onSuccess: () => {
      invalidateEstimates();
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
      toast({ title: "Success", description: "Estimate converted to job card" });
      setViewingEstimate(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to convert", variant: "destructive" });
    },
  });

  const convertToInvoiceMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("POST", `/api/estimates/${id}/convert-to-invoice`),
    onSuccess: () => {
      invalidateEstimates();
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Success", description: "Estimate converted to invoice" });
      setViewingEstimate(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to convert", variant: "destructive" });
    },
  });

  // --- Render helpers ---
  const customerName = (id: string) => customers.find((c) => c.id === id)?.fullName || "Unknown";

  return (
    <StandardPageLayout
      title={t("nav.estimates", "Estimates & Quotes")}
      description={t("estimates.description", "Create and manage customer estimates")}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0A5ED7]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#0A5ED7]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{stats.total}</p>
              <p className="text-xs text-[#64748B]">Total Estimates</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#64748B]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#64748B]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{stats.draft}</p>
              <p className="text-xs text-[#64748B]">Drafts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{stats.approved}</p>
              <p className="text-xs text-[#64748B]">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F97316]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#F97316]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
                SAR {stats.totalValue.toLocaleString("en", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-[#64748B]">Total Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder={t("estimates.searchPlaceholder", "Search estimates...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
          <SelectTrigger className="sm:max-w-[180px]">
            <SelectValue placeholder="All Garages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Garages</SelectItem>
            {garages.map((g) => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:max-w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
          data-testid="button-create-estimate"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("estimates.createEstimate", "Create Estimate")}
        </Button>
      </div>

      {/* Estimate List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 h-20" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t("estimates.noEstimates", "No Estimates")}
          description={t("estimates.noEstimatesDescription", "Create your first estimate to start quoting customers")}
          actionLabel="Create Estimate"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((estimate) => (
            <EstimateRow
              key={estimate.id}
              estimate={estimate}
              customerName={customerName(estimate.customerId)}
              expanded={expandedId === estimate.id}
              onToggleExpand={() => setExpandedId(expandedId === estimate.id ? null : estimate.id)}
              onView={() => setViewingEstimate(estimate)}
              onEdit={() => setEditingEstimate(estimate)}
              onDelete={() => setDeleteTarget(estimate)}
              onStatusChange={(status) => updateStatusMutation.mutate({ id: estimate.id, status })}
              onConvertJobCard={() => convertToJobCardMutation.mutate(estimate.id)}
              onConvertInvoice={() => convertToInvoiceMutation.mutate(estimate.id)}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <EstimateFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        garages={garages}
        customers={customers}
        vehicles={vehicles}
        toast={toast}
      />

      {/* Edit Dialog */}
      {editingEstimate && (
        <EstimateFormDialog
          open={!!editingEstimate}
          onOpenChange={(open) => { if (!open) setEditingEstimate(null); }}
          garages={garages}
          customers={customers}
          vehicles={vehicles}
          toast={toast}
          existing={editingEstimate}
        />
      )}

      {/* View Details Dialog */}
      {viewingEstimate && (
        <EstimateViewDialog
          estimate={viewingEstimate}
          open={!!viewingEstimate}
          onOpenChange={(open) => { if (!open) setViewingEstimate(null); }}
          customerName={customerName(viewingEstimate.customerId)}
          onStatusChange={(status) => updateStatusMutation.mutate({ id: viewingEstimate.id, status })}
          onConvertJobCard={() => convertToJobCardMutation.mutate(viewingEstimate.id)}
          onConvertInvoice={() => convertToInvoiceMutation.mutate(viewingEstimate.id)}
          onDelete={() => { setDeleteTarget(viewingEstimate); setViewingEstimate(null); }}
          onEdit={() => { setEditingEstimate(viewingEstimate); setViewingEstimate(null); }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete estimate <strong>{deleteTarget?.estimateNumber}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StandardPageLayout>
  );
}

// ========================
// Estimate Row (with expand)
// ========================
function EstimateRow({
  estimate,
  customerName,
  expanded,
  onToggleExpand,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onConvertJobCard,
  onConvertInvoice,
}: {
  estimate: Estimate;
  customerName: string;
  expanded: boolean;
  onToggleExpand: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
  onConvertJobCard: () => void;
  onConvertInvoice: () => void;
}) {
  const cfg = STATUS_CONFIG[estimate.status] || STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  const transitions = STATUS_TRANSITIONS[estimate.status] || [];
  const isApproved = estimate.status === "approved";
  const canConvert = isApproved && !estimate.convertedToJobCardId && !estimate.convertedToInvoiceId;

  // Fetch items only when expanded
  const { data: items = [] } = useQuery<EstimateItem[]>({
    queryKey: [`/api/estimates/${estimate.id}/items`],
    enabled: expanded,
  });

  return (
    <Card className="overflow-hidden" data-testid={`estimate-row-${estimate.id}`}>
      <CardContent className="p-0">
        {/* Main row */}
        <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={onToggleExpand}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-[#0B1F3B] dark:text-white truncate" data-testid={`text-estimate-number-${estimate.id}`}>
                {estimate.estimateNumber}
              </p>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                <Icon className="w-3 h-3" />
                {cfg.label}
              </span>
            </div>
            <p className="text-xs text-[#64748B] truncate" data-testid={`text-customer-${estimate.id}`}>
              {customerName} {estimate.title ? `- ${estimate.title}` : ""}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-sm text-[#0B1F3B] dark:text-white" data-testid={`text-amount-${estimate.id}`}>
              SAR {parseFloat(estimate.totalAmount || "0").toLocaleString("en", { minimumFractionDigits: 2 })}
            </p>
            {estimate.validUntil && (
              <p className="text-xs text-[#64748B]">
                Valid until {new Date(estimate.validUntil).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView(); }} data-testid={`button-view-${estimate.id}`}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(); }} data-testid={`button-edit-${estimate.id}`}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-500 hover:text-red-700" data-testid={`button-delete-${estimate.id}`}>
              <Trash2 className="w-4 h-4" />
            </Button>
            {expanded ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
          </div>
        </div>

        {/* Expanded line items */}
        {expanded && (
          <div className="border-t bg-muted/30 p-4 space-y-3">
            {items.length > 0 ? (
              <>
                <div className="grid grid-cols-[1fr,auto,auto,auto] gap-2 text-xs font-medium text-[#64748B] px-2">
                  <span>Description</span>
                  <span className="text-right w-16">Qty</span>
                  <span className="text-right w-24">Unit Price</span>
                  <span className="text-right w-24">Total</span>
                </div>
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1fr,auto,auto,auto] gap-2 items-center px-2 py-1.5 rounded bg-background" data-testid={`estimate-item-${item.id}`}>
                    <div>
                      <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">{item.description}</p>
                      <p className="text-xs text-[#64748B] capitalize">{item.itemType}</p>
                    </div>
                    <span className="text-sm text-right w-16">{item.quantity}</span>
                    <span className="text-sm text-right w-24">SAR {parseFloat(item.unitPrice).toFixed(2)}</span>
                    <span className="text-sm font-medium text-right w-24">SAR {parseFloat(item.lineTotal).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 space-y-1 px-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Subtotal</span>
                    <span className="font-medium">SAR {parseFloat(estimate.subtotal || "0").toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">VAT ({VAT_RATE}%)</span>
                    <span className="font-medium">SAR {parseFloat(estimate.taxAmount || "0").toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-1">
                    <span>Total</span>
                    <span>SAR {parseFloat(estimate.totalAmount || "0").toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-[#64748B] text-center py-2">No line items</p>
            )}

            {/* Action buttons row */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {transitions.map((nextStatus) => (
                <Button
                  key={nextStatus}
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusChange(nextStatus)}
                >
                  <ArrowRight className="w-3 h-3 mr-1" />
                  Mark as {STATUS_CONFIG[nextStatus]?.label || nextStatus}
                </Button>
              ))}
              {canConvert && (
                <>
                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={onConvertJobCard} data-testid={`button-convert-jobcard-${estimate.id}`}>
                    <Wrench className="w-3 h-3 mr-1" />
                    Convert to Job Card
                  </Button>
                  <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={onConvertInvoice} data-testid={`button-convert-invoice-${estimate.id}`}>
                    <FileText className="w-3 h-3 mr-1" />
                    Convert to Invoice
                  </Button>
                </>
              )}
              {estimate.convertedToJobCardId && (
                <Badge variant="outline" className="text-blue-600">Converted to Job Card</Badge>
              )}
              {estimate.convertedToInvoiceId && (
                <Badge variant="outline" className="text-emerald-600">Converted to Invoice</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========================
// Create / Edit Dialog
// ========================
function EstimateFormDialog({
  open,
  onOpenChange,
  garages,
  customers,
  vehicles,
  toast,
  existing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  garages: Garage[];
  customers: User[];
  vehicles: Vehicle[];
  toast: ReturnType<typeof useToast>["toast"];
  existing?: Estimate | null;
}) {
  const isEdit = !!existing;
  const [form, setForm] = useState<EstimateFormData>(emptyForm);
  const [currentItem, setCurrentItem] = useState<LineItem>({ ...emptyLineItem });

  // Load existing items for edit mode
  const { data: existingItems } = useQuery<EstimateItem[]>({
    queryKey: [`/api/estimates/${existing?.id}/items`],
    enabled: isEdit && open,
  });

  useEffect(() => {
    if (isEdit && existing) {
      setForm({
        title: existing.title || "",
        garageId: existing.garageId || "",
        customerId: existing.customerId || "",
        vehicleId: existing.vehicleId || "",
        validUntil: existing.validUntil ? new Date(existing.validUntil).toISOString().split("T")[0] : "",
        notes: existing.notes || "",
        items: [],
      });
    } else if (!isEdit) {
      setForm(emptyForm);
    }
  }, [existing, isEdit, open]);

  useEffect(() => {
    if (existingItems && existingItems.length > 0) {
      setForm((prev) => ({
        ...prev,
        items: existingItems.map((it) => ({
          itemType: (it.itemType as LineItem["itemType"]) || "service",
          description: it.description as string,
          quantity: Number(it.quantity),
          unitPrice: parseFloat(String(it.unitPrice)),
        })),
      }));
    }
  }, [existingItems]);

  const customerVehicles = vehicles.filter((v) => v.customerId === form.customerId);
  const { subtotal, taxAmount, total } = calcTotals(form.items);

  const addItem = () => {
    if (!currentItem.description.trim() || currentItem.quantity < 1 || currentItem.unitPrice < 0) {
      toast({ title: "Invalid Item", description: "Fill in description, quantity, and price", variant: "destructive" });
      return;
    }
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...currentItem }] }));
    setCurrentItem({ ...emptyLineItem });
  };

  const removeItem = (idx: number) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const itemsPayload = form.items.map((item) => ({
        itemType: item.itemType,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        lineTotal: (item.quantity * item.unitPrice).toString(),
        taxRate: VAT_RATE.toString(),
        taxAmount: ((item.quantity * item.unitPrice) * (VAT_RATE / 100)).toString(),
      }));

      const estimatePayload = {
        title: form.title,
        garageId: form.garageId,
        customerId: form.customerId,
        vehicleId: form.vehicleId || undefined,
        validUntil: form.validUntil ? new Date(form.validUntil) : undefined,
        notes: form.notes || undefined,
        status: "draft",
        subtotal: subtotal.toFixed(2),
        taxRate: VAT_RATE.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        discountAmount: "0.00",
        totalAmount: total.toFixed(2),
      };

      return apiRequest("POST", "/api/estimates/with-items", {
        estimate: estimatePayload,
        items: itemsPayload,
      });
    },
    onSuccess: () => {
      invalidateEstimates();
      toast({ title: "Success", description: "Estimate created successfully" });
      setForm(emptyForm);
      setCurrentItem({ ...emptyLineItem });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to create estimate", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/estimates/${existing!.id}`, {
        title: form.title,
        garageId: form.garageId,
        customerId: form.customerId,
        vehicleId: form.vehicleId || null,
        validUntil: form.validUntil ? new Date(form.validUntil) : null,
        notes: form.notes || null,
        subtotal: subtotal.toFixed(2),
        taxRate: VAT_RATE.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        discountAmount: "0.00",
        totalAmount: total.toFixed(2),
      });
    },
    onSuccess: () => {
      invalidateEstimates();
      toast({ title: "Success", description: "Estimate updated successfully" });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update estimate", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast({ title: "Validation Error", description: "Title is required", variant: "destructive" });
      return;
    }
    if (!form.garageId) {
      toast({ title: "Validation Error", description: "Garage is required", variant: "destructive" });
      return;
    }
    if (!form.customerId) {
      toast({ title: "Validation Error", description: "Customer is required", variant: "destructive" });
      return;
    }
    if (form.items.length === 0) {
      toast({ title: "No Items", description: "Add at least one line item", variant: "destructive" });
      return;
    }
    if (isEdit) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-semibold text-xl">
            {isEdit ? "Edit Estimate" : "Create New Estimate"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEdit ? "Edit estimate details and line items" : "Create a new estimate with line items and pricing"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="est-title">Estimate Title</Label>
            <Input
              id="est-title"
              placeholder="e.g., Brake Service Estimate"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              data-testid="input-title"
            />
          </div>

          {/* Garage + Customer + Vehicle + Valid Until */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Garage</Label>
              <Select value={form.garageId} onValueChange={(v) => setForm({ ...form, garageId: v })}>
                <SelectTrigger data-testid="select-garage"><SelectValue placeholder="Select garage" /></SelectTrigger>
                <SelectContent>
                  {garages.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Customer</Label>
              <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v, vehicleId: "" })}>
                <SelectTrigger data-testid="select-customer"><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vehicle (Optional)</Label>
              <Select
                value={form.vehicleId || "none"}
                onValueChange={(v) => setForm({ ...form, vehicleId: v === "none" ? "" : v })}
                disabled={!form.customerId}
              >
                <SelectTrigger data-testid="select-vehicle">
                  <SelectValue placeholder={form.customerId ? "Select vehicle" : "Select customer first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No vehicle</SelectItem>
                  {customerVehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.licensePlate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valid Until</Label>
              <Input
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                data-testid="input-valid-until"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Additional notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              data-testid="input-notes"
            />
          </div>

          {/* Line Items */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-3">Line Items</h3>

            {/* Add item row */}
            <div className="grid grid-cols-[120px,1fr,80px,100px,auto] gap-2 mb-3">
              <Select
                value={currentItem.itemType}
                onValueChange={(v: any) => setCurrentItem({ ...currentItem, itemType: v })}
              >
                <SelectTrigger data-testid="select-item-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="part">Part</SelectItem>
                  <SelectItem value="labor">Labor</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Description"
                value={currentItem.description}
                onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                data-testid="input-item-description"
              />
              <Input
                type="number"
                placeholder="Qty"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 0 })}
                min={1}
                data-testid="input-item-quantity"
              />
              <Input
                type="number"
                placeholder="Price"
                value={currentItem.unitPrice}
                onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: parseFloat(e.target.value) || 0 })}
                min={0}
                step="0.01"
                data-testid="input-item-price"
              />
              <Button type="button" onClick={addItem} size="sm" data-testid="button-add-item">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Items list */}
            {form.items.length > 0 && (
              <div className="space-y-2">
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg" data-testid={`item-${idx}`}>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.description}</p>
                      <p className="text-xs text-[#64748B] capitalize">
                        {item.itemType} &middot; Qty: {item.quantity} &middot; SAR {item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-sm">SAR {(item.quantity * item.unitPrice).toFixed(2)}</p>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(idx)} data-testid={`button-remove-item-${idx}`}>
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            {form.items.length > 0 && (
              <div className="mt-4 pt-3 border-t space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">Subtotal</span>
                  <span className="font-medium" data-testid="text-subtotal">SAR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">VAT ({VAT_RATE}%)</span>
                  <span className="font-medium" data-testid="text-tax">SAR {taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t pt-1.5">
                  <span>Total</span>
                  <span data-testid="text-total">SAR {total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-[#0A5ED7] hover:bg-[#0A5ED7]/90"
            data-testid="button-submit"
          >
            {isPending ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Estimate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ========================
// View Details Dialog
// ========================
function EstimateViewDialog({
  estimate,
  open,
  onOpenChange,
  customerName,
  onStatusChange,
  onConvertJobCard,
  onConvertInvoice,
  onDelete,
  onEdit,
}: {
  estimate: Estimate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  onStatusChange: (status: string) => void;
  onConvertJobCard: () => void;
  onConvertInvoice: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const { data: items = [] } = useQuery<EstimateItem[]>({
    queryKey: [`/api/estimates/${estimate.id}/items`],
    enabled: open,
  });

  const cfg = STATUS_CONFIG[estimate.status] || STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  const transitions = STATUS_TRANSITIONS[estimate.status] || [];
  const canConvert = estimate.status === "approved" && !estimate.convertedToJobCardId && !estimate.convertedToInvoiceId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Estimate {estimate.estimateNumber}</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
              <Icon className="w-3 h-3" />
              {cfg.label}
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            View estimate details, line items, and manage status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-[#64748B] mb-0.5">Title</p>
              <p className="font-medium text-sm" data-testid="text-estimate-title">{estimate.title}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B] mb-0.5">Customer</p>
              <p className="font-medium text-sm" data-testid="text-customer-name">{customerName}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B] mb-0.5">Valid Until</p>
              <p className="font-medium text-sm" data-testid="text-valid-until">
                {estimate.validUntil ? new Date(estimate.validUntil).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#64748B] mb-0.5">Created</p>
              <p className="font-medium text-sm">
                {estimate.createdAt ? new Date(estimate.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

          {estimate.notes && (
            <div>
              <p className="text-xs text-[#64748B] mb-1">Notes</p>
              <p className="text-sm" data-testid="text-estimate-notes">{estimate.notes}</p>
            </div>
          )}

          {/* Line items table */}
          <div>
            <h3 className="font-semibold mb-3">Line Items</h3>
            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg" data-testid={`estimate-item-${item.id}`}>
                    <div className="flex-1">
                      <p className="font-medium text-sm" data-testid={`item-description-${item.id}`}>{item.description}</p>
                      <p className="text-xs text-[#64748B] capitalize">
                        {item.itemType} &middot; Qty: {item.quantity} &middot; SAR {parseFloat(item.unitPrice).toFixed(2)} each
                      </p>
                    </div>
                    <p className="font-semibold text-sm" data-testid={`item-total-${item.id}`}>
                      SAR {parseFloat(item.lineTotal).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#64748B] text-center py-4">No items</p>
            )}
          </div>

          {/* Totals */}
          <div className="border-t pt-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-[#64748B]">Subtotal</span>
              <span className="font-medium" data-testid="text-estimate-subtotal">SAR {parseFloat(estimate.subtotal || "0").toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#64748B]">VAT ({parseFloat(estimate.taxRate || "0").toFixed(0)}%)</span>
              <span className="font-medium" data-testid="text-estimate-tax">SAR {parseFloat(estimate.taxAmount || "0").toFixed(2)}</span>
            </div>
            {parseFloat(estimate.discountAmount || "0") > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Discount</span>
                <span className="font-medium" data-testid="text-estimate-discount">-SAR {parseFloat(estimate.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t pt-1.5">
              <span>Total</span>
              <span data-testid="text-estimate-total">SAR {parseFloat(estimate.totalAmount || "0").toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            {transitions.map((nextStatus) => (
              <Button
                key={nextStatus}
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(nextStatus)}
              >
                <ArrowRight className="w-3 h-3 mr-1" />
                Mark as {STATUS_CONFIG[nextStatus]?.label || nextStatus}
              </Button>
            ))}
            {canConvert && (
              <>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={onConvertJobCard} data-testid="button-convert-to-job-card">
                  <Wrench className="w-4 h-4 mr-1" />
                  Convert to Job Card
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onConvertInvoice} data-testid="button-convert-to-invoice">
                  <FileText className="w-4 h-4 mr-1" />
                  Convert to Invoice
                </Button>
              </>
            )}
            {estimate.convertedToJobCardId && (
              <Badge variant="outline" className="text-blue-600">Converted to Job Card</Badge>
            )}
            {estimate.convertedToInvoiceId && (
              <Badge variant="outline" className="text-emerald-600">Converted to Invoice</Badge>
            )}
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={onEdit} data-testid="button-edit-estimate">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete} data-testid="button-delete-estimate">
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
