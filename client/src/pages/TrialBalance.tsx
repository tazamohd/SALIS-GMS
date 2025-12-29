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
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileText,
  BookOpen,
  TrendingUp,
  ExternalLink,
  Printer,
  Calendar,
  BarChart3,
} from "lucide-react";

const trialBalanceData = [
  { code: "1100", name: "Cash", type: "Asset", debit: 155500, credit: 0 },
  { code: "1200", name: "Accounts Receivable", type: "Asset", debit: 89500, credit: 0 },
  { code: "1300", name: "Inventory - Spare Parts", type: "Asset", debit: 125000, credit: 0 },
  { code: "1400", name: "Prepaid Expenses", type: "Asset", debit: 15000, credit: 0 },
  { code: "1500", name: "Fixed Assets - Equipment", type: "Asset", debit: 450000, credit: 0 },
  { code: "1550", name: "Accumulated Depreciation", type: "Asset", debit: 0, credit: 67500 },
  { code: "2100", name: "Accounts Payable", type: "Liability", debit: 0, credit: 78500 },
  { code: "2200", name: "Accrued Expenses", type: "Liability", debit: 0, credit: 25000 },
  { code: "2300", name: "VAT Payable", type: "Liability", debit: 0, credit: 18500 },
  { code: "2400", name: "Short-term Loan", type: "Liability", debit: 0, credit: 100000 },
  { code: "3100", name: "Share Capital", type: "Equity", debit: 0, credit: 300000 },
  { code: "3200", name: "Retained Earnings", type: "Equity", debit: 0, credit: 125000 },
  { code: "4100", name: "Service Revenue", type: "Revenue", debit: 0, credit: 356000 },
  { code: "4200", name: "Parts Sales Revenue", type: "Revenue", debit: 0, credit: 89000 },
  { code: "5100", name: "Cost of Parts Sold", type: "Expense", debit: 78500, credit: 0 },
  { code: "5200", name: "Salaries & Wages", type: "Expense", debit: 145000, credit: 0 },
  { code: "5300", name: "Rent Expense", type: "Expense", debit: 36000, credit: 0 },
  { code: "5400", name: "Utilities Expense", type: "Expense", debit: 28500, credit: 0 },
  { code: "5500", name: "Depreciation Expense", type: "Expense", debit: 22500, credit: 0 },
  { code: "5600", name: "Insurance Expense", type: "Expense", debit: 14000, credit: 0 },
];

export default function TrialBalance() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("2024-01");
  const [showAdjusted, setShowAdjusted] = useState(false);

  const totalDebit = trialBalanceData.reduce((sum, acc) => sum + acc.debit, 0);
  const totalCredit = trialBalanceData.reduce((sum, acc) => sum + acc.credit, 0);
  const isBalanced = totalDebit === totalCredit;
  const difference = Math.abs(totalDebit - totalCredit);

  const getTypeTotals = (type: string) => {
    const accounts = trialBalanceData.filter((acc) => acc.type === type);
    return {
      debit: accounts.reduce((sum, acc) => sum + acc.debit, 0),
      credit: accounts.reduce((sum, acc) => sum + acc.credit, 0),
      count: accounts.length,
    };
  };

  const getAccountTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      Asset: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      Liability: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      Equity: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      Revenue: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      Expense: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
    };
    return colors[type] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  };

  const trialBalanceTab = (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]" data-testid="select-period">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01">January 2024</SelectItem>
              <SelectItem value="2024-02">February 2024</SelectItem>
              <SelectItem value="2024-03">March 2024</SelectItem>
              <SelectItem value="2023-12">December 2023</SelectItem>
              <SelectItem value="2023-q4">Q4 2023</SelectItem>
              <SelectItem value="2023">Year 2023</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={showAdjusted ? "default" : "outline"}
            onClick={() => setShowAdjusted(!showAdjusted)}
            data-testid="button-toggle-adjusted"
          >
            {showAdjusted ? "Adjusted" : "Unadjusted"}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('common.refresh', 'Refresh')}
          </Button>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-total-debits">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('accounting.totalDebits', 'Total Debits')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600" data-testid="text-total-debits">
              SAR {totalDebit.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-credits">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('accounting.totalCredits', 'Total Credits')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600" data-testid="text-total-credits">
              SAR {totalCredit.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-balance-status">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('accounting.balanceStatus', 'Balance Status')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-lg font-bold text-green-600">{t('accounting.balanced', 'Balanced')}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <span className="text-lg font-bold text-red-600">
                    {t('accounting.difference', 'Difference')}: SAR {difference.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('accounting.trialBalanceReport', 'Trial Balance Report')}</CardTitle>
              <CardDescription>
                {t('accounting.asOf', 'As of')} {period === "2024-01" ? "January 31, 2024" : period}
              </CardDescription>
            </div>
            <Badge variant={isBalanced ? "default" : "destructive"} className="text-sm">
              {isBalanced ? t('accounting.balanced', '✓ Balanced') : t('accounting.unbalanced', '⚠ Unbalanced')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>{t('accounting.accountCode', 'Account Code')}</TableHead>
                <TableHead>{t('accounting.accountName', 'Account Name')}</TableHead>
                <TableHead>{t('common.type', 'Type')}</TableHead>
                <TableHead className="text-right">{t('accounting.debitSAR', 'Debit (SAR)')}</TableHead>
                <TableHead className="text-right">{t('accounting.creditSAR', 'Credit (SAR)')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trialBalanceData.map((account) => (
                <TableRow key={account.code} data-testid={`row-account-${account.code}`}>
                  <TableCell className="font-mono">{account.code}</TableCell>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <Badge className={getAccountTypeBadge(account.type)}>
                      {account.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {account.debit > 0 ? account.debit.toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {account.credit > 0 ? account.credit.toLocaleString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell colSpan={3} className="text-right">
                  {t('accounting.totals', 'TOTALS')}
                </TableCell>
                <TableCell className="text-right font-mono text-green-600">
                  {totalDebit.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-red-600">
                  {totalCredit.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const summaryTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {["Asset", "Liability", "Equity", "Revenue", "Expense"].map((type) => {
          const totals = getTypeTotals(type);
          const netBalance = totals.debit - totals.credit;
          return (
            <Card key={type} data-testid={`card-summary-${type.toLowerCase()}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Badge className={getAccountTypeBadge(type)}>{type}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('accounting.debit', 'Debit')}:</span>
                    <span className="font-mono text-green-600">
                      {totals.debit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('accounting.credit', 'Credit')}:</span>
                    <span className="font-mono text-red-600">
                      {totals.credit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t">
                    <span>{t('accounting.net', 'Net')}:</span>
                    <span className={`font-mono ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {Math.abs(netBalance).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    {totals.count} {t('accounting.accounts', 'accounts')}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('accounting.balanceVerification', 'Balance Verification')}</CardTitle>
          <CardDescription>{t('accounting.accountingEquationVerification', 'Accounting equation verification')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-center text-lg font-medium mb-4">
                {t('accounting.assetsEquation', 'Assets = Liabilities + Equity')}
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">{t('accounting.totalAssets', 'Total Assets')}</p>
                  <p className="text-xl font-bold text-blue-600">
                    SAR {(getTypeTotals("Asset").debit - getTypeTotals("Asset").credit).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-2xl">=</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('accounting.liabilitiesPlusEquity', 'Liabilities + Equity')}</p>
                  <p className="text-xl font-bold text-purple-600">
                    SAR {(getTypeTotals("Liability").credit + getTypeTotals("Equity").credit).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-center text-lg font-medium mb-4">
                {t('accounting.netIncomeEquation', 'Revenue - Expenses = Net Income')}
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">{t('accounting.totalRevenue', 'Total Revenue')}</p>
                  <p className="text-xl font-bold text-green-600">
                    SAR {getTypeTotals("Revenue").credit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('accounting.totalExpenses', 'Total Expenses')}</p>
                  <p className="text-xl font-bold text-red-600">
                    SAR {getTypeTotals("Expense").debit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('accounting.netIncome', 'Net Income')}</p>
                  <p className="text-xl font-bold text-blue-600">
                    SAR {(getTypeTotals("Revenue").credit - getTypeTotals("Expense").debit).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('accounting.relatedReports', 'Related Reports')}</CardTitle>
          <CardDescription>{t('accounting.relatedReportsDescription', 'Navigate to related financial statements')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/general-ledger">
              <Button variant="outline" className="w-full justify-start" data-testid="link-general-ledger">
                <BookOpen className="h-4 w-4 mr-2" />
                {t('nav.general_ledger', 'General Ledger')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/income-statement">
              <Button variant="outline" className="w-full justify-start" data-testid="link-income-statement">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('nav.income_statement', 'Income Statement')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/balance-sheet">
              <Button variant="outline" className="w-full justify-start" data-testid="link-balance-sheet">
                <Scale className="h-4 w-4 mr-2" />
                {t('nav.balance_sheet', 'Balance Sheet')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/journal-entries">
              <Button variant="outline" className="w-full justify-start" data-testid="link-journal-entries">
                <FileText className="h-4 w-4 mr-2" />
                {t('nav.journal_entries', 'Journal Entries')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const historyTab = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t('accounting.historicalTrialBalances', 'Historical Trial Balances')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('accounting.historicalTrialBalancesDescription', 'View and compare previous period trial balances')}
          </p>
        </div>
        <Select defaultValue="2024">
          <SelectTrigger className="w-[150px]" data-testid="select-year">
            <SelectValue placeholder={t('common.year', 'Year')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2022">2022</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { period: "January 2024", date: "2024-01-31", status: "Balanced", debit: 1159500, credit: 1159500 },
          { period: "December 2023", date: "2023-12-31", status: "Balanced", debit: 1145000, credit: 1145000 },
          { period: "November 2023", date: "2023-11-30", status: "Balanced", debit: 1098500, credit: 1098500 },
          { period: "October 2023", date: "2023-10-31", status: "Balanced", debit: 1056000, credit: 1056000 },
          { period: "September 2023", date: "2023-09-30", status: "Balanced", debit: 1023500, credit: 1023500 },
          { period: "August 2023", date: "2023-08-31", status: "Balanced", debit: 989000, credit: 989000 },
        ].map((item, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" data-testid={`card-history-${index}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.period}</CardTitle>
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {item.status}
                </Badge>
              </div>
              <CardDescription>{item.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('accounting.totalDebit', 'Total Debit')}:</span>
                  <span className="font-mono text-green-600">{item.debit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('accounting.totalCredit', 'Total Credit')}:</span>
                  <span className="font-mono text-red-600">{item.credit.toLocaleString()}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" data-testid={`button-view-history-${index}`}>
                <Eye className="h-4 w-4 mr-2" />
                {t('common.viewDetails', 'View Details')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: "trial-balance", label: t('accounting.trialBalance.tabs.trialBalance', 'Trial Balance'), icon: Scale, content: trialBalanceTab },
    { id: "summary", label: t('accounting.trialBalance.tabs.summary', 'Summary'), icon: BarChart3, content: summaryTab },
    { id: "history", label: t('accounting.trialBalance.tabs.history', 'History'), icon: Calendar, content: historyTab },
  ];

  return (
    <TabsPageLayout
      title={t('accounting.trialBalance.title', 'Trial Balance - ميزان المراجعة')}
      description={t('accounting.trialBalance.description', 'Verify debits equal credits across all accounts')}
      icon={Scale}
      tabs={tabs}
      defaultTab="trial-balance"
    />
  );
}

function Eye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
