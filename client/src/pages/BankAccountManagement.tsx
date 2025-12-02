import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TabsPageLayout } from "@/components/layouts";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Building2, 
  CreditCard, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";

const bankAccountSchema = z.object({
  accountName: z.string().min(1, "Account name is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  iban: z.string().optional(),
  swiftCode: z.string().optional(),
  currency: z.string().default("SAR"),
  accountType: z.enum(["checking", "savings", "business", "merchant"]),
  openingBalance: z.string().default("0"),
  currentBalance: z.string().default("0"),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

const transactionSchema = z.object({
  bankAccountId: z.string().min(1, "Bank account is required"),
  transactionType: z.enum(["deposit", "withdrawal", "transfer", "fee", "interest"]),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  referenceNumber: z.string().optional(),
  transactionDate: z.string().min(1, "Date is required"),
  category: z.string().optional(),
  reconciled: z.boolean().default(false),
});

const reconciliationSchema = z.object({
  bankAccountId: z.string().min(1, "Bank account is required"),
  statementDate: z.string().min(1, "Statement date is required"),
  statementBalance: z.string().min(1, "Statement balance is required"),
  notes: z.string().optional(),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;
type TransactionFormData = z.infer<typeof transactionSchema>;
type ReconciliationFormData = z.infer<typeof reconciliationSchema>;

interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  iban?: string;
  swiftCode?: string;
  currency: string;
  accountType: string;
  openingBalance: string;
  currentBalance: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

interface BankTransaction {
  id: string;
  bankAccountId: string;
  transactionType: string;
  amount: string;
  description: string;
  referenceNumber?: string;
  transactionDate: string;
  category?: string;
  reconciled: boolean;
  createdAt: string;
}

export default function BankAccountManagement() {
  const { toast } = useToast();
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isReconcileDialogOpen, setIsReconcileDialogOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  const { data: bankAccounts = [], isLoading: accountsLoading } = useQuery<BankAccount[]>({
    queryKey: ["/api/bank-accounts"],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<BankTransaction[]>({
    queryKey: ["/api/bank-transactions", selectedAccountId],
    enabled: !!selectedAccountId,
  });

  const accountForm = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountName: "",
      bankName: "",
      accountNumber: "",
      iban: "",
      swiftCode: "",
      currency: "SAR",
      accountType: "business",
      openingBalance: "0",
      currentBalance: "0",
      isActive: true,
      notes: "",
    },
  });

  const transactionForm = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      bankAccountId: "",
      transactionType: "deposit",
      amount: "",
      description: "",
      referenceNumber: "",
      transactionDate: new Date().toISOString().split("T")[0],
      category: "",
      reconciled: false,
    },
  });

  const reconcileForm = useForm<ReconciliationFormData>({
    resolver: zodResolver(reconciliationSchema),
    defaultValues: {
      bankAccountId: "",
      statementDate: new Date().toISOString().split("T")[0],
      statementBalance: "",
      notes: "",
    },
  });

  const accountMutation = useMutation({
    mutationFn: async (data: BankAccountFormData) => {
      if (editingAccountId) {
        return await apiRequest("PATCH", `/api/bank-accounts/${editingAccountId}`, data);
      }
      return await apiRequest("POST", "/api/bank-accounts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      setIsAccountDialogOpen(false);
      setEditingAccountId(null);
      accountForm.reset();
      toast({ title: editingAccountId ? "Account updated" : "Account created" });
    },
    onError: () => {
      toast({ title: "Error saving account", variant: "destructive" });
    },
  });

  const transactionMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      return await apiRequest("POST", "/api/bank-transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      setIsTransactionDialogOpen(false);
      transactionForm.reset();
      toast({ title: "Transaction recorded" });
    },
    onError: () => {
      toast({ title: "Error recording transaction", variant: "destructive" });
    },
  });

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance || "0"), 0);
  const activeAccounts = bankAccounts.filter(acc => acc.isActive).length;

  const accountsTab = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-3 gap-4">
          <Card data-testid="card-total-balance">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">SAR {totalBalance.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card data-testid="card-active-accounts">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAccounts}</div>
            </CardContent>
          </Card>
          <Card data-testid="card-total-accounts">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bankAccounts.length}</div>
            </CardContent>
          </Card>
        </div>
        <Button onClick={() => setIsAccountDialogOpen(true)} data-testid="button-add-account">
          <Plus className="h-4 w-4 mr-2" />
          Add Bank Account
        </Button>
      </div>

      <div className="grid gap-4">
        {accountsLoading ? (
          <Card>
            <CardContent className="py-8 text-center">Loading accounts...</CardContent>
          </Card>
        ) : bankAccounts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No bank accounts configured. Add your first account to get started.
            </CardContent>
          </Card>
        ) : (
          bankAccounts.map((account) => (
            <Card key={account.id} data-testid={`card-account-${account.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {account.accountName}
                    </CardTitle>
                    <CardDescription>{account.bankName} - {account.accountNumber}</CardDescription>
                  </div>
                  <Badge variant={account.isActive ? "default" : "secondary"}>
                    {account.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Account Type</p>
                    <p className="font-medium capitalize">{account.accountType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Currency</p>
                    <p className="font-medium">{account.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Opening Balance</p>
                    <p className="font-medium">{account.currency} {parseFloat(account.openingBalance).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Balance</p>
                    <p className="font-medium text-lg">{account.currency} {parseFloat(account.currentBalance).toLocaleString()}</p>
                  </div>
                </div>
                {account.iban && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">IBAN: {account.iban}</p>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAccountId(account.id);
                      transactionForm.setValue("bankAccountId", account.id);
                      setIsTransactionDialogOpen(true);
                    }}
                    data-testid={`button-add-transaction-${account.id}`}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Transaction
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAccountId(account.id)}
                    data-testid={`button-view-transactions-${account.id}`}
                  >
                    View Transactions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      reconcileForm.setValue("bankAccountId", account.id);
                      setIsReconcileDialogOpen(true);
                    }}
                    data-testid={`button-reconcile-${account.id}`}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reconcile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const transactionsTab = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-64" data-testid="select-account-filter">
              <SelectValue placeholder="Select account to view transactions" />
            </SelectTrigger>
            <SelectContent>
              {bankAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.accountName} - {account.bankName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={() => setIsTransactionDialogOpen(true)}
          disabled={!selectedAccountId}
          data-testid="button-new-transaction"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Transaction
        </Button>
      </div>

      {!selectedAccountId ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Select a bank account to view transactions
          </CardContent>
        </Card>
      ) : transactionsLoading ? (
        <Card>
          <CardContent className="py-8 text-center">Loading transactions...</CardContent>
        </Card>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No transactions found for this account
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} data-testid={`row-transaction-${tx.id}`}>
                  <TableCell>{format(new Date(tx.transactionDate), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tx.transactionType === "deposit" ? (
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      ) : tx.transactionType === "withdrawal" ? (
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      ) : (
                        <RefreshCw className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="capitalize">{tx.transactionType}</span>
                    </div>
                  </TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell>{tx.referenceNumber || "-"}</TableCell>
                  <TableCell className={`text-right font-medium ${
                    tx.transactionType === "deposit" || tx.transactionType === "interest" 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    {tx.transactionType === "deposit" || tx.transactionType === "interest" ? "+" : "-"}
                    SAR {parseFloat(tx.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {tx.reconciled ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Reconciled
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );

  const reconciliationTab = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bank Reconciliation</CardTitle>
          <CardDescription>
            Match your bank statements with recorded transactions to ensure accuracy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {bankAccounts.map((account) => (
              <div key={account.id} className="flex justify-between items-center p-4 border rounded-lg" data-testid={`reconcile-row-${account.id}`}>
                <div>
                  <p className="font-medium">{account.accountName}</p>
                  <p className="text-sm text-gray-500">{account.bankName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">SAR {parseFloat(account.currentBalance).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Current Balance</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    reconcileForm.setValue("bankAccountId", account.id);
                    setIsReconcileDialogOpen(true);
                  }}
                  data-testid={`button-reconcile-account-${account.id}`}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Start Reconciliation
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <TabsPageLayout
        title="Bank Account Management"
        description="إدارة الحسابات البنكية - Manage bank accounts, transactions, and reconciliation"
        defaultTab="accounts"
        tabs={[
          { id: "accounts", label: "Bank Accounts", icon: Building2, content: accountsTab },
          { id: "transactions", label: "Transactions", icon: CreditCard, content: transactionsTab },
          { id: "reconciliation", label: "Reconciliation", icon: RefreshCw, content: reconciliationTab },
        ]}
      />

      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="modal-bank-account">
          <DialogHeader>
            <DialogTitle>{editingAccountId ? "Edit Bank Account" : "Add Bank Account"}</DialogTitle>
            <DialogDescription>Configure bank account details</DialogDescription>
          </DialogHeader>
          <Form {...accountForm}>
            <form onSubmit={accountForm.handleSubmit((data) => accountMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={accountForm.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Main Business Account" data-testid="input-account-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={accountForm.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Al Rajhi Bank" data-testid="input-bank-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={accountForm.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="1234567890" data-testid="input-account-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={accountForm.control}
                  name="iban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IBAN</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="SA..." data-testid="input-iban" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={accountForm.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-account-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="merchant">Merchant</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={accountForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-currency">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={accountForm.control}
                  name="openingBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Balance</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-opening-balance" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={accountForm.control}
                  name="swiftCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SWIFT Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="RJHISARI" data-testid="input-swift" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={accountForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional notes..." data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAccountDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={accountMutation.isPending} data-testid="button-save-account">
                  {accountMutation.isPending ? "Saving..." : "Save Account"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent data-testid="modal-transaction">
          <DialogHeader>
            <DialogTitle>Record Transaction</DialogTitle>
            <DialogDescription>Add a new bank transaction</DialogDescription>
          </DialogHeader>
          <Form {...transactionForm}>
            <form onSubmit={transactionForm.handleSubmit((data) => transactionMutation.mutate(data))} className="space-y-4">
              <FormField
                control={transactionForm.control}
                name="bankAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Account</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tx-account">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bankAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.accountName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={transactionForm.control}
                  name="transactionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-tx-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="deposit">Deposit</SelectItem>
                          <SelectItem value="withdrawal">Withdrawal</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                          <SelectItem value="fee">Bank Fee</SelectItem>
                          <SelectItem value="interest">Interest</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transactionForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-tx-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transactionForm.control}
                  name="transactionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-tx-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transactionForm.control}
                  name="referenceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Optional" data-testid="input-tx-reference" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={transactionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Transaction description" data-testid="input-tx-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={transactionMutation.isPending} data-testid="button-save-transaction">
                  {transactionMutation.isPending ? "Saving..." : "Save Transaction"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isReconcileDialogOpen} onOpenChange={setIsReconcileDialogOpen}>
        <DialogContent data-testid="modal-reconciliation">
          <DialogHeader>
            <DialogTitle>Bank Reconciliation</DialogTitle>
            <DialogDescription>Enter bank statement details to reconcile</DialogDescription>
          </DialogHeader>
          <Form {...reconcileForm}>
            <form className="space-y-4">
              <FormField
                control={reconcileForm.control}
                name="statementDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statement Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" data-testid="input-statement-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={reconcileForm.control}
                name="statementBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statement Balance</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-statement-balance" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={reconcileForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Reconciliation notes..." data-testid="input-reconcile-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsReconcileDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-complete-reconciliation">
                  Complete Reconciliation
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
