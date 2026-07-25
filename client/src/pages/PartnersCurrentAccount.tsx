// @ts-nocheck
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  RefreshCw,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

const transactionSchema = z.object({
  partnerId: z.string().min(1, "Partner is required"),
  transactionType: z.string().min(1, "Transaction type is required"),
  amount: z.string().min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  reference: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const withdrawalSchema = z.object({
  partnerId: z.string().min(1, "Partner is required"),
  amount: z.string().min(1, "Amount is required"),
  withdrawalType: z.string().min(1, "Withdrawal type is required"),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  reason: z.string().optional(),
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

export default function PartnersCurrentAccount() {
  const { t } = useTranslation();
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);

  const transactionForm = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      partnerId: "",
      transactionType: "",
      amount: "",
      date: "",
      description: "",
      reference: "",
    },
  });

  const withdrawalForm = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      partnerId: "",
      amount: "",
      withdrawalType: "",
      date: "",
      paymentMethod: "",
      reason: "",
    },
  });

  const onTransactionSubmit = (data: TransactionFormData) => {
    console.log("Transaction:", data);
    setIsTransactionDialogOpen(false);
    transactionForm.reset();
  };

  const onWithdrawalSubmit = (data: WithdrawalFormData) => {
    console.log("Withdrawal:", data);
    setIsWithdrawalDialogOpen(false);
    withdrawalForm.reset();
  };

  const partners = [
    { id: 1, name: "Ahmed Al-Rashid", openingBalance: 50000, credits: 125000, debits: 75000, currentBalance: 100000, ownership: 50 },
    { id: 2, name: "Mohammed Hassan", openingBalance: 30000, credits: 80000, debits: 45000, currentBalance: 65000, ownership: 30 },
    { id: 3, name: "Khalid Abdullah", openingBalance: 20000, credits: 55000, debits: 35000, currentBalance: 40000, ownership: 20 },
  ];

  const transactions = [
    { id: 1, date: "2024-11-28", partner: "Ahmed Al-Rashid", type: "Credit", description: "Profit Distribution Q3", amount: 25000 },
    { id: 2, date: "2024-11-25", partner: "Mohammed Hassan", type: "Debit", description: "Personal Withdrawal", amount: -15000 },
    { id: 3, date: "2024-11-20", partner: "Khalid Abdullah", type: "Credit", description: "Capital Contribution", amount: 20000 },
    { id: 4, date: "2024-11-15", partner: "Ahmed Al-Rashid", type: "Debit", description: "Advance Payment", amount: -10000 },
    { id: 5, date: "2024-11-10", partner: "Mohammed Hassan", type: "Credit", description: "Profit Distribution Q3", amount: 15000 },
  ];

  const withdrawals = [
    { id: 1, date: "2024-11-25", partner: "Mohammed Hassan", type: "Personal", amount: 15000, method: "Bank Transfer", status: "Completed" },
    { id: 2, date: "2024-11-15", partner: "Ahmed Al-Rashid", type: "Advance", amount: 10000, method: "Cash", status: "Completed" },
    { id: 3, date: "2024-11-05", partner: "Khalid Abdullah", type: "Personal", amount: 8000, method: "Bank Transfer", status: "Completed" },
  ];

  const tabs = [
    {
      id: "overview",
      label: t('partners.overview', 'Overview'),
      icon: Wallet,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748B]">{t('partners.totalBalance', 'Total Balance')}</p>
                    <p className="text-2xl font-bold font-montserrat text-[#0B1F3B] dark:text-white" data-testid="text-total-balance">SAR 205,000</p>
                  </div>
                  <div className="p-2 rounded-xl bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748B]">{t('partners.totalCredits', 'Total Credits')}</p>
                    <p className="text-2xl font-bold font-montserrat text-[#0A5ED7]" data-testid="text-total-credits">SAR 260,000</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0A5ED7]/10">
                    <TrendingUp className="h-6 w-6 text-[#0A5ED7]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748B]">{t('partners.totalDebits', 'Total Debits')}</p>
                    <p className="text-2xl font-bold font-montserrat text-[#F97316]" data-testid="text-total-debits">SAR 155,000</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F97316]/10">
                    <TrendingDown className="h-6 w-6 text-[#F97316]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748B]">{t('partners.activePartners', 'Active Partners')}</p>
                    <p className="text-2xl font-bold font-montserrat text-[#0B1F3B] dark:text-white" data-testid="text-active-partners">3</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0BB3FF]/10">
                    <Users className="h-6 w-6 text-[#0BB3FF]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Users className="h-5 w-5 text-[#0A5ED7]" />
                {t('partners.partnersCurrentAccountSummary', 'Partners Current Account Summary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('partners.partner', 'Partner')}</TableHead>
                    <TableHead className="text-right">{t('partners.openingBalance', 'Opening Balance')}</TableHead>
                    <TableHead className="text-right">{t('partners.credits', 'Credits')}</TableHead>
                    <TableHead className="text-right">{t('partners.debits', 'Debits')}</TableHead>
                    <TableHead className="text-right">{t('partners.currentBalance', 'Current Balance')}</TableHead>
                    <TableHead className="text-right">{t('partners.ownershipPercent', 'Ownership %')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id} data-testid={`row-partner-${partner.id}`}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell className="text-right font-montserrat">SAR {partner.openingBalance.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-montserrat text-green-600">+SAR {partner.credits.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-montserrat text-red-600">-SAR {partner.debits.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-montserrat font-bold">SAR {partner.currentBalance.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-montserrat">{partner.ownership}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "transactions",
      label: t('partners.transactions', 'Transactions'),
      icon: RefreshCw,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('partners.accountTransactions', 'Account Transactions')}</h3>
            <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-transaction">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('partners.addTransaction', 'Add Transaction')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('partners.addTransaction', 'Add Transaction')}</DialogTitle>
                </DialogHeader>
                <Form {...transactionForm}>
                  <form onSubmit={transactionForm.handleSubmit(onTransactionSubmit)} className="space-y-4">
                    <FormField
                      control={transactionForm.control}
                      name="partnerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('partners.partner', 'Partner')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-partner">
                                <SelectValue placeholder={t('partners.selectPartner', 'Select partner')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {partners.map((partner) => (
                                <SelectItem key={partner.id} value={partner.id.toString()}>
                                  {partner.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={transactionForm.control}
                      name="transactionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('partners.transactionType', 'Transaction Type')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-transaction-type">
                                <SelectValue placeholder={t('partners.selectType', 'Select type')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="credit">{t('partners.creditDeposit', 'Credit (Deposit)')}</SelectItem>
                              <SelectItem value="debit">{t('partners.debitWithdrawal', 'Debit (Withdrawal)')}</SelectItem>
                              <SelectItem value="profit">{t('partners.profitDistribution', 'Profit Distribution')}</SelectItem>
                              <SelectItem value="advance">{t('partners.advancePayment', 'Advance Payment')}</SelectItem>
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
                            <FormLabel>{t('partners.amountSAR', 'Amount (SAR)')}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} data-testid="input-transaction-amount" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={transactionForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('common.date', 'Date')}</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-transaction-date" />
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
                          <FormLabel>{t('common.description', 'Description')}</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="input-transaction-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" data-testid="button-submit-transaction">
                      {t('partners.addTransaction', 'Add Transaction')}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-[#F8FAFC] dark:bg-[#0E1117]">
                  <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.date', 'Date')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('partners.partner', 'Partner')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.type', 'Type')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.description', 'Description')}</TableHead>
                    <TableHead className="text-right text-[#0B1F3B] dark:text-white">{t('common.amount', 'Amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                      <TableCell className="font-montserrat">{transaction.date}</TableCell>
                      <TableCell>{transaction.partner}</TableCell>
                      <TableCell>
                        <Badge className={transaction.type === "Credit" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"}>
                          {transaction.type === "Credit" ? (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          )}
                          {transaction.type === "Credit" ? t('partners.credit', 'Credit') : t('partners.debit', 'Debit')}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={`text-right font-montserrat font-bold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                        {transaction.amount > 0 ? "+" : ""}SAR {Math.abs(transaction.amount).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "withdrawals",
      label: t('partners.withdrawals', 'Withdrawals'),
      icon: ArrowUpRight,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('partners.partnerWithdrawals', 'Partner Withdrawals')}</h3>
            <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-withdrawal">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('partners.newWithdrawal', 'New Withdrawal')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('partners.newWithdrawal', 'New Withdrawal')}</DialogTitle>
                </DialogHeader>
                <Form {...withdrawalForm}>
                  <form onSubmit={withdrawalForm.handleSubmit(onWithdrawalSubmit)} className="space-y-4">
                    <FormField
                      control={withdrawalForm.control}
                      name="partnerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('partners.partner', 'Partner')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-withdrawal-partner">
                                <SelectValue placeholder={t('partners.selectPartner', 'Select partner')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {partners.map((partner) => (
                                <SelectItem key={partner.id} value={partner.id.toString()}>
                                  {partner.name} ({t('partners.balance', 'Balance')}: SAR {partner.currentBalance.toLocaleString()})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={withdrawalForm.control}
                      name="withdrawalType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('partners.withdrawalType', 'Withdrawal Type')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-withdrawal-type">
                                <SelectValue placeholder={t('partners.selectType', 'Select type')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="personal">{t('partners.personalWithdrawal', 'Personal Withdrawal')}</SelectItem>
                              <SelectItem value="advance">{t('partners.advanceAgainstProfit', 'Advance Against Profit')}</SelectItem>
                              <SelectItem value="loan">{t('partners.partnerLoan', 'Partner Loan')}</SelectItem>
                              <SelectItem value="expense">{t('partners.businessExpense', 'Business Expense')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={withdrawalForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('partners.amountSAR', 'Amount (SAR)')}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} data-testid="input-withdrawal-amount" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={withdrawalForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('common.date', 'Date')}</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-withdrawal-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={withdrawalForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('partners.paymentMethod', 'Payment Method')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-withdrawal-method">
                                <SelectValue placeholder={t('partners.selectMethod', 'Select method')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="bank_transfer">{t('partners.bankTransfer', 'Bank Transfer')}</SelectItem>
                              <SelectItem value="cash">{t('partners.cash', 'Cash')}</SelectItem>
                              <SelectItem value="check">{t('partners.check', 'Check')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={withdrawalForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('partners.reasonOptional', 'Reason (Optional)')}</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="input-withdrawal-reason" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" data-testid="button-submit-withdrawal">
                      {t('partners.processWithdrawal', 'Process Withdrawal')}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-[#F8FAFC] dark:bg-[#0E1117]">
                  <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.date', 'Date')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('partners.partner', 'Partner')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.type', 'Type')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.amount', 'Amount')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('partners.method', 'Method')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id} data-testid={`row-withdrawal-${withdrawal.id}`}>
                      <TableCell className="font-montserrat">{withdrawal.date}</TableCell>
                      <TableCell>{withdrawal.partner}</TableCell>
                      <TableCell>{withdrawal.type}</TableCell>
                      <TableCell className="font-montserrat text-red-600">SAR {withdrawal.amount.toLocaleString()}</TableCell>
                      <TableCell>{withdrawal.method}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          {t('partners.completed', 'Completed')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "reports",
      label: t('partners.reports', 'Reports'),
      icon: FileText,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('partners.partnerReports', 'Partner Reports')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-report-statement">
              <CardHeader className="pb-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] w-fit mb-2">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('partners.partnerStatement', 'Partner Statement')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#64748B] mb-4">{t('partners.partnerStatementDesc', 'Detailed account statement for each partner')}</p>
                <Button variant="outline" className="w-full border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#0A5ED7]/5 dark:hover:bg-[#0BB3FF]/10">
                  {t('partners.generateReport', 'Generate Report')}
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-[#0A5ED7] transition-colors bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-report-profit">
              <CardHeader className="pb-2">
                <div className="p-2 rounded-xl bg-[#0A5ED7]/10 w-fit mb-2">
                  <TrendingUp className="h-6 w-6 text-[#0A5ED7]" />
                </div>
                <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('partners.profitDistribution', 'Profit Distribution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#64748B] mb-4">{t('partners.profitDistributionDesc', 'Profit sharing analysis by partner')}</p>
                <Button variant="outline" className="w-full border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#0A5ED7]/5">
                  {t('partners.generateReport', 'Generate Report')}
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-[#F97316] transition-colors bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-report-withdrawals">
              <CardHeader className="pb-2">
                <div className="p-2 rounded-xl bg-[#F97316]/10 w-fit mb-2">
                  <ArrowUpRight className="h-6 w-6 text-[#F97316]" />
                </div>
                <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('partners.withdrawalHistory', 'Withdrawal History')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#64748B] mb-4">{t('partners.withdrawalHistoryDesc', 'Complete withdrawal records')}</p>
                <Button variant="outline" className="w-full border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F97316]/5">
                  {t('partners.generateReport', 'Generate Report')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <TabsPageLayout
        title={t('partners.partnersCurrentAccount', 'Partners Current Account')}
        subtitle={t('partners.partnersCurrentAccountSubtitle', 'Track partner balances, transactions, and withdrawals')}
        tabs={tabs}
      />
    </div>
  );
}
