import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Calendar, Users, PlayCircle } from "lucide-react";

const employeeSchema = z.object({
  userId: z.string().min(1, "Employee is required"),
  employeeNumber: z.string().min(1, "Employee number is required"),
  payType: z.enum(["hourly", "salary", "commission"]),
  baseRate: z.number().min(0),
  currency: z.string().default("USD"),
  payFrequency: z.enum(["weekly", "biweekly", "monthly"]),
  taxId: z.string().optional(),
  bankAccount: z.string().optional(),
  isActive: z.boolean().default(true),
});

const payPeriodSchema = z.object({
  periodName: z.string().min(1, "Period name is required"),
  startDate: z.string(),
  endDate: z.string(),
  payDate: z.string(),
  status: z.enum(["draft", "processing", "approved", "paid"]).default("draft"),
});

const payrollRunSchema = z.object({
  payPeriodId: z.string().min(1, "Pay period is required"),
  employeeId: z.string().min(1, "Employee is required"),
  hoursWorked: z.number().min(0).optional(),
  grossPay: z.number().min(0),
  deductions: z.number().min(0).default(0),
  netPay: z.number().min(0),
  notes: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;
type PayPeriodFormData = z.infer<typeof payPeriodSchema>;
type PayrollRunFormData = z.infer<typeof payrollRunSchema>;

export default function PayrollManagement() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("employees");
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isPeriodDialogOpen, setIsPeriodDialogOpen] = useState(false);
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);

  // Fetch data
  const { data: employees = [], isLoading: employeesLoading } = useQuery<any[]>({
    queryKey: ["/api/payroll/employees"],
  });

  const { data: periods = [], isLoading: periodsLoading } = useQuery<any[]>({
    queryKey: ["/api/payroll/periods"],
  });

  const { data: runs = [] } = useQuery<any[]>({
    queryKey: ["/api/payroll/runs", selectedPeriod?.id],
    enabled: !!selectedPeriod,
  });

  // Forms
  const employeeForm = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      userId: "",
      employeeNumber: "",
      payType: "hourly",
      baseRate: 0,
      currency: "USD",
      payFrequency: "biweekly",
      isActive: true,
    }
  });

  const periodForm = useForm<PayPeriodFormData>({
    resolver: zodResolver(payPeriodSchema),
    defaultValues: {
      periodName: "",
      startDate: "",
      endDate: "",
      payDate: "",
      status: "draft",
    }
  });

  const runForm = useForm<PayrollRunFormData>({
    resolver: zodResolver(payrollRunSchema),
    defaultValues: {
      payPeriodId: selectedPeriod?.id || "",
      employeeId: "",
      hoursWorked: 0,
      grossPay: 0,
      deductions: 0,
      netPay: 0,
    }
  });

  // Mutations
  const createEmployeeMutation = useMutation({
    mutationFn: (data: EmployeeFormData) => apiRequest("POST", "/api/payroll/employees", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/employees"] });
      toast({ title: "Success", description: "Employee added to payroll" });
      setIsEmployeeDialogOpen(false);
      employeeForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add employee", variant: "destructive" });
    }
  });

  const createPeriodMutation = useMutation({
    mutationFn: (data: PayPeriodFormData) => apiRequest("POST", "/api/payroll/periods", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/periods"] });
      toast({ title: "Success", description: "Pay period created" });
      setIsPeriodDialogOpen(false);
      periodForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create pay period", variant: "destructive" });
    }
  });

  const createRunMutation = useMutation({
    mutationFn: (data: PayrollRunFormData) => apiRequest("POST", "/api/payroll/runs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/runs", selectedPeriod?.id] });
      toast({ title: "Success", description: "Payroll run created" });
      setIsRunDialogOpen(false);
      runForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create payroll run", variant: "destructive" });
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-6 bg-white dark:bg-[#010101] min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-montserrat font-semibold text-salis-black dark:text-white" data-testid="heading-payroll">
            Payroll Management
          </h1>
          <p className="text-salis-gray dark:text-salis-gray-light font-poppins mt-1" data-testid="text-subtitle">
            Manage employee payroll, pay periods, and payroll runs
          </p>
        </div>
        <Button
          onClick={() => setIsEmployeeDialogOpen(true)}
          className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
          data-testid="button-add-employee"
        >
          <Users className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="bg-salis-gray-light dark:bg-salis-gray-dark" data-testid="tabs-payroll">
          <TabsTrigger value="employees" className="font-poppins" data-testid="tab-employees">
            <Users className="mr-2 h-4 w-4" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="periods" className="font-poppins" data-testid="tab-periods">
            <Calendar className="mr-2 h-4 w-4" />
            Pay Periods
          </TabsTrigger>
          <TabsTrigger value="runs" className="font-poppins" data-testid="tab-runs">
            <PlayCircle className="mr-2 h-4 w-4" />
            Payroll Runs
          </TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
            <CardHeader>
              <CardTitle className="font-montserrat text-salis-black dark:text-white">Payroll Employees</CardTitle>
              <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
                Manage employee payroll information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {employeesLoading ? (
                <p className="text-salis-gray font-poppins" data-testid="text-loading">Loading employees...</p>
              ) : employees.length === 0 ? (
                <p className="text-salis-gray font-poppins" data-testid="text-no-employees">No employees found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee #</TableHead>
                      <TableHead>Pay Type</TableHead>
                      <TableHead>Base Rate</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp: any) => (
                      <TableRow key={emp.id} data-testid={`row-employee-${emp.id}`}>
                        <TableCell className="font-medium" data-testid={`text-empnum-${emp.id}`}>{emp.employeeNumber}</TableCell>
                        <TableCell data-testid={`text-paytype-${emp.id}`}>{emp.payType}</TableCell>
                        <TableCell data-testid={`text-rate-${emp.id}`}>${emp.baseRate.toFixed(2)}</TableCell>
                        <TableCell data-testid={`text-frequency-${emp.id}`}>{emp.payFrequency}</TableCell>
                        <TableCell>
                          <Badge className={emp.isActive ? "bg-salis-black text-white" : "bg-salis-gray-light text-salis-black"} data-testid={`badge-status-${emp.id}`}>
                            {emp.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pay Periods Tab */}
        <TabsContent value="periods" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setIsPeriodDialogOpen(true)}
              className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
              data-testid="button-create-period"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Create Pay Period
            </Button>
          </div>
          <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
            <CardHeader>
              <CardTitle className="font-montserrat text-salis-black dark:text-white">Pay Periods</CardTitle>
              <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
                Configure pay periods and payment schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {periodsLoading ? (
                <p className="text-salis-gray font-poppins" data-testid="text-loading-periods">Loading periods...</p>
              ) : periods.length === 0 ? (
                <p className="text-salis-gray font-poppins" data-testid="text-no-periods">No pay periods found</p>
              ) : (
                <div className="grid gap-4">
                  {periods.map((period: any) => (
                    <Card
                      key={period.id}
                      className="border-salis-gray-light dark:border-salis-gray-dark cursor-pointer hover:border-salis-gray dark:hover:border-salis-gray transition-colors"
                      onClick={() => setSelectedPeriod(period)}
                      data-testid={`card-period-${period.id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-montserrat font-medium text-salis-black dark:text-white" data-testid={`text-period-name-${period.id}`}>
                              {period.periodName}
                            </h3>
                            <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins" data-testid={`text-period-dates-${period.id}`}>
                              {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins mt-1" data-testid={`text-pay-date-${period.id}`}>
                              Pay Date: {new Date(period.payDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-salis-black text-white" data-testid={`badge-period-status-${period.id}`}>
                            {period.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Runs Tab */}
        <TabsContent value="runs" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins" data-testid="text-selected-period">
              {selectedPeriod ? `Period: ${selectedPeriod.periodName}` : "Select a pay period to view runs"}
            </p>
            <Button
              onClick={() => setIsRunDialogOpen(true)}
              disabled={!selectedPeriod}
              className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
              data-testid="button-create-run"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Create Run
            </Button>
          </div>
          <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
            <CardHeader>
              <CardTitle className="font-montserrat text-salis-black dark:text-white">Payroll Runs</CardTitle>
              <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
                Individual payroll runs for employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedPeriod ? (
                <p className="text-salis-gray font-poppins" data-testid="text-select-period">Select a pay period from the Pay Periods tab</p>
              ) : runs.length === 0 ? (
                <p className="text-salis-gray font-poppins" data-testid="text-no-runs">No payroll runs found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Gross Pay</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Pay</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.map((run: any) => (
                      <TableRow key={run.id} data-testid={`row-run-${run.id}`}>
                        <TableCell className="font-medium" data-testid={`text-employee-${run.id}`}>{run.employeeId}</TableCell>
                        <TableCell data-testid={`text-hours-${run.id}`}>{run.hoursWorked || "N/A"}</TableCell>
                        <TableCell data-testid={`text-gross-${run.id}`}>${run.grossPay.toFixed(2)}</TableCell>
                        <TableCell data-testid={`text-deductions-${run.id}`}>${run.deductions.toFixed(2)}</TableCell>
                        <TableCell className="font-semibold" data-testid={`text-net-${run.id}`}>${run.netPay.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Employee Dialog */}
      <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">Add Employee to Payroll</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              Add a new employee to the payroll system
            </DialogDescription>
          </DialogHeader>
          <Form {...employeeForm}>
            <form onSubmit={employeeForm.handleSubmit((data) => createEmployeeMutation.mutate(data))} className="space-y-4">
              <FormField
                control={employeeForm.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter user ID" data-testid="input-user-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={employeeForm.control}
                name="employeeNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="EMP001" data-testid="input-employee-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={employeeForm.control}
                name="payType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pay Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-pay-type">
                          <SelectValue placeholder="Select pay type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="salary">Salary</SelectItem>
                        <SelectItem value="commission">Commission</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={employeeForm.control}
                name="baseRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Rate</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        data-testid="input-base-rate"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={employeeForm.control}
                name="payFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pay Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-pay-frequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createEmployeeMutation.isPending} data-testid="button-submit-employee">
                  {createEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Period Dialog */}
      <Dialog open={isPeriodDialogOpen} onOpenChange={setIsPeriodDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">Create Pay Period</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              Define a new pay period
            </DialogDescription>
          </DialogHeader>
          <Form {...periodForm}>
            <form onSubmit={periodForm.handleSubmit((data) => createPeriodMutation.mutate(data))} className="space-y-4">
              <FormField
                control={periodForm.control}
                name="periodName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Q1 2024" data-testid="input-period-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={periodForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={periodForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={periodForm.control}
                name="payDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pay Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" data-testid="input-pay-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createPeriodMutation.isPending} data-testid="button-submit-period">
                  {createPeriodMutation.isPending ? "Creating..." : "Create Period"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Run Dialog */}
      <Dialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">Create Payroll Run</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              Process payroll for an employee
            </DialogDescription>
          </DialogHeader>
          <Form {...runForm}>
            <form onSubmit={runForm.handleSubmit((data) => createRunMutation.mutate(data))} className="space-y-4">
              <FormField
                control={runForm.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-employee">
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((emp: any) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.employeeNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={runForm.control}
                name="hoursWorked"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours Worked</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.1"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-hours-worked"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={runForm.control}
                name="grossPay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Pay</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        data-testid="input-gross-pay"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={runForm.control}
                name="deductions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deductions</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        data-testid="input-deductions"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={runForm.control}
                name="netPay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Net Pay</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        data-testid="input-net-pay"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createRunMutation.isPending} data-testid="button-submit-run">
                  {createRunMutation.isPending ? "Creating..." : "Create Run"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
