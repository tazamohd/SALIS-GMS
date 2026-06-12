import { useState, useEffect, useMemo } from "react";
import {
  FileText, Plus, Trash2, Eye, Edit, X, ChevronDown, ChevronUp,
  Send, CheckCircle, Clock, AlertTriangle, Ban,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StandardPageLayout } from "@/components/layouts";
import { EmptyState } from "@/components/ui/empty-state";
import type { Invoice, InvoiceItem, Garage, User } from "@shared/schema";

// ---------- Constants ----------

const VAT_RATE = 15;

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  draft:     { label: "Draft",     color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",              icon: Clock },
  sent:      { label: "Sent",      color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",              icon: Send },
  paid:      { label: "Paid",      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",  icon: CheckCircle },
  overdue:   { label: "Overdue",   color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",                  icon: AlertTriangle },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",              icon: Ban },
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft:     ["sent", "cancelled"],
  sent:      ["paid", "overdue", "cancelled"],
  overdue:   ["paid", "cancelled"],
  paid:      [],
  cancelled: [],
};

// ---------- Types ----------

interface LineItemInput {
  itemType: "service" | "part" | "labor";
  description: string;
  quantity: number;
  unitPrice: number;
}

// ---------- Helpers ----------

function invalidateInvoices() {
  queryClient.invalidateQueries({
    predicate: (q) =>
      typeof q.queryKey[0] === "string" &&
      (q.queryKey[0] as string).startsWith("/api/invoices"),
  });
}

function calcTotals(items: LineItemInput[]) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = subtotal * (VAT_RATE / 100);
  return { subtotal, tax, total: subtotal + tax };
}

function formatSAR(n: number | string) {
  const v = typeof n === "string" ? parseFloat(n) : n;
  return `SAR ${v.toFixed(2)}`;
}

// ---------- Sub-components ----------

function StatusBadgeInline({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`${cfg.color} gap-1 border-0 font-medium`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}

// ---------- Main page ----------

export function Invoices() {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Filters
  const [selectedGarageId, setSelectedGarageId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);

  // ---------- Data queries ----------

  const { data: garages } = useQuery<Garage[]>({ queryKey: ["/api/garages"] });
  const { data: customers } = useQuery<User[]>({ queryKey: ["/api/customers"] });

  const invoiceUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedGarageId !== "all") params.set("garage_id", selectedGarageId);
    if (statusFilter !== "all") params.set("status", statusFilter);
    const qs = params.toString();
    return `/api/invoices${qs ? `?${qs}` : ""}`;
  }, [selectedGarageId, statusFilter]);

  const { data: invoices, isLoading } = useQuery<Invoice[]>({ queryKey: [invoiceUrl] });

  const { data: expandedItems } = useQuery<InvoiceItem[]>({
    queryKey: [`/api/invoices/${expandedId}/items`],
    enabled: !!expandedId,
  });

  // Filter by search locally
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    if (!searchQuery.trim()) return invoices;
    const q = searchQuery.toLowerCase();
    return invoices.filter((inv) => {
      const customer = customers?.find((c) => c.id === inv.customerId);
      return (
        inv.invoiceNumber?.toLowerCase().includes(q) ||
        customer?.fullName?.toLowerCase().includes(q) ||
        customer?.email?.toLowerCase().includes(q) ||
        inv.status?.toLowerCase().includes(q)
      );
    });
  }, [invoices, searchQuery, customers]);

  // ---------- Mutations ----------

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/invoices/${id}`, {
        status,
        ...(status === "sent" ? { sentAt: new Date() } : {}),
        ...(status === "paid" ? { paidAt: new Date() } : {}),
      });
    },
    onSuccess: () => {
      invalidateInvoices();
      toast({ title: "Status Updated", description: "Invoice status has been changed." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update status", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/invoices/${id}`),
    onSuccess: () => {
      invalidateInvoices();
      toast({ title: "Deleted", description: "Invoice deleted successfully." });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to delete invoice", variant: "destructive" });
    },
  });

  // ---------- Helpers ----------

  const customerName = (id: string) => {
    const c = customers?.find((c) => c.id === id);
    return c?.fullName || c?.email || "Unknown";
  };

  const handleStatusChange = (invoice: Invoice, newStatus: string) => {
    const allowed = STATUS_TRANSITIONS[invoice.status] || [];
    if (!allowed.includes(newStatus)) {
      toast({
        title: "Invalid Transition",
        description: `Cannot change from "${invoice.status}" to "${newStatus}".`,
        variant: "destructive",
      });
      return;
    }
    updateStatusMutation.mutate({ id: invoice.id, status: newStatus });
  };

  // ---------- Summary stats ----------

  const stats = useMemo(() => {
    if (!invoices) return { total: 0, paid: 0, outstanding: 0, overdue: 0 };
    const total = invoices.reduce((s, i) => s + parseFloat(i.totalAmount), 0);
    const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + parseFloat(i.totalAmount), 0);
    const outstanding = invoices.filter((i) => ["sent", "draft"].includes(i.status)).reduce((s, i) => s + parseFloat(i.balanceAmount), 0);
    const overdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + parseFloat(i.balanceAmount), 0);
    return { total, paid, outstanding, overdue };
  }, [invoices]);

  // ---------- Render ----------

  return (
    <StandardPageLayout
      title={t("invoices.title", "Invoices & Billing")}
      description={t("invoices.description", "Manage invoices and payments")}
      icon={FileText}
    >
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: t("invoices.total", "Total Invoiced"), value: stats.total, color: "text-[#0B1F3B] dark:text-white" },
          { label: t("common.paid", "Paid"), value: stats.paid, color: "text-emerald-600 dark:text-emerald-400" },
          { label: t("nav.pending_payments", "Outstanding"), value: stats.outstanding, color: "text-blue-600 dark:text-blue-400" },
          { label: t("common.overdue", "Overdue"), value: stats.overdue, color: "text-red-600 dark:text-red-400" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-[#64748B] dark:text-gray-400">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{formatSAR(value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar: search + filters + create */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder={t("invoices.searchPlaceholder", "Search invoices...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Garages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Garages</SelectItem>
            {(garages ?? []).map((g) => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            {t("invoices.newInvoice", "Create Invoice")}
          </Button>
        </div>
      </div>

      {/* Invoices table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          title={t("invoices.noInvoices", "No Invoices")}
          description={t("invoices.noInvoicesDescription", "Create your first invoice to start billing customers")}
          actionLabel={t("invoices.createInvoice", "Create Invoice")}
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="p-3 text-left font-medium text-[#64748B]">{t("invoices.invoiceNumber", "Invoice #")}</th>
                  <th className="p-3 text-left font-medium text-[#64748B]">{t("invoices.customer", "Customer")}</th>
                  <th className="p-3 text-left font-medium text-[#64748B]">{t("common.date", "Date")}</th>
                  <th className="p-3 text-left font-medium text-[#64748B]">{t("invoices.dueDate", "Due Date")}</th>
                  <th className="p-3 text-right font-medium text-[#64748B]">{t("invoices.total", "Total")}</th>
                  <th className="p-3 text-right font-medium text-[#64748B]">{t("invoices.balance", "Balance")}</th>
                  <th className="p-3 text-center font-medium text-[#64748B]">{t("common.status", "Status")}</th>
                  <th className="p-3 text-center font-medium text-[#64748B]">{t("common.actions", "Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredInvoices.map((inv) => {
                  const isExpanded = expandedId === inv.id;
                  const nextStatuses = STATUS_TRANSITIONS[inv.status] || [];
                  return (
                    <InvoiceRow
                      key={inv.id}
                      invoice={inv}
                      isExpanded={isExpanded}
                      expandedItems={isExpanded ? expandedItems : undefined}
                      nextStatuses={nextStatuses}
                      customerName={customerName(inv.customerId)}
                      onToggleExpand={() => setExpandedId(isExpanded ? null : inv.id)}
                      onStatusChange={(s) => handleStatusChange(inv, s)}
                      onEdit={() => setEditingInvoice(inv)}
                      onDelete={() => setDeleteTarget(inv)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Dialog */}
      <InvoiceFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        garages={garages ?? []}
        customers={customers ?? []}
        toast={toast}
      />

      {/* Edit Dialog */}
      {editingInvoice && (
        <InvoiceFormDialog
          open={!!editingInvoice}
          onOpenChange={(open) => { if (!open) setEditingInvoice(null); }}
          garages={garages ?? []}
          customers={customers ?? []}
          toast={toast}
          invoice={editingInvoice}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {deleteTarget?.invoiceNumber}? This action
              cannot be undone and will also delete all associated line items and payments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StandardPageLayout>
  );
}

// ---------- Invoice Row (with expandable details) ----------

interface InvoiceRowProps {
  invoice: Invoice;
  isExpanded: boolean;
  expandedItems?: InvoiceItem[];
  nextStatuses: string[];
  customerName: string;
  onToggleExpand: () => void;
  onStatusChange: (status: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

function InvoiceRow({
  invoice, isExpanded, expandedItems, nextStatuses, customerName,
  onToggleExpand, onStatusChange, onEdit, onDelete,
}: InvoiceRowProps) {
  const { t } = useTranslation();
  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <td className="p-3 font-medium text-[#0B1F3B] dark:text-white">{invoice.invoiceNumber}</td>
        <td className="p-3 text-[#64748B] dark:text-gray-300">{customerName}</td>
        <td className="p-3 text-[#64748B] dark:text-gray-300">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
        <td className="p-3 text-[#64748B] dark:text-gray-300">{new Date(invoice.dueDate).toLocaleDateString()}</td>
        <td className="p-3 text-right font-semibold text-[#0B1F3B] dark:text-white">{formatSAR(invoice.totalAmount)}</td>
        <td className="p-3 text-right font-semibold text-[#0B1F3B] dark:text-white">{formatSAR(invoice.balanceAmount)}</td>
        <td className="p-3 text-center">
          <StatusBadgeInline status={invoice.status} />
        </td>
        <td className="p-3">
          <div className="flex items-center justify-center gap-1">
            <Button variant="ghost" size="sm" onClick={onToggleExpand} title="View details">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            {invoice.status === "draft" && (
              <Button variant="ghost" size="sm" onClick={onEdit} title="Edit">
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {nextStatuses.length > 0 && (
              <Select onValueChange={onStatusChange}>
                <SelectTrigger className="h-8 w-8 p-0 border-0 bg-transparent [&>svg]:hidden" title="Change status">
                  <ChevronDown className="w-4 h-4 mx-auto text-[#64748B]" />
                </SelectTrigger>
                <SelectContent>
                  {nextStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_CONFIG[s]?.label ?? s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="ghost" size="sm" onClick={onDelete} title="Delete" className="text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>

      {/* Expanded detail row */}
      {isExpanded && (
        <tr>
          <td colSpan={8} className="bg-gray-50 dark:bg-gray-800/30 p-4">
            <div className="space-y-3">
              {/* Notes */}
              {invoice.notes && (
                <div>
                  <span className="text-xs font-medium text-[#64748B] uppercase">{t("common.notes", "Notes")}</span>
                  <p className="text-sm mt-1">{invoice.notes}</p>
                </div>
              )}

              {/* Line items table */}
              <div>
                <span className="text-xs font-medium text-[#64748B] uppercase">{t("invoices.items", "Line Items")}</span>
                {!expandedItems ? (
                  <div className="flex items-center gap-2 mt-2 text-sm text-[#64748B]">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Loading items...
                  </div>
                ) : expandedItems.length === 0 ? (
                  <p className="text-sm text-[#64748B] mt-1">No line items.</p>
                ) : (
                  <table className="w-full mt-2 text-sm">
                    <thead>
                      <tr className="border-b dark:border-gray-600">
                        <th className="text-left py-1 pr-3 font-medium text-[#64748B]">Type</th>
                        <th className="text-left py-1 pr-3 font-medium text-[#64748B]">Description</th>
                        <th className="text-right py-1 pr-3 font-medium text-[#64748B]">Qty</th>
                        <th className="text-right py-1 pr-3 font-medium text-[#64748B]">Unit Price</th>
                        <th className="text-right py-1 font-medium text-[#64748B]">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expandedItems.map((item) => (
                        <tr key={item.id} className="border-b dark:border-gray-700 last:border-0">
                          <td className="py-1 pr-3 capitalize">{item.itemType}</td>
                          <td className="py-1 pr-3">{item.description}</td>
                          <td className="py-1 pr-3 text-right">{item.quantity}</td>
                          <td className="py-1 pr-3 text-right">{formatSAR(item.unitPrice)}</td>
                          <td className="py-1 text-right font-medium">{formatSAR(item.lineTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Totals summary */}
              <div className="flex justify-end">
                <div className="space-y-1 min-w-[240px] text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Subtotal:</span>
                    <span className="font-medium">{formatSAR(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">VAT (15%):</span>
                    <span className="font-medium">{formatSAR(invoice.taxAmount)}</span>
                  </div>
                  {parseFloat(invoice.discountAmount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Discount:</span>
                      <span className="font-medium">-{formatSAR(invoice.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-1 dark:border-gray-600">
                    <span>Total:</span>
                    <span>{formatSAR(invoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Paid:</span>
                    <span>{formatSAR(invoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-orange-600 dark:text-orange-400 font-semibold border-t pt-1 dark:border-gray-600">
                    <span>Balance Due:</span>
                    <span>{formatSAR(invoice.balanceAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ---------- Create / Edit Invoice Dialog ----------

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  garages: Garage[];
  customers: User[];
  toast: ReturnType<typeof useToast>["toast"];
  invoice?: Invoice;
}

function InvoiceFormDialog({ open, onOpenChange, garages, customers, toast, invoice }: InvoiceFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!invoice;

  // Form state
  const [garageId, setGarageId] = useState(invoice?.garageId ?? "");
  const [customerId, setCustomerId] = useState(invoice?.customerId ?? "");
  const [dueDate, setDueDate] = useState(() => {
    if (invoice?.dueDate) return new Date(invoice.dueDate).toISOString().split("T")[0];
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [items, setItems] = useState<LineItemInput[]>([]);

  // Current item being added
  const [curType, setCurType] = useState<"service" | "part" | "labor">("service");
  const [curDesc, setCurDesc] = useState("");
  const [curQty, setCurQty] = useState(1);
  const [curPrice, setCurPrice] = useState(0);

  // Load existing items when editing
  const { data: existingItems } = useQuery<InvoiceItem[]>({
    queryKey: [`/api/invoices/${invoice?.id}/items`],
    enabled: isEdit && open,
  });

  useEffect(() => {
    if (isEdit && existingItems && existingItems.length > 0 && items.length === 0) {
      setItems(
        existingItems.map((ei) => ({
          itemType: ei.itemType as "service" | "part" | "labor",
          description: ei.description,
          quantity: ei.quantity,
          unitPrice: parseFloat(ei.unitPrice),
        }))
      );
    }
  }, [existingItems, isEdit]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setGarageId(invoice?.garageId ?? "");
      setCustomerId(invoice?.customerId ?? "");
      setNotes(invoice?.notes ?? "");
      setItems([]);
      setCurDesc(""); setCurQty(1); setCurPrice(0); setCurType("service");
    }
  }, [open]);

  const { subtotal, tax, total } = calcTotals(items);

  const addItem = () => {
    if (!curDesc.trim()) {
      toast({ title: "Missing Description", description: "Please enter a description.", variant: "destructive" });
      return;
    }
    if (curQty < 1 || curPrice <= 0) {
      toast({ title: "Invalid Values", description: "Quantity must be at least 1 and price must be positive.", variant: "destructive" });
      return;
    }
    setItems([...items, { itemType: curType, description: curDesc.trim(), quantity: curQty, unitPrice: curPrice }]);
    setCurDesc(""); setCurQty(1); setCurPrice(0); setCurType("service");
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const itemsPayload = items.map((item) => ({
        itemType: item.itemType,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        lineTotal: (item.quantity * item.unitPrice).toString(),
        taxRate: VAT_RATE.toString(),
      }));
      return apiRequest("POST", "/api/invoices/with-items", {
        invoice: {
          garageId,
          customerId,
          dueDate: new Date(dueDate),
          status: "draft",
          subtotal: subtotal.toFixed(2),
          taxAmount: tax.toFixed(2),
          discountAmount: "0",
          totalAmount: total.toFixed(2),
          paidAmount: "0",
          balanceAmount: total.toFixed(2),
          notes: notes || undefined,
        },
        items: itemsPayload,
      });
    },
    onSuccess: () => {
      invalidateInvoices();
      toast({ title: "Invoice Created", description: "New invoice has been created successfully." });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to create invoice", variant: "destructive" });
    },
  });

  // Update mutation (for edit mode)
  const updateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/invoices/${invoice!.id}`, {
        garageId,
        customerId,
        dueDate: new Date(dueDate),
        subtotal: subtotal.toFixed(2),
        taxAmount: tax.toFixed(2),
        totalAmount: total.toFixed(2),
        balanceAmount: (total - parseFloat(invoice!.paidAmount)).toFixed(2),
        notes: notes || undefined,
      });
    },
    onSuccess: () => {
      invalidateInvoices();
      toast({ title: "Invoice Updated", description: "Invoice has been updated successfully." });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update invoice", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!garageId || !customerId) {
      toast({ title: "Missing Fields", description: "Please select a garage and customer.", variant: "destructive" });
      return;
    }
    if (items.length === 0) {
      toast({ title: "No Items", description: "Please add at least one line item.", variant: "destructive" });
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
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit Invoice - ${invoice.invoiceNumber}` : "Create Invoice"}</DialogTitle>
          <DialogDescription className="sr-only">
            {isEdit ? "Edit an existing invoice" : "Create a new invoice with line items"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Header fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t("nav.garage", "Garage")}</Label>
              <Select value={garageId} onValueChange={setGarageId}>
                <SelectTrigger><SelectValue placeholder={t("nav.garage", "Select garage")} /></SelectTrigger>
                <SelectContent>
                  {garages.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("invoices.customer", "Customer")}</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder={t("invoices.customer", "Select customer")} /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.fullName || c.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("invoices.dueDate", "Due Date")}</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("common.notes", "Notes")}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("common.notes", "Additional notes...")} rows={2} />
          </div>

          {/* Line items section */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="text-sm font-semibold">Line Items</h3>

            {/* Add item row */}
            <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 items-end">
              <div className="col-span-2 sm:col-span-2 space-y-1">
                <Label className="text-xs">Type</Label>
                <Select value={curType} onValueChange={(v: any) => setCurType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="part">Part</SelectItem>
                    <SelectItem value="labor">Labor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 sm:col-span-4 space-y-1">
                <Label className="text-xs">Description</Label>
                <Input value={curDesc} onChange={(e) => setCurDesc(e.target.value)} placeholder="Item description" />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-1">
                <Label className="text-xs">Qty</Label>
                <Input type="number" min={1} value={curQty} onChange={(e) => setCurQty(parseInt(e.target.value) || 1)} />
              </div>
              <div className="col-span-1 sm:col-span-3 space-y-1">
                <Label className="text-xs">Unit Price (SAR)</Label>
                <Input type="number" min={0} step={0.01} value={curPrice} onChange={(e) => setCurPrice(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Button type="button" onClick={addItem} size="sm" className="w-full">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Items list */}
            {items.length > 0 && (
              <div className="border rounded-md overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="p-2 text-left text-xs font-medium text-[#64748B]">Type</th>
                      <th className="p-2 text-left text-xs font-medium text-[#64748B]">Description</th>
                      <th className="p-2 text-right text-xs font-medium text-[#64748B]">Qty</th>
                      <th className="p-2 text-right text-xs font-medium text-[#64748B]">Unit Price</th>
                      <th className="p-2 text-right text-xs font-medium text-[#64748B]">Line Total</th>
                      <th className="p-2 w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 capitalize">{item.itemType}</td>
                        <td className="p-2">{item.description}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">{formatSAR(item.unitPrice)}</td>
                        <td className="p-2 text-right font-medium">{formatSAR(item.quantity * item.unitPrice)}</td>
                        <td className="p-2">
                          <Button variant="ghost" size="sm" onClick={() => removeItem(idx)} className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
                            <X className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            {items.length > 0 && (
              <div className="flex justify-end">
                <div className="space-y-1 min-w-[240px] text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Subtotal:</span>
                    <span className="font-medium">{formatSAR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">VAT ({VAT_RATE}%):</span>
                    <span className="font-medium">{formatSAR(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-1 dark:border-gray-600">
                    <span>Total:</span>
                    <span>{formatSAR(total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel", "Cancel")}</Button>
          <Button onClick={handleSubmit} disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
            {isPending ? (isEdit ? t("common.loading", "Updating...") : t("common.loading", "Creating...")) : (isEdit ? t("invoices.editInvoice", "Update Invoice") : t("invoices.newInvoice", "Create Invoice"))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
