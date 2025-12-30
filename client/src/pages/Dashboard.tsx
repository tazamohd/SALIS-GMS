import { useState } from "react";
import { BarChart3, Clock, AlertCircle, CheckCircle, Wrench, TrendingUp, Users, DollarSign, Package, FileText, Car, CalendarDays, Activity, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart } from "recharts";
import type { JobCard, User, Invoice, SparePart } from "@shared/schema";

interface DashboardStats {
  jobStatus: { name: string; value: number; status: string }[];
  revenue: { month: string; revenue: number }[];
}

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

  const garageId = (user as any)?.garageId;
  
  const { data: sparePartInventories = [] } = useQuery<any[]>({
    queryKey: ['/api/spare-part-inventories', garageId],
    queryFn: async () => {
      if (!garageId) return [];
      const response = await fetch(`/api/spare-part-inventories?garage_id=${garageId}`);
      if (!response.ok) throw new Error('Failed to fetch inventories');
      return response.json();
    },
    enabled: !!garageId,
    retry: false,
  });

  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/stats/dashboard'],
    retry: false,
  });

  const PIE_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444', '#8b5cf6'];

  const checkInCount = (jobCards?.filter(jc => jc.status === 'pending') ?? []).length;
  const repairCount = (jobCards?.filter(jc => jc.status === 'in_progress') ?? []).length;
  const qualityCheckCount = (jobCards?.filter(jc => jc.status === 'completed') ?? []).length;
  const completionCount = (jobCards?.filter(jc => jc.status === 'completed') ?? []).length;
  const deliveredCount = (jobCards?.filter(jc => jc.status === 'delivered') ?? []).length;

  const totalPages = Math.ceil((jobCards?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const latestTasks = jobCards?.slice(startIndex, endIndex) || [];

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

  const shortenId = (id: string) => {
    return id.substring(0, 8).toUpperCase();
  };

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || 0), 0);
  
  const activeCustomersCount = customers.filter(c => c.userType === 'customer').length;
  
  const inStockParts = sparePartInventories.filter(inv => (inv.stockQuantity || 0) > 0).length;
  const totalInventoryItems = sparePartInventories.length || 1;
  const inventoryPercentage = Math.round((inStockParts / totalInventoryItems) * 100);

  const role = ((user as any)?.role?.toUpperCase() || (user as User | undefined)?.userType?.toUpperCase() || 'TECHNICIAN');
  const isTechnician = role === 'TECHNICIAN';

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-salis-black min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            {t('dashboard.title', 'Dashboard')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 font-poppins">
            {t('common.welcome', 'Welcome back')}, {(user as any)?.fullName || (user as any)?.username || (user as any)?.displayName || (user as any)?.email?.split('@')[0] || 'User'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/job-cards">
              <FileText className="w-4 h-4" />
              {t('dashboard.newJobCard', 'New Job Card')}
            </Link>
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
            <Link href="/vehicles">
              <Car className="w-4 h-4" />
              {t('dashboard.addVehicle', 'Add Vehicle')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Large Colorful Metric Cards - Primary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue Card */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" data-testid="card-revenue">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">{t('dashboard.totalRevenue', 'Total Revenue')}</p>
                <h3 className="text-3xl font-bold font-montserrat">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <div className="flex items-center gap-1 mt-2 text-emerald-100">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm">+12.5% {t('dashboard.fromLastMonth', 'from last month')}</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full"></div>
          </CardContent>
        </Card>

        {/* Active Jobs Card */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" data-testid="card-active-jobs">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">{t('dashboard.activeJobs', 'Active Jobs')}</p>
                <h3 className="text-3xl font-bold font-montserrat">{repairCount + checkInCount}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-white/20 text-white border-0 text-xs">{checkInCount} {t('common.pending', 'Pending')}</Badge>
                  <Badge className="bg-white/20 text-white border-0 text-xs">{repairCount} {t('dashboard.inProgress', 'In Progress')}</Badge>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Wrench className="w-8 h-8" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
          </CardContent>
        </Card>

        {/* Customers Card */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" data-testid="card-customers">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-violet-100 text-sm font-medium mb-1">{t('dashboard.totalCustomers', 'Total Customers')}</p>
                <h3 className="text-3xl font-bold font-montserrat">{activeCustomersCount}</h3>
                <div className="flex items-center gap-1 mt-2 text-violet-100">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm">+8 {t('dashboard.newThisWeek', 'new this week')}</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
          </CardContent>
        </Card>

        {/* Inventory Card */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" data-testid="card-inventory">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium mb-1">{t('dashboard.partsInventory', 'Parts Inventory')}</p>
                <h3 className="text-3xl font-bold font-montserrat">{inventoryPercentage}%</h3>
                <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                  <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${inventoryPercentage}%` }}></div>
                </div>
                <p className="text-amber-100 text-xs mt-1">{inStockParts} / {totalInventoryItems} {t('dashboard.inStock', 'in stock')}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Package className="w-8 h-8" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Status Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border border-yellow-200 dark:border-yellow-900/50 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 hover:shadow-md transition-all" data-testid="card-check-in">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{checkInCount}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.checkIn', 'Check-In')}</p>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-md transition-all" data-testid="card-repair">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{repairCount}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.repair', 'Repair')}</p>
          </CardContent>
        </Card>

        <Card className="border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:shadow-md transition-all" data-testid="card-quality">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{qualityCheckCount}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.qualityCheck', 'Quality Check')}</p>
          </CardContent>
        </Card>

        <Card className="border border-green-200 dark:border-green-900/50 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:shadow-md transition-all" data-testid="card-completion">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{completionCount}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.completed', 'Completed')}</p>
          </CardContent>
        </Card>

        <Card className="border border-teal-200 dark:border-teal-900/50 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 hover:shadow-md transition-all" data-testid="card-delivered">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-teal-500/20 flex items-center justify-center">
              <Car className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{deliveredCount}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.delivered', 'Delivered')}</p>
          </CardContent>
        </Card>

        <Card className="border border-rose-200 dark:border-rose-900/50 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 hover:shadow-md transition-all" data-testid="card-total-jobs">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-rose-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{jobCards?.length || 0}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.totalJobs', 'Total Jobs')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {!isTechnician && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm" data-testid="card-revenue-chart">
            <CardHeader className="pb-2">
              <CardTitle className="font-montserrat text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                {t('dashboard.revenuePerMonth', 'Revenue per Month')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-[250px] flex items-center justify-center text-gray-500">{t('common.loading', 'Loading...')}</div>
              ) : dashboardStats?.revenue && dashboardStats.revenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={dashboardStats.revenue}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `$${v.toLocaleString()}`} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revenueGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                  {t('dashboard.noRevenueData', 'No revenue data available')}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm" data-testid="card-status-chart">
            <CardHeader className="pb-2">
              <CardTitle className="font-montserrat text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                {t('dashboard.jobsByStatus', 'Jobs by Status')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-[250px] flex items-center justify-center text-gray-500">{t('common.loading', 'Loading...')}</div>
              ) : dashboardStats?.jobStatus && dashboardStats.jobStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={dashboardStats.jobStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {dashboardStats.jobStatus.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                  {t('dashboard.noJobStatusData', 'No job status data available')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Stats Summary */}
      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm" data-testid="card-summary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              {t('dashboard.quickStats', 'Quick Stats')}
            </h2>
            <Badge variant="outline" className="text-xs">{t('dashboard.allTime', 'All Time')}</Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-4xl font-montserrat font-bold text-gray-900 dark:text-white">{jobCards?.length || 0}</p>
              <p className="text-sm font-poppins text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.totalJobs', 'Total Jobs')}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-4xl font-montserrat font-bold text-gray-900 dark:text-white">{invoices.length}</p>
              <p className="text-sm font-poppins text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.totalInvoices', 'Total Invoices')}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-4xl font-montserrat font-bold text-gray-900 dark:text-white">{activeCustomersCount}</p>
              <p className="text-sm font-poppins text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.customers', 'Customers')}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-4xl font-montserrat font-bold text-gray-900 dark:text-white">{spareParts.length}</p>
              <p className="text-sm font-poppins text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.partsCatalog', 'Parts in Catalog')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest Tasks Table */}
      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm" data-testid="card-tasks">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              {t('dashboard.latestTasks', 'Latest Tasks')}
            </h2>
            <Button variant="outline" size="sm" className="gap-2" data-testid="button-view-all" asChild>
              <Link href="/job-cards">
                {t('common.viewAll', 'View All')}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">{t('table.id', 'ID')}</th>
                  <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">{t('table.service', 'Service')}</th>
                  <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">{t('table.customer', 'Customer')}</th>
                  <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">{t('table.vehicle', 'Vehicle')}</th>
                  <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">{t('common.status', 'Status')}</th>
                  <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">{t('table.priority', 'Priority')}</th>
                  <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">{t('common.date', 'Date')}</th>
                  <th className="text-left py-3 px-4 font-poppins font-semibold text-xs text-gray-700 dark:text-gray-300">{t('common.actions', 'Action')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      <div className="animate-pulse text-gray-700 dark:text-gray-300">{t('common.loading', 'Loading...')}</div>
                    </td>
                  </tr>
                ) : latestTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-500">{t('dashboard.noTasksAvailable', 'No tasks available')}</td>
                  </tr>
                ) : (
                  latestTasks.map((task) => {
                    const serviceConfig = getServiceTypeBadge(task.serviceType);
                    const statusConfig = getStatusBadge(task.status);
                    const priorityConfig = getPriorityBadge(task.priority);
                    const vehicleInfo = task.vehicleInfo as any;
                    
                    return (
                      <tr key={task.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors" data-testid={`row-task-${task.id}`}>
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
                            {t('common.view', 'View')}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

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
                ← {t('common.previous', 'Prev')}
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
                {t('common.next', 'Next')} →
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
