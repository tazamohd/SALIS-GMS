import { useState } from "react";
import { BarChart3, Clock, AlertCircle, CheckCircle, Wrench, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import type { JobCard } from "@shared/schema";

export function Dashboard() {
  const { t } = useTranslation();
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
    <div className="flex-1 p-10 bg-gray-50 dark:bg-salis-black min-h-screen">
      {/* Enhanced Header */}
      <div className="mb-12">
        <h1 className="text-display-md text-gray-900 dark:text-white mb-3">{t('dashboard.title')}</h1>
        <p className="font-poppins text-base text-gray-600 dark:text-gray-400">{t('common.welcome')}</p>
      </div>

      {/* Enhanced Stats Cards - Larger with better spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
        <Card className="stat-card card-elevated border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black" data-testid="card-check-in">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="stat-card-label text-gray-600 dark:text-gray-400 mb-3">{t('dashboard.checkIn')}</h3>
                <p className="stat-card-number text-gray-900 dark:text-white">{checkInCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-salis-gray-dark">
                <Clock className="w-7 h-7 text-gray-700 dark:text-gray-300" />
              </div>
            </div>
            <p className="stat-card-subtitle text-gray-500 dark:text-gray-500">{t('dashboard.inLastHours')}</p>
          </CardContent>
        </Card>

        <Card className="stat-card card-elevated border-gray-300 dark:border-salis-gray bg-gray-100 dark:bg-salis-gray-dark" data-testid="card-repair">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="stat-card-label text-gray-700 dark:text-gray-300 mb-3">{t('dashboard.repair')}</h3>
                <p className="stat-card-number text-gray-900 dark:text-white">{repairCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-200 dark:bg-salis-gray">
                <Wrench className="w-7 h-7 text-gray-800 dark:text-gray-200" />
              </div>
            </div>
            <p className="stat-card-subtitle text-gray-600 dark:text-gray-400">{t('dashboard.inLastHours')}</p>
          </CardContent>
        </Card>

        <Card className="stat-card card-elevated border-salis-black dark:border-white bg-salis-black dark:bg-white" data-testid="card-quality">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="stat-card-label text-white dark:text-salis-black mb-3">{t('dashboard.qualityCheck')}</h3>
                <p className="stat-card-number text-white dark:text-salis-black">{qualityCheckCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/20 dark:bg-salis-black/20">
                <AlertCircle className="w-7 h-7 text-white dark:text-salis-black" />
              </div>
            </div>
            <p className="stat-card-subtitle text-gray-300 dark:text-gray-600">{t('dashboard.inLastHours')}</p>
          </CardContent>
        </Card>

        <Card className="stat-card card-elevated border-salis-50-black bg-salis-50-black dark:bg-salis-50-black" data-testid="card-completion">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="stat-card-label text-white mb-3">{t('dashboard.completion')}</h3>
                <p className="stat-card-number text-white">{completionCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/20">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="stat-card-subtitle text-gray-200">{t('dashboard.inLastHours')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Chart Section */}
      <Card className="card-elevated border-gray-200 dark:border-salis-gray-dark mb-12 bg-white dark:bg-salis-black" data-testid="card-chart">
        <CardContent className="p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-salis-gray-dark">
                <TrendingUp className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h2 className="text-headline text-gray-900 dark:text-white">{t('dashboard.totalTasks')}</h2>
                <p className="font-poppins text-sm text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.thisMonth')}</p>
              </div>
            </div>
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-gray-300 dark:border-salis-gray">
              7 Days
            </Badge>
          </div>
          
          {/* Improved Chart with Better Spacing */}
          <div className="h-80 flex items-end justify-between gap-6 px-4">
            {['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
              const heights = [60, 40, 80, 70, 50, 65, 75];
              const values = [12, 8, 16, 14, 10, 13, 15];
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="relative w-full flex flex-col items-center">
                    <span className="font-montserrat font-semibold text-sm text-gray-900 dark:text-white mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {values[i]}
                    </span>
                    <div 
                      className="w-full bg-gradient-to-t from-salis-black via-salis-gray to-salis-50-black dark:from-white dark:via-salis-gray-light dark:to-salis-50-black rounded-t-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                      style={{ height: `${heights[i]}%` }}
                    ></div>
                  </div>
                  <span className="font-poppins font-medium text-sm text-gray-700 dark:text-gray-300">{month}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tasks Table */}
      <Card className="card-elevated border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black" data-testid="card-tasks">
        <CardContent className="p-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-headline text-gray-900 dark:text-white mb-2">{t('dashboard.latestTasks')}</h2>
              <p className="font-poppins text-sm text-gray-600 dark:text-gray-400">Overview of recent job cards</p>
            </div>
            <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-salis-black dark:hover:text-white font-poppins text-base px-6" data-testid="button-view-all">
              {t('common.viewAll')} →
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-salis-gray-dark">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-salis-gray-dark/50">
                <tr className="border-b border-gray-200 dark:border-salis-gray-dark">
                  <th className="text-left py-5 px-6 font-poppins font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t('dashboard.taskId')}</th>
                  <th className="text-left py-5 px-6 font-poppins font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t('dashboard.serviceType')}</th>
                  <th className="text-left py-5 px-6 font-poppins font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t('dashboard.customerName')}</th>
                  <th className="text-left py-5 px-6 font-poppins font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t('dashboard.status')}</th>
                  <th className="text-left py-5 px-6 font-poppins font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t('dashboard.date')}</th>
                  <th className="text-left py-5 px-6 font-poppins font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t('dashboard.priority')}</th>
                  <th className="text-left py-5 px-6 font-poppins font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t('dashboard.action')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="animate-pulse text-lg text-gray-700 dark:text-gray-300">{t('common.loading')}</div>
                    </td>
                  </tr>
                ) : latestTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-500 dark:text-gray-500 text-base">{t('dashboard.noTasksAvailable')}</td>
                  </tr>
                ) : (
                  latestTasks.map((task) => (
                    <tr key={task.id} className="border-b border-gray-100 dark:border-salis-gray-dark hover:bg-gray-50 dark:hover:bg-salis-gray-dark/30 transition-colors" data-testid={`row-task-${task.id}`}>
                      <td className="py-5 px-6 font-poppins font-semibold text-base text-gray-900 dark:text-white">
                        #{task.id}
                      </td>
                      <td className="py-5 px-6 font-poppins font-normal text-base text-gray-700 dark:text-gray-300">
                        {task.serviceType}
                      </td>
                      <td className="py-5 px-6 font-poppins font-normal text-base text-gray-700 dark:text-gray-300">
                        {(task.vehicleInfo as any)?.owner || 'N/A'}
                      </td>
                      <td className="py-5 px-6">
                        <Badge className={`${getStatusBadge(task.status)} px-4 py-1.5 text-sm font-medium`} data-testid={`badge-status-${task.id}`}>
                          {task.status}
                        </Badge>
                      </td>
                      <td className="py-5 px-6 font-poppins font-normal text-base text-gray-600 dark:text-gray-400">
                        {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-5 px-6">
                        <Badge className={`${getPriorityBadge(task.priority)} px-4 py-1.5 text-sm font-medium`} data-testid={`badge-priority-${task.id}`}>
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="py-5 px-6">
                        <Button 
                          size="default" 
                          variant="outline" 
                          onClick={() => handleViewTask(task)}
                          className="border-gray-300 dark:border-salis-gray text-gray-700 dark:text-gray-300 hover:bg-salis-black dark:hover:bg-white hover:text-white dark:hover:text-salis-black transition-colors px-6"
                          data-testid={`button-view-${task.id}`}
                        >
                          {t('common.view')}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between mt-8">
              <Button 
                variant="outline" 
                size="default"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-6 py-2.5"
                data-testid="button-previous"
              >
                ← {t('common.previous')}
              </Button>
              <div className="flex gap-2">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
                  <Button 
                    key={page} 
                    variant={page === currentPage ? 'default' : 'outline'} 
                    size="default"
                    className="min-w-[48px] h-11"
                    onClick={() => goToPage(page)}
                    data-testid={`button-page-${page}`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="default"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-6 py-2.5"
                data-testid="button-next"
              >
                {t('common.next')} →
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
