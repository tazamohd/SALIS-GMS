import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Users,
  Plus,
  Search,
  Download,
  Calendar,
  Target,
  Award,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Car,
  Wrench,
  Package,
  FileText,
  ExternalLink,
  Receipt,
} from "lucide-react";

const saleSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  customer: z.string().min(1, "Customer is required"),
  type: z.string().min(1, "Sale type is required"),
  amount: z.string().min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  status: z.string().min(1, "Status is required"),
});

type SaleFormData = z.infer<typeof saleSchema>;

const sampleSales = [
  {
    id: "1",
    invoiceNumber: "INV-2024-0156",
    customer: "Mohammed Al-Rashid",
    type: "Service",
    description: "Full engine service - Toyota Camry",
    amount: 2850,
    date: "2024-01-28",
    paymentMethod: "Card",
    status: "Completed",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-0157",
    customer: "Fatima Hassan",
    type: "Parts",
    description: "Brake pads and rotors - Honda Accord",
    amount: 1450,
    date: "2024-01-28",
    paymentMethod: "Cash",
    status: "Completed",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-0158",
    customer: "Ahmed Ibrahim",
    type: "Service",
    description: "AC repair and recharge - BMW X5",
    amount: 3200,
    date: "2024-01-27",
    paymentMethod: "Card",
    status: "Completed",
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-0159",
    customer: "Sara Abdullah",
    type: "Parts",
    description: "Oil filter and engine oil - Mercedes C200",
    amount: 680,
    date: "2024-01-27",
    paymentMethod: "Cash",
    status: "Completed",
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-0160",
    customer: "Khalid Al-Mutairi",
    type: "Service",
    description: "Transmission service - Nissan Patrol",
    amount: 4500,
    date: "2024-01-26",
    paymentMethod: "Transfer",
    status: "Pending",
  },
];

const monthlySales = [
  { month: "Aug 2023", services: 145000, parts: 89000, total: 234000 },
  { month: "Sep 2023", services: 152000, parts: 95000, total: 247000 },
  { month: "Oct 2023", services: 168000, parts: 102000, total: 270000 },
  { month: "Nov 2023", services: 175000, parts: 110000, total: 285000 },
  { month: "Dec 2023", services: 198000, parts: 125000, total: 323000 },
  { month: "Jan 2024", services: 185000, parts: 118000, total: 303000 },
];

const topProducts = [
  { name: "Engine Oil Change", category: "Service", revenue: 45000, units: 150 },
  { name: "Brake Pad Replacement", category: "Service", revenue: 38000, units: 95 },
  { name: "AC Service", category: "Service", revenue: 32000, units: 64 },
  { name: "Genuine Brake Pads", category: "Parts", revenue: 28000, units: 280 },
  { name: "Air Filters", category: "Parts", revenue: 22000, units: 440 },
];

export default function SalesManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      invoiceNumber: "",
      customer: "",
      type: "",
      amount: "",
      date: "",
      paymentMethod: "",
      status: "",
    },
  });

  const onSubmit = (data: SaleFormData) => {
    console.log("New sale:", data);
    setIsAddDialogOpen(false);
    form.reset();
  };

  const filteredSales = sampleSales.filter((sale) => {
    const matchesSearch =
      sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || sale.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalRevenue = sampleSales.reduce((sum, sale) => sum + sale.amount, 0);
  const serviceRevenue = sampleSales
    .filter((s) => s.type === "Service")
    .reduce((sum, s) => sum + s.amount, 0);
  const partsRevenue = sampleSales
    .filter((s) => s.type === "Parts")
    .reduce((sum, s) => sum + s.amount, 0);

  const overviewTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-total-revenue">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              SAR {totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-service-revenue">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Service Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              SAR {serviceRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">إيرادات الخدمات</p>
          </CardContent>
        </Card>

        <Card data-testid="card-parts-revenue">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Parts Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              SAR {partsRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">إيرادات قطع الغيار</p>
          </CardContent>
        </Card>

        <Card data-testid="card-transactions">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleSales.length}</div>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Trend</CardTitle>
            <CardDescription>اتجاه المبيعات الشهرية - Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlySales.map((month, index) => (
                <div key={index} data-testid={`bar-month-${index}`}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{month.month}</span>
                    <span className="text-sm text-muted-foreground">SAR {month.total.toLocaleString()}</span>
                  </div>
                  <Progress value={(month.total / 350000) * 100} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>أفضل المنتجات مبيعاً</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product, index) => (
                  <TableRow key={index} data-testid={`row-top-product-${index}`}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant={product.category === "Service" ? "default" : "secondary"}>
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>SAR {product.revenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Related Financial Modules</CardTitle>
          <CardDescription>الوحدات المالية ذات الصلة - Quick access to related accounting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/expenses-management">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full" data-testid="link-expenses-management">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Receipt className="h-8 w-8 text-red-600" />
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">Expenses Management</CardTitle>
                  <CardDescription>المصروفات</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Track and manage all business expenses and budgets</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/invoices">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full" data-testid="link-invoices">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">Invoices</CardTitle>
                  <CardDescription>الفواتير</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Manage customer invoices and payment tracking</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const transactionsTab = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sales Transactions</CardTitle>
              <CardDescription>معاملات المبيعات - All sales records</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-sale">
                  <Plus className="h-4 w-4 mr-2" />
                  New Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" data-testid="modal-add-sale">
                <DialogHeader>
                  <DialogTitle>Record New Sale</DialogTitle>
                  <DialogDescription>تسجيل عملية بيع جديدة</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="invoiceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="INV-2024-XXXX" data-testid="input-invoice-number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Customer name" data-testid="input-customer" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sale Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-sale-type">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Service">Service</SelectItem>
                                <SelectItem value="Parts">Parts</SelectItem>
                                <SelectItem value="Package">Package Deal</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (SAR)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0.00" data-testid="input-amount" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Method</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-payment-method">
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Card">Card</SelectItem>
                                <SelectItem value="Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="Credit">Credit</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-status">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Refunded">Refunded</SelectItem>
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
                      <Button type="submit" data-testid="button-save-sale">Save Sale</Button>
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
                placeholder="Search by customer or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-sales"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-type">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Service">Service</SelectItem>
                <SelectItem value="Parts">Parts</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-export-sales">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id} data-testid={`row-sale-${sale.id}`}>
                  <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell className="max-w-xs truncate">{sale.description}</TableCell>
                  <TableCell>
                    <Badge variant={sale.type === "Service" ? "default" : "secondary"}>
                      {sale.type === "Service" ? (
                        <Wrench className="h-3 w-3 mr-1" />
                      ) : (
                        <Package className="h-3 w-3 mr-1" />
                      )}
                      {sale.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    SAR {sale.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{sale.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge variant={sale.status === "Completed" ? "default" : "secondary"}>
                      {sale.status}
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

  const targetsTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-monthly-target">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SAR 350,000</div>
            <p className="text-xs text-muted-foreground mt-1">الهدف الشهري</p>
          </CardContent>
        </Card>

        <Card data-testid="card-achieved">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Achieved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">SAR 303,000</div>
            <p className="text-xs text-muted-foreground mt-1">المحقق</p>
          </CardContent>
        </Card>

        <Card data-testid="card-remaining">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">SAR 47,000</div>
            <p className="text-xs text-muted-foreground mt-1">المتبقي</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Target Progress</CardTitle>
          <CardDescription>تقدم الهدف - Monthly sales target tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div data-testid="progress-overall">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Overall Target</span>
                <span className="text-muted-foreground">87% achieved</span>
              </div>
              <Progress value={87} className="h-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div data-testid="progress-services">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Services Target</span>
                  <span className="text-muted-foreground">SAR 185,000 / SAR 200,000</span>
                </div>
                <Progress value={92.5} className="h-3" />
                <p className="text-xs text-green-600 mt-1">92.5% achieved</p>
              </div>

              <div data-testid="progress-parts">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Parts Target</span>
                  <span className="text-muted-foreground">SAR 118,000 / SAR 150,000</span>
                </div>
                <Progress value={78.7} className="h-3" />
                <p className="text-xs text-orange-600 mt-1">78.7% achieved</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Sales Team Performance
          </CardTitle>
          <CardDescription>أداء فريق المبيعات</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sales Advisor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Achieved</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow data-testid="row-advisor-1">
                <TableCell className="font-medium">Ahmed Al-Salem</TableCell>
                <TableCell>SAR 100,000</TableCell>
                <TableCell>SAR 105,000</TableCell>
                <TableCell>
                  <Progress value={105} className="w-24 h-2" />
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-600">Exceeded</Badge>
                </TableCell>
              </TableRow>
              <TableRow data-testid="row-advisor-2">
                <TableCell className="font-medium">Khalid Hassan</TableCell>
                <TableCell>SAR 100,000</TableCell>
                <TableCell>SAR 92,000</TableCell>
                <TableCell>
                  <Progress value={92} className="w-24 h-2" />
                </TableCell>
                <TableCell>
                  <Badge className="bg-blue-600">On Track</Badge>
                </TableCell>
              </TableRow>
              <TableRow data-testid="row-advisor-3">
                <TableCell className="font-medium">Omar Ibrahim</TableCell>
                <TableCell>SAR 100,000</TableCell>
                <TableCell>SAR 78,000</TableCell>
                <TableCell>
                  <Progress value={78} className="w-24 h-2" />
                </TableCell>
                <TableCell>
                  <Badge className="bg-orange-600">Behind</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const reportsTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-daily">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Daily Sales Report</CardTitle>
            </div>
            <CardDescription>تقرير المبيعات اليومي</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-daily">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-monthly">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Monthly Summary</CardTitle>
            </div>
            <CardDescription>ملخص المبيعات الشهري</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-monthly">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-product">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Product Performance</CardTitle>
            </div>
            <CardDescription>أداء المنتجات</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-product">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-customer">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Customer Analysis</CardTitle>
            </div>
            <CardDescription>تحليل العملاء</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-customer">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-commission">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Commission Report</CardTitle>
            </div>
            <CardDescription>تقرير العمولات</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-commission">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-vat">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg">VAT Sales Report</CardTitle>
            </div>
            <CardDescription>تقرير ضريبة المبيعات</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-vat">
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
        title="Sales Management"
        description="المبيعات - Track revenue, transactions, and sales performance"
        defaultTab="overview"
        tabs={[
          { id: "overview", label: "Overview", icon: TrendingUp, content: overviewTab },
          { id: "transactions", label: "Transactions", icon: ShoppingCart, content: transactionsTab },
          { id: "targets", label: "Targets", icon: Target, content: targetsTab },
          { id: "reports", label: "Reports", icon: FileText, content: reportsTab },
        ]}
      />
    </div>
  );
}
