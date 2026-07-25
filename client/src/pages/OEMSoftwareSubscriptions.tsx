import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/vendor-catalogs"] }); setShowCatalogDialog(false); toast({ title: t('oem.catalogCreated', 'Catalog created') }); },
  });

  const createProductMutation = useMutation({
    mutationFn: (data: InsertOemProduct) => apiRequest("/api/oem-products", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/oem-products"] }); setShowProductDialog(false); toast({ title: t('oem.productCreated', 'Product created') }); },
  });

  const createLicenseMutation = useMutation({
    mutationFn: (data: InsertSubscriptionLicense) => apiRequest("/api/subscription-licenses", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/subscription-licenses"] }); setShowLicenseDialog(false); toast({ title: t('oem.licenseCreated', 'License created') }); },
  });

  const getVendorBadge = (vendorName: string) => {
    const vendors: { [key: string]: { bg: string; text: string } } = {
      BMW: { bg: 'bg-[#0A5ED7]/10', text: 'text-[#0A5ED7]' },
      Mercedes: { bg: 'bg-[#64748B]/10', text: 'text-[#64748B]' },
      Toyota: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
    };
    const config = vendors[vendorName] || { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {vendorName}
      </span>
    );
  };

  const getProductTypeBadge = (type: string) => {
    const types: { [key: string]: { bg: string; text: string } } = {
      diagnostic_software: { bg: 'bg-[#0A5ED7]/10', text: 'text-[#0A5ED7]' },
      calibration_tool: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
      programming_module: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
    };
    const config = types[type] || { bg: 'bg-[#64748B]/10', text: 'text-[#64748B]' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
      </span>
    );
  };

  const getLicenseStatusBadge = (status: string) => {
    const statusColors: { [key: string]: { bg: string; text: string } } = {
      active: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
      expired: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
      suspended: { bg: 'bg-[#F97316]/10', text: 'text-[#F97316]' },
    };
    const config = statusColors[status] || { bg: 'bg-[#64748B]/10', text: 'text-[#64748B]' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const catalogsContent = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg text-[#0B1F3B] dark:text-white">{t('oem.vendorCatalogs', 'Vendor Catalogs')}</h2>
        <Button 
          onClick={() => { catalogForm.reset(); setShowCatalogDialog(true); }} 
          data-testid="button-add-catalog"
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('oem.addVendor', 'Add Vendor')}
        </Button>
      </div>

      <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('oem.vendor', 'Vendor')}</TableHead>
                <TableHead className="text-[#64748B]">{t('oem.code', 'Code')}</TableHead>
                <TableHead className="text-[#64748B]">{t('oem.contact', 'Contact')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalogs.map((catalog) => (
                <TableRow key={catalog.id} className="border-[#E2E8F0] dark:border-[#232A36]">
                  <TableCell>{getVendorBadge(catalog.vendorName)}</TableCell>
                  <TableCell className="font-mono text-[#0B1F3B] dark:text-white">{catalog.vendorCode}</TableCell>
                  <TableCell className="text-[#64748B]">{catalog.supportEmail || t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${catalog.isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-[#64748B]/10 text-[#64748B]'}`}>
                      {catalog.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
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
        <h2 className="font-semibold text-lg text-[#0B1F3B] dark:text-white">{t('oem.oemProducts', 'OEM Products')}</h2>
        <Button 
          onClick={() => { productForm.reset(); setShowProductDialog(true); }} 
          data-testid="button-add-product"
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('oem.addProduct', 'Add Product')}
        </Button>
      </div>

      <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('oem.productName', 'Product Name')}</TableHead>
                <TableHead className="text-[#64748B]">{t('oem.vendor', 'Vendor')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.type', 'Type')}</TableHead>
                <TableHead className="text-[#64748B]">{t('oem.version', 'Version')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="border-[#E2E8F0] dark:border-[#232A36]">
                  <TableCell className="font-semibold text-[#0B1F3B] dark:text-white">{product.productName}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{catalogs.find(c => c.id === product.vendorCatalogId)?.vendorName || t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell>{getProductTypeBadge(product.softwareType || '')}</TableCell>
                  <TableCell className="font-mono text-xs text-[#64748B]">{product.version || t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${product.isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-[#64748B]/10 text-[#64748B]'}`}>
                      {product.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
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
        <h2 className="font-semibold text-lg text-[#0B1F3B] dark:text-white">{t('oem.softwareLicenses', 'Software Licenses')}</h2>
        <Button 
          onClick={() => { licenseForm.reset(); setShowLicenseDialog(true); }} 
          data-testid="button-add-license"
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('oem.addLicense', 'Add License')}
        </Button>
      </div>

      <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('oem.licenseKey', 'License Key')}</TableHead>
                <TableHead className="text-[#64748B]">{t('oem.product', 'Product')}</TableHead>
                <TableHead className="text-[#64748B]">{t('oem.expires', 'Expires')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map((license) => (
                <TableRow key={license.id} className="border-[#E2E8F0] dark:border-[#232A36]">
                  <TableCell className="font-mono text-xs text-[#0B1F3B] dark:text-white">{license.licenseKey.substring(0, 16)}...</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{products.find(p => p.id === license.oemProductId)?.productName || t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell className="text-[#64748B]">{new Date(license.endDate).toLocaleDateString()}</TableCell>
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
        <h2 className="font-semibold text-lg text-[#0B1F3B] dark:text-white">{t('oem.licenseAuditLogs', 'License Audit Logs')}</h2>
      </div>

      <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('oem.license', 'License')}</TableHead>
                <TableHead className="text-[#64748B]">{t('oem.event', 'Event')}</TableHead>
                <TableHead className="text-[#64748B]">{t('oem.user', 'User')}</TableHead>
                <TableHead className="text-[#64748B]">{t('oem.timestamp', 'Timestamp')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id} className="border-[#E2E8F0] dark:border-[#232A36]">
                  <TableCell className="font-mono text-xs text-[#0B1F3B] dark:text-white">{licenses.find(l => l.id === log.licenseId)?.licenseKey.substring(0, 12) || t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{log.eventType}</TableCell>
                  <TableCell className="text-[#64748B]">{log.userId || t('oem.system', 'System')}</TableCell>
                  <TableCell className="text-[#64748B]">{log.timestamp ? new Date(log.timestamp).toLocaleString() : t('common.notAvailable', 'N/A')}</TableCell>
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
        title={t('oem.title', 'OEM Software Subscriptions')}
        description={t('oem.description', 'Manage OEM software catalogs, licenses, and compliance for BMW ISTA, Mercedes Xentry, Toyota Techstream, and more')}
        icon={Package}
        tabs={[
          {
            id: "catalogs",
            label: t('oem.vendorCatalogs', 'Vendor Catalogs'),
            icon: Package,
            content: catalogsContent,
          },
          {
            id: "products",
            label: t('oem.oemProducts', 'OEM Products'),
            icon: FileText,
            content: productsContent,
          },
          {
            id: "licenses",
            label: t('oem.licenses', 'Licenses'),
            icon: Key,
            content: licensesContent,
          },
          {
            id: "audit",
            label: t('oem.auditLogs', 'Audit Logs'),
            icon: Shield,
            content: auditContent,
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <Dialog open={showCatalogDialog} onOpenChange={setShowCatalogDialog}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('oem.addVendorCatalog', 'Add Vendor Catalog')}</DialogTitle>
          </DialogHeader>
          <Form {...catalogForm}>
            <form onSubmit={catalogForm.handleSubmit((data) => createCatalogMutation.mutate(data))} className="space-y-4">
              <FormField control={catalogForm.control} name="vendorName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('oem.vendorName', 'Vendor Name')}</FormLabel>
                  <FormControl><Input {...field} placeholder="BMW" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" /></FormControl>
                </FormItem>
              )} />
              <FormField control={catalogForm.control} name="vendorCode" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('oem.vendorCode', 'Vendor Code')}</FormLabel>
                  <FormControl><Input {...field} placeholder="BMW-001" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" /></FormControl>
                </FormItem>
              )} />
              <FormField control={catalogForm.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.active', 'Active')}</FormLabel>
                  <FormControl><Switch checked={field.value ?? false} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" disabled={createCatalogMutation.isPending}>
                {createCatalogMutation.isPending ? t('oem.creating', 'Creating...') : t('oem.createVendor', 'Create Vendor')}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
