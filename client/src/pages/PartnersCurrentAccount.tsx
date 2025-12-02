import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      label: "Overview",
      icon: Wallet,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
                    <p className="text-2xl font-bold font-montserrat" data-testid="text-total-balance">SAR 205,000</p>
                  </div>
                  <Wallet className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Credits</p>
                    <p className="text-2xl font-bold font-montserrat text-green-600" data-testid="text-total-credits">SAR 260,000</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Debits</p>
                    <p className="text-2xl font-bold font-montserrat text-red-600" data-testid="text-total-debits">SAR 155,000</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Partners</p>
                    <p className="text-2xl font-bold font-montserrat" data-testid="text-active-partners">3</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Partners Current Account Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead className="text-right">Opening Balance</TableHead>
                    <TableHead className="text-right">Credits</TableHead>
                    <TableHead className="text-right">Debits</TableHead>
                    <TableHead className="text-right">Current Balance</TableHead>
                    <TableHead className="text-right">Ownership %</TableHead>
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
      label: "Transactions",
      icon: RefreshCw,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Account Transactions</h3>
            <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-transaction">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <Form {...transactionForm}>
                  <form onSubmit={transactionForm.handleSubmit(onTransactionSubmit)} className="space-y-4">
                    <FormField
                      control={transactionForm.control}
                      name="partnerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partner</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-partner">
                                <SelectValue placeholder="Select partner" />
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
                          <FormLabel>Transaction Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-transaction-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="credit">Credit (Deposit)</SelectItem>
                              <SelectItem value="debit">Debit (Withdrawal)</SelectItem>
                              <SelectItem value="profit">Profit Distribution</SelectItem>
                              <SelectItem value="advance">Advance Payment</SelectItem>
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
                            <FormLabel>Amount (SAR)</FormLabel>
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
                            <FormLabel>Date</FormLabel>
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
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="input-transaction-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" data-testid="button-submit-transaction">
                      Add Transaction
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
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
                          {transaction.type}
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
      label: "Withdrawals",
      icon: ArrowUpRight,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Partner Withdrawals</h3>
            <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-withdrawal">
                  <Plus className="h-4 w-4 mr-2" />
                  New Withdrawal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>New Withdrawal</DialogTitle>
                </DialogHeader>
                <Form {...withdrawalForm}>
                  <form onSubmit={withdrawalForm.handleSubmit(onWithdrawalSubmit)} className="space-y-4">
                    <FormField
                      control={withdrawalForm.control}
                      name="partnerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partner</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-withdrawal-partner">
                                <SelectValue placeholder="Select partner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {partners.map((partner) => (
                                <SelectItem key={partner.id} value={partner.id.toString()}>
                                  {partner.name} (Balance: SAR {partner.currentBalance.toLocaleString()})
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
                          <FormLabel>Withdrawal Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-withdrawal-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="personal">Personal Withdrawal</SelectItem>
                              <SelectItem value="advance">Advance Against Profit</SelectItem>
                              <SelectItem value="loan">Partner Loan</SelectItem>
                              <SelectItem value="expense">Business Expense</SelectItem>
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
                            <FormLabel>Amount (SAR)</FormLabel>
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
                            <FormLabel>Date</FormLabel>
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
                          <FormLabel>Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-withdrawal-method">
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="check">Check</SelectItem>
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
                          <FormLabel>Reason (Optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="input-withdrawal-reason" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" data-testid="button-submit-withdrawal">
                      Process Withdrawal
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id} data-testid={`row-withdrawal-${withdrawal.id}`}>
                      <TableCell className="font-montserrat">{withdrawal.date}</TableCell>
                      <TableCell>{withdrawal.partner}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{withdrawal.type}</Badge>
                      </TableCell>
                      <TableCell>{withdrawal.method}</TableCell>
                      <TableCell className="text-right font-montserrat text-red-600">
                        -SAR {withdrawal.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          {withdrawal.status}
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
      id: "statements",
      label: "Statements",
      icon: FileText,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Partner Account Statements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {partners.map((partner) => (
              <Card key={partner.id} className="bg-gray-50 dark:bg-salis-gray-dark/30" data-testid={`card-statement-${partner.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{partner.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Opening Balance</span>
                      <span className="font-montserrat">SAR {partner.openingBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Credits</span>
                      <span className="font-montserrat text-green-600">+SAR {partner.credits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Debits</span>
                      <span className="font-montserrat text-red-600">-SAR {partner.debits.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Current Balance</span>
                      <span className="font-montserrat text-blue-600">SAR {partner.currentBalance.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" data-testid={`button-download-statement-${partner.id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Download Statement
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <TabsPageLayout
      title="Partners Current Account"
      titleArabic="جاري الشركاء"
      description="Manage partner current accounts, transactions, and withdrawals"
      descriptionArabic="إدارة حسابات الشركاء الجارية والمعاملات والسحوبات"
      icon={Users}
      tabs={tabs}
      defaultTab="overview"
    />
  );
}
