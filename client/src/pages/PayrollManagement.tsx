import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TabsPageLayout, TabConfig } from "@/components/layouts/TabsPageLayout";
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
  const { t } = useTranslation();
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
      toast({ title: t('common.success', 'Success'), description: t('payroll.employeeAdded', 'Employee added to payroll') });
      setIsEmployeeDialogOpen(false);
      employeeForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('payroll.employeeAddError', 'Failed to add employee'), variant: "destructive" });
    }
  });

  const createPeriodMutation = useMutation({
    mutationFn: (data: PayPeriodFormData) => apiRequest("POST", "/api/payroll/periods", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/periods"] });
      toast({ title: t('common.success', 'Success'), description: t('payroll.periodCreated', 'Pay period created') });
      setIsPeriodDialogOpen(false);
      periodForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('payroll.periodCreateError', 'Failed to create pay period'), variant: "destructive" });
    }
  });

  const createRunMutation = useMutation({
    mutationFn: (data: PayrollRunFormData) => apiRequest("POST", "/api/payroll/runs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/runs", selectedPeriod?.id] });
      toast({ title: t('common.success', 'Success'), description: t('payroll.runCreated', 'Payroll run created') });
      setIsRunDialogOpen(false);
      runForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('payroll.runCreateError', 'Failed to create payroll run'), variant: "destructive" });
    }
  });

  const employeesTabContent = (
    <>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setIsEmployeeDialogOpen(true)}
          className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
          data-testid="button-add-employee"
        >
          <Users className="mr-2 h-4 w-4" />
          {t('payroll.addEmployee', 'Add Employee')}
        </Button>
      </div>
      <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
        <CardHeader>
          <CardTitle className="font-montserrat text-salis-black dark:text-white">{t('payroll.payrollEmployees', 'Payroll Employees')}</CardTitle>
          <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
            {t('payroll.manageEmployeePayroll', 'Manage employee payroll information')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employeesLoading ? (
            <p className="text-salis-gray font-poppins" data-testid="text-loading">{t('common.loading', 'Loading employees...')}</p>
          ) : employees.length === 0 ? (
            <p className="text-salis-gray font-poppins" data-testid="text-no-employees">{t('payroll.noEmployeesFound', 'No employees found')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('payroll.employeeNumber', 'Employee #')}</TableHead>
                  <TableHead>{t('payroll.payType', 'Pay Type')}</TableHead>
                  <TableHead>{t('payroll.baseRate', 'Base Rate')}</TableHead>
                  <TableHead>{t('payroll.frequency', 'Frequency')}</TableHead>
                  <TableHead>{t('common.status', 'Status')}</TableHead>
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
                        {emp.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );

  const periodsTabContent = (
    <>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setIsPeriodDialogOpen(true)}
          className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
          data-testid="button-create-period"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {t('payroll.createPayPeriod', 'Create Pay Period')}
        </Button>
      </div>
      <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
        <CardHeader>
          <CardTitle className="font-montserrat text-salis-black dark:text-white">{t('payroll.payPeriods', 'Pay Periods')}</CardTitle>
          <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
            {t('payroll.configurePayPeriods', 'Configure pay periods and payment schedules')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {periodsLoading ? (
            <p className="text-salis-gray font-poppins" data-testid="text-loading-periods">{t('common.loading', 'Loading periods...')}</p>
          ) : periods.length === 0 ? (
            <p className="text-salis-gray font-poppins" data-testid="text-no-periods">{t('payroll.noPayPeriodsFound', 'No pay periods found')}</p>
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
                          {t('payroll.payDate', 'Pay Date')}: {new Date(period.payDate).toLocaleDateString()}
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
    </>
  );

  const runsTabContent = (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins" data-testid="text-selected-period">
          {selectedPeriod ? t('payroll.periodSelected', 'Period: {{name}}', { name: selectedPeriod.periodName }) : t('payroll.selectPayPeriodToView', 'Select a pay period to view runs')}
        </p>
        <Button
          onClick={() => setIsRunDialogOpen(true)}
          disabled={!selectedPeriod}
          className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
          data-testid="button-create-run"
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          {t('payroll.createRun', 'Create Run')}
        </Button>
      </div>
      <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
        <CardHeader>
          <CardTitle className="font-montserrat text-salis-black dark:text-white">{t('payroll.payrollRuns', 'Payroll Runs')}</CardTitle>
          <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
            {t('payroll.individualPayrollRuns', 'Individual payroll runs for employees')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedPeriod ? (
            <p className="text-salis-gray font-poppins" data-testid="text-select-period">{t('payroll.selectPayPeriodFromTab', 'Select a pay period from the Pay Periods tab')}</p>
          ) : runs.length === 0 ? (
            <p className="text-salis-gray font-poppins" data-testid="text-no-runs">{t('payroll.noPayrollRunsFound', 'No payroll runs found')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('payroll.employee', 'Employee')}</TableHead>
                  <TableHead>{t('payroll.hours', 'Hours')}</TableHead>
                  <TableHead>{t('payroll.grossPay', 'Gross Pay')}</TableHead>
                  <TableHead>{t('payroll.deductions', 'Deductions')}</TableHead>
                  <TableHead>{t('payroll.netPay', 'Net Pay')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run: any) => (
                  <TableRow key={run.id} data-testid={`row-run-${run.id}`}>
                    <TableCell className="font-medium" data-testid={`text-employee-${run.id}`}>{run.employeeId}</TableCell>
                    <TableCell data-testid={`text-hours-${run.id}`}>{run.hoursWorked || t('common.na', 'N/A')}</TableCell>
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
    </>
  );

  const tabs: TabConfig[] = [
    {
      id: "employees",
      label: t('payroll.employees', 'Employees'),
      icon: Users,
      content: employeesTabContent,
    },
    {
      id: "periods",
      label: t('payroll.payPeriods', 'Pay Periods'),
      icon: Calendar,
      content: periodsTabContent,
    },
    {
      id: "runs",
      label: t('payroll.payrollRuns', 'Payroll Runs'),
      icon: PlayCircle,
      content: runsTabContent,
    },
  ];

  return (
    <>
      <TabsPageLayout
        title={t('payroll.title', 'Payroll Management')}
        description={t('payroll.description', 'Manage employee payroll, pay periods, and payroll runs')}
        icon={DollarSign}
        tabs={tabs}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      {/* Add Employee Dialog */}
      <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">{t('payroll.addEmployeeToPayroll', 'Add Employee to Payroll')}</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('payroll.addNewEmployeeDescription', 'Add a new employee to the payroll system')}
            </DialogDescription>
          </DialogHeader>
          <Form {...employeeForm}>
            <form onSubmit={employeeForm.handleSubmit((data) => createEmployeeMutation.mutate(data))} className="space-y-4">
              <FormField
                control={employeeForm.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('payroll.userId', 'User ID')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('payroll.enterUserId', 'Enter user ID')} data-testid="input-user-id" />
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
                    <FormLabel>{t('payroll.employeeNumber', 'Employee Number')}</FormLabel>
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
                    <FormLabel>{t('payroll.payType', 'Pay Type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-pay-type">
                          <SelectValue placeholder={t('payroll.selectPayType', 'Select pay type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hourly">{t('payroll.hourly', 'Hourly')}</SelectItem>
                        <SelectItem value="salary">{t('payroll.salary', 'Salary')}</SelectItem>
                        <SelectItem value="commission">{t('payroll.commission', 'Commission')}</SelectItem>
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
                    <FormLabel>{t('payroll.baseRate', 'Base Rate')}</FormLabel>
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
                    <FormLabel>{t('payroll.payFrequency', 'Pay Frequency')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-pay-frequency">
                          <SelectValue placeholder={t('payroll.selectFrequency', 'Select frequency')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekly">{t('payroll.weekly', 'Weekly')}</SelectItem>
                        <SelectItem value="biweekly">{t('payroll.biweekly', 'Bi-weekly')}</SelectItem>
                        <SelectItem value="monthly">{t('payroll.monthly', 'Monthly')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createEmployeeMutation.isPending} data-testid="button-submit-employee">
                  {createEmployeeMutation.isPending ? t('common.adding', 'Adding...') : t('payroll.addEmployee', 'Add Employee')}
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
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">{t('payroll.createPayPeriod', 'Create Pay Period')}</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('payroll.defineNewPayPeriod', 'Define a new pay period')}
            </DialogDescription>
          </DialogHeader>
          <Form {...periodForm}>
            <form onSubmit={periodForm.handleSubmit((data) => createPeriodMutation.mutate(data))} className="space-y-4">
              <FormField
                control={periodForm.control}
                name="periodName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('payroll.periodName', 'Period Name')}</FormLabel>
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
                      <FormLabel>{t('payroll.startDate', 'Start Date')}</FormLabel>
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
                      <FormLabel>{t('payroll.endDate', 'End Date')}</FormLabel>
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
                    <FormLabel>{t('payroll.payDate', 'Pay Date')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" data-testid="input-pay-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createPeriodMutation.isPending} data-testid="button-submit-period">
                  {createPeriodMutation.isPending ? t('common.creating', 'Creating...') : t('payroll.createPeriod', 'Create Period')}
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
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">{t('payroll.createPayrollRun', 'Create Payroll Run')}</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('payroll.processPayrollDescription', 'Process payroll for an employee')}
            </DialogDescription>
          </DialogHeader>
          <Form {...runForm}>
            <form onSubmit={runForm.handleSubmit((data) => createRunMutation.mutate(data))} className="space-y-4">
              <FormField
                control={runForm.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('payroll.employee', 'Employee')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('payroll.enterEmployeeId', 'Enter employee ID')} data-testid="input-run-employee" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={runForm.control}
                name="hoursWorked"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('payroll.hoursWorked', 'Hours Worked')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.5"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        data-testid="input-hours-worked"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={runForm.control}
                  name="grossPay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('payroll.grossPay', 'Gross Pay')}</FormLabel>
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
                      <FormLabel>{t('payroll.deductions', 'Deductions')}</FormLabel>
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
                      <FormLabel>{t('payroll.netPay', 'Net Pay')}</FormLabel>
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
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createRunMutation.isPending} data-testid="button-submit-run">
                  {createRunMutation.isPending ? t('common.creating', 'Creating...') : t('payroll.createRun', 'Create Run')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
