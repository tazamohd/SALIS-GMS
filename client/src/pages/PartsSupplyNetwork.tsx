import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Network, Users, Package, Truck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { NetworkPartner, FulfillmentOrder, ShipmentEvent, WarehouseNode } from "@shared/schema";

export default function PartsSupplyNetwork() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("partners");
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  const { data: partners = [] } = useQuery<NetworkPartner[]>({ queryKey: ["/api/network-partners"] });
  const { data: orders = [] } = useQuery<FulfillmentOrder[]>({ queryKey: ["/api/fulfillment-orders"] });
  const { data: shipments = [] } = useQuery<ShipmentEvent[]>({ queryKey: ["/api/shipment-events"] });
  const { data: warehouses = [] } = useQuery<WarehouseNode[]>({ queryKey: ["/api/warehouse-nodes"] });

  const partnerForm = useForm<any>({ defaultValues: { partnerName: "", partnerType: "supplier", country: "", isActive: true } });
  const orderForm = useForm<any>({ defaultValues: { partnerId: "", orderNumber: "", status: "pending" } });

  const createPartnerMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/network-partners", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/network-partners"] }); setShowPartnerDialog(false); toast({ title: "Partner created" }); },
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/fulfillment-orders", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/fulfillment-orders"] }); setShowOrderDialog(false); toast({ title: "Order created" }); },
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

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-salis-black min-h-screen">
      <div className="mb-6">
        <h1 className="font-montserrat font-semibold text-2xl text-gray-900 dark:text-white" data-testid="text-page-title">Parts Supply Network</h1>
        <p className="font-poppins text-sm text-gray-600 dark:text-gray-400 mt-1" data-testid="text-page-description">
          Manage B2B partners, fulfillment orders, shipments, and warehouse distribution
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white dark:bg-salis-black/50 border border-gray-200 dark:border-salis-gray-dark" data-testid="tabs-navigation">
          <TabsTrigger value="partners" data-testid="tab-partners" className="gap-2">
            <Users className="h-4 w-4" />
            Network Partners
          </TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders" className="gap-2">
            <Package className="h-4 w-4" />
            Fulfillment Orders
          </TabsTrigger>
          <TabsTrigger value="shipments" data-testid="tab-shipments" className="gap-2">
            <Truck className="h-4 w-4" />
            Shipments
          </TabsTrigger>
          <TabsTrigger value="warehouses" data-testid="tab-warehouses" className="gap-2">
            <Network className="h-4 w-4" />
            Warehouses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">Network Partners</h2>
            <Button onClick={() => { partnerForm.reset(); setShowPartnerDialog(true); }} data-testid="button-add-partner">
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
          </div>

          <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-semibold">{partner.partnerName}</TableCell>
                      <TableCell>{getPartnerTypeBadge(partner.partnerType)}</TableCell>
                      <TableCell>{partner.country}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${partner.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                          {partner.isActive ? '✅ Active' : '○ Inactive'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">Fulfillment Orders</h2>
            <Button onClick={() => { orderForm.reset(); setShowOrderDialog(true); }} data-testid="button-add-order">
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </div>

          <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-semibold">{order.orderNumber}</TableCell>
                      <TableCell>{partners.find(p => p.id === order.partnerId)?.partnerName || 'N/A'}</TableCell>
                      <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">Shipment Tracking</h2>
          </div>

          <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-mono">{orders.find(o => o.id === shipment.orderId)?.orderNumber || 'N/A'}</TableCell>
                      <TableCell>{shipment.eventType}</TableCell>
                      <TableCell>{shipment.location || 'N/A'}</TableCell>
                      <TableCell>{new Date(shipment.eventTimestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">Warehouse Network</h2>
          </div>

          <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouses.map((warehouse) => (
                    <TableRow key={warehouse.id}>
                      <TableCell className="font-mono font-semibold">{warehouse.warehouseCode}</TableCell>
                      <TableCell>{warehouse.warehouseName}</TableCell>
                      <TableCell>{warehouse.city}, {warehouse.country}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${warehouse.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                          {warehouse.isActive ? '✅ Active' : '○ Inactive'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Partner Dialog */}
      <Dialog open={showPartnerDialog} onOpenChange={setShowPartnerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Network Partner</DialogTitle>
          </DialogHeader>
          <Form {...partnerForm}>
            <form onSubmit={partnerForm.handleSubmit((data) => createPartnerMutation.mutate(data))} className="space-y-4">
              <FormField control={partnerForm.control} name="partnerName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner Name</FormLabel>
                  <FormControl><Input {...field} placeholder="ACME Parts Co" /></FormControl>
                </FormItem>
              )} />
              <FormField control={partnerForm.control} name="partnerType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormControl><Input {...field} placeholder="United States" /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={createPartnerMutation.isPending}>
                {createPartnerMutation.isPending ? "Creating..." : "Create Partner"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
