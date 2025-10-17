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
      'pending': 'bg-electric-blue/10 text-electric-blue border border-electric-blue/30',
      'in_progress': 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30',
      'completed': 'bg-teal-glow/10 text-teal-glow border border-teal-glow/30',
      'delivered': 'bg-neon-blue/10 text-neon-blue border border-neon-blue/30',
      'cancelled': 'bg-brand-orange/10 text-brand-orange border border-brand-orange/30',
    };
    return statusColors[status] || 'bg-gray-100 text-soft-white border border-gray-200';
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors: { [key: string]: string } = {
      'high': 'bg-brand-orange/10 text-brand-orange border border-brand-orange/30',
      'medium': 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30',
      'low': 'bg-teal-glow/10 text-teal-glow border border-teal-glow/30',
    };
    return priorityColors[priority] || 'bg-gray-100 text-soft-white border border-gray-200';
  };

  return (
    <div className="flex-1 p-8 bg-dark-navy">
      <div className="mb-8">
        <h1 className="font-montserrat font-semibold text-3xl text-soft-white">Dashboard</h1>
        <p className="font-poppins text-sm text-soft-white/70 mt-1">Welcome to SALIS AUTO Management System</p>
      </div>

      {/* Stats Cards - SALIS AUTO Brand Colors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border border-neon-blue/30 shadow-sm hover:shadow-lg hover:shadow-electric-blue/20 transition-all bg-dark-navy">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-poppins font-medium text-sm text-soft-white/80 uppercase">Check-in</h3>
              <Clock className="w-5 h-5 text-electric-blue" />
            </div>
            <p className="font-montserrat font-bold text-3xl text-soft-white mb-1">{checkInCount}</p>
            <p className="font-poppins font-normal text-xs text-soft-white/60">in the last 2 hours</p>
          </CardContent>
        </Card>

        <Card className="border border-electric-blue/50 shadow-sm hover:shadow-lg hover:shadow-electric-blue/30 transition-all bg-gradient-to-br from-electric-blue/20 to-cyber-blue/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-poppins font-medium text-sm text-electric-blue uppercase">Repair</h3>
              <Wrench className="w-5 h-5 text-electric-blue" />
            </div>
            <p className="font-montserrat font-bold text-3xl text-soft-white mb-1">{repairCount}</p>
            <p className="font-poppins font-normal text-xs text-soft-white/60">in the last 2 hours</p>
          </CardContent>
        </Card>

        <Card className="border border-brand-orange/50 shadow-sm hover:shadow-lg hover:shadow-brand-orange/30 transition-all bg-gradient-to-br from-brand-orange/20 to-brand-orange/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-poppins font-medium text-sm text-brand-orange uppercase">Quality Check</h3>
              <AlertCircle className="w-5 h-5 text-brand-orange" />
            </div>
            <p className="font-montserrat font-bold text-3xl text-soft-white mb-1">{qualityCheckCount}</p>
            <p className="font-poppins font-normal text-xs text-soft-white/60">in the last 2 hours</p>
          </CardContent>
        </Card>

        <Card className="border border-teal-glow/50 shadow-sm hover:shadow-lg hover:shadow-teal-glow/30 transition-all bg-gradient-to-br from-teal-glow/20 to-cyber-blue/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-poppins font-medium text-sm text-teal-glow uppercase">Completion</h3>
              <CheckCircle className="w-5 h-5 text-teal-glow" />
            </div>
            <p className="font-montserrat font-bold text-3xl text-soft-white mb-1">{completionCount}</p>
            <p className="font-poppins font-normal text-xs text-soft-white/60">in the last 2 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section - Electric Blue Gradient */}
      <Card className="border border-neon-blue/30 shadow-sm mb-8 bg-dark-navy">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-montserrat font-semibold text-xl text-soft-white">Total Tasks</h2>
            <span className="font-poppins font-medium text-sm text-soft-white/70">This Month</span>
          </div>
          <div className="h-64 flex items-end justify-between gap-4">
            {['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
              const heights = [60, 40, 80, 70, 50, 65, 75];
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-electric-blue via-cyber-blue to-teal-glow rounded-t shadow-lg hover:shadow-electric-blue/50 transition-shadow"
                    style={{ height: `${heights[i]}%` }}
                  ></div>
                  <span className="font-poppins font-normal text-xs text-soft-white">{month}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Latest Tasks Table */}
      <Card className="border border-neon-blue/30 shadow-sm bg-dark-navy">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-montserrat font-semibold text-xl text-soft-white">Latest Tasks</h2>
            <Button variant="ghost" className="text-electric-blue hover:text-cyber-blue font-poppins" data-testid="button-view-all">
              View all
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon-blue/30">
                  <th className="text-left py-3 px-4 font-poppins font-medium text-sm text-soft-white/80 uppercase">Task ID</th>
                  <th className="text-left py-3 px-4 font-poppins font-medium text-sm text-soft-white/80 uppercase">Service Type</th>
                  <th className="text-left py-3 px-4 font-poppins font-medium text-sm text-soft-white/80 uppercase">Customer Name</th>
                  <th className="text-left py-3 px-4 font-poppins font-medium text-sm text-soft-white/80 uppercase">Status</th>
                  <th className="text-left py-3 px-4 font-poppins font-medium text-sm text-soft-white/80 uppercase">Date</th>
                  <th className="text-left py-3 px-4 font-poppins font-medium text-sm text-soft-white/80 uppercase">Priority</th>
                  <th className="text-left py-3 px-4 font-poppins font-medium text-sm text-soft-white/80 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <div className="animate-pulse text-soft-white">Loading...</div>
                    </td>
                  </tr>
                ) : latestTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-soft-white/60">No tasks available</td>
                  </tr>
                ) : (
                  latestTasks.map((task) => (
                    <tr key={task.id} className="border-b border-neon-blue/20 hover:bg-neon-blue/10 transition-colors" data-testid={`row-task-${task.id}`}>
                      <td className="py-4 px-4 font-['Poppins',Helvetica] font-medium text-sm text-soft-white">
                        #{task.id}
                      </td>
                      <td className="py-4 px-4 font-['Poppins',Helvetica] font-normal text-sm text-soft-white">
                        {task.serviceType}
                      </td>
                      <td className="py-4 px-4 font-['Poppins',Helvetica] font-normal text-sm text-soft-white">
                        {(task.vehicleInfo as any)?.owner || 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getStatusBadge(task.status)} border-0`} data-testid={`badge-status-${task.id}`}>
                          {task.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 font-['Poppins',Helvetica] font-normal text-sm text-soft-white/70">
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
                          className="border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-dark-navy transition-colors"
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
