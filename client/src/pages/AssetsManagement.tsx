import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Asset Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              SAR {totalAssetValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current book value</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-depreciation">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Depreciation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              SAR {totalDepreciation.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Accumulated</p>
          </CardContent>
        </Card>

        <Card data-testid="card-asset-count">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleAssets.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active assets</p>
          </CardContent>
        </Card>

        <Card data-testid="card-depreciation-rate">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Depreciation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4%</div>
            <p className="text-xs text-muted-foreground mt-1">Annual rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fixed Assets Register</CardTitle>
              <CardDescription>سجل الأصول الثابتة - Track all company fixed assets</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-asset">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" data-testid="modal-add-asset">
                <DialogHeader>
                  <DialogTitle>Add New Asset</DialogTitle>
                  <DialogDescription>إضافة أصل جديد - Register a new fixed asset</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Asset Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter asset name" data-testid="input-asset-name" />
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
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Equipment">Equipment</SelectItem>
                                <SelectItem value="Vehicle">Vehicle</SelectItem>
                                <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                                <SelectItem value="Property">Property</SelectItem>
                                <SelectItem value="Furniture">Furniture</SelectItem>
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
                            <FormLabel>Purchase Date</FormLabel>
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
                            <FormLabel>Purchase Value (SAR)</FormLabel>
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
                            <FormLabel>Current Value (SAR)</FormLabel>
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
                            <FormLabel>Depreciation Rate (%)</FormLabel>
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
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter location" data-testid="input-location" />
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
                            <FormLabel>Serial Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Optional" data-testid="input-serial-number" />
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
                            <FormLabel>Condition</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-condition">
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Excellent">Excellent</SelectItem>
                                <SelectItem value="Good">Good</SelectItem>
                                <SelectItem value="Fair">Fair</SelectItem>
                                <SelectItem value="Poor">Poor</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" data-testid="button-save-asset">Save Asset</Button>
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
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-assets"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-category">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
                <SelectItem value="Vehicle">Vehicle</SelectItem>
                <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                <SelectItem value="Property">Property</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-export-assets">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Purchase Value</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Depreciation</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
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
                      {asset.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const currentAssetsTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-cash-balance">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cash & Bank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">SAR 485,000</div>
            <p className="text-xs text-muted-foreground mt-1">النقد والبنوك</p>
          </CardContent>
        </Card>

        <Card data-testid="card-receivables">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accounts Receivable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">SAR 156,000</div>
            <p className="text-xs text-muted-foreground mt-1">الذمم المدينة</p>
          </CardContent>
        </Card>

        <Card data-testid="card-inventory-value">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">SAR 892,000</div>
            <p className="text-xs text-muted-foreground mt-1">المخزون</p>
          </CardContent>
        </Card>

        <Card data-testid="card-prepaid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prepaid Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SAR 45,000</div>
            <p className="text-xs text-muted-foreground mt-1">المصروفات المدفوعة مقدماً</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Assets Summary</CardTitle>
          <CardDescription>الأصول المتداولة - Short-term assets breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Value (SAR)</TableHead>
                <TableHead>% of Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow data-testid="row-current-cash">
                <TableCell className="font-medium">Cash on Hand</TableCell>
                <TableCell>Petty cash and registers</TableCell>
                <TableCell>SAR 25,000</TableCell>
                <TableCell>1.6%</TableCell>
                <TableCell><Badge>Available</Badge></TableCell>
              </TableRow>
              <TableRow data-testid="row-current-bank">
                <TableCell className="font-medium">Bank Accounts</TableCell>
                <TableCell>Operating and savings accounts</TableCell>
                <TableCell>SAR 460,000</TableCell>
                <TableCell>29.1%</TableCell>
                <TableCell><Badge>Available</Badge></TableCell>
              </TableRow>
              <TableRow data-testid="row-current-receivables">
                <TableCell className="font-medium">Trade Receivables</TableCell>
                <TableCell>Customer outstanding balances</TableCell>
                <TableCell>SAR 156,000</TableCell>
                <TableCell>9.9%</TableCell>
                <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
              </TableRow>
              <TableRow data-testid="row-current-inventory">
                <TableCell className="font-medium">Parts Inventory</TableCell>
                <TableCell>Spare parts and supplies</TableCell>
                <TableCell>SAR 892,000</TableCell>
                <TableCell>56.5%</TableCell>
                <TableCell><Badge>In Stock</Badge></TableCell>
              </TableRow>
              <TableRow data-testid="row-current-prepaid">
                <TableCell className="font-medium">Prepaid Insurance</TableCell>
                <TableCell>Annual insurance premium</TableCell>
                <TableCell>SAR 45,000</TableCell>
                <TableCell>2.9%</TableCell>
                <TableCell><Badge variant="outline">Prepaid</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const depreciationTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-annual-depreciation">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Annual Depreciation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">SAR 268,800</div>
            <p className="text-xs text-muted-foreground mt-1">الإهلاك السنوي</p>
          </CardContent>
        </Card>

        <Card data-testid="card-accumulated-depreciation">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accumulated Depreciation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">SAR 789,000</div>
            <p className="text-xs text-muted-foreground mt-1">مجمع الإهلاك</p>
          </CardContent>
        </Card>

        <Card data-testid="card-net-book-value">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Book Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">SAR 2,389,900</div>
            <p className="text-xs text-muted-foreground mt-1">صافي القيمة الدفترية</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Depreciation Schedule</CardTitle>
              <CardDescription>جدول الإهلاك - 5-year depreciation forecast</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" data-testid="button-print-schedule">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" data-testid="button-export-schedule">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Start Value</TableHead>
                <TableHead>Depreciation</TableHead>
                <TableHead>End Value</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depreciationSchedule.map((row) => (
                <TableRow key={row.year} data-testid={`row-depreciation-${row.year}`}>
                  <TableCell className="font-medium">{row.year}</TableCell>
                  <TableCell>SAR {row.startValue.toLocaleString()}</TableCell>
                  <TableCell className="text-orange-600">-SAR {row.depreciation.toLocaleString()}</TableCell>
                  <TableCell>SAR {row.endValue.toLocaleString()}</TableCell>
                  <TableCell>
                    <Progress value={(row.endValue / 2688000) * 100} className="w-24 h-2" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Depreciation Methods</CardTitle>
          <CardDescription>طرق الإهلاك - Available calculation methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg" data-testid="card-method-straight">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold">Straight Line</h4>
              </div>
              <p className="text-sm text-muted-foreground">Equal annual depreciation over useful life</p>
              <Badge className="mt-2">Currently Used</Badge>
            </div>
            <div className="p-4 border rounded-lg" data-testid="card-method-declining">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <h4 className="font-semibold">Declining Balance</h4>
              </div>
              <p className="text-sm text-muted-foreground">Higher depreciation in early years</p>
              <Badge variant="outline" className="mt-2">Available</Badge>
            </div>
            <div className="p-4 border rounded-lg" data-testid="card-method-units">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Units of Production</h4>
              </div>
              <p className="text-sm text-muted-foreground">Based on actual usage or output</p>
              <Badge variant="outline" className="mt-2">Available</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const reportsTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-register">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Asset Register Report</CardTitle>
            </div>
            <CardDescription>Complete list of all fixed assets</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-register">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-depreciation">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Depreciation Report</CardTitle>
            </div>
            <CardDescription>Annual depreciation summary</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-depreciation">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-valuation">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Asset Valuation</CardTitle>
            </div>
            <CardDescription>Current market value assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-valuation">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-disposal">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg">Asset Disposal Report</CardTitle>
            </div>
            <CardDescription>Disposed and written-off assets</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-disposal">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-insurance">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Insurance Schedule</CardTitle>
            </div>
            <CardDescription>Assets with insurance coverage</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-insurance">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-maintenance">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-lg">Maintenance Schedule</CardTitle>
            </div>
            <CardDescription>Asset maintenance history</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-maintenance">
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <TabsPageLayout
        title="Assets Management"
        description="الاصول - Track and manage all company assets, depreciation, and valuations"
        defaultTab="fixed"
        tabs={[
          { id: "fixed", label: "Fixed Assets", icon: Building2, content: fixedAssetsTab },
          { id: "current", label: "Current Assets", icon: DollarSign, content: currentAssetsTab },
          { id: "depreciation", label: "Depreciation", icon: TrendingDown, content: depreciationTab },
          { id: "reports", label: "Reports", icon: FileText, content: reportsTab },
        ]}
      />
    </div>
  );
}
