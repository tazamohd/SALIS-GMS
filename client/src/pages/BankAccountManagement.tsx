import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      toast({ title: editingAccountId ? t('bankAccounts.accountUpdated', 'Account updated') : t('bankAccounts.accountCreated', 'Account created') });
    },
    onError: () => {
      toast({ title: t('bankAccounts.errorSaving', 'Error saving account'), variant: "destructive" });
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
      toast({ title: t('bankAccounts.transactionRecorded', 'Transaction recorded') });
    },
    onError: () => {
      toast({ title: t('bankAccounts.errorRecordingTransaction', 'Error recording transaction'), variant: "destructive" });
    },
  });

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance || "0"), 0);
  const activeAccounts = bankAccounts.filter(acc => acc.isActive).length;

  const accountsTab = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-balance">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">{t('bankAccounts.totalBalance', 'Total Balance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">SAR {totalBalance.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-active-accounts">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">{t('bankAccounts.activeAccounts', 'Active Accounts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{activeAccounts}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-accounts">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">{t('bankAccounts.totalAccounts', 'Total Accounts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{bankAccounts.length}</div>
            </CardContent>
          </Card>
        </div>
        <Button onClick={() => setIsAccountDialogOpen(true)} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" data-testid="button-add-account">
          <Plus className="h-4 w-4 mr-2" />
          {t('bankAccounts.addBankAccount', 'Add Bank Account')}
        </Button>
      </div>

      <div className="grid gap-4">
        {accountsLoading ? (
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="py-8 text-center text-[#64748B]">{t('common.loading', 'Loading...')}</CardContent>
          </Card>
        ) : bankAccounts.length === 0 ? (
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="py-8 text-center text-[#64748B]">
              {t('bankAccounts.noAccountsConfigured', 'No bank accounts configured. Add your first account to get started.')}
            </CardContent>
          </Card>
        ) : (
          bankAccounts.map((account) => (
            <Card key={account.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`card-account-${account.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                      <Building2 className="h-5 w-5" />
                      {account.accountName}
                    </CardTitle>
                    <CardDescription className="text-[#64748B]">{account.bankName} - {account.accountNumber}</CardDescription>
                  </div>
                  <Badge className={account.isActive ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}>
                    {account.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-[#64748B]">{t('bankAccounts.accountType', 'Account Type')}</p>
                    <p className="font-medium capitalize text-[#0B1F3B] dark:text-white">{account.accountType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">{t('bankAccounts.currency', 'Currency')}</p>
                    <p className="font-medium text-[#0B1F3B] dark:text-white">{account.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">{t('bankAccounts.openingBalance', 'Opening Balance')}</p>
                    <p className="font-medium text-[#0B1F3B] dark:text-white">{account.currency} {parseFloat(account.openingBalance).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">{t('bankAccounts.currentBalance', 'Current Balance')}</p>
                    <p className="font-medium text-lg text-[#0B1F3B] dark:text-white">{account.currency} {parseFloat(account.currentBalance).toLocaleString()}</p>
                  </div>
                </div>
                {account.iban && (
                  <div className="mt-4">
                    <p className="text-sm text-[#64748B]">{t('bankAccounts.iban', 'IBAN')}: {account.iban}</p>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
                    onClick={() => {
                      setSelectedAccountId(account.id);
                      transactionForm.setValue("bankAccountId", account.id);
                      setIsTransactionDialogOpen(true);
                    }}
                    data-testid={`button-add-transaction-${account.id}`}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('bankAccounts.addTransaction', 'Add Transaction')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
                    onClick={() => setSelectedAccountId(account.id)}
                    data-testid={`button-view-transactions-${account.id}`}
                  >
                    {t('bankAccounts.viewTransactions', 'View Transactions')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
                    onClick={() => {
                      reconcileForm.setValue("bankAccountId", account.id);
                      setIsReconcileDialogOpen(true);
                    }}
                    data-testid={`button-reconcile-${account.id}`}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {t('bankAccounts.reconcile', 'Reconcile')}
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
            <SelectTrigger className="w-64 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-account-filter">
              <SelectValue placeholder={t('bankAccounts.selectAccountToView', 'Select account to view transactions')} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
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
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90 disabled:opacity-50"
          data-testid="button-new-transaction"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('bankAccounts.newTransaction', 'New Transaction')}
        </Button>
      </div>

      {!selectedAccountId ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="py-8 text-center text-[#64748B]">
            {t('bankAccounts.selectAccountPrompt', 'Select a bank account to view transactions')}
          </CardContent>
        </Card>
      ) : transactionsLoading ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="py-8 text-center text-[#64748B]">{t('common.loading', 'Loading...')}</CardContent>
        </Card>
      ) : transactions.length === 0 ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="py-8 text-center text-[#64748B]">
            {t('bankAccounts.noTransactionsFound', 'No transactions found for this account')}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]">
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.date', 'Date')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.type', 'Type')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.description', 'Description')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('bankAccounts.reference', 'Reference')}</TableHead>
                <TableHead className="text-right text-[#0B1F3B] dark:text-white">{t('common.amount', 'Amount')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-transaction-${tx.id}`}>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{format(new Date(tx.transactionDate), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
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
                  <TableCell className="text-[#0B1F3B] dark:text-white">{tx.description}</TableCell>
                  <TableCell className="text-[#64748B]">{tx.referenceNumber || "-"}</TableCell>
                  <TableCell className={`text-right font-medium ${
                    tx.transactionType === "deposit" || tx.transactionType === "interest" 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {tx.transactionType === "deposit" || tx.transactionType === "interest" ? "+" : "-"}
                    SAR {parseFloat(tx.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {tx.reconciled ? (
                      <Badge className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t('bankAccounts.reconciled', 'Reconciled')}
                      </Badge>
                    ) : (
                      <Badge className="bg-[#F8FAFC] dark:bg-[#0E1117] text-[#64748B] border border-[#E2E8F0] dark:border-[#232A36]">
                        <Clock className="h-3 w-3 mr-1" />
                        {t('common.pending', 'Pending')}
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
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('bankAccounts.bankReconciliation', 'Bank Reconciliation')}</CardTitle>
          <CardDescription className="text-[#64748B]">
            {t('bankAccounts.reconciliationDescription', 'Match your bank statements with recorded transactions to ensure accuracy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {bankAccounts.map((account) => (
              <div key={account.id} className="flex justify-between items-center p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid={`reconcile-row-${account.id}`}>
                <div>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">{account.accountName}</p>
                  <p className="text-sm text-[#64748B]">{account.bankName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#0B1F3B] dark:text-white">SAR {parseFloat(account.currentBalance).toLocaleString()}</p>
                  <p className="text-sm text-[#64748B]">{t('bankAccounts.currentBalance', 'Current Balance')}</p>
                </div>
                <Button
                  variant="outline"
                  className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-white dark:hover:bg-[#151A23]"
                  onClick={() => {
                    reconcileForm.setValue("bankAccountId", account.id);
                    setIsReconcileDialogOpen(true);
                  }}
                  data-testid={`button-reconcile-account-${account.id}`}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('bankAccounts.startReconciliation', 'Start Reconciliation')}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <TabsPageLayout
        title={t('bankAccounts.title', 'Bank Account Management')}
        description={t('bankAccounts.description', 'إدارة الحسابات البنكية - Manage bank accounts, transactions, and reconciliation')}
        defaultTab="accounts"
        tabs={[
          { id: "accounts", label: t('bankAccounts.bankAccounts', 'Bank Accounts'), icon: Building2, content: accountsTab },
          { id: "transactions", label: t('bankAccounts.transactions', 'Transactions'), icon: CreditCard, content: transactionsTab },
          { id: "reconciliation", label: t('bankAccounts.reconciliation', 'Reconciliation'), icon: RefreshCw, content: reconciliationTab },
        ]}
      />

      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="modal-bank-account">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{editingAccountId ? t('bankAccounts.editBankAccount', 'Edit Bank Account') : t('bankAccounts.addBankAccount', 'Add Bank Account')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">{t('bankAccounts.configureAccountDetails', 'Configure bank account details')}</DialogDescription>
          </DialogHeader>
          <Form {...accountForm}>
            <form onSubmit={accountForm.handleSubmit((data) => accountMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={accountForm.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('bankAccounts.accountName', 'Account Name')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('bankAccounts.accountNamePlaceholder', 'Main Business Account')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-account-name" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('bankAccounts.bankName', 'Bank Name')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('bankAccounts.bankNamePlaceholder', 'Al Rajhi Bank')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-bank-name" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('bankAccounts.accountNumber', 'Account Number')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="1234567890" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-account-number" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('bankAccounts.iban', 'IBAN')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="SA..." className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-iban" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('bankAccounts.accountType', 'Account Type')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-account-type">
                            <SelectValue placeholder={t('bankAccounts.selectAccountType', 'Select type')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="checking">{t('bankAccounts.checking', 'Checking')}</SelectItem>
                          <SelectItem value="savings">{t('bankAccounts.savings', 'Savings')}</SelectItem>
                          <SelectItem value="business">{t('bankAccounts.business', 'Business')}</SelectItem>
                          <SelectItem value="merchant">{t('bankAccounts.merchant', 'Merchant')}</SelectItem>
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('bankAccounts.currency', 'Currency')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-currency">
                            <SelectValue placeholder={t('bankAccounts.selectCurrency', 'Select currency')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="SAR">SAR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('bankAccounts.openingBalance', 'Opening Balance')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="0" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-opening-balance" />
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
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.notes', 'Notes')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('bankAccounts.notesPlaceholder', 'Additional notes...')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAccountDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-save-account">
                  {editingAccountId ? t('common.save', 'Save') : t('bankAccounts.addAccount', 'Add Account')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="modal-transaction">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('bankAccounts.recordTransaction', 'Record Transaction')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">{t('bankAccounts.recordNewTransaction', 'Record a new bank transaction')}</DialogDescription>
          </DialogHeader>
          <Form {...transactionForm}>
            <form onSubmit={transactionForm.handleSubmit((data) => transactionMutation.mutate(data))} className="space-y-4">
              <FormField
                control={transactionForm.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.type', 'Type')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-transaction-type">
                          <SelectValue placeholder={t('bankAccounts.selectType', 'Select type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                        <SelectItem value="deposit">{t('bankAccounts.deposit', 'Deposit')}</SelectItem>
                        <SelectItem value="withdrawal">{t('bankAccounts.withdrawal', 'Withdrawal')}</SelectItem>
                        <SelectItem value="transfer">{t('bankAccounts.transfer', 'Transfer')}</SelectItem>
                        <SelectItem value="fee">{t('bankAccounts.fee', 'Fee')}</SelectItem>
                        <SelectItem value="interest">{t('bankAccounts.interest', 'Interest')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={transactionForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.amount', 'Amount')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="0.00" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-transaction-amount" />
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
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.date', 'Date')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-transaction-date" />
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
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.description', 'Description')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('bankAccounts.descriptionPlaceholder', 'Transaction description')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-transaction-description" />
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
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('bankAccounts.referenceOptional', 'Reference (Optional)')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('bankAccounts.referencePlaceholder', 'Check #, Transfer ID, etc.')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-transaction-reference" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsTransactionDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-save-transaction">
                  {t('bankAccounts.recordTransaction', 'Record Transaction')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isReconcileDialogOpen} onOpenChange={setIsReconcileDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="modal-reconcile">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('bankAccounts.bankReconciliation', 'Bank Reconciliation')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">{t('bankAccounts.enterStatementDetails', 'Enter your bank statement details')}</DialogDescription>
          </DialogHeader>
          <Form {...reconcileForm}>
            <form onSubmit={reconcileForm.handleSubmit((data) => console.log(data))} className="space-y-4">
              <FormField
                control={reconcileForm.control}
                name="statementDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('bankAccounts.statementDate', 'Statement Date')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-statement-date" />
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
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('bankAccounts.statementBalance', 'Statement Balance')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="0.00" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-statement-balance" />
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
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.notes', 'Notes')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('bankAccounts.reconciliationNotes', 'Reconciliation notes...')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-reconcile-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsReconcileDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-start-reconcile">
                  {t('bankAccounts.startReconciliation', 'Start Reconciliation')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
