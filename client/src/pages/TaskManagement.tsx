import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardTablePage } from "@/components/layouts";
import { ClipboardList, User, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { JobCard } from "@shared/schema";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";

export default function TaskManagement() {
  const [selectedTask, setSelectedTask] = useState<JobCard | null>(null);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { data: jobCards = [], isLoading } = useQuery<JobCard[]>({
    queryKey: ['/api/job-cards'],
    retry: false,
  });

  const handleViewTask = (task: JobCard) => {
    setSelectedTask(task);
    setTaskDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'pending': 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300',
      'in_progress': 'bg-gray-100 dark:bg-salis-gray-dark text-gray-900 dark:text-white',
      'completed': 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      'delivered': 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white',
      'cancelled': 'bg-salis-black dark:bg-white text-white dark:text-salis-black',
    };
    return statusColors[status] || 'bg-gray-100 dark:bg-salis-gray-dark';
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors: { [key: string]: string } = {
      'high': 'bg-salis-black dark:bg-white text-white dark:text-salis-black',
      'medium': 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300',
      'low': 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    };
    return priorityColors[priority] || 'bg-gray-100 dark:bg-salis-gray-dark';
  };

  const columns = [
    {
      header: "Task ID",
      accessorKey: "id",
      cell: (row: JobCard) => (
        <span className="font-medium" data-testid={`task-id-${row.id}`}>
          #{row.id}
        </span>
      ),
    },
    {
      header: "Customer",
      accessorKey: "vehicleInfo",
      cell: (row: JobCard) => (
        <span data-testid={`task-customer-${row.id}`}>
          {(row.vehicleInfo as any)?.owner || 'N/A'}
        </span>
      ),
    },
    {
      header: "Service Type",
      accessorKey: "serviceType",
      cell: (row: JobCard) => (
        <span data-testid={`task-service-${row.id}`}>{row.serviceType}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: JobCard) => (
        <Badge className={`${getStatusBadge(row.status)} border-0`} data-testid={`task-status-${row.id}`}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Priority",
      accessorKey: "priority",
      cell: (row: JobCard) => (
        <Badge className={`${getPriorityBadge(row.priority)} border-0`} data-testid={`task-priority-${row.id}`}>
          {row.priority}
        </Badge>
      ),
    },
    {
      header: "Due Date",
      accessorKey: "createdAt",
      cell: (row: JobCard) => (
        <span className="text-sm text-gray-600 dark:text-gray-400" data-testid={`task-date-${row.id}`}>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: "Action",
      accessorKey: "actions",
      cell: (row: JobCard) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewTask(row)}
          data-testid={`button-view-${row.id}`}
        >
          View
        </Button>
      ),
    },
  ];

  const filters = [
    {
      id: "status",
      label: "Status",
      options: [
        { value: "all", label: "All Status" },
        { value: "pending", label: "Pending" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" },
      ],
      defaultValue: statusFilter,
    },
    {
      id: "priority",
      label: "Priority",
      options: [
        { value: "all", label: "All Priority" },
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
      defaultValue: priorityFilter,
    },
  ];

  return (
    <>
      <StandardTablePage
        title="Task Management"
        description="Manage and track all service tasks and assignments"
        icon={ClipboardList}
        data={jobCards}
        isLoading={isLoading}
        columns={columns}
        searchPlaceholder="Search tasks..."
        filters={filters}
        emptyState={{
          icon: ClipboardList,
          title: "No tasks found",
          description: "There are no tasks available at the moment.",
        }}
      />
      
      <TaskDetailsDialog
        open={taskDetailsOpen}
        onOpenChange={setTaskDetailsOpen}
        task={selectedTask}
      />
    </>
  );
}
