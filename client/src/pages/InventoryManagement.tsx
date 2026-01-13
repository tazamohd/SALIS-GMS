import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { RoleGate } from "@/components/RoleGate";
import { RoleBadge } from "@/components/RoleBadge";
import {
  Package,
  AlertTriangle,
  Settings,
  TrendingUp,
  History,
  ArrowRightLeft,
  Search as SearchIcon,
  Barcode,
  Plus,
  CheckCircle,
  XCircle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { EmptyState } from "@/components/ui/empty-state";

export default function InventoryManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { canCreate, canEdit, canDelete, canView, hasPermission, getRoleDisplayName } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedGarageId, setSelectedGarageId] = useState<string>("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string>("");

  const { data: garages = [] } = useQuery<any[]>({
    queryKey: ["/api/garages"],
  });

  useEffect(() => {
    if (garages.length > 0 && !selectedGarageId) {
      setSelectedGarageId(garages[0].id);
    }
  }, [garages, selectedGarageId]);

  const { data: spareParts = [], isLoading: isSparePartsLoading } = useQuery<any[]>({
    queryKey: ["/api/spare-parts"],
  });

  const { data: stockAlerts = [] } = useQuery<any[]>({
    queryKey: ["/api/stock-alerts", selectedGarageId],
    enabled: !!selectedGarageId,
  });

  const { data: reorderSettings = [] } = useQuery<any[]>({
    queryKey: ["/api/reorder-settings", selectedGarageId],
    enabled: !!selectedGarageId,
  });

  const { data: inventoryTransfers = [] } = useQuery<any[]>({
    queryKey: ["/api/inventory-transfers", selectedGarageId],
    enabled: !!selectedGarageId,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: string) =>
      apiRequest("POST", `/api/stock-alerts/${alertId}/acknowledge`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock-alerts", selectedGarageId] });
      toast({
        title: t('inventory.alertAcknowledged', 'Alert Acknowledged'),
        description: t('inventory.alertAcknowledgedDesc', 'Stock alert has been acknowledged successfully'),
      });
    },
  });

  const handleBarcodeScan = (barcode: string) => {
    setScannedBarcode(barcode);
    setIsScannerOpen(false);
    
    const part = spareParts.find((p: any) => p.barcode === barcode);
    if (part) {
      setSearchQuery(part.name);
      toast({
        title: t('inventory.partFound', 'Part Found'),
        description: t('inventory.partFoundDesc', 'Found: {{name}} ({{sku}})', { name: part.name, sku: part.sku }),
      });
    } else {
      toast({
        title: t('inventory.partNotFound', 'Part Not Found'),
        description: t('inventory.partNotFoundDesc', 'No part found with this barcode. Try TecDoc search.'),
        variant: "destructive",
      });
    }
  };

  const overviewContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] border-0 text-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm font-medium text-white/90">{t('inventory.totalParts', 'Total Parts')}</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{spareParts.length}</div>
            <p className="text-xs text-white/70 mt-1">{t('inventory.activeItems', 'Active items')}</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#F97316]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('inventory.lowStockAlerts', 'Low Stock Alerts')}</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-[#F97316]">
              {stockAlerts.filter((a: any) => a.alertStatus === "active").length}
            </div>
            <p className="text-xs text-[#64748B] mt-1">{t('inventory.requiresAttention', 'Requires attention')}</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('inventory.pendingTransfers', 'Pending Transfers')}</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
              {inventoryTransfers.filter((tr: any) => tr.transferStatus === "pending").length}
            </div>
            <p className="text-xs text-[#64748B] mt-1">{t('inventory.awaitingApproval', 'Awaiting approval')}</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('inventory.autoReorderEnabled', 'Auto-Reorder Enabled')}</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {reorderSettings.filter((r: any) => r.isAutoReorderEnabled).length}
            </div>
            <p className="text-xs text-[#64748B] mt-1">{t('inventory.activeRules', 'Active rules')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('inventory.inventorySummary', 'Inventory Summary')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('inventory.quickOverview', 'Quick overview of parts inventory')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isSparePartsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[#0A5ED7] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-[#64748B]">{t('inventory.loadingInventory', 'Loading inventory...')}</p>
            </div>
          ) : spareParts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white mb-2">{t('inventory.noPartsFound', 'No Parts Found')}</h3>
              <p className="text-[#64748B] mb-4">{t('inventory.noPartsDesc', 'Get started by adding items to your stock.')}</p>
              <Button 
                onClick={() => setIsScannerOpen(true)}
                className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
                data-testid="button-scan-barcode"
              >
                <Barcode className="mr-2 h-4 w-4" />
                {t('inventory.scanBarcode', 'Scan Barcode')}
              </Button>
            </div>
          ) : (
            <>
              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] h-4 w-4" />
                <Input
                  placeholder={t('inventory.searchParts', 'Search parts...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-search-parts"
                />
              </div>
              <Table>
                <TableHeader className="bg-[#F8FAFC] dark:bg-[#0E1117]">
                  <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]">
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.partName', 'Part Name')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.sku', 'SKU')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.category', 'Category')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.stockStatus', 'Stock Status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spareParts
                    .filter((part: any) =>
                      searchQuery === "" ||
                      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      part.sku.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 10)
                    .map((part: any) => (
                      <TableRow key={part.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-part-${part.id}`}>
                        <TableCell className="font-medium text-[#0B1F3B] dark:text-white">{part.name}</TableCell>
                        <TableCell className="text-[#64748B]">{part.sku}</TableCell>
                        <TableCell>
                          <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0BB3FF]/10 dark:text-[#0BB3FF] border-0">{part.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-0">{t('inventory.inStock', 'In Stock')}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const alertsContent = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('inventory.stockAlerts', 'Stock Alerts')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('inventory.stockAlertsDesc', 'Low stock and out-of-stock notifications')}</CardDescription>
          </div>
          <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white" data-testid="button-create-alert">
            <Plus className="mr-2 h-4 w-4" />
            {t('inventory.createAlert', 'Create Alert')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-[#F8FAFC] dark:bg-[#0E1117]">
            <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.alertType', 'Alert Type')}</TableHead>
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.part', 'Part')}</TableHead>
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.currentStock', 'Current Stock')}</TableHead>
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.threshold', 'Threshold')}</TableHead>
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</TableHead>
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockAlerts.map((alert: any) => (
              <TableRow key={alert.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-alert-${alert.id}`}>
                <TableCell>
                  <Badge className={alert.alertType === "out_of_stock" ? "bg-red-500/10 text-red-700 dark:text-red-400 border-0" : "bg-[#F97316]/10 text-[#F97316] border-0"}>
                    {alert.alertType === "out_of_stock" ? t('inventory.outOfStock', 'Out of Stock') : t('inventory.lowStock', 'Low Stock')}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#0B1F3B] dark:text-white">{alert.sparePartId}</TableCell>
                <TableCell className="text-[#64748B]">{alert.currentQuantity}</TableCell>
                <TableCell className="text-[#64748B]">{alert.threshold}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      alert.alertStatus === "active"
                        ? "bg-red-500/10 text-red-700 dark:text-red-400 border-0"
                        : alert.alertStatus === "acknowledged"
                        ? "bg-[#64748B]/10 text-[#64748B] border-0"
                        : "bg-green-500/10 text-green-700 dark:text-green-400 border-0"
                    }
                  >
                    {alert.alertStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  {alert.alertStatus === "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
                      onClick={() => acknowledgeMutation.mutate(alert.id)}
                      data-testid={`button-acknowledge-${alert.id}`}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t('inventory.acknowledge', 'Acknowledge')}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {stockAlerts.length === 0 && (
              <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                <TableCell colSpan={6} className="text-center text-[#64748B]">
                  {t('inventory.noStockAlerts', 'No stock alerts found')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const reorderContent = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('inventory.autoReorderSettings', 'Automatic Reorder Settings')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('inventory.autoReorderDesc', 'Configure automatic reordering rules for parts')}</CardDescription>
          </div>
          <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white" data-testid="button-create-reorder-rule">
            <Plus className="mr-2 h-4 w-4" />
            {t('inventory.addRule', 'Add Rule')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-[#F8FAFC] dark:bg-[#0E1117]">
            <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.part', 'Part')}</TableHead>
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.reorderPoint', 'Reorder Point')}</TableHead>
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.reorderQuantity', 'Reorder Quantity')}</TableHead>
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.supplier', 'Supplier')}</TableHead>
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</TableHead>
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.lastReorder', 'Last Reorder')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reorderSettings.map((setting: any) => (
              <TableRow key={setting.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-reorder-${setting.id}`}>
                <TableCell className="font-medium text-[#0B1F3B] dark:text-white">{setting.sparePartId}</TableCell>
                <TableCell className="text-[#64748B]">{setting.reorderPoint}</TableCell>
                <TableCell className="text-[#64748B]">{setting.reorderQuantity}</TableCell>
                <TableCell className="text-[#64748B]">{setting.supplierId}</TableCell>
                <TableCell>
                  <Badge className={setting.isAutoReorderEnabled ? "bg-green-500/10 text-green-700 dark:text-green-400 border-0" : "bg-[#64748B]/10 text-[#64748B] border-0"}>
                    {setting.isAutoReorderEnabled ? t('common.enable', 'Enabled') : t('common.disable', 'Disabled')}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#64748B]">
                  {setting.lastReorderDate
                    ? new Date(setting.lastReorderDate).toLocaleDateString()
                    : t('inventory.never', 'Never')}
                </TableCell>
              </TableRow>
            ))}
            {reorderSettings.length === 0 && (
              <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                <TableCell colSpan={6} className="text-center text-[#64748B]">
                  {t('inventory.noReorderRules', 'No reorder rules configured')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const transfersContent = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('inventory.inventoryTransfers', 'Inventory Transfers')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('inventory.inventoryTransfersDesc', 'Multi-location inventory movement tracking')}</CardDescription>
          </div>
          <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white" data-testid="button-create-transfer">
            <Plus className="mr-2 h-4 w-4" />
            {t('inventory.newTransfer', 'New Transfer')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-[#F8FAFC] dark:bg-[#0E1117]">
            <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.transferNumber', 'Transfer #')}</TableHead>
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.part', 'Part')}</TableHead>
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.fromTo', 'From → To')}</TableHead>
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.quantity', 'Quantity')}</TableHead>
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</TableHead>
              <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.date', 'Date')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryTransfers.map((transfer: any) => (
              <TableRow key={transfer.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-transfer-${transfer.id}`}>
                <TableCell className="font-medium text-[#0B1F3B] dark:text-white">{transfer.transferNumber}</TableCell>
                <TableCell className="text-[#64748B]">{transfer.sparePartId}</TableCell>
                <TableCell className="text-[#64748B]">
                  {transfer.fromGarageId} → {transfer.toGarageId}
                </TableCell>
                <TableCell className="text-[#64748B]">{transfer.quantity}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      transfer.transferStatus === "completed"
                        ? "bg-green-500/10 text-green-700 dark:text-green-400 border-0"
                        : transfer.transferStatus === "in_transit"
                        ? "bg-[#0A5ED7]/10 text-[#0A5ED7] border-0"
                        : "bg-[#64748B]/10 text-[#64748B] border-0"
                    }
                  >
                    {transfer.transferStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#64748B]">
                  {new Date(transfer.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {inventoryTransfers.length === 0 && (
              <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                <TableCell colSpan={6} className="text-center text-[#64748B]">
                  {t('inventory.noTransfers', 'No transfers found')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const pricingContent = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('inventory.pricingHistory', 'Pricing History')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('inventory.pricingHistoryDesc', 'Track price changes over time')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <p className="text-[#64748B]">
            {t('inventory.selectPartPricing', 'Select a part to view pricing history')}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const auditContent = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('inventory.auditTrail', 'Inventory Audit Trail')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('inventory.auditTrailDesc', 'Complete history of inventory changes')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full flex items-center justify-center">
            <History className="w-10 h-10 text-white" />
          </div>
          <p className="text-[#64748B]">
            {t('inventory.auditTrailInfo', 'Audit trail will display all inventory movements and changes')}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const headerContent = (
    <div className="flex gap-2">
      <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
        <SelectTrigger className="w-[200px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-garage">
          <SelectValue placeholder={t('inventory.selectGarage', 'Select Garage')} />
        </SelectTrigger>
        <SelectContent>
          {garages.map((garage) => (
            <SelectItem key={garage.id} value={garage.id}>
              {garage.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <>
      <TabsPageLayout
        title={t('inventory.inventoryPartsManagement', 'Inventory & Parts Management')}
        description={t('inventory.inventoryPartsDesc', 'Advanced inventory control with stock alerts, auto-reordering, and multi-location transfers')}
        icon={Package}
        headerContent={headerContent}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          {
            id: "overview",
            label: t('inventory.overview', 'Overview'),
            icon: Package,
            content: overviewContent,
          },
          {
            id: "alerts",
            label: t('inventory.alerts', 'Alerts'),
            icon: AlertTriangle,
            content: alertsContent,
          },
          {
            id: "reorder",
            label: t('inventory.autoReorder', 'Auto-Reorder'),
            icon: Settings,
            content: reorderContent,
          },
          {
            id: "transfers",
            label: t('inventory.transfers', 'Transfers'),
            icon: ArrowRightLeft,
            content: transfersContent,
          },
          {
            id: "pricing",
            label: t('inventory.pricing', 'Pricing'),
            icon: TrendingUp,
            content: pricingContent,
          },
          {
            id: "audit",
            label: t('inventory.audit', 'Audit'),
            icon: History,
            content: auditContent,
          },
        ]}
      />
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
      />
    </>
  );
}
