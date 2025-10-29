import { useState } from "react";
import { BarChart3, Clock, AlertCircle, CheckCircle, Wrench, TrendingUp, Users, DollarSign, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import { useAuth } from "@/hooks/useAuth";
import type { JobCard, User, Invoice, SparePart } from "@shared/schema";

export function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
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

  const { data: customers = [] } = useQuery<User[]>({
    queryKey: ['/api/customers'],
    retry: false,
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
    retry: false,
  });

  const { data: spareParts = [] } = useQuery<SparePart[]>({
    queryKey: ['/api/spare-parts'],
    retry: false,
  });

  const { data: sparePartInventories = [] } = useQuery<any[]>({
    queryKey: ['/api/spare-part-inventories'],
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

  // Enhanced colorful service type badges
  const getServiceTypeBadge = (serviceType: string) => {
    const types: { [key: string]: { bg: string; text: string; icon: string } } = {
      'maintenance': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: '🔧' },
      'repair': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', icon: '⚙️' },
      'diagnostic': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: '🔍' },
      'inspection': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: '✓' },
      'body_work': { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', icon: '🎨' },
      'tire_service': { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', icon: '⭕' },
    };
    const config = types[serviceType.toLowerCase().replace(/\s+/g, '_')] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: '📋' };
    return { ...config, label: serviceType };
  };

  // Enhanced colorful status badges
  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: { bg: string; text: string; icon: string } } = {
      'pending': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: '⏳' },
      'assigned': { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', icon: '👤' },
      'in_progress': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: '🔄' },
      'completed': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: '✅' },
      'delivered': { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300', icon: '🚗' },
      'cancelled': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: '❌' },
    };
    const config = statusColors[status] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: '○' };
    return { ...config, label: status };
  };

  // Enhanced colorful priority badges
  const getPriorityBadge = (priority: string) => {
    const priorityColors: { [key: string]: { bg: string; text: string; icon: string } } = {
      'urgent': { bg: 'bg-red-500 dark:bg-red-600', text: 'text-white', icon: '🔥' },
      'high': { bg: 'bg-orange-500 dark:bg-orange-600', text: 'text-white', icon: '⚡' },
      'medium': { bg: 'bg-yellow-500 dark:bg-yellow-600', text: 'text-white', icon: '⭐' },
      'low': { bg: 'bg-green-500 dark:bg-green-600', text: 'text-white', icon: '💚' },
    };
    const config = priorityColors[priority] || { bg: 'bg-gray-500', text: 'text-white', icon: '○' };
    return { ...config, label: priority };
  };

  // Shorten task ID
  const shortenId = (id: string) => {
    return id.substring(0, 8).toUpperCase();
  };

  // Calculate real metrics from backend data
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || 0), 0);
  
  const activeCustomersCount = customers.filter(c => c.userType === 'customer').length;
  
  const inStockParts = sparePartInventories.filter(inv => (inv.stockQuantity || 0) > 0).length;
  const totalInventoryItems = sparePartInventories.length || 1;
  const inventoryPercentage = Math.round((inStockParts / totalInventoryItems) * 100);

  // Role-based metrics
  const roleBasedMetrics = () => {
    const role = (user as any)?.role || (user as User | undefined)?.userType || 'technician';
    
    if (role === 'admin' || role === 'manager') {
      return [
        { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-green-600 dark:text-green-400' },
        { label: 'Active Customers', value: activeCustomersCount.toString(), icon: Users, color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Parts Inventory', value: `${inventoryPercentage}%`, icon: Package, color: 'text-purple-600 dark:text-purple-400' },
      ];
    } else {
      return [
        { label: 'My Tasks', value: repairCount.toString(), icon: Wrench, color: 'text-orange-600 dark:text-orange-400' },
        { label: 'Completed Today', value: qualityCheckCount.toString(), icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
        { label: 'Pending', value: checkInCount.toString(), icon: Clock, color: 'text-yellow-600 dark:text-yellow-400' },
      ];
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-salis-black min-h-screen">
      {/* Compact Header */}
      <div className="mb-6">
        <h1 className="font-montserrat font-semibold text-2xl text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
        <p className="font-poppins text-sm text-gray-600 dark:text-gray-400 mt-1">{t('common.welcome')} {(user as User | undefined)?.fullName || (user as any)?.name}</p>
      </div>

      {/* Role-based Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {roleBasedMetrics().map((metric, idx) => (
          <Card key={idx} className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-poppins text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">{metric.label}</p>
                <p className="text-2xl font-montserrat font-bold text-gray-900 dark:text-white">{metric.value}</p>
              </div>
              <metric.icon className={`w-8 h-8 ${metric.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compact Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black" data-testid="card-check-in">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-3xl font-montserrat font-bold text-gray-900 dark:text-white">{checkInCount}</span>
            </div>
            <p className="text-xs font-poppins text-gray-600 dark:text-gray-400">{t('dashboard.checkIn')}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black" data-testid="card-repair">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-3xl font-montserrat font-bold text-gray-900 dark:text-white">{repairCount}</span>
            </div>
            <p className="text-xs font-poppins text-gray-600 dark:text-gray-400">{t('dashboard.repair')}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black" data-testid="card-quality">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-3xl font-montserrat font-bold text-gray-900 dark:text-white">{qualityCheckCount}</span>
            </div>
            <p className="text-xs font-poppins text-gray-600 dark:text-gray-400">{t('dashboard.qualityCheck')}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black" data-testid="card-completion">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-3xl font-montserrat font-bold text-gray-900 dark:text-white">{completionCount}</span>
            </div>
            <p className="text-xs font-poppins text-gray-600 dark:text-gray-400">{t('dashboard.completion')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Task Summary Section */}
      <Card className="border border-gray-200 dark:border-salis-gray-dark mb-6 bg-white dark:bg-salis-black" data-testid="card-summary">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">Task Overview</h2>
            <Badge variant="outline" className="text-xs">All Time</Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-montserrat font-bold text-gray-900 dark:text-white">{jobCards?.length || 0}</p>
              <p className="text-xs font-poppins text-gray-600 dark:text-gray-400 mt-1">Total Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-montserrat font-bold text-gray-900 dark:text-white">{invoices.length}</p>
              <p className="text-xs font-poppins text-gray-600 dark:text-gray-400 mt-1">Total Invoices</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-montserrat font-bold text-gray-900 dark:text-white">{activeCustomersCount}</p>
              <p className="text-xs font-poppins text-gray-600 dark:text-gray-400 mt-1">Customers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-montserrat font-bold text-gray-900 dark:text-white">{spareParts.length}</p>
              <p className="text-xs font-poppins text-gray-600 dark:text-gray-400 mt-1">Parts in Catalog</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Minimized Tasks Table */}
      <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black" data-testid="card-tasks">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">{t('dashboard.latestTasks')}</h2>
            <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300" data-testid="button-view-all">
              {t('common.viewAll')} →
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-salis-gray-dark">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-salis-gray-dark/50">
                <tr className="border-b border-gray-200 dark:border-salis-gray-dark">
                  <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">ID</th>
                  <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">Service</th>
                  <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">Customer</th>
                  <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">Vehicle</th>
                  <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">Priority</th>
                  <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      <div className="animate-pulse text-gray-700 dark:text-gray-300">{t('common.loading')}</div>
                    </td>
                  </tr>
                ) : latestTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-500">{t('dashboard.noTasksAvailable')}</td>
                  </tr>
                ) : (
                  latestTasks.map((task) => {
                    const serviceConfig = getServiceTypeBadge(task.serviceType);
                    const statusConfig = getStatusBadge(task.status);
                    const priorityConfig = getPriorityBadge(task.priority);
                    const vehicleInfo = task.vehicleInfo as any;
                    
                    return (
                      <tr key={task.id} className="border-b border-gray-100 dark:border-salis-gray-dark hover:bg-gray-50 dark:hover:bg-salis-gray-dark/30 transition-colors" data-testid={`row-task-${task.id}`}>
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-gray-900 dark:text-white">
                          #{shortenId(task.id)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${serviceConfig.bg} ${serviceConfig.text} border-0 text-xs font-medium`}>
                            {serviceConfig.icon} {serviceConfig.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-poppins text-sm text-gray-700 dark:text-gray-300">
                          {vehicleInfo?.customerName || vehicleInfo?.owner || 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-poppins text-sm text-gray-700 dark:text-gray-300">
                          {vehicleInfo?.make} {vehicleInfo?.model}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0 text-xs font-medium`} data-testid={`badge-status-${task.id}`}>
                            {statusConfig.icon} {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${priorityConfig.bg} ${priorityConfig.text} border-0 text-xs font-medium shadow-sm`} data-testid={`badge-priority-${task.id}`}>
                            {priorityConfig.icon} {priorityConfig.label.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-poppins text-xs text-gray-600 dark:text-gray-400">
                          {task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleViewTask(task)}
                            className="h-7 px-3 text-xs"
                            data-testid={`button-view-${task.id}`}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Compact Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 px-3 text-xs"
                data-testid="button-previous"
              >
                ← Prev
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                  <Button 
                    key={page} 
                    variant={page === currentPage ? 'default' : 'outline'} 
                    size="sm"
                    className="h-8 w-8 p-0 text-xs"
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
                className="h-8 px-3 text-xs"
                data-testid="button-next"
              >
                Next →
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
