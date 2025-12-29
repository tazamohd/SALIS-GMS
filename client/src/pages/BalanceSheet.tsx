import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Scale,
  Download,
  Printer,
  TrendingUp,
  Building2,
  Wallet,
  CreditCard,
  FileText,
  ExternalLink,
  CheckCircle,
  BarChart3,
  PieChart,
} from "lucide-react";

const currentAssets = [
  { code: "1100", name: "Cash & Cash Equivalents", amount: 155500, previousAmount: 142000 },
  { code: "1200", name: "Accounts Receivable", amount: 89500, previousAmount: 78000 },
  { code: "1210", name: "Less: Allowance for Doubtful Accounts", amount: -4500, previousAmount: -3500 },
  { code: "1300", name: "Inventory - Spare Parts", amount: 125000, previousAmount: 118000 },
  { code: "1400", name: "Prepaid Expenses", amount: 15000, previousAmount: 12000 },
  { code: "1450", name: "Other Current Assets", amount: 8500, previousAmount: 6500 },
];

const nonCurrentAssets = [
  { code: "1500", name: "Property & Equipment", amount: 450000, previousAmount: 450000 },
  { code: "1550", name: "Less: Accumulated Depreciation", amount: -67500, previousAmount: -45000 },
  { code: "1600", name: "Vehicles", amount: 180000, previousAmount: 180000 },
  { code: "1650", name: "Less: Accumulated Depreciation - Vehicles", amount: -36000, previousAmount: -24000 },
  { code: "1700", name: "Intangible Assets", amount: 25000, previousAmount: 25000 },
  { code: "1750", name: "Less: Accumulated Amortization", amount: -5000, previousAmount: -2500 },
];

const currentLiabilities = [
  { code: "2100", name: "Accounts Payable", amount: 78500, previousAmount: 65000 },
  { code: "2200", name: "Accrued Expenses", amount: 25000, previousAmount: 22000 },
  { code: "2300", name: "VAT Payable", amount: 18500, previousAmount: 15500 },
  { code: "2400", name: "Unearned Revenue", amount: 12000, previousAmount: 8000 },
  { code: "2500", name: "Current Portion of Long-term Debt", amount: 24000, previousAmount: 24000 },
];

const nonCurrentLiabilities = [
  { code: "2600", name: "Long-term Bank Loan", amount: 76000, previousAmount: 100000 },
  { code: "2700", name: "Deferred Tax Liabilities", amount: 8500, previousAmount: 6500 },
];

const equity = [
  { code: "3100", name: "Share Capital", amount: 300000, previousAmount: 300000 },
  { code: "3200", name: "Retained Earnings - Beginning", amount: 125000, previousAmount: 95000 },
  { code: "3300", name: "Current Year Net Income", amount: 141000, previousAmount: 125000 },
  { code: "3400", name: "Dividends Declared", amount: -50000, previousAmount: -30000 },
];

export default function BalanceSheet() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("2024-01-31");

  const totalCurrentAssets = currentAssets.reduce((sum, item) => sum + item.amount, 0);
  const totalNonCurrentAssets = nonCurrentAssets.reduce((sum, item) => sum + item.amount, 0);
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  const totalCurrentLiabilities = currentLiabilities.reduce((sum, item) => sum + item.amount, 0);
  const totalNonCurrentLiabilities = nonCurrentLiabilities.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

  const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const previousTotalAssets = [...currentAssets, ...nonCurrentAssets].reduce((sum, item) => sum + item.previousAmount, 0);

  const isBalanced = totalAssets === totalLiabilitiesAndEquity;
  const currentRatio = totalCurrentAssets / totalCurrentLiabilities;
  const debtRatio = (totalLiabilities / totalAssets) * 100;

  const balanceSheetTab = (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[200px]" data-testid="select-period">
              <SelectValue placeholder={t('accounting.selectDate', 'Select Date')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01-31">{t('accounting.dates.jan2024', 'January 31, 2024')}</SelectItem>
              <SelectItem value="2023-12-31">{t('accounting.dates.dec2023', 'December 31, 2023')}</SelectItem>
              <SelectItem value="2023-09-30">{t('accounting.dates.sep2023', 'September 30, 2023')}</SelectItem>
              <SelectItem value="2023-06-30">{t('accounting.dates.jun2023', 'June 30, 2023')}</SelectItem>
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
            {t('accounting.balanceSheet', 'Balance Sheet')} (الميزانية العمومية)
          </CardDescription>
          <p className="text-sm text-muted-foreground">
            {t('accounting.asOf', 'As of')} {period === "2024-01-31" ? t('accounting.dates.jan2024', 'January 31, 2024') : period}
          </p>
          <Badge variant={isBalanced ? "default" : "destructive"} className="w-fit mx-auto">
            {isBalanced ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('accounting.balanced', 'Balanced')}
              </>
            ) : (
              t('accounting.unbalanced', 'Unbalanced')
            )}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">{t('accounting.code', 'Code')}</TableHead>
                <TableHead>{t('common.description', 'Description')}</TableHead>
                <TableHead className="text-right">{t('accounting.currentPeriod', 'Current Period')}</TableHead>
                <TableHead className="text-right">{t('accounting.previousPeriod', 'Previous Period')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-blue-50 dark:bg-blue-900/20">
                <TableCell colSpan={4} className="font-bold text-blue-700 dark:text-blue-400">
                  {t('accounting.assets', 'ASSETS')}
                </TableCell>
              </TableRow>
              <TableRow className="bg-blue-50/50 dark:bg-blue-900/10">
                <TableCell colSpan={4} className="font-semibold text-blue-600 dark:text-blue-300 pl-6">
                  {t('accounting.currentAssets', 'Current Assets')}
                </TableCell>
              </TableRow>
              {currentAssets.map((item) => (
                <TableRow key={item.code} data-testid={`row-asset-${item.code}`}>
                  <TableCell className="font-mono text-sm pl-10">{item.code}</TableCell>
                  <TableCell className={item.amount < 0 ? "pl-8" : ""}>
                    {item.name}
                  </TableCell>
                  <TableCell className={`text-right font-mono ${item.amount < 0 ? "text-red-600" : ""}`}>
                    {item.amount < 0 ? `(${Math.abs(item.amount).toLocaleString()})` : item.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {item.previousAmount < 0 ? `(${Math.abs(item.previousAmount).toLocaleString()})` : item.previousAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell></TableCell>
                <TableCell className="pl-6">{t('accounting.totalCurrentAssets', 'Total Current Assets')}</TableCell>
                <TableCell className="text-right font-mono">{totalCurrentAssets.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {currentAssets.reduce((sum, item) => sum + item.previousAmount, 0).toLocaleString()}
                </TableCell>
              </TableRow>

              <TableRow className="bg-blue-50/50 dark:bg-blue-900/10">
                <TableCell colSpan={4} className="font-semibold text-blue-600 dark:text-blue-300 pl-6">
                  {t('accounting.nonCurrentAssets', 'Non-Current Assets')}
                </TableCell>
              </TableRow>
              {nonCurrentAssets.map((item) => (
                <TableRow key={item.code} data-testid={`row-asset-${item.code}`}>
                  <TableCell className="font-mono text-sm pl-10">{item.code}</TableCell>
                  <TableCell className={item.amount < 0 ? "pl-8" : ""}>
                    {item.name}
                  </TableCell>
                  <TableCell className={`text-right font-mono ${item.amount < 0 ? "text-red-600" : ""}`}>
                    {item.amount < 0 ? `(${Math.abs(item.amount).toLocaleString()})` : item.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {item.previousAmount < 0 ? `(${Math.abs(item.previousAmount).toLocaleString()})` : item.previousAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell></TableCell>
                <TableCell className="pl-6">{t('accounting.totalNonCurrentAssets', 'Total Non-Current Assets')}</TableCell>
                <TableCell className="text-right font-mono">{totalNonCurrentAssets.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {nonCurrentAssets.reduce((sum, item) => sum + item.previousAmount, 0).toLocaleString()}
                </TableCell>
              </TableRow>

              <TableRow className="bg-blue-100 dark:bg-blue-900/40 font-bold">
                <TableCell></TableCell>
                <TableCell>{t('accounting.totalAssets', 'TOTAL ASSETS')}</TableCell>
                <TableCell className="text-right font-mono text-blue-700 dark:text-blue-300">
                  {t('common.sar', 'SAR')} {totalAssets.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {t('common.sar', 'SAR')} {previousTotalAssets.toLocaleString()}
                </TableCell>
              </TableRow>

              <TableRow className="bg-red-50 dark:bg-red-900/20">
                <TableCell colSpan={4} className="font-bold text-red-700 dark:text-red-400">
                  {t('accounting.liabilities', 'LIABILITIES')}
                </TableCell>
              </TableRow>
              <TableRow className="bg-red-50/50 dark:bg-red-900/10">
                <TableCell colSpan={4} className="font-semibold text-red-600 dark:text-red-300 pl-6">
                  {t('accounting.currentLiabilities', 'Current Liabilities')}
                </TableCell>
              </TableRow>
              {currentLiabilities.map((item) => (
                <TableRow key={item.code} data-testid={`row-liability-${item.code}`}>
                  <TableCell className="font-mono text-sm pl-10">{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right font-mono">{item.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {item.previousAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell></TableCell>
                <TableCell className="pl-6">{t('accounting.totalCurrentLiabilities', 'Total Current Liabilities')}</TableCell>
                <TableCell className="text-right font-mono">{totalCurrentLiabilities.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {currentLiabilities.reduce((sum, item) => sum + item.previousAmount, 0).toLocaleString()}
                </TableCell>
              </TableRow>

              <TableRow className="bg-red-50/50 dark:bg-red-900/10">
                <TableCell colSpan={4} className="font-semibold text-red-600 dark:text-red-300 pl-6">
                  {t('accounting.nonCurrentLiabilities', 'Non-Current Liabilities')}
                </TableCell>
              </TableRow>
              {nonCurrentLiabilities.map((item) => (
                <TableRow key={item.code} data-testid={`row-liability-${item.code}`}>
                  <TableCell className="font-mono text-sm pl-10">{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right font-mono">{item.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {item.previousAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell></TableCell>
                <TableCell className="pl-6">{t('accounting.totalNonCurrentLiabilities', 'Total Non-Current Liabilities')}</TableCell>
                <TableCell className="text-right font-mono">{totalNonCurrentLiabilities.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {nonCurrentLiabilities.reduce((sum, item) => sum + item.previousAmount, 0).toLocaleString()}
                </TableCell>
              </TableRow>

              <TableRow className="bg-red-100 dark:bg-red-900/40 font-bold">
                <TableCell></TableCell>
                <TableCell>{t('accounting.totalLiabilities', 'TOTAL LIABILITIES')}</TableCell>
                <TableCell className="text-right font-mono text-red-700 dark:text-red-300">
                  {t('common.sar', 'SAR')} {totalLiabilities.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {t('common.sar', 'SAR')} {[...currentLiabilities, ...nonCurrentLiabilities].reduce((sum, item) => sum + item.previousAmount, 0).toLocaleString()}
                </TableCell>
              </TableRow>

              <TableRow className="bg-purple-50 dark:bg-purple-900/20">
                <TableCell colSpan={4} className="font-bold text-purple-700 dark:text-purple-400">
                  {t('accounting.shareholdersEquity', "SHAREHOLDERS' EQUITY")}
                </TableCell>
              </TableRow>
              {equity.map((item) => (
                <TableRow key={item.code} data-testid={`row-equity-${item.code}`}>
                  <TableCell className="font-mono text-sm pl-10">{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className={`text-right font-mono ${item.amount < 0 ? "text-red-600" : ""}`}>
                    {item.amount < 0 ? `(${Math.abs(item.amount).toLocaleString()})` : item.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {item.previousAmount < 0 ? `(${Math.abs(item.previousAmount).toLocaleString()})` : item.previousAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-purple-100 dark:bg-purple-900/40 font-bold">
                <TableCell></TableCell>
                <TableCell>{t('accounting.totalEquity', 'TOTAL EQUITY')}</TableCell>
                <TableCell className="text-right font-mono text-purple-700 dark:text-purple-300">
                  {t('common.sar', 'SAR')} {totalEquity.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {t('common.sar', 'SAR')} {equity.reduce((sum, item) => sum + item.previousAmount, 0).toLocaleString()}
                </TableCell>
              </TableRow>

              <TableRow className="bg-green-100 dark:bg-green-900/40 font-bold text-lg">
                <TableCell></TableCell>
                <TableCell>{t('accounting.totalLiabilitiesAndEquity', 'TOTAL LIABILITIES & EQUITY')}</TableCell>
                <TableCell className="text-right font-mono text-green-700 dark:text-green-300">
                  {t('common.sar', 'SAR')} {totalLiabilitiesAndEquity.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {t('common.sar', 'SAR')} {[...currentLiabilities, ...nonCurrentLiabilities, ...equity].reduce((sum, item) => sum + item.previousAmount, 0).toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const ratiosTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-current-ratio">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('accounting.currentRatio', 'Current Ratio')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {currentRatio.toFixed(2)}
            </p>
            <Badge variant={currentRatio >= 1.5 ? "default" : "secondary"}>
              {currentRatio >= 1.5 ? t('accounting.healthy', 'Healthy') : t('accounting.monitor', 'Monitor')}
            </Badge>
          </CardContent>
        </Card>

        <Card data-testid="card-debt-ratio">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('accounting.debtRatio', 'Debt Ratio')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {debtRatio.toFixed(1)}%
            </p>
            <Badge variant={debtRatio < 50 ? "default" : "destructive"}>
              {debtRatio < 50 ? t('accounting.lowRisk', 'Low Risk') : t('accounting.highDebt', 'High Debt')}
            </Badge>
          </CardContent>
        </Card>

        <Card data-testid="card-working-capital">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('accounting.workingCapital', 'Working Capital')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {t('common.sar', 'SAR')} {(totalCurrentAssets - totalCurrentLiabilities).toLocaleString()}
            </p>
            <Badge variant="default">{t('accounting.positive', 'Positive')}</Badge>
          </CardContent>
        </Card>

        <Card data-testid="card-equity-ratio">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('accounting.equityRatio', 'Equity Ratio')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">
              {((totalEquity / totalAssets) * 100).toFixed(1)}%
            </p>
            <Badge variant="default">{t('accounting.strong', 'Strong')}</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('accounting.financialPositionAnalysis', 'Financial Position Analysis')}</CardTitle>
          <CardDescription>{t('accounting.keyBalanceSheetMetrics', 'Key balance sheet metrics and trends')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                {t('accounting.assetComposition', 'Asset Composition')}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('accounting.currentAssets', 'Current Assets')}</span>
                  <span className="font-mono">{((totalCurrentAssets / totalAssets) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('accounting.nonCurrentAssets', 'Non-Current Assets')}</span>
                  <span className="font-mono">{((totalNonCurrentAssets / totalAssets) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-red-600" />
                {t('accounting.liabilityStructure', 'Liability Structure')}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('accounting.currentLiabilities', 'Current Liabilities')}</span>
                  <span className="font-mono">{((totalCurrentLiabilities / totalLiabilities) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('accounting.longTermLiabilities', 'Long-term Liabilities')}</span>
                  <span className="font-mono">{((totalNonCurrentLiabilities / totalLiabilities) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Wallet className="h-4 w-4 text-purple-600" />
                {t('accounting.capitalStructure', 'Capital Structure')}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('accounting.debtFinancing', 'Debt Financing')}</span>
                  <span className="font-mono">{debtRatio.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('accounting.equityFinancing', 'Equity Financing')}</span>
                  <span className="font-mono">{((totalEquity / totalAssets) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('accounting.relatedReports', 'Related Reports')}</CardTitle>
          <CardDescription>{t('accounting.navigateToRelatedStatements', 'Navigate to related financial statements')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/income-statement">
              <Button variant="outline" className="w-full justify-start" data-testid="link-income-statement">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('accounting.incomeStatement', 'Income Statement')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/cash-flow-statement">
              <Button variant="outline" className="w-full justify-start" data-testid="link-cash-flow">
                <BarChart3 className="h-4 w-4 mr-2" />
                {t('accounting.cashFlow', 'Cash Flow')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/equity-management">
              <Button variant="outline" className="w-full justify-start" data-testid="link-equity">
                <Wallet className="h-4 w-4 mr-2" />
                {t('accounting.equityManagement', 'Equity Management')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/assets-management">
              <Button variant="outline" className="w-full justify-start" data-testid="link-assets">
                <Building2 className="h-4 w-4 mr-2" />
                {t('accounting.assetsManagement', 'Assets Management')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const comparativeTab = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('accounting.comparativeBalanceSheet', 'Comparative Balance Sheet')}</CardTitle>
          <CardDescription>{t('accounting.yearOverYearComparison', 'Year-over-year comparison')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">{t('accounting.totalAssets', 'Total Assets')}</p>
                <p className="text-xl font-bold">{t('common.sar', 'SAR')} {totalAssets.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{((totalAssets - previousTotalAssets) / previousTotalAssets * 100).toFixed(1)}% {t('accounting.vsLastYear', 'vs last year')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('accounting.totalLiabilities', 'Total Liabilities')}</p>
                <p className="text-xl font-bold">{t('common.sar', 'SAR')} {totalLiabilities.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('accounting.totalEquity', 'Total Equity')}</p>
                <p className="text-xl font-bold">{t('common.sar', 'SAR')} {totalEquity.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { id: "balance-sheet", label: t('accounting.balanceSheet', 'Balance Sheet'), icon: Scale, content: balanceSheetTab },
    { id: "ratios", label: t('accounting.ratios', 'Ratios'), icon: PieChart, content: ratiosTab },
    { id: "comparative", label: t('accounting.comparative', 'Comparative'), icon: BarChart3, content: comparativeTab },
  ];

  return (
    <TabsPageLayout
      title={t('accounting.balanceSheetTitle', 'Balance Sheet - الميزانية العمومية')}
      description={t('accounting.balanceSheetDescription', 'Financial position statement')}
      icon={Scale}
      tabs={tabs}
      defaultTab="balance-sheet"
    />
  );
}
