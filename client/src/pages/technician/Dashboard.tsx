import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import type { JobCard } from "@shared/schema";
import { format } from "date-fns";

export default function TechnicianDashboard() {
  const { user } = useAuth();

  const { data: jobCards, isLoading } = useQuery<JobCard[]>({
    queryKey: ["/api/technicians", user?.id, "job-cards"],
    enabled: !!user?.id,
  });

  const todayJobs = jobCards?.filter((job) => {
    if (!job.scheduledDate) return false;
    const jobDate = new Date(job.scheduledDate);
    const today = new Date();
    return (
      jobDate.getDate() === today.getDate() &&
      jobDate.getMonth() === today.getMonth() &&
      jobDate.getFullYear() === today.getFullYear()
    );
  }) || [];

  const activeJobs = jobCards?.filter(
    (job) => job.status === "in_progress" || job.status === "assigned"
  ) || [];

  const completedToday = jobCards?.filter((job) => {
    if (job.status !== "completed") return false;
    if (!job.updatedAt) return false;
    const updatedDate = new Date(job.updatedAt);
    const today = new Date();
    return (
      updatedDate.getDate() === today.getDate() &&
      updatedDate.getMonth() === today.getMonth() &&
      updatedDate.getFullYear() === today.getFullYear()
    );
  }) || [];

  const stats = [
    {
      title: "Today's Jobs",
      value: todayJobs.length,
      icon: ClipboardList,
      color: "text-[#0A5ED7]",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Active Jobs",
      value: activeJobs.length,
      icon: Wrench,
      color: "text-[#F97316]",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Completed Today",
      value: completedToday.length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Total Assigned",
      value: jobCards?.length || 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      assigned: { label: "Assigned", className: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" },
      in_progress: { label: "In Progress", className: "bg-orange-100 dark:bg-orange-900 text-[#F97316]" },
      completed: { label: "Completed", className: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" },
      pending: { label: "Pending", className: "bg-gray-100 dark:bg-gray-900 text-[#64748B]" },
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { className: string }> = {
      urgent: { className: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300" },
      high: { className: "bg-orange-100 dark:bg-orange-900 text-[#F97316]" },
      medium: { className: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300" },
      low: { className: "bg-gray-100 dark:bg-gray-900 text-[#64748B]" },
    };
    const variant = variants[priority] || variants.low;
    return <Badge className={variant.className}>{priority}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#E2E8F0] dark:bg-[#232A36] rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-[#E2E8F0] dark:bg-[#232A36] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-[#64748B]">
          Welcome back, {user?.fullName}! Here's your work overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]"
            data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748B] mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-[#0B1F3B] dark:text-white">Today's Schedule</CardTitle>
            <p className="text-sm text-[#64748B] mt-1">
              Jobs scheduled for {format(new Date(), "MMMM d, yyyy")}
            </p>
          </div>
          <Link href="/technician-portal/my-jobs">
            <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-view-all-jobs">
              View All Jobs
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {todayJobs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-[#64748B] mb-3" />
              <p className="text-[#64748B]">No jobs scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg"
                  data-testid={`job-${job.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                        Job #{job.jobNumber}
                      </h3>
                      {getStatusBadge(job.status)}
                      {getPriorityBadge(job.priority || "medium")}
                    </div>
                    <p className="text-sm text-[#64748B]">
                      {job.serviceType}
                    </p>
                    {job.scheduledDate && (
                      <p className="text-xs text-[#64748B] mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {format(new Date(job.scheduledDate), "h:mm a")}
                      </p>
                    )}
                  </div>
                  <Link href={`/technician-portal/my-jobs`}>
                    <Button variant="ghost" size="sm" data-testid={`button-view-job-${job.id}`}>
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">Active Jobs</CardTitle>
          <p className="text-sm text-[#64748B] mt-1">
            Jobs currently in progress or assigned to you
          </p>
        </CardHeader>
        <CardContent>
          {activeJobs.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-[#64748B] mb-3" />
              <p className="text-[#64748B]">No active jobs</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeJobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg"
                  data-testid={`active-job-${job.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                        Job #{job.jobNumber}
                      </h3>
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="text-sm text-[#64748B]">
                      {job.serviceType}
                    </p>
                  </div>
                  <Link href={`/technician-portal/my-jobs`}>
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
