import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clipboard, Clock, CheckCircle, Calendar, Car } from "lucide-react";
import { Link } from "wouter";
import type { JobCard } from "@shared/schema";

export default function TechnicianMobileJobs() {
  const { data: jobCards, isLoading } = useQuery<{ data: JobCard[] }>({
    queryKey: ["/api/job-cards"],
  });

  const statusConfig = {
    pending: { color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400", icon: Clock },
    in_progress: { color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400", icon: Clipboard },
    completed: { color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400", icon: CheckCircle },
  };

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading jobs...</p>
        </div>
      </div>
    );
  }

  const activeJobs = jobCards?.data?.filter(j => j.status !== "completed" && j.status !== "cancelled") || [];
  const completedJobs = jobCards?.data?.filter(j => j.status === "completed") || [];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Job Cards</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{activeJobs.length} active job(s)</p>
      </div>

      {/* Active Jobs */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Active Jobs</h3>
        <div className="space-y-2">
          {activeJobs.map((job) => {
            const config = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.pending;
            const StatusIcon = config.icon;
            
            return (
              <Card 
                key={job.id}
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                data-testid={`job-${job.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusIcon className="h-4 w-4 text-gray-400" />
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Job #{job.jobNumber}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{job.serviceType}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
                      {job.status.replace("_", " ")}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                    {job.estimatedCompletionTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {job.estimatedCompletionTime}
                      </div>
                    )}
                  </div>

                  <Link href={`/job-cards`}>
                    <Button variant="outline" size="sm" className="w-full" data-testid={`view-job-${job.id}`}>
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
          
          {activeJobs.length === 0 && (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardContent className="p-8 text-center">
                <Clipboard className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">No Active Jobs</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You're all caught up! New jobs will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Completed Jobs */}
      {completedJobs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Completed Today</h3>
          <div className="space-y-2">
            {completedJobs.slice(0, 5).map((job) => (
              <Card 
                key={job.id}
                className="bg-white dark:bg-gray-900 border-green-200 dark:border-green-900/30"
                data-testid={`completed-job-${job.id}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Job #{job.jobNumber}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{job.serviceType}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      Completed
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
