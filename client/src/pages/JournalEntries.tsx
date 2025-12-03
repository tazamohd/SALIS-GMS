import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
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
              placeholder="Search entries..."
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
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-entry">
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Journal Entry</DialogTitle>
                <DialogDescription>
                  Record a new journal entry with debit and credit accounts
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
                          <FormLabel>Date</FormLabel>
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
                          <FormLabel>Reference</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., INV-2024-001" {...field} data-testid="input-entry-reference" />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Description of the transaction" {...field} data-testid="input-entry-description" />
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
                          <FormLabel>Debit Account</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-debit-account">
                                <SelectValue placeholder="Select account" />
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
                          <FormLabel>Credit Account</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-credit-account">
                                <SelectValue placeholder="Select account" />
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
                        <FormLabel>Amount (SAR)</FormLabel>
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
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes..." {...field} data-testid="input-entry-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel-entry">
                      Cancel
                    </Button>
                    <Button type="submit" data-testid="button-save-entry">
                      Create Entry
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
                <TableHead>Entry ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
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
        <Card data-testid="card-total-entries">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{journalEntries.length}</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card data-testid="card-posted-entries">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Posted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{totalPosted}</p>
            <p className="text-xs text-muted-foreground">Completed entries</p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-entries">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{totalPending}</p>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-amount">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">SAR {totalAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest journal entries and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {journalEntries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 border rounded-lg"
                data-testid={`activity-${entry.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{entry.id}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                      {entry.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-mono font-bold">SAR {entry.totalDebit.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{entry.createdAt}</p>
                  </div>
                  {getStatusBadge(entry.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Modules</CardTitle>
          <CardDescription>Navigate to related accounting pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/general-ledger">
              <Button variant="outline" className="w-full justify-start" data-testid="link-general-ledger">
                <BookOpen className="h-4 w-4 mr-2" />
                General Ledger
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/chart-of-accounts">
              <Button variant="outline" className="w-full justify-start" data-testid="link-chart-of-accounts">
                <FileText className="h-4 w-4 mr-2" />
                Chart of Accounts
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/trial-balance">
              <Button variant="outline" className="w-full justify-start" data-testid="link-trial-balance">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Trial Balance
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/income-statement">
              <Button variant="outline" className="w-full justify-start" data-testid="link-income-statement">
                <ArrowDownRight className="h-4 w-4 mr-2" />
                Income Statement
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
          <h3 className="text-lg font-semibold">Entry Templates</h3>
          <p className="text-sm text-muted-foreground">
            Pre-configured templates for common transactions
          </p>
        </div>
        <Button data-testid="button-create-template">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
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
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" data-testid={`card-template-${index}`}>
            <CardHeader>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Debit:</span>
                  <Badge variant="outline" className="text-green-600">{template.debit}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credit:</span>
                  <Badge variant="outline" className="text-red-600">{template.credit}</Badge>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline" data-testid={`button-use-template-${index}`}>
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: "entries", label: "Journal Entries", icon: FileText, content: entriesTab },
    { id: "summary", label: "Summary", icon: Calendar, content: summaryTab },
    { id: "templates", label: "Templates", icon: Copy, content: templatesTab },
  ];

  return (
    <TabsPageLayout
      title="Journal Entries - القيود اليومية"
      description="Record and manage daily accounting transactions"
      icon={FileText}
      tabs={tabs}
      defaultTab="entries"
    />
  );
}
