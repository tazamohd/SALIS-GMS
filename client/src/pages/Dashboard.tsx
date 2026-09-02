import { useMemo, useState } from "react";
import { Car, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import { useAuth } from "@/hooks/useAuth";
import type { Invoice, JobCard, SparePart, User } from "@shared/schema";
import { ActivityFeed, type ActivityItem } from "./dashboard/ActivityFeed";
import { BayPipeline } from "./dashboard/BayPipeline";
import { DashboardCharts } from "./dashboard/DashboardCharts";
import { KpiBand } from "./dashboard/KpiBand";
import { QuickActions } from "./dashboard/QuickActions";
import { TodaySnapshot, type DashboardSummary } from "./dashboard/TodaySnapshot";
import { WorkOrdersTable } from "./dashboard/WorkOrdersTable";
import { JOB_STATUSES, type JobStatus } from "./dashboard/statusTokens";

interface DashboardStats {
  jobStatus: { name: string; value: number; status: string }[];
  revenue: { month: string; revenue: number }[];
}

interface TrendSeries {
  data: Record<string, unknown>[];
  change: number;
}

interface TrendData {
  revenue: TrendSeries;
  jobs: TrendSeries;
  visits: TrendSeries;
}

const ITEMS_PER_PAGE = 5;

function emptyStatusCounts(): Record<JobStatus, number> {
  return JOB_STATUSES.reduce(
    (acc, status) => ({ ...acc, [status]: 0 }),
    {} as Record<JobStatus, number>,
  );
}

export function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<JobCard | null>(null);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);

  const handleViewTask = (task: JobCard) => {
    setSelectedTask(task);
    setTaskDetailsOpen(true);
  };

  const { data: jobCards, isLoading } = useQuery<JobCard[]>({
    queryKey: ["/api/job-cards"],
    retry: false,
  });

  const { data: customers = [] } = useQuery<User[]>({
    queryKey: ["/api/customers"],
    retry: false,
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
    retry: false,
  });

  const { data: spareParts = [] } = useQuery<SparePart[]>({
    queryKey: ["/api/spare-parts"],
    retry: false,
  });

  const garageId = (user as any)?.garageId;

  const { data: sparePartInventories = [] } = useQuery<any[]>({
    queryKey: ["/api/spare-part-inventories", garageId],
    queryFn: async () => {
      if (!garageId) return [];
      const response = await fetch(`/api/spare-part-inventories?garage_id=${garageId}`);
      if (!response.ok) throw new Error("Failed to fetch inventories");
      return response.json();
    },
    enabled: !!garageId,
    retry: false,
  });

  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats/dashboard"],
    retry: false,
  });

  const { data: summary } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
    retry: false,
    refetchInterval: 30000,
  });

  const { data: recentActivity } = useQuery<{ activities: ActivityItem[] }>({
    queryKey: ["/api/dashboard/recent-activity"],
    retry: false,
    refetchInterval: 30000,
  });

  const { data: trends } = useQuery<TrendData>({
    queryKey: ["/api/dashboard/trends"],
    retry: false,
    refetchInterval: 60000,
  });

  /**
   * One pass over the job cards, keyed by the statuses the API actually
   * persists. The previous code filtered five times and gave two of the
   * pipeline stations the same `status === 'completed'` predicate, so they
   * always rendered the same number.
   */
  const statusCounts = useMemo(() => {
    const counts = emptyStatusCounts();
    for (const card of jobCards ?? []) {
      if (card.status && card.status in counts) {
        counts[card.status as JobStatus] += 1;
      }
    }
    return counts;
  }, [jobCards]);

  const activeJobs = statusCounts.pending + statusCounts.assigned + statusCounts.in_progress;

  const totalPages = Math.ceil((jobCards?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const latestTasks = jobCards?.slice(startIndex, startIndex + ITEMS_PER_PAGE) ?? [];

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || 0), 0);

  const activeCustomersCount = customers.filter((c) => c.userType === "customer").length;

  const inStockParts = sparePartInventories.filter((inv) => (inv.stockQuantity || 0) > 0).length;
  const totalInventoryItems = sparePartInventories.length || 1;
  const inventoryPercentage = Math.round((inStockParts / totalInventoryItems) * 100);

  const role =
    (user as any)?.role?.toUpperCase() ||
    (user as User | undefined)?.userType?.toUpperCase() ||
    "TECHNICIAN";
  const isTechnician = role === "TECHNICIAN";

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-3 animate-pulse">
        <div className="h-9 w-64 rounded bg-[#DFE5EE] dark:bg-[#222C3C]" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="col-span-2 lg:col-span-3 h-36 rounded-xl bg-[#DFE5EE] dark:bg-[#222C3C]" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-[#DFE5EE] dark:bg-[#222C3C]" />
          ))}
        </div>
        <div className="h-40 rounded-xl bg-[#DFE5EE] dark:bg-[#222C3C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#090D14]">
      <div className="p-4 md:p-6 space-y-3">
        <header className="flex items-end justify-between gap-4 flex-wrap pb-2">
          <div>
            <h1 className="font-montserrat text-3xl md:text-4xl font-bold tracking-[-0.022em] text-[#0B1F3B] dark:text-[#EAEFF7]">
              {t("dashboard.title", "Dashboard")}
            </h1>
            <p className="mt-1 text-sm text-[#55637A] dark:text-[#93A2B8]">
              {t("common.welcome", "Welcome back")},{" "}
              <span className="font-medium text-[#0B1F3B] dark:text-[#EAEFF7]">
                {(user as any)?.fullName || (user as any)?.username || "User"}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/job-cards">
                <FileText className="w-4 h-4 me-2" aria-hidden="true" />
                {t("dashboard.newJobCard", "New job card")}
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/vehicles">
                <Car className="w-4 h-4 me-2" aria-hidden="true" />
                {t("dashboard.addVehicle", "Add vehicle")}
              </Link>
            </Button>
          </div>
        </header>

        <KpiBand
          totalRevenue={totalRevenue}
          revenueTrend={trends?.revenue}
          jobsTrend={trends?.jobs}
          visitsTrend={trends?.visits}
          activeJobs={activeJobs}
          pendingCount={statusCounts.pending}
          repairCount={statusCounts.in_progress}
          customersCount={activeCustomersCount}
          inventoryPercentage={inventoryPercentage}
          inStockParts={inStockParts}
          totalInventoryItems={totalInventoryItems}
        />

        {summary && <TodaySnapshot summary={summary} />}

        <BayPipeline counts={statusCounts} />

        {!isTechnician && (
          <DashboardCharts
            revenue={dashboardStats?.revenue}
            jobStatus={dashboardStats?.jobStatus}
            isLoading={statsLoading}
          />
        )}

        <WorkOrdersTable
          tasks={latestTasks}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          onViewTask={handleViewTask}
        />

        <QuickActions />

        <ActivityFeed activities={recentActivity?.activities} />

        {spareParts.length > 0 && (
          <p className="pt-1 text-xs text-[#8593A8] dark:text-[#6B7B93] tabular-nums">
            {spareParts.length} {t("dashboard.partsCatalog", "parts in catalogue")}
          </p>
        )}
      </div>

      <TaskDetailsDialog
        open={taskDetailsOpen}
        onOpenChange={setTaskDetailsOpen}
        task={selectedTask}
      />
    </div>
  );
}
