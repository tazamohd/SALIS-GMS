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
      'pending': 'bg-gray-100 dark:bg-salis-gray-dark text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-salis-gray',
      'in_progress': 'bg-gray-200 dark:bg-salis-gray text-gray-800 dark:text-gray-200 border border-gray-400 dark:border-salis-gray-light',
      'completed': 'bg-salis-black/10 dark:bg-white/10 text-salis-black dark:text-white border border-salis-black/30 dark:border-white/30',
      'delivered': 'bg-salis-50-black/10 dark:bg-salis-50-black/20 text-salis-50-black dark:text-gray-300 border border-salis-50-black/30',
      'cancelled': 'bg-gray-300 dark:bg-salis-gray-dark text-gray-600 dark:text-gray-400 border border-gray-400 dark:border-salis-gray',
    };
    return statusColors[status] || 'bg-gray-100 dark:bg-salis-gray-dark text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-salis-gray';
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors: { [key: string]: string } = {
      'high': 'bg-salis-black dark:bg-white text-white dark:text-salis-black border border-salis-black dark:border-white',
      'medium': 'bg-salis-50-black dark:bg-salis-50-black text-white dark:text-white border border-salis-50-black',
      'low': 'bg-gray-300 dark:bg-salis-gray text-gray-700 dark:text-gray-300 border border-gray-400 dark:border-salis-gray-light',
    };
    return priorityColors[priority] || 'bg-gray-100 dark:bg-salis-gray-dark text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-salis-gray';
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 dark:bg-salis-black">
      <div className="mb-8">
        <h1 className="font-montserrat font-semibold text-3xl text-gray-900 dark:text-white">Dashboard</h1>
        <p className="font-poppins text-sm text-gray-600 dark:text-gray-400 mt-1">Welcome to SALIS AUTO Management System</p>
      </div>

      {/* Stats Cards - Monochrome */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border border-gray-200 dark:border-salis-gray-dark shadow-sm hover:shadow-lg transition-all bg-white dark:bg-salis-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-poppins font-medium text-sm text-gray-600 dark:text-gray-400 uppercase">Check-in</h3>
              <Clock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <p className="font-montserrat font-bold text-3xl text-gray-900 dark:text-white mb-1">{checkInCount}</p>
            <p className="font-poppins font-normal text-xs text-gray-500 dark:text-gray-500">in the last 2 hours</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-300 dark:border-salis-gray shadow-sm hover:shadow-lg transition-all bg-gray-100 dark:bg-salis-gray-dark">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-poppins font-medium text-sm text-gray-700 dark:text-gray-300 uppercase">Repair</h3>
              <Wrench className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            </div>
            <p className="font-montserrat font-bold text-3xl text-gray-900 dark:text-white mb-1">{repairCount}</p>
            <p className="font-poppins font-normal text-xs text-gray-600 dark:text-gray-400">in the last 2 hours</p>
          </CardContent>
        </Card>

        <Card className="border border-salis-black dark:border-white shadow-sm hover:shadow-lg transition-all bg-salis-black dark:bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-poppins font-medium text-sm text-white dark:text-salis-black uppercase">Quality Check</h3>
              <AlertCircle className="w-5 h-5 text-white dark:text-salis-black" />
            </div>
            <p className="font-montserrat font-bold text-3xl text-white dark:text-salis-black mb-1">{qualityCheckCount}</p>
            <p className="font-poppins font-normal text-xs text-gray-300 dark:text-gray-600">in the last 2 hours</p>
          </CardContent>
        </Card>

        <Card className="border border-salis-50-black shadow-sm hover:shadow-lg transition-all bg-salis-50-black dark:bg-salis-50-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-poppins font-medium text-sm text-white uppercase">Completion</h3>
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="font-montserrat font-bold text-3xl text-white mb-1">{completionCount}</p>
            <p className="font-poppins font-normal text-xs text-gray-200">in the last 2 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section - Grayscale Gradient */}
      <Card className="border border-gray-200 dark:border-salis-gray-dark shadow-sm mb-8 bg-white dark:bg-salis-black">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-montserrat font-semibold text-xl text-gray-900 dark:text-white">Total Tasks</h2>
            <span className="font-poppins font-medium text-sm text-gray-600 dark:text-gray-400">This Month</span>
          </div>
          <div className="h-64 flex items-end justify-between gap-4">
            {['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
              const heights = [60, 40, 80, 70, 50, 65, 75];
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-salis-black via-salis-gray to-salis-50-black dark:from-white dark:via-salis-gray-light dark:to-salis-50-black rounded-t shadow-lg hover:shadow-lg transition-shadow"
                    style={{ height: `${heights[i]}%` }}
                  ></div>
                  <span className="font-poppins font-normal text-xs text-gray-700 dark:text-gray-300">{month}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Latest Tasks Table */}
      <Card className="border border-gray-200 dark:border-salis-gray-dark shadow-sm bg-white dark:bg-salis-black">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-montserrat font-semibold text-xl text-gray-900 dark:text-white">Latest Tasks</h2>
            <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-salis-black dark:hover:text-white font-poppins" data-testid="button-view-all">
              View all
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-salis-gray-dark">
                  <th className="text-left py-3 px-4 font-poppins font-medium text-sm text-gray-600 dark:text-gray-400 uppercase">Task ID</th>
                  <th className="text-left py-3 px-4 font-poppins font-medium text-sm text-gray-600 dark:text-gray-400 uppercase">Service Type</th>
                  <th className="text-left py-3 px-4 font-poppins font-medium text-sm text-gray-600 dark:text-gray-400 uppercase">Customer Name</th>
                  <th className="text-left py-3 px-4 font-poppins font-medium text-sm text-gray-600 dark:text-gray-400 uppercase">Status</th>
                  <th className="text-left py-3 px-4 font-poppins font-medium text-sm text-gray-600 dark:text-gray-400 uppercase">Date</th>
                  <th className="text-left py-3 px-4 font-poppins font-medium text-sm text-gray-600 dark:text-gray-400 uppercase">Priority</th>
                  <th className="text-left py-3 px-4 font-poppins font-medium text-sm text-gray-600 dark:text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <div className="animate-pulse text-gray-700 dark:text-gray-300">Loading...</div>
                    </td>
                  </tr>
                ) : latestTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-500">No tasks available</td>
                  </tr>
                ) : (
                  latestTasks.map((task) => (
                    <tr key={task.id} className="border-b border-gray-100 dark:border-salis-gray-dark hover:bg-gray-50 dark:hover:bg-salis-gray-dark transition-colors" data-testid={`row-task-${task.id}`}>
                      <td className="py-4 px-4 font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white">
                        #{task.id}
                      </td>
                      <td className="py-4 px-4 font-['Poppins',Helvetica] font-normal text-sm text-gray-700 dark:text-gray-300">
                        {task.serviceType}
                      </td>
                      <td className="py-4 px-4 font-['Poppins',Helvetica] font-normal text-sm text-gray-700 dark:text-gray-300">
                        {(task.vehicleInfo as any)?.owner || 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getStatusBadge(task.status)} border-0`} data-testid={`badge-status-${task.id}`}>
                          {task.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 font-['Poppins',Helvetica] font-normal text-sm text-gray-600 dark:text-gray-400">
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
                          className="border-gray-300 dark:border-salis-gray text-gray-700 dark:text-gray-300 hover:bg-salis-black dark:hover:bg-white hover:text-white dark:hover:text-salis-black transition-colors"
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
