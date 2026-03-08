import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  TrendingUp,
  TrendingDown,
  Download,
  Printer,
  DollarSign,
  BarChart3,
  FileText,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Scale,
  PieChart,
} from "lucide-react";

const revenueData = [
  { code: "4100", name: "Service Revenue", amount: 356000, previousAmount: 312000 },
  { code: "4200", name: "Parts Sales Revenue", amount: 89000, previousAmount: 78500 },
  { code: "4300", name: "Diagnostic Services", amount: 45000, previousAmount: 38000 },
  { code: "4400", name: "Warranty Claims Revenue", amount: 28000, previousAmount: 22000 },
  { code: "4500", name: "Other Income", amount: 12000, previousAmount: 9500 },
];

const costOfGoodsSold = [
  { code: "5100", name: "Cost of Parts Sold", amount: 78500, previousAmount: 68000 },
  { code: "5110", name: "Direct Labor - Technicians", amount: 95000, previousAmount: 88000 },
  { code: "5120", name: "Consumables & Materials", amount: 15500, previousAmount: 14000 },
];

const operatingExpenses = [
  { code: "5200", name: "Salaries & Wages - Admin", amount: 50000, previousAmount: 48000 },
  { code: "5300", name: "Rent Expense", amount: 36000, previousAmount: 36000 },
  { code: "5400", name: "Utilities Expense", amount: 28500, previousAmount: 26000 },
  { code: "5500", name: "Depreciation Expense", amount: 22500, previousAmount: 22500 },
  { code: "5600", name: "Insurance Expense", amount: 14000, previousAmount: 14000 },
  { code: "5700", name: "Marketing & Advertising", amount: 18000, previousAmount: 15000 },
  { code: "5800", name: "Professional Fees", amount: 8500, previousAmount: 7500 },
  { code: "5900", name: "Office Supplies", amount: 4500, previousAmount: 4000 },
  { code: "5950", name: "Repairs & Maintenance", amount: 12000, previousAmount: 10000 },
];

const otherItems = [
  { code: "6100", name: "Interest Expense", amount: 8500, previousAmount: 9000 },
  { code: "6200", name: "Bank Charges", amount: 2500, previousAmount: 2200 },
];

export default function IncomeStatement() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("2024-01");
  const [compareWith, setCompareWith] = useState("previous");

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
  const totalPreviousRevenue = revenueData.reduce((sum, item) => sum + item.previousAmount, 0);
  const totalCOGS = costOfGoodsSold.reduce((sum, item) => sum + item.amount, 0);
  const totalPreviousCOGS = costOfGoodsSold.reduce((sum, item) => sum + item.previousAmount, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const previousGrossProfit = totalPreviousRevenue - totalPreviousCOGS;
  const totalOperatingExpenses = operatingExpenses.reduce((sum, item) => sum + item.amount, 0);
  const previousOperatingExpenses = operatingExpenses.reduce((sum, item) => sum + item.previousAmount, 0);
  const operatingIncome = grossProfit - totalOperatingExpenses;
  const previousOperatingIncome = previousGrossProfit - previousOperatingExpenses;
  const totalOtherExpenses = otherItems.reduce((sum, item) => sum + item.amount, 0);
  const previousOtherExpenses = otherItems.reduce((sum, item) => sum + item.previousAmount, 0);
  const netIncome = operatingIncome - totalOtherExpenses;
  const previousNetIncome = previousOperatingIncome - previousOtherExpenses;

  const grossMargin = (grossProfit / totalRevenue) * 100;
  const operatingMargin = (operatingIncome / totalRevenue) * 100;
  const netMargin = (netIncome / totalRevenue) * 100;

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        <span className="text-xs">{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  const statementTab = (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]" data-testid="select-period">
              <SelectValue placeholder={t('incomeStatement.selectPeriod', 'Select Period')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01">{t('incomeStatement.january2024', 'January 2024')}</SelectItem>
              <SelectItem value="2024-q1">{t('incomeStatement.q12024', 'Q1 2024')}</SelectItem>
              <SelectItem value="2023">{t('incomeStatement.fullYear2023', 'Full Year 2023')}</SelectItem>
              <SelectItem value="2023-q4">{t('incomeStatement.q42023', 'Q4 2023')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={compareWith} onValueChange={setCompareWith}>
            <SelectTrigger className="w-[180px]" data-testid="select-compare">
              <SelectValue placeholder={t('incomeStatement.compareWith', 'Compare With')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="previous">{t('incomeStatement.previousPeriod', 'Previous Period')}</SelectItem>
              <SelectItem value="budget">{t('incomeStatement.budget', 'Budget')}</SelectItem>
              <SelectItem value="lastyear">{t('incomeStatement.samePeriodLastYear', 'Same Period Last Year')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-print">
            <Printer className="h-4 w-4 mr-2" />
            {t('common.print', 'Print')}
          </Button>
          <Button variant="outline" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            {t('common.export', 'Export')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="text-center border-b">
          <CardTitle className="text-xl">{t('app.name', 'SALIS AUTO')}</CardTitle>
          <CardDescription className="text-base">
            {t('incomeStatement.title', 'Income Statement')} (قائمة الدخل)
          </CardDescription>
          <p className="text-sm text-muted-foreground">
            {t('incomeStatement.forPeriodEnding', 'For the Period Ending January 31, 2024')}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">{t('incomeStatement.code', 'Code')}</TableHead>
                <TableHead>{t('common.description', 'Description')}</TableHead>
                <TableHead className="text-right">{t('incomeStatement.currentPeriod', 'Current Period')}</TableHead>
                <TableHead className="text-right">{t('incomeStatement.previousPeriod', 'Previous Period')}</TableHead>
                <TableHead className="text-right">{t('incomeStatement.change', 'Change')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-green-50 dark:bg-green-900/20">
                <TableCell colSpan={5} className="font-bold text-green-700 dark:text-green-400">
                  {t('incomeStatement.revenue', 'REVENUE')}
                </TableCell>
              </TableRow>
              {revenueData.map((item) => (
                <TableRow key={item.code} data-testid={`row-revenue-${item.code}`}>
                  <TableCell className="font-mono text-sm">{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    {item.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {item.previousAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {getChangeIndicator(item.amount, item.previousAmount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell></TableCell>
                <TableCell>{t('incomeStatement.totalRevenue', 'Total Revenue')}</TableCell>
                <TableCell className="text-right font-mono text-green-600">
                  {totalRevenue.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {totalPreviousRevenue.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {getChangeIndicator(totalRevenue, totalPreviousRevenue)}
                </TableCell>
              </TableRow>

              <TableRow className="bg-orange-50 dark:bg-orange-900/20">
                <TableCell colSpan={5} className="font-bold text-orange-700 dark:text-orange-400">
                  {t('incomeStatement.costOfGoodsSold', 'COST OF GOODS SOLD')}
                </TableCell>
              </TableRow>
              {costOfGoodsSold.map((item) => (
                <TableRow key={item.code} data-testid={`row-cogs-${item.code}`}>
                  <TableCell className="font-mono text-sm">{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    ({item.amount.toLocaleString()})
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    ({item.previousAmount.toLocaleString()})
                  </TableCell>
                  <TableCell className="text-right">
                    {getChangeIndicator(item.previousAmount, item.amount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell></TableCell>
                <TableCell>{t('incomeStatement.totalCostOfGoodsSold', 'Total Cost of Goods Sold')}</TableCell>
                <TableCell className="text-right font-mono text-red-600">
                  ({totalCOGS.toLocaleString()})
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  ({totalPreviousCOGS.toLocaleString()})
                </TableCell>
                <TableCell></TableCell>
              </TableRow>

              <TableRow className="bg-blue-50 dark:bg-blue-900/20 font-bold">
                <TableCell></TableCell>
                <TableCell className="text-blue-700 dark:text-blue-400">{t('incomeStatement.grossProfit', 'GROSS PROFIT')}</TableCell>
                <TableCell className="text-right font-mono text-blue-600">
                  {grossProfit.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {previousGrossProfit.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {getChangeIndicator(grossProfit, previousGrossProfit)}
                </TableCell>
              </TableRow>

              <TableRow className="bg-red-50 dark:bg-red-900/20">
                <TableCell colSpan={5} className="font-bold text-red-700 dark:text-red-400">
                  {t('incomeStatement.operatingExpenses', 'OPERATING EXPENSES')}
                </TableCell>
              </TableRow>
              {operatingExpenses.map((item) => (
                <TableRow key={item.code} data-testid={`row-opex-${item.code}`}>
                  <TableCell className="font-mono text-sm">{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    ({item.amount.toLocaleString()})
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    ({item.previousAmount.toLocaleString()})
                  </TableCell>
                  <TableCell className="text-right">
                    {getChangeIndicator(item.previousAmount, item.amount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell></TableCell>
                <TableCell>{t('incomeStatement.totalOperatingExpenses', 'Total Operating Expenses')}</TableCell>
                <TableCell className="text-right font-mono text-red-600">
                  ({totalOperatingExpenses.toLocaleString()})
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  ({previousOperatingExpenses.toLocaleString()})
                </TableCell>
                <TableCell></TableCell>
              </TableRow>

              <TableRow className="bg-purple-50 dark:bg-purple-900/20 font-bold">
                <TableCell></TableCell>
                <TableCell className="text-purple-700 dark:text-purple-400">{t('incomeStatement.operatingIncome', 'OPERATING INCOME')}</TableCell>
                <TableCell className="text-right font-mono text-purple-600">
                  {operatingIncome.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {previousOperatingIncome.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {getChangeIndicator(operatingIncome, previousOperatingIncome)}
                </TableCell>
              </TableRow>

              <TableRow className="bg-gray-50 dark:bg-gray-900/20">
                <TableCell colSpan={5} className="font-bold text-gray-700 dark:text-gray-400">
                  {t('incomeStatement.otherExpenses', 'OTHER EXPENSES')}
                </TableCell>
              </TableRow>
              {otherItems.map((item) => (
                <TableRow key={item.code} data-testid={`row-other-${item.code}`}>
                  <TableCell className="font-mono text-sm">{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    ({item.amount.toLocaleString()})
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    ({item.previousAmount.toLocaleString()})
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}

              <TableRow className="bg-green-100 dark:bg-green-900/40 font-bold text-lg">
                <TableCell></TableCell>
                <TableCell className="text-green-800 dark:text-green-300">{t('incomeStatement.netIncome', 'NET INCOME')}</TableCell>
                <TableCell className="text-right font-mono text-green-700 dark:text-green-400">
                  SAR {netIncome.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  SAR {previousNetIncome.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {getChangeIndicator(netIncome, previousNetIncome)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const analysisTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-total-revenue" className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              {t('incomeStatement.totalRevenue', 'Total Revenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              SAR {totalRevenue.toLocaleString()}
            </p>
            {getChangeIndicator(totalRevenue, totalPreviousRevenue)}
          </CardContent>
        </Card>

        <Card data-testid="card-gross-profit" className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              {t('incomeStatement.grossProfit', 'Gross Profit')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              SAR {grossProfit.toLocaleString()}
            </p>
            <p className="text-sm text-[#64748B]">
              {t('incomeStatement.margin', 'Margin')}: {grossMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-operating-income" className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              {t('incomeStatement.operatingIncome', 'Operating Income')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">
              SAR {operatingIncome.toLocaleString()}
            </p>
            <p className="text-sm text-[#64748B]">
              {t('incomeStatement.margin', 'Margin')}: {operatingMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-net-income" className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              {t('incomeStatement.netIncome', 'Net Income')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              SAR {netIncome.toLocaleString()}
            </p>
            <p className="text-sm text-[#64748B]">
              {t('incomeStatement.margin', 'Margin')}: {netMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('incomeStatement.profitabilityMargins', 'Profitability Margins')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('incomeStatement.keyMarginPercentages', 'Key margin percentages')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{t('incomeStatement.grossMargin', 'Gross Margin')}</span>
                <span className="text-sm font-bold">{grossMargin.toFixed(1)}%</span>
              </div>
              <Progress value={grossMargin} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{t('incomeStatement.operatingMargin', 'Operating Margin')}</span>
                <span className="text-sm font-bold">{operatingMargin.toFixed(1)}%</span>
              </div>
              <Progress value={operatingMargin} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{t('incomeStatement.netProfitMargin', 'Net Profit Margin')}</span>
                <span className="text-sm font-bold">{netMargin.toFixed(1)}%</span>
              </div>
              <Progress value={netMargin} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('incomeStatement.expenseBreakdown', 'Expense Breakdown')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('incomeStatement.costDistributionAnalysis', 'Cost distribution analysis')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: t('incomeStatement.costOfGoodsSold', 'Cost of Goods Sold'), amount: totalCOGS, color: "bg-orange-500" },
                { name: t('incomeStatement.salariesWages', 'Salaries & Wages'), amount: 145000, color: "bg-blue-500" },
                { name: t('incomeStatement.rentUtilities', 'Rent & Utilities'), amount: 64500, color: "bg-purple-500" },
                { name: t('incomeStatement.otherOperating', 'Other Operating'), amount: 84500, color: "bg-gray-500" },
              ].map((expense, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded ${expense.color}`} />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm">{expense.name}</span>
                      <span className="text-sm font-mono">
                        SAR {expense.amount.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={(expense.amount / totalRevenue) * 100}
                      className="h-1 mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('incomeStatement.relatedReports', 'Related Reports')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('incomeStatement.navigateToRelated', 'Navigate to related financial statements')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/balance-sheet">
              <Button variant="outline" className="w-full justify-start" data-testid="link-balance-sheet">
                <Scale className="h-4 w-4 mr-2" />
                {t('incomeStatement.balanceSheet', 'Balance Sheet')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/cash-flow-statement">
              <Button variant="outline" className="w-full justify-start" data-testid="link-cash-flow">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('incomeStatement.cashFlow', 'Cash Flow')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/trial-balance">
              <Button variant="outline" className="w-full justify-start" data-testid="link-trial-balance">
                <BarChart3 className="h-4 w-4 mr-2" />
                {t('incomeStatement.trialBalance', 'Trial Balance')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/general-ledger">
              <Button variant="outline" className="w-full justify-start" data-testid="link-general-ledger">
                <FileText className="h-4 w-4 mr-2" />
                {t('incomeStatement.generalLedger', 'General Ledger')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const trendsTab = (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('incomeStatement.revenueTrends', 'Revenue Trends')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('incomeStatement.monthlyRevenuePerformance', 'Monthly revenue performance over time')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { month: t('incomeStatement.january2024', 'January 2024'), revenue: 530000, expenses: 389000, profit: 141000 },
              { month: t('incomeStatement.december2023', 'December 2023'), revenue: 510000, expenses: 375000, profit: 135000 },
              { month: t('incomeStatement.november2023', 'November 2023'), revenue: 485000, expenses: 362000, profit: 123000 },
              { month: t('incomeStatement.october2023', 'October 2023'), revenue: 498000, expenses: 368000, profit: 130000 },
              { month: t('incomeStatement.september2023', 'September 2023'), revenue: 475000, expenses: 355000, profit: 120000 },
              { month: t('incomeStatement.august2023', 'August 2023'), revenue: 462000, expenses: 348000, profit: 114000 },
            ].map((item, index) => (
              <div key={index} className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid={`trend-row-${index}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-[#0B1F3B] dark:text-white">{item.month}</span>
                  <Badge variant={item.profit > 130000 ? "default" : "secondary"} className={item.profit > 130000 ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" : ""}>
                    {item.profit > 130000 ? t('incomeStatement.aboveTarget', 'Above Target') : t('incomeStatement.onTrack', 'On Track')}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[#64748B]">{t('incomeStatement.revenue', 'Revenue')}</p>
                    <p className="font-mono font-bold text-green-600">
                      SAR {item.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B]">{t('incomeStatement.expenses', 'Expenses')}</p>
                    <p className="font-mono font-bold text-red-600">
                      SAR {item.expenses.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B]">{t('incomeStatement.netProfit', 'Net Profit')}</p>
                    <p className="font-mono font-bold text-blue-600">
                      SAR {item.profit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { id: "statement", label: t('incomeStatement.incomeStatement', 'Income Statement'), icon: FileText, content: statementTab },
    { id: "analysis", label: t('incomeStatement.analysis', 'Analysis'), icon: PieChart, content: analysisTab },
    { id: "trends", label: t('incomeStatement.trends', 'Trends'), icon: TrendingUp, content: trendsTab },
  ];

  return (
    <TabsPageLayout
      title={t('incomeStatement.title', 'Income Statement - قائمة الدخل')}
      description={t('incomeStatement.description', 'Profit and Loss statement for the period')}
      icon={TrendingUp}
      tabs={tabs}
      defaultTab="statement"
    />
  );
}
