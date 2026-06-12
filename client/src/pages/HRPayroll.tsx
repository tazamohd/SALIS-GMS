import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  UserPlus,
  Check,
  X,
  FileText,
  Briefcase,
  Shield,
} from "lucide-react";
import { DashboardPage } from "@/components/layouts/DashboardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// ---- Types ----
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  status: string;
  hireDate: string;
  level: string;
  speciality: string;
  nationalId: string;
  hourlyRate: string;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  hoursWorked: number;
  status: string;
  overtime: number;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  createdAt: string;
}

interface PayrollEmployee {
  employeeId: string;
  name: string;
  baseSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  grossSalary: number;
  gosiEmployer: number;
  gosiEmployee: number;
  netPay: number;
  isSaudi: boolean;
}

interface PayrollSummary {
  month: number;
  year: number;
  employeeCount: number;
  totalBaseSalary: number;
  totalAllowances: number;
  totalGrossSalary: number;
  totalGosiEmployer: number;
  totalGosiEmployee: number;
  totalDeductions: number;
  totalNetDisbursement: number;
  employees: PayrollEmployee[];
}

interface PaySlip {
  employeeId: string;
  name: string;
  email: string;
  department: string;
  level: string;
  month: number;
  year: number;
  isSaudi: boolean;
  earnings: {
    baseSalary: number;
    housingAllowance: number;
    transportAllowance: number;
    totalEarnings: number;
  };
  deductions: {
    gosiEmployee: number;
    totalDeductions: number;
  };
  employerCosts: {
    gosiEmployer: number;
  };
  netPay: number;
  grossSalary: number;
  endOfService: {
    yearsOfService: number;
    fullBenefit: number;
    payableBenefit: number;
  };
  vacation: {
    annualEntitlement: number;
    description: string;
  };
}

// ---- Helpers ----
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR" }).format(amount);
}

function statusBadge(status: string) {
  const variants: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    present: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    absent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    "day-off": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status] || variants.inactive}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ---- Employees Tab ----
function EmployeesTab() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({ fullName: "", email: "", phone: "", role: "ADVISOR", nationalId: "" });
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ employees: Employee[]; total: number }>({
    queryKey: [`/api/hr/employees?search=${search}`],
  });

  const addMutation = useMutation({
    mutationFn: async (emp: typeof newEmp) => {
      const res = await apiRequest("POST", "/api/hr/employees", emp);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/employees"] });
      toast({ title: "Employee added successfully" });
      setAddOpen(false);
      setNewEmp({ fullName: "", email: "", phone: "", role: "ADVISOR", nationalId: "" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const employees = data?.employees || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={newEmp.fullName} onChange={(e) => setNewEmp({ ...newEmp, fullName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={newEmp.email} onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={newEmp.phone} onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Department / Role</Label>
                <Select value={newEmp.role} onValueChange={(v) => setNewEmp({ ...newEmp, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="ADVISOR">Service Advisor</SelectItem>
                    <SelectItem value="TECHNICIAN">Technician</SelectItem>
                    <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>National ID (Saudi)</Label>
                <Input value={newEmp.nationalId} onChange={(e) => setNewEmp({ ...newEmp, nationalId: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={() => addMutation.mutate(newEmp)} disabled={addMutation.isPending}>
                {addMutation.isPending ? "Adding..." : "Add Employee"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="text-right">Salary (SAR)</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading employees...</TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No employees found</TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name || "N/A"}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{emp.department || "General"}</Badge>
                    </TableCell>
                    <TableCell>{emp.position || "Staff"}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(emp.salary)}</TableCell>
                    <TableCell>{emp.level}</TableCell>
                    <TableCell>{statusBadge(emp.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Attendance Tab ----
function AttendanceTab() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{
    attendance: AttendanceRecord[];
    total: number;
    present: number;
    absent: number;
    dayOff: number;
  }>({
    queryKey: [`/api/hr/attendance?date=${date}`],
  });

  const clockMutation = useMutation({
    mutationFn: async ({ employeeId, action }: { employeeId: string; action: string }) => {
      const res = await apiRequest("POST", "/api/hr/attendance/clock", { employeeId, action });
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/hr/attendance"] });
    },
  });

  const attendance = data?.attendance || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="max-w-[200px]" />
        <div className="flex gap-3 ml-auto">
          <Card className="px-4 py-2">
            <div className="text-xs text-muted-foreground">Present</div>
            <div className="text-lg font-bold text-emerald-600">{data?.present || 0}</div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-xs text-muted-foreground">Absent</div>
            <div className="text-lg font-bold text-red-600">{data?.absent || 0}</div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-xs text-muted-foreground">Day Off</div>
            <div className="text-lg font-bold text-blue-600">{data?.dayOff || 0}</div>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Overtime</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No records</TableCell>
                </TableRow>
              ) : (
                attendance.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">{rec.employeeName}</TableCell>
                    <TableCell><Badge variant="outline">{rec.department}</Badge></TableCell>
                    <TableCell>{rec.clockIn ? new Date(rec.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}</TableCell>
                    <TableCell>{rec.clockOut ? new Date(rec.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}</TableCell>
                    <TableCell className="text-right font-mono">{rec.hoursWorked.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-mono">{rec.overtime > 0 ? `+${rec.overtime}h` : "--"}</TableCell>
                    <TableCell>{statusBadge(rec.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => clockMutation.mutate({ employeeId: rec.employeeId, action: "in" })}>
                          In
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => clockMutation.mutate({ employeeId: rec.employeeId, action: "out" })}>
                          Out
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Leave Management Tab ----
function LeaveTab() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({ employeeId: "", employeeName: "", type: "annual", startDate: "", endDate: "", reason: "" });
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{
    leaveRequests: LeaveRequest[];
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }>({
    queryKey: [`/api/hr/leave-requests${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`],
  });

  const submitMutation = useMutation({
    mutationFn: async (leave: typeof newLeave) => {
      const res = await apiRequest("POST", "/api/hr/leave-requests", leave);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/leave-requests"] });
      toast({ title: "Leave request submitted" });
      setAddOpen(false);
      setNewLeave({ employeeId: "", employeeName: "", type: "annual", startDate: "", endDate: "", reason: "" });
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/hr/leave-requests/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/leave-requests"] });
      toast({ title: "Leave request updated" });
    },
  });

  const leaveRequests = data?.leaveRequests || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-3">
          <Card className="px-4 py-2">
            <div className="text-xs text-muted-foreground">Pending</div>
            <div className="text-lg font-bold text-amber-600">{data?.pending || 0}</div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-xs text-muted-foreground">Approved</div>
            <div className="text-lg font-bold text-emerald-600">{data?.approved || 0}</div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-xs text-muted-foreground">Rejected</div>
            <div className="text-lg font-bold text-red-600">{data?.rejected || 0}</div>
          </Card>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><CalendarDays className="w-4 h-4 mr-2" />Request Leave</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Leave Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Employee Name</Label>
                  <Input value={newLeave.employeeName} onChange={(e) => setNewLeave({ ...newLeave, employeeName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select value={newLeave.type} onValueChange={(v) => setNewLeave({ ...newLeave, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="emergency">Emergency Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" value={newLeave.startDate} onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" value={newLeave.endDate} onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Input value={newLeave.reason} onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={() => submitMutation.mutate({ ...newLeave, employeeId: newLeave.employeeName })} disabled={submitMutation.isPending}>
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead className="text-right">Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : leaveRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No leave requests</TableCell>
                </TableRow>
              ) : (
                leaveRequests.map((lr) => (
                  <TableRow key={lr.id}>
                    <TableCell className="font-medium">{lr.employeeName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {lr.type.charAt(0).toUpperCase() + lr.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{lr.startDate}</TableCell>
                    <TableCell>{lr.endDate}</TableCell>
                    <TableCell className="text-right font-mono">{lr.days}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{lr.reason}</TableCell>
                    <TableCell>{statusBadge(lr.status)}</TableCell>
                    <TableCell>
                      {lr.status === "pending" ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 hover:bg-emerald-50"
                            onClick={() => actionMutation.mutate({ id: lr.id, status: "approved" })}
                            disabled={actionMutation.isPending}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => actionMutation.mutate({ id: lr.id, status: "rejected" })}
                            disabled={actionMutation.isPending}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">--</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Payroll Tab ----
function PayrollTab() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const { data: summary, isLoading } = useQuery<PayrollSummary>({
    queryKey: ["/api/hr/payroll/summary"],
  });

  const { data: paySlip } = useQuery<PaySlip>({
    queryKey: [`/api/hr/payroll/slip/${selectedEmployee}`],
    enabled: !!selectedEmployee,
  });

  const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Payroll</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(summary?.totalGrossSalary || 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{summary?.employeeCount || 0} employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>GOSI (Employer)</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{formatCurrency(summary?.totalGosiEmployer || 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Employer social insurance contribution</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>GOSI (Employee)</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{formatCurrency(summary?.totalGosiEmployee || 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Deducted from employee salaries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Disbursement</CardDescription>
            <CardTitle className="text-2xl text-emerald-600">{formatCurrency(summary?.totalNetDisbursement || 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {monthNames[summary?.month || new Date().getMonth() + 1]} {summary?.year || new Date().getFullYear()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Allowances / Base breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Base Salaries</CardDescription>
            <CardTitle>{formatCurrency(summary?.totalBaseSalary || 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Allowances (Housing + Transport)</CardDescription>
            <CardTitle>{formatCurrency(summary?.totalAllowances || 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Deductions</CardDescription>
            <CardTitle className="text-red-600">{formatCurrency(summary?.totalDeductions || 0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Employee Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Pay Details</CardTitle>
          <CardDescription>Click on an employee to view their full pay slip</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Saudi</TableHead>
                <TableHead className="text-right">Base Salary</TableHead>
                <TableHead className="text-right">Allowances</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">GOSI (ER)</TableHead>
                <TableHead className="text-right">GOSI (EE)</TableHead>
                <TableHead className="text-right">Net Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : !summary?.employees?.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No payroll data</TableCell>
                </TableRow>
              ) : (
                summary.employees.map((emp) => (
                  <TableRow
                    key={emp.employeeId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedEmployee(emp.employeeId)}
                  >
                    <TableCell className="font-medium">{emp.name || "N/A"}</TableCell>
                    <TableCell>
                      {emp.isSaudi ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Saudi</Badge>
                      ) : (
                        <Badge variant="outline">Non-Saudi</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(emp.baseSalary)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(emp.housingAllowance + emp.transportAllowance)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(emp.grossSalary)}</TableCell>
                    <TableCell className="text-right font-mono text-blue-600">{formatCurrency(emp.gosiEmployer)}</TableCell>
                    <TableCell className="text-right font-mono text-amber-600">{formatCurrency(emp.gosiEmployee)}</TableCell>
                    <TableCell className="text-right font-mono font-bold">{formatCurrency(emp.netPay)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pay Slip Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Pay Slip - {paySlip?.name || "Loading..."}
            </DialogTitle>
          </DialogHeader>
          {paySlip && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Department</div>
                <div className="font-medium">{paySlip.department}</div>
                <div className="text-muted-foreground">Level</div>
                <div className="font-medium">{paySlip.level}</div>
                <div className="text-muted-foreground">Period</div>
                <div className="font-medium">{monthNames[paySlip.month]} {paySlip.year}</div>
                <div className="text-muted-foreground">Nationality</div>
                <div className="font-medium">{paySlip.isSaudi ? "Saudi" : "Non-Saudi"}</div>
              </div>

              <div className="border-t pt-3">
                <h4 className="text-sm font-semibold mb-2 text-emerald-700 dark:text-emerald-400">Earnings</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Base Salary</span><span className="font-mono">{formatCurrency(paySlip.earnings.baseSalary)}</span></div>
                  <div className="flex justify-between"><span>Housing Allowance (25%)</span><span className="font-mono">{formatCurrency(paySlip.earnings.housingAllowance)}</span></div>
                  <div className="flex justify-between"><span>Transport Allowance (10%)</span><span className="font-mono">{formatCurrency(paySlip.earnings.transportAllowance)}</span></div>
                  <div className="flex justify-between font-semibold border-t pt-1"><span>Total Earnings</span><span className="font-mono">{formatCurrency(paySlip.earnings.totalEarnings)}</span></div>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="text-sm font-semibold mb-2 text-red-700 dark:text-red-400">Deductions</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>GOSI Employee</span><span className="font-mono">{formatCurrency(paySlip.deductions.gosiEmployee)}</span></div>
                  <div className="flex justify-between font-semibold border-t pt-1"><span>Total Deductions</span><span className="font-mono">{formatCurrency(paySlip.deductions.totalDeductions)}</span></div>
                </div>
              </div>

              <div className="border-t pt-3 bg-muted/50 p-3 rounded-lg">
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Pay</span>
                  <span className="text-emerald-600">{formatCurrency(paySlip.netPay)}</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400">Employer Costs (not deducted)</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>GOSI Employer</span><span className="font-mono">{formatCurrency(paySlip.employerCosts.gosiEmployer)}</span></div>
                </div>
              </div>

              <div className="border-t pt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">End of Service</h4>
                  <p className="text-muted-foreground">{paySlip.endOfService.yearsOfService} years</p>
                  <p className="font-mono">{formatCurrency(paySlip.endOfService.payableBenefit)}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Annual Leave</h4>
                  <p className="text-muted-foreground">{paySlip.vacation.description}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Main Page ----
export default function HRPayroll() {
  const { data: empData } = useQuery<{ employees: Employee[]; total: number }>({
    queryKey: ["/api/hr/employees"],
  });

  const { data: payrollData } = useQuery<PayrollSummary>({
    queryKey: ["/api/hr/payroll/summary"],
  });

  const { data: leaveData } = useQuery<{ pending: number }>({
    queryKey: ["/api/hr/leave-requests"],
  });

  const metrics = [
    {
      label: "Total Employees",
      value: empData?.total || 0,
      icon: Users,
      color: "primary",
    },
    {
      label: "Monthly Payroll",
      value: formatCurrency(payrollData?.totalGrossSalary || 0),
      icon: DollarSign,
      color: "secondary",
    },
    {
      label: "GOSI Contributions",
      value: formatCurrency((payrollData?.totalGosiEmployer || 0) + (payrollData?.totalGosiEmployee || 0)),
      icon: Shield,
      color: "tertiary",
    },
    {
      label: "Pending Leaves",
      value: leaveData?.pending || 0,
      icon: CalendarDays,
      color: "primary",
    },
  ];

  return (
    <DashboardPage
      title="HR & Payroll"
      description="Manage employees, attendance, leave, and payroll with Saudi compliance (GOSI)"
      icon={Briefcase}
      metrics={metrics}
    >
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="leave" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Leave Management
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Payroll
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <EmployeesTab />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceTab />
        </TabsContent>

        <TabsContent value="leave">
          <LeaveTab />
        </TabsContent>

        <TabsContent value="payroll">
          <PayrollTab />
        </TabsContent>
      </Tabs>
    </DashboardPage>
  );
}
