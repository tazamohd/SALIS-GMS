import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('inventory.totalParts', 'Total Parts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spareParts.length}</div>
            <p className="text-xs text-gray-900 dark:text-white/60 mt-1">{t('inventory.activeItems', 'Active items')}</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('inventory.lowStockAlerts', 'Low Stock Alerts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stockAlerts.filter((a: any) => a.alertStatus === "active").length}
            </div>
            <p className="text-xs text-gray-900 dark:text-white/60 mt-1">{t('inventory.requiresAttention', 'Requires attention')}</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('inventory.pendingTransfers', 'Pending Transfers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {inventoryTransfers.filter((tr: any) => tr.transferStatus === "pending").length}
            </div>
            <p className="text-xs text-gray-900 dark:text-white/60 mt-1">{t('inventory.awaitingApproval', 'Awaiting approval')}</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('inventory.autoReorderEnabled', 'Auto-Reorder Enabled')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {reorderSettings.filter((r: any) => r.isAutoReorderEnabled).length}
            </div>
            <p className="text-xs text-gray-900 dark:text-white/60 mt-1">{t('inventory.activeRules', 'Active rules')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">{t('inventory.inventorySummary', 'Inventory Summary')}</CardTitle>
          <CardDescription className="text-gray-900 dark:text-white/60">{t('inventory.quickOverview', 'Quick overview of parts inventory')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isSparePartsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-gray-900 dark:border-white border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-900 dark:text-white/60">{t('inventory.loadingInventory', 'Loading inventory...')}</p>
            </div>
          ) : spareParts.length === 0 ? (
            <EmptyState
              title={t('inventory.noPartsFound', 'No Parts Found')}
              description={t('inventory.noPartsDesc', 'Get started by adding items to your stock.')}
              actionLabel={t('inventory.scanBarcode', 'Scan Barcode')}
              onAction={() => setIsScannerOpen(true)}
              testId="inventory-empty"
            />
          ) : (
            <>
              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 dark:text-white/60 h-4 w-4" />
                <Input
                  placeholder={t('inventory.searchParts', 'Search parts...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-parts"
                />
              </div>
              <Table>
                <TableHeader className="bg-gray-100 dark:bg-salis-gray-dark">
                  <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-salis-gray-dark">
                    <TableHead className="text-gray-900 dark:text-white">{t('inventory.partName', 'Part Name')}</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">{t('inventory.sku', 'SKU')}</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">{t('common.category', 'Category')}</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">{t('inventory.stockStatus', 'Stock Status')}</TableHead>
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
                      <TableRow key={part.id} data-testid={`row-part-${part.id}`}>
                        <TableCell className="font-medium">{part.name}</TableCell>
                        <TableCell className="text-gray-900 dark:text-white">{part.sku}</TableCell>
                        <TableCell className="text-gray-900 dark:text-white">
                          <Badge variant="outline">{part.category}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">
                          <Badge variant="secondary">{t('inventory.inStock', 'In Stock')}</Badge>
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
    <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-900 dark:text-white">{t('inventory.stockAlerts', 'Stock Alerts')}</CardTitle>
            <CardDescription className="text-gray-900 dark:text-white/60">{t('inventory.stockAlertsDesc', 'Low stock and out-of-stock notifications')}</CardDescription>
          </div>
          <Button data-testid="button-create-alert">
            <Plus className="mr-2 h-4 w-4" />
            {t('inventory.createAlert', 'Create Alert')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-salis-gray-dark">
            <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-salis-gray-dark">
              <TableHead className="text-gray-900 dark:text-white">{t('inventory.alertType', 'Alert Type')}</TableHead>
              <TableHead className="text-gray-900 dark:text-white">{t('inventory.part', 'Part')}</TableHead>
              <TableHead className="text-gray-900 dark:text-white">{t('inventory.currentStock', 'Current Stock')}</TableHead>
              <TableHead className="text-gray-900 dark:text-white">{t('inventory.threshold', 'Threshold')}</TableHead>
              <TableHead className="text-gray-900 dark:text-white">{t('common.status', 'Status')}</TableHead>
              <TableHead className="text-gray-900 dark:text-white">{t('common.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockAlerts.map((alert: any) => (
              <TableRow key={alert.id} data-testid={`row-alert-${alert.id}`}>
                <TableCell className="text-gray-900 dark:text-white">
                  <Badge variant={alert.alertType === "out_of_stock" ? "destructive" : "outline"}>
                    {alert.alertType === "out_of_stock" ? t('inventory.outOfStock', 'Out of Stock') : t('inventory.lowStock', 'Low Stock')}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white">{alert.sparePartId}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">{alert.currentQuantity}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">{alert.threshold}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">
                  <Badge
                    variant={
                      alert.alertStatus === "active"
                        ? "destructive"
                        : alert.alertStatus === "acknowledged"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {alert.alertStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white">
                  {alert.alertStatus === "active" && (
                    <Button
                      size="sm"
                      variant="outline"
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
              <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-salis-gray-dark">
                <TableCell colSpan={6} className="text-center text-gray-900 dark:text-white/60">
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
    <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-900 dark:text-white">{t('inventory.autoReorderSettings', 'Automatic Reorder Settings')}</CardTitle>
            <CardDescription className="text-gray-900 dark:text-white/60">{t('inventory.autoReorderDesc', 'Configure automatic reordering rules for parts')}</CardDescription>
          </div>
          <Button data-testid="button-create-reorder-rule">
            <Plus className="mr-2 h-4 w-4" />
            {t('inventory.addRule', 'Add Rule')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-salis-gray-dark">
            <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-salis-gray-dark">
              <TableHead className="text-gray-900 dark:text-white">{t('inventory.part', 'Part')}</TableHead>
              <TableHead className="text-gray-900 dark:text-white">{t('inventory.reorderPoint', 'Reorder Point')}</TableHead>
              <TableHead className="text-gray-900 dark:text-white">{t('inventory.reorderQuantity', 'Reorder Quantity')}</TableHead>
              <TableHead className="text-gray-900 dark:text-white">{t('inventory.supplier', 'Supplier')}</TableHead>
              <TableHead className="text-gray-900 dark:text-white">{t('common.status', 'Status')}</TableHead>
              <TableHead className="text-gray-900 dark:text-white">{t('inventory.lastReorder', 'Last Reorder')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reorderSettings.map((setting: any) => (
              <TableRow key={setting.id} data-testid={`row-reorder-${setting.id}`}>
                <TableCell className="font-medium">{setting.sparePartId}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">{setting.reorderPoint}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">{setting.reorderQuantity}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">{setting.supplierId}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">
                  <Badge variant={setting.isAutoReorderEnabled ? "default" : "secondary"}>
                    {setting.isAutoReorderEnabled ? t('common.enable', 'Enabled') : t('common.disable', 'Disabled')}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white">
                  {setting.lastReorderDate
                    ? new Date(setting.lastReorderDate).toLocaleDateString()
                    : t('inventory.never', 'Never')}
                </TableCell>
              </TableRow>
            ))}
            {reorderSettings.length === 0 && (
              <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-salis-gray-dark">
                <TableCell colSpan={6} className="text-center text-gray-900 dark:text-white/60">
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
    <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-900 dark:text-white">{t('inventory.inventoryTransfers', 'Inventory Transfers')}</CardTitle>
            <CardDescription className="text-gray-900 dark:text-white/60">{t('inventory.inventoryTransfersDesc', 'Multi-location inventory movement tracking')}</CardDescription>
          </div>
          <Button data-testid="button-create-transfer">
            <Plus className="mr-2 h-4 w-4" />
            {t('inventory.newTransfer', 'New Transfer')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-salis-gray-dark">
            <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-salis-gray-dark">
              <TableHead className="text-gray-900 dark:text-white">{t('inventory.transferNumber', 'Transfer #')}</TableHead>
              <TableHead className="text-gray-900 dark:text-white">{t('inventory.part', 'Part')}</TableHead>
              <TableHead className="text-gray-900 dark:text-white">{t('inventory.fromTo', 'From → To')}</TableHead>
              <TableHead className="text-gray-900 dark:text-white">{t('common.quantity', 'Quantity')}</TableHead>
              <TableHead className="text-gray-900 dark:text-white">{t('common.status', 'Status')}</TableHead>
              <TableHead className="text-gray-900 dark:text-white">{t('common.date', 'Date')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryTransfers.map((transfer: any) => (
              <TableRow key={transfer.id} data-testid={`row-transfer-${transfer.id}`}>
                <TableCell className="font-medium">{transfer.transferNumber}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">{transfer.sparePartId}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">
                  {transfer.fromGarageId} → {transfer.toGarageId}
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white">{transfer.quantity}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">
                  <Badge
                    variant={
                      transfer.transferStatus === "completed"
                        ? "default"
                        : transfer.transferStatus === "in_transit"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {transfer.transferStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white">
                  {new Date(transfer.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {inventoryTransfers.length === 0 && (
              <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-salis-gray-dark">
                <TableCell colSpan={6} className="text-center text-gray-900 dark:text-white/60">
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
    <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">{t('inventory.pricingHistory', 'Pricing History')}</CardTitle>
        <CardDescription className="text-gray-900 dark:text-white/60">{t('inventory.pricingHistoryDesc', 'Track price changes over time')}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-gray-900 dark:text-white/60 py-8">
          {t('inventory.selectPartPricing', 'Select a part to view pricing history')}
        </p>
      </CardContent>
    </Card>
  );

  const auditContent = (
    <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">{t('inventory.auditTrail', 'Inventory Audit Trail')}</CardTitle>
        <CardDescription className="text-gray-900 dark:text-white/60">{t('inventory.auditTrailDesc', 'Complete history of inventory changes')}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-gray-900 dark:text-white/60 py-8">
          {t('inventory.auditTrailInfo', 'Audit trail will display all inventory movements and changes')}
        </p>
      </CardContent>
    </Card>
  );

  const headerContent = (
    <div className="flex gap-2">
      <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
        <SelectTrigger className="w-[200px]" data-testid="select-garage">
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
            label: t('inventory.stockAlerts', 'Stock Alerts'),
            icon: AlertTriangle,
            content: alertsContent,
            badge: stockAlerts.filter((a: any) => a.alertStatus === "active").length || undefined,
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
            label: t('inventory.auditTrail', 'Audit Trail'),
            icon: History,
            content: auditContent,
          },
        ]}
      />

      <Button
        onClick={() => setIsScannerOpen(true)}
        className="fixed bottom-8 right-8 rounded-full h-14 w-14 shadow-lg"
        data-testid="button-barcode-scanner"
      >
        <Barcode className="h-6 w-6" />
      </Button>

      <BarcodeScanner
        open={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
      />
    </>
  );
}
