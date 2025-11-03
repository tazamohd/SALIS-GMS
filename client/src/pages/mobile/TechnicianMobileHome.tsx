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
    { icon: Play, label: "Clock In", route: "/technician-app/clock", color: "bg-green-500" },
    { icon: Clipboard, label: "My Jobs", route: "/technician-app/jobs", color: "bg-blue-500" },
    { icon: Wrench, label: "Parts Lookup", route: "/technician-app/lookup", color: "bg-purple-500" },
    { icon: Clock, label: "Timesheet", route: "/time-clock", color: "bg-orange-500" },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Good Morning!</h2>
        <p className="text-purple-100">Ready to tackle today's jobs?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{pendingJobs}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <Wrench className="h-6 w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{inProgressJobs}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Active</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedToday}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link key={action.route} href={action.route}>
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-400 transition-colors cursor-pointer">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={`${action.color} p-3 rounded-full mb-3`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Active Jobs */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base text-gray-900 dark:text-white">Active Jobs</CardTitle>
          <Link href="/technician-app/jobs">
            <Button variant="ghost" size="sm" data-testid="button-view-all-jobs">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeJobs.slice(0, 3).map((job) => (
            <div 
              key={job.id}
              className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              data-testid={`active-job-${job.id}`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Job #{job.jobNumber}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{job.serviceType}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  job.status === "in_progress" 
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" 
                    : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                }`}>
                  {job.status === "in_progress" ? "Active" : "Pending"}
                </span>
              </div>
            </div>
          ))}
          {activeJobs.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No active jobs
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
