import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clipboard, Clock, CheckCircle, AlertCircle, Play, Wrench } from "lucide-react";
import { Link } from "wouter";
import type { JobCard } from "@shared/schema";

export default function TechnicianMobileHome() {
  const { data: jobCards } = useQuery<{ data: JobCard[] }>({
    queryKey: ["/api/job-cards"],
  });

  const activeJobs = jobCards?.data?.filter(
    (job) => job.status === "in_progress" || job.status === "pending"
  ) || [];

  const completedToday = jobCards?.data?.filter(
    (job) => job.status === "completed" && 
      new Date(job.updatedAt).toDateString() === new Date().toDateString()
  )?.length || 0;

  const pendingJobs = jobCards?.data?.filter((job) => job.status === "pending")?.length || 0;
  const inProgressJobs = jobCards?.data?.filter((job) => job.status === "in_progress")?.length || 0;

  const quickActions = [
    { icon: Play, label: "Clock In", route: "/technician-app/clock", color: "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]" },
    { icon: Clipboard, label: "My Jobs", route: "/technician-app/jobs", color: "bg-[#0A5ED7]" },
    { icon: Wrench, label: "Parts Lookup", route: "/technician-app/lookup", color: "bg-[#0BB3FF]" },
    { icon: Clock, label: "Timesheet", route: "/time-clock", color: "bg-[#F97316]" },
  ];

  return (
    <div className="p-4 space-y-4 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Good Morning!</h2>
        <p className="text-white/80">Ready to tackle today's jobs?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-[#F97316]" />
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{pendingJobs}</div>
            <div className="text-xs text-[#64748B]">Pending</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-4 text-center">
            <Wrench className="h-6 w-6 mx-auto mb-2 text-[#0A5ED7]" />
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{inProgressJobs}</div>
            <div className="text-xs text-[#64748B]">Active</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-[#0BB3FF]" />
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{completedToday}</div>
            <div className="text-xs text-[#64748B]">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-[#0B1F3B] dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link key={action.route} href={action.route}>
              <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] dark:hover:border-[#0A5ED7] transition-colors cursor-pointer">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={`${action.color} p-3 rounded-full mb-3`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-medium text-[#0B1F3B] dark:text-white">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Active Jobs */}
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base text-[#0B1F3B] dark:text-white">Active Jobs</CardTitle>
          <Link href="/technician-app/jobs">
            <Button variant="ghost" size="sm" className="text-[#0A5ED7] hover:text-[#0A5ED7]/80" data-testid="button-view-all-jobs">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeJobs.slice(0, 3).map((job) => (
            <div 
              key={job.id}
              className="flex items-center justify-between py-2 border-b border-[#E2E8F0] dark:border-[#232A36] last:border-0"
              data-testid={`active-job-${job.id}`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                  Job #{job.jobNumber}
                </p>
                <p className="text-xs text-[#64748B]">{job.serviceType}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  job.status === "in_progress" 
                    ? "bg-[#0A5ED7]/10 text-[#0A5ED7] border border-[#0A5ED7]" 
                    : "bg-[#F97316]/10 text-[#F97316] border border-[#F97316]"
                }`}>
                  {job.status === "in_progress" ? "Active" : "Pending"}
                </span>
              </div>
            </div>
          ))}
          {activeJobs.length === 0 && (
            <p className="text-sm text-[#64748B] text-center py-4">
              No active jobs
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
