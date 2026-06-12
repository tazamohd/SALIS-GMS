// @ts-nocheck
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
    pending: { color: "bg-[#F97316]/10 text-[#F97316] border border-[#F97316]", icon: Clock },
    in_progress: { color: "bg-[#0A5ED7]/10 text-[#0A5ED7] border border-[#0A5ED7]", icon: Clipboard },
    completed: { color: "bg-[#0BB3FF]/10 text-[#0BB3FF] border border-[#0BB3FF]", icon: CheckCircle },
  };

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-64 bg-[#F8FAFC] dark:bg-[#0E1117]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A5ED7] mx-auto mb-4" />
          <p className="text-[#64748B]">Loading jobs...</p>
        </div>
      </div>
    );
  }

  const activeJobs = jobCards?.data?.filter(j => j.status !== "completed" && j.status !== "cancelled") || [];
  const completedJobs = jobCards?.data?.filter(j => j.status === "completed") || [];

  return (
    <div className="p-4 space-y-4 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">My Job Cards</h2>
        <p className="text-sm text-[#64748B]">{activeJobs.length} active job(s)</p>
      </div>

      {/* Active Jobs */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-[#0B1F3B] dark:text-white">Active Jobs</h3>
        <div className="space-y-2">
          {activeJobs.map((job) => {
            const config = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.pending;
            const StatusIcon = config.icon;
            
            return (
              <Card 
                key={job.id}
                className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid={`job-${job.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusIcon className="h-4 w-4 text-[#64748B]" />
                        <p className="font-semibold text-[#0B1F3B] dark:text-white">
                          Job #{job.jobNumber}
                        </p>
                      </div>
                      <p className="text-sm text-[#64748B]">{job.serviceType}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
                      {job.status.replace("_", " ")}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#64748B] mb-3">
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
                    <Button variant="outline" size="sm" className="w-full border-[#E2E8F0] dark:border-[#232A36] text-[#0A5ED7] hover:bg-[#0A5ED7]/10" data-testid={`view-job-${job.id}`}>
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
          
          {activeJobs.length === 0 && (
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-8 text-center">
                <Clipboard className="h-16 w-16 mx-auto mb-4 text-[#E2E8F0] dark:text-[#232A36]" />
                <h3 className="text-lg font-semibold mb-2 text-[#0B1F3B] dark:text-white">No Active Jobs</h3>
                <p className="text-sm text-[#64748B]">
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
          <h3 className="text-sm font-semibold mb-2 text-[#0B1F3B] dark:text-white">Completed Today</h3>
          <div className="space-y-2">
            {completedJobs.slice(0, 5).map((job) => (
              <Card 
                key={job.id}
                className="bg-white dark:bg-[#151A23] border-[#0BB3FF]/30 dark:border-[#0BB3FF]/30"
                data-testid={`completed-job-${job.id}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[#0BB3FF]" />
                      <div>
                        <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">Job #{job.jobNumber}</p>
                        <p className="text-xs text-[#64748B]">{job.serviceType}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#0BB3FF]/10 text-[#0BB3FF] border border-[#0BB3FF]">
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
