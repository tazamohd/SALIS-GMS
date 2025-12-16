import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, Calendar, DollarSign, Star, GraduationCap, Plus, Play, Pause, StopCircle, 
  Users, UserPlus, Briefcase, Building2, FileText, Gift, Target, Megaphone,
  CalendarDays, ClipboardCheck, TrendingUp, Mail, Phone, MapPin, ChevronRight,
  Search, Filter, MoreVertical, Eye, Edit, Trash2, CheckCircle, XCircle, 
  AlertCircle, Clock4, Send, MessageSquare
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { TabsPageLayout, TabConfig } from "@/components/layouts";

// Mock data for demonstration
const mockEmployees = [
  { id: "1", employeeNumber: "EMP001", firstName: "Mohammed", lastName: "Al-Rashid", email: "m.alrashid@salisauto.com", phone: "+966 55 123 4567", department: "Service", position: "Senior Technician", status: "active", hireDate: "2021-03-15", avatar: null },
  { id: "2", employeeNumber: "EMP002", firstName: "Ahmed", lastName: "Hassan", email: "a.hassan@salisauto.com", phone: "+966 55 234 5678", department: "Service", position: "Technician", status: "active", hireDate: "2022-06-01", avatar: null },
  { id: "3", employeeNumber: "EMP003", firstName: "Fatima", lastName: "Abdullah", email: "f.abdullah@salisauto.com", phone: "+966 55 345 6789", department: "Administration", position: "HR Manager", status: "active", hireDate: "2020-01-10", avatar: null },
  { id: "4", employeeNumber: "EMP004", firstName: "Omar", lastName: "Khalid", email: "o.khalid@salisauto.com", phone: "+966 55 456 7890", department: "Parts", position: "Parts Specialist", status: "on_leave", hireDate: "2022-09-20", avatar: null },
  { id: "5", employeeNumber: "EMP005", firstName: "Sara", lastName: "Ibrahim", email: "s.ibrahim@salisauto.com", phone: "+966 55 567 8901", department: "Finance", position: "Accountant", status: "active", hireDate: "2021-08-15", avatar: null },
];

const mockDepartments = [
  { id: "1", name: "Service", nameAr: "الخدمة", code: "SVC", employeeCount: 15, manager: "Mohammed Al-Rashid", budget: 250000 },
  { id: "2", name: "Parts", nameAr: "القطع", code: "PRT", employeeCount: 8, manager: "Omar Khalid", budget: 150000 },
  { id: "3", name: "Finance", nameAr: "المالية", code: "FIN", employeeCount: 5, manager: "Sara Ibrahim", budget: 100000 },
  { id: "4", name: "Administration", nameAr: "الإدارة", code: "ADM", employeeCount: 6, manager: "Fatima Abdullah", budget: 120000 },
  { id: "5", name: "Marketing", nameAr: "التسويق", code: "MKT", employeeCount: 4, manager: "Khalid Ahmed", budget: 80000 },
];

const mockLeaveTypes = [
  { id: "1", name: "Annual Leave", nameAr: "إجازة سنوية", defaultDays: 21, color: "#22c55e", isPaid: true },
  { id: "2", name: "Sick Leave", nameAr: "إجازة مرضية", defaultDays: 15, color: "#ef4444", isPaid: true },
  { id: "3", name: "Emergency Leave", nameAr: "إجازة طارئة", defaultDays: 5, color: "#f97316", isPaid: true },
  { id: "4", name: "Unpaid Leave", nameAr: "إجازة بدون راتب", defaultDays: 30, color: "#6b7280", isPaid: false },
  { id: "5", name: "Hajj Leave", nameAr: "إجازة حج", defaultDays: 15, color: "#8b5cf6", isPaid: true },
];

const mockLeaveRequests = [
  { id: "1", employee: "Ahmed Hassan", type: "Annual Leave", startDate: "2024-12-20", endDate: "2024-12-27", days: 5, status: "pending", reason: "Family vacation" },
  { id: "2", employee: "Omar Khalid", type: "Sick Leave", startDate: "2024-12-15", endDate: "2024-12-17", days: 2, status: "approved", reason: "Medical appointment" },
  { id: "3", employee: "Sara Ibrahim", type: "Emergency Leave", startDate: "2024-12-18", endDate: "2024-12-19", days: 1, status: "approved", reason: "Family emergency" },
  { id: "4", employee: "Mohammed Al-Rashid", type: "Annual Leave", startDate: "2025-01-05", endDate: "2025-01-12", days: 5, status: "pending", reason: "Personal travel" },
];

const mockJobPostings = [
  { id: "1", title: "Senior Automotive Technician", department: "Service", location: "Riyadh", type: "full_time", status: "open", applicants: 12, posted: "2024-11-20", salary: "8,000 - 12,000 SAR" },
  { id: "2", title: "Parts Inventory Specialist", department: "Parts", location: "Riyadh", type: "full_time", status: "open", applicants: 8, posted: "2024-12-01", salary: "5,000 - 7,000 SAR" },
  { id: "3", title: "Customer Service Representative", department: "Administration", location: "Riyadh", type: "full_time", status: "on_hold", applicants: 25, posted: "2024-11-15", salary: "4,500 - 6,000 SAR" },
];

const mockCandidates = [
  { id: "1", name: "Faisal Al-Qahtani", position: "Senior Automotive Technician", stage: "interview", rating: 4, email: "faisal@email.com", phone: "+966 50 111 2222", experience: "8 years" },
  { id: "2", name: "Nora Al-Saud", position: "Parts Inventory Specialist", stage: "screening", rating: 3, email: "nora@email.com", phone: "+966 50 333 4444", experience: "3 years" },
  { id: "3", name: "Tariq Hassan", position: "Senior Automotive Technician", stage: "offer", rating: 5, email: "tariq@email.com", phone: "+966 50 555 6666", experience: "10 years" },
  { id: "4", name: "Layla Ahmed", position: "Customer Service Representative", stage: "applied", rating: 0, email: "layla@email.com", phone: "+966 50 777 8888", experience: "2 years" },
];

const mockBenefitPlans = [
  { id: "1", name: "Medical Insurance - Premium", type: "health_insurance", provider: "Tawuniya", coverage: "Family", cost: "1,200 SAR/month", enrolled: 28 },
  { id: "2", name: "Medical Insurance - Basic", type: "health_insurance", provider: "Bupa Arabia", coverage: "Employee Only", cost: "600 SAR/month", enrolled: 15 },
  { id: "3", name: "Housing Allowance", type: "housing", provider: "Internal", coverage: "All Employees", cost: "2,000 SAR/month", enrolled: 38 },
  { id: "4", name: "Transportation Allowance", type: "transportation", provider: "Internal", coverage: "All Employees", cost: "500 SAR/month", enrolled: 40 },
];

const mockAnnouncements = [
  { id: "1", title: "Eid Al-Fitr Holiday Schedule", type: "holiday", priority: "high", date: "2024-12-10", content: "The office will be closed from March 29 to April 5 for Eid Al-Fitr celebrations." },
  { id: "2", title: "New Health Insurance Provider", type: "policy", priority: "normal", date: "2024-12-08", content: "Starting January 1st, our health insurance will be provided by Bupa Arabia." },
  { id: "3", title: "End of Year Party", type: "event", priority: "normal", date: "2024-12-05", content: "Join us for the annual end of year celebration on December 28th at 6 PM." },
];

const mockSelfServiceRequests = [
  { id: "1", employee: "Ahmed Hassan", type: "salary_certificate", subject: "Salary Certificate for Bank", status: "completed", date: "2024-12-10" },
  { id: "2", employee: "Sara Ibrahim", type: "experience_letter", subject: "Experience Letter Request", status: "in_progress", date: "2024-12-12" },
  { id: "3", employee: "Omar Khalid", type: "info_update", subject: "Update Bank Account Details", status: "pending", date: "2024-12-14" },
];

export default function HRManagement() {
  const { user } = useAuth();
  const garageId = user?.garageId || 'default';

  const tabs: TabConfig[] = [
    { id: 'employees', label: 'Employees', icon: Users, content: <EmployeesTab garageId={garageId} /> },
    { id: 'attendance', label: 'Attendance', icon: Clock, content: <AttendanceTab garageId={garageId} /> },
    { id: 'leave', label: 'Leave', icon: CalendarDays, content: <LeaveManagementTab garageId={garageId} /> },
    { id: 'payroll', label: 'Payroll', icon: DollarSign, content: <PayrollTab garageId={garageId} /> },
    { id: 'performance', label: 'Performance', icon: Target, content: <PerformanceTab garageId={garageId} /> },
    { id: 'training', label: 'Training', icon: GraduationCap, content: <TrainingTab garageId={garageId} /> },
    { id: 'recruitment', label: 'Recruitment', icon: UserPlus, content: <RecruitmentTab garageId={garageId} /> },
    { id: 'benefits', label: 'Benefits', icon: Gift, content: <BenefitsTab garageId={garageId} /> },
    { id: 'organization', label: 'Organization', icon: Building2, content: <OrganizationTab garageId={garageId} /> },
    { id: 'self-service', label: 'Self-Service', icon: ClipboardCheck, content: <SelfServiceTab garageId={garageId} /> },
  ];

  return (
    <TabsPageLayout
      title="Human Resources"
      description="Complete HR management: employees, attendance, leave, payroll, recruitment, benefits, and more"
      icon={Users}
      tabs={tabs}
      defaultTab="employees"
    />
  );
}

function EmployeesTab({ garageId }: { garageId: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredEmployees = mockEmployees.filter(emp => {
    const matchesSearch = `${emp.firstName} ${emp.lastName} ${emp.email}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === "all" || emp.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "on_leave": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "suspended": return "bg-red-500/10 text-red-600 dark:text-red-400";
      default: return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-total-employees">43</p>
                <p className="text-sm text-muted-foreground">Total Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-active-employees">38</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock4 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-on-leave">3</p>
                <p className="text-sm text-muted-foreground">On Leave</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <UserPlus className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-new-hires">2</p>
                <p className="text-sm text-muted-foreground">New This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>Manage all employees in your organization</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-employee">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>Enter the employee details to add them to the system</DialogDescription>
                </DialogHeader>
                <EmployeeForm onSuccess={() => setShowAddDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-employees"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]" data-testid="select-department-filter">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {mockDepartments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.id} data-testid={`employee-row-${emp.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={emp.avatar || undefined} />
                          <AvatarFallback className="text-xs">
                            {emp.firstName[0]}{emp.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                          <div className="text-sm text-muted-foreground">{emp.employeeNumber}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>{emp.position}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(emp.status)} variant="secondary">
                        {emp.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(emp.hireDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" data-testid={`button-view-${emp.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" data-testid={`button-edit-${emp.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmployeeForm({ onSuccess }: { onSuccess: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="firstName">First Name</Label>
        <Input id="firstName" placeholder="Enter first name" data-testid="input-first-name" />
      </div>
      <div>
        <Label htmlFor="lastName">Last Name</Label>
        <Input id="lastName" placeholder="Enter last name" data-testid="input-last-name" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="email@example.com" data-testid="input-email" />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" placeholder="+966 5X XXX XXXX" data-testid="input-phone" />
      </div>
      <div>
        <Label htmlFor="department">Department</Label>
        <Select>
          <SelectTrigger data-testid="select-department">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {mockDepartments.map(dept => (
              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="position">Position</Label>
        <Input id="position" placeholder="Job title" data-testid="input-position" />
      </div>
      <div>
        <Label htmlFor="hireDate">Hire Date</Label>
        <Input id="hireDate" type="date" data-testid="input-hire-date" />
      </div>
      <div>
        <Label htmlFor="salary">Base Salary (SAR)</Label>
        <Input id="salary" type="number" placeholder="0.00" data-testid="input-salary" />
      </div>
      <div className="col-span-2">
        <Button className="w-full" onClick={onSuccess} data-testid="button-submit-employee">
          Add Employee
        </Button>
      </div>
    </div>
  );
}

function AttendanceTab({ garageId }: { garageId: string }) {
  const { user } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);

  const mockAttendance = [
    { id: "1", employee: "Mohammed Al-Rashid", date: "2024-12-15", clockIn: "08:00 AM", clockOut: "05:30 PM", totalHours: "8.5", status: "present" },
    { id: "2", employee: "Ahmed Hassan", date: "2024-12-15", clockIn: "08:15 AM", clockOut: "05:00 PM", totalHours: "7.75", status: "present" },
    { id: "3", employee: "Omar Khalid", date: "2024-12-15", clockIn: "-", clockOut: "-", totalHours: "-", status: "absent" },
    { id: "4", employee: "Sara Ibrahim", date: "2024-12-15", clockIn: "09:00 AM", clockOut: "-", totalHours: "-", status: "present" },
    { id: "5", employee: "Fatima Abdullah", date: "2024-12-15", clockIn: "07:45 AM", clockOut: "04:45 PM", totalHours: "8", status: "present" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-present-today">35</p>
                <p className="text-sm text-muted-foreground">Present Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-absent-today">5</p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock4 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-late-today">3</p>
                <p className="text-sm text-muted-foreground">Late Arrivals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-on-leave-today">3</p>
                <p className="text-sm text-muted-foreground">On Leave</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your attendance</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {!isClockedIn ? (
            <Button onClick={() => setIsClockedIn(true)} data-testid="button-clock-in">
              <Play className="h-4 w-4 mr-2" />
              Clock In
            </Button>
          ) : (
            <>
              <Button onClick={() => setIsClockedIn(false)} variant="destructive" data-testid="button-clock-out">
                <StopCircle className="h-4 w-4 mr-2" />
                Clock Out
              </Button>
              {!isOnBreak ? (
                <Button onClick={() => setIsOnBreak(true)} variant="outline" data-testid="button-start-break">
                  <Pause className="h-4 w-4 mr-2" />
                  Start Break
                </Button>
              ) : (
                <Button onClick={() => setIsOnBreak(false)} variant="outline" data-testid="button-end-break">
                  <Play className="h-4 w-4 mr-2" />
                  End Break
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Today's attendance summary</CardDescription>
            </div>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-[200px]" data-testid="select-employee-filter">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {mockEmployees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAttendance.map((record) => (
                <TableRow key={record.id} data-testid={`attendance-row-${record.id}`}>
                  <TableCell className="font-medium">{record.employee}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.clockIn}</TableCell>
                  <TableCell>{record.clockOut}</TableCell>
                  <TableCell>{record.totalHours}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === "present" ? "default" : "destructive"}>
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function LeaveManagementTab({ garageId }: { garageId: string }) {
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending": return <Clock4 className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CalendarDays className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-available-leave">14</p>
                <p className="text-sm text-muted-foreground">Days Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock4 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-pending-requests">4</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-approved-leaves">12</p>
                <p className="text-sm text-muted-foreground">Approved This Year</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-on-leave-now">3</p>
                <p className="text-sm text-muted-foreground">Currently On Leave</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Leave Requests</CardTitle>
                <CardDescription>Manage employee leave requests</CardDescription>
              </div>
              <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-request-leave">
                    <Plus className="h-4 w-4 mr-2" />
                    Request Leave
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Leave</DialogTitle>
                    <DialogDescription>Submit a new leave request</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Leave Type</Label>
                      <Select>
                        <SelectTrigger data-testid="select-leave-type">
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockLeaveTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date</Label>
                        <Input type="date" data-testid="input-start-date" />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input type="date" data-testid="input-end-date" />
                      </div>
                    </div>
                    <div>
                      <Label>Reason</Label>
                      <Textarea placeholder="Enter reason for leave" data-testid="input-reason" />
                    </div>
                    <Button className="w-full" onClick={() => setShowRequestDialog(false)} data-testid="button-submit-leave">
                      Submit Request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLeaveRequests.map((request) => (
                  <TableRow key={request.id} data-testid={`leave-request-${request.id}`}>
                    <TableCell className="font-medium">{request.employee}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>{request.startDate} - {request.endDate}</TableCell>
                    <TableCell>{request.days}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className="capitalize">{request.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="text-green-600" data-testid={`button-approve-${request.id}`}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600" data-testid={`button-reject-${request.id}`}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Types</CardTitle>
            <CardDescription>Available leave categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockLeaveTypes.map(type => (
              <div key={type.id} className="flex items-center justify-between p-3 rounded-lg border" data-testid={`leave-type-${type.id}`}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                  <div>
                    <div className="font-medium">{type.name}</div>
                    <div className="text-sm text-muted-foreground">{type.nameAr}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{type.defaultDays} days</div>
                  <Badge variant={type.isPaid ? "default" : "secondary"} className="text-xs">
                    {type.isPaid ? "Paid" : "Unpaid"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PayrollTab({ garageId }: { garageId: string }) {
  const mockPayrollData = [
    { id: "1", employee: "Mohammed Al-Rashid", baseSalary: 12000, allowances: 2500, deductions: 1200, netSalary: 13300, status: "processed" },
    { id: "2", employee: "Ahmed Hassan", baseSalary: 8000, allowances: 1500, deductions: 800, netSalary: 8700, status: "processed" },
    { id: "3", employee: "Fatima Abdullah", baseSalary: 15000, allowances: 3000, deductions: 1500, netSalary: 16500, status: "pending" },
    { id: "4", employee: "Omar Khalid", baseSalary: 7000, allowances: 1200, deductions: 700, netSalary: 7500, status: "processed" },
    { id: "5", employee: "Sara Ibrahim", baseSalary: 10000, allowances: 2000, deductions: 1000, netSalary: 11000, status: "pending" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-total-payroll">520,000</p>
                <p className="text-sm text-muted-foreground">Total Payroll (SAR)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-avg-salary">12,093</p>
                <p className="text-sm text-muted-foreground">Average Salary (SAR)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock4 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-pending-payroll">8</p>
                <p className="text-sm text-muted-foreground">Pending Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-processed-payroll">35</p>
                <p className="text-sm text-muted-foreground">Processed This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>December 2024 Payroll</CardTitle>
              <CardDescription>Monthly salary processing</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" data-testid="button-export-payroll">
                <FileText className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button data-testid="button-run-payroll">
                <DollarSign className="h-4 w-4 mr-2" />
                Run Payroll
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Base Salary</TableHead>
                <TableHead className="text-right">Allowances</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPayrollData.map((row) => (
                <TableRow key={row.id} data-testid={`payroll-row-${row.id}`}>
                  <TableCell className="font-medium">{row.employee}</TableCell>
                  <TableCell className="text-right">{row.baseSalary.toLocaleString()} SAR</TableCell>
                  <TableCell className="text-right text-green-600">+{row.allowances.toLocaleString()} SAR</TableCell>
                  <TableCell className="text-right text-red-600">-{row.deductions.toLocaleString()} SAR</TableCell>
                  <TableCell className="text-right font-bold">{row.netSalary.toLocaleString()} SAR</TableCell>
                  <TableCell>
                    <Badge variant={row.status === "processed" ? "default" : "secondary"}>
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function PerformanceTab({ garageId }: { garageId: string }) {
  const mockReviews = [
    { id: "1", employee: "Mohammed Al-Rashid", period: "Q4 2024", rating: 4.5, status: "completed", reviewer: "Fatima Abdullah" },
    { id: "2", employee: "Ahmed Hassan", period: "Q4 2024", rating: 4.0, status: "in_progress", reviewer: "Mohammed Al-Rashid" },
    { id: "3", employee: "Omar Khalid", period: "Q4 2024", rating: 3.5, status: "pending", reviewer: "Mohammed Al-Rashid" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-avg-rating">4.2</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-completed-reviews">28</p>
                <p className="text-sm text-muted-foreground">Completed Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock4 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-pending-reviews">15</p>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-top-performers">5</p>
                <p className="text-sm text-muted-foreground">Top Performers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Performance Reviews</CardTitle>
              <CardDescription>Q4 2024 review cycle</CardDescription>
            </div>
            <Button data-testid="button-start-review">
              <Plus className="h-4 w-4 mr-2" />
              Start Review
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockReviews.map((review) => (
              <Card key={review.id} data-testid={`review-card-${review.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{review.employee}</CardTitle>
                      <CardDescription>{review.period}</CardDescription>
                    </div>
                    <Badge variant={review.status === "completed" ? "default" : "secondary"}>
                      {review.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    <span className="text-2xl font-bold">{review.rating}</span>
                    <span className="text-muted-foreground">/5.0</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Reviewed by: {review.reviewer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrainingTab({ garageId }: { garageId: string }) {
  const mockTrainings = [
    { id: "1", name: "Advanced Diagnostics", provider: "Bosch Academy", duration: "40 hours", type: "Technical", enrolled: 8, status: "active" },
    { id: "2", name: "Customer Service Excellence", provider: "Internal", duration: "16 hours", type: "Soft Skills", enrolled: 15, status: "active" },
    { id: "3", name: "EV Maintenance Basics", provider: "Tesla Training", duration: "24 hours", type: "Technical", enrolled: 5, status: "upcoming" },
    { id: "4", name: "Safety Protocols", provider: "OSHA", duration: "8 hours", type: "Compliance", enrolled: 43, status: "completed" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-active-programs">12</p>
                <p className="text-sm text-muted-foreground">Active Programs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-enrolled">71</p>
                <p className="text-sm text-muted-foreground">Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-certifications">156</p>
                <p className="text-sm text-muted-foreground">Certifications Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock4 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-training-hours">2,450</p>
                <p className="text-sm text-muted-foreground">Hours This Year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Training Programs</CardTitle>
              <CardDescription>Available courses and certifications</CardDescription>
            </div>
            <Button data-testid="button-add-training">
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {mockTrainings.map((training) => (
              <Card key={training.id} data-testid={`training-card-${training.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{training.name}</CardTitle>
                      <CardDescription>{training.provider}</CardDescription>
                    </div>
                    <Badge variant={training.status === "active" ? "default" : training.status === "upcoming" ? "secondary" : "outline"}>
                      {training.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration: {training.duration}</span>
                    <span className="text-muted-foreground">{training.enrolled} enrolled</span>
                  </div>
                  <Badge variant="outline" className="mt-2">{training.type}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RecruitmentTab({ garageId }: { garageId: string }) {
  const [showPostDialog, setShowPostDialog] = useState(false);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "applied": return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
      case "screening": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "interview": return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "offer": return "bg-green-500/10 text-green-600 dark:text-green-400";
      default: return "bg-gray-500/10";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-open-positions">5</p>
                <p className="text-sm text-muted-foreground">Open Positions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-total-applicants">45</p>
                <p className="text-sm text-muted-foreground">Total Applicants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-interviews-scheduled">8</p>
                <p className="text-sm text-muted-foreground">Interviews Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-hired-this-month">2</p>
                <p className="text-sm text-muted-foreground">Hired This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Job Postings</CardTitle>
                <CardDescription>Active job openings</CardDescription>
              </div>
              <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-posting">
                    <Plus className="h-4 w-4 mr-2" />
                    New Posting
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Job Posting</DialogTitle>
                    <DialogDescription>Add a new job opening</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Job Title</Label>
                      <Input placeholder="e.g., Senior Technician" data-testid="input-job-title" />
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Select>
                        <SelectTrigger data-testid="select-job-department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockDepartments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Min Salary (SAR)</Label>
                        <Input type="number" placeholder="5000" data-testid="input-min-salary" />
                      </div>
                      <div>
                        <Label>Max Salary (SAR)</Label>
                        <Input type="number" placeholder="10000" data-testid="input-max-salary" />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea placeholder="Job description..." data-testid="input-job-description" />
                    </div>
                    <Button className="w-full" onClick={() => setShowPostDialog(false)} data-testid="button-submit-posting">
                      Create Posting
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockJobPostings.map((job) => (
              <div key={job.id} className="p-4 rounded-lg border" data-testid={`job-posting-${job.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-muted-foreground">{job.department} · {job.location}</p>
                  </div>
                  <Badge variant={job.status === "open" ? "default" : "secondary"}>
                    {job.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{job.salary}</span>
                  <span>{job.applicants} applicants</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Candidate Pipeline</CardTitle>
            <CardDescription>Track applicants through hiring stages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockCandidates.map((candidate) => (
              <div key={candidate.id} className="p-4 rounded-lg border" data-testid={`candidate-${candidate.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{candidate.name}</h4>
                    <p className="text-sm text-muted-foreground">{candidate.position}</p>
                  </div>
                  <Badge className={getStageColor(candidate.stage)} variant="secondary">
                    {candidate.stage}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{candidate.experience}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${star <= candidate.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BenefitsTab({ garageId }: { garageId: string }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Gift className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-benefit-plans">8</p>
                <p className="text-sm text-muted-foreground">Benefit Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-enrolled-benefits">121</p>
                <p className="text-sm text-muted-foreground">Total Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-monthly-cost">85,000</p>
                <p className="text-sm text-muted-foreground">Monthly Cost (SAR)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Benefit Plans</CardTitle>
              <CardDescription>Available employee benefits</CardDescription>
            </div>
            <Button data-testid="button-add-benefit">
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {mockBenefitPlans.map((plan) => (
              <Card key={plan.id} data-testid={`benefit-plan-${plan.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      <CardDescription>{plan.provider}</CardDescription>
                    </div>
                    <Badge variant="outline">{plan.type.replace("_", " ")}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coverage:</span>
                      <span>{plan.coverage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost:</span>
                      <span>{plan.cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enrolled:</span>
                      <span>{plan.enrolled} employees</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrganizationTab({ garageId }: { garageId: string }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-departments">5</p>
                <p className="text-sm text-muted-foreground">Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-positions">18</p>
                <p className="text-sm text-muted-foreground">Positions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-total-headcount">43</p>
                <p className="text-sm text-muted-foreground">Total Headcount</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Departments</CardTitle>
              <CardDescription>Organizational structure</CardDescription>
            </div>
            <Button data-testid="button-add-department">
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockDepartments.map((dept) => (
              <Card key={dept.id} data-testid={`department-${dept.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{dept.name}</CardTitle>
                      <CardDescription>{dept.nameAr}</CardDescription>
                    </div>
                    <Badge variant="outline">{dept.code}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Manager:</span>
                      <span>{dept.manager}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employees:</span>
                      <span>{dept.employeeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget:</span>
                      <span>{dept.budget.toLocaleString()} SAR</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>Company-wide announcements and updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockAnnouncements.map((announcement) => (
            <div key={announcement.id} className="p-4 rounded-lg border" data-testid={`announcement-${announcement.id}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium">{announcement.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={announcement.priority === "high" ? "destructive" : "secondary"}>
                    {announcement.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{announcement.date}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{announcement.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SelfServiceTab({ garageId }: { garageId: string }) {
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const requestTypes = [
    { value: "salary_certificate", label: "Salary Certificate" },
    { value: "experience_letter", label: "Experience Letter" },
    { value: "bank_letter", label: "Bank Letter" },
    { value: "noc", label: "NOC (No Objection Certificate)" },
    { value: "info_update", label: "Information Update" },
    { value: "expense_claim", label: "Expense Claim" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "in_progress": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "pending": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "rejected": return "bg-red-500/10 text-red-600 dark:text-red-400";
      default: return "bg-gray-500/10";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-my-requests">12</p>
                <p className="text-sm text-muted-foreground">My Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock4 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-pending-self-service">3</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-completed-requests">8</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <CalendarDays className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-leave-balance">14</p>
                <p className="text-sm text-muted-foreground">Leave Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>My Requests</CardTitle>
                <CardDescription>Track your HR requests</CardDescription>
              </div>
              <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-request">
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit Request</DialogTitle>
                    <DialogDescription>Create a new HR request</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Request Type</Label>
                      <Select>
                        <SelectTrigger data-testid="select-request-type">
                          <SelectValue placeholder="Select request type" />
                        </SelectTrigger>
                        <SelectContent>
                          {requestTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Subject</Label>
                      <Input placeholder="Brief subject" data-testid="input-request-subject" />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea placeholder="Provide details..." data-testid="input-request-description" />
                    </div>
                    <Button className="w-full" onClick={() => setShowRequestDialog(false)} data-testid="button-submit-request">
                      Submit Request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSelfServiceRequests.map((request) => (
                  <TableRow key={request.id} data-testid={`self-service-request-${request.id}`}>
                    <TableCell className="capitalize">{request.type.replace("_", " ")}</TableCell>
                    <TableCell>{request.subject}</TableCell>
                    <TableCell>{request.date}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)} variant="secondary">
                        {request.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common HR tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { icon: FileText, label: "Request Salary Certificate", testId: "button-salary-cert" },
              { icon: CalendarDays, label: "Apply for Leave", testId: "button-apply-leave" },
              { icon: Edit, label: "Update Personal Info", testId: "button-update-info" },
              { icon: DollarSign, label: "Submit Expense Claim", testId: "button-expense-claim" },
              { icon: MessageSquare, label: "Contact HR", testId: "button-contact-hr" },
            ].map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start"
                data-testid={action.testId}
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
