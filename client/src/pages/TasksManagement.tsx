import { Clock, AlertCircle, CheckCircle, Wrench, Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import type { JobCard } from "@shared/schema";

export function TasksManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedTask, setSelectedTask] = useState<JobCard | null>(null);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);

  const handleViewTask = (task: JobCard) => {
    setSelectedTask(task);
    setTaskDetailsOpen(true);
  };

  const { data: jobCards, isLoading } = useQuery<JobCard[]>({
    queryKey: ['/api/job-cards'],
    retry: false,
  });

  // Calculate stats
  const checkInCount = (jobCards?.filter(jc => jc.status === 'pending') ?? []).length;
  const repairCount = (jobCards?.filter(jc => jc.status === 'in_progress') ?? []).length;
  const qualityCheckCount = (jobCards?.filter(jc => jc.status === 'completed') ?? []).length;
  const completionCount = (jobCards?.filter(jc => jc.status === 'delivered') ?? []).length;

  // Filter tasks
  const allFilteredTasks = jobCards?.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesSearch = searchQuery === '' || 
      task.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.vehicleInfo as any)?.owner?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  }) || [];

  // Pagination logic
  const totalPages = Math.ceil(allFilteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredTasks = allFilteredTasks.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to page 1 when filters change
  const handleFilterChange = (type: 'status' | 'priority' | 'search', value: string) => {
    setCurrentPage(1);
    if (type === 'status') setStatusFilter(value);
    if (type === 'priority') setPriorityFilter(value);
    if (type === 'search') setSearchQuery(value);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700',
      'delivered': 'bg-purple-100 text-purple-700',
      'cancelled': 'bg-red-100 text-red-700',
    };
    return statusColors[status] || 'bg-dark-steel/30 text-gray-700';
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors: { [key: string]: string } = {
      'high': 'bg-red-100 text-red-700',
      'medium': 'bg-yellow-100 text-yellow-700',
      'low': 'bg-green-100 text-green-700',
    };
    return priorityColors[priority] || 'bg-dark-steel/30 text-gray-700';
  };

  return (
    <div className="flex-1 p-8 bg-midnight-blue">
      <div className="mb-8">
        <h1 className="font-['Poppins',Helvetica] font-semibold text-2xl text-chrome-silver">Tasks Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-midnight-blue border-dark-steel border border-[#e6e6e6]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-['Poppins',Helvetica] font-medium text-sm text-chrome-silver/60">check-in</h3>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="font-['Poppins',Helvetica] font-bold text-3xl text-chrome-silver mb-1">{checkInCount}</p>
            <p className="font-['Poppins',Helvetica] font-normal text-xs text-chrome-silver/60">in the last 2 hours</p>
          </CardContent>
        </Card>

        <Card className="bg-midnight-blue border-dark-steel border border-[#e6e6e6]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-['Poppins',Helvetica] font-medium text-sm text-chrome-silver/60">Repair</h3>
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <p className="font-['Poppins',Helvetica] font-bold text-3xl text-chrome-silver mb-1">{repairCount}</p>
            <p className="font-['Poppins',Helvetica] font-normal text-xs text-chrome-silver/60">in the last 2 hours</p>
          </CardContent>
        </Card>

        <Card className="bg-midnight-blue border-dark-steel border border-[#e6e6e6]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-['Poppins',Helvetica] font-medium text-sm text-chrome-silver/60">Quality Check</h3>
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="font-['Poppins',Helvetica] font-bold text-3xl text-chrome-silver mb-1">{qualityCheckCount}</p>
            <p className="font-['Poppins',Helvetica] font-normal text-xs text-chrome-silver/60">in the last 2 hours</p>
          </CardContent>
        </Card>

        <Card className="bg-midnight-blue border-dark-steel border border-[#e6e6e6]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-['Poppins',Helvetica] font-medium text-sm text-chrome-silver/60">Completion</h3>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="font-['Poppins',Helvetica] font-bold text-3xl text-chrome-silver mb-1">{completionCount}</p>
            <p className="font-['Poppins',Helvetica] font-normal text-xs text-chrome-silver/60">in the last 2 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-midnight-blue border-dark-steel border border-[#e6e6e6] mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value) => handleFilterChange('priority', value)}>
              <SelectTrigger data-testid="select-priority">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-chrome-silver/60" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 border-[#e6e6e6]"
                data-testid="input-search-tasks"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card className="bg-midnight-blue border-dark-steel border border-[#e6e6e6]">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e6e6e6]">
                  <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-medium text-sm text-chrome-silver/60">Task ID</th>
                  <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-medium text-sm text-chrome-silver/60">Customer Name</th>
                  <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-medium text-sm text-chrome-silver/60">Service Type</th>
                  <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-medium text-sm text-chrome-silver/60">Status</th>
                  <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-medium text-sm text-chrome-silver/60">Due Date/Time</th>
                  <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-medium text-sm text-chrome-silver/60">Priority</th>
                  <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-medium text-sm text-chrome-silver/60">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <div className="animate-pulse">Loading...</div>
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-chrome-silver/60">No tasks available</td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b border-[#e6e6e6] hover:bg-dark-steel/20" data-testid={`row-task-${task.id}`}>
                      <td className="py-4 px-4 font-['Poppins',Helvetica] font-medium text-sm text-chrome-silver">
                        #{task.id}
                      </td>
                      <td className="py-4 px-4 font-['Poppins',Helvetica] font-normal text-sm text-chrome-silver">
                        {(task.vehicleInfo as any)?.owner || 'N/A'}
                      </td>
                      <td className="py-4 px-4 font-['Poppins',Helvetica] font-normal text-sm text-chrome-silver">
                        {task.serviceType}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getStatusBadge(task.status)} border-0`} data-testid={`badge-status-${task.id}`}>
                          {task.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 font-['Poppins',Helvetica] font-normal text-sm text-chrome-silver/60">
                        {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getPriorityBadge(task.priority)} border-0`} data-testid={`badge-priority-${task.id}`}>
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleViewTask(task)}
                          data-testid={`button-view-${task.id}`}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                data-testid="button-previous"
              >
                Previous
              </Button>
              <div className="flex gap-2">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
                  <Button 
                    key={page} 
                    variant={page === currentPage ? 'default' : 'outline'} 
                    size="sm"
                    className="min-w-[40px]"
                    onClick={() => goToPage(page)}
                    data-testid={`button-page-${page}`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                data-testid="button-next"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TaskDetailsDialog 
        open={taskDetailsOpen}
        onOpenChange={setTaskDetailsOpen}
        task={selectedTask}
      />
    </div>
  );
}
