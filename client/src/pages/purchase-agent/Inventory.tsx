import { useState } from "react";
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
      healthy: { variant: "outline", label: "Healthy", icon: CheckCircle },
      warning: { variant: "secondary", label: "Warning", icon: AlertTriangle },
      low: { variant: "destructive", label: "Low Stock", icon: TrendingDown },
      out_of_stock: { variant: "destructive", label: "Out of Stock", icon: Package },
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inventory Needs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor stock levels and identify reorder needs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{spareParts.length}</div>
                <p className="text-sm text-gray-500">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/20">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{lowStockItems.length}</div>
                <p className="text-sm text-gray-500">Need Reorder</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-900/20">
                <TrendingDown className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">{outOfStockItems.length}</div>
                <p className="text-sm text-gray-500">Out of Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{healthyItems.length}</div>
                <p className="text-sm text-gray-500">Healthy Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <CardTitle className="text-red-700 dark:text-red-400">
                  Critical Stock Alert
                </CardTitle>
              </div>
              <Link href="/purchase-agent/orders">
                <Button size="sm" data-testid="button-create-bulk-order">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Create Bulk Order
                </Button>
              </Link>
            </div>
            <CardDescription>
              {lowStockItems.length} items require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.slice(0, 6).map((part) => {
                const inv = getPartInventory(part.id);
                return (
                  <div
                    key={part.id}
                    className="p-3 bg-white dark:bg-salis-gray-dark rounded-lg border"
                    data-testid={`critical-item-${part.id}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">{part.name}</p>
                        <p className="text-xs text-gray-500">{part.sku}</p>
                      </div>
                      {getStatusBadge(getStockStatus(part))}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Current: {inv?.stockQuantity || 0}</span>
                        <span>Min: {inv?.minThreshold || 0}</span>
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

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search parts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-44" data-testid="select-stock-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Stock Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="healthy">Healthy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading inventory...</div>
          ) : filteredParts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No items found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>In Stock</TableHead>
                  <TableHead>Min Level</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts.map((part) => {
                  const inv = getPartInventory(part.id);
                  return (
                    <TableRow key={part.id} data-testid={`row-part-${part.id}`}>
                      <TableCell className="font-medium">{part.name}</TableCell>
                      <TableCell>{part.sku}</TableCell>
                      <TableCell>{part.category || "N/A"}</TableCell>
                      <TableCell className="font-semibold">{inv?.stockQuantity || 0}</TableCell>
                      <TableCell>{inv?.minThreshold || 0}</TableCell>
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
