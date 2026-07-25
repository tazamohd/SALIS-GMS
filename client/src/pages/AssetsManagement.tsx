import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Building2,
  Car,
  Wrench,
  Computer,
  Plus,
  Search,
  Download,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  FileText,
  Printer,
  AlertTriangle,
  CheckCircle,
  Package,
  ExternalLink,
  CreditCard,
} from "lucide-react";

const assetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  category: z.string().min(1, "Category is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  purchaseValue: z.string().min(1, "Purchase value is required"),
  currentValue: z.string().min(1, "Current value is required"),
  depreciationRate: z.string().min(1, "Depreciation rate is required"),
  location: z.string().min(1, "Location is required"),
  serialNumber: z.string().optional(),
  condition: z.string().min(1, "Condition is required"),
});

type AssetFormData = z.infer<typeof assetSchema>;

const sampleAssets = [
  {
    id: "1",
    name: "Hydraulic Lift - Bay 1",
    category: "Equipment",
    purchaseDate: "2022-01-15",
    purchaseValue: 45000,
    currentValue: 36000,
    depreciationRate: 10,
    location: "Service Bay 1",
    serialNumber: "HL-2022-001",
    condition: "Excellent",
    status: "Active",
  },
  {
    id: "2",
    name: "Diagnostic Scanner Pro",
    category: "Equipment",
    purchaseDate: "2023-03-20",
    purchaseValue: 15000,
    currentValue: 13500,
    depreciationRate: 15,
    location: "Diagnostic Center",
    serialNumber: "DS-2023-045",
    condition: "Good",
    status: "Active",
  },
  {
    id: "3",
    name: "Company Vehicle - Toyota Hilux",
    category: "Vehicle",
    purchaseDate: "2021-06-10",
    purchaseValue: 120000,
    currentValue: 84000,
    depreciationRate: 15,
    location: "Parking Lot",
    serialNumber: "VH-2021-003",
    condition: "Good",
    status: "Active",
  },
  {
    id: "4",
    name: "Office Computer System",
    category: "IT Equipment",
    purchaseDate: "2023-01-05",
    purchaseValue: 8000,
    currentValue: 6400,
    depreciationRate: 20,
    location: "Front Office",
    serialNumber: "PC-2023-012",
    condition: "Excellent",
    status: "Active",
  },
  {
    id: "5",
    name: "Workshop Building",
    category: "Property",
    purchaseDate: "2018-05-01",
    purchaseValue: 2500000,
    currentValue: 2250000,
    depreciationRate: 2,
    location: "Main Facility",
    serialNumber: "PROP-001",
    condition: "Excellent",
    status: "Active",
  },
];

const depreciationSchedule = [
  { year: 2024, startValue: 2688000, depreciation: 268800, endValue: 2419200 },
  { year: 2025, startValue: 2419200, depreciation: 241920, endValue: 2177280 },
  { year: 2026, startValue: 2177280, depreciation: 217728, endValue: 1959552 },
  { year: 2027, startValue: 1959552, depreciation: 195955, endValue: 1763597 },
  { year: 2028, startValue: 1763597, depreciation: 176360, endValue: 1587237 },
];

export default function AssetsManagement() {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      category: "",
      purchaseDate: "",
      purchaseValue: "",
      currentValue: "",
      depreciationRate: "",
      location: "",
      serialNumber: "",
      condition: "",
    },
  });

  const onSubmit = (data: AssetFormData) => {
    console.log("New asset:", data);
    setIsAddDialogOpen(false);
    form.reset();
  };

  const filteredAssets = sampleAssets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalAssetValue = sampleAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const totalDepreciation = sampleAssets.reduce(
    (sum, asset) => sum + (asset.purchaseValue - asset.currentValue),
    0
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Equipment":
        return <Wrench className="h-4 w-4" />;
      case "Vehicle":
        return <Car className="h-4 w-4" />;
      case "IT Equipment":
        return <Computer className="h-4 w-4" />;
      case "Property":
        return <Building2 className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const fixedAssetsTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-assets">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('assets.totalAssetValue', 'Total Asset Value')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0A5ED7]">
              SAR {totalAssetValue.toLocaleString()}
            </div>
            <p className="text-xs text-[#64748B] mt-1">{t('assets.currentBookValue', 'Current book value')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-depreciation">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('assets.totalDepreciation', 'Total Depreciation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F97316]">
              SAR {totalDepreciation.toLocaleString()}
            </div>
            <p className="text-xs text-[#64748B] mt-1">{t('assets.accumulated', 'Accumulated')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-asset-count">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('assets.totalAssets', 'Total Assets')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{sampleAssets.length}</div>
            <p className="text-xs text-[#64748B] mt-1">{t('assets.activeAssets', 'Active assets')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-depreciation-rate">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('assets.avgDepreciation', 'Avg Depreciation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">12.4%</div>
            <p className="text-xs text-[#64748B] mt-1">{t('assets.annualRate', 'Annual rate')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('assets.fixedAssetsRegister', 'Fixed Assets Register')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('assets.fixedAssetsDescription', 'Track all company fixed assets')}</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#0aa0e6] text-white" data-testid="button-add-asset">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('assets.addAsset', 'Add Asset')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="modal-add-asset">
                <DialogHeader>
                  <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('assets.addNewAsset', 'Add New Asset')}</DialogTitle>
                  <DialogDescription className="text-[#64748B]">{t('assets.addNewAssetDescription', 'Register a new fixed asset')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('assets.assetName', 'Asset Name')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('assets.enterAssetName', 'Enter asset name')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-asset-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.category', 'Category')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-category">
                                  <SelectValue placeholder={t('assets.selectCategory', 'Select category')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                                <SelectItem value="Equipment">{t('assets.equipment', 'Equipment')}</SelectItem>
                                <SelectItem value="Vehicle">{t('assets.vehicle', 'Vehicle')}</SelectItem>
                                <SelectItem value="IT Equipment">{t('assets.itEquipment', 'IT Equipment')}</SelectItem>
                                <SelectItem value="Property">{t('assets.property', 'Property')}</SelectItem>
                                <SelectItem value="Furniture">{t('assets.furniture', 'Furniture')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="purchaseDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('assets.purchaseDate', 'Purchase Date')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-purchase-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="purchaseValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('assets.purchaseValueSAR', 'Purchase Value (SAR)')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0.00" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-purchase-value" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="currentValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('assets.currentValueSAR', 'Current Value (SAR)')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0.00" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-current-value" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="depreciationRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('assets.depreciationRatePercent', 'Depreciation Rate (%)')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="10" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-depreciation-rate" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('assets.location', 'Location')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('assets.enterLocation', 'Enter location')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-location" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="serialNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('assets.serialNumber', 'Serial Number')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('common.optional', 'Optional')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-serial-number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('assets.condition', 'Condition')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-condition">
                                  <SelectValue placeholder={t('assets.selectCondition', 'Select condition')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                                <SelectItem value="Excellent">{t('assets.excellent', 'Excellent')}</SelectItem>
                                <SelectItem value="Good">{t('assets.good', 'Good')}</SelectItem>
                                <SelectItem value="Fair">{t('assets.fair', 'Fair')}</SelectItem>
                                <SelectItem value="Poor">{t('assets.poor', 'Poor')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                        {t('common.cancel', 'Cancel')}
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#0aa0e6] text-white" data-testid="button-save-asset">{t('assets.saveAsset', 'Save Asset')}</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder={t('assets.searchAssets', 'Search assets...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                data-testid="input-search-assets"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-filter-category">
                <SelectValue placeholder={t('assets.filterByCategory', 'Filter by category')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="all">{t('assets.allCategories', 'All Categories')}</SelectItem>
                <SelectItem value="Equipment">{t('assets.equipment', 'Equipment')}</SelectItem>
                <SelectItem value="Vehicle">{t('assets.vehicle', 'Vehicle')}</SelectItem>
                <SelectItem value="IT Equipment">{t('assets.itEquipment', 'IT Equipment')}</SelectItem>
                <SelectItem value="Property">{t('assets.property', 'Property')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="button-export-assets">
              <Download className="h-4 w-4 mr-2" />
              {t('common.export', 'Export')}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('assets.asset', 'Asset')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.category', 'Category')}</TableHead>
                <TableHead className="text-[#64748B]">{t('assets.purchaseValue', 'Purchase Value')}</TableHead>
                <TableHead className="text-[#64748B]">{t('assets.currentValue', 'Current Value')}</TableHead>
                <TableHead className="text-[#64748B]">{t('assets.depreciation', 'Depreciation')}</TableHead>
                <TableHead className="text-[#64748B]">{t('assets.condition', 'Condition')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-asset-${asset.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-[#0A5ED7]">{getCategoryIcon(asset.category)}</span>
                      <div>
                        <div className="font-medium text-[#0B1F3B] dark:text-white">{asset.name}</div>
                        <div className="text-xs text-[#64748B]">{asset.serialNumber}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{asset.category}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">SAR {asset.purchaseValue.toLocaleString()}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">SAR {asset.currentValue.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-[#0B1F3B] dark:text-white">{asset.depreciationRate}%</span>
                      <Progress value={100 - (asset.currentValue / asset.purchaseValue) * 100} className="w-16 h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={asset.condition === "Excellent" ? "bg-[#0A5ED7] text-white" : "bg-[#F8FAFC] dark:bg-[#232A36] text-[#64748B]"}>
                      {asset.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#0A5ED7] text-[#0A5ED7]">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t('common.active', 'Active')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('assets.relatedFinancialModules', 'Related Financial Modules')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('assets.relatedFinancialModulesDescription', 'Quick access to balance sheet items')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/liabilities-management">
              <Card className="cursor-pointer hover:border-[#0A5ED7] transition-colors h-full bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="link-liabilities-management">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CreditCard className="h-8 w-8 text-[#F97316]" />
                    <ExternalLink className="h-4 w-4 text-[#64748B]" />
                  </div>
                  <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('assets.liabilitiesObligations', 'Liabilities & Obligations')}</CardTitle>
                  <CardDescription className="text-[#64748B]">{t('assets.liabilitiesArabic', 'Liabilities Arabic')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#64748B]">{t('assets.liabilitiesDescription', 'Manage company debts, loans, and financial obligations')}</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/equity-management">
              <Card className="cursor-pointer hover:border-[#0A5ED7] transition-colors h-full bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="link-equity-management">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <DollarSign className="h-8 w-8 text-[#0A5ED7]" />
                    <ExternalLink className="h-4 w-4 text-[#64748B]" />
                  </div>
                  <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('assets.equityManagement', 'Equity Management')}</CardTitle>
                  <CardDescription className="text-[#64748B]">{t('assets.equityArabic', 'Equity Arabic')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#64748B]">{t('assets.equityDescription', 'Track owner\'s capital, investments, and retained earnings')}</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const depreciationTab = (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('assets.depreciationSchedule', 'Depreciation Schedule')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('assets.depreciationScheduleDescription', '5-year depreciation forecast')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('assets.year', 'Year')}</TableHead>
                <TableHead className="text-[#64748B]">{t('assets.startValue', 'Start Value')}</TableHead>
                <TableHead className="text-[#64748B]">{t('assets.depreciation', 'Depreciation')}</TableHead>
                <TableHead className="text-[#64748B]">{t('assets.endValue', 'End Value')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depreciationSchedule.map((schedule) => (
                <TableRow key={schedule.year} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-depreciation-${schedule.year}`}>
                  <TableCell className="font-medium text-[#0B1F3B] dark:text-white">{schedule.year}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">SAR {schedule.startValue.toLocaleString()}</TableCell>
                  <TableCell className="text-[#F97316]">SAR {schedule.depreciation.toLocaleString()}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">SAR {schedule.endValue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    {
      id: "fixed-assets",
      label: t('assets.fixedAssets', 'Fixed Assets'),
      icon: Building2,
      content: fixedAssetsTab,
    },
    {
      id: "depreciation",
      label: t('assets.depreciation', 'Depreciation'),
      icon: TrendingDown,
      content: depreciationTab,
    },
  ];

  return (
    <div className="p-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <TabsPageLayout
        title={t('assets.title', 'Assets Management')}
        description={t('assets.description', 'Track and manage all company fixed assets')}
        defaultTab="fixed-assets"
        tabs={tabs}
      />
    </div>
  );
}
