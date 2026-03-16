import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  BookOpen,
  Search,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Layers,
} from "lucide-react";

// Data is fetched from /api/financial/general-ledger and /api/financial/trial-balance

export default function GeneralLedger() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [dateRange, setDateRange] = useState("this-month");

  // Fetch real GL data from API
  const { data: glData } = useQuery({
    queryKey: ["/api/financial/general-ledger"],
    queryFn: async () => {
      const res = await fetch("/api/financial/general-ledger", { credentials: "include" });
      if (!res.ok) return { entries: [], summary: { totalDebits: 0, totalCredits: 0, isBalanced: true, entryCount: 0 } };
      return res.json();
    },
  });

  const { data: tbData } = useQuery({
    queryKey: ["/api/financial/trial-balance"],
    queryFn: async () => {
      const res = await fetch("/api/financial/trial-balance", { credentials: "include" });
      if (!res.ok) return { accounts: [] };
      return res.json();
    },
  });

  const ledgerEntries = (glData?.entries || []).map((e: any) => ({
    id: e.id,
    date: e.date ? new Date(e.date).toISOString().split("T")[0] : "",
    journalRef: e.reference || "",
    account: e.account || "",
    accountType: e.category || "Asset",
    description: e.description || "",
    debit: e.debit || 0,
    credit: e.credit || 0,
    balance: 0,
    postedBy: "",
  }));

  const accountSummaries = (tbData?.accounts || []).map((a: any) => ({
    code: a.code,
    name: a.name,
    type: a.type,
    debitTotal: a.debit || 0,
    creditTotal: a.credit || 0,
    balance: Math.abs((a.debit || 0) - (a.credit || 0)),
  }));

  const totalDebits = glData?.summary?.totalDebits ?? ledgerEntries.reduce((sum: number, entry: any) => sum + entry.debit, 0);
  const totalCredits = glData?.summary?.totalCredits ?? ledgerEntries.reduce((sum: number, entry: any) => sum + entry.credit, 0);

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

  const overviewTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-total-debits" className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              {t('accounting.totalDebits', 'Total Debits')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600" data-testid="text-total-debits">
              SAR {totalDebits.toLocaleString()}
            </p>
            <p className="text-xs text-[#64748B] mt-1">{t('accounting.thisPeriod', 'This period')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-credits" className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
              {t('accounting.totalCredits', 'Total Credits')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600" data-testid="text-total-credits">
              SAR {totalCredits.toLocaleString()}
            </p>
            <p className="text-xs text-[#64748B] mt-1">{t('accounting.thisPeriod', 'This period')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-balance-check" className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('accounting.balanceCheck', 'Balance Check')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              variant={totalDebits === totalCredits ? "default" : "destructive"}
              className={totalDebits === totalCredits ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white text-sm" : "text-sm"}
              data-testid="badge-balance-status"
            >
              {totalDebits === totalCredits ? t('accounting.balanced', '✓ Balanced') : t('accounting.unbalanced', '⚠ Unbalanced')}
            </Badge>
            <p className="text-xs text-[#64748B] mt-2">
              {t('accounting.difference', 'Difference')}: SAR {Math.abs(totalDebits - totalCredits).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-entries-count" className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <Layers className="h-4 w-4" />
              {t('accounting.totalEntries', 'Total Entries')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-entries-count">
              {ledgerEntries.length}
            </p>
            <p className="text-xs text-[#64748B] mt-1">{t('accounting.journalEntriesPosted', 'Journal entries posted')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.accountSummaries', 'Account Summaries')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('accounting.accountSummariesDescription', 'Overview of all accounts with balances')}</CardDescription>
            </div>
            <Button variant="outline" size="sm" data-testid="button-export-summary">
              <Download className="h-4 w-4 mr-2" />
              {t('common.export', 'Export')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('accounting.accountCode', 'Account Code')}</TableHead>
                <TableHead>{t('accounting.accountName', 'Account Name')}</TableHead>
                <TableHead>{t('common.type', 'Type')}</TableHead>
                <TableHead className="text-right">{t('accounting.totalDebits', 'Total Debits')}</TableHead>
                <TableHead className="text-right">{t('accounting.totalCredits', 'Total Credits')}</TableHead>
                <TableHead className="text-right">{t('accounting.balance', 'Balance')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountSummaries.map((account) => (
                <TableRow key={account.code} data-testid={`row-account-${account.code}`}>
                  <TableCell className="font-mono">{account.code}</TableCell>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <Badge className={getAccountTypeBadge(account.type)}>
                      {account.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {account.debitTotal.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {account.creditTotal.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {account.balance.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.relatedModules', 'Related Modules')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('accounting.relatedModulesDescription', 'Navigate to related financial pages')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/journal-entries">
              <Button variant="outline" className="w-full justify-start" data-testid="link-journal-entries">
                <FileText className="h-4 w-4 mr-2" />
                {t('nav.journal_entries', 'Journal Entries')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/trial-balance">
              <Button variant="outline" className="w-full justify-start" data-testid="link-trial-balance">
                <BarChart3 className="h-4 w-4 mr-2" />
                {t('nav.trial_balance', 'Trial Balance')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/chart-of-accounts">
              <Button variant="outline" className="w-full justify-start" data-testid="link-chart-of-accounts">
                <BookOpen className="h-4 w-4 mr-2" />
                {t('nav.chart_of_accounts', 'Chart of Accounts')}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const transactionsTab = (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('accounting.searchTransactions', 'Search transactions...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
            data-testid="input-search-transactions"
          />
        </div>
        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger className="w-[200px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-account-filter">
            <SelectValue placeholder={t('accounting.allAccounts', 'All Accounts')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('accounting.allAccounts', 'All Accounts')}</SelectItem>
            <SelectItem value="asset">{t('accounting.assets', 'Assets')}</SelectItem>
            <SelectItem value="liability">{t('accounting.liabilities', 'Liabilities')}</SelectItem>
            <SelectItem value="equity">{t('accounting.equityType', 'Equity')}</SelectItem>
            <SelectItem value="revenue">{t('accounting.revenueType', 'Revenue')}</SelectItem>
            <SelectItem value="expense">{t('accounting.expenses', 'Expenses')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-date-range">
            <SelectValue placeholder={t('common.dateRange', 'Date Range')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">{t('common.today', 'Today')}</SelectItem>
            <SelectItem value="this-week">{t('common.thisWeek', 'This Week')}</SelectItem>
            <SelectItem value="this-month">{t('common.thisMonth', 'This Month')}</SelectItem>
            <SelectItem value="this-quarter">{t('common.thisQuarter', 'This Quarter')}</SelectItem>
            <SelectItem value="this-year">{t('common.thisYear', 'This Year')}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" data-testid="button-refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.date', 'Date')}</TableHead>
                <TableHead>{t('accounting.reference', 'Reference')}</TableHead>
                <TableHead>{t('accounting.account', 'Account')}</TableHead>
                <TableHead>{t('common.description', 'Description')}</TableHead>
                <TableHead className="text-right">{t('accounting.debit', 'Debit')}</TableHead>
                <TableHead className="text-right">{t('accounting.credit', 'Credit')}</TableHead>
                <TableHead className="text-right">{t('accounting.balance', 'Balance')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgerEntries.map((entry) => (
                <TableRow key={entry.id} data-testid={`row-ledger-${entry.id}`}>
                  <TableCell className="font-mono text-sm">{entry.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {entry.journalRef}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{entry.account}</p>
                      <Badge className={`text-xs ${getAccountTypeBadge(entry.accountType)}`}>
                        {entry.accountType}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {entry.description}
                  </TableCell>
                  <TableCell className="text-right font-mono text-green-600">
                    {entry.debit > 0 ? entry.debit.toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-red-600">
                    {entry.credit > 0 ? entry.credit.toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {entry.balance.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
        <span className="font-medium">{t('accounting.periodTotals', 'Period Totals')}:</span>
        <div className="flex gap-8">
          <span className="text-green-600 font-bold">
            {t('accounting.debits', 'Debits')}: SAR {totalDebits.toLocaleString()}
          </span>
          <span className="text-red-600 font-bold">
            {t('accounting.credits', 'Credits')}: SAR {totalCredits.toLocaleString()}
          </span>
          <Badge variant={totalDebits === totalCredits ? "default" : "destructive"}>
            {totalDebits === totalCredits ? t('accounting.balancedCheck', 'Balanced ✓') : t('accounting.unbalancedCheck', 'Unbalanced ⚠')}
          </Badge>
        </div>
      </div>
    </div>
  );

  const accountsTab = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('accounting.searchAccounts', 'Search accounts...')}
            className="pl-10"
            data-testid="input-search-accounts"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-filter-accounts">
            <Filter className="h-4 w-4 mr-2" />
            {t('common.filter', 'Filter')}
          </Button>
          <Button variant="outline" data-testid="button-export-accounts">
            <Download className="h-4 w-4 mr-2" />
            {t('common.export', 'Export')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {["Asset", "Liability", "Equity", "Revenue", "Expense"].map((type) => {
          const typeAccounts = accountSummaries.filter((a) => a.type === type);
          const typeTotal = typeAccounts.reduce((sum, a) => sum + a.balance, 0);

          return (
            <Card key={type} data-testid={`card-type-${type.toLowerCase()}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge className={getAccountTypeBadge(type)}>{type}</Badge>
                  <span className="text-muted-foreground text-sm">
                    ({typeAccounts.length} accounts)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {typeAccounts.map((account) => (
                    <div
                      key={account.code}
                      className="flex justify-between items-center py-1 border-b last:border-0"
                    >
                      <span className="text-sm">
                        {account.code} - {account.name}
                      </span>
                      <span className="font-mono text-sm font-medium">
                        {account.balance.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-bold">
                    <span>{t('common.total', 'Total')}</span>
                    <span className="font-mono">SAR {typeTotal.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const reportsTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-report-detailed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <FileText className="h-5 w-5" />
              {t('accounting.detailedLedgerReport', 'Detailed Ledger Report')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">
              {t('accounting.detailedLedgerReportDescription', 'Complete transaction history by account')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" data-testid="button-generate-detailed">
              {t('common.generateReport', 'Generate Report')}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-report-summary">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <BarChart3 className="h-5 w-5" />
              {t('accounting.summaryReport', 'Summary Report')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">
              {t('accounting.summaryReportDescription', 'Account balances and totals overview')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" data-testid="button-generate-summary">
              {t('common.generateReport', 'Generate Report')}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-report-audit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Calendar className="h-5 w-5" />
              {t('accounting.auditTrailReport', 'Audit Trail Report')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">
              {t('accounting.auditTrailReportDescription', 'Track all changes and modifications')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" data-testid="button-generate-audit">
              {t('common.generateReport', 'Generate Report')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.reportSettings', 'Report Settings')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('accounting.reportSettingsDescription', 'Configure report parameters')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('common.dateRange', 'Date Range')}</label>
              <Select defaultValue="this-month">
                <SelectTrigger data-testid="select-report-date-range" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">{t('common.thisMonth', 'This Month')}</SelectItem>
                  <SelectItem value="last-month">{t('common.lastMonth', 'Last Month')}</SelectItem>
                  <SelectItem value="this-quarter">{t('common.thisQuarter', 'This Quarter')}</SelectItem>
                  <SelectItem value="this-year">{t('common.thisYear', 'This Year')}</SelectItem>
                  <SelectItem value="custom">{t('common.customRange', 'Custom Range')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('accounting.accountType', 'Account Type')}</label>
              <Select defaultValue="all">
                <SelectTrigger data-testid="select-report-account-type" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('accounting.allTypes', 'All Types')}</SelectItem>
                  <SelectItem value="asset">{t('accounting.assets', 'Assets')}</SelectItem>
                  <SelectItem value="liability">{t('accounting.liabilities', 'Liabilities')}</SelectItem>
                  <SelectItem value="equity">{t('accounting.equityType', 'Equity')}</SelectItem>
                  <SelectItem value="revenue">{t('accounting.revenueType', 'Revenue')}</SelectItem>
                  <SelectItem value="expense">{t('accounting.expenses', 'Expenses')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('common.format', 'Format')}</label>
              <Select defaultValue="pdf">
                <SelectTrigger data-testid="select-report-format" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { id: "overview", label: t('accounting.generalLedger.tabs.overview', 'Overview'), icon: BookOpen, content: overviewTab },
    { id: "transactions", label: t('accounting.generalLedger.tabs.transactions', 'Transactions'), icon: Layers, content: transactionsTab },
    { id: "accounts", label: t('accounting.generalLedger.tabs.accounts', 'Accounts'), icon: DollarSign, content: accountsTab },
    { id: "reports", label: t('accounting.generalLedger.tabs.reports', 'Reports'), icon: FileText, content: reportsTab },
  ];

  return (
    <TabsPageLayout
      title={t('accounting.generalLedger.title', 'General Ledger')}
      description={t('accounting.generalLedger.description', 'Complete record of all financial transactions')}
      icon={BookOpen}
      tabs={tabs}
      defaultTab="overview"
    />
  );
}
