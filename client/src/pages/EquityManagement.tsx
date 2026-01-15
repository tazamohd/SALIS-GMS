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
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-equity">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('equity.totalEquity', 'Total Equity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0A5ED7]">
              SAR {totalEquity.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-[#0A5ED7] mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              {t('equity.fromLastYear', '+5.4% from last year')}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-share-capital">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('equity.shareCapital', 'Share Capital')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0A5ED7]">
              SAR {shareCapital.toLocaleString()}
            </div>
            <p className="text-xs text-[#64748B] mt-1">{t('equity.shareCapitalAr', 'Share Capital')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-retained-earnings">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('equity.retainedEarnings', 'Retained Earnings')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0BB3FF]">
              SAR {retainedEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-[#64748B] mt-1">{t('equity.retainedEarningsAr', 'Retained Earnings')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-roe">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('equity.returnOnEquity', 'Return on Equity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">15.2%</div>
            <p className="text-xs text-[#0A5ED7] mt-1">{t('equity.returnOnEquityAr', 'Return on Equity')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('equity.equityComposition', 'Equity Composition')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('equity.equityCompositionAr', 'Equity Composition')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div data-testid="bar-share-capital">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('equity.shareCapital', 'Share Capital')}</span>
                  <span className="text-sm text-[#64748B]">
                    SAR {shareCapital.toLocaleString()} ({Math.round((shareCapital / totalEquity) * 100)}%)
                  </span>
                </div>
                <Progress value={(shareCapital / totalEquity) * 100} className="h-3" />
              </div>
              <div data-testid="bar-retained-earnings">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('equity.retainedEarnings', 'Retained Earnings')}</span>
                  <span className="text-sm text-[#64748B]">
                    SAR {retainedEarnings.toLocaleString()} ({Math.round((retainedEarnings / totalEquity) * 100)}%)
                  </span>
                </div>
                <Progress value={(retainedEarnings / totalEquity) * 100} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('equity.equityGrowthTrend', 'Equity Growth Trend')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('equity.equityGrowthTrendDesc', 'Last 6 years')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {yearlyEquity.map((year, index) => (
                <div key={index} data-testid={`bar-year-${year.year}`}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">{year.year}</span>
                    <span className="text-sm text-[#64748B]">SAR {year.total.toLocaleString()}</span>
                  </div>
                  <Progress value={(year.total / 4000000) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('equity.keyFinancialRatios', 'Key Financial Ratios')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('equity.keyFinancialRatiosAr', 'Key Financial Ratios')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg text-center bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid="card-ratio-equity">
              <Scale className="h-8 w-8 mx-auto text-[#0A5ED7] mb-2" />
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">0.65</p>
              <p className="text-sm text-[#64748B]">{t('equity.debtToEquity', 'Debt to Equity')}</p>
            </div>
            <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg text-center bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid="card-ratio-roe">
              <TrendingUp className="h-8 w-8 mx-auto text-[#0A5ED7] mb-2" />
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">15.2%</p>
              <p className="text-sm text-[#64748B]">{t('equity.returnOnEquity', 'Return on Equity')}</p>
            </div>
            <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg text-center bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid="card-ratio-book">
              <Coins className="h-8 w-8 mx-auto text-[#0BB3FF] mb-2" />
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">SAR 1,765</p>
              <p className="text-sm text-[#64748B]">{t('equity.bookValuePerShare', 'Book Value/Share')}</p>
            </div>
            <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg text-center bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid="card-ratio-payout">
              <Award className="h-8 w-8 mx-auto text-[#F97316] mb-2" />
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">23.5%</p>
              <p className="text-sm text-[#64748B]">{t('equity.dividendPayout', 'Dividend Payout')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('equity.relatedEquityModules', 'Related Equity Modules')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('equity.relatedEquityModulesDesc', 'Quick access to equity sub-categories')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/capital-management">
              <Card className="cursor-pointer hover:border-[#0A5ED7] transition-colors h-full bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="link-capital-management">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Landmark className="h-8 w-8 text-[#0A5ED7]" />
                    <ExternalLink className="h-4 w-4 text-[#64748B]" />
                  </div>
                  <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('equity.capitalManagement', 'Capital Management')}</CardTitle>
                  <CardDescription className="text-[#64748B]">{t('equity.capitalManagementAr', 'Capital')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#64748B]">{t('equity.capitalManagementDesc', 'Manage share capital, ownership structure, and capital contributions')}</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/partners-current-account">
              <Card className="cursor-pointer hover:border-[#0A5ED7] transition-colors h-full bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="link-partners-account">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Users className="h-8 w-8 text-[#0A5ED7]" />
                    <ExternalLink className="h-4 w-4 text-[#64748B]" />
                  </div>
                  <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('equity.partnersAccount', 'Partners Account')}</CardTitle>
                  <CardDescription className="text-[#64748B]">{t('equity.partnersAccountAr', 'Partners Current Account')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#64748B]">{t('equity.partnersAccountDesc', 'Track partner balances, transactions, and withdrawals')}</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/retained-earnings">
              <Card className="cursor-pointer hover:border-[#0A5ED7] transition-colors h-full bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="link-retained-earnings">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <PiggyBank className="h-8 w-8 text-[#0BB3FF]" />
                    <ExternalLink className="h-4 w-4 text-[#64748B]" />
                  </div>
                  <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('equity.retainedEarnings', 'Retained Earnings')}</CardTitle>
                  <CardDescription className="text-[#64748B]">{t('equity.retainedEarningsLinkAr', 'Reserves and Profits')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#64748B]">{t('equity.retainedEarningsDesc', 'Manage profit reserves, distributions, and retained earnings')}</p>
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
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('equity.capitalStructure', 'Capital Structure')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('equity.capitalStructureDesc', 'Owner\'s investments and equity')}</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#0aa0e6] text-white" data-testid="button-add-capital">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('equity.addEntry', 'Add Entry')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="modal-add-capital">
                <DialogHeader>
                  <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('equity.addCapitalEntry', 'Add Capital Entry')}</DialogTitle>
                  <DialogDescription className="text-[#64748B]">{t('equity.addCapitalEntryAr', 'Add capital entry')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.type', 'Type')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-type">
                                  <SelectValue placeholder={t('equity.selectType', 'Select type')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
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
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('equity.amountSAR', 'Amount (SAR)')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0.00" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-amount" />
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
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.description', 'Description')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('equity.enterDescription', 'Enter description')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-description" />
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
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.date', 'Date')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-date" />
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
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('equity.investorOwner', 'Investor/Owner')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('common.optional', 'Optional')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-investor" />
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
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.notes', 'Notes')}</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder={t('equity.additionalNotes', 'Additional notes')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-notes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                        {t('common.cancel', 'Cancel')}
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#0aa0e6] text-white" data-testid="button-save-capital">{t('equity.saveEntry', 'Save Entry')}</Button>
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
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('common.type', 'Type')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.description', 'Description')}</TableHead>
                <TableHead className="text-[#64748B]">{t('equity.investorOwner', 'Investor/Owner')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.date', 'Date')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.amount', 'Amount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equityComponents.map((item) => (
                <TableRow key={item.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-capital-${item.id}`}>
                  <TableCell>
                    <Badge className={item.type.includes("Capital") ? "bg-[#0A5ED7] text-white" : "bg-[#F8FAFC] dark:bg-[#232A36] text-[#64748B]"}>
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{item.description}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{item.investor}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{item.date}</TableCell>
                  <TableCell className="font-medium text-[#0A5ED7]">
                    SAR {item.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Users className="h-5 w-5 text-[#0A5ED7]" />
              {t('equity.ownershipStructure', 'Ownership Structure')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('equity.ownershipStructureAr', 'Ownership Structure')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid="card-owner-1">
                <div>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">Mohammed Al-Salem</p>
                  <p className="text-sm text-[#64748B]">{t('equity.founderCEO', 'Founder & CEO')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0A5ED7]">60%</p>
                  <p className="text-sm text-[#64748B]">{t('equity.shares', '1,200 shares')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid="card-owner-2">
                <div>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">Ahmed Al-Salem</p>
                  <p className="text-sm text-[#64748B]">{t('equity.coFounder', 'Co-Founder')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0A5ED7]">40%</p>
                  <p className="text-sm text-[#64748B]">{t('equity.shares', '800 shares')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <DollarSign className="h-5 w-5 text-[#0A5ED7]" />
              {t('equity.dividendHistory', 'Dividend History')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('equity.dividendHistoryAr', 'Dividend History')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                  <TableHead className="text-[#64748B]">{t('common.year', 'Year')}</TableHead>
                  <TableHead className="text-[#64748B]">{t('equity.declared', 'Declared')}</TableHead>
                  <TableHead className="text-[#64748B]">{t('equity.perShare', 'Per Share')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dividendHistory.map((dividend, index) => (
                  <TableRow key={index} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-dividend-${dividend.year}`}>
                    <TableCell className="font-medium text-[#0B1F3B] dark:text-white">{dividend.year}</TableCell>
                    <TableCell className="text-[#0A5ED7]">SAR {dividend.declared.toLocaleString()}</TableCell>
                    <TableCell className="text-[#0B1F3B] dark:text-white">SAR {dividend.perShare}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const tabs = [
    {
      id: "overview",
      label: t('equity.overview', 'Overview'),
      icon: Wallet,
      content: overviewTab,
    },
    {
      id: "capital",
      label: t('equity.capital', 'Capital'),
      icon: Landmark,
      content: capitalTab,
    },
  ];

  return (
    <div className="p-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <TabsPageLayout
        title={t('equity.title', 'Equity Management')}
        description={t('equity.description', 'Track owner\'s equity, capital, and retained earnings')}
        defaultTab="overview"
        tabs={tabs}
      />
    </div>
  );
}
