import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Clock, Calendar, DollarSign, Star, GraduationCap, Plus, Play, Pause, StopCircle, 
  Users, UserPlus, Briefcase, Building2, FileText, Gift, Target, Megaphone,
  CalendarDays, ClipboardCheck, TrendingUp,
  Search, Eye, Edit, CheckCircle, XCircle, Clock4
} from "lucide-react";
import { format } from "date-fns";
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
  { id: "1", name: "Annual Leave", nameAr: "إجازة سنوية", defaultDays: 21, color: "#0A5ED7", isPaid: true },
  { id: "2", name: "Sick Leave", nameAr: "إجازة مرضية", defaultDays: 15, color: "#F97316", isPaid: true },
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

const mockTrainings = [
  { id: "1", name: "Advanced Engine Diagnostics", provider: "Toyota Academy", duration: "3 days", type: "Technical", enrolled: 8, status: "active" },
  { id: "2", name: "Customer Service Excellence", provider: "Internal Training", duration: "1 day", type: "Soft Skills", enrolled: 15, status: "active" },
  { id: "3", name: "Safety and Compliance", provider: "OSHA Certified", duration: "2 days", type: "Compliance", enrolled: 25, status: "upcoming" },
];

export default function HRManagement() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const garageId = user?.garageId || 'default';

  const tabs: TabConfig[] = [
    { id: 'employees', label: t('hr.employees', 'Employees'), icon: Users, content: <EmployeesTab garageId={garageId} /> },
    { id: 'attendance', label: t('hr.attendance', 'Attendance'), icon: Clock, content: <AttendanceTab garageId={garageId} /> },
    { id: 'leave', label: t('hr.leave', 'Leave'), icon: CalendarDays, content: <LeaveManagementTab garageId={garageId} /> },
    { id: 'payroll', label: t('hr.payroll', 'Payroll'), icon: DollarSign, content: <PayrollTab garageId={garageId} /> },
    { id: 'performance', label: t('hr.performance', 'Performance'), icon: Target, content: <PerformanceTab garageId={garageId} /> },
    { id: 'training', label: t('hr.training', 'Training'), icon: GraduationCap, content: <TrainingTab garageId={garageId} /> },
    { id: 'recruitment', label: t('hr.recruitment', 'Recruitment'), icon: UserPlus, content: <RecruitmentTab garageId={garageId} /> },
    { id: 'benefits', label: t('hr.benefits', 'Benefits'), icon: Gift, content: <BenefitsTab garageId={garageId} /> },
    { id: 'organization', label: t('hr.organization', 'Organization'), icon: Building2, content: <OrganizationTab garageId={garageId} /> },
    { id: 'self-service', label: t('hr.selfService', 'Self-Service'), icon: ClipboardCheck, content: <SelfServiceTab garageId={garageId} /> },
  ];

  return (
    <TabsPageLayout
      title={t('hr.title', 'Human Resources')}
      description={t('hr.description', 'Complete HR management: employees, attendance, leave, payroll, recruitment, benefits, and more')}
      icon={Users}
      tabs={tabs}
      defaultTab="employees"
    />
  );
}

function EmployeesTab({ garageId: _garageId }: { garageId: string }) {
  const { t } = useTranslation();
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
      case "on_leave": return "bg-[#F97316]/10 text-[#F97316] dark:text-[#F97316]";
      case "suspended": return "bg-red-500/10 text-red-600 dark:text-red-400";
      default: return "bg-[#64748B]/10 text-[#64748B]";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#0A5ED7]/10">
                <Users className="h-5 w-5 text-[#0A5ED7]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-total-employees">43</p>
                <p className="text-sm text-[#64748B]">{t('hr.totalEmployees', 'Total Employees')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-active-employees">38</p>
                <p className="text-sm text-[#64748B]">{t('common.active', 'Active')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#F97316]/10">
                <Clock4 className="h-5 w-5 text-[#F97316]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-on-leave">3</p>
                <p className="text-sm text-[#64748B]">{t('hr.onLeave', 'On Leave')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#0BB3FF]/10">
                <UserPlus className="h-5 w-5 text-[#0BB3FF]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-new-hires">2</p>
                <p className="text-sm text-[#64748B]">{t('hr.newThisMonth', 'New This Month')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('hr.employeeDirectory', 'Employee Directory')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('hr.manageAllEmployees', 'Manage all employees in your organization')}</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" data-testid="button-add-employee">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('hr.addEmployee', 'Add Employee')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <DialogHeader>
                  <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('hr.addNewEmployee', 'Add New Employee')}</DialogTitle>
                  <DialogDescription className="text-[#64748B]">{t('hr.enterEmployeeDetails', 'Enter the employee details to add them to the system')}</DialogDescription>
                </DialogHeader>
                <EmployeeForm onSuccess={() => setShowAddDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder={t('hr.searchEmployees', 'Search employees...')}
                className="pl-9 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-employees"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-department-filter">
                <SelectValue placeholder={t('hr.allDepartments', 'All Departments')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('hr.allDepartments', 'All Departments')}</SelectItem>
                {mockDepartments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-[#E2E8F0] dark:border-[#232A36]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                  <TableHead className="text-[#64748B]">{t('hr.employee', 'Employee')}</TableHead>
                  <TableHead className="text-[#64748B]">{t('hr.department', 'Department')}</TableHead>
                  <TableHead className="text-[#64748B]">{t('hr.position', 'Position')}</TableHead>
                  <TableHead className="text-[#64748B]">{t('common.status', 'Status')}</TableHead>
                  <TableHead className="text-[#64748B]">{t('hr.hireDate', 'Hire Date')}</TableHead>
                  <TableHead className="text-right text-[#64748B]">{t('common.actions', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`employee-row-${emp.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={emp.avatar || undefined} />
                          <AvatarFallback className="text-xs bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">
                            {emp.firstName[0]}{emp.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-[#0B1F3B] dark:text-white">{emp.firstName} {emp.lastName}</div>
                          <div className="text-sm text-[#64748B]">{emp.employeeNumber}</div>
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
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="firstName">{t('hr.firstName', 'First Name')}</Label>
        <Input id="firstName" placeholder={t('hr.enterFirstName', 'Enter first name')} data-testid="input-first-name" />
      </div>
      <div>
        <Label htmlFor="lastName">{t('hr.lastName', 'Last Name')}</Label>
        <Input id="lastName" placeholder={t('hr.enterLastName', 'Enter last name')} data-testid="input-last-name" />
      </div>
      <div>
        <Label htmlFor="email">{t('hr.email', 'Email')}</Label>
        <Input id="email" type="email" placeholder="email@example.com" data-testid="input-email" />
      </div>
      <div>
        <Label htmlFor="phone">{t('hr.phone', 'Phone')}</Label>
        <Input id="phone" placeholder="+966 5X XXX XXXX" data-testid="input-phone" />
      </div>
      <div>
        <Label htmlFor="department">{t('hr.department', 'Department')}</Label>
        <Select>
          <SelectTrigger data-testid="select-department">
            <SelectValue placeholder={t('hr.selectDepartment', 'Select department')} />
          </SelectTrigger>
          <SelectContent>
            {mockDepartments.map(dept => (
              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="position">{t('hr.position', 'Position')}</Label>
        <Input id="position" placeholder={t('hr.jobTitle', 'Job title')} data-testid="input-position" />
      </div>
      <div>
        <Label htmlFor="hireDate">{t('hr.hireDate', 'Hire Date')}</Label>
        <Input id="hireDate" type="date" data-testid="input-hire-date" />
      </div>
      <div>
        <Label htmlFor="salary">{t('hr.baseSalary', 'Base Salary (SAR)')}</Label>
        <Input id="salary" type="number" placeholder="0.00" data-testid="input-salary" />
      </div>
      <div className="col-span-2">
        <Button className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" onClick={onSuccess} data-testid="button-submit-employee">
          {t('hr.addEmployee', 'Add Employee')}
        </Button>
      </div>
    </div>
  );
}

function AttendanceTab({ garageId: _garageId }: { garageId: string }) {
  const { t } = useTranslation();
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
                <p className="text-sm text-muted-foreground">{t('hr.presentToday', 'Present Today')}</p>
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
                <p className="text-sm text-muted-foreground">{t('hr.absent', 'Absent')}</p>
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
                <p className="text-sm text-muted-foreground">{t('hr.lateArrivals', 'Late Arrivals')}</p>
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
                <p className="text-sm text-muted-foreground">{t('hr.onLeave', 'On Leave')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('common.quick_actions', 'Quick Actions')}</CardTitle>
          <CardDescription>{t('hr.manageAttendance', 'Manage your attendance')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {!isClockedIn ? (
            <Button onClick={() => setIsClockedIn(true)} data-testid="button-clock-in">
              <Play className="h-4 w-4 mr-2" />
              {t('hr.clockIn', 'Clock In')}
            </Button>
          ) : (
            <>
              <Button onClick={() => setIsClockedIn(false)} variant="destructive" data-testid="button-clock-out">
                <StopCircle className="h-4 w-4 mr-2" />
                {t('hr.clockOut', 'Clock Out')}
              </Button>
              {!isOnBreak ? (
                <Button onClick={() => setIsOnBreak(true)} variant="outline" data-testid="button-start-break">
                  <Pause className="h-4 w-4 mr-2" />
                  {t('hr.startBreak', 'Start Break')}
                </Button>
              ) : (
                <Button onClick={() => setIsOnBreak(false)} variant="outline" data-testid="button-end-break">
                  <Play className="h-4 w-4 mr-2" />
                  {t('hr.endBreak', 'End Break')}
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
              <CardTitle>{t('hr.attendanceRecords', 'Attendance Records')}</CardTitle>
              <CardDescription>{t('hr.todayAttendance', "Today's attendance log")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('hr.employee', 'Employee')}</TableHead>
                  <TableHead>{t('hr.clockIn', 'Clock In')}</TableHead>
                  <TableHead>{t('hr.clockOut', 'Clock Out')}</TableHead>
                  <TableHead>{t('hr.totalHours', 'Total Hours')}</TableHead>
                  <TableHead>{t('common.status', 'Status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employee}</TableCell>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LeaveManagementTab({ garageId: _garageId }: { garageId: string }) {
  const { t } = useTranslation();
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500/10 text-green-600";
      case "pending": return "bg-yellow-500/10 text-yellow-600";
      case "rejected": return "bg-red-500/10 text-red-600";
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
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">18</p>
                <p className="text-sm text-muted-foreground">{t('hr.availableDays', 'Available Days')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock4 className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-muted-foreground">{t('hr.pendingRequests', 'Pending Requests')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">{t('hr.usedThisMonth', 'Used This Month')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">{t('hr.onLeaveToday', 'On Leave Today')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('hr.leaveRequests', 'Leave Requests')}</CardTitle>
              <CardDescription>{t('hr.manageLeaveRequests', 'Manage leave requests and approvals')}</CardDescription>
            </div>
            <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-request-leave">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('hr.requestLeave', 'Request Leave')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('hr.newLeaveRequest', 'New Leave Request')}</DialogTitle>
                  <DialogDescription>{t('hr.submitLeaveRequest', 'Submit a new leave request')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{t('hr.leaveType', 'Leave Type')}</Label>
                    <Select>
                      <SelectTrigger data-testid="select-leave-type">
                        <SelectValue placeholder={t('hr.selectLeaveType', 'Select type')} />
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
                      <Label>{t('hr.startDate', 'Start Date')}</Label>
                      <Input type="date" data-testid="input-leave-start" />
                    </div>
                    <div>
                      <Label>{t('hr.endDate', 'End Date')}</Label>
                      <Input type="date" data-testid="input-leave-end" />
                    </div>
                  </div>
                  <div>
                    <Label>{t('hr.reason', 'Reason')}</Label>
                    <Textarea placeholder={t('hr.enterReason', 'Enter reason for leave...')} data-testid="input-leave-reason" />
                  </div>
                  <Button className="w-full" onClick={() => setShowRequestDialog(false)} data-testid="button-submit-leave">
                    {t('hr.submitRequest', 'Submit Request')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('hr.employee', 'Employee')}</TableHead>
                  <TableHead>{t('common.type', 'Type')}</TableHead>
                  <TableHead>{t('hr.dates', 'Dates')}</TableHead>
                  <TableHead>{t('hr.days', 'Days')}</TableHead>
                  <TableHead>{t('common.status', 'Status')}</TableHead>
                  <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLeaveRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.employee}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>{request.startDate} - {request.endDate}</TableCell>
                    <TableCell>{request.days}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)} variant="secondary">
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-green-600">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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

function PayrollTab({ garageId: _garageId }: { garageId: string }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">285,000</p>
                <p className="text-sm text-muted-foreground">{t('hr.monthlyPayroll', 'Monthly Payroll (SAR)')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">43</p>
                <p className="text-sm text-muted-foreground">{t('hr.activePayroll', 'Active on Payroll')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock4 className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">{t('hr.pendingPayments', 'Pending Payments')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">28th</p>
                <p className="text-sm text-muted-foreground">{t('hr.nextPayday', 'Next Payday')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('hr.payrollSummary', 'Payroll Summary')}</CardTitle>
              <CardDescription>{t('hr.currentMonthPayroll', 'Current month payroll overview')}</CardDescription>
            </div>
            <Button data-testid="button-run-payroll">
              <Play className="h-4 w-4 mr-2" />
              {t('hr.runPayroll', 'Run Payroll')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t('hr.payrollIntegration', 'Payroll data will be displayed here. Connect to your payroll system for live data.')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PerformanceTab({ garageId: _garageId }: { garageId: string }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-sm text-muted-foreground">{t('hr.avgPerformance', 'Avg. Performance')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">{t('hr.goalsSet', 'Goals Set')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">{t('hr.topPerformers', 'Top Performers')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <ClipboardCheck className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">{t('hr.pendingReviews', 'Pending Reviews')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('hr.performanceReviews', 'Performance Reviews')}</CardTitle>
              <CardDescription>{t('hr.employeePerformanceTracking', 'Track employee performance and goals')}</CardDescription>
            </div>
            <Button data-testid="button-create-review">
              <Plus className="h-4 w-4 mr-2" />
              {t('hr.createReview', 'Create Review')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t('hr.performanceData', 'Performance review data will be displayed here.')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrainingTab({ garageId: _garageId }: { garageId: string }) {
  const { t } = useTranslation();
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
                <p className="text-sm text-muted-foreground">{t('hr.activePrograms', 'Active Programs')}</p>
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
                <p className="text-sm text-muted-foreground">{t('hr.enrolled', 'Enrolled')}</p>
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
                <p className="text-sm text-muted-foreground">{t('hr.certificationsEarned', 'Certifications Earned')}</p>
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
                <p className="text-sm text-muted-foreground">{t('hr.hoursThisYear', 'Hours This Year')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('hr.trainingPrograms', 'Training Programs')}</CardTitle>
              <CardDescription>{t('hr.availableCourses', 'Available courses and certifications')}</CardDescription>
            </div>
            <Button data-testid="button-add-training">
              <Plus className="h-4 w-4 mr-2" />
              {t('hr.addProgram', 'Add Program')}
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
                    <span className="text-muted-foreground">{t('hr.duration', 'Duration')}: {training.duration}</span>
                    <span className="text-muted-foreground">{training.enrolled} {t('hr.enrolled', 'enrolled')}</span>
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

function RecruitmentTab({ garageId: _garageId }: { garageId: string }) {
  const { t } = useTranslation();
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
                <p className="text-sm text-muted-foreground">{t('hr.openPositions', 'Open Positions')}</p>
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
                <p className="text-sm text-muted-foreground">{t('hr.totalApplicants', 'Total Applicants')}</p>
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
                <p className="text-sm text-muted-foreground">{t('hr.interviewsScheduled', 'Interviews Scheduled')}</p>
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
                <p className="text-sm text-muted-foreground">{t('hr.hiredThisMonth', 'Hired This Month')}</p>
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
                <CardTitle>{t('hr.jobPostings', 'Job Postings')}</CardTitle>
                <CardDescription>{t('hr.activeJobOpenings', 'Active job openings')}</CardDescription>
              </div>
              <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-posting">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('hr.newPosting', 'New Posting')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('hr.createJobPosting', 'Create Job Posting')}</DialogTitle>
                    <DialogDescription>{t('hr.addNewJobOpening', 'Add a new job opening')}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>{t('hr.jobTitle', 'Job Title')}</Label>
                      <Input placeholder={t('hr.jobTitlePlaceholder', 'e.g., Senior Technician')} data-testid="input-job-title" />
                    </div>
                    <div>
                      <Label>{t('hr.department', 'Department')}</Label>
                      <Select>
                        <SelectTrigger data-testid="select-job-department">
                          <SelectValue placeholder={t('hr.selectDepartment', 'Select department')} />
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
                        <Label>{t('hr.minSalary', 'Min Salary (SAR)')}</Label>
                        <Input type="number" placeholder="5000" data-testid="input-min-salary" />
                      </div>
                      <div>
                        <Label>{t('hr.maxSalary', 'Max Salary (SAR)')}</Label>
                        <Input type="number" placeholder="10000" data-testid="input-max-salary" />
                      </div>
                    </div>
                    <div>
                      <Label>{t('common.description', 'Description')}</Label>
                      <Textarea placeholder={t('hr.jobDescriptionPlaceholder', 'Job description...')} data-testid="input-job-description" />
                    </div>
                    <Button className="w-full" onClick={() => setShowPostDialog(false)} data-testid="button-submit-posting">
                      {t('hr.createPosting', 'Create Posting')}
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
                  <span>{job.applicants} {t('hr.applicants', 'applicants')}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('hr.candidatePipeline', 'Candidate Pipeline')}</CardTitle>
            <CardDescription>{t('hr.trackApplicants', 'Track applicants through hiring stages')}</CardDescription>
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

function BenefitsTab({ garageId: _garageId }: { garageId: string }) {
  const { t } = useTranslation();
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
                <p className="text-sm text-muted-foreground">{t('hr.benefitPlans', 'Benefit Plans')}</p>
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
                <p className="text-sm text-muted-foreground">{t('hr.totalEnrollments', 'Total Enrollments')}</p>
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
                <p className="text-sm text-muted-foreground">{t('hr.monthlyCostSar', 'Monthly Cost (SAR)')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('hr.benefitPlans', 'Benefit Plans')}</CardTitle>
              <CardDescription>{t('hr.availableBenefits', 'Available employee benefits')}</CardDescription>
            </div>
            <Button data-testid="button-add-benefit">
              <Plus className="h-4 w-4 mr-2" />
              {t('hr.addPlan', 'Add Plan')}
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
                      <span className="text-muted-foreground">{t('hr.coverage', 'Coverage')}:</span>
                      <span>{plan.coverage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('hr.cost', 'Cost')}:</span>
                      <span>{plan.cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('hr.enrolled', 'Enrolled')}:</span>
                      <span>{plan.enrolled} {t('hr.employeesCount', 'employees')}</span>
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

function OrganizationTab({ garageId: _garageId }: { garageId: string }) {
  const { t } = useTranslation();
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
                <p className="text-sm text-muted-foreground">{t('hr.departments', 'Departments')}</p>
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
                <p className="text-sm text-muted-foreground">{t('hr.positions', 'Positions')}</p>
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
                <p className="text-sm text-muted-foreground">{t('hr.totalHeadcount', 'Total Headcount')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('hr.departments', 'Departments')}</CardTitle>
              <CardDescription>{t('hr.organizationalStructure', 'Organizational structure')}</CardDescription>
            </div>
            <Button data-testid="button-add-department">
              <Plus className="h-4 w-4 mr-2" />
              {t('hr.addDepartment', 'Add Department')}
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
                      <span className="text-muted-foreground">{t('hr.manager', 'Manager')}:</span>
                      <span>{dept.manager}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('hr.employees', 'Employees')}:</span>
                      <span>{dept.employeeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('hr.budget', 'Budget')}:</span>
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
          <CardTitle>{t('hr.announcements', 'Announcements')}</CardTitle>
          <CardDescription>{t('hr.companyWideAnnouncements', 'Company-wide announcements and updates')}</CardDescription>
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

function SelfServiceTab({ garageId: _garageId }: { garageId: string }) {
  const { t } = useTranslation();
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const requestTypes = [
    { value: "salary_certificate", label: t('hr.salaryCertificate', 'Salary Certificate') },
    { value: "experience_letter", label: t('hr.experienceLetter', 'Experience Letter') },
    { value: "bank_letter", label: t('hr.bankLetter', 'Bank Letter') },
    { value: "noc", label: t('hr.noc', 'NOC (No Objection Certificate)') },
    { value: "info_update", label: t('hr.infoUpdate', 'Information Update') },
    { value: "expense_claim", label: t('hr.expenseClaim', 'Expense Claim') },
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
                <p className="text-sm text-muted-foreground">{t('hr.myRequests', 'My Requests')}</p>
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
                <p className="text-sm text-muted-foreground">{t('common.pending', 'Pending')}</p>
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
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">{t('common.completed', 'Completed')}</p>
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
                <p className="text-2xl font-bold">18</p>
                <p className="text-sm text-muted-foreground">{t('hr.leaveDaysLeft', 'Leave Days Left')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('common.quick_actions', 'Quick Actions')}</CardTitle>
            <CardDescription>{t('hr.commonSelfServiceActions', 'Common self-service actions')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: FileText, label: t('hr.requestDocument', 'Request Document'), testId: "button-request-doc" },
                { icon: DollarSign, label: t('hr.viewPayslip', 'View Payslip'), testId: "button-view-payslip" },
                { icon: CalendarDays, label: t('hr.applyForLeave', 'Apply for Leave'), testId: "button-apply-leave" },
                { icon: Edit, label: t('hr.updatePersonalInfo', 'Update Personal Info'), testId: "button-update-info" },
              ].map((action, index) => (
                <Button key={index} variant="outline" className="h-20 flex-col gap-2" data-testid={action.testId}>
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{t('hr.recentRequests', 'Recent Requests')}</CardTitle>
                <CardDescription>{t('hr.yourServiceRequests', 'Your self-service requests')}</CardDescription>
              </div>
              <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-request">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('hr.newRequest', 'New Request')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('hr.submitNewRequest', 'Submit New Request')}</DialogTitle>
                    <DialogDescription>{t('hr.createServiceRequest', 'Create a new self-service request')}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>{t('hr.requestType', 'Request Type')}</Label>
                      <Select>
                        <SelectTrigger data-testid="select-request-type">
                          <SelectValue placeholder={t('hr.selectType', 'Select type')} />
                        </SelectTrigger>
                        <SelectContent>
                          {requestTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t('hr.subject', 'Subject')}</Label>
                      <Input placeholder={t('hr.enterSubject', 'Enter subject...')} data-testid="input-request-subject" />
                    </div>
                    <div>
                      <Label>{t('common.description', 'Description')}</Label>
                      <Textarea placeholder={t('hr.provideDetails', 'Provide details...')} data-testid="input-request-details" />
                    </div>
                    <Button className="w-full" onClick={() => setShowRequestDialog(false)} data-testid="button-submit-request">
                      {t('hr.submitRequest', 'Submit Request')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockSelfServiceRequests.map((request) => (
              <div key={request.id} className="p-4 rounded-lg border" data-testid={`request-${request.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{request.subject}</h4>
                    <p className="text-sm text-muted-foreground">{request.type.replace("_", " ")}</p>
                  </div>
                  <Badge className={getStatusColor(request.status)} variant="secondary">
                    {request.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">{request.date}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
