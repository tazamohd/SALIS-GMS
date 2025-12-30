import { useState } from "react";
import { BarChart3, Clock, AlertCircle, CheckCircle, Wrench, TrendingUp, Users, DollarSign, Package, FileText, Car, CalendarDays, Activity, Zap, ArrowUpRight, ArrowDownRight, Sparkles, Target, Award, Flame, Timer, ShieldCheck, Gauge, CircleDot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Area, AreaChart } from "recharts";
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 dark:from-black dark:via-purple-950/30 dark:to-black"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative p-6 space-y-8">
        {/* Hero Header */}
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                  <div className="relative p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-montserrat font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    {t('dashboard.title', 'Dashboard')}
                  </h1>
                  <p className="text-purple-300/80 font-light">
                    {t('common.welcome', 'Welcome back')}, <span className="font-semibold text-white">{(user as any)?.fullName || (user as any)?.username || 'User'}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="relative group overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white shadow-xl" asChild>
                <Link href="/job-cards">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-pink-600/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <FileText className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10">{t('dashboard.newJobCard', 'New Job Card')}</span>
                </Link>
              </Button>
              <Button className="relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl shadow-purple-500/25" asChild>
                <Link href="/vehicles">
                  <Car className="w-4 h-4 mr-2" />
                  {t('dashboard.addVehicle', 'Add Vehicle')}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Metrics - Glassmorphism Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Card */}
          <div className="group relative" data-testid="card-revenue">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative h-full backdrop-blur-xl bg-white/10 dark:bg-black/30 rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/20">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-emerald-300/80 text-sm font-medium">{t('dashboard.totalRevenue', 'Total Revenue')}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-white font-montserrat">
                      ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </h3>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-xs font-medium">+12.5%</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl"></div>
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full w-[75%] animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Active Jobs Card */}
          <div className="group relative" data-testid="card-active-jobs">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative h-full backdrop-blur-xl bg-white/10 dark:bg-black/30 rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-500/20">
                      <Wrench className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-blue-300/80 text-sm font-medium">{t('dashboard.activeJobs', 'Active Jobs')}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-white font-montserrat">{repairCount + checkInCount}</h3>
                    <div className="flex gap-2">
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">{checkInCount} pending</Badge>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">{repairCount} active</Badge>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl"></div>
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                    <Gauge className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customers Card */}
          <div className="group relative" data-testid="card-customers">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative h-full backdrop-blur-xl bg-white/10 dark:bg-black/30 rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-violet-500/20">
                      <Users className="w-5 h-5 text-violet-400" />
                    </div>
                    <span className="text-violet-300/80 text-sm font-medium">{t('dashboard.totalCustomers', 'Customers')}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-white font-montserrat">{activeCustomersCount}</h3>
                    <div className="flex items-center gap-1 text-violet-400">
                      <Award className="w-4 h-4" />
                      <span className="text-xs font-medium">+8 this week</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-500/30 rounded-full blur-xl"></div>
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="group relative" data-testid="card-inventory">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative h-full backdrop-blur-xl bg-white/10 dark:bg-black/30 rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/20">
                      <Package className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-amber-300/80 text-sm font-medium">{t('dashboard.partsInventory', 'Inventory')}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-white font-montserrat">{inventoryPercentage}%</h3>
                    <p className="text-amber-300/70 text-xs">{inStockParts}/{totalInventoryItems} in stock</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl"></div>
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                      <circle cx="32" cy="32" r="28" stroke="url(#inventoryGradient)" strokeWidth="8" fill="none" 
                        strokeDasharray={`${inventoryPercentage * 1.76} 176`} strokeLinecap="round" />
                      <defs>
                        <linearGradient id="inventoryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#ea580c" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-amber-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Pipeline - Neon Style */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Clock, label: t('dashboard.checkIn', 'Check-In'), value: checkInCount, color: 'from-yellow-500 to-amber-500', glow: 'yellow' },
            { icon: Wrench, label: t('dashboard.repair', 'In Repair'), value: repairCount, color: 'from-blue-500 to-indigo-500', glow: 'blue' },
            { icon: AlertCircle, label: t('dashboard.qualityCheck', 'QC'), value: qualityCheckCount, color: 'from-purple-500 to-violet-500', glow: 'purple' },
            { icon: CheckCircle, label: t('dashboard.completed', 'Done'), value: completionCount, color: 'from-green-500 to-emerald-500', glow: 'green' },
            { icon: Car, label: t('dashboard.delivered', 'Delivered'), value: deliveredCount, color: 'from-teal-500 to-cyan-500', glow: 'teal' },
            { icon: Activity, label: t('dashboard.totalJobs', 'Total'), value: jobCards?.length || 0, color: 'from-rose-500 to-pink-500', glow: 'rose' },
          ].map((item, index) => (
            <div key={index} className="group relative" data-testid={`card-status-${index}`}>
              <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-all duration-300`}></div>
              <div className="relative backdrop-blur-xl bg-white/5 dark:bg-black/20 rounded-2xl p-4 border border-white/10 hover:border-white/30 transition-all hover:scale-105 hover:-translate-y-1 duration-300">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-white font-montserrat">{item.value}</h4>
                    <p className="text-white/60 text-xs font-medium mt-1">{item.label}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        {!isTechnician && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="group relative" data-testid="card-revenue-chart">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/50 to-teal-600/50 rounded-3xl blur opacity-30"></div>
              <div className="relative backdrop-blur-xl bg-white/5 dark:bg-black/20 rounded-3xl p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{t('dashboard.revenuePerMonth', 'Revenue Trend')}</h3>
                </div>
                {statsLoading ? (
                  <div className="h-[280px] flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                  </div>
                ) : dashboardStats?.revenue && dashboardStats.revenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={dashboardStats.revenue}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                        contentStyle={{ backgroundColor: 'rgba(17,24,39,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#revenueGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-white/40">
                    {t('dashboard.noRevenueData', 'No revenue data available')}
                  </div>
                )}
              </div>
            </div>

            {/* Jobs Status Chart */}
            <div className="group relative" data-testid="card-status-chart">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/50 to-purple-600/50 rounded-3xl blur opacity-30"></div>
              <div className="relative backdrop-blur-xl bg-white/5 dark:bg-black/20 rounded-3xl p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{t('dashboard.jobsByStatus', 'Job Distribution')}</h3>
                </div>
                {statsLoading ? (
                  <div className="h-[280px] flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
                  </div>
                ) : dashboardStats?.jobStatus && dashboardStats.jobStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={dashboardStats.jobStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                      >
                        {dashboardStats.jobStatus.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(17,24,39,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-white/40">
                    {t('dashboard.noJobStatusData', 'No job data available')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-blue-600/30 rounded-3xl blur"></div>
          <div className="relative backdrop-blur-xl bg-white/5 dark:bg-black/20 rounded-3xl p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">{t('dashboard.quickStats', 'Performance Overview')}</h3>
              </div>
              <Badge className="bg-white/10 text-white/80 border-white/20">{t('dashboard.allTime', 'All Time')}</Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t('dashboard.totalJobs', 'Total Jobs'), value: jobCards?.length || 0, icon: FileText, color: 'from-blue-500 to-cyan-500' },
                { label: t('dashboard.totalInvoices', 'Invoices'), value: invoices.length, icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
                { label: t('dashboard.customers', 'Customers'), value: activeCustomersCount, icon: Users, color: 'from-violet-500 to-purple-500' },
                { label: t('dashboard.partsCatalog', 'Parts'), value: spareParts.length, icon: Package, color: 'from-amber-500 to-orange-500' },
              ].map((stat, index) => (
                <div key={index} className="relative group/stat">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-20 group-hover/stat:opacity-40 transition-opacity`}></div>
                  <div className="relative p-5 rounded-2xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-all">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-3xl font-black text-white font-montserrat">{stat.value}</h4>
                    <p className="text-white/50 text-sm mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latest Tasks */}
        <div className="group relative" data-testid="card-tasks">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-3xl blur"></div>
          <div className="relative backdrop-blur-xl bg-white/5 dark:bg-black/20 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{t('dashboard.latestTasks', 'Recent Jobs')}</h3>
                </div>
                <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20" variant="outline" size="sm" asChild>
                  <Link href="/job-cards">
                    {t('common.viewAll', 'View All')}
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-4 px-6 text-white/60 text-xs font-semibold uppercase tracking-wider">{t('table.id', 'ID')}</th>
                    <th className="text-left py-4 px-6 text-white/60 text-xs font-semibold uppercase tracking-wider">{t('table.service', 'Service')}</th>
                    <th className="text-left py-4 px-6 text-white/60 text-xs font-semibold uppercase tracking-wider">{t('table.customer', 'Customer')}</th>
                    <th className="text-left py-4 px-6 text-white/60 text-xs font-semibold uppercase tracking-wider">{t('table.vehicle', 'Vehicle')}</th>
                    <th className="text-left py-4 px-6 text-white/60 text-xs font-semibold uppercase tracking-wider">{t('common.status', 'Status')}</th>
                    <th className="text-left py-4 px-6 text-white/60 text-xs font-semibold uppercase tracking-wider">{t('table.priority', 'Priority')}</th>
                    <th className="text-left py-4 px-6 text-white/60 text-xs font-semibold uppercase tracking-wider">{t('common.actions', 'Action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="w-8 h-8 mx-auto border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                      </td>
                    </tr>
                  ) : latestTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-white/40">{t('dashboard.noTasksAvailable', 'No tasks available')}</td>
                    </tr>
                  ) : (
                    latestTasks.map((task, index) => {
                      const serviceConfig = getServiceTypeBadge(task.serviceType);
                      const statusConfig = getStatusBadge(task.status);
                      const priorityConfig = getPriorityBadge(task.priority);
                      const vehicleInfo = task.vehicleInfo as any;
                      
                      return (
                        <tr key={task.id} className="border-b border-white/5 hover:bg-white/5 transition-colors" data-testid={`row-task-${task.id}`}>
                          <td className="py-4 px-6">
                            <span className="font-mono text-sm font-bold text-purple-400">#{shortenId(task.id)}</span>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={`${serviceConfig.bg} ${serviceConfig.text} border-0`}>
                              {serviceConfig.icon} {serviceConfig.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-white/80 text-sm">
                            {vehicleInfo?.customerName || vehicleInfo?.owner || 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-white/60 text-sm">
                            {vehicleInfo?.make} {vehicleInfo?.model}
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0`}>
                              {statusConfig.icon} {statusConfig.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={`${priorityConfig.bg} ${priorityConfig.text} border-0 shadow-lg`}>
                              {priorityConfig.icon} {priorityConfig.label.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <Button 
                              size="sm" 
                              onClick={() => handleViewTask(task)}
                              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                              variant="outline"
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
              <div className="p-4 border-t border-white/10 flex items-center justify-between">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-30"
                >
                  ← {t('common.previous', 'Prev')}
                </Button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <Button 
                      key={page} 
                      size="sm"
                      onClick={() => goToPage(page)}
                      className={page === currentPage 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0' 
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                      }
                      variant={page === currentPage ? 'default' : 'outline'}
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
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-30"
                >
                  {t('common.next', 'Next')} →
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskDetailsDialog 
        open={taskDetailsOpen}
        onOpenChange={setTaskDetailsOpen}
        task={selectedTask}
      />
    </div>
  );
}
