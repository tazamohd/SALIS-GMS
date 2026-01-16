import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { StandardTablePage } from "@/components/layouts";
import { ClipboardList, User, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { JobCard } from "@shared/schema";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";

export default function TaskManagement() {
  const { t } = useTranslation();
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
      'pending': 'bg-[#64748B]/10 text-[#64748B]',
      'in_progress': 'bg-[#0A5ED7]/10 text-[#0A5ED7]',
      'completed': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      'delivered': 'bg-[#0BB3FF]/10 text-[#0BB3FF]',
      'cancelled': 'bg-red-500/10 text-red-600 dark:text-red-400',
    };
    return statusColors[status] || 'bg-[#64748B]/10 text-[#64748B]';
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors: { [key: string]: string } = {
      'high': 'bg-[#F97316]/10 text-[#F97316]',
      'medium': 'bg-[#0A5ED7]/10 text-[#0A5ED7]',
      'low': 'bg-[#64748B]/10 text-[#64748B]',
      'urgent': 'bg-red-500/10 text-red-600 dark:text-red-400',
    };
    return priorityColors[priority] || 'bg-[#64748B]/10 text-[#64748B]';
  };

  const columns = [
    {
      header: t('taskManagement.taskId', 'Task ID'),
      accessorKey: "id",
      cell: (row: JobCard) => (
        <span className="font-medium text-[#0B1F3B] dark:text-white" data-testid={`task-id-${row.id}`}>
          #{row.id}
        </span>
      ),
    },
    {
      header: t('taskManagement.customer', 'Customer'),
      accessorKey: "vehicleInfo",
      cell: (row: JobCard) => (
        <span className="text-[#64748B]" data-testid={`task-customer-${row.id}`}>
          {(row.vehicleInfo as any)?.owner || t('common.na', 'N/A')}
        </span>
      ),
    },
    {
      header: t('taskManagement.serviceType', 'Service Type'),
      accessorKey: "serviceType",
      cell: (row: JobCard) => (
        <span className="text-[#0B1F3B] dark:text-white" data-testid={`task-service-${row.id}`}>{row.serviceType}</span>
      ),
    },
    {
      header: t('common.status', 'Status'),
      accessorKey: "status",
      cell: (row: JobCard) => (
        <Badge className={`${getStatusBadge(row.status)} border-0`} data-testid={`task-status-${row.id}`}>
          {t(`statusLabels.${row.status}`, row.status)}
        </Badge>
      ),
    },
    {
      header: t('taskManagement.priority', 'Priority'),
      accessorKey: "priority",
      cell: (row: JobCard) => (
        <Badge className={`${getPriorityBadge(row.priority)} border-0`} data-testid={`task-priority-${row.id}`}>
          {t(`taskManagement.${row.priority}`, row.priority)}
        </Badge>
      ),
    },
    {
      header: t('taskManagement.dueDate', 'Due Date'),
      accessorKey: "createdAt",
      cell: (row: JobCard) => (
        <span className="text-sm text-[#64748B]" data-testid={`task-date-${row.id}`}>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : t('common.na', 'N/A')}
        </span>
      ),
    },
    {
      header: t('common.actions', 'Action'),
      accessorKey: "actions",
      cell: (row: JobCard) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewTask(row)}
          className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10"
          data-testid={`button-view-${row.id}`}
        >
          {t('common.view', 'View')}
        </Button>
      ),
    },
  ];

  const filters = [
    {
      id: "status",
      label: t('common.status', 'Status'),
      options: [
        { value: "all", label: t('taskManagement.allStatus', 'All Status') },
        { value: "pending", label: t('common.pending', 'Pending') },
        { value: "in_progress", label: t('common.inProgress', 'In Progress') },
        { value: "completed", label: t('common.completed', 'Completed') },
        { value: "delivered", label: t('taskManagement.delivered', 'Delivered') },
        { value: "cancelled", label: t('taskManagement.cancelled', 'Cancelled') },
      ],
      defaultValue: statusFilter,
    },
    {
      id: "priority",
      label: t('taskManagement.priority', 'Priority'),
      options: [
        { value: "all", label: t('taskManagement.allPriority', 'All Priority') },
        { value: "high", label: t('taskManagement.high', 'High') },
        { value: "medium", label: t('taskManagement.medium', 'Medium') },
        { value: "low", label: t('taskManagement.low', 'Low') },
      ],
      defaultValue: priorityFilter,
    },
  ];

  return (
    <>
      <StandardTablePage
        title={t('taskManagement.title', 'Task Management')}
        description={t('taskManagement.description', 'Manage and track all service tasks and assignments')}
        icon={ClipboardList}
        data={jobCards}
        isLoading={isLoading}
        columns={columns}
        searchPlaceholder={t('taskManagement.searchPlaceholder', 'Search tasks...')}
        filters={filters}
        emptyState={{
          icon: ClipboardList,
          title: t('taskManagement.noTasksFound', 'No tasks found'),
          description: t('taskManagement.noTasksDescription', 'There are no tasks available at the moment.'),
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
