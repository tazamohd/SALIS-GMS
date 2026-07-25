import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
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
import { DollarSign, FolderPlus, Receipt, CheckCircle, XCircle } from "lucide-react";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";

const categorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
  categoryCode: z.string().min(1, "Category code is required"),
  description: z.string().optional(),
  budgetLimit: z.number().min(0).optional(),
  requiresApproval: z.boolean().default(true),
});

const expenseSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  vendorName: z.string().min(1, "Vendor name is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().default("USD"),
  expenseDate: z.string(),
  description: z.string().optional(),
  receiptUrl: z.string().optional(),
  paymentMethod: z.enum(["cash", "credit_card", "debit_card", "check", "wire_transfer"]),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function ExpenseTracking() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("expenses");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ["/api/expense-categories"],
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<any[]>({
    queryKey: ["/api/expenses"],
  });

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: "",
      categoryCode: "",
      description: "",
      budgetLimit: 0,
      requiresApproval: true,
    }
  });

  const expenseForm = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      categoryId: "",
      vendorName: "",
      amount: 0,
      currency: "USD",
      expenseDate: new Date().toISOString().split('T')[0],
      description: "",
      paymentMethod: "credit_card",
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormData) => apiRequest("POST", "/api/expense-categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-categories"] });
      toast({ title: t('common.success', 'Success'), description: t('payments.expenses.categoryCreated', 'Expense category created') });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('payments.expenses.categoryCreateFailed', 'Failed to create category'), variant: "destructive" });
    }
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => apiRequest("POST", "/api/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: t('common.success', 'Success'), description: t('payments.expenses.expenseCreated', 'Expense created successfully') });
      setIsExpenseDialogOpen(false);
      expenseForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('payments.expenses.expenseCreateFailed', 'Failed to create expense'), variant: "destructive" });
    }
  });

  const approveExpenseMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/expenses/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: t('common.success', 'Success'), description: t('payments.expenses.expenseApproved', 'Expense approved') });
    },
  });

  const rejectExpenseMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/expenses/${id}/reject`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: t('common.success', 'Success'), description: t('payments.expenses.expenseRejected', 'Expense rejected') });
    },
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-[#F97316] text-white",
      approved: "bg-[#0A5ED7] text-white",
      rejected: "bg-[#F97316] text-white",
      paid: "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white",
    };
    return colors[status] || "bg-[#64748B] text-white";
  };

  const expensesTab = (
    <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
      <CardHeader>
        <CardTitle className="font-montserrat text-[#0B1F3B] dark:text-white">{t('payments.expenses.allExpenses', 'All Expenses')}</CardTitle>
        <CardDescription className="font-poppins text-[#64748B]">
          {t('payments.expenses.viewAndManage', 'View and manage all business expenses')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {expensesLoading ? (
          <p className="text-salis-gray font-poppins" data-testid="text-loading">{t('common.loading', 'Loading expenses...')}</p>
        ) : expenses.length === 0 ? (
          <p className="text-salis-gray font-poppins" data-testid="text-no-expenses">{t('payments.expenses.noExpenses', 'No expenses found')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('payments.expenses.vendor', 'Vendor')}</TableHead>
                <TableHead>{t('common.amount', 'Amount')}</TableHead>
                <TableHead>{t('common.date', 'Date')}</TableHead>
                <TableHead>{t('payments.paymentMethod', 'Payment Method')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
                <TableHead>{t('common.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense: any) => (
                <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                  <TableCell className="font-medium" data-testid={`text-vendor-${expense.id}`}>{expense.vendorName}</TableCell>
                  <TableCell data-testid={`text-amount-${expense.id}`}>
                    {expense.currency} ${expense.amount.toFixed(2)}
                  </TableCell>
                  <TableCell data-testid={`text-date-${expense.id}`}>
                    {new Date(expense.expenseDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell data-testid={`text-payment-${expense.id}`}>{expense.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(expense.status)} data-testid={`badge-status-${expense.id}`}>
                      {expense.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {expense.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveExpenseMutation.mutate(expense.id)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                          data-testid={`button-approve-${expense.id}`}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectExpenseMutation.mutate(expense.id)}
                          data-testid={`button-reject-${expense.id}`}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const categoriesTab = (
    <>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setIsCategoryDialogOpen(true)}
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white font-poppins"
          data-testid="button-create-category"
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          {t('payments.expenses.createCategory', 'Create Category')}
        </Button>
      </div>
      <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
        <CardHeader>
          <CardTitle className="font-montserrat text-[#0B1F3B] dark:text-white">{t('payments.expenses.expenseCategories', 'Expense Categories')}</CardTitle>
          <CardDescription className="font-poppins text-[#64748B]">
            {t('payments.expenses.manageCategoriesAndBudgets', 'Manage expense categories and budgets')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <p className="text-salis-gray font-poppins" data-testid="text-loading-categories">{t('common.loading', 'Loading categories...')}</p>
          ) : categories.length === 0 ? (
            <p className="text-salis-gray font-poppins" data-testid="text-no-categories">{t('payments.expenses.noCategories', 'No categories found')}</p>
          ) : (
            <div className="grid gap-4">
              {categories.map((category: any) => (
                <Card key={category.id} className="border-salis-gray-light dark:border-salis-gray-dark" data-testid={`card-category-${category.id}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-montserrat font-medium text-salis-black dark:text-white" data-testid={`text-category-name-${category.id}`}>
                          {category.categoryName}
                        </h3>
                        <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins" data-testid={`text-category-code-${category.id}`}>
                          Code: {category.categoryCode}
                        </p>
                        <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins mt-1" data-testid={`text-category-description-${category.id}`}>
                          {category.description || "No description"}
                        </p>
                      </div>
                      <div className="text-right">
                        {category.budgetLimit && (
                          <div>
                            <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins">{t('payments.expenses.budgetLimit', 'Budget Limit')}</p>
                            <p className="font-semibold text-salis-black dark:text-white" data-testid={`text-budget-${category.id}`}>
                              ${category.budgetLimit.toFixed(2)}
                            </p>
                          </div>
                        )}
                        {category.requiresApproval && (
                          <Badge className="mt-2 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid={`badge-approval-${category.id}`}>
                            {t('payments.expenses.requiresApproval', 'Requires Approval')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  return (
    <>
      <TabsPageLayout
        title={t('payments.expenses.title', 'Expense Tracking')}
        description={t('payments.expenses.description', 'Manage business expenses, categories, and approvals')}
        icon={DollarSign}
        primaryAction={{
          label: t('payments.expenses.createExpense', 'Create Expense'),
          icon: Receipt,
          onClick: () => setIsExpenseDialogOpen(true),
          testId: "button-create-expense",
        }}
        tabs={[
          {
            id: "expenses",
            label: t('payments.expenses.expenses', 'Expenses'),
            icon: Receipt,
            content: expensesTab,
          },
          {
            id: "categories",
            label: t('payments.expenses.categories', 'Categories'),
            icon: FolderPlus,
            content: categoriesTab,
          },
        ]}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-[#0B1F3B] dark:text-white">{t('payments.expenses.createExpenseCategory', 'Create Expense Category')}</DialogTitle>
            <DialogDescription className="font-poppins text-[#64748B]">
              {t('payments.expenses.addNewCategory', 'Add a new expense category')}
            </DialogDescription>
          </DialogHeader>
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit((data) => createCategoryMutation.mutate(data))} className="space-y-4">
              <FormField
                control={categoryForm.control}
                name="categoryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('payments.expenses.categoryName', 'Category Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('payments.expenses.categoryNamePlaceholder', 'Office Supplies')} data-testid="input-category-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={categoryForm.control}
                name="categoryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('payments.expenses.categoryCode', 'Category Code')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="OS001" data-testid="input-category-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={categoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.description', 'Description')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('payments.expenses.categoryDescriptionPlaceholder', 'Category description...')} data-testid="input-category-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={categoryForm.control}
                name="budgetLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('payments.expenses.budgetLimitOptional', 'Budget Limit (optional)')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-budget-limit"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createCategoryMutation.isPending} data-testid="button-submit-category">
                  {createCategoryMutation.isPending ? t('common.creating', 'Creating...') : t('payments.expenses.createCategory', 'Create Category')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-[#0B1F3B] dark:text-white">{t('payments.expenses.createExpense', 'Create Expense')}</DialogTitle>
            <DialogDescription className="font-poppins text-[#64748B]">
              {t('payments.expenses.recordNewExpense', 'Record a new business expense')}
            </DialogDescription>
          </DialogHeader>
          <Form {...expenseForm}>
            <form onSubmit={expenseForm.handleSubmit((data) => createExpenseMutation.mutate(data))} className="space-y-4">
              <FormField
                control={expenseForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.category', 'Category')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder={t('payments.expenses.selectCategory', 'Select category')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={expenseForm.control}
                name="vendorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('payments.expenses.vendorName', 'Vendor Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('payments.expenses.vendorPlaceholder', 'ABC Supplies Inc.')} data-testid="input-vendor-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={expenseForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.amount', 'Amount')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          data-testid="input-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={expenseForm.control}
                  name="expenseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.date', 'Date')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-expense-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={expenseForm.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('payments.paymentMethod', 'Payment Method')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-payment-method">
                          <SelectValue placeholder={t('payments.selectPaymentMethod', 'Select payment method')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">{t('payments.methods.cash', 'Cash')}</SelectItem>
                        <SelectItem value="credit_card">{t('payments.methods.creditCard', 'Credit Card')}</SelectItem>
                        <SelectItem value="debit_card">{t('payments.methods.debitCard', 'Debit Card')}</SelectItem>
                        <SelectItem value="check">{t('payments.methods.check', 'Check')}</SelectItem>
                        <SelectItem value="wire_transfer">{t('payments.methods.wireTransfer', 'Wire Transfer')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={expenseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('payments.expenses.descriptionOptional', 'Description (optional)')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('payments.expenses.expenseDetailsPlaceholder', 'Expense details...')} data-testid="input-expense-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createExpenseMutation.isPending} data-testid="button-submit-expense">
                  {createExpenseMutation.isPending ? t('common.creating', 'Creating...') : t('payments.expenses.createExpense', 'Create Expense')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
