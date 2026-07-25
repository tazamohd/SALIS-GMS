import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Network, Users, Package, Truck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { NetworkPartner, FulfillmentOrder, ShipmentEvent, WarehouseNode, InsertNetworkPartner, InsertFulfillmentOrder } from "@shared/schema";
import { insertNetworkPartnerSchema, insertFulfillmentOrderSchema } from "@shared/schema";
import { TabsPageLayout } from "@/components/layouts";

export default function PartsSupplyNetwork() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  const { data: partners = [] } = useQuery<NetworkPartner[]>({ queryKey: ["/api/network-partners"] });
  const { data: orders = [] } = useQuery<FulfillmentOrder[]>({ queryKey: ["/api/fulfillment-orders"] });
  const { data: shipments = [] } = useQuery<ShipmentEvent[]>({ queryKey: ["/api/shipment-events"] });
  const { data: warehouses = [] } = useQuery<WarehouseNode[]>({ queryKey: ["/api/warehouse-nodes"] });

  const partnerForm = useForm<InsertNetworkPartner>({ 
    resolver: zodResolver(insertNetworkPartnerSchema),
    defaultValues: { name: "", partnerType: "", country: "" } 
  });
  const orderForm = useForm<InsertFulfillmentOrder>({ 
    resolver: zodResolver(insertFulfillmentOrderSchema),
    defaultValues: { partnerId: "", branchId: "", orderNumber: "", totalAmount: "0", status: "pending" } 
  });

  const createPartnerMutation = useMutation({
    mutationFn: (data: InsertNetworkPartner) => apiRequest("/api/network-partners", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/network-partners"] }); setShowPartnerDialog(false); toast({ title: t('inventory.partnerCreated', 'Partner created') }); },
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: InsertFulfillmentOrder) => apiRequest("/api/fulfillment-orders", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/fulfillment-orders"] }); setShowOrderDialog(false); toast({ title: t('inventory.orderCreated', 'Order created') }); },
  });

  const getPartnerTypeBadge = (type: string) => {
    const types: { [key: string]: { bg: string; text: string; icon: string } } = {
      supplier: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: '🏭' },
      distributor: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: '📦' },
      manufacturer: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: '⚙️' },
    };
    const config = types[type] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: '○' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const getOrderStatusBadge = (status: string) => {
    const statusColors: { [key: string]: { bg: string; text: string; icon: string } } = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: '⏳' },
      processing: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: '🔄' },
      shipped: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: '🚚' },
      delivered: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: '✅' },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: '❌' },
    };
    const config = statusColors[status] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: '○' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const tabs = [
    {
      id: "partners",
      label: t('inventory.networkPartners', 'Network Partners'),
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">{t('inventory.networkPartners', 'Network Partners')}</h2>
            <Button onClick={() => { partnerForm.reset(); setShowPartnerDialog(true); }} data-testid="button-add-partner">
              <Plus className="h-4 w-4 mr-2" />
              {t('inventory.addPartner', 'Add Partner')}
            </Button>
          </div>

          <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('inventory.partnerName', 'Partner Name')}</TableHead>
                    <TableHead>{t('common.type', 'Type')}</TableHead>
                    <TableHead>{t('inventory.country', 'Country')}</TableHead>
                    <TableHead>{t('common.status', 'Status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-semibold">{partner.name}</TableCell>
                      <TableCell>{getPartnerTypeBadge(partner.partnerType || '')}</TableCell>
                      <TableCell>{partner.country || 'N/A'}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                          ✅ Active
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "orders",
      label: t('inventory.fulfillmentOrders', 'Fulfillment Orders'),
      icon: Package,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">{t('inventory.fulfillmentOrders', 'Fulfillment Orders')}</h2>
            <Button onClick={() => { orderForm.reset(); setShowOrderDialog(true); }} data-testid="button-add-order">
              <Plus className="h-4 w-4 mr-2" />
              {t('inventory.createOrder', 'Create Order')}
            </Button>
          </div>

          <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('inventory.orderNumber', 'Order #')}</TableHead>
                    <TableHead>{t('inventory.partner', 'Partner')}</TableHead>
                    <TableHead>{t('common.status', 'Status')}</TableHead>
                    <TableHead>{t('common.date', 'Date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-semibold">{order.orderNumber}</TableCell>
                      <TableCell>{partners.find(p => p.id === order.partnerId)?.name || 'N/A'}</TableCell>
                      <TableCell>{getOrderStatusBadge(order.status || '')}</TableCell>
                      <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "shipments",
      label: t('inventory.shipments', 'Shipments'),
      icon: Truck,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">{t('inventory.shipmentTracking', 'Shipment Tracking')}</h2>
          </div>

          <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('inventory.orderNumber', 'Order #')}</TableHead>
                    <TableHead>{t('inventory.eventType', 'Event Type')}</TableHead>
                    <TableHead>{t('inventory.location', 'Location')}</TableHead>
                    <TableHead>{t('inventory.timestamp', 'Timestamp')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-mono">{orders.find(o => o.id === shipment.fulfillmentOrderId)?.orderNumber || 'N/A'}</TableCell>
                      <TableCell>{shipment.eventType || 'N/A'}</TableCell>
                      <TableCell>{shipment.location || 'N/A'}</TableCell>
                      <TableCell>{shipment.eventDate ? new Date(shipment.eventDate).toLocaleString() : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "warehouses",
      label: t('inventory.warehouses', 'Warehouses'),
      icon: Network,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">{t('inventory.warehouseNetwork', 'Warehouse Network')}</h2>
          </div>

          <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('inventory.code', 'Code')}</TableHead>
                    <TableHead>{t('common.name', 'Name')}</TableHead>
                    <TableHead>{t('inventory.location', 'Location')}</TableHead>
                    <TableHead>{t('common.status', 'Status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouses.map((warehouse) => (
                    <TableRow key={warehouse.id}>
                      <TableCell className="font-mono font-semibold">{warehouse.id}</TableCell>
                      <TableCell>{warehouse.name}</TableCell>
                      <TableCell>{warehouse.city || 'N/A'}, {warehouse.country || 'N/A'}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                          ✅ Active
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <>
      <TabsPageLayout
        title="Parts Supply Network"
        description="Manage B2B partners, fulfillment orders, shipments, and warehouse distribution"
        icon={Network}
        tabs={tabs}
        defaultTab="partners"
      />

      <Dialog open={showPartnerDialog} onOpenChange={setShowPartnerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Network Partner</DialogTitle>
          </DialogHeader>
          <Form {...partnerForm}>
            <form onSubmit={partnerForm.handleSubmit((data) => createPartnerMutation.mutate(data))} className="space-y-4">
              <FormField control={partnerForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner Name</FormLabel>
                  <FormControl><Input {...field} placeholder="ACME Parts Co" /></FormControl>
                </FormItem>
              )} />
              <FormField control={partnerForm.control} name="partnerType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                      <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={partnerForm.control} name="country" render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl><Input {...field} value={field.value || ''} placeholder="United States" /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={createPartnerMutation.isPending}>
                {createPartnerMutation.isPending ? "Creating..." : "Create Partner"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
