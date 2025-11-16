import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Package, Key, FileText, Shield, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { VendorCatalog, OemProduct, SubscriptionLicense, LicenseAuditLog, InsertVendorCatalog, InsertOemProduct, InsertSubscriptionLicense } from "@shared/schema";
import { insertVendorCatalogSchema, insertOemProductSchema, insertSubscriptionLicenseSchema } from "@shared/schema";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";

export default function OEMSoftwareSubscriptions() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("catalogs");
  const [showCatalogDialog, setShowCatalogDialog] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showLicenseDialog, setShowLicenseDialog] = useState(false);

  const { data: catalogs = [] } = useQuery<VendorCatalog[]>({ queryKey: ["/api/vendor-catalogs"] });
  const { data: products = [] } = useQuery<OemProduct[]>({ queryKey: ["/api/oem-products"] });
  const { data: licenses = [] } = useQuery<SubscriptionLicense[]>({ queryKey: ["/api/subscription-licenses"] });
  const { data: auditLogs = [] } = useQuery<LicenseAuditLog[]>({ queryKey: ["/api/license-audit-logs"] });

  const catalogForm = useForm<InsertVendorCatalog>({ 
    resolver: zodResolver(insertVendorCatalogSchema),
    defaultValues: { vendorName: "", vendorCode: "" } 
  });
  const productForm = useForm<InsertOemProduct>({ 
    resolver: zodResolver(insertOemProductSchema),
    defaultValues: { vendorCatalogId: "", productName: "", productCode: "", softwareType: "" } 
  });
  const licenseForm = useForm<InsertSubscriptionLicense>({ 
    resolver: zodResolver(insertSubscriptionLicenseSchema),
    defaultValues: { oemProductId: "", branchId: "", licenseKey: "", startDate: new Date(), endDate: new Date(), status: "active" } 
  });

  const createCatalogMutation = useMutation({
    mutationFn: (data: InsertVendorCatalog) => apiRequest("/api/vendor-catalogs", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/vendor-catalogs"] }); setShowCatalogDialog(false); toast({ title: "Catalog created" }); },
  });

  const createProductMutation = useMutation({
    mutationFn: (data: InsertOemProduct) => apiRequest("/api/oem-products", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/oem-products"] }); setShowProductDialog(false); toast({ title: "Product created" }); },
  });

  const createLicenseMutation = useMutation({
    mutationFn: (data: InsertSubscriptionLicense) => apiRequest("/api/subscription-licenses", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/subscription-licenses"] }); setShowLicenseDialog(false); toast({ title: "License created" }); },
  });

  const getVendorBadge = (vendorName: string) => {
    const vendors: { [key: string]: { bg: string; text: string; icon: string } } = {
      BMW: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: '🚗' },
      Mercedes: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: '⭐' },
      Toyota: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: '🔴' },
    };
    const config = vendors[vendorName] || { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: '🏭' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        {vendorName}
      </span>
    );
  };

  const getProductTypeBadge = (type: string) => {
    const types: { [key: string]: { bg: string; text: string; icon: string } } = {
      diagnostic_software: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: '🔧' },
      calibration_tool: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: '⚙️' },
      programming_module: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: '💻' },
    };
    const config = types[type] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: '📦' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
      </span>
    );
  };

  const getLicenseStatusBadge = (status: string) => {
    const statusColors: { [key: string]: { bg: string; text: string; icon: string } } = {
      active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: '✅' },
      expired: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: '❌' },
      suspended: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: '⏸️' },
    };
    const config = statusColors[status] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: '○' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const catalogsContent = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">Vendor Catalogs</h2>
        <Button onClick={() => { catalogForm.reset(); setShowCatalogDialog(true); }} data-testid="button-add-catalog">
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalogs.map((catalog) => (
                <TableRow key={catalog.id}>
                  <TableCell>{getVendorBadge(catalog.vendorName)}</TableCell>
                  <TableCell className="font-mono">{catalog.vendorCode}</TableCell>
                  <TableCell>{catalog.supportEmail || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${catalog.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                      {catalog.isActive ? '✅ Active' : '○ Inactive'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const productsContent = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">OEM Products</h2>
        <Button onClick={() => { productForm.reset(); setShowProductDialog(true); }} data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-semibold">{product.productName}</TableCell>
                  <TableCell>{catalogs.find(c => c.id === product.vendorCatalogId)?.vendorName || 'N/A'}</TableCell>
                  <TableCell>{getProductTypeBadge(product.softwareType || '')}</TableCell>
                  <TableCell className="font-mono text-xs">{product.version || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                      {product.isActive ? '✅ Active' : '○ Inactive'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const licensesContent = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">Software Licenses</h2>
        <Button onClick={() => { licenseForm.reset(); setShowLicenseDialog(true); }} data-testid="button-add-license">
          <Plus className="h-4 w-4 mr-2" />
          Add License
        </Button>
      </div>

      <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License Key</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map((license) => (
                <TableRow key={license.id}>
                  <TableCell className="font-mono text-xs">{license.licenseKey.substring(0, 16)}...</TableCell>
                  <TableCell>{products.find(p => p.id === license.oemProductId)?.productName || 'N/A'}</TableCell>
                  <TableCell>{new Date(license.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getLicenseStatusBadge(license.status || '')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const auditContent = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">License Audit Logs</h2>
      </div>

      <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{licenses.find(l => l.id === log.licenseId)?.licenseKey.substring(0, 12) || 'N/A'}</TableCell>
                  <TableCell>{log.eventType}</TableCell>
                  <TableCell>{log.userId || 'System'}</TableCell>
                  <TableCell>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <TabsPageLayout
        title="OEM Software Subscriptions"
        description="Manage OEM software catalogs, licenses, and compliance for BMW ISTA, Mercedes Xentry, Toyota Techstream, and more"
        icon={Package}
        tabs={[
          {
            id: "catalogs",
            label: "Vendor Catalogs",
            icon: Package,
            content: catalogsContent,
          },
          {
            id: "products",
            label: "OEM Products",
            icon: FileText,
            content: productsContent,
          },
          {
            id: "licenses",
            label: "Licenses",
            icon: Key,
            content: licensesContent,
          },
          {
            id: "audit",
            label: "Audit Logs",
            icon: Shield,
            content: auditContent,
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <Dialog open={showCatalogDialog} onOpenChange={setShowCatalogDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vendor Catalog</DialogTitle>
          </DialogHeader>
          <Form {...catalogForm}>
            <form onSubmit={catalogForm.handleSubmit((data) => createCatalogMutation.mutate(data))} className="space-y-4">
              <FormField control={catalogForm.control} name="vendorName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Name</FormLabel>
                  <FormControl><Input {...field} placeholder="BMW" /></FormControl>
                </FormItem>
              )} />
              <FormField control={catalogForm.control} name="vendorCode" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Code</FormLabel>
                  <FormControl><Input {...field} placeholder="BMW-001" /></FormControl>
                </FormItem>
              )} />
              <FormField control={catalogForm.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Active</FormLabel>
                  <FormControl><Switch checked={field.value ?? false} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={createCatalogMutation.isPending}>
                {createCatalogMutation.isPending ? "Creating..." : "Create Vendor"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
