import { useState } from "react";
import { BarChart3, Clock, AlertCircle, CheckCircle, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import type { JobCard } from "@shared/schema";

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
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

  // Pagination logic
  const totalPages = Math.ceil((jobCards?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const latestTasks = jobCards?.slice(startIndex, endIndex) || [];

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700',
      'delivered': 'bg-purple-100 text-purple-700',
      'cancelled': 'bg-red-100 text-red-700',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors: { [key: string]: string } = {
      'high': 'bg-red-100 text-red-700',
      'medium': 'bg-yellow-100 text-yellow-700',
      'low': 'bg-green-100 text-green-700',
    };
    return priorityColors[priority] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="flex-1 p-8 bg-white">
      <div className="mb-8">
        <h1 className="font-['Poppins',Helvetica] font-semibold text-2xl text-[#222029]">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border border-[#e6e6e6]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-['Poppins',Helvetica] font-medium text-sm text-[#999999]">check-in</h3>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="font-['Poppins',Helvetica] font-bold text-3xl text-[#222029] mb-1">{checkInCount}</p>
            <p className="font-['Poppins',Helvetica] font-normal text-xs text-[#999999]">in the last 2 hours</p>
          </CardContent>
        </Card>

        <Card className="border border-[#e6e6e6]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-['Poppins',Helvetica] font-medium text-sm text-[#999999]">Repair</h3>
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <p className="font-['Poppins',Helvetica] font-bold text-3xl text-[#222029] mb-1">{repairCount}</p>
            <p className="font-['Poppins',Helvetica] font-normal text-xs text-[#999999]">in the last 2 hours</p>
          </CardContent>
        </Card>

        <Card className="border border-[#e6e6e6]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-['Poppins',Helvetica] font-medium text-sm text-[#999999]">Quality Check</h3>
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="font-['Poppins',Helvetica] font-bold text-3xl text-[#222029] mb-1">{qualityCheckCount}</p>
            <p className="font-['Poppins',Helvetica] font-normal text-xs text-[#999999]">in the last 2 hours</p>
          </CardContent>
        </Card>

        <Card className="border border-[#e6e6e6]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-['Poppins',Helvetica] font-medium text-sm text-[#999999]">Completion</h3>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="font-['Poppins',Helvetica] font-bold text-3xl text-[#222029] mb-1">{completionCount}</p>
            <p className="font-['Poppins',Helvetica] font-normal text-xs text-[#999999]">in the last 2 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="border border-[#e6e6e6] mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-['Poppins',Helvetica] font-semibold text-lg text-[#222029]">Total Tasks</h2>
            <span className="font-['Poppins',Helvetica] font-medium text-sm text-[#999999]">This Month</span>
          </div>
          <div className="h-64 flex items-end justify-between gap-4">
            {['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
              const heights = [60, 40, 80, 70, 50, 65, 75];
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-blue-600 rounded-t"
                    style={{ height: `${heights[i]}%` }}
                  ></div>
                  <span className="font-['Poppins',Helvetica] font-normal text-xs text-[#999999]">{month}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Latest Tasks Table */}
      <Card className="border border-[#e6e6e6]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-['Poppins',Helvetica] font-semibold text-lg text-[#222029]">Latest Tasks</h2>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700" data-testid="button-view-all">
              View all
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e6e6e6]">
                  <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-medium text-sm text-[#999999]">Task ID</th>
                  <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-medium text-sm text-[#999999]">Service Type</th>
                  <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-medium text-sm text-[#999999]">Customer Name</th>
                  <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-medium text-sm text-[#999999]">Status</th>
                  <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-medium text-sm text-[#999999]">Date</th>
                  <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-medium text-sm text-[#999999]">Priority</th>
                  <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-medium text-sm text-[#999999]">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <div className="animate-pulse">Loading...</div>
                    </td>
                  </tr>
                ) : latestTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#999999]">No tasks available</td>
                  </tr>
                ) : (
                  latestTasks.map((task) => (
                    <tr key={task.id} className="border-b border-[#e6e6e6] hover:bg-gray-50" data-testid={`row-task-${task.id}`}>
                      <td className="py-4 px-4 font-['Poppins',Helvetica] font-medium text-sm text-[#222029]">
                        #{task.id}
                      </td>
                      <td className="py-4 px-4 font-['Poppins',Helvetica] font-normal text-sm text-[#222029]">
                        {task.serviceType}
                      </td>
                      <td className="py-4 px-4 font-['Poppins',Helvetica] font-normal text-sm text-[#222029]">
                        {(task.vehicleInfo as any)?.owner || 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getStatusBadge(task.status)} border-0`} data-testid={`badge-status-${task.id}`}>
                          {task.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 font-['Poppins',Helvetica] font-normal text-sm text-[#999999]">
                        {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
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
