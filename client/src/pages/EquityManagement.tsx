import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
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
  Wallet,
  TrendingUp,
  DollarSign,
  Users,
  Plus,
  Download,
  Calendar,
  Building2,
  PieChart,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Award,
  Coins,
  Scale,
} from "lucide-react";

const capitalSchema = z.object({
  type: z.string().min(1, "Type is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  investor: z.string().optional(),
  notes: z.string().optional(),
});

type CapitalFormData = z.infer<typeof capitalSchema>;

const equityComponents = [
  {
    id: "1",
    type: "Share Capital",
    description: "Initial owner investment",
    amount: 2000000,
    date: "2018-01-01",
    investor: "Al-Salem Family",
  },
  {
    id: "2",
    type: "Additional Capital",
    description: "Capital injection for expansion",
    amount: 500000,
    date: "2022-06-15",
    investor: "Al-Salem Family",
  },
  {
    id: "3",
    type: "Retained Earnings",
    description: "Accumulated profits (2018-2023)",
    amount: 850000,
    date: "2023-12-31",
    investor: "N/A",
  },
  {
    id: "4",
    type: "Current Year Profit",
    description: "Net income 2024 (YTD)",
    amount: 180350,
    date: "2024-01-28",
    investor: "N/A",
  },
];

const yearlyEquity = [
  { year: 2019, capital: 2000000, retained: 120000, total: 2120000 },
  { year: 2020, capital: 2000000, retained: 280000, total: 2280000 },
  { year: 2021, capital: 2000000, retained: 450000, total: 2450000 },
  { year: 2022, capital: 2500000, retained: 620000, total: 3120000 },
  { year: 2023, capital: 2500000, retained: 850000, total: 3350000 },
  { year: 2024, capital: 2500000, retained: 1030350, total: 3530350 },
];

const dividendHistory = [
  { year: 2023, declared: 200000, paid: 200000, perShare: 100, paymentDate: "2024-03-15" },
  { year: 2022, declared: 180000, paid: 180000, perShare: 90, paymentDate: "2023-03-15" },
  { year: 2021, declared: 150000, paid: 150000, perShare: 75, paymentDate: "2022-03-15" },
  { year: 2020, declared: 100000, paid: 100000, perShare: 50, paymentDate: "2021-03-15" },
];

export default function EquityManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const form = useForm<CapitalFormData>({
    resolver: zodResolver(capitalSchema),
    defaultValues: {
      type: "",
      description: "",
      amount: "",
      date: "",
      investor: "",
      notes: "",
    },
  });

  const onSubmit = (data: CapitalFormData) => {
    console.log("New capital entry:", data);
    setIsAddDialogOpen(false);
    form.reset();
  };

  const totalEquity = equityComponents.reduce((sum, e) => sum + e.amount, 0);
  const shareCapital = equityComponents
    .filter((e) => e.type.includes("Capital"))
    .reduce((sum, e) => sum + e.amount, 0);
  const retainedEarnings = equityComponents
    .filter((e) => e.type.includes("Earnings") || e.type.includes("Profit"))
    .reduce((sum, e) => sum + e.amount, 0);

  const overviewTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-total-equity">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              SAR {totalEquity.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +5.4% from last year
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-share-capital">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Share Capital</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              SAR {shareCapital.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">رأس المال</p>
          </CardContent>
        </Card>

        <Card data-testid="card-retained-earnings">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retained Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              SAR {retainedEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">الأرباح المحتجزة</p>
          </CardContent>
        </Card>

        <Card data-testid="card-roe">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Return on Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.2%</div>
            <p className="text-xs text-green-600 mt-1">العائد على حقوق الملكية</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Equity Composition</CardTitle>
            <CardDescription>تكوين حقوق الملكية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div data-testid="bar-share-capital">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Share Capital</span>
                  <span className="text-sm text-muted-foreground">
                    SAR {shareCapital.toLocaleString()} ({Math.round((shareCapital / totalEquity) * 100)}%)
                  </span>
                </div>
                <Progress value={(shareCapital / totalEquity) * 100} className="h-3 bg-blue-100" />
              </div>
              <div data-testid="bar-retained-earnings">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Retained Earnings</span>
                  <span className="text-sm text-muted-foreground">
                    SAR {retainedEarnings.toLocaleString()} ({Math.round((retainedEarnings / totalEquity) * 100)}%)
                  </span>
                </div>
                <Progress value={(retainedEarnings / totalEquity) * 100} className="h-3 bg-purple-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equity Growth Trend</CardTitle>
            <CardDescription>اتجاه نمو حقوق الملكية - Last 6 years</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {yearlyEquity.map((year, index) => (
                <div key={index} data-testid={`bar-year-${year.year}`}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{year.year}</span>
                    <span className="text-sm text-muted-foreground">SAR {year.total.toLocaleString()}</span>
                  </div>
                  <Progress value={(year.total / 4000000) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Financial Ratios</CardTitle>
          <CardDescription>النسب المالية الرئيسية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center" data-testid="card-ratio-equity">
              <Scale className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold">0.65</p>
              <p className="text-sm text-muted-foreground">Debt to Equity</p>
            </div>
            <div className="p-4 border rounded-lg text-center" data-testid="card-ratio-roe">
              <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold">15.2%</p>
              <p className="text-sm text-muted-foreground">Return on Equity</p>
            </div>
            <div className="p-4 border rounded-lg text-center" data-testid="card-ratio-book">
              <Coins className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold">SAR 1,765</p>
              <p className="text-sm text-muted-foreground">Book Value/Share</p>
            </div>
            <div className="p-4 border rounded-lg text-center" data-testid="card-ratio-payout">
              <Award className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <p className="text-2xl font-bold">23.5%</p>
              <p className="text-sm text-muted-foreground">Dividend Payout</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const capitalTab = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Capital Structure</CardTitle>
              <CardDescription>هيكل رأس المال - Owner's investments and equity</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-capital">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" data-testid="modal-add-capital">
                <DialogHeader>
                  <DialogTitle>Add Capital Entry</DialogTitle>
                  <DialogDescription>إضافة قيد رأس المال</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-type">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Share Capital">Share Capital</SelectItem>
                                <SelectItem value="Additional Capital">Additional Capital</SelectItem>
                                <SelectItem value="Capital Withdrawal">Capital Withdrawal</SelectItem>
                                <SelectItem value="Retained Earnings">Retained Earnings</SelectItem>
                                <SelectItem value="Dividend Distribution">Dividend Distribution</SelectItem>
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
                        name="description"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter description" data-testid="input-description" />
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
                        name="investor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Investor/Owner</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Optional" data-testid="input-investor" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Additional notes" data-testid="input-notes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" data-testid="button-save-capital">Save Entry</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Investor/Owner</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equityComponents.map((item) => (
                <TableRow key={item.id} data-testid={`row-capital-${item.id}`}>
                  <TableCell>
                    <Badge variant={item.type.includes("Capital") ? "default" : "secondary"}>
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.investor}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell className="font-medium text-green-600">
                    SAR {item.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Ownership Structure
            </CardTitle>
            <CardDescription>هيكل الملكية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg" data-testid="card-owner-1">
                <div>
                  <p className="font-medium">Mohammed Al-Salem</p>
                  <p className="text-sm text-muted-foreground">Founder & CEO</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">60%</p>
                  <p className="text-sm text-muted-foreground">1,200 shares</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg" data-testid="card-owner-2">
                <div>
                  <p className="font-medium">Ahmed Al-Salem</p>
                  <p className="text-sm text-muted-foreground">Co-owner</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">25%</p>
                  <p className="text-sm text-muted-foreground">500 shares</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg" data-testid="card-owner-3">
                <div>
                  <p className="font-medium">Fatima Al-Salem</p>
                  <p className="text-sm text-muted-foreground">Co-owner</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">15%</p>
                  <p className="text-sm text-muted-foreground">300 shares</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Reserves & Provisions
            </CardTitle>
            <CardDescription>الاحتياطيات والمخصصات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between" data-testid="card-reserve-legal">
                <span className="text-sm font-medium">Legal Reserve (10%)</span>
                <span className="font-medium">SAR 250,000</span>
              </div>
              <Progress value={100} className="h-2" />
              
              <div className="flex items-center justify-between" data-testid="card-reserve-general">
                <span className="text-sm font-medium">General Reserve</span>
                <span className="font-medium">SAR 150,000</span>
              </div>
              <Progress value={75} className="h-2" />
              
              <div className="flex items-center justify-between" data-testid="card-reserve-expansion">
                <span className="text-sm font-medium">Expansion Reserve</span>
                <span className="font-medium">SAR 100,000</span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const dividendsTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-total-dividends">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Dividends (All Time)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">SAR 630,000</div>
            <p className="text-xs text-muted-foreground mt-1">إجمالي الأرباح الموزعة</p>
          </CardContent>
        </Card>

        <Card data-testid="card-latest-dividend">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Latest Dividend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">SAR 200,000</div>
            <p className="text-xs text-muted-foreground mt-1">2023 Distribution</p>
          </CardContent>
        </Card>

        <Card data-testid="card-dividend-yield">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dividend Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.7%</div>
            <p className="text-xs text-muted-foreground mt-1">عائد الأرباح</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dividend History</CardTitle>
              <CardDescription>سجل توزيعات الأرباح</CardDescription>
            </div>
            <Button variant="outline" data-testid="button-export-dividends">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Declared</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Per Share</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dividendHistory.map((div, index) => (
                <TableRow key={index} data-testid={`row-dividend-${div.year}`}>
                  <TableCell className="font-medium">{div.year}</TableCell>
                  <TableCell>SAR {div.declared.toLocaleString()}</TableCell>
                  <TableCell>SAR {div.paid.toLocaleString()}</TableCell>
                  <TableCell>SAR {div.perShare}</TableCell>
                  <TableCell>{div.paymentDate}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-600">Paid</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dividend Distribution by Owner</CardTitle>
          <CardDescription>توزيع الأرباح حسب المالك - 2023</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Ownership %</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Dividend Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow data-testid="row-dividend-owner-1">
                <TableCell className="font-medium">Mohammed Al-Salem</TableCell>
                <TableCell>60%</TableCell>
                <TableCell>1,200</TableCell>
                <TableCell className="text-green-600 font-medium">SAR 120,000</TableCell>
              </TableRow>
              <TableRow data-testid="row-dividend-owner-2">
                <TableCell className="font-medium">Ahmed Al-Salem</TableCell>
                <TableCell>25%</TableCell>
                <TableCell>500</TableCell>
                <TableCell className="text-green-600 font-medium">SAR 50,000</TableCell>
              </TableRow>
              <TableRow data-testid="row-dividend-owner-3">
                <TableCell className="font-medium">Fatima Al-Salem</TableCell>
                <TableCell>15%</TableCell>
                <TableCell>300</TableCell>
                <TableCell className="text-green-600 font-medium">SAR 30,000</TableCell>
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
        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-equity">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Statement of Equity</CardTitle>
            </div>
            <CardDescription>قائمة التغيرات في حقوق الملكية</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-equity">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-capital">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Capital Movement</CardTitle>
            </div>
            <CardDescription>حركة رأس المال</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-capital">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-dividend">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Dividend Report</CardTitle>
            </div>
            <CardDescription>تقرير توزيعات الأرباح</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-dividend">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-ownership">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Ownership Report</CardTitle>
            </div>
            <CardDescription>تقرير الملكية</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-ownership">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-reserves">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-lg">Reserves Statement</CardTitle>
            </div>
            <CardDescription>بيان الاحتياطيات</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-reserves">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-ratios">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg">Financial Ratios</CardTitle>
            </div>
            <CardDescription>النسب المالية</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" data-testid="button-generate-ratios">
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
        title="Equity Management"
        description="حقوق الملكية - Track owner's equity, capital, and retained earnings"
        defaultTab="overview"
        tabs={[
          { id: "overview", label: "Overview", icon: PieChart, content: overviewTab },
          { id: "capital", label: "Capital Structure", icon: Building2, content: capitalTab },
          { id: "dividends", label: "Dividends", icon: DollarSign, content: dividendsTab },
          { id: "reports", label: "Reports", icon: FileText, content: reportsTab },
        ]}
      />
    </div>
  );
}
