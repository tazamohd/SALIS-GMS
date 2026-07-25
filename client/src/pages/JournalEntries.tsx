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
  FileText,
  Plus,
  Search,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Trash2,
  Copy,
  Eye,
  BookOpen,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const journalEntrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  reference: z.string().optional(),
  debitAccount: z.string().min(1, "Debit account is required"),
  creditAccount: z.string().min(1, "Credit account is required"),
  amount: z.string().min(1, "Amount is required"),
  notes: z.string().optional(),
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

const journalEntries = [
  {
    id: "JE-2024-0125",
    date: "2024-01-25",
    description: "Customer payment received - Invoice #INV-2024-0089",
    reference: "PAY-2024-0089",
    lines: [
      { account: "1100 - Cash", debit: 15000, credit: 0 },
      { account: "1200 - Accounts Receivable", debit: 0, credit: 15000 },
    ],
    totalDebit: 15000,
    totalCredit: 15000,
    status: "Posted",
    createdBy: "Ahmed Al-Salem",
    createdAt: "2024-01-25 09:30",
  },
  {
    id: "JE-2024-0124",
    date: "2024-01-24",
    description: "Service revenue - Engine repair Job Card #JC-2024-0156",
    reference: "INV-2024-0092",
    lines: [
      { account: "1200 - Accounts Receivable", debit: 8500, credit: 0 },
      { account: "4100 - Service Revenue", debit: 0, credit: 8500 },
    ],
    totalDebit: 8500,
    totalCredit: 8500,
    status: "Posted",
    createdBy: "Fatima Al-Hassan",
    createdAt: "2024-01-24 14:15",
  },
  {
    id: "JE-2024-0123",
    date: "2024-01-23",
    description: "Spare parts purchase from AutoParts Co",
    reference: "PO-2024-0078",
    lines: [
      { account: "5100 - Parts Cost", debit: 12500, credit: 0 },
      { account: "2100 - Accounts Payable", debit: 0, credit: 12500 },
    ],
    totalDebit: 12500,
    totalCredit: 12500,
    status: "Posted",
    createdBy: "Khalid Al-Rashid",
    createdAt: "2024-01-23 11:00",
  },
  {
    id: "JE-2024-0122",
    date: "2024-01-22",
    description: "Monthly electricity bill payment",
    reference: "UTIL-2024-01",
    lines: [
      { account: "5200 - Utilities Expense", debit: 4500, credit: 0 },
      { account: "1100 - Cash", debit: 0, credit: 4500 },
    ],
    totalDebit: 4500,
    totalCredit: 4500,
    status: "Posted",
    createdBy: "Sara Al-Mahmoud",
    createdAt: "2024-01-22 10:30",
  },
  {
    id: "JE-2024-0121",
    date: "2024-01-21",
    description: "Employee salary payment - January 2024",
    reference: "PAY-SAL-2024-01",
    lines: [
      { account: "5300 - Salaries Expense", debit: 45000, credit: 0 },
      { account: "1100 - Cash", debit: 0, credit: 45000 },
    ],
    totalDebit: 45000,
    totalCredit: 45000,
    status: "Posted",
    createdBy: "HR Admin",
    createdAt: "2024-01-21 16:00",
  },
  {
    id: "JE-2024-0120",
    date: "2024-01-20",
    description: "Equipment depreciation - Monthly",
    reference: "DEP-2024-01",
    lines: [
      { account: "5400 - Depreciation Expense", debit: 3500, credit: 0 },
      { account: "1550 - Accumulated Depreciation", debit: 0, credit: 3500 },
    ],
    totalDebit: 3500,
    totalCredit: 3500,
    status: "Pending",
    createdBy: "System",
    createdAt: "2024-01-20 00:00",
  },
];

const accounts = [
  { code: "1100", name: "Cash", type: "Asset" },
  { code: "1200", name: "Accounts Receivable", type: "Asset" },
  { code: "1300", name: "Inventory", type: "Asset" },
  { code: "1500", name: "Fixed Assets", type: "Asset" },
  { code: "1550", name: "Accumulated Depreciation", type: "Asset" },
  { code: "2100", name: "Accounts Payable", type: "Liability" },
  { code: "2200", name: "Accrued Expenses", type: "Liability" },
  { code: "3100", name: "Share Capital", type: "Equity" },
  { code: "3200", name: "Retained Earnings", type: "Equity" },
  { code: "4100", name: "Service Revenue", type: "Revenue" },
  { code: "4200", name: "Parts Sales", type: "Revenue" },
  { code: "5100", name: "Parts Cost", type: "Expense" },
  { code: "5200", name: "Utilities Expense", type: "Expense" },
  { code: "5300", name: "Salaries Expense", type: "Expense" },
  { code: "5400", name: "Depreciation Expense", type: "Expense" },
];

export default function JournalEntries() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      description: "",
      reference: "",
      debitAccount: "",
      creditAccount: "",
      amount: "",
      notes: "",
    },
  });

  const onSubmit = (data: JournalEntryFormData) => {
    console.log("New journal entry:", data);
    setIsDialogOpen(false);
    form.reset();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { icon: typeof CheckCircle; className: string }> = {
      Posted: { icon: CheckCircle, className: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" },
      Pending: { icon: Clock, className: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200" },
      Rejected: { icon: XCircle, className: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" },
      Draft: { icon: Edit, className: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200" },
    };
    const style = styles[status] || styles.Draft;
    const Icon = style.icon;
    return (
      <Badge className={style.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const totalPosted = journalEntries.filter((e) => e.status === "Posted").length;
  const totalPending = journalEntries.filter((e) => e.status === "Pending").length;
  const totalAmount = journalEntries.reduce((sum, e) => sum + e.totalDebit, 0);

  const entriesTab = (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('accounting.searchEntries', 'Search entries...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-entries"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export-entries">
            <Download className="h-4 w-4 mr-2" />
            {t('common.export', 'Export')}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-entry">
                <Plus className="h-4 w-4 mr-2" />
                {t('accounting.newEntry', 'New Entry')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('accounting.createJournalEntry', 'Create Journal Entry')}</DialogTitle>
                <DialogDescription>
                  {t('accounting.createJournalEntryDescription', 'Record a new journal entry with debit and credit accounts')}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common.date', 'Date')}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-entry-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="reference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('accounting.reference', 'Reference')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('accounting.referencePlaceholder', 'e.g., INV-2024-001')} {...field} data-testid="input-entry-reference" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common.description', 'Description')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('accounting.transactionDescriptionPlaceholder', 'Description of the transaction')} {...field} data-testid="input-entry-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="debitAccount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('accounting.debitAccount', 'Debit Account')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-debit-account">
                                <SelectValue placeholder={t('accounting.selectAccount', 'Select account')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accounts.map((acc) => (
                                <SelectItem key={acc.code} value={`${acc.code} - ${acc.name}`}>
                                  {acc.code} - {acc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="creditAccount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('accounting.creditAccount', 'Credit Account')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-credit-account">
                                <SelectValue placeholder={t('accounting.selectAccount', 'Select account')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accounts.map((acc) => (
                                <SelectItem key={acc.code} value={`${acc.code} - ${acc.name}`}>
                                  {acc.code} - {acc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('accounting.amountSAR', 'Amount (SAR)')}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} data-testid="input-entry-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('accounting.notesOptional', 'Notes (Optional)')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('accounting.additionalNotesPlaceholder', 'Additional notes...')} {...field} data-testid="input-entry-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel-entry">
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button type="submit" data-testid="button-save-entry">
                      {t('accounting.createEntry', 'Create Entry')}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('accounting.entryId', 'Entry ID')}</TableHead>
                <TableHead>{t('common.date', 'Date')}</TableHead>
                <TableHead>{t('common.description', 'Description')}</TableHead>
                <TableHead>{t('accounting.reference', 'Reference')}</TableHead>
                <TableHead className="text-right">{t('accounting.debit', 'Debit')}</TableHead>
                <TableHead className="text-right">{t('accounting.credit', 'Credit')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
                <TableHead>{t('common.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {journalEntries.map((entry) => (
                <TableRow key={entry.id} data-testid={`row-entry-${entry.id}`}>
                  <TableCell className="font-mono font-medium">{entry.id}</TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell className="max-w-[250px] truncate">{entry.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.reference}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-green-600">
                    {entry.totalDebit.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-red-600">
                    {entry.totalCredit.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" data-testid={`button-view-${entry.id}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-copy-${entry.id}`}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const summaryTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-total-entries" className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">
              {t('accounting.totalEntries', 'Total Entries')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{journalEntries.length}</p>
            <p className="text-xs text-[#64748B]">{t('accounting.thisMonth', 'This month')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-posted-entries" className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {t('accounting.posted', 'Posted')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{totalPosted}</p>
            <p className="text-xs text-[#64748B]">{t('accounting.completedEntries', 'Completed entries')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-entries" className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#F97316]" />
              {t('common.pending', 'Pending')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#F97316]">{totalPending}</p>
            <p className="text-xs text-[#64748B]">{t('accounting.awaitingApproval', 'Awaiting approval')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-amount" className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">
              {t('accounting.totalAmount', 'Total Amount')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">SAR {totalAmount.toLocaleString()}</p>
            <p className="text-xs text-[#64748B]">{t('accounting.totalTransactions', 'Total transactions')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.recentActivity', 'Recent Activity')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('accounting.recentActivityDescription', 'Latest journal entries and their status')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {journalEntries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                data-testid={`activity-${entry.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-lg">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#0B1F3B] dark:text-white">{entry.id}</p>
                    <p className="text-sm text-[#64748B] truncate max-w-[300px]">
                      {entry.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-mono font-bold text-[#0B1F3B] dark:text-white">SAR {entry.totalDebit.toLocaleString()}</p>
                    <p className="text-xs text-[#64748B]">{entry.createdAt}</p>
                  </div>
                  {getStatusBadge(entry.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.relatedModules', 'Related Modules')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('accounting.relatedModulesDescription', 'Navigate to related accounting pages')}</CardDescription>
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
            <Link href="/chart-of-accounts">
              <Button variant="outline" className="w-full justify-start" data-testid="link-chart-of-accounts">
                <FileText className="h-4 w-4 mr-2" />
                {t('nav.chart_of_accounts', 'Chart of Accounts')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/trial-balance">
              <Button variant="outline" className="w-full justify-start" data-testid="link-trial-balance">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                {t('nav.trial_balance', 'Trial Balance')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/income-statement">
              <Button variant="outline" className="w-full justify-start" data-testid="link-income-statement">
                <ArrowDownRight className="h-4 w-4 mr-2" />
                {t('nav.income_statement', 'Income Statement')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const templatesTab = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t('accounting.entryTemplates', 'Entry Templates')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('accounting.entryTemplatesDescription', 'Pre-configured templates for common transactions')}
          </p>
        </div>
        <Button data-testid="button-create-template">
          <Plus className="h-4 w-4 mr-2" />
          {t('accounting.createTemplate', 'Create Template')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            name: "Customer Payment",
            description: "Record payment received from customer",
            debit: "Cash",
            credit: "Accounts Receivable",
          },
          {
            name: "Supplier Payment",
            description: "Record payment made to supplier",
            debit: "Accounts Payable",
            credit: "Cash",
          },
          {
            name: "Service Revenue",
            description: "Record service income earned",
            debit: "Accounts Receivable",
            credit: "Service Revenue",
          },
          {
            name: "Parts Purchase",
            description: "Record spare parts inventory purchase",
            debit: "Inventory",
            credit: "Accounts Payable",
          },
          {
            name: "Salary Payment",
            description: "Record monthly salary disbursement",
            debit: "Salaries Expense",
            credit: "Cash",
          },
          {
            name: "Depreciation Entry",
            description: "Record monthly asset depreciation",
            debit: "Depreciation Expense",
            credit: "Accumulated Depreciation",
          },
        ].map((template, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`card-template-${index}`}>
            <CardHeader>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('accounting.debit', 'Debit')}:</span>
                  <Badge variant="outline" className="text-green-600">{template.debit}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('accounting.credit', 'Credit')}:</span>
                  <Badge variant="outline" className="text-red-600">{template.credit}</Badge>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline" data-testid={`button-use-template-${index}`}>
                {t('accounting.useTemplate', 'Use Template')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: "entries", label: t('accounting.journalEntries.tabs.entries', 'Journal Entries'), icon: FileText, content: entriesTab },
    { id: "summary", label: t('accounting.journalEntries.tabs.summary', 'Summary'), icon: Calendar, content: summaryTab },
    { id: "templates", label: t('accounting.journalEntries.tabs.templates', 'Templates'), icon: Copy, content: templatesTab },
  ];

  return (
    <TabsPageLayout
      title={t('accounting.journalEntries.title', 'Journal Entries')}
      description={t('accounting.journalEntries.description', 'Record and manage daily accounting transactions')}
      icon={FileText}
      tabs={tabs}
      defaultTab="entries"
    />
  );
}
