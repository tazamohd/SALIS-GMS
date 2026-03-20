// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TabsPageLayout, TabConfig } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, Package, Truck, DollarSign, Star, Search, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PartsMarketplace() {
  const { t } = useTranslation();
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/marketplace/orders"],
  });

  const createOrder = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/marketplace/orders", "POST", data);
    },
    onSuccess: () => {
      toast({ title: t('inventory.orderPlaced', 'Order placed'), description: t('inventory.partsOrderSubmitted', 'Your parts order has been submitted.') });
      setIsOrderDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/orders"] });
    },
  });

  const mockOrders = [
    {
      id: "1",
      marketplace: "ebay_motors",
      partNumber: "BR-2024-F150",
      partName: "Front Brake Rotors (Pair)",
      quantity: 2,
      unitPrice: 89.99,
      totalPrice: 179.98,
      sellerName: "AutoParts Pro",
      sellerRating: 4.8,
      orderStatus: "delivered",
      trackingNumber: "1Z999AA10123456784",
      orderDate: "2024-10-20T10:00:00Z",
      actualDelivery: "2024-10-24T14:30:00Z",
    },
    {
      id: "2",
      marketplace: "amazon_auto",
      partNumber: "OF-2024-CIVIC",
      partName: "Oil Filter - Honda Civic",
      quantity: 10,
      unitPrice: 12.50,
      totalPrice: 125.00,
      sellerName: "Amazon Warehouse",
      sellerRating: 4.9,
      orderStatus: "shipped",
      trackingNumber: "TBA123456789",
      estimatedDelivery: "2024-10-27T12:00:00Z",
      orderDate: "2024-10-24T09:15:00Z",
    },
    {
      id: "3",
      marketplace: "rock_auto",
      partNumber: "SP-2024-RAM",
      partName: "Spark Plugs Set (8pc)",
      quantity: 1,
      unitPrice: 45.99,
      totalPrice: 45.99,
      sellerName: "RockAuto Direct",
      sellerRating: 4.7,
      orderStatus: "confirmed",
      estimatedDelivery: "2024-10-29T12:00:00Z",
      orderDate: "2024-10-25T16:20:00Z",
    },
  ];

  const stats = {
    totalOrders: 48,
    activeOrders: 12,
    totalSpent: 8450.50,
    avgDeliveryTime: 3.5,
  };

  const marketplaceSearch = [
    {
      marketplace: "ebay_motors",
      partNumber: "WP-2024-F150",
      partName: "Water Pump Assembly",
      price: 145.99,
      sellerName: "Quality Auto Parts",
      sellerRating: 4.6,
      inStock: true,
    },
    {
      marketplace: "amazon_auto",
      partNumber: "WP-2024-F150-PRO",
      partName: "Premium Water Pump with Gasket",
      price: 189.99,
      sellerName: "Prime Auto Supply",
      sellerRating: 4.9,
      inStock: true,
    },
    {
      marketplace: "rock_auto",
      partNumber: "WP-F150-OEM",
      partName: "OEM Water Pump",
      price: 134.50,
      sellerName: "RockAuto",
      sellerRating: 4.8,
      inStock: true,
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "secondary",
      confirmed: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getMarketplaceBadge = (marketplace: string) => {
    const colors: Record<string, string> = {
      ebay_motors: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      amazon_auto: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
      rock_auto: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    };
    return (
      <Badge className={colors[marketplace] || ""}>{marketplace.replace("_", " ").toUpperCase()}</Badge>
    );
  };

  const statsContent = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-total-orders">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('inventory.totalOrders', 'Total Orders')}</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalOrders}</h3>
            </div>
            <Package className="h-12 w-12 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-active-orders">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('inventory.activeOrders', 'Active Orders')}</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.activeOrders}</h3>
            </div>
            <ShoppingCart className="h-12 w-12 text-green-600" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-total-spent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('inventory.totalSpent', 'Total Spent')}</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">${stats.totalSpent.toLocaleString()}</h3>
            </div>
            <DollarSign className="h-12 w-12 text-purple-600" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-avg-delivery">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('inventory.avgDelivery', 'Avg Delivery')}</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.avgDeliveryTime} days</h3>
            </div>
            <Truck className="h-12 w-12 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOrders = (filterFn?: (order: typeof mockOrders[0]) => boolean) => {
    const filtered = filterFn ? mockOrders.filter(filterFn) : mockOrders;
    return (
      <div className="space-y-3">
        {filtered.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            data-testid={`order-${order.id}`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{order.partName}</h3>
                {getMarketplaceBadge(order.marketplace)}
                {getStatusBadge(order.orderStatus)}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div><span className="font-medium">{t('inventory.pn', 'PN')}:</span> {order.partNumber}</div>
                <div><span className="font-medium">{t('common.quantity', 'Quantity')}:</span> {order.quantity}</div>
                <div><span className="font-medium">{t('inventory.seller', 'Seller')}:</span> {order.sellerName} ({order.sellerRating}★)</div>
                <div><span className="font-medium">{t('inventory.total', 'Total')}:</span> ${order.totalPrice}</div>
              </div>
              {order.trackingNumber && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {t('inventory.tracking', 'Tracking')}: <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{order.trackingNumber}</code>
                </p>
              )}
              {order.estimatedDelivery && order.orderStatus !== "delivered" && (
                <p className="text-sm text-blue-600 mt-1">
                  Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                </p>
              )}
              {order.actualDelivery && (
                <p className="text-sm text-green-600 mt-1">
                  Delivered: {new Date(order.actualDelivery).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabs: TabConfig[] = [
    {
      id: "all",
      label: t('inventory.allOrders', 'All Orders'),
      icon: Package,
      content: (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader><CardTitle>{t('inventory.allOrders', 'All Orders')}</CardTitle></CardHeader>
          <CardContent>{renderOrders()}</CardContent>
        </Card>
      ),
    },
    {
      id: "active",
      label: t('common.active', 'Active'),
      icon: Truck,
      content: (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader><CardTitle>{t('inventory.activeOrders', 'Active Orders')}</CardTitle></CardHeader>
          <CardContent>
            {renderOrders((o) => o.orderStatus !== "delivered" && o.orderStatus !== "cancelled")}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "delivered",
      label: t('inventory.delivered', 'Delivered'),
      icon: Package,
      content: (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader><CardTitle>{t('inventory.deliveredOrders', 'Delivered Orders')}</CardTitle></CardHeader>
          <CardContent>
            {renderOrders((o) => o.orderStatus === "delivered")}
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <TabsPageLayout
      title={t('inventory.partsMarketplace', 'Parts Marketplace')}
      description={t('inventory.partsMarketplaceDesc', 'Order parts from eBay Motors, Amazon, and RockAuto')}
      icon={ShoppingCart}
      primaryAction={{
        label: t('inventory.placeOrder', 'Place Order'),
        icon: Plus,
        onClick: () => setIsOrderDialogOpen(true),
        testId: "button-place-order",
      }}
      headerContent={statsContent}
      tabs={tabs}
      defaultTab="all"
    >
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('inventory.searchOrderParts', 'Search & Order Parts')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                placeholder={t('inventory.searchByPartNumberOrName', 'Search by part number or name...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
                data-testid="input-search-parts"
              />
              <Button data-testid="button-search">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {marketplaceSearch.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
                  data-testid={`search-result-${index}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{result.partName}</h4>
                      {getMarketplaceBadge(result.marketplace)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">PN: {result.partNumber}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{result.sellerName}</span>
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Star className="h-3 w-3 fill-current" /> {result.sellerRating}
                      </span>
                      {result.inStock && (
                        <Badge variant="secondary" className="text-xs">{t('inventory.inStock', 'In Stock')}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">${result.price}</p>
                    <Button size="sm" className="mt-2" onClick={() => {
                      createOrder.mutate({
                        marketplace: result.marketplace,
                        partNumber: result.partNumber,
                        partName: result.partName,
                        quantity: 1,
                        unitPrice: result.price
                      });
                    }} data-testid={`button-order-${index}`}>
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TabsPageLayout>
  );
}
