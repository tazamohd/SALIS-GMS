import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, FileText, TrendingUp, DollarSign, Plus, Edit, Trash2, MapPin, Wrench, Users, Package, BarChart3 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertFranchiseGroupSchema, insertFranchiseContractSchema, insertFranchiseKpiSchema, insertRevenueSharingRuleSchema } from "@shared/schema";
import { z } from "zod";
import { TabsPageLayout } from "@/components/layouts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type InsertFranchiseGroup = z.infer<typeof insertFranchiseGroupSchema>;
type InsertFranchiseContract = z.infer<typeof insertFranchiseContractSchema>;
type InsertFranchiseKpi = z.infer<typeof insertFranchiseKpiSchema>;
type InsertRevenueSharingRule = z.infer<typeof insertRevenueSharingRuleSchema>;

type FranchiseGroup = {
  id: string;
  name: string;
  description: string | null;
  headquarters: string | null;
  totalBranches: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type FranchiseContract = {
  id: string;
  franchiseGroupId: string;
  branchId: string;
  contractNumber: string;
  startDate: Date;
  endDate: Date | null;
  status: string | null;
  terms: string | null;
  royaltyPercentage: string | null;
  marketingFeePercentage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type FranchiseKpi = {
  id: string;
  branchId: string;
  month: string;
  totalRevenue: string | null;
  totalJobCards: number | null;
  customerSatisfaction: string | null;
  royaltyPaid: string | null;
  marketingFeePaid: string | null;
  createdAt: Date;
};

type RevenueSharingRule = {
  id: string;
  franchiseGroupId: string;
  revenueType: string;
  franchisePercentage: string;
  corporatePercentage: string;
  isActive: boolean;
  createdAt: Date;
};

export default function FranchiseManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("locations");
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [showKpiDialog, setShowKpiDialog] = useState(false);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FranchiseGroup | null>(null);
  const [editingContract, setEditingContract] = useState<FranchiseContract | null>(null);
  const [editingKpi, setEditingKpi] = useState<FranchiseKpi | null>(null);
  const [editingRule, setEditingRule] = useState<RevenueSharingRule | null>(null);

  const { data: franchiseGroups = [], isLoading: groupsLoading } = useQuery<FranchiseGroup[]>({
    queryKey: ["/api/franchise-groups"],
  });

  const { data: franchiseContracts = [], isLoading: contractsLoading } = useQuery<FranchiseContract[]>({
    queryKey: ["/api/franchise-contracts"],
  });

  const { data: revenueSharingRules = [], isLoading: rulesLoading } = useQuery<RevenueSharingRule[]>({
    queryKey: ["/api/revenue-sharing-rules"],
  });

  // Multi-location analytics queries
  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery<{
    revenueByLocation: Array<{ location: string; revenue: number; invoiceCount: number }>;
    jobsByLocation: Array<{ location: string; totalJobs: number; completedJobs: number; activeJobs: number }>;
    customersByLocation: Array<{ location: string; customers: number }>;
    summary: { totalLocations: number; totalRevenue: number; totalJobs: number; totalCustomers: number };
  }>({ queryKey: ["/api/franchise/analytics"] });

  const { data: locationsData, isLoading: loadingLocations } = useQuery<{
    locations: Array<{ id: number; name: string; address: string; phone: string; email: string; isActive: boolean; createdAt: string }>;
  }>({ queryKey: ["/api/franchise/locations"] });

  const { data: performanceData, isLoading: loadingPerformance } = useQuery<{
    performance: Array<{ location: string; revenue: number; jobs: number; completed: number; completionRate: number }>;
  }>({ queryKey: ["/api/franchise/performance"] });

  const { data: inventoryData, isLoading: loadingInventory } = useQuery<{
    inventory: Array<{ location: string; partName: string; partNumber: string; stockQuantity: number; minQuantity: number; sellingPrice: number }>;
  }>({ queryKey: ["/api/franchise/inventory-sharing"] });

  const analytics = analyticsData || {
    revenueByLocation: [], jobsByLocation: [], customersByLocation: [],
    summary: { totalLocations: 0, totalRevenue: 0, totalJobs: 0, totalCustomers: 0 },
  };
  const locations = locationsData?.locations || [];
  const performance = performanceData?.performance || [];
  const inventory = inventoryData?.inventory || [];

  const revenueChartData = analytics.revenueByLocation.map((r) => ({
    name: r.location, revenue: Number(r.revenue || 0), invoices: Number(r.invoiceCount || 0),
  }));
  const jobsChartData = analytics.jobsByLocation.map((j) => ({
    name: j.location, completed: Number(j.completedJobs || 0), active: Number(j.activeJobs || 0), total: Number(j.totalJobs || 0),
  }));

  const groupForm = useForm<InsertFranchiseGroup>({
    resolver: zodResolver(insertFranchiseGroupSchema),
    defaultValues: {
      name: "",
      description: undefined,
      headquarters: undefined,
      totalBranches: undefined,
      isActive: true,
    },
  });

  const contractForm = useForm<InsertFranchiseContract>({
    resolver: zodResolver(insertFranchiseContractSchema),
    defaultValues: {
      franchiseGroupId: "",
      branchId: "",
      contractNumber: "",
      startDate: new Date(),
      endDate: undefined,
      status: "active",
      terms: undefined,
      royaltyPercentage: undefined,
      marketingFeePercentage: undefined,
    },
  });

  const kpiForm = useForm<InsertFranchiseKpi>({
    resolver: zodResolver(insertFranchiseKpiSchema),
    defaultValues: {
      branchId: "",
      month: new Date().toISOString().slice(0, 7),
      totalRevenue: undefined,
      totalJobCards: undefined,
      customerSatisfaction: undefined,
      royaltyPaid: undefined,
      marketingFeePaid: undefined,
    },
  });

  const ruleForm = useForm<InsertRevenueSharingRule>({
    resolver: zodResolver(insertRevenueSharingRuleSchema),
    defaultValues: {
      franchiseGroupId: "",
      revenueType: "all",
      franchisePercentage: "0",
      corporatePercentage: "100",
      isActive: true,
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: InsertFranchiseGroup) => apiRequest("/api/franchise-groups", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-groups"] });
      toast({ title: t('franchise.groupCreatedSuccess', 'Franchise group created successfully') });
      setShowGroupDialog(false);
      groupForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: t('franchise.errorCreatingGroup', 'Error creating franchise group'), description: error.message, variant: "destructive" });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertFranchiseGroup> }) => apiRequest(`/api/franchise-groups/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-groups"] });
      toast({ title: t('franchise.groupUpdatedSuccess', 'Franchise group updated successfully') });
      setShowGroupDialog(false);
      setEditingGroup(null);
      groupForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: t('franchise.errorUpdatingGroup', 'Error updating franchise group'), description: error.message, variant: "destructive" });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/franchise-groups/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-groups"] });
      toast({ title: t('franchise.groupDeletedSuccess', 'Franchise group deleted successfully') });
    },
    onError: (error: Error) => {
      toast({ title: t('franchise.errorDeletingGroup', 'Error deleting franchise group'), description: error.message, variant: "destructive" });
    },
  });

  const createContractMutation = useMutation({
    mutationFn: (data: InsertFranchiseContract) => apiRequest("/api/franchise-contracts", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-contracts"] });
      toast({ title: t('franchise.contractCreatedSuccess', 'Franchise contract created successfully') });
      setShowContractDialog(false);
      contractForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: t('franchise.errorCreatingContract', 'Error creating franchise contract'), description: error.message, variant: "destructive" });
    },
  });

  const updateContractMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertFranchiseContract> }) => apiRequest(`/api/franchise-contracts/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-contracts"] });
      toast({ title: t('franchise.contractUpdatedSuccess', 'Franchise contract updated successfully') });
      setShowContractDialog(false);
      setEditingContract(null);
      contractForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: t('franchise.errorUpdatingContract', 'Error updating franchise contract'), description: error.message, variant: "destructive" });
    },
  });

  const createKpiMutation = useMutation({
    mutationFn: (data: InsertFranchiseKpi) => apiRequest("/api/franchise-kpis", "POST", data),
    onSuccess: () => {
      toast({ title: t('franchise.kpiCreatedSuccess', 'Franchise KPI created successfully') });
      setShowKpiDialog(false);
      kpiForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: t('franchise.errorCreatingKpi', 'Error creating franchise KPI'), description: error.message, variant: "destructive" });
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: (data: InsertRevenueSharingRule) => apiRequest("/api/revenue-sharing-rules", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/revenue-sharing-rules"] });
      toast({ title: t('franchise.ruleCreatedSuccess', 'Revenue sharing rule created successfully') });
      setShowRuleDialog(false);
      ruleForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: t('franchise.errorCreatingRule', 'Error creating revenue sharing rule'), description: error.message, variant: "destructive" });
    },
  });

  const onGroupSubmit = (data: InsertFranchiseGroup) => {
    if (editingGroup) {
      updateGroupMutation.mutate({ id: editingGroup.id, data });
    } else {
      createGroupMutation.mutate(data);
    }
  };

  const onContractSubmit = (data: InsertFranchiseContract) => {
    if (editingContract) {
      updateContractMutation.mutate({ id: editingContract.id, data });
    } else {
      createContractMutation.mutate(data);
    }
  };

  const onKpiSubmit = (data: InsertFranchiseKpi) => {
    createKpiMutation.mutate(data);
  };

  const onRuleSubmit = (data: InsertRevenueSharingRule) => {
    createRuleMutation.mutate(data);
  };

  const handleEditGroup = (group: FranchiseGroup) => {
    setEditingGroup(group);
    groupForm.reset({
      name: group.name,
      description: group.description || undefined,
      headquarters: group.headquarters || undefined,
      totalBranches: group.totalBranches || undefined,
      isActive: group.isActive,
    });
    setShowGroupDialog(true);
  };

  const handleEditContract = (contract: FranchiseContract) => {
    setEditingContract(contract);
    contractForm.reset({
      franchiseGroupId: contract.franchiseGroupId,
      branchId: contract.branchId,
      contractNumber: contract.contractNumber,
      startDate: new Date(contract.startDate),
      endDate: contract.endDate ? new Date(contract.endDate) : undefined,
      status: contract.status || undefined,
      terms: contract.terms || undefined,
      royaltyPercentage: contract.royaltyPercentage || undefined,
      marketingFeePercentage: contract.marketingFeePercentage || undefined,
    });
    setShowContractDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: { bg: string; text: string; icon: string } } = {
      draft: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: '📝' },
      active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: '✅' },
      pending: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', icon: '⏳' },
      expired: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: '❌' },
    };
    const config = statusColors[status] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: '○' };

    const statusLabels: { [key: string]: string } = {
      draft: t('common.draft', 'Draft'),
      active: t('common.active', 'Active'),
      pending: t('common.pending', 'Pending'),
      expired: t('franchise.expired', 'Expired'),
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`} data-testid={`status-${status}`}>
        <span>{config.icon}</span>
        {statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const tabsConfig = [
    {
      id: "locations",
      label: t('franchise.locationOverview', 'Location Overview'),
      icon: MapPin,
      content: (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#0A5ED7]/10"><Building2 className="w-5 h-5 text-[#0A5ED7]" /></div>
                  <div><div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.summary.totalLocations}</div><div className="text-xs text-gray-500">{t('franchise.totalLocations', 'Total Locations')}</div></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#10B981]/10"><DollarSign className="w-5 h-5 text-[#10B981]" /></div>
                  <div><div className="text-2xl font-bold text-gray-900 dark:text-white">SAR {analytics.summary.totalRevenue.toLocaleString()}</div><div className="text-xs text-gray-500">{t('franchise.totalRevenue', 'Total Revenue')}</div></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#0BB3FF]/10"><Wrench className="w-5 h-5 text-[#0BB3FF]" /></div>
                  <div><div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.summary.totalJobs}</div><div className="text-xs text-gray-500">{t('franchise.totalJobs', 'Total Jobs')}</div></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#6366F1]/10"><Users className="w-5 h-5 text-[#6366F1]" /></div>
                  <div><div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.summary.totalCustomers}</div><div className="text-xs text-gray-500">{t('franchise.totalCustomers', 'Total Customers')}</div></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location Cards */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('franchise.locations', 'Locations')}</h3>
            {loadingLocations ? (
              <div className="text-sm text-gray-500">{t('common.loading', 'Loading...')}</div>
            ) : locations.length === 0 ? (
              <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
                <CardContent className="py-12 text-center text-gray-500">{t('franchise.noLocationsFound', 'No locations found. Add garages to enable franchise management.')}</CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map((loc) => {
                  const locRevenue = analytics.revenueByLocation.find((r) => r.location === loc.name);
                  const locJobs = analytics.jobsByLocation.find((j) => j.location === loc.name);
                  const locCustomers = analytics.customersByLocation.find((c) => c.location === loc.name);
                  return (
                    <Card key={loc.id} className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23] hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-semibold text-[#0B1F3B] dark:text-white">{loc.name}</CardTitle>
                          <Badge variant={loc.isActive ? "default" : "secondary"}>{loc.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}</Badge>
                        </div>
                        {loc.address && <div className="flex items-center gap-1 text-sm text-gray-500"><MapPin className="w-3 h-3" />{loc.address}</div>}
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div><div className="text-lg font-bold text-[#0A5ED7]">{Number(locRevenue?.revenue || 0).toLocaleString()}</div><div className="text-xs text-gray-500">Revenue (SAR)</div></div>
                          <div><div className="text-lg font-bold text-[#0BB3FF]">{Number(locJobs?.totalJobs || 0)}</div><div className="text-xs text-gray-500">Jobs</div></div>
                          <div><div className="text-lg font-bold text-[#6366F1]">{Number(locCustomers?.customers || 0)}</div><div className="text-xs text-gray-500">Customers</div></div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base text-[#0B1F3B] dark:text-white"><BarChart3 className="w-5 h-5 text-[#0A5ED7]" />{t('franchise.revenueByLocation', 'Revenue by Location')}</CardTitle></CardHeader>
              <CardContent>
                {revenueChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => [`SAR ${value.toLocaleString()}`, "Revenue"]} />
                      <Bar dataKey="revenue" fill="#0A5ED7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">{t('franchise.noRevenueData', 'No revenue data available')}</div>
                )}
              </CardContent>
            </Card>
            <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base text-[#0B1F3B] dark:text-white"><Wrench className="w-5 h-5 text-[#0BB3FF]" />{t('franchise.jobsByLocation', 'Jobs by Location')}</CardTitle></CardHeader>
              <CardContent>
                {jobsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={jobsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#10B981" name={t('franchise.completed', 'Completed')} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="active" fill="#0BB3FF" name={t('franchise.active', 'Active')} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">{t('franchise.noJobData', 'No job data available')}</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "performance",
      label: t('franchise.performanceComparison', 'Performance'),
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-[#0B1F3B] dark:text-white">
                <TrendingUp className="w-5 h-5 text-[#0A5ED7]" />
                {t('franchise.locationPerformanceComparison', 'Location Performance Comparison')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPerformance ? (
                <div className="text-sm text-gray-500">{t('common.loading', 'Loading...')}</div>
              ) : performance.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">{t('franchise.noPerformanceData', 'No performance data available')}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">{t('franchise.location', 'Location')}</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">{t('franchise.revenueSAR', 'Revenue (SAR)')}</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">{t('franchise.totalJobsLabel', 'Total Jobs')}</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">{t('franchise.completedLabel', 'Completed')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 w-48">{t('franchise.completionRate', 'Completion Rate')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performance.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1A1F2E]">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{row.location}</td>
                          <td className="py-3 px-4 text-right font-semibold text-[#0A5ED7]">{Number(row.revenue || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{Number(row.jobs || 0)}</td>
                          <td className="py-3 px-4 text-right">{Number(row.completed || 0)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Progress value={Number(row.completionRate || 0)} className="h-2 flex-1" />
                              <span className="text-xs font-medium w-10 text-right">{Number(row.completionRate || 0)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "inventory-sharing",
      label: t('franchise.inventorySharing', 'Inventory Sharing'),
      icon: Package,
      content: (
        <div className="space-y-4">
          <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-[#0B1F3B] dark:text-white">
                <Package className="w-5 h-5 text-[#6366F1]" />
                {t('franchise.crossLocationInventory', 'Cross-Location Inventory Availability')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingInventory ? (
                <div className="text-sm text-gray-500">{t('common.loading', 'Loading...')}</div>
              ) : inventory.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">{t('franchise.noInventoryData', 'No cross-location inventory data available')}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">{t('franchise.partName', 'Part Name')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">{t('franchise.partNumber', 'Part Number')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">{t('franchise.location', 'Location')}</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">{t('franchise.stock', 'Stock')}</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">{t('franchise.minQty', 'Min Qty')}</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">{t('franchise.priceSAR', 'Price (SAR)')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">{t('common.status', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item, idx) => {
                        const isLow = Number(item.stockQuantity) <= Number(item.minQuantity);
                        return (
                          <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1A1F2E]">
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{item.partName}</td>
                            <td className="py-3 px-4 text-gray-500">{item.partNumber}</td>
                            <td className="py-3 px-4">{item.location}</td>
                            <td className="py-3 px-4 text-right font-semibold">{Number(item.stockQuantity)}</td>
                            <td className="py-3 px-4 text-right">{Number(item.minQuantity)}</td>
                            <td className="py-3 px-4 text-right">{Number(item.sellingPrice || 0).toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <Badge variant={isLow ? "destructive" : "default"}>{isLow ? t('franchise.lowStock', 'Low Stock') : t('franchise.inStock', 'In Stock')}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "groups",
      label: t('franchise.franchiseGroups', 'Franchise Groups'),
      icon: Building2,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">{t('franchise.franchiseGroups', 'Franchise Groups')}</h2>
            <Button onClick={() => { setEditingGroup(null); groupForm.reset(); setShowGroupDialog(true); }} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" data-testid="button-add-group">
              <Plus className="h-4 w-4 mr-2" />
              {t('franchise.addFranchiseGroup', 'Add Franchise Group')}
            </Button>
          </div>

          <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('franchise.name', 'Name')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('franchise.headquarters', 'Headquarters')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white text-right">{t('common.actions', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-[#64748B]">{t('common.loading', 'Loading...')}</TableCell>
                    </TableRow>
                  ) : franchiseGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-[#64748B]">{t('franchise.noFranchiseGroupsFound', 'No franchise groups found')}</TableCell>
                    </TableRow>
                  ) : (
                    franchiseGroups.map((group) => (
                      <TableRow key={group.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-group-${group.id}`}>
                        <TableCell className="text-[#0B1F3B] dark:text-white">
                          <div>
                            <div className="font-medium">{group.name}</div>
                            {group.description && (
                              <div className="text-sm text-[#64748B]">{group.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-[#0B1F3B] dark:text-white">
                          {group.headquarters ? (
                            <div className="text-sm">{group.headquarters}</div>
                          ) : (
                            <div className="text-sm text-[#64748B]">-</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {group.isActive ? (
                            <Badge variant="default" data-testid="status-active">{t('common.active', 'Active')}</Badge>
                          ) : (
                            <Badge variant="secondary" data-testid="status-inactive">{t('common.inactive', 'Inactive')}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditGroup(group)} data-testid={`button-edit-${group.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteGroupMutation.mutate(group.id)} data-testid={`button-delete-${group.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "contracts",
      label: t('franchise.contracts', 'Contracts'),
      icon: FileText,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">{t('franchise.franchiseContracts', 'Franchise Contracts')}</h2>
            <Button onClick={() => { setEditingContract(null); contractForm.reset(); setShowContractDialog(true); }} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" data-testid="button-add-contract">
              <Plus className="h-4 w-4 mr-2" />
              {t('franchise.addContract', 'Add Contract')}
            </Button>
          </div>

          <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('franchise.contractNumber', 'Contract #')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('franchise.period', 'Period')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('franchise.fees', 'Fees')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white text-right">{t('common.actions', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-[#64748B]">{t('common.loading', 'Loading...')}</TableCell>
                    </TableRow>
                  ) : franchiseContracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-[#64748B]">{t('franchise.noFranchiseContractsFound', 'No franchise contracts found')}</TableCell>
                    </TableRow>
                  ) : (
                    franchiseContracts.map((contract) => (
                      <TableRow key={contract.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-contract-${contract.id}`}>
                        <TableCell className="text-[#0B1F3B] dark:text-white font-medium">{contract.contractNumber}</TableCell>
                        <TableCell className="text-[#0B1F3B] dark:text-white">
                          <div className="text-sm">
                            {new Date(contract.startDate).toLocaleDateString()} - {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : t('franchise.ongoing', 'Ongoing')}
                          </div>
                        </TableCell>
                        <TableCell className="text-[#0B1F3B] dark:text-white">
                          <div className="text-sm">
                            {contract.royaltyPercentage && <div>{t('franchise.royalty', 'Royalty')}: {contract.royaltyPercentage}%</div>}
                            {contract.marketingFeePercentage && <div className="text-[#64748B]">{t('franchise.marketing', 'Marketing')}: {contract.marketingFeePercentage}%</div>}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(contract.status || "active")}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditContract(contract)} data-testid={`button-edit-${contract.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "kpis",
      label: t('franchise.kpis', 'KPIs'),
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">{t('franchise.franchiseKpis', 'Franchise KPIs')}</h2>
            <Button onClick={() => { setEditingKpi(null); kpiForm.reset(); setShowKpiDialog(true); }} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" data-testid="button-add-kpi">
              <Plus className="h-4 w-4 mr-2" />
              {t('franchise.addKpiReport', 'Add KPI Report')}
            </Button>
          </div>

          <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('franchise.performanceMetrics', 'Performance Metrics')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('franchise.trackFranchisePerformance', 'Track franchise performance across key metrics')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#64748B]">{t('franchise.selectBranchToViewKpi', 'Select a branch to view KPI reports')}</p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "revenue",
      label: t('franchise.revenueSharing', 'Revenue Sharing'),
      icon: DollarSign,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">{t('franchise.revenueSharingRules', 'Revenue Sharing Rules')}</h2>
            <Button onClick={() => { setEditingRule(null); ruleForm.reset(); setShowRuleDialog(true); }} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" data-testid="button-add-rule">
              <Plus className="h-4 w-4 mr-2" />
              {t('franchise.addRevenueRule', 'Add Revenue Rule')}
            </Button>
          </div>

          <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('franchise.revenueDistribution', 'Revenue Distribution')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('franchise.manageRevenueSharingAgreements', 'Manage revenue sharing agreements between franchisor and franchisees')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">{t('franchise.noRevenueSharingRulesConfigured', 'No revenue sharing rules configured')}</p>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <>
      <TabsPageLayout
        title={t('franchise.franchiseCommandCenter', 'Franchise Command Center')}
        description={t('franchise.franchiseCommandCenterDescription', 'Manage franchise groups, contracts, KPIs, and revenue sharing across your network')}
        icon={Building2}
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent className="bg-background dark:bg-background border-border dark:border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground dark:text-foreground">{editingGroup ? t('franchise.editFranchiseGroup', 'Edit Franchise Group') : t('franchise.addFranchiseGroup', 'Add Franchise Group')}</DialogTitle>
            <DialogDescription className="text-muted-foreground dark:text-muted-foreground">
              {editingGroup ? t('franchise.updateGroupInfo', 'Update franchise group information') : t('franchise.createNewGroup', 'Create a new franchise group')}
            </DialogDescription>
          </DialogHeader>
          <Form {...groupForm}>
            <form onSubmit={groupForm.handleSubmit(onGroupSubmit)} className="space-y-4">
              <FormField
                control={groupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground dark:text-foreground">{t('franchise.groupName', 'Group Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('franchise.enterGroupName', 'Enter group name')} data-testid="input-group-name" className="bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={groupForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground dark:text-foreground">{t('common.description', 'Description')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} placeholder={t('franchise.enterDescription', 'Enter description')} data-testid="input-group-description" className="bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={groupForm.control}
                  name="headquarters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground dark:text-foreground">{t('franchise.headquarters', 'Headquarters')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder={t('franchise.enterHeadquartersLocation', 'Enter headquarters location')} data-testid="input-group-headquarters" className="bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={groupForm.control}
                  name="totalBranches"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground dark:text-foreground">{t('franchise.totalBranches', 'Total Branches')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} type="number" placeholder="0" data-testid="input-group-branches" className="bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input" onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowGroupDialog(false)} className="border-input dark:border-input text-foreground dark:text-foreground">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={createGroupMutation.isPending || updateGroupMutation.isPending} data-testid="button-submit-group">
                  {editingGroup ? t('common.update', 'Update') : t('common.create', 'Create')} {t('franchise.group', 'Group')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
        <DialogContent className="bg-background dark:bg-background border-border dark:border-border max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground dark:text-foreground">{editingContract ? t('franchise.editContract', 'Edit Contract') : t('franchise.addFranchiseContract', 'Add Franchise Contract')}</DialogTitle>
            <DialogDescription className="text-muted-foreground dark:text-muted-foreground">
              {editingContract ? t('franchise.updateContractInfo', 'Update contract information') : t('franchise.createNewContract', 'Create a new franchise contract')}
            </DialogDescription>
          </DialogHeader>
          <Form {...contractForm}>
            <form onSubmit={contractForm.handleSubmit(onContractSubmit)} className="space-y-4">
              <FormField
                control={contractForm.control}
                name="contractNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground dark:text-foreground">{t('franchise.contractNumber', 'Contract Number')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="FC-2024-001" data-testid="input-contract-number" className="bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={contractForm.control}
                  name="royaltyPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground dark:text-foreground">{t('franchise.royaltyPercentage', 'Royalty %')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="number" step="0.01" placeholder="5.00" data-testid="input-royalty" className="bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contractForm.control}
                  name="marketingFeePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground dark:text-foreground">{t('franchise.marketingFeePercentage', 'Marketing Fee %')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="number" step="0.01" placeholder="2.00" data-testid="input-marketing-fee" className="bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={contractForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground dark:text-foreground">{t('common.status', 'Status')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-contract-status" className="bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input">
                          <SelectValue placeholder={t('franchise.selectStatus', 'Select status')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background dark:bg-background border-border dark:border-border">
                        <SelectItem value="draft" className="text-foreground dark:text-foreground">{t('common.draft', 'Draft')}</SelectItem>
                        <SelectItem value="pending" className="text-foreground dark:text-foreground">{t('common.pending', 'Pending')}</SelectItem>
                        <SelectItem value="active" className="text-foreground dark:text-foreground">{t('common.active', 'Active')}</SelectItem>
                        <SelectItem value="expired" className="text-foreground dark:text-foreground">{t('franchise.expired', 'Expired')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowContractDialog(false)} className="border-input dark:border-input text-foreground dark:text-foreground">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={createContractMutation.isPending || updateContractMutation.isPending} data-testid="button-submit-contract">
                  {editingContract ? t('common.update', 'Update') : t('common.create', 'Create')} {t('franchise.contract', 'Contract')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
