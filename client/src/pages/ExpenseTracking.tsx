import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, FolderPlus, Receipt, CheckCircle, XCircle } from "lucide-react";

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
      toast({ title: "Success", description: "Expense category created" });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
    }
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => apiRequest("POST", "/api/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Success", description: "Expense created successfully" });
      setIsExpenseDialogOpen(false);
      expenseForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create expense", variant: "destructive" });
    }
  });

  const approveExpenseMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/expenses/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Success", description: "Expense approved" });
    },
  });

  const rejectExpenseMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/expenses/${id}/reject`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Success", description: "Expense rejected" });
    },
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500 text-white",
      approved: "bg-green-500 text-white",
      rejected: "bg-red-500 text-white",
      paid: "bg-salis-black text-white",
    };
    return colors[status] || "bg-salis-gray text-white";
  };

  return (
    <div className="container mx-auto py-6 space-y-6 bg-white dark:bg-[#010101] min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-montserrat font-semibold text-salis-black dark:text-white" data-testid="heading-expenses">
            Expense Tracking
          </h1>
          <p className="text-salis-gray dark:text-salis-gray-light font-poppins mt-1" data-testid="text-subtitle">
            Manage business expenses, categories, and approvals
          </p>
        </div>
        <Button
          onClick={() => setIsExpenseDialogOpen(true)}
          className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
          data-testid="button-create-expense"
        >
          <Receipt className="mr-2 h-4 w-4" />
          Create Expense
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="bg-salis-gray-light dark:bg-salis-gray-dark" data-testid="tabs-expenses">
          <TabsTrigger value="expenses" className="font-poppins" data-testid="tab-expenses">
            <Receipt className="mr-2 h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="categories" className="font-poppins" data-testid="tab-categories">
            <FolderPlus className="mr-2 h-4 w-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
            <CardHeader>
              <CardTitle className="font-montserrat text-salis-black dark:text-white">All Expenses</CardTitle>
              <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
                View and manage all business expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expensesLoading ? (
                <p className="text-salis-gray font-poppins" data-testid="text-loading">Loading expenses...</p>
              ) : expenses.length === 0 ? (
                <p className="text-salis-gray font-poppins" data-testid="text-no-expenses">No expenses found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
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
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setIsCategoryDialogOpen(true)}
              className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
              data-testid="button-create-category"
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </div>
          <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
            <CardHeader>
              <CardTitle className="font-montserrat text-salis-black dark:text-white">Expense Categories</CardTitle>
              <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
                Manage expense categories and budgets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <p className="text-salis-gray font-poppins" data-testid="text-loading-categories">Loading categories...</p>
              ) : categories.length === 0 ? (
                <p className="text-salis-gray font-poppins" data-testid="text-no-categories">No categories found</p>
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
                                <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins">Budget Limit</p>
                                <p className="font-semibold text-salis-black dark:text-white" data-testid={`text-budget-${category.id}`}>
                                  ${category.budgetLimit.toFixed(2)}
                                </p>
                              </div>
                            )}
                            {category.requiresApproval && (
                              <Badge className="mt-2 bg-salis-black text-white" data-testid={`badge-approval-${category.id}`}>
                                Requires Approval
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
        </TabsContent>
      </Tabs>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">Create Expense Category</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              Add a new expense category
            </DialogDescription>
          </DialogHeader>
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit((data) => createCategoryMutation.mutate(data))} className="space-y-4">
              <FormField
                control={categoryForm.control}
                name="categoryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Office Supplies" data-testid="input-category-name" />
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
                    <FormLabel>Category Code</FormLabel>
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Category description..." data-testid="input-category-description" />
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
                    <FormLabel>Budget Limit (optional)</FormLabel>
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
                  {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">Create Expense</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              Record a new business expense
            </DialogDescription>
          </DialogHeader>
          <Form {...expenseForm}>
            <form onSubmit={expenseForm.handleSubmit((data) => createExpenseMutation.mutate(data))} className="space-y-4">
              <FormField
                control={expenseForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
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
                    <FormLabel>Vendor Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ABC Supplies Inc." data-testid="input-vendor-name" />
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
                      <FormLabel>Amount</FormLabel>
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
                      <FormLabel>Date</FormLabel>
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
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-payment-method">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="debit_card">Debit Card</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
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
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Expense details..." data-testid="input-expense-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createExpenseMutation.isPending} data-testid="button-submit-expense">
                  {createExpenseMutation.isPending ? "Creating..." : "Create Expense"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
