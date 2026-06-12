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
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  Building2,
  Wallet,
  FileText,
  ExternalLink,
  BarChart3,
  Scale,
  Banknote,
} from "lucide-react";

const operatingActivities = [
  { description: "Net Income", amount: 141000 },
  { description: "Adjustments:", amount: null, isHeader: true },
  { description: "Depreciation & Amortization", amount: 30500 },
  { description: "Changes in Working Capital:", amount: null, isHeader: true },
  { description: "Increase in Accounts Receivable", amount: -11500 },
  { description: "Increase in Inventory", amount: -7000 },
  { description: "Increase in Prepaid Expenses", amount: -3000 },
  { description: "Increase in Accounts Payable", amount: 13500 },
  { description: "Increase in Accrued Expenses", amount: 3000 },
  { description: "Increase in VAT Payable", amount: 3000 },
  { description: "Increase in Unearned Revenue", amount: 4000 },
];

const investingActivities = [
  { description: "Purchase of Equipment", amount: 0 },
  { description: "Purchase of Vehicles", amount: 0 },
  { description: "Purchase of Intangible Assets", amount: 0 },
  { description: "Proceeds from Sale of Assets", amount: 5000 },
];

const financingActivities = [
  { description: "Repayment of Long-term Loan", amount: -24000 },
  { description: "Dividends Paid", amount: -50000 },
  { description: "Additional Capital Contributions", amount: 0 },
];

export default function CashFlowStatement() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("2024-01");

  const netOperatingCash = operatingActivities
    .filter((item) => item.amount !== null)
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  const netInvestingCash = investingActivities.reduce((sum, item) => sum + item.amount, 0);
  const netFinancingCash = financingActivities.reduce((sum, item) => sum + item.amount, 0);

  const netCashChange = netOperatingCash + netInvestingCash + netFinancingCash;
  const beginningCash = 142000;
  const endingCash = beginningCash + netCashChange;

  const getAmountDisplay = (amount: number | null, isHeader?: boolean) => {
    if (isHeader || amount === null) return null;
    const isNegative = amount < 0;
    return (
      <span className={`font-mono ${isNegative ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
        {isNegative ? `(${Math.abs(amount).toLocaleString()})` : amount.toLocaleString()}
      </span>
    );
  };

  const statementTab = (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-period">
              <SelectValue placeholder={t('accounting.selectPeriod', 'Select Period')} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <SelectItem value="2024-01">{t('accounting.periods.jan2024', 'January 2024')}</SelectItem>
              <SelectItem value="2024-q1">{t('accounting.periods.q12024', 'Q1 2024')}</SelectItem>
              <SelectItem value="2023">{t('accounting.periods.fullYear2023', 'Full Year 2023')}</SelectItem>
              <SelectItem value="2023-q4">{t('accounting.periods.q42023', 'Q4 2023')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="button-print">
            <Printer className="h-4 w-4 mr-2" />
            {t('common.print', 'Print')}
          </Button>
          <Button variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            {t('common.export', 'Export')}
          </Button>
        </div>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader className="text-center border-b border-[#E2E8F0] dark:border-[#232A36]">
          <CardTitle className="text-xl text-[#0B1F3B] dark:text-white">{t('app.name', 'SALIS AUTO')}</CardTitle>
          <CardDescription className="text-base text-[#64748B]">
            {t('accounting.cashFlowStatement', 'Cash Flow Statement')} (قائمة التدفقات النقدية)
          </CardDescription>
          <p className="text-sm text-[#64748B]">
            {t('accounting.forPeriodEnding', 'For the Period Ending January 31, 2024')}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC] dark:bg-[#0E1117] border-b border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.description', 'Description')}</TableHead>
                <TableHead className="text-right w-[200px] text-[#0B1F3B] dark:text-white">{t('accounting.amountSARHeader', 'Amount (SAR)')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-green-50 dark:bg-green-900/20 border-b border-[#E2E8F0] dark:border-[#232A36]">
                <TableCell colSpan={2} className="font-bold text-green-700 dark:text-green-400">
                  {t('accounting.cashFlowsFromOperating', 'CASH FLOWS FROM OPERATING ACTIVITIES')}
                </TableCell>
              </TableRow>
              {operatingActivities.map((item, index) => (
                <TableRow 
                  key={index} 
                  className={`border-b border-[#E2E8F0] dark:border-[#232A36] ${item.isHeader ? "bg-[#F8FAFC] dark:bg-[#0E1117]" : ""}`}
                  data-testid={`row-operating-${index}`}
                >
                  <TableCell className={`text-[#0B1F3B] dark:text-white ${item.isHeader ? "font-semibold pl-6" : "pl-10"}`}>
                    {item.description}
                  </TableCell>
                  <TableCell className="text-right">
                    {getAmountDisplay(item.amount, item.isHeader)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-green-100 dark:bg-green-900/40 font-bold border-b border-[#E2E8F0] dark:border-[#232A36]">
                <TableCell className="pl-6 text-[#0B1F3B] dark:text-white">{t('accounting.netCashFromOperating', 'Net Cash from Operating Activities')}</TableCell>
                <TableCell className="text-right font-mono text-green-700 dark:text-green-300">
                  {netOperatingCash.toLocaleString()}
                </TableCell>
              </TableRow>

              <TableRow className="bg-blue-50 dark:bg-blue-900/20 border-b border-[#E2E8F0] dark:border-[#232A36]">
                <TableCell colSpan={2} className="font-bold text-blue-700 dark:text-blue-400">
                  {t('accounting.cashFlowsFromInvesting', 'CASH FLOWS FROM INVESTING ACTIVITIES')}
                </TableCell>
              </TableRow>
              {investingActivities.map((item, index) => (
                <TableRow key={index} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-investing-${index}`}>
                  <TableCell className="pl-10 text-[#0B1F3B] dark:text-white">{item.description}</TableCell>
                  <TableCell className="text-right">
                    {getAmountDisplay(item.amount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-blue-100 dark:bg-blue-900/40 font-bold border-b border-[#E2E8F0] dark:border-[#232A36]">
                <TableCell className="pl-6 text-[#0B1F3B] dark:text-white">{t('accounting.netCashFromInvesting', 'Net Cash from Investing Activities')}</TableCell>
                <TableCell className={`text-right font-mono ${netInvestingCash >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {netInvestingCash >= 0 ? netInvestingCash.toLocaleString() : `(${Math.abs(netInvestingCash).toLocaleString()})`}
                </TableCell>
              </TableRow>

              <TableRow className="bg-purple-50 dark:bg-purple-900/20 border-b border-[#E2E8F0] dark:border-[#232A36]">
                <TableCell colSpan={2} className="font-bold text-purple-700 dark:text-purple-400">
                  {t('accounting.cashFlowsFromFinancing', 'CASH FLOWS FROM FINANCING ACTIVITIES')}
                </TableCell>
              </TableRow>
              {financingActivities.map((item, index) => (
                <TableRow key={index} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-financing-${index}`}>
                  <TableCell className="pl-10 text-[#0B1F3B] dark:text-white">{item.description}</TableCell>
                  <TableCell className="text-right">
                    {getAmountDisplay(item.amount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-purple-100 dark:bg-purple-900/40 font-bold border-b border-[#E2E8F0] dark:border-[#232A36]">
                <TableCell className="pl-6 text-[#0B1F3B] dark:text-white">{t('accounting.netCashFromFinancing', 'Net Cash from Financing Activities')}</TableCell>
                <TableCell className={`text-right font-mono ${netFinancingCash >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {netFinancingCash >= 0 ? netFinancingCash.toLocaleString() : `(${Math.abs(netFinancingCash).toLocaleString()})`}
                </TableCell>
              </TableRow>

              <TableRow className="bg-[#F8FAFC] dark:bg-[#0E1117] font-bold border-b border-[#E2E8F0] dark:border-[#232A36]">
                <TableCell className="text-[#0B1F3B] dark:text-white">{t('accounting.netChangeInCash', 'Net Change in Cash')}</TableCell>
                <TableCell className={`text-right font-mono ${netCashChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {netCashChange >= 0 ? netCashChange.toLocaleString() : `(${Math.abs(netCashChange).toLocaleString()})`}
                </TableCell>
              </TableRow>

              <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                <TableCell className="text-[#0B1F3B] dark:text-white">{t('accounting.beginningCashBalance', 'Beginning Cash Balance')}</TableCell>
                <TableCell className="text-right font-mono text-[#0B1F3B] dark:text-white">
                  {beginningCash.toLocaleString()}
                </TableCell>
              </TableRow>

              <TableRow className="bg-green-100 dark:bg-green-900/40 font-bold text-lg">
                <TableCell className="text-[#0B1F3B] dark:text-white">{t('accounting.endingCashBalance', 'ENDING CASH BALANCE')}</TableCell>
                <TableCell className="text-right font-mono text-green-700 dark:text-green-300">
                  {t('common.sar', 'SAR')} {endingCash.toLocaleString()}
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
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-operating-cash">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              {t('accounting.operatingCashFlow', 'Operating Cash Flow')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {t('common.sar', 'SAR')} {netOperatingCash.toLocaleString()}
            </p>
            <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">{t('accounting.positive', 'Positive')}</Badge>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-investing-cash">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              {t('accounting.investingCashFlow', 'Investing Cash Flow')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netInvestingCash >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {t('common.sar', 'SAR')} {Math.abs(netInvestingCash).toLocaleString()}
            </p>
            <Badge variant={netInvestingCash >= 0 ? "default" : "secondary"} className={netInvestingCash >= 0 ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" : ""}>
              {netInvestingCash >= 0 ? t('accounting.inflow', 'Inflow') : t('accounting.outflow', 'Outflow')}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-financing-cash">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <Wallet className="h-4 w-4 text-purple-600" />
              {t('accounting.financingCashFlow', 'Financing Cash Flow')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netFinancingCash >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {t('common.sar', 'SAR')} {Math.abs(netFinancingCash).toLocaleString()}
            </p>
            <Badge variant={netFinancingCash >= 0 ? "default" : "destructive"} className={netFinancingCash >= 0 ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" : "bg-[#F97316]"}>
              {netFinancingCash >= 0 ? t('accounting.inflow', 'Inflow') : t('accounting.outflow', 'Outflow')}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-ending-cash">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <Banknote className="h-4 w-4 text-green-600" />
              {t('accounting.endingCashBalance', 'Ending Cash Balance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {t('common.sar', 'SAR')} {endingCash.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 text-sm">
              {netCashChange >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600" />
              )}
              <span className={netCashChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                {((netCashChange / beginningCash) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.cashFlowAnalysis', 'Cash Flow Analysis')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('accounting.breakdownOfCashMovements', 'Breakdown of cash movements by category')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <TrendingUp className="h-4 w-4 text-green-600" />
                {t('accounting.operatingActivitiesBreakdown', 'Operating Activities Breakdown')}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#64748B]">{t('accounting.cashGenerated', 'Cash Generated')}</p>
                  <p className="text-lg font-mono font-bold text-green-600 dark:text-green-400">
                    {t('common.sar', 'SAR')} {(141000 + 30500 + 13500 + 3000 + 3000 + 4000).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">{t('accounting.cashUsed', 'Cash Used')}</p>
                  <p className="text-lg font-mono font-bold text-red-600 dark:text-red-400">
                    {t('common.sar', 'SAR')} {(11500 + 7000 + 3000).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <DollarSign className="h-4 w-4 text-blue-600" />
                {t('accounting.freeCashFlow', 'Free Cash Flow')}
              </h4>
              <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                {t('common.sar', 'SAR')} {(netOperatingCash + netInvestingCash).toLocaleString()}
              </p>
              <p className="text-sm text-[#64748B] mt-1">
                {t('accounting.freeCashFlowFormula', 'Operating Cash Flow + Investing Cash Flow')}
              </p>
            </div>

            <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                {t('accounting.cashFlowCoverageRatios', 'Cash Flow Coverage Ratios')}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#64748B]">{t('accounting.operatingCashToDebt', 'Operating Cash to Debt')}</p>
                  <p className="text-lg font-bold text-[#0B1F3B] dark:text-white">
                    {((netOperatingCash / 100000) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">{t('accounting.cashFlowToSales', 'Cash Flow to Sales')}</p>
                  <p className="text-lg font-bold text-[#0B1F3B] dark:text-white">
                    {((netOperatingCash / 530000) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.relatedReports', 'Related Reports')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('accounting.navigateToRelatedStatements', 'Navigate to related financial statements')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/income-statement">
              <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="link-income-statement">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('accounting.incomeStatement', 'Income Statement')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/balance-sheet">
              <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="link-balance-sheet">
                <Scale className="h-4 w-4 mr-2" />
                {t('accounting.balanceSheet', 'Balance Sheet')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/bank-account-management">
              <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="link-bank-accounts">
                <Banknote className="h-4 w-4 mr-2" />
                {t('accounting.bankAccounts', 'Bank Accounts')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/general-ledger">
              <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="link-general-ledger">
                <FileText className="h-4 w-4 mr-2" />
                {t('accounting.generalLedger', 'General Ledger')}
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
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.historicalCashFlow', 'Historical Cash Flow')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('accounting.monthlyCashFlowTrends', 'Monthly cash flow trends over time')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { month: t('accounting.periods.jan2024', 'January 2024'), operating: 173500, investing: 5000, financing: -74000, net: 104500 },
              { month: t('accounting.periods.dec2023', 'December 2023'), operating: 165000, investing: -25000, financing: -24000, net: 116000 },
              { month: t('accounting.periods.nov2023', 'November 2023'), operating: 158000, investing: -15000, financing: -24000, net: 119000 },
              { month: t('accounting.periods.oct2023', 'October 2023'), operating: 162000, investing: -8000, financing: -24000, net: 130000 },
              { month: t('accounting.periods.sep2023', 'September 2023'), operating: 155000, investing: -45000, financing: 0, net: 110000 },
              { month: t('accounting.periods.aug2023', 'August 2023'), operating: 148000, investing: -12000, financing: -24000, net: 112000 },
            ].map((item, index) => (
              <div key={index} className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid={`trend-row-${index}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-[#0B1F3B] dark:text-white">{item.month}</span>
                  <Badge className={item.net > 0 ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" : "bg-[#F97316] text-white"}>
                    {t('accounting.net', 'Net')}: {t('common.sar', 'SAR')} {item.net.toLocaleString()}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[#64748B]">{t('accounting.operating', 'Operating')}</p>
                    <p className="font-mono font-bold text-green-600 dark:text-green-400">
                      {item.operating.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B]">{t('accounting.investing', 'Investing')}</p>
                    <p className={`font-mono font-bold ${item.investing >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {item.investing >= 0 ? item.investing.toLocaleString() : `(${Math.abs(item.investing).toLocaleString()})`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B]">{t('accounting.financing', 'Financing')}</p>
                    <p className={`font-mono font-bold ${item.financing >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {item.financing >= 0 ? item.financing.toLocaleString() : `(${Math.abs(item.financing).toLocaleString()})`}
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
    { id: "statement", label: t('accounting.cashFlowStatement', 'Cash Flow Statement'), icon: Banknote, content: statementTab },
    { id: "analysis", label: t('accounting.analysis', 'Analysis'), icon: BarChart3, content: analysisTab },
    { id: "trends", label: t('accounting.trends', 'Trends'), icon: TrendingUp, content: trendsTab },
  ];

  return (
    <TabsPageLayout
      title={t('accounting.cashFlowStatementTitle', 'Cash Flow Statement')}
      description={t('accounting.cashFlowStatementDescription', 'Track cash inflows and outflows')}
      icon={Banknote}
      tabs={tabs}
      defaultTab="statement"
    />
  );
}
