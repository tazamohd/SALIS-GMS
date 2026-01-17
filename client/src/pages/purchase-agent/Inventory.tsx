import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Package,
  TrendingDown,
  ShoppingCart,
  Filter,
} from "lucide-react";
import { Link } from "wouter";
import type { SparePart, SparePartInventory } from "@shared/schema";

export default function PurchaseAgentInventory() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("all");

  const { data: spareParts = [], isLoading } = useQuery<SparePart[]>({
    queryKey: ["/api/spare-parts"],
  });

  const { data: inventories = [] } = useQuery<SparePartInventory[]>({
    queryKey: ["/api/spare-part-inventories"],
  });

  const getPartInventory = (partId: string) => {
    return inventories.find(inv => inv.sparePartId === partId);
  };

  const getStockStatus = (part: SparePart) => {
    const inv = getPartInventory(part.id);
    const qty = inv?.stockQuantity || 0;
    const min = inv?.minThreshold || 0;
    
    if (qty === 0) return "out_of_stock";
    if (qty <= min) return "low";
    if (qty <= min * 1.5) return "warning";
    return "healthy";
  };

  const getStockLevel = (part: SparePart) => {
    const inv = getPartInventory(part.id);
    const qty = inv?.stockQuantity || 0;
    const max = (inv?.minThreshold || 1) * 3;
    return Math.min((qty / max) * 100, 100);
  };

  const filteredParts = spareParts.filter((part) => {
    const matchesSearch =
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (stockFilter === "all") return matchesSearch;
    return matchesSearch && getStockStatus(part) === stockFilter;
  });

  const lowStockItems = spareParts.filter((p) => {
    const status = getStockStatus(p);
    return status === "low" || status === "out_of_stock";
  });

  const outOfStockItems = spareParts.filter((p) => getStockStatus(p) === "out_of_stock");
  const healthyItems = spareParts.filter((p) => getStockStatus(p) === "healthy");

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: any }> = {
      healthy: { variant: "outline", label: t('purchaseAgent.healthy', 'Healthy'), icon: CheckCircle },
      warning: { variant: "secondary", label: t('purchaseAgent.warning', 'Warning'), icon: AlertTriangle },
      low: { variant: "destructive", label: t('purchaseAgent.lowStock', 'Low Stock'), icon: TrendingDown },
      out_of_stock: { variant: "destructive", label: t('purchaseAgent.outOfStock', 'Out of Stock'), icon: Package },
    };
    const { variant, label, icon: Icon } = config[status] || config.healthy;
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
            {t('purchaseAgent.inventoryNeeds', 'Inventory Needs')}
          </h1>
          <p className="text-[#64748B] mt-1">
            {t('purchaseAgent.monitorStockLevels', 'Monitor stock levels and identify reorder needs')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                <Package className="h-6 w-6 text-[#0A5ED7]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{spareParts.length}</div>
                <p className="text-sm text-[#64748B]">{t('purchaseAgent.totalItems', 'Total Items')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/20">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{lowStockItems.length}</div>
                <p className="text-sm text-[#64748B]">{t('purchaseAgent.needReorder', 'Need Reorder')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-900/20">
                <TrendingDown className="h-6 w-6 text-[#F97316]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#F97316]">{outOfStockItems.length}</div>
                <p className="text-sm text-[#64748B]">{t('purchaseAgent.outOfStock', 'Out of Stock')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{healthyItems.length}</div>
                <p className="text-sm text-[#64748B]">{t('purchaseAgent.healthyStock', 'Healthy Stock')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="bg-white dark:bg-[#151A23] border-red-200 dark:border-red-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <CardTitle className="text-red-700 dark:text-red-400">
                  {t('purchaseAgent.criticalStockAlert', 'Critical Stock Alert')}
                </CardTitle>
              </div>
              <Link href="/purchase-agent/orders">
                <Button size="sm" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white" data-testid="button-create-bulk-order">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {t('purchaseAgent.createBulkOrder', 'Create Bulk Order')}
                </Button>
              </Link>
            </div>
            <CardDescription className="text-[#64748B]">
              {t('purchaseAgent.itemsRequireAttention', '{{count}} items require immediate attention', { count: lowStockItems.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.slice(0, 6).map((part) => {
                const inv = getPartInventory(part.id);
                return (
                  <div
                    key={part.id}
                    className="p-3 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]"
                    data-testid={`critical-item-${part.id}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">{part.name}</p>
                        <p className="text-xs text-[#64748B]">{part.sku}</p>
                      </div>
                      {getStatusBadge(getStockStatus(part))}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-[#64748B]">
                        <span>{t('purchaseAgent.current', 'Current')}: {inv?.stockQuantity || 0}</span>
                        <span>{t('purchaseAgent.min', 'Min')}: {inv?.minThreshold || 0}</span>
                      </div>
                      <Progress
                        value={getStockLevel(part)}
                        className="h-2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <Input
                  placeholder={t('purchaseAgent.searchParts', 'Search parts...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-search"
                />
              </div>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-44 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-stock-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t('purchaseAgent.stockLevel', 'Stock Level')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('purchaseAgent.allLevels', 'All Levels')}</SelectItem>
                  <SelectItem value="low">{t('purchaseAgent.lowStock', 'Low Stock')}</SelectItem>
                  <SelectItem value="out_of_stock">{t('purchaseAgent.outOfStock', 'Out of Stock')}</SelectItem>
                  <SelectItem value="warning">{t('purchaseAgent.warning', 'Warning')}</SelectItem>
                  <SelectItem value="healthy">{t('purchaseAgent.healthy', 'Healthy')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-[#64748B]">{t('purchaseAgent.loadingInventory', 'Loading inventory...')}</div>
          ) : filteredParts.length === 0 ? (
            <div className="text-center py-8 text-[#64748B]">
              {t('purchaseAgent.noItemsFound', 'No items found')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                  <TableHead className="text-[#0B1F3B] dark:text-white">{t('purchaseAgent.part', 'Part')}</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">{t('purchaseAgent.sku', 'SKU')}</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">{t('purchaseAgent.category', 'Category')}</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">{t('purchaseAgent.inStock', 'In Stock')}</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">{t('purchaseAgent.minLevel', 'Min Level')}</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">{t('purchaseAgent.stockLevel', 'Stock Level')}</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts.map((part) => {
                  const inv = getPartInventory(part.id);
                  return (
                    <TableRow key={part.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-part-${part.id}`}>
                      <TableCell className="font-medium text-[#0B1F3B] dark:text-white">{part.name}</TableCell>
                      <TableCell className="text-[#64748B]">{part.sku}</TableCell>
                      <TableCell className="text-[#64748B]">{part.category || t('common.na', 'N/A')}</TableCell>
                      <TableCell className="font-semibold text-[#0B1F3B] dark:text-white">{inv?.stockQuantity || 0}</TableCell>
                      <TableCell className="text-[#64748B]">{inv?.minThreshold || 0}</TableCell>
                      <TableCell className="w-32">
                        <Progress value={getStockLevel(part)} className="h-2" />
                      </TableCell>
                      <TableCell>{getStatusBadge(getStockStatus(part))}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
