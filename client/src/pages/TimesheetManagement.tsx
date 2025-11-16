import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
      'approved': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'pending': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      'rejected': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    };
    return statusColors[status] || 'bg-gray-100 dark:bg-gray-800';
  };

  const handleApprove = (id: string) => {
    console.log("Approve timesheet:", id);
  };

  const handleReject = (id: string) => {
    console.log("Reject timesheet:", id);
  };

  const columns = [
    {
      header: "Date",
      accessorKey: "date",
      cell: (row: Timesheet) => (
        <div className="flex items-center gap-2" data-testid={`timesheet-date-${row.id}`}>
          <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span>{new Date(row.date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      header: "Technician",
      accessorKey: "technicianName",
      cell: (row: Timesheet) => (
        <div className="flex items-center gap-2" data-testid={`timesheet-tech-${row.id}`}>
          <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span>{row.technicianName}</span>
        </div>
      ),
    },
    {
      header: "Clock In",
      accessorKey: "clockIn",
      cell: (row: Timesheet) => (
        <span className="font-medium" data-testid={`timesheet-in-${row.id}`}>{row.clockIn}</span>
      ),
    },
    {
      header: "Clock Out",
      accessorKey: "clockOut",
      cell: (row: Timesheet) => (
        <span className="font-medium" data-testid={`timesheet-out-${row.id}`}>{row.clockOut}</span>
      ),
    },
    {
      header: "Hours Worked",
      accessorKey: "hoursWorked",
      cell: (row: Timesheet) => (
        <div className="flex items-center gap-2" data-testid={`timesheet-hours-${row.id}`}>
          <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="font-semibold">{row.hoursWorked}h</span>
        </div>
      ),
    },
    {
      header: "Total Pay",
      accessorKey: "totalPay",
      cell: (row: Timesheet) => (
        <div className="flex items-center gap-2" data-testid={`timesheet-pay-${row.id}`}>
          <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="font-semibold">${row.totalPay.toFixed(2)}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: Timesheet) => (
        <Badge className={`${getStatusBadge(row.status)} border-0 capitalize`} data-testid={`timesheet-status-${row.id}`}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (row: Timesheet) => (
        <div className="flex gap-2">
          {row.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApprove(row.id)}
                className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
                data-testid={`button-approve-${row.id}`}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(row.id)}
                className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                data-testid={`button-reject-${row.id}`}
              >
                Reject
              </Button>
            </>
          )}
          {row.status !== "pending" && (
            <Button size="sm" variant="ghost" data-testid={`button-view-${row.id}`}>
              View
            </Button>
          )}
        </div>
      ),
    },
  ];

  const filters = [
    {
      id: "status",
      label: "Status",
      options: [
        { value: "all", label: "All Status" },
        { value: "approved", label: "Approved" },
        { value: "pending", label: "Pending" },
        { value: "rejected", label: "Rejected" },
      ],
      defaultValue: statusFilter,
    },
    {
      id: "period",
      label: "Period",
      options: [
        { value: "today", label: "Today" },
        { value: "week", label: "This Week" },
        { value: "month", label: "This Month" },
        { value: "custom", label: "Custom Range" },
      ],
      defaultValue: periodFilter,
    },
  ];

  return (
    <StandardTablePage
      title="Timesheet Management"
      description="Track and approve technician work hours and payroll"
      icon={Clock}
      data={timesheets}
      isLoading={isLoading}
      columns={columns}
      searchPlaceholder="Search timesheets..."
      filters={filters}
      emptyState={{
        icon: Clock,
        title: "No timesheets found",
        description: "No timesheet records available for the selected period.",
      }}
    />
  );
}
