import { useState } from "react";
import { BarChart3, Clock, AlertCircle, CheckCircle, Wrench, TrendingUp, Users, DollarSign, Package, FileText, Car, Activity, Zap, ArrowUpRight, Sparkles, Target, Award, Flame, ShieldCheck, Gauge } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import { useAuth } from "@/hooks/useAuth";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Area, AreaChart } from "recharts";
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

  const PIE_COLORS = ['#0A5ED7', '#0BB3FF', '#0A5ED7', '#F97316', '#64748B'];

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
      'maintenance': { bg: 'bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20', text: 'text-[#0A5ED7] dark:text-[#0BB3FF]', icon: '🔧' },
      'repair': { bg: 'bg-[#F97316]/10 dark:bg-[#F97316]/20', text: 'text-[#F97316]', icon: '⚙️' },
      'diagnostic': { bg: 'bg-[#0BB3FF]/10 dark:bg-[#0BB3FF]/20', text: 'text-[#0BB3FF]', icon: '🔍' },
      'inspection': { bg: 'bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20', text: 'text-[#0A5ED7]', icon: '✓' },
      'body_work': { bg: 'bg-[#0B1F3B]/10 dark:bg-[#E6EAF0]/10', text: 'text-[#0B1F3B] dark:text-[#E6EAF0]', icon: '🎨' },
      'tire_service': { bg: 'bg-[#64748B]/10 dark:bg-[#64748B]/20', text: 'text-[#64748B] dark:text-[#9BA4B0]', icon: '⭕' },
    };
    const config = types[serviceType.toLowerCase().replace(/\s+/g, '_')] || { bg: 'bg-[#64748B]/10 dark:bg-[#64748B]/20', text: 'text-[#64748B] dark:text-[#9BA4B0]', icon: '📋' };
    return { ...config, label: serviceType };
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: { bg: string; text: string; icon: string } } = {
      'pending': { bg: 'bg-[#F97316]/10 dark:bg-[#F97316]/20', text: 'text-[#F97316]', icon: '⏳' },
      'assigned': { bg: 'bg-[#0BB3FF]/10 dark:bg-[#0BB3FF]/20', text: 'text-[#0BB3FF]', icon: '👤' },
      'in_progress': { bg: 'bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20', text: 'text-[#0A5ED7] dark:text-[#0BB3FF]', icon: '🔄' },
      'completed': { bg: 'bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20', text: 'text-[#0A5ED7]', icon: '✅' },
      'delivered': { bg: 'bg-[#0B1F3B]/10 dark:bg-[#E6EAF0]/10', text: 'text-[#0B1F3B] dark:text-[#E6EAF0]', icon: '🚗' },
      'cancelled': { bg: 'bg-[#F97316]/10 dark:bg-[#F97316]/20', text: 'text-[#F97316]', icon: '❌' },
    };
    const config = statusColors[status] || { bg: 'bg-[#64748B]/10 dark:bg-[#64748B]/20', text: 'text-[#64748B] dark:text-[#9BA4B0]', icon: '○' };
    return { ...config, label: status };
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors: { [key: string]: { bg: string; text: string; icon: string } } = {
      'urgent': { bg: 'bg-[#F97316] dark:bg-[#ea580c]', text: 'text-white', icon: '🔥' },
      'high': { bg: 'bg-[#F97316] dark:bg-[#ea580c]', text: 'text-white', icon: '⚡' },
      'medium': { bg: 'bg-[#0BB3FF] dark:bg-[#0891b2]', text: 'text-white', icon: '⭐' },
      'low': { bg: 'bg-[#0A5ED7] dark:bg-[#0952C0]', text: 'text-white', icon: '💙' },
    };
    const config = priorityColors[priority] || { bg: 'bg-[#64748B]', text: 'text-white', icon: '○' };
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
      {/* Brand Background - Clean Dark/Light Theme */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#0E1117]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#0A5ED7]/5 to-transparent dark:from-[#0BB3FF]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#0BB3FF]/5 to-transparent dark:from-[#0A5ED7]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-6 space-y-8">
        {/* Hero Header - Brand Design */}
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#0A5ED7] rounded-2xl blur-lg opacity-30 dark:opacity-40"></div>
                  <div className="relative p-3 rounded-2xl bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] shadow-2xl shadow-[#0A5ED7]/25">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-montserrat font-black bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] bg-clip-text text-transparent">
                    {t('dashboard.title', 'Dashboard')}
                  </h1>
                  <p className="text-[#64748B] dark:text-[#9BA4B0] font-light">
                    {t('common.welcome', 'Welcome back')}, <span className="font-semibold text-[#0B1F3B] dark:text-white">{(user as any)?.fullName || (user as any)?.username || 'User'}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="relative group overflow-hidden bg-white dark:bg-[#151A23] backdrop-blur-xl border border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#0A5ED7]/5 dark:hover:bg-[#0BB3FF]/10 text-[#0A5ED7] dark:text-[#0BB3FF] shadow-lg" asChild>
                <Link href="/job-cards">
                  <FileText className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10">{t('dashboard.newJobCard', 'New Job Card')}</span>
                </Link>
              </Button>
              <Button className="relative group overflow-hidden bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C0] hover:to-[#0AA3EE] text-white shadow-xl shadow-[#0A5ED7]/25" asChild>
                <Link href="/vehicles">
                  <Car className="w-4 h-4 mr-2" />
                  {t('dashboard.addVehicle', 'Add Vehicle')}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Metrics - Brand Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Card */}
          <div className="group relative" data-testid="card-revenue">
            <div className="relative h-full bg-white dark:bg-[#151A23] rounded-2xl p-6 border border-[#E2E8F0] dark:border-[#232A36] shadow-sm hover:shadow-lg hover:border-[#0A5ED7]/30 dark:hover:border-[#0BB3FF]/30 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20">
                      <DollarSign className="w-5 h-5 text-[#0A5ED7] dark:text-[#0BB3FF]" />
                    </div>
                    <span className="text-[#64748B] dark:text-[#9BA4B0] text-sm font-medium">{t('dashboard.totalRevenue', 'Total Revenue')}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-[#0B1F3B] dark:text-white font-montserrat">
                      ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </h3>
                    <div className="flex items-center gap-1 text-[#0A5ED7]">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-xs font-medium">+12.5%</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center shadow-lg shadow-[#0A5ED7]/20">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
              <div className="mt-4 h-1 bg-[#0A5ED7]/10 dark:bg-[#0BB3FF]/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full w-[75%]"></div>
              </div>
            </div>
          </div>

          {/* Active Jobs Card */}
          <div className="group relative" data-testid="card-active-jobs">
            <div className="relative h-full bg-white dark:bg-[#151A23] rounded-2xl p-6 border border-[#E2E8F0] dark:border-[#232A36] shadow-sm hover:shadow-lg hover:border-[#0BB3FF]/30 dark:hover:border-[#0BB3FF]/30 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#0BB3FF]/10 dark:bg-[#0BB3FF]/20">
                      <Wrench className="w-5 h-5 text-[#0BB3FF]" />
                    </div>
                    <span className="text-[#64748B] dark:text-[#9BA4B0] text-sm font-medium">{t('dashboard.activeJobs', 'Active Jobs')}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-[#0B1F3B] dark:text-white font-montserrat">{repairCount + checkInCount}</h3>
                    <div className="flex gap-2">
                      <Badge className="bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30 text-xs">{checkInCount} pending</Badge>
                      <Badge className="bg-[#0BB3FF]/10 text-[#0BB3FF] border-[#0BB3FF]/30 text-xs">{repairCount} active</Badge>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#0BB3FF] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#0BB3FF]/20">
                    <Gauge className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customers Card */}
          <div className="group relative" data-testid="card-customers">
            <div className="relative h-full bg-white dark:bg-[#151A23] rounded-2xl p-6 border border-[#E2E8F0] dark:border-[#232A36] shadow-sm hover:shadow-lg hover:border-[#0B1F3B]/30 dark:hover:border-[#E6EAF0]/30 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#0B1F3B]/10 dark:bg-[#E6EAF0]/10">
                      <Users className="w-5 h-5 text-[#0B1F3B] dark:text-[#E6EAF0]" />
                    </div>
                    <span className="text-[#64748B] dark:text-[#9BA4B0] text-sm font-medium">{t('dashboard.totalCustomers', 'Customers')}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-[#0B1F3B] dark:text-white font-montserrat">{activeCustomersCount}</h3>
                    <div className="flex items-center gap-1 text-[#0A5ED7] dark:text-[#0BB3FF]">
                      <Award className="w-4 h-4" />
                      <span className="text-xs font-medium">+8 this week</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#0B1F3B] to-[#1e3a5f] flex items-center justify-center shadow-lg shadow-[#0B1F3B]/20">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="group relative" data-testid="card-inventory">
            <div className="relative h-full bg-white dark:bg-[#151A23] rounded-2xl p-6 border border-[#E2E8F0] dark:border-[#232A36] shadow-sm hover:shadow-lg hover:border-[#F97316]/30 dark:hover:border-[#F97316]/30 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#F97316]/10 dark:bg-[#F97316]/20">
                      <Package className="w-5 h-5 text-[#F97316]" />
                    </div>
                    <span className="text-[#64748B] dark:text-[#9BA4B0] text-sm font-medium">{t('dashboard.partsInventory', 'Inventory')}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-[#0B1F3B] dark:text-white font-montserrat">{inventoryPercentage}%</h3>
                    <p className="text-[#F97316] text-xs">{inStockParts}/{totalInventoryItems} in stock</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="relative w-14 h-14">
                    <svg className="w-14 h-14 transform -rotate-90">
                      <circle cx="28" cy="28" r="24" stroke="rgba(249,115,22,0.2)" strokeWidth="6" fill="none" />
                      <circle cx="28" cy="28" r="24" stroke="url(#inventoryGradient)" strokeWidth="6" fill="none" 
                        strokeDasharray={`${inventoryPercentage * 1.5} 150`} strokeLinecap="round" />
                      <defs>
                        <linearGradient id="inventoryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#F97316" />
                          <stop offset="100%" stopColor="#FB923C" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-[#F97316]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Pipeline - Brand Colors */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Clock, label: t('dashboard.checkIn', 'Check-In'), value: checkInCount, color: 'from-[#F97316] to-[#FB923C]', bgColor: 'bg-[#F97316]/10' },
            { icon: Wrench, label: t('dashboard.repair', 'In Repair'), value: repairCount, color: 'from-[#0A5ED7] to-[#0BB3FF]', bgColor: 'bg-[#0A5ED7]/10' },
            { icon: AlertCircle, label: t('dashboard.qualityCheck', 'QC'), value: qualityCheckCount, color: 'from-[#0BB3FF] to-[#06B6D4]', bgColor: 'bg-[#0BB3FF]/10' },
            { icon: CheckCircle, label: t('dashboard.completed', 'Done'), value: completionCount, color: 'from-[#0A5ED7] to-[#0BB3FF]', bgColor: 'bg-[#0A5ED7]/10' },
            { icon: Car, label: t('dashboard.delivered', 'Delivered'), value: deliveredCount, color: 'from-[#0B1F3B] to-[#1e3a5f]', bgColor: 'bg-[#0B1F3B]/10 dark:bg-[#E6EAF0]/10' },
            { icon: Activity, label: t('dashboard.totalJobs', 'Total'), value: jobCards?.length || 0, color: 'from-[#64748B] to-[#94A3B8]', bgColor: 'bg-[#64748B]/10' },
          ].map((item, index) => (
            <div key={index} className="group relative" data-testid={`card-status-${index}`}>
              <div className={`relative bg-white dark:bg-[#151A23] rounded-2xl p-4 border border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7]/30 dark:hover:border-[#0BB3FF]/30 transition-all hover:-translate-y-1 duration-300 shadow-sm hover:shadow-lg`}>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} shadow-lg`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-[#0B1F3B] dark:text-white font-montserrat">{item.value}</h4>
                    <p className="text-[#64748B] dark:text-[#9BA4B0] text-xs font-medium mt-1">{item.label}</p>
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
              <div className="relative bg-white dark:bg-[#151A23] rounded-2xl p-6 border border-[#E2E8F0] dark:border-[#232A36] shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] shadow-lg shadow-[#0A5ED7]/25">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0B1F3B] dark:text-white">{t('dashboard.revenuePerMonth', 'Revenue Trend')}</h3>
                </div>
                {statsLoading ? (
                  <div className="h-[280px] flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#0A5ED7]/20 border-t-[#0A5ED7] rounded-full animate-spin"></div>
                  </div>
                ) : dashboardStats?.revenue && dashboardStats.revenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={dashboardStats.revenue}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0A5ED7" stopOpacity={0.4}/>
                          <stop offset="100%" stopColor="#0A5ED7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                        contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        labelStyle={{ color: '#0B1F3B' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#0A5ED7" strokeWidth={3} fill="url(#revenueGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-[#64748B] dark:text-[#9BA4B0]">
                    {t('dashboard.noRevenueData', 'No revenue data available')}
                  </div>
                )}
              </div>
            </div>

            {/* Jobs Status Chart */}
            <div className="group relative" data-testid="card-status-chart">
              <div className="relative bg-white dark:bg-[#151A23] rounded-2xl p-6 border border-[#E2E8F0] dark:border-[#232A36] shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-[#0BB3FF] to-[#06B6D4] shadow-lg shadow-[#0BB3FF]/25">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0B1F3B] dark:text-white">{t('dashboard.jobsByStatus', 'Job Distribution')}</h3>
                </div>
                {statsLoading ? (
                  <div className="h-[280px] flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#0BB3FF]/20 border-t-[#0BB3FF] rounded-full animate-spin"></div>
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
                        contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        labelStyle={{ color: '#0B1F3B' }}
                      />
                      <Legend wrapperStyle={{ color: '#64748B', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-[#64748B] dark:text-[#9BA4B0]">
                    {t('dashboard.noJobStatusData', 'No job data available')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats - Brand Design */}
        <div className="group relative">
          <div className="relative bg-white dark:bg-[#151A23] rounded-2xl p-6 border border-[#E2E8F0] dark:border-[#232A36] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] shadow-lg shadow-[#0A5ED7]/25">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0B1F3B] dark:text-white">{t('dashboard.quickStats', 'Performance Overview')}</h3>
              </div>
              <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] dark:text-[#0BB3FF] border-[#0A5ED7]/30">{t('dashboard.allTime', 'All Time')}</Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t('dashboard.totalJobs', 'Total Jobs'), value: jobCards?.length || 0, icon: FileText, color: 'from-[#0A5ED7] to-[#0BB3FF]' },
                { label: t('dashboard.totalInvoices', 'Invoices'), value: invoices.length, icon: DollarSign, color: 'from-[#0A5ED7] to-[#0BB3FF]' },
                { label: t('dashboard.customers', 'Customers'), value: activeCustomersCount, icon: Users, color: 'from-[#0B1F3B] to-[#1e3a5f]' },
                { label: t('dashboard.partsCatalog', 'Parts'), value: spareParts.length, icon: Package, color: 'from-[#F97316] to-[#FB923C]' },
              ].map((stat, index) => (
                <div key={index} className="relative group/stat">
                  <div className={`relative p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36] text-center hover:border-[#0A5ED7]/30 dark:hover:border-[#0BB3FF]/30 transition-all shadow-sm hover:shadow-lg`}>
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-3xl font-black text-[#0B1F3B] dark:text-white font-montserrat">{stat.value}</h4>
                    <p className="text-[#64748B] dark:text-[#9BA4B0] text-sm mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latest Tasks - Brand Design */}
        <div className="group relative" data-testid="card-tasks">
          <div className="relative bg-white dark:bg-[#151A23] rounded-2xl border border-[#E2E8F0] dark:border-[#232A36] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#E2E8F0] dark:border-[#232A36]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-[#F97316] to-[#FB923C] shadow-lg shadow-[#F97316]/25">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0B1F3B] dark:text-white">{t('dashboard.latestTasks', 'Recent Jobs')}</h3>
                </div>
                <Button className="bg-[#0A5ED7]/10 hover:bg-[#0A5ED7]/20 text-[#0A5ED7] dark:text-[#0BB3FF] border-[#0A5ED7]/30" variant="outline" size="sm" asChild>
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
                  <tr className="border-b border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]">
                    <th className="text-left py-4 px-6 text-[#64748B] dark:text-[#9BA4B0] text-xs font-semibold uppercase tracking-wider">{t('table.id', 'ID')}</th>
                    <th className="text-left py-4 px-6 text-[#64748B] dark:text-[#9BA4B0] text-xs font-semibold uppercase tracking-wider">{t('table.service', 'Service')}</th>
                    <th className="text-left py-4 px-6 text-[#64748B] dark:text-[#9BA4B0] text-xs font-semibold uppercase tracking-wider">{t('table.customer', 'Customer')}</th>
                    <th className="text-left py-4 px-6 text-[#64748B] dark:text-[#9BA4B0] text-xs font-semibold uppercase tracking-wider">{t('table.vehicle', 'Vehicle')}</th>
                    <th className="text-left py-4 px-6 text-[#64748B] dark:text-[#9BA4B0] text-xs font-semibold uppercase tracking-wider">{t('common.status', 'Status')}</th>
                    <th className="text-left py-4 px-6 text-[#64748B] dark:text-[#9BA4B0] text-xs font-semibold uppercase tracking-wider">{t('table.priority', 'Priority')}</th>
                    <th className="text-left py-4 px-6 text-[#64748B] dark:text-[#9BA4B0] text-xs font-semibold uppercase tracking-wider">{t('common.actions', 'Action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="w-8 h-8 mx-auto border-4 border-[#0A5ED7]/20 border-t-[#0A5ED7] rounded-full animate-spin"></div>
                      </td>
                    </tr>
                  ) : latestTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-white/40">{t('dashboard.noTasksAvailable', 'No tasks available')}</td>
                    </tr>
                  ) : (
                    latestTasks.map((task) => {
                      const serviceConfig = getServiceTypeBadge(task.serviceType);
                      const statusConfig = getStatusBadge(task.status);
                      const priorityConfig = getPriorityBadge(task.priority);
                      const vehicleInfo = task.vehicleInfo as any;
                      
                      return (
                        <tr key={task.id} className="border-b border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#0A5ED7]/5 dark:hover:bg-[#0BB3FF]/5 transition-colors" data-testid={`row-task-${task.id}`}>
                          <td className="py-4 px-6">
                            <span className="font-mono text-sm font-bold text-[#0A5ED7] dark:text-[#0BB3FF]">#{shortenId(task.id)}</span>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={`${serviceConfig.bg} ${serviceConfig.text} border-0`}>
                              {serviceConfig.icon} {serviceConfig.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-[#0B1F3B] dark:text-[#E6EAF0] text-sm">
                            {vehicleInfo?.customerName || vehicleInfo?.owner || 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-[#64748B] dark:text-[#9BA4B0] text-sm">
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
                              className="bg-[#0A5ED7]/10 dark:bg-[#0BB3FF]/10 hover:bg-[#0A5ED7]/20 dark:hover:bg-[#0BB3FF]/20 text-[#0A5ED7] dark:text-[#0BB3FF] border-[#0A5ED7]/30 dark:border-[#0BB3FF]/30"
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
              <div className="p-4 border-t border-[#E2E8F0] dark:border-[#232A36] flex items-center justify-between">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-white dark:bg-[#151A23] hover:bg-[#0A5ED7]/5 dark:hover:bg-[#0BB3FF]/10 text-[#0B1F3B] dark:text-[#E6EAF0] border-[#E2E8F0] dark:border-[#232A36] disabled:opacity-30"
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
                        ? 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0' 
                        : 'bg-white dark:bg-[#151A23] hover:bg-[#0A5ED7]/5 dark:hover:bg-[#0BB3FF]/10 text-[#0B1F3B] dark:text-[#E6EAF0] border-[#E2E8F0] dark:border-[#232A36]'
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
                  className="bg-white dark:bg-[#151A23] hover:bg-[#0A5ED7]/5 dark:hover:bg-[#0BB3FF]/10 text-[#0B1F3B] dark:text-[#E6EAF0] border-[#E2E8F0] dark:border-[#232A36] disabled:opacity-30"
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
