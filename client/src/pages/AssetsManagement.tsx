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
        <Card data-testid="card-total-assets">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('assets.totalAssetValue', 'Total Asset Value')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              SAR {totalAssetValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('assets.currentBookValue', 'Current book value')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-depreciation">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('assets.totalDepreciation', 'Total Depreciation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              SAR {totalDepreciation.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('assets.accumulated', 'Accumulated')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-asset-count">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('assets.totalAssets', 'Total Assets')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleAssets.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('assets.activeAssets', 'Active assets')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-depreciation-rate">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('assets.avgDepreciation', 'Avg Depreciation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4%</div>
            <p className="text-xs text-muted-foreground mt-1">{t('assets.annualRate', 'Annual rate')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('assets.fixedAssetsRegister', 'Fixed Assets Register')}</CardTitle>
              <CardDescription>{t('assets.fixedAssetsDescription', 'سجل الأصول الثابتة - Track all company fixed assets')}</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-asset">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('assets.addAsset', 'Add Asset')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" data-testid="modal-add-asset">
                <DialogHeader>
                  <DialogTitle>{t('assets.addNewAsset', 'Add New Asset')}</DialogTitle>
                  <DialogDescription>{t('assets.addNewAssetDescription', 'إضافة أصل جديد - Register a new fixed asset')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('assets.assetName', 'Asset Name')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('assets.enterAssetName', 'Enter asset name')} data-testid="input-asset-name" />
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
                            <FormLabel>{t('common.category', 'Category')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-category">
                                  <SelectValue placeholder={t('assets.selectCategory', 'Select category')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
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
                            <FormLabel>{t('assets.purchaseDate', 'Purchase Date')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-purchase-date" />
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
                            <FormLabel>{t('assets.purchaseValueSAR', 'Purchase Value (SAR)')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0.00" data-testid="input-purchase-value" />
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
                            <FormLabel>{t('assets.currentValueSAR', 'Current Value (SAR)')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0.00" data-testid="input-current-value" />
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
                            <FormLabel>{t('assets.depreciationRatePercent', 'Depreciation Rate (%)')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="10" data-testid="input-depreciation-rate" />
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
                            <FormLabel>{t('assets.location', 'Location')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('assets.enterLocation', 'Enter location')} data-testid="input-location" />
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
                            <FormLabel>{t('assets.serialNumber', 'Serial Number')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('common.optional', 'Optional')} data-testid="input-serial-number" />
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
                            <FormLabel>{t('assets.condition', 'Condition')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-condition">
                                  <SelectValue placeholder={t('assets.selectCondition', 'Select condition')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
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
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        {t('common.cancel', 'Cancel')}
                      </Button>
                      <Button type="submit" data-testid="button-save-asset">{t('assets.saveAsset', 'Save Asset')}</Button>
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('assets.searchAssets', 'Search assets...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-assets"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-category">
                <SelectValue placeholder={t('assets.filterByCategory', 'Filter by category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('assets.allCategories', 'All Categories')}</SelectItem>
                <SelectItem value="Equipment">{t('assets.equipment', 'Equipment')}</SelectItem>
                <SelectItem value="Vehicle">{t('assets.vehicle', 'Vehicle')}</SelectItem>
                <SelectItem value="IT Equipment">{t('assets.itEquipment', 'IT Equipment')}</SelectItem>
                <SelectItem value="Property">{t('assets.property', 'Property')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-export-assets">
              <Download className="h-4 w-4 mr-2" />
              {t('common.export', 'Export')}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('assets.asset', 'Asset')}</TableHead>
                <TableHead>{t('common.category', 'Category')}</TableHead>
                <TableHead>{t('assets.purchaseValue', 'Purchase Value')}</TableHead>
                <TableHead>{t('assets.currentValue', 'Current Value')}</TableHead>
                <TableHead>{t('assets.depreciation', 'Depreciation')}</TableHead>
                <TableHead>{t('assets.condition', 'Condition')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id} data-testid={`row-asset-${asset.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(asset.category)}
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-xs text-muted-foreground">{asset.serialNumber}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{asset.category}</TableCell>
                  <TableCell>SAR {asset.purchaseValue.toLocaleString()}</TableCell>
                  <TableCell>SAR {asset.currentValue.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{asset.depreciationRate}%</span>
                      <Progress value={100 - (asset.currentValue / asset.purchaseValue) * 100} className="w-16 h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={asset.condition === "Excellent" ? "default" : "secondary"}>
                      {asset.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-600">
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

      <Card>
        <CardHeader>
          <CardTitle>{t('assets.relatedFinancialModules', 'Related Financial Modules')}</CardTitle>
          <CardDescription>{t('assets.relatedFinancialModulesDescription', 'الوحدات المالية ذات الصلة - Quick access to balance sheet items')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/liabilities-management">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full" data-testid="link-liabilities-management">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CreditCard className="h-8 w-8 text-red-600" />
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{t('assets.liabilitiesObligations', 'Liabilities & Obligations')}</CardTitle>
                  <CardDescription>{t('assets.liabilitiesArabic', 'الخصوم')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t('assets.liabilitiesDescription', 'Manage company debts, loans, and financial obligations')}</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/equity-management">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full" data-testid="link-equity-management">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{t('assets.equityManagement', 'Equity Management')}</CardTitle>
                  <CardDescription>{t('assets.equityArabic', 'حقوق الملكية')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t('assets.equityDescription', "Track owner's equity, capital, and retained earnings")}</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const currentAssetsTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-cash-balance">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('assets.cashBank', 'Cash & Bank')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">SAR 485,000</div>
            <p className="text-xs text-muted-foreground mt-1">{t('assets.cashBankArabic', 'النقد والبنوك')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-receivables">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('assets.accountsReceivable', 'Accounts Receivable')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">SAR 156,000</div>
            <p className="text-xs text-muted-foreground mt-1">{t('assets.accountsReceivableArabic', 'الذمم المدينة')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-inventory-value">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('assets.inventory', 'Inventory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">SAR 320,000</div>
            <p className="text-xs text-muted-foreground mt-1">{t('assets.inventoryArabic', 'المخزون')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-prepaid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('assets.prepaidExpenses', 'Prepaid Expenses')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">SAR 45,000</div>
            <p className="text-xs text-muted-foreground mt-1">{t('assets.prepaidExpensesArabic', 'المصروفات المقدمة')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('assets.currentAssetsSummary', 'Current Assets Summary')}</CardTitle>
          <CardDescription>{t('assets.currentAssetsSummaryDescription', 'ملخص الأصول المتداولة - Short-term assets overview')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('assets.assetType', 'Asset Type')}</TableHead>
                <TableHead className="text-right">{t('assets.balance', 'Balance')}</TableHead>
                <TableHead className="text-right">{t('assets.percentOfTotal', '% of Total')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{t('assets.cashBank', 'Cash & Bank')}</TableCell>
                <TableCell className="text-right">SAR 485,000</TableCell>
                <TableCell className="text-right">48.2%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t('assets.accountsReceivable', 'Accounts Receivable')}</TableCell>
                <TableCell className="text-right">SAR 156,000</TableCell>
                <TableCell className="text-right">15.5%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t('assets.inventory', 'Inventory')}</TableCell>
                <TableCell className="text-right">SAR 320,000</TableCell>
                <TableCell className="text-right">31.8%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t('assets.prepaidExpenses', 'Prepaid Expenses')}</TableCell>
                <TableCell className="text-right">SAR 45,000</TableCell>
                <TableCell className="text-right">4.5%</TableCell>
              </TableRow>
              <TableRow className="font-bold bg-muted/50">
                <TableCell>{t('assets.totalCurrentAssets', 'Total Current Assets')}</TableCell>
                <TableCell className="text-right">SAR 1,006,000</TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const depreciationTab = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('assets.depreciationSchedule', 'Depreciation Schedule')}</CardTitle>
          <CardDescription>{t('assets.depreciationScheduleDescription', 'جدول الاستهلاك - Projected asset depreciation over time')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('assets.year', 'Year')}</TableHead>
                <TableHead className="text-right">{t('assets.startingValue', 'Starting Value')}</TableHead>
                <TableHead className="text-right">{t('assets.depreciation', 'Depreciation')}</TableHead>
                <TableHead className="text-right">{t('assets.endingValue', 'Ending Value')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depreciationSchedule.map((row) => (
                <TableRow key={row.year} data-testid={`row-depreciation-${row.year}`}>
                  <TableCell className="font-medium">{row.year}</TableCell>
                  <TableCell className="text-right">SAR {row.startValue.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-red-600">-SAR {row.depreciation.toLocaleString()}</TableCell>
                  <TableCell className="text-right">SAR {row.endValue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <TabsPageLayout
        title={t('assets.title', 'Assets Management')}
        description={t('assets.description', 'إدارة الأصول - Track and manage company assets and depreciation')}
        defaultTab="fixed-assets"
        tabs={[
          { id: "fixed-assets", label: t('assets.fixedAssets', 'Fixed Assets'), icon: Building2, content: fixedAssetsTab },
          { id: "current-assets", label: t('assets.currentAssets', 'Current Assets'), icon: DollarSign, content: currentAssetsTab },
          { id: "depreciation", label: t('assets.depreciation', 'Depreciation'), icon: TrendingDown, content: depreciationTab },
        ]}
      />
    </div>
  );
}
