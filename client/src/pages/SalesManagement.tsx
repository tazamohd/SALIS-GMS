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
  const { t } = useTranslation();
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
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('salesManagement.totalRevenue', 'Total Revenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              SAR {totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              {t('salesManagement.fromLastMonth', '+12.5% from last month')}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-service-revenue">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('salesManagement.serviceRevenue', 'Service Revenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              SAR {serviceRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('salesManagement.serviceRevenueAr', 'إيرادات الخدمات')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-parts-revenue">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('salesManagement.partsRevenue', 'Parts Revenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              SAR {partsRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('salesManagement.partsRevenueAr', 'إيرادات قطع الغيار')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-transactions">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('salesManagement.transactions', 'Transactions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleSales.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('salesManagement.thisWeek', 'This week')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('salesManagement.monthlySalesTrend', 'Monthly Sales Trend')}</CardTitle>
            <CardDescription>{t('salesManagement.monthlySalesTrendDesc', 'اتجاه المبيعات الشهرية - Last 6 months')}</CardDescription>
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
            <CardTitle>{t('salesManagement.topSellingProducts', 'Top Selling Products')}</CardTitle>
            <CardDescription>{t('salesManagement.topSellingProductsAr', 'أفضل المنتجات مبيعاً')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('salesManagement.product', 'Product')}</TableHead>
                  <TableHead>{t('salesManagement.category', 'Category')}</TableHead>
                  <TableHead>{t('salesManagement.revenue', 'Revenue')}</TableHead>
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
          <CardTitle>{t('salesManagement.relatedFinancialModules', 'Related Financial Modules')}</CardTitle>
          <CardDescription>{t('salesManagement.relatedFinancialModulesDesc', 'الوحدات المالية ذات الصلة - Quick access to related accounting')}</CardDescription>
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
                  <CardTitle className="text-lg">{t('salesManagement.expensesManagement', 'Expenses Management')}</CardTitle>
                  <CardDescription>{t('salesManagement.expensesManagementAr', 'المصروفات')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t('salesManagement.expensesManagementDesc', 'Track and manage all business expenses and budgets')}</p>
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
                  <CardTitle className="text-lg">{t('salesManagement.invoices', 'Invoices')}</CardTitle>
                  <CardDescription>{t('salesManagement.invoicesAr', 'الفواتير')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t('salesManagement.invoicesDesc', 'Manage customer invoices and payment tracking')}</p>
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
              <CardTitle>{t('salesManagement.salesTransactions', 'Sales Transactions')}</CardTitle>
              <CardDescription>{t('salesManagement.salesTransactionsDesc', 'معاملات المبيعات - All sales records')}</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-sale">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('salesManagement.newSale', 'New Sale')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" data-testid="modal-add-sale">
                <DialogHeader>
                  <DialogTitle>{t('salesManagement.recordNewSale', 'Record New Sale')}</DialogTitle>
                  <DialogDescription>{t('salesManagement.recordNewSaleAr', 'تسجيل عملية بيع جديدة')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="invoiceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('salesManagement.invoiceNumber', 'Invoice Number')}</FormLabel>
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
                            <FormLabel>{t('salesManagement.customer', 'Customer')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('salesManagement.customerNamePlaceholder', 'Customer name')} data-testid="input-customer" />
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
                            <FormLabel>{t('salesManagement.saleType', 'Sale Type')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-sale-type">
                                  <SelectValue placeholder={t('salesManagement.selectType', 'Select type')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Service">{t('salesManagement.service', 'Service')}</SelectItem>
                                <SelectItem value="Parts">{t('salesManagement.parts', 'Parts')}</SelectItem>
                                <SelectItem value="Package">{t('salesManagement.packageDeal', 'Package Deal')}</SelectItem>
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
                            <FormLabel>{t('salesManagement.amountSAR', 'Amount (SAR)')}</FormLabel>
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
                            <FormLabel>{t('common.date', 'Date')}</FormLabel>
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
                            <FormLabel>{t('salesManagement.paymentMethod', 'Payment Method')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-payment-method">
                                  <SelectValue placeholder={t('salesManagement.selectMethod', 'Select method')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Cash">{t('salesManagement.cash', 'Cash')}</SelectItem>
                                <SelectItem value="Card">{t('salesManagement.card', 'Card')}</SelectItem>
                                <SelectItem value="Transfer">{t('salesManagement.bankTransfer', 'Bank Transfer')}</SelectItem>
                                <SelectItem value="Credit">{t('salesManagement.credit', 'Credit')}</SelectItem>
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
                            <FormLabel>{t('common.status', 'Status')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-status">
                                  <SelectValue placeholder={t('salesManagement.selectStatus', 'Select status')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Completed">{t('common.completed', 'Completed')}</SelectItem>
                                <SelectItem value="Pending">{t('common.pending', 'Pending')}</SelectItem>
                                <SelectItem value="Refunded">{t('salesManagement.refunded', 'Refunded')}</SelectItem>
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
                      <Button type="submit" data-testid="button-save-sale">{t('salesManagement.saveSale', 'Save Sale')}</Button>
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
                placeholder={t('salesManagement.searchByCustomerOrInvoice', 'Search by customer or invoice...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-sales"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-type">
                <SelectValue placeholder={t('salesManagement.filterByType', 'Filter by type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('salesManagement.allTypes', 'All Types')}</SelectItem>
                <SelectItem value="Service">{t('salesManagement.service', 'Service')}</SelectItem>
                <SelectItem value="Parts">{t('salesManagement.parts', 'Parts')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-export-sales">
              <Download className="h-4 w-4 mr-2" />
              {t('common.export', 'Export')}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('salesManagement.invoice', 'Invoice')}</TableHead>
                <TableHead>{t('salesManagement.customer', 'Customer')}</TableHead>
                <TableHead>{t('common.description', 'Description')}</TableHead>
                <TableHead>{t('common.type', 'Type')}</TableHead>
                <TableHead>{t('common.amount', 'Amount')}</TableHead>
                <TableHead>{t('salesManagement.payment', 'Payment')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('salesManagement.monthlyTarget', 'Monthly Target')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SAR 350,000</div>
            <p className="text-xs text-muted-foreground mt-1">{t('salesManagement.monthlyTargetAr', 'الهدف الشهري')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-achieved">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('salesManagement.achieved', 'Achieved')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">SAR 303,000</div>
            <p className="text-xs text-muted-foreground mt-1">{t('salesManagement.achievedAr', 'المحقق')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-remaining">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('salesManagement.remaining', 'Remaining')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">SAR 47,000</div>
            <p className="text-xs text-muted-foreground mt-1">{t('salesManagement.remainingAr', 'المتبقي')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('salesManagement.targetProgress', 'Target Progress')}</CardTitle>
          <CardDescription>{t('salesManagement.targetProgressDesc', 'تقدم الهدف - Current month achievement')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{t('salesManagement.overallProgress', 'Overall Progress')}</span>
                <span className="text-sm font-medium">86.6%</span>
              </div>
              <Progress value={86.6} className="h-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <TabsPageLayout
        title={t('salesManagement.title', 'Sales Management')}
        description={t('salesManagement.description', 'إدارة المبيعات - Comprehensive sales tracking and analytics')}
        defaultTab="overview"
        tabs={[
          { id: "overview", label: t('salesManagement.overview', 'Overview'), icon: BarChart3, content: overviewTab },
          { id: "transactions", label: t('salesManagement.transactionsTab', 'Transactions'), icon: ShoppingCart, content: transactionsTab },
          { id: "targets", label: t('salesManagement.targets', 'Targets'), icon: Target, content: targetsTab },
        ]}
      />
    </div>
  );
}
