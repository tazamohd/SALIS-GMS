import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { StandardTablePage } from "@/components/layouts";
import { Clock, User, Calendar, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Timesheet {
  id: string;
  technicianId: string;
  technicianName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hoursWorked: number;
  status: "approved" | "pending" | "rejected";
  hourlyRate: number;
  totalPay: number;
}

export default function TimesheetManagement() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("week");

  const mockTimesheets: Timesheet[] = [
    {
      id: "1",
      technicianId: "tech1",
      technicianName: "John Smith",
      date: "2025-01-15",
      clockIn: "08:00 AM",
      clockOut: "05:00 PM",
      hoursWorked: 8,
      status: "approved",
      hourlyRate: 35,
      totalPay: 280,
    },
    {
      id: "2",
      technicianId: "tech2",
      technicianName: "Sarah Johnson",
      date: "2025-01-15",
      clockIn: "08:30 AM",
      clockOut: "05:30 PM",
      hoursWorked: 8,
      status: "approved",
      hourlyRate: 40,
      totalPay: 320,
    },
    {
      id: "3",
      technicianId: "tech3",
      technicianName: "Mike Chen",
      date: "2025-01-15",
      clockIn: "09:00 AM",
      clockOut: "06:00 PM",
      hoursWorked: 8,
      status: "pending",
      hourlyRate: 32,
      totalPay: 256,
    },
    {
      id: "4",
      technicianId: "tech1",
      technicianName: "John Smith",
      date: "2025-01-14",
      clockIn: "08:00 AM",
      clockOut: "04:00 PM",
      hoursWorked: 7,
      status: "approved",
      hourlyRate: 35,
      totalPay: 245,
    },
  ];

  const { data: timesheets = mockTimesheets, isLoading } = useQuery<Timesheet[]>({
    queryKey: ['/api/timesheets', periodFilter],
    queryFn: async () => mockTimesheets,
  });

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'approved': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      'pending': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'rejected': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    };
    return statusColors[status] || 'bg-[#F8FAFC] dark:bg-[#151A23]';
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: { [key: string]: string } = {
      'approved': t('timesheet.status.approved', 'Approved'),
      'pending': t('timesheet.status.pending', 'Pending'),
      'rejected': t('timesheet.status.rejected', 'Rejected'),
    };
    return statusLabels[status] || status;
  };

  const handleApprove = (id: string) => {
    console.log("Approve timesheet:", id);
  };

  const handleReject = (id: string) => {
    console.log("Reject timesheet:", id);
  };

  const columns = [
    {
      key: "date",
      label: t('timesheet.columns.date', 'Date'),
      render: (row: Timesheet) => (
        <div className="flex items-center gap-2" data-testid={`timesheet-date-${row.id}`}>
          <Calendar className="w-4 h-4 text-[#64748B]" />
          <span className="text-[#0B1F3B] dark:text-white">{new Date(row.date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: "technicianName",
      label: t('timesheet.columns.technician', 'Technician'),
      render: (row: Timesheet) => (
        <div className="flex items-center gap-2" data-testid={`timesheet-tech-${row.id}`}>
          <User className="w-4 h-4 text-[#64748B]" />
          <span className="text-[#0B1F3B] dark:text-white">{row.technicianName}</span>
        </div>
      ),
    },
    {
      key: "clockIn",
      label: t('timesheet.columns.clockIn', 'Clock In'),
      render: (row: Timesheet) => (
        <span className="font-medium text-[#0B1F3B] dark:text-white" data-testid={`timesheet-in-${row.id}`}>{row.clockIn}</span>
      ),
    },
    {
      key: "clockOut",
      label: t('timesheet.columns.clockOut', 'Clock Out'),
      render: (row: Timesheet) => (
        <span className="font-medium text-[#0B1F3B] dark:text-white" data-testid={`timesheet-out-${row.id}`}>{row.clockOut}</span>
      ),
    },
    {
      key: "hoursWorked",
      label: t('timesheet.columns.hoursWorked', 'Hours Worked'),
      render: (row: Timesheet) => (
        <div className="flex items-center gap-2" data-testid={`timesheet-hours-${row.id}`}>
          <Clock className="w-4 h-4 text-[#64748B]" />
          <span className="font-semibold text-[#0B1F3B] dark:text-white">{row.hoursWorked}{t('timesheet.hours', 'h')}</span>
        </div>
      ),
    },
    {
      key: "totalPay",
      label: t('timesheet.columns.totalPay', 'Total Pay'),
      render: (row: Timesheet) => (
        <div className="flex items-center gap-2" data-testid={`timesheet-pay-${row.id}`}>
          <DollarSign className="w-4 h-4 text-[#64748B]" />
          <span className="font-semibold text-[#0B1F3B] dark:text-white">${row.totalPay.toFixed(2)}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: t('timesheet.columns.status', 'Status'),
      render: (row: Timesheet) => (
        <Badge className={`${getStatusBadge(row.status)} border-0 capitalize`} data-testid={`timesheet-status-${row.id}`}>
          {getStatusLabel(row.status)}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: t('timesheet.columns.actions', 'Actions'),
      render: (row: Timesheet) => (
        <div className="flex gap-2">
          {row.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApprove(row.id)}
                className="bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-[#E2E8F0] dark:border-[#232A36] text-emerald-700 dark:text-emerald-300"
                data-testid={`button-approve-${row.id}`}
              >
                {t('timesheet.actions.approve', 'Approve')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(row.id)}
                className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border-[#E2E8F0] dark:border-[#232A36] text-red-700 dark:text-red-300"
                data-testid={`button-reject-${row.id}`}
              >
                {t('timesheet.actions.reject', 'Reject')}
              </Button>
            </>
          )}
          {row.status !== "pending" && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#232A36]"
              data-testid={`button-view-${row.id}`}
            >
              {t('common.view', 'View')}
            </Button>
          )}
        </div>
      ),
    },
  ];

  const filters = [
    {
      id: "status",
      label: t('timesheet.filters.status', 'Status'),
      options: [
        { value: "all", label: t('timesheet.filters.allStatus', 'All Status') },
        { value: "approved", label: t('timesheet.status.approved', 'Approved') },
        { value: "pending", label: t('timesheet.status.pending', 'Pending') },
        { value: "rejected", label: t('timesheet.status.rejected', 'Rejected') },
      ],
      defaultValue: statusFilter,
    },
    {
      id: "period",
      label: t('timesheet.filters.period', 'Period'),
      options: [
        { value: "today", label: t('timesheet.filters.today', 'Today') },
        { value: "week", label: t('timesheet.filters.thisWeek', 'This Week') },
        { value: "month", label: t('timesheet.filters.thisMonth', 'This Month') },
        { value: "custom", label: t('timesheet.filters.customRange', 'Custom Range') },
      ],
      defaultValue: periodFilter,
    },
  ];

  return (
    <StandardTablePage
      title={t('timesheet.title', 'Timesheet Management')}
      description={t('timesheet.description', 'Track and approve technician work hours and payroll')}
      icon={Clock}
      data={timesheets}
      isLoading={isLoading}
      columns={columns}
      searchPlaceholder={t('timesheet.searchPlaceholder', 'Search timesheets...')}
      filters={filters}
      emptyState={{
        icon: Clock,
        title: t('timesheet.emptyState.title', 'No timesheets found'),
        description: t('timesheet.emptyState.description', 'No timesheet records available for the selected period.'),
      }}
    />
  );
}
