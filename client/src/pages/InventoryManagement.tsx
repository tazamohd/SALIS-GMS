import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export default function InventoryManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedGarageId, setSelectedGarageId] = useState<string>("");

  // Fetch garages
  const { data: garages = [] } = useQuery<any[]>({
    queryKey: ["/api/garages"],
  });

  // Set default garage
  useState(() => {
    if (garages.length > 0 && !selectedGarageId) {
      setSelectedGarageId(garages[0].id);
    }
  });

  // Fetch spare parts
  const { data: spareParts = [] } = useQuery<any[]>({
    queryKey: ["/api/spare-parts"],
  });

  // Fetch stock alerts
  const { data: stockAlerts = [] } = useQuery<any[]>({
    queryKey: ["/api/stock-alerts", selectedGarageId],
    enabled: !!selectedGarageId,
  });

  // Fetch reorder settings
  const { data: reorderSettings = [] } = useQuery<any[]>({
    queryKey: ["/api/reorder-settings", selectedGarageId],
    enabled: !!selectedGarageId,
  });

  // Fetch inventory transfers
  const { data: inventoryTransfers = [] } = useQuery<any[]>({
    queryKey: ["/api/inventory-transfers", selectedGarageId],
    enabled: !!selectedGarageId,
  });

  // Acknowledge alert mutation
  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: string) =>
      apiRequest("POST", `/api/stock-alerts/${alertId}/acknowledge`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock-alerts"] });
      toast({
        title: "Alert Acknowledged",
        description: "Stock alert has been acknowledged successfully",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory & Parts Management</h1>
          <p className="text-muted-foreground mt-2">
            Advanced inventory control with stock alerts, auto-reordering, and multi-location transfers
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
            <SelectTrigger className="w-[200px]" data-testid="select-garage">
              <SelectValue placeholder="Select Garage" />
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Package className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Stock Alerts
          </TabsTrigger>
          <TabsTrigger value="reorder" data-testid="tab-reorder">
            <Settings className="mr-2 h-4 w-4" />
            Auto-Reorder
          </TabsTrigger>
          <TabsTrigger value="transfers" data-testid="tab-transfers">
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Transfers
          </TabsTrigger>
          <TabsTrigger value="pricing" data-testid="tab-pricing">
            <TrendingUp className="mr-2 h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">
            <History className="mr-2 h-4 w-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{spareParts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Active items</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stockAlerts.filter((a: any) => a.alertStatus === "active").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pending Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {inventoryTransfers.filter((t: any) => t.transferStatus === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Auto-Reorder Enabled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {reorderSettings.filter((r: any) => r.isAutoReorderEnabled).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Active rules</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Summary</CardTitle>
              <CardDescription>Quick overview of parts inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search parts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-parts"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock Status</TableHead>
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
                        <TableCell>{part.sku}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{part.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">In Stock</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Stock Alerts</CardTitle>
                  <CardDescription>Low stock and out-of-stock notifications</CardDescription>
                </div>
                <Button data-testid="button-create-alert">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Alert
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert Type</TableHead>
                    <TableHead>Part</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockAlerts.map((alert: any) => (
                    <TableRow key={alert.id} data-testid={`row-alert-${alert.id}`}>
                      <TableCell>
                        <Badge variant={alert.alertType === "out_of_stock" ? "destructive" : "outline"}>
                          {alert.alertType === "out_of_stock" ? "Out of Stock" : "Low Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>{alert.sparePartId}</TableCell>
                      <TableCell>{alert.currentQuantity}</TableCell>
                      <TableCell>{alert.threshold}</TableCell>
                      <TableCell>
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
                      <TableCell>
                        {alert.alertStatus === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeMutation.mutate(alert.id)}
                            data-testid={`button-acknowledge-${alert.id}`}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Acknowledge
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {stockAlerts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No stock alerts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto-Reorder Tab */}
        <TabsContent value="reorder" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Automatic Reorder Settings</CardTitle>
                  <CardDescription>Configure automatic reordering rules for parts</CardDescription>
                </div>
                <Button data-testid="button-create-reorder-rule">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part</TableHead>
                    <TableHead>Reorder Point</TableHead>
                    <TableHead>Reorder Quantity</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Reorder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reorderSettings.map((setting: any) => (
                    <TableRow key={setting.id} data-testid={`row-reorder-${setting.id}`}>
                      <TableCell className="font-medium">{setting.sparePartId}</TableCell>
                      <TableCell>{setting.reorderPoint}</TableCell>
                      <TableCell>{setting.reorderQuantity}</TableCell>
                      <TableCell>{setting.supplierId}</TableCell>
                      <TableCell>
                        <Badge variant={setting.isAutoReorderEnabled ? "default" : "secondary"}>
                          {setting.isAutoReorderEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {setting.lastReorderDate
                          ? new Date(setting.lastReorderDate).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {reorderSettings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No reorder rules configured
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventory Transfers</CardTitle>
                  <CardDescription>Multi-location inventory movement tracking</CardDescription>
                </div>
                <Button data-testid="button-create-transfer">
                  <Plus className="mr-2 h-4 w-4" />
                  New Transfer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer #</TableHead>
                    <TableHead>Part</TableHead>
                    <TableHead>From → To</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryTransfers.map((transfer: any) => (
                    <TableRow key={transfer.id} data-testid={`row-transfer-${transfer.id}`}>
                      <TableCell className="font-medium">{transfer.transferNumber}</TableCell>
                      <TableCell>{transfer.sparePartId}</TableCell>
                      <TableCell>
                        {transfer.fromGarageId} → {transfer.toGarageId}
                      </TableCell>
                      <TableCell>{transfer.quantity}</TableCell>
                      <TableCell>
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
                      <TableCell>
                        {new Date(transfer.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {inventoryTransfers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No transfers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing History Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing History</CardTitle>
              <CardDescription>Track price changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Select a part to view pricing history
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Audit Trail</CardTitle>
              <CardDescription>Complete history of inventory changes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Audit trail will display all inventory movements and changes
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* TecDoc Search Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="fixed bottom-8 right-8 rounded-full h-14 w-14 shadow-lg" data-testid="button-tecdoc-search">
            <Barcode className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>TecDoc Parts Search</DialogTitle>
            <DialogDescription>
              Search the TecDoc catalog for parts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Enter part number or description..." data-testid="input-tecdoc-search" />
            <Button className="w-full" data-testid="button-search-tecdoc">
              <SearchIcon className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
