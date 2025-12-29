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
  Landmark,
  ExternalLink,
  PiggyBank,
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
  const { t } = useTranslation();
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
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('equity.totalEquity', 'Total Equity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              SAR {totalEquity.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              {t('equity.fromLastYear', '+5.4% from last year')}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-share-capital">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('equity.shareCapital', 'Share Capital')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              SAR {shareCapital.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('equity.shareCapitalAr', 'رأس المال')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-retained-earnings">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('equity.retainedEarnings', 'Retained Earnings')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              SAR {retainedEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('equity.retainedEarningsAr', 'الأرباح المحتجزة')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-roe">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('equity.returnOnEquity', 'Return on Equity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.2%</div>
            <p className="text-xs text-green-600 mt-1">{t('equity.returnOnEquityAr', 'العائد على حقوق الملكية')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('equity.equityComposition', 'Equity Composition')}</CardTitle>
            <CardDescription>{t('equity.equityCompositionAr', 'تكوين حقوق الملكية')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div data-testid="bar-share-capital">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{t('equity.shareCapital', 'Share Capital')}</span>
                  <span className="text-sm text-muted-foreground">
                    SAR {shareCapital.toLocaleString()} ({Math.round((shareCapital / totalEquity) * 100)}%)
                  </span>
                </div>
                <Progress value={(shareCapital / totalEquity) * 100} className="h-3 bg-blue-100" />
              </div>
              <div data-testid="bar-retained-earnings">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{t('equity.retainedEarnings', 'Retained Earnings')}</span>
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
            <CardTitle>{t('equity.equityGrowthTrend', 'Equity Growth Trend')}</CardTitle>
            <CardDescription>{t('equity.equityGrowthTrendDesc', 'اتجاه نمو حقوق الملكية - Last 6 years')}</CardDescription>
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
          <CardTitle>{t('equity.keyFinancialRatios', 'Key Financial Ratios')}</CardTitle>
          <CardDescription>{t('equity.keyFinancialRatiosAr', 'النسب المالية الرئيسية')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center" data-testid="card-ratio-equity">
              <Scale className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold">0.65</p>
              <p className="text-sm text-muted-foreground">{t('equity.debtToEquity', 'Debt to Equity')}</p>
            </div>
            <div className="p-4 border rounded-lg text-center" data-testid="card-ratio-roe">
              <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold">15.2%</p>
              <p className="text-sm text-muted-foreground">{t('equity.returnOnEquity', 'Return on Equity')}</p>
            </div>
            <div className="p-4 border rounded-lg text-center" data-testid="card-ratio-book">
              <Coins className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold">SAR 1,765</p>
              <p className="text-sm text-muted-foreground">{t('equity.bookValuePerShare', 'Book Value/Share')}</p>
            </div>
            <div className="p-4 border rounded-lg text-center" data-testid="card-ratio-payout">
              <Award className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <p className="text-2xl font-bold">23.5%</p>
              <p className="text-sm text-muted-foreground">{t('equity.dividendPayout', 'Dividend Payout')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('equity.relatedEquityModules', 'Related Equity Modules')}</CardTitle>
          <CardDescription>{t('equity.relatedEquityModulesDesc', 'وحدات حقوق الملكية ذات الصلة - Quick access to equity sub-categories')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/capital-management">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full" data-testid="link-capital-management">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Landmark className="h-8 w-8 text-blue-600" />
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{t('equity.capitalManagement', 'Capital Management')}</CardTitle>
                  <CardDescription>{t('equity.capitalManagementAr', 'رأس المال')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t('equity.capitalManagementDesc', 'Manage share capital, ownership structure, and capital contributions')}</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/partners-current-account">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full" data-testid="link-partners-account">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Users className="h-8 w-8 text-green-600" />
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{t('equity.partnersAccount', 'Partners Account')}</CardTitle>
                  <CardDescription>{t('equity.partnersAccountAr', 'جاري الشركاء')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t('equity.partnersAccountDesc', 'Track partner balances, transactions, and withdrawals')}</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/retained-earnings">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full" data-testid="link-retained-earnings">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <PiggyBank className="h-8 w-8 text-purple-600" />
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{t('equity.retainedEarnings', 'Retained Earnings')}</CardTitle>
                  <CardDescription>{t('equity.retainedEarningsLinkAr', 'الاحتياطات والأرباح')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t('equity.retainedEarningsDesc', 'Manage profit reserves, distributions, and retained earnings')}</p>
                </CardContent>
              </Card>
            </Link>
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
              <CardTitle>{t('equity.capitalStructure', 'Capital Structure')}</CardTitle>
              <CardDescription>{t('equity.capitalStructureDesc', 'هيكل رأس المال - Owner\'s investments and equity')}</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-capital">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('equity.addEntry', 'Add Entry')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" data-testid="modal-add-capital">
                <DialogHeader>
                  <DialogTitle>{t('equity.addCapitalEntry', 'Add Capital Entry')}</DialogTitle>
                  <DialogDescription>{t('equity.addCapitalEntryAr', 'إضافة قيد رأس المال')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('common.type', 'Type')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-type">
                                  <SelectValue placeholder={t('equity.selectType', 'Select type')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Share Capital">{t('equity.shareCapital', 'Share Capital')}</SelectItem>
                                <SelectItem value="Additional Capital">{t('equity.additionalCapital', 'Additional Capital')}</SelectItem>
                                <SelectItem value="Capital Withdrawal">{t('equity.capitalWithdrawal', 'Capital Withdrawal')}</SelectItem>
                                <SelectItem value="Retained Earnings">{t('equity.retainedEarnings', 'Retained Earnings')}</SelectItem>
                                <SelectItem value="Dividend Distribution">{t('equity.dividendDistribution', 'Dividend Distribution')}</SelectItem>
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
                            <FormLabel>{t('equity.amountSAR', 'Amount (SAR)')}</FormLabel>
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
                            <FormLabel>{t('common.description', 'Description')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('equity.enterDescription', 'Enter description')} data-testid="input-description" />
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
                        name="investor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('equity.investorOwner', 'Investor/Owner')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('common.optional', 'Optional')} data-testid="input-investor" />
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
                            <FormLabel>{t('common.notes', 'Notes')}</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder={t('equity.additionalNotes', 'Additional notes')} data-testid="input-notes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        {t('common.cancel', 'Cancel')}
                      </Button>
                      <Button type="submit" data-testid="button-save-capital">{t('equity.saveEntry', 'Save Entry')}</Button>
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
                <TableHead>{t('common.type', 'Type')}</TableHead>
                <TableHead>{t('common.description', 'Description')}</TableHead>
                <TableHead>{t('equity.investorOwner', 'Investor/Owner')}</TableHead>
                <TableHead>{t('common.date', 'Date')}</TableHead>
                <TableHead>{t('common.amount', 'Amount')}</TableHead>
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
              {t('equity.ownershipStructure', 'Ownership Structure')}
            </CardTitle>
            <CardDescription>{t('equity.ownershipStructureAr', 'هيكل الملكية')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg" data-testid="card-owner-1">
                <div>
                  <p className="font-medium">Mohammed Al-Salem</p>
                  <p className="text-sm text-muted-foreground">{t('equity.founderCEO', 'Founder & CEO')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">60%</p>
                  <p className="text-sm text-muted-foreground">{t('equity.shares', '1,200 shares')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg" data-testid="card-owner-2">
                <div>
                  <p className="font-medium">Ahmed Al-Salem</p>
                  <p className="text-sm text-muted-foreground">{t('equity.coOwner', 'Co-owner')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">25%</p>
                  <p className="text-sm text-muted-foreground">{t('equity.shares500', '500 shares')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg" data-testid="card-owner-3">
                <div>
                  <p className="font-medium">Fatima Al-Salem</p>
                  <p className="text-sm text-muted-foreground">{t('equity.coOwner', 'Co-owner')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">15%</p>
                  <p className="text-sm text-muted-foreground">{t('equity.shares300', '300 shares')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              {t('equity.reservesProvisions', 'Reserves & Provisions')}
            </CardTitle>
            <CardDescription>{t('equity.reservesProvisionsAr', 'الاحتياطيات والمخصصات')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between" data-testid="card-reserve-legal">
                <div>
                  <p className="font-medium">{t('equity.legalReserve', 'Legal Reserve')}</p>
                  <p className="text-sm text-muted-foreground">{t('equity.legalReserveDesc', '10% of net income')}</p>
                </div>
                <p className="font-bold text-green-600">SAR 250,000</p>
              </div>
              <div className="flex items-center justify-between" data-testid="card-reserve-general">
                <div>
                  <p className="font-medium">{t('equity.generalReserve', 'General Reserve')}</p>
                  <p className="text-sm text-muted-foreground">{t('equity.generalReserveDesc', 'Discretionary reserve')}</p>
                </div>
                <p className="font-bold text-green-600">SAR 150,000</p>
              </div>
              <div className="flex items-center justify-between" data-testid="card-reserve-expansion">
                <div>
                  <p className="font-medium">{t('equity.expansionReserve', 'Expansion Reserve')}</p>
                  <p className="text-sm text-muted-foreground">{t('equity.expansionReserveDesc', 'Future growth fund')}</p>
                </div>
                <p className="font-bold text-green-600">SAR 100,000</p>
              </div>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('equity.totalDividendsPaid', 'Total Dividends Paid')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">SAR 630,000</div>
            <p className="text-xs text-muted-foreground mt-1">{t('equity.since2020', 'Since 2020')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-dividend-yield">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('equity.dividendYield', 'Dividend Yield')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">5.7%</div>
            <p className="text-xs text-muted-foreground mt-1">{t('equity.currentYield', 'Current yield')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-payout-ratio">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('equity.payoutRatio', 'Payout Ratio')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">23.5%</div>
            <p className="text-xs text-muted-foreground mt-1">{t('equity.ofNetIncome', 'Of net income')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('equity.dividendHistory', 'Dividend History')}</CardTitle>
          <CardDescription>{t('equity.dividendHistoryAr', 'سجل توزيعات الأرباح')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('equity.year', 'Year')}</TableHead>
                <TableHead>{t('equity.declared', 'Declared')}</TableHead>
                <TableHead>{t('equity.paid', 'Paid')}</TableHead>
                <TableHead>{t('equity.perShare', 'Per Share')}</TableHead>
                <TableHead>{t('equity.paymentDate', 'Payment Date')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dividendHistory.map((dividend, index) => (
                <TableRow key={index} data-testid={`row-dividend-${dividend.year}`}>
                  <TableCell className="font-medium">{dividend.year}</TableCell>
                  <TableCell>SAR {dividend.declared.toLocaleString()}</TableCell>
                  <TableCell>SAR {dividend.paid.toLocaleString()}</TableCell>
                  <TableCell>SAR {dividend.perShare}</TableCell>
                  <TableCell>{dividend.paymentDate}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-600">{t('equity.paid', 'Paid')}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const reportsTab = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('equity.equityReports', 'Equity Reports')}</CardTitle>
          <CardDescription>{t('equity.equityReportsDesc', 'Generate and download equity-related reports')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-equity-statement">
              <CardHeader className="pb-2">
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg">{t('equity.equityStatement', 'Statement of Equity')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{t('equity.equityStatementDesc', 'Complete statement of changes in equity')}</p>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  {t('common.download', 'Download')}
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-ownership">
              <CardHeader className="pb-2">
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle className="text-lg">{t('equity.ownershipReport', 'Ownership Report')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{t('equity.ownershipReportDesc', 'Detailed ownership structure and shares')}</p>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  {t('common.download', 'Download')}
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" data-testid="card-report-dividends">
              <CardHeader className="pb-2">
                <PieChart className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle className="text-lg">{t('equity.dividendReport', 'Dividend Report')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{t('equity.dividendReportDesc', 'Historical dividend payments and analysis')}</p>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  {t('common.download', 'Download')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6">
      <TabsPageLayout
        title={t('equity.equityManagement', 'Equity Management')}
        subtitle={t('equity.equityManagementSubtitle', 'إدارة حقوق الملكية - Track and manage owner\'s equity and capital')}
        tabs={[
          { id: "overview", label: t('equity.overview', 'Overview'), icon: Wallet, content: overviewTab },
          { id: "capital", label: t('equity.capital', 'Capital'), icon: Landmark, content: capitalTab },
          { id: "dividends", label: t('equity.dividends', 'Dividends'), icon: Coins, content: dividendsTab },
          { id: "reports", label: t('equity.reports', 'Reports'), icon: FileText, content: reportsTab },
        ]}
      />
    </div>
  );
}
