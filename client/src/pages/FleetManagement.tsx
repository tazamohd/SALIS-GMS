import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import {
  Building2,
  Car,
  Calendar,
  BarChart3,
  Plus,
  Truck,
  DollarSign,
  Gauge,
  AlertTriangle,
  Wrench,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";

// ── Types ──

interface FleetAccount {
  id: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  contractStatus: 'active' | 'pending' | 'expired';
  monthlySpend: number;
  totalSpend: number;
  vehicleCount: number;
  activeJobs: number;
  discountPercentage: number;
}

interface FleetVehicle {
  id: string;
  fleetAccountId: string;
  companyName: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  status: 'active' | 'in_service' | 'scheduled' | 'inactive';
  mileage: number;
  lastServiceDate: string;
  lastServiceType: string;
  nextServiceDue: string;
  nextServiceType: string;
  avgMonthlyCost: number;
  totalSpend: number;
}

interface MaintenanceEntry {
  id: string;
  vehicleId: string;
  fleetAccountId: string;
  serviceType: string;
  scheduledDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  estimatedCost: number;
  notes: string;
  plateNumber: string;
  vehicleName: string;
  companyName: string;
}

interface AnalyticsData {
  summary: {
    totalAccounts: number;
    totalVehicles: number;
    activeVehicles: number;
    inService: number;
    totalRevenue: number;
    avgCostPerVehicle: number;
    avgMileage: number;
    overdueMaintenanceCount: number;
  };
  revenuePerAccount: { accountId: string; companyName: string; totalRevenue: number; vehicleCount: number; avgCostPerVehicle: number }[];
  serviceByMake: { make: string; vehicleCount: number; totalCost: number; avgCost: number }[];
  costTrend: { month: string; totalCost: number; vehiclesServiced: number }[];
}

// ── Helpers ──

function formatCurrency(amount: number) {
  return `SAR ${amount.toLocaleString()}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "--";
  return new Date(dateStr).toLocaleDateString("en-SA", { year: "numeric", month: "short", day: "numeric" });
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0",
    in_service: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0",
    scheduled: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0",
    inactive: "bg-slate-500/10 text-slate-500 border-0",
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0",
    expired: "bg-red-500/10 text-red-600 dark:text-red-400 border-0",
    overdue: "bg-red-500/10 text-red-600 dark:text-red-400 border-0",
    completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0",
    in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0",
  };
  const labels: Record<string, string> = {
    active: "Active",
    in_service: "In Service",
    scheduled: "Scheduled",
    inactive: "Inactive",
    pending: "Pending",
    expired: "Expired",
    overdue: "Overdue",
    completed: "Completed",
    in_progress: "In Progress",
  };
  return <Badge className={styles[status] || ""}>{labels[status] || status}</Badge>;
}

// ── Bar chart component (simple SVG) ──

function SimpleBarChart({ data, labelKey, valueKey, color }: { data: any[]; labelKey: string; valueKey: string; color: string }) {
  if (!data || data.length === 0) return <div className="text-center text-[#64748B] py-8">No data available</div>;
  const maxVal = Math.max(...data.map(d => d[valueKey]));
  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const pct = maxVal > 0 ? (item[valueKey] / maxVal) * 100 : 0;
        return (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-[#0B1F3B] dark:text-white font-medium">{item[labelKey]}</span>
              <span className="text-[#64748B]">{typeof item[valueKey] === 'number' ? formatCurrency(item[valueKey]) : item[valueKey]}</span>
            </div>
            <div className="h-6 w-full bg-[#F1F5F9] dark:bg-[#1E2530] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ──

export default function FleetManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("accounts");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newContactPerson, setNewContactPerson] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  // ── Data queries ──

  const { data: accountsData, isLoading: accountsLoading } = useQuery<{ accounts: FleetAccount[] }>({
    queryKey: ["/api/fleet/accounts"],
  });

  const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery<{ vehicles: FleetVehicle[] }>({
    queryKey: ["/api/fleet/vehicles"],
  });

  const { data: scheduleData, isLoading: scheduleLoading } = useQuery<{ schedule: MaintenanceEntry[] }>({
    queryKey: ["/api/fleet/maintenance-schedule"],
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/fleet/analytics"],
  });

  const accounts = accountsData?.accounts || [];
  const vehicles = vehiclesData?.vehicles || [];
  const schedule = scheduleData?.schedule || [];
  const analytics = analyticsData || null;

  // ── Create account handler ──

  async function handleCreateAccount() {
    if (!newCompanyName.trim()) {
      toast({ title: "Validation Error", description: "Company name is required", variant: "destructive" });
      return;
    }
    try {
      await apiRequest("POST", "/api/fleet/accounts", {
        companyName: newCompanyName,
        contactPerson: newContactPerson,
        contactEmail: newContactEmail,
        contactPhone: newContactPhone,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/accounts"] });
      setIsCreateDialogOpen(false);
      setNewCompanyName("");
      setNewContactPerson("");
      setNewContactEmail("");
      setNewContactPhone("");
      toast({ title: "Fleet Account Created", description: `${newCompanyName} has been added successfully.` });
    } catch {
      toast({ title: "Error", description: "Failed to create fleet account", variant: "destructive" });
    }
  }

  // ── Tab 1: Fleet Accounts ──

  const renderAccountsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">
          Fleet Accounts ({accounts.length})
        </h2>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#09a0e6] text-white shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Fleet Account
        </Button>
      </div>

      {accountsLoading ? (
        <div className="text-center py-12 text-[#64748B]">Loading fleet accounts...</div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <p className="text-[#64748B]">No fleet accounts yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23] hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center text-white font-bold text-lg shadow">
                      {account.companyName.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-[#0B1F3B] dark:text-white text-base">
                        {account.companyName}
                      </CardTitle>
                      <p className="text-xs text-[#64748B] mt-0.5">{account.contactPerson}</p>
                    </div>
                  </div>
                  {getStatusBadge(account.contractStatus)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-[#0A5ED7]" />
                    <div>
                      <p className="text-xs text-[#64748B]">Vehicles</p>
                      <p className="text-sm font-semibold text-[#0B1F3B] dark:text-white">{account.vehicleCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-xs text-[#64748B]">Active Jobs</p>
                      <p className="text-sm font-semibold text-[#0B1F3B] dark:text-white">{account.activeJobs}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-xs text-[#64748B]">Monthly Spend</p>
                      <p className="text-sm font-semibold text-[#0B1F3B] dark:text-white">{formatCurrency(account.monthlySpend)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#0BB3FF]" />
                    <div>
                      <p className="text-xs text-[#64748B]">Total Spend</p>
                      <p className="text-sm font-semibold text-[#0B1F3B] dark:text-white">{formatCurrency(account.totalSpend)}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#232A36] flex justify-between items-center text-xs text-[#64748B]">
                  <span>Discount: {account.discountPercentage}%</span>
                  <span>{account.contactEmail}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // ── Tab 2: Vehicles ──

  const renderVehiclesTab = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">
        All Fleet Vehicles ({vehicles.length})
      </h2>

      {vehiclesLoading ? (
        <div className="text-center py-12 text-[#64748B]">Loading vehicles...</div>
      ) : (
        <div className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-white dark:bg-[#151A23] overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC] dark:bg-[#0E1117] border-b border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#0B1F3B] dark:text-white font-semibold">Plate #</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white font-semibold">Make / Model</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white font-semibold">Fleet Account</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white font-semibold">Status</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white font-semibold text-right">Mileage</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white font-semibold">Last Service</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white font-semibold">Next Service Due</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white font-semibold text-right">Avg Monthly Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((v) => (
                <TableRow key={v.id} className="border-b border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]">
                  <TableCell className="font-mono font-semibold text-[#0B1F3B] dark:text-white">{v.plateNumber}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">
                    {v.year} {v.make} {v.model}
                  </TableCell>
                  <TableCell className="text-[#64748B]">{v.companyName}</TableCell>
                  <TableCell>{getStatusBadge(v.status)}</TableCell>
                  <TableCell className="text-right text-[#0B1F3B] dark:text-white">{v.mileage.toLocaleString()} km</TableCell>
                  <TableCell>
                    <div>
                      <span className="text-[#0B1F3B] dark:text-white text-sm">{formatDate(v.lastServiceDate)}</span>
                      <br />
                      <span className="text-xs text-[#64748B]">{v.lastServiceType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="text-[#0B1F3B] dark:text-white text-sm">{formatDate(v.nextServiceDue)}</span>
                      <br />
                      <span className="text-xs text-[#64748B]">{v.nextServiceType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-[#0B1F3B] dark:text-white">{formatCurrency(v.avgMonthlyCost)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );

  // ── Tab 3: Maintenance Schedule (calendar-style by week) ──

  const renderMaintenanceTab = () => {
    // Group entries by week
    const weekGroups = new Map<string, MaintenanceEntry[]>();
    for (const entry of schedule) {
      const d = new Date(entry.scheduledDate);
      const dayOfWeek = d.getDay();
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - dayOfWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const key = `${weekStart.toISOString().slice(0, 10)}_${weekEnd.toISOString().slice(0, 10)}`;
      if (!weekGroups.has(key)) weekGroups.set(key, []);
      weekGroups.get(key)!.push(entry);
    }
    const sortedWeeks = Array.from(weekGroups.entries()).sort(([a], [b]) => a.localeCompare(b));

    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">
          Upcoming Maintenance Schedule ({schedule.length} services)
        </h2>

        {scheduleLoading ? (
          <div className="text-center py-12 text-[#64748B]">Loading schedule...</div>
        ) : sortedWeeks.length === 0 ? (
          <div className="text-center py-12 text-[#64748B]">No upcoming maintenance scheduled.</div>
        ) : (
          <div className="space-y-6">
            {sortedWeeks.map(([weekKey, entries]) => {
              const [startStr, endStr] = weekKey.split("_");
              const weekLabel = `${formatDate(startStr)} - ${formatDate(endStr)}`;
              const totalCost = entries.reduce((s, e) => s + e.estimatedCost, 0);
              return (
                <div key={weekKey} className="border border-[#E2E8F0] dark:border-[#232A36] rounded-xl bg-white dark:bg-[#151A23] overflow-hidden">
                  <div className="px-5 py-3 bg-gradient-to-r from-[#F8FAFC] to-[#EEF2FF] dark:from-[#0E1117] dark:to-[#151A23] border-b border-[#E2E8F0] dark:border-[#232A36] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#0A5ED7]" />
                      <span className="font-semibold text-[#0B1F3B] dark:text-white text-sm">{weekLabel}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#64748B]">
                      <span>{entries.length} service{entries.length !== 1 ? 's' : ''}</span>
                      <span className="font-medium text-[#0B1F3B] dark:text-white">{formatCurrency(totalCost)}</span>
                    </div>
                  </div>
                  <div className="divide-y divide-[#E2E8F0] dark:divide-[#232A36]">
                    {entries.map((entry) => (
                      <div key={entry.id} className="px-5 py-3 flex items-center justify-between hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-[#0A5ED7]/10 flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-[#0A5ED7]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                              {entry.serviceType}
                            </p>
                            <p className="text-xs text-[#64748B]">
                              {entry.plateNumber} - {entry.vehicleName} ({entry.companyName})
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-[#0B1F3B] dark:text-white">{formatDate(entry.scheduledDate)}</span>
                          {getStatusBadge(entry.status)}
                          <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">{formatCurrency(entry.estimatedCost)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── Tab 4: Analytics ──

  const renderAnalyticsTab = () => {
    if (analyticsLoading || !analytics) {
      return <div className="text-center py-12 text-[#64748B]">Loading analytics...</div>;
    }

    const { summary, revenuePerAccount, serviceByMake, costTrend } = analytics;

    return (
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0A5ED7]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#0A5ED7]" />
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">Fleet Accounts</p>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{summary.totalAccounts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">Total Vehicles</p>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{summary.totalVehicles}</p>
                  <p className="text-xs text-emerald-500">{summary.activeVehicles} active, {summary.inService} in service</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">Avg Cost / Vehicle</p>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{formatCurrency(summary.avgCostPerVehicle)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">Overdue Maintenance</p>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{summary.overdueMaintenanceCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue per fleet account */}
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0A5ED7]" />
                Revenue by Fleet Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={revenuePerAccount} labelKey="companyName" valueKey="totalRevenue" color="#0A5ED7" />
            </CardContent>
          </Card>

          {/* Service frequency by vehicle make */}
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white text-base flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-500" />
                Service Cost by Vehicle Make
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={serviceByMake} labelKey="make" valueKey="totalCost" color="#10b981" />
            </CardContent>
          </Card>
        </div>

        {/* Cost trend */}
        <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0BB3FF]" />
              Monthly Cost Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-48">
              {costTrend.map((month, i) => {
                const maxCost = Math.max(...costTrend.map(m => m.totalCost));
                const heightPct = maxCost > 0 ? (month.totalCost / maxCost) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-[#0B1F3B] dark:text-white font-medium">{formatCurrency(month.totalCost)}</span>
                    <div className="w-full flex items-end" style={{ height: '140px' }}>
                      <div
                        className="w-full rounded-t-md transition-all duration-500"
                        style={{
                          height: `${heightPct}%`,
                          background: `linear-gradient(180deg, #0A5ED7, #0BB3FF)`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-[#64748B] whitespace-nowrap">{month.month.split(' ')[0]}</span>
                    <span className="text-[10px] text-[#64748B]">{month.vehiclesServiced} svc</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detailed table: avg cost per vehicle by account */}
        <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white text-base flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-500" />
              Fleet Account Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                  <TableHead className="text-[#0B1F3B] dark:text-white font-semibold">Company</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white font-semibold text-right">Vehicles</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white font-semibold text-right">Total Revenue</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white font-semibold text-right">Avg Cost / Vehicle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenuePerAccount.map((row) => (
                  <TableRow key={row.accountId} className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                    <TableCell className="text-[#0B1F3B] dark:text-white font-medium">{row.companyName}</TableCell>
                    <TableCell className="text-right text-[#64748B]">{row.vehicleCount}</TableCell>
                    <TableCell className="text-right text-[#0B1F3B] dark:text-white">{formatCurrency(row.totalRevenue)}</TableCell>
                    <TableCell className="text-right text-[#0B1F3B] dark:text-white">{formatCurrency(row.avgCostPerVehicle)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ── Render ──

  if (accountsLoading && vehiclesLoading && scheduleLoading) {
    return (
      <div className="space-y-4 p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />)}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <>
      <TabsPageLayout
        title="Fleet Management"
        description="Manage corporate and fleet customer accounts, vehicles, maintenance, and analytics"
        icon={Truck}
        tabs={[
          {
            id: "accounts",
            label: "Fleet Accounts",
            icon: Building2,
            content: renderAccountsTab(),
            badge: accounts.length || undefined,
          },
          {
            id: "vehicles",
            label: "Vehicles",
            icon: Car,
            content: renderVehiclesTab(),
            badge: vehicles.length || undefined,
          },
          {
            id: "maintenance",
            label: "Maintenance Schedule",
            icon: Clock,
            content: renderMaintenanceTab(),
            badge: schedule.length || undefined,
          },
          {
            id: "analytics",
            label: "Analytics",
            icon: BarChart3,
            content: renderAnalyticsTab(),
          },
        ]}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      {/* Create Fleet Account Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">Create Fleet Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[#0B1F3B] dark:text-white">Company Name *</Label>
              <Input
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Enter company name"
                className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
              />
            </div>
            <div>
              <Label className="text-[#0B1F3B] dark:text-white">Contact Person</Label>
              <Input
                value={newContactPerson}
                onChange={(e) => setNewContactPerson(e.target.value)}
                placeholder="Primary contact name"
                className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#0B1F3B] dark:text-white">Email</Label>
                <Input
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="email@company.com"
                  type="email"
                  className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                />
              </div>
              <div>
                <Label className="text-[#0B1F3B] dark:text-white">Phone</Label>
                <Input
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="+966 5x xxx xxxx"
                  className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10">
              Cancel
            </Button>
            <Button onClick={handleCreateAccount} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#09a0e6] text-white">
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
