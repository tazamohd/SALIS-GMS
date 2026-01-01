import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  insertSupplierSchema,
  insertSupplierPriceListSchema,
  insertSupplierPerformanceSchema,
  insertReorderSettingSchema,
  type Supplier,
  type SupplierPriceList,
  type SupplierPerformance,
  type ReorderSetting,
  type SparePart,
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Store,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Search,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";

const supplierFormSchema = insertSupplierSchema.extend({
  garageId: z.string().optional(),
});

const priceListFormSchema = insertSupplierPriceListSchema.extend({
  supplierId: z.string().min(1, "Supplier is required"),
  partName: z.string().min(1, "Part name is required"),
  unitPrice: z.string().transform((val) => val),
  minimumOrderQuantity: z.string().transform((val) => (val && val !== "" ? parseInt(val) : 1)),
  leadTimeDays: z.string().transform((val) => (val && val !== "" ? parseInt(val) : undefined)),
});

const performanceFormSchema = insertSupplierPerformanceSchema.extend({
  supplierId: z.string().min(1, "Supplier is required"),
  period: z.string().min(1, "Period is required"),
  totalOrders: z.string().transform((val) => (val && val !== "" ? parseInt(val) : 0)),
  totalValue: z.string().transform((val) => (val && val !== "" ? val : "0.00")),
  onTimeDeliveryRate: z.string().transform((val) => (val && val !== "" ? val : undefined)),
  qualityScore: z.string().transform((val) => (val && val !== "" ? val : undefined)),
  defectRate: z.string().transform((val) => (val && val !== "" ? val : undefined)),
  averageLeadTime: z.string().transform((val) => (val && val !== "" ? val : undefined)),
  priceCompetitiveness: z.string().transform((val) => (val && val !== "" ? val : undefined)),
  overallRating: z.string().transform((val) => (val && val !== "" ? val : undefined)),
});

const reorderFormSchema = insertReorderSettingSchema.extend({
  sparePartId: z.string().min(1, "Spare part is required"),
  garageId: z.string().optional(),
  reorderPoint: z.string().transform((val) => parseInt(val)),
  reorderQuantity: z.string().transform((val) => parseInt(val)),
  maxStockLevel: z.string().transform((val) => (val && val !== "" ? parseInt(val) : undefined)),
  supplierId: z.string().optional(),
  leadTimeDays: z.string().transform((val) => (val && val !== "" ? parseInt(val) : 7)),
  isAutoReorderEnabled: z.boolean().default(false),
  createdBy: z.string().optional(),
});

type PriceListFormInput = z.input<typeof priceListFormSchema>;
type PerformanceFormInput = z.input<typeof performanceFormSchema>;
type ReorderFormInput = z.input<typeof reorderFormSchema>;

function getAvailabilityBadge(availability: string) {
  const badges = {
    in_stock: "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white",
    limited: "bg-[#F97316] text-white",
    out_of_stock: "bg-[#64748B] text-white",
    discontinued: "bg-[#E2E8F0] text-[#0B1F3B] dark:bg-[#232A36] dark:text-white",
  };
  return badges[availability as keyof typeof badges] || badges.in_stock;
}

export default function VendorSupplierPortal() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("suppliers");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedPriceList, setSelectedPriceList] = useState<SupplierPriceList | null>(null);
  const [selectedPerformance, setSelectedPerformance] = useState<SupplierPerformance | null>(null);
  const [selectedReorder, setSelectedReorder] = useState<ReorderSetting | null>(null);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [isPriceListDialogOpen, setIsPriceListDialogOpen] = useState(false);
  const [isPerformanceDialogOpen, setIsPerformanceDialogOpen] = useState(false);
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false);
  const [priceComparePartId, setPriceComparePartId] = useState<string>("");

  // Queries
  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: priceLists = [], isLoading: priceListsLoading } = useQuery<SupplierPriceList[]>({
    queryKey: ["/api/supplier-price-lists"],
  });

  const { data: performance = [], isLoading: performanceLoading } = useQuery<SupplierPerformance[]>({
    queryKey: ["/api/supplier-performance"],
  });

  const { data: reorderSettings = [], isLoading: reorderLoading } = useQuery<ReorderSetting[]>({
    queryKey: ["/api/reorder-settings"],
  });

  const { data: spareParts = [] } = useQuery<SparePart[]>({
    queryKey: ["/api/spare-parts"],
  });

  const { data: priceComparison = [] } = useQuery<SupplierPriceList[]>({
    queryKey: ["/api/supplier-price-lists/compare", priceComparePartId],
    enabled: !!priceComparePartId,
  });

  // Forms
  const supplierForm = useForm<z.infer<typeof supplierFormSchema>>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      taxId: "",
      paymentTerms: "",
      notes: "",
      isActive: true,
    },
  });

  const priceListForm = useForm<PriceListFormInput>({
    resolver: zodResolver(priceListFormSchema),
    defaultValues: {
      supplierId: "",
      sparePartId: undefined,
      partName: "",
      partNumber: "",
      unitPrice: "",
      currency: "USD",
      minimumOrderQuantity: "1",
      leadTimeDays: "",
      availability: "in_stock",
      isActive: true,
    },
  });

  const performanceForm = useForm<PerformanceFormInput>({
    resolver: zodResolver(performanceFormSchema),
    defaultValues: {
      supplierId: "",
      period: "",
      totalOrders: "0",
      totalValue: "0.00",
      onTimeDeliveryRate: "",
      qualityScore: "",
      defectRate: "",
      averageLeadTime: "",
      priceCompetitiveness: "",
      overallRating: "",
      notes: "",
    },
  });

  const reorderForm = useForm<ReorderFormInput>({
    resolver: zodResolver(reorderFormSchema),
    defaultValues: {
      sparePartId: "",
      reorderPoint: "",
      reorderQuantity: "",
      maxStockLevel: "",
      supplierId: "",
      leadTimeDays: "7",
      isAutoReorderEnabled: false,
    },
  });

  // Mutations - Suppliers
  const createSupplierMutation = useMutation({
    mutationFn: async (data: z.infer<typeof supplierFormSchema>) => {
      return apiRequest("POST", "/api/suppliers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({ title: t('vendor.supplierCreatedSuccessfully', 'Supplier created successfully') });
      setIsSupplierDialogOpen(false);
      supplierForm.reset();
    },
    onError: () => {
      toast({ title: t('vendor.failedToCreateSupplier', 'Failed to create supplier'), variant: "destructive" });
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof supplierFormSchema> }) => {
      return apiRequest("PATCH", `/api/suppliers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({ title: t('vendor.supplierUpdatedSuccessfully', 'Supplier updated successfully') });
      setIsSupplierDialogOpen(false);
      setSelectedSupplier(null);
    },
    onError: () => {
      toast({ title: t('vendor.failedToUpdateSupplier', 'Failed to update supplier'), variant: "destructive" });
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({ title: t('vendor.supplierDeletedSuccessfully', 'Supplier deleted successfully') });
    },
    onError: () => {
      toast({ title: t('vendor.failedToDeleteSupplier', 'Failed to delete supplier'), variant: "destructive" });
    },
  });

  // Mutations - Price Lists
  const createPriceListMutation = useMutation({
    mutationFn: async (data: PriceListFormInput) => {
      return apiRequest("POST", "/api/supplier-price-lists", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-price-lists"] });
      toast({ title: t('vendor.priceListCreatedSuccessfully', 'Price list entry created successfully') });
      setIsPriceListDialogOpen(false);
      priceListForm.reset();
    },
    onError: () => {
      toast({ title: t('vendor.failedToCreatePriceList', 'Failed to create price list entry'), variant: "destructive" });
    },
  });

  const updatePriceListMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PriceListFormInput }) => {
      return apiRequest("PATCH", `/api/supplier-price-lists/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-price-lists"] });
      toast({ title: t('vendor.priceListUpdatedSuccessfully', 'Price list entry updated successfully') });
      setIsPriceListDialogOpen(false);
      setSelectedPriceList(null);
    },
    onError: () => {
      toast({ title: t('vendor.failedToUpdatePriceList', 'Failed to update price list entry'), variant: "destructive" });
    },
  });

  const deletePriceListMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/supplier-price-lists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-price-lists"] });
      toast({ title: t('vendor.priceListDeletedSuccessfully', 'Price list entry deleted successfully') });
    },
    onError: () => {
      toast({ title: t('vendor.failedToDeletePriceList', 'Failed to delete price list entry'), variant: "destructive" });
    },
  });

  // Mutations - Performance
  const createPerformanceMutation = useMutation({
    mutationFn: async (data: PerformanceFormInput) => {
      return apiRequest("POST", "/api/supplier-performance", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-performance"] });
      toast({ title: t('vendor.performanceCreatedSuccessfully', 'Performance record created successfully') });
      setIsPerformanceDialogOpen(false);
      performanceForm.reset();
    },
    onError: () => {
      toast({ title: t('vendor.failedToCreatePerformance', 'Failed to create performance record'), variant: "destructive" });
    },
  });

  const updatePerformanceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PerformanceFormInput }) => {
      return apiRequest("PATCH", `/api/supplier-performance/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-performance"] });
      toast({ title: t('vendor.performanceUpdatedSuccessfully', 'Performance record updated successfully') });
      setIsPerformanceDialogOpen(false);
      setSelectedPerformance(null);
    },
    onError: () => {
      toast({ title: t('vendor.failedToUpdatePerformance', 'Failed to update performance record'), variant: "destructive" });
    },
  });

  const deletePerformanceMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/supplier-performance/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-performance"] });
      toast({ title: t('vendor.performanceDeletedSuccessfully', 'Performance record deleted successfully') });
    },
    onError: () => {
      toast({ title: t('vendor.failedToDeletePerformance', 'Failed to delete performance record'), variant: "destructive" });
    },
  });

  // Mutations - Reorder Settings
  const createReorderMutation = useMutation({
    mutationFn: async (data: ReorderFormInput) => {
      return apiRequest("POST", "/api/reorder-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reorder-settings"] });
      toast({ title: t('vendor.reorderRuleCreatedSuccessfully', 'Reorder rule created successfully') });
      setIsReorderDialogOpen(false);
      reorderForm.reset();
    },
    onError: () => {
      toast({ title: t('vendor.failedToCreateReorderRule', 'Failed to create reorder rule'), variant: "destructive" });
    },
  });

  const updateReorderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ReorderFormInput }) => {
      return apiRequest("PATCH", `/api/reorder-settings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reorder-settings"] });
      toast({ title: t('vendor.reorderRuleUpdatedSuccessfully', 'Reorder rule updated successfully') });
      setIsReorderDialogOpen(false);
      setSelectedReorder(null);
    },
    onError: () => {
      toast({ title: t('vendor.failedToUpdateReorderRule', 'Failed to update reorder rule'), variant: "destructive" });
    },
  });

  const deleteReorderMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/reorder-settings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reorder-settings"] });
      toast({ title: t('vendor.reorderRuleDeletedSuccessfully', 'Reorder rule deleted successfully') });
    },
    onError: () => {
      toast({ title: t('vendor.failedToDeleteReorderRule', 'Failed to delete reorder rule'), variant: "destructive" });
    },
  });

  // Handlers
  const handleCreateSupplier = () => {
    setSelectedSupplier(null);
    supplierForm.reset();
    setIsSupplierDialogOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    supplierForm.reset({
      name: supplier.name,
      contactPerson: supplier.contactPerson ?? "",
      email: supplier.email ?? "",
      phone: supplier.phone ?? "",
      address: supplier.address ?? "",
      city: supplier.city ?? "",
      country: supplier.country ?? "",
      taxId: supplier.taxId ?? "",
      paymentTerms: supplier.paymentTerms ?? "",
      notes: supplier.notes ?? "",
      isActive: supplier.isActive ?? true,
    });
    setIsSupplierDialogOpen(true);
  };

  const handleSupplierSubmit = (data: z.infer<typeof supplierFormSchema>) => {
    if (selectedSupplier) {
      updateSupplierMutation.mutate({ id: selectedSupplier.id, data });
    } else {
      createSupplierMutation.mutate(data);
    }
  };

  const handleCreatePriceList = () => {
    setSelectedPriceList(null);
    priceListForm.reset();
    setIsPriceListDialogOpen(true);
  };

  const handleEditPriceList = (priceList: SupplierPriceList) => {
    setSelectedPriceList(priceList);
    priceListForm.reset({
      supplierId: priceList.supplierId,
      sparePartId: priceList.sparePartId ?? undefined,
      partName: priceList.partName,
      partNumber: priceList.partNumber ?? "",
      unitPrice: priceList.unitPrice,
      currency: priceList.currency ?? "USD",
      minimumOrderQuantity: priceList.minimumOrderQuantity?.toString() ?? "1",
      leadTimeDays: priceList.leadTimeDays?.toString() ?? "",
      availability: priceList.availability ?? "in_stock",
      isActive: priceList.isActive ?? true,
    });
    setIsPriceListDialogOpen(true);
  };

  const handlePriceListSubmit = (data: PriceListFormInput) => {
    if (selectedPriceList) {
      updatePriceListMutation.mutate({ id: selectedPriceList.id, data });
    } else {
      createPriceListMutation.mutate(data);
    }
  };

  const handleCreatePerformance = () => {
    setSelectedPerformance(null);
    performanceForm.reset();
    setIsPerformanceDialogOpen(true);
  };

  const handleEditPerformance = (perf: SupplierPerformance) => {
    setSelectedPerformance(perf);
    performanceForm.reset({
      supplierId: perf.supplierId,
      period: perf.period,
      totalOrders: perf.totalOrders?.toString() ?? "0",
      totalValue: perf.totalValue ?? "0.00",
      onTimeDeliveryRate: perf.onTimeDeliveryRate ?? "",
      qualityScore: perf.qualityScore ?? "",
      defectRate: perf.defectRate ?? "",
      averageLeadTime: perf.averageLeadTime ?? "",
      priceCompetitiveness: perf.priceCompetitiveness ?? "",
      overallRating: perf.overallRating ?? "",
      notes: perf.notes ?? "",
    });
    setIsPerformanceDialogOpen(true);
  };

  const handlePerformanceSubmit = (data: PerformanceFormInput) => {
    if (selectedPerformance) {
      updatePerformanceMutation.mutate({ id: selectedPerformance.id, data });
    } else {
      createPerformanceMutation.mutate(data);
    }
  };

  const handleCreateReorder = () => {
    setSelectedReorder(null);
    reorderForm.reset();
    setIsReorderDialogOpen(true);
  };

  const handleEditReorder = (reorder: ReorderSetting) => {
    setSelectedReorder(reorder);
    reorderForm.reset({
      sparePartId: reorder.sparePartId,
      reorderPoint: reorder.reorderPoint.toString(),
      reorderQuantity: reorder.reorderQuantity.toString(),
      maxStockLevel: reorder.maxStockLevel?.toString() ?? "",
      supplierId: reorder.supplierId ?? "",
      leadTimeDays: reorder.leadTimeDays?.toString() ?? "7",
      isAutoReorderEnabled: reorder.isAutoReorderEnabled ?? false,
    });
    setIsReorderDialogOpen(true);
  };

  const handleReorderSubmit = (data: ReorderFormInput) => {
    if (selectedReorder) {
      updateReorderMutation.mutate({ id: selectedReorder.id, data });
    } else {
      createReorderMutation.mutate(data);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-semibold text-[#0B1F3B] dark:text-white">
            {t('vendor.vendorSupplierPortal', 'Vendor/Supplier Portal')}
          </h1>
          <p className="text-[#64748B] font-poppins mt-1">
            {t('vendor.manageSuppliersPriceLists', 'Manage suppliers, price lists, performance tracking, and automated reordering')}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#E2E8F0] dark:bg-[#232A36]">
          <TabsTrigger
            value="suppliers"
            data-testid="tab-suppliers"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white text-[#0B1F3B] dark:text-white"
          >
            <Store className="h-4 w-4 mr-2" />
            {t('vendor.suppliers', 'Suppliers')}
          </TabsTrigger>
          <TabsTrigger
            value="price-lists"
            data-testid="tab-price-lists"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white text-[#0B1F3B] dark:text-white"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            {t('vendor.priceLists', 'Price Lists')}
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            data-testid="tab-performance"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white text-[#0B1F3B] dark:text-white"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {t('vendor.performance', 'Performance')}
          </TabsTrigger>
          <TabsTrigger
            value="reorder"
            data-testid="tab-reorder"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white text-[#0B1F3B] dark:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('vendor.reorderRules', 'Reorder Rules')}
          </TabsTrigger>
        </TabsList>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-montserrat font-medium text-[#0B1F3B] dark:text-white">
              {t('vendor.suppliers', 'Suppliers')}
            </h2>
            <Button
              onClick={handleCreateSupplier}
              data-testid="button-create-supplier"
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('vendor.addSupplier', 'Add Supplier')}
            </Button>
          </div>

          {suppliersLoading ? (
            <div className="text-center py-8 text-[#64748B]">
              {t('vendor.loadingSuppliers', 'Loading suppliers...')}
            </div>
          ) : (
            <div className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-[#F8FAFC] dark:bg-[#0E1117]">
                  <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('common.name', 'Name')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.contact', 'Contact')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('auth.email', 'Email')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('auth.phone', 'Phone')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.city', 'City')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('common.status', 'Status')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat text-right">{t('common.actions', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white dark:bg-[#151A23]">
                  {suppliers.map((supplier) => (
                    <TableRow
                      key={supplier.id}
                      data-testid={`row-supplier-${supplier.id}`}
                      className="border-b border-[#E2E8F0] dark:border-[#232A36]"
                    >
                      <TableCell className="font-poppins font-medium text-[#0B1F3B] dark:text-white">
                        {supplier.name}
                      </TableCell>
                      <TableCell className="font-poppins text-[#64748B]">
                        {supplier.contactPerson || "—"}
                      </TableCell>
                      <TableCell className="font-poppins text-[#64748B]">
                        {supplier.email || "—"}
                      </TableCell>
                      <TableCell className="font-poppins text-[#64748B]">
                        {supplier.phone || "—"}
                      </TableCell>
                      <TableCell className="font-poppins text-[#64748B]">
                        {supplier.city || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          data-testid={`badge-supplier-status-${supplier.id}`}
                          className={
                            supplier.isActive
                              ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                              : "bg-[#64748B] text-white"
                          }
                        >
                          {supplier.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSupplier(supplier)}
                          data-testid={`button-edit-supplier-${supplier.id}`}
                          className="text-[#64748B] hover:text-[#0A5ED7]"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSupplierMutation.mutate(supplier.id)}
                          data-testid={`button-delete-supplier-${supplier.id}`}
                          className="text-[#64748B] hover:text-[#F97316]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Price Lists Tab */}
        <TabsContent value="price-lists" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-montserrat font-medium text-[#0B1F3B] dark:text-white">
              {t('vendor.priceLists', 'Price Lists')}
            </h2>
            <div className="flex gap-2">
              <div className="relative">
                <Select value={priceComparePartId} onValueChange={setPriceComparePartId}>
                  <SelectTrigger
                    data-testid="select-compare-part"
                    className="w-64 bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                  >
                    <SelectValue placeholder={t('vendor.comparePricesForPart', 'Compare prices for part...')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                    {spareParts.map((part) => (
                      <SelectItem key={part.id} value={part.id}>
                        {part.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreatePriceList}
                data-testid="button-create-price-list"
                className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('vendor.addPriceEntry', 'Add Price Entry')}
              </Button>
            </div>
          </div>

          {priceComparePartId && priceComparison.length > 0 && (
            <div className="bg-[#F8FAFC] dark:bg-[#0E1117] p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
              <h3 className="font-montserrat font-medium text-[#0B1F3B] dark:text-white mb-3">
                {t('vendor.priceComparison', 'Price Comparison')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {priceComparison.map((price) => {
                  const supplier = suppliers.find((s) => s.id === price.supplierId);
                  return (
                    <div
                      key={price.id}
                      data-testid={`card-price-comparison-${price.id}`}
                      className="bg-white dark:bg-[#151A23] p-4 rounded border border-[#E2E8F0] dark:border-[#232A36]"
                    >
                      <div className="font-poppins font-medium text-[#0B1F3B] dark:text-white">
                        {supplier?.name || "Unknown Supplier"}
                      </div>
                      <div className="text-2xl font-montserrat font-semibold text-[#0B1F3B] dark:text-white mt-2">
                        {price.currency} {price.unitPrice}
                      </div>
                      <div className="text-sm text-[#64748B] mt-1">
                        {t('vendor.minOrder', 'Min Order')}: {price.minimumOrderQuantity}
                      </div>
                      <div className="text-sm text-[#64748B]">
                        {t('vendor.leadTime', 'Lead Time')}: {price.leadTimeDays || "—"} {t('vendor.days', 'days')}
                      </div>
                      <Badge className={`mt-2 ${getAvailabilityBadge(price.availability ?? "in_stock")}`}>
                        {price.availability}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {priceListsLoading ? (
            <div className="text-center py-8 text-[#64748B]">
              {t('vendor.loadingPriceLists', 'Loading price lists...')}
            </div>
          ) : (
            <div className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-[#F8FAFC] dark:bg-[#0E1117]">
                  <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.supplier', 'Supplier')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.partName', 'Part Name')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.partNumber', 'Part Number')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.unitPrice', 'Unit Price')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.minOrder', 'Min Order')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.leadTime', 'Lead Time')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.availability', 'Availability')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat text-right">{t('common.actions', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white dark:bg-[#151A23]">
                  {priceLists.map((priceList) => {
                    const supplier = suppliers.find((s) => s.id === priceList.supplierId);
                    return (
                      <TableRow
                        key={priceList.id}
                        data-testid={`row-price-list-${priceList.id}`}
                        className="border-b border-[#E2E8F0] dark:border-[#232A36]"
                      >
                        <TableCell className="font-poppins text-[#0B1F3B] dark:text-white">
                          {supplier?.name || "Unknown"}
                        </TableCell>
                        <TableCell className="font-poppins text-[#64748B]">
                          {priceList.partName}
                        </TableCell>
                        <TableCell className="font-poppins text-[#64748B]">
                          {priceList.partNumber || "—"}
                        </TableCell>
                        <TableCell className="font-poppins font-medium text-[#0B1F3B] dark:text-white">
                          {priceList.currency} {priceList.unitPrice}
                        </TableCell>
                        <TableCell className="font-poppins text-[#64748B]">
                          {priceList.minimumOrderQuantity}
                        </TableCell>
                        <TableCell className="font-poppins text-[#64748B]">
                          {priceList.leadTimeDays || "—"} {t('vendor.days', 'days')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            data-testid={`badge-availability-${priceList.id}`}
                            className={getAvailabilityBadge(priceList.availability ?? "in_stock")}
                          >
                            {priceList.availability}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPriceList(priceList)}
                            data-testid={`button-edit-price-list-${priceList.id}`}
                            className="text-[#64748B] hover:text-[#0A5ED7]"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePriceListMutation.mutate(priceList.id)}
                            data-testid={`button-delete-price-list-${priceList.id}`}
                            className="text-[#64748B] hover:text-[#F97316]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-montserrat font-medium text-[#0B1F3B] dark:text-white">
              {t('vendor.supplierPerformance', 'Supplier Performance')}
            </h2>
            <Button
              onClick={handleCreatePerformance}
              data-testid="button-create-performance"
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('vendor.addPerformanceRecord', 'Add Performance Record')}
            </Button>
          </div>

          {performanceLoading ? (
            <div className="text-center py-8 text-[#64748B]">
              {t('vendor.loadingPerformanceData', 'Loading performance data...')}
            </div>
          ) : (
            <div className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-[#F8FAFC] dark:bg-[#0E1117]">
                  <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.supplier', 'Supplier')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.period', 'Period')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.orders', 'Orders')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.totalValue', 'Total Value')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.onTimePercent', 'On-Time %')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.qualityScore', 'Quality Score')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.rating', 'Rating')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat text-right">{t('common.actions', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white dark:bg-[#151A23]">
                  {performance.map((perf) => {
                    const supplier = suppliers.find((s) => s.id === perf.supplierId);
                    return (
                      <TableRow
                        key={perf.id}
                        data-testid={`row-performance-${perf.id}`}
                        className="border-b border-[#E2E8F0] dark:border-[#232A36]"
                      >
                        <TableCell className="font-poppins text-[#0B1F3B] dark:text-white">
                          {supplier?.name || "Unknown"}
                        </TableCell>
                        <TableCell className="font-poppins text-[#64748B]">
                          {perf.period}
                        </TableCell>
                        <TableCell className="font-poppins text-[#64748B]">
                          {perf.totalOrders}
                        </TableCell>
                        <TableCell className="font-poppins font-medium text-[#0B1F3B] dark:text-white">
                          ${perf.totalValue}
                        </TableCell>
                        <TableCell className="font-poppins text-[#64748B]">
                          {perf.onTimeDeliveryRate || "—"}%
                        </TableCell>
                        <TableCell className="font-poppins text-[#64748B]">
                          {perf.qualityScore || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="font-poppins font-medium text-[#0B1F3B] dark:text-white">
                              {perf.overallRating || "—"}
                            </span>
                            <span className="text-[#64748B] ml-1">/5.0</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPerformance(perf)}
                            data-testid={`button-edit-performance-${perf.id}`}
                            className="text-[#64748B] hover:text-[#0A5ED7]"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePerformanceMutation.mutate(perf.id)}
                            data-testid={`button-delete-performance-${perf.id}`}
                            className="text-[#64748B] hover:text-[#F97316]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Reorder Rules Tab */}
        <TabsContent value="reorder" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-montserrat font-medium text-[#0B1F3B] dark:text-white">
              {t('vendor.automatedReorderRules', 'Automated Reorder Rules')}
            </h2>
            <Button
              onClick={handleCreateReorder}
              data-testid="button-create-reorder"
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('vendor.addReorderRule', 'Add Reorder Rule')}
            </Button>
          </div>

          {reorderLoading ? (
            <div className="text-center py-8 text-[#64748B]">
              {t('vendor.loadingReorderRules', 'Loading reorder rules...')}
            </div>
          ) : (
            <div className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-[#F8FAFC] dark:bg-[#0E1117]">
                  <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.partId', 'Part ID')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.reorderPoint', 'Reorder Point')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.reorderQty', 'Reorder Qty')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.maxStock', 'Max Stock')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.supplier', 'Supplier')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.leadTime', 'Lead Time')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat">{t('vendor.autoEnabled', 'Auto Enabled')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white font-montserrat text-right">{t('common.actions', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white dark:bg-[#151A23]">
                  {reorderSettings.map((reorder) => {
                    const supplier = suppliers.find((s) => s.id === reorder.supplierId);
                    const part = spareParts.find((p) => p.id === reorder.sparePartId);
                    return (
                      <TableRow
                        key={reorder.id}
                        data-testid={`row-reorder-${reorder.id}`}
                        className="border-b border-[#E2E8F0] dark:border-[#232A36]"
                      >
                        <TableCell className="font-poppins text-[#0B1F3B] dark:text-white">
                          {part?.name || reorder.sparePartId.substring(0, 8)}
                        </TableCell>
                        <TableCell className="font-poppins text-[#64748B]">
                          {reorder.reorderPoint}
                        </TableCell>
                        <TableCell className="font-poppins text-[#64748B]">
                          {reorder.reorderQuantity}
                        </TableCell>
                        <TableCell className="font-poppins text-[#64748B]">
                          {reorder.maxStockLevel || "—"}
                        </TableCell>
                        <TableCell className="font-poppins text-[#64748B]">
                          {supplier?.name || "—"}
                        </TableCell>
                        <TableCell className="font-poppins text-[#64748B]">
                          {reorder.leadTimeDays} {t('vendor.days', 'days')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            data-testid={`badge-auto-reorder-${reorder.id}`}
                            className={
                              reorder.isAutoReorderEnabled
                                ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                                : "bg-[#64748B] text-white"
                            }
                          >
                            {reorder.isAutoReorderEnabled ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditReorder(reorder)}
                            data-testid={`button-edit-reorder-${reorder.id}`}
                            className="text-[#64748B] hover:text-[#0A5ED7]"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteReorderMutation.mutate(reorder.id)}
                            data-testid={`button-delete-reorder-${reorder.id}`}
                            className="text-[#64748B] hover:text-[#F97316]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Supplier Dialog */}
      <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white font-montserrat">
              {selectedSupplier ? t('vendor.editSupplier', 'Edit Supplier') : t('vendor.addSupplier', 'Add Supplier')}
            </DialogTitle>
          </DialogHeader>
          <Form {...supplierForm}>
            <form onSubmit={supplierForm.handleSubmit(handleSupplierSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={supplierForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.supplierName', 'Supplier Name')} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          data-testid="input-supplier-name"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={supplierForm.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.contactPerson', 'Contact Person')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          data-testid="input-contact-person"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={supplierForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('auth.email', 'Email')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="email"
                          data-testid="input-supplier-email"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={supplierForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('auth.phone', 'Phone')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          data-testid="input-supplier-phone"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={supplierForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.address', 'Address')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        data-testid="input-supplier-address"
                        className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={supplierForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.city', 'City')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          data-testid="input-supplier-city"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={supplierForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.country', 'Country')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          data-testid="input-supplier-country"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={supplierForm.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.taxId', 'Tax ID')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          data-testid="input-supplier-tax-id"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={supplierForm.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.paymentTerms', 'Payment Terms')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="e.g., net30, net60, cod"
                        data-testid="input-payment-terms"
                        className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={supplierForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.notes', 'Notes')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        data-testid="input-supplier-notes"
                        className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={supplierForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-supplier-active"
                      />
                    </FormControl>
                    <FormLabel className="text-[#0B1F3B] dark:text-white !mt-0">
                      {t('vendor.activeSupplier', 'Active Supplier')}
                    </FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSupplierDialogOpen(false)}
                  data-testid="button-cancel-supplier"
                  className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createSupplierMutation.isPending || updateSupplierMutation.isPending}
                  data-testid="button-save-supplier"
                  className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
                >
                  {createSupplierMutation.isPending || updateSupplierMutation.isPending
                    ? t('common.saving', 'Saving...')
                    : t('vendor.saveSupplier', 'Save Supplier')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Price List Dialog */}
      <Dialog open={isPriceListDialogOpen} onOpenChange={setIsPriceListDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white font-montserrat">
              {selectedPriceList ? t('vendor.editPriceListEntry', 'Edit Price List Entry') : t('vendor.addPriceListEntry', 'Add Price List Entry')}
            </DialogTitle>
          </DialogHeader>
          <Form {...priceListForm}>
            <form onSubmit={priceListForm.handleSubmit((data) => handlePriceListSubmit(data))} className="space-y-4">
              <FormField
                control={priceListForm.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.supplier', 'Supplier')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          data-testid="select-supplier"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        >
                          <SelectValue placeholder={t('vendor.selectSupplier', 'Select supplier')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={priceListForm.control}
                  name="partName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.partName', 'Part Name')} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          data-testid="input-part-name"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={priceListForm.control}
                  name="partNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.partNumber', 'Part Number')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          data-testid="input-part-number"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={priceListForm.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.unitPrice', 'Unit Price')} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          data-testid="input-unit-price"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={priceListForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.currency', 'Currency')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          data-testid="input-currency"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={priceListForm.control}
                  name="minimumOrderQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.minOrderQuantity', 'Min Order Quantity')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          data-testid="input-min-order-qty"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={priceListForm.control}
                  name="leadTimeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.leadTimeDays', 'Lead Time (Days)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          data-testid="input-lead-time"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={priceListForm.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.availability', 'Availability')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                      <FormControl>
                        <SelectTrigger
                          data-testid="select-availability"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        >
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                        <SelectItem value="in_stock">{t('vendor.inStock', 'In Stock')}</SelectItem>
                        <SelectItem value="limited">{t('vendor.limited', 'Limited')}</SelectItem>
                        <SelectItem value="out_of_stock">{t('vendor.outOfStock', 'Out of Stock')}</SelectItem>
                        <SelectItem value="discontinued">{t('vendor.discontinued', 'Discontinued')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={priceListForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-price-active"
                      />
                    </FormControl>
                    <FormLabel className="text-[#0B1F3B] dark:text-white !mt-0">
                      {t('vendor.activePrice', 'Active Price')}
                    </FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPriceListDialogOpen(false)}
                  data-testid="button-cancel-price-list"
                  className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createPriceListMutation.isPending || updatePriceListMutation.isPending}
                  data-testid="button-save-price-list"
                  className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 dark:bg-white dark:text-[#0B1F3B] dark:hover:bg-[#F8FAFC]"
                >
                  {createPriceListMutation.isPending || updatePriceListMutation.isPending
                    ? t('common.saving', 'Saving...')
                    : t('vendor.savePriceEntry', 'Save Price Entry')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Performance Dialog */}
      <Dialog open={isPerformanceDialogOpen} onOpenChange={setIsPerformanceDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white font-montserrat">
              {selectedPerformance ? t('vendor.editPerformanceRecord', 'Edit Performance Record') : t('vendor.addPerformanceRecord', 'Add Performance Record')}
            </DialogTitle>
          </DialogHeader>
          <Form {...performanceForm}>
            <form onSubmit={performanceForm.handleSubmit((data) => handlePerformanceSubmit(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={performanceForm.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.supplier', 'Supplier')} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger
                            data-testid="select-performance-supplier"
                            className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                          >
                            <SelectValue placeholder={t('vendor.selectSupplier', 'Select supplier')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={performanceForm.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.period', 'Period')} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('vendor.periodPlaceholder', 'e.g., 2025-01 or 2025-Q1')}
                          data-testid="input-period"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={performanceForm.control}
                  name="totalOrders"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.totalOrders', 'Total Orders')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          data-testid="input-total-orders"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={performanceForm.control}
                  name="totalValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.totalValueDollar', 'Total Value ($)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          data-testid="input-total-value"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={performanceForm.control}
                  name="onTimeDeliveryRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.onTimeDeliveryRate', 'On-Time Delivery Rate (%)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          data-testid="input-on-time-rate"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={performanceForm.control}
                  name="qualityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.qualityScoreRange', 'Quality Score (0-100)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          data-testid="input-quality-score"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={performanceForm.control}
                  name="defectRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.defectRate', 'Defect Rate (%)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          data-testid="input-defect-rate"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={performanceForm.control}
                  name="averageLeadTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.avgLeadTimeDays', 'Avg Lead Time (Days)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          data-testid="input-avg-lead-time"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={performanceForm.control}
                  name="priceCompetitiveness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.priceCompetitiveness', 'Price Competitiveness (0-100)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          data-testid="input-price-competitiveness"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={performanceForm.control}
                  name="overallRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.overallRating', 'Overall Rating (0-5)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          data-testid="input-overall-rating"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={performanceForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.notes', 'Notes')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        data-testid="input-performance-notes"
                        className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPerformanceDialogOpen(false)}
                  data-testid="button-cancel-performance"
                  className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createPerformanceMutation.isPending || updatePerformanceMutation.isPending}
                  data-testid="button-save-performance"
                  className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 dark:bg-white dark:text-[#0B1F3B] dark:hover:bg-[#F8FAFC]"
                >
                  {createPerformanceMutation.isPending || updatePerformanceMutation.isPending
                    ? t('common.saving', 'Saving...')
                    : t('vendor.savePerformance', 'Save Performance')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reorder Dialog */}
      <Dialog open={isReorderDialogOpen} onOpenChange={setIsReorderDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white font-montserrat">
              {selectedReorder ? t('vendor.editReorderRule', 'Edit Reorder Rule') : t('vendor.addReorderRule', 'Add Reorder Rule')}
            </DialogTitle>
          </DialogHeader>
          <Form {...reorderForm}>
            <form onSubmit={reorderForm.handleSubmit((data) => handleReorderSubmit(data))} className="space-y-4">
              <FormField
                control={reorderForm.control}
                name="sparePartId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.sparePart', 'Spare Part')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          data-testid="select-spare-part"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        >
                          <SelectValue placeholder={t('vendor.selectSparePart', 'Select spare part')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                        {spareParts.map((part) => (
                          <SelectItem key={part.id} value={part.id}>
                            {part.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={reorderForm.control}
                  name="reorderPoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.reorderPoint', 'Reorder Point')} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          data-testid="input-reorder-point"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={reorderForm.control}
                  name="reorderQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.reorderQuantity', 'Reorder Quantity')} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          data-testid="input-reorder-quantity"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={reorderForm.control}
                  name="maxStockLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.maxStockLevel', 'Max Stock Level')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          data-testid="input-max-stock"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={reorderForm.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.preferredSupplier', 'Preferred Supplier')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger
                            data-testid="select-reorder-supplier"
                            className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                          >
                            <SelectValue placeholder={t('vendor.selectSupplierOptional', 'Select supplier (optional)')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={reorderForm.control}
                  name="leadTimeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vendor.leadTimeDays', 'Lead Time (Days)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          data-testid="input-reorder-lead-time"
                          className="bg-white dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white border-[#E2E8F0] dark:border-[#232A36]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={reorderForm.control}
                name="isAutoReorderEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-auto-reorder"
                      />
                    </FormControl>
                    <FormLabel className="text-[#0B1F3B] dark:text-white !mt-0">
                      {t('vendor.enableAutoReordering', 'Enable Automatic Reordering')}
                    </FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReorderDialogOpen(false)}
                  data-testid="button-cancel-reorder"
                  className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createReorderMutation.isPending || updateReorderMutation.isPending}
                  data-testid="button-save-reorder"
                  className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 dark:bg-white dark:text-[#0B1F3B] dark:hover:bg-[#F8FAFC]"
                >
                  {createReorderMutation.isPending || updateReorderMutation.isPending
                    ? t('common.saving', 'Saving...')
                    : t('vendor.saveReorderRule', 'Save Reorder Rule')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
