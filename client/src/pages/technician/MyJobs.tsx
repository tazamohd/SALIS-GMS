// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Clock, CheckCircle, PlayCircle, PauseCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { JobCard } from "@shared/schema";
import { format } from "date-fns";

export default function TechnicianMyJobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: jobCards, isLoading } = useQuery<JobCard[]>({
    queryKey: ["/api/technicians", user?.id, "job-cards"],
    enabled: !!user?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/job-cards/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technicians", user?.id, "job-cards"] });
      toast({
        title: "Status Updated",
        description: "Job status has been updated successfully.",
      });
    },
  });

  const filteredJobs = jobCards?.filter((job) => {
    const matchesSearch = search === "" || 
      job.jobNumber.toLowerCase().includes(search.toLowerCase()) ||
      job.serviceType?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

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

  const handleStartJob = (jobId: string) => {
    updateStatusMutation.mutate({ id: jobId, status: "in_progress" });
  };

  const handleCompleteJob = (jobId: string) => {
    updateStatusMutation.mutate({ id: jobId, status: "completed" });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen p-6">
        <div className="h-8 bg-[#E2E8F0] dark:bg-[#232A36] rounded w-1/4" />
        <div className="h-12 bg-[#E2E8F0] dark:bg-[#232A36] rounded" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-[#E2E8F0] dark:bg-[#232A36] rounded" />
          ))}
        </div>
      </div>
    );
  }

  const assignedJobs = filteredJobs.filter((j) => j.status === "assigned");
  const activeJobs = filteredJobs.filter((j) => j.status === "in_progress");
  const completedJobs = filteredJobs.filter((j) => j.status === "completed");

  return (
    <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white mb-2">
          My Jobs
        </h1>
        <p className="text-[#64748B]">
          Manage your assigned job cards
        </p>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder="Search by job number or service type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-search-jobs"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="assigned" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <TabsTrigger value="assigned" data-testid="tab-assigned">
            Assigned ({assignedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="active" data-testid="tab-active">
            In Progress ({activeJobs.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            Completed ({completedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="space-y-4">
          {assignedJobs.length === 0 ? (
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-[#64748B] mb-3" />
                <p className="text-[#64748B]">No assigned jobs</p>
              </CardContent>
            </Card>
          ) : (
            assignedJobs.map((job) => (
              <Card key={job.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`job-card-${job.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-[#0B1F3B] dark:text-white">
                        Job #{job.jobNumber}
                      </CardTitle>
                      <p className="text-sm text-[#64748B] mt-1">
                        {job.serviceType}
                      </p>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2 text-sm">
                      {job.scheduledDate && (
                        <p className="text-[#64748B]">
                          <Clock className="h-4 w-4 inline mr-2" />
                          {format(new Date(job.scheduledDate), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                      {job.estimatedCost && (
                        <p className="text-[#64748B]">
                          Estimated: SAR {job.estimatedCost}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleStartJob(job.id)}
                      className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90"
                      data-testid={`button-start-${job.id}`}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Job
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeJobs.length === 0 ? (
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="text-center py-12">
                <PauseCircle className="h-12 w-12 mx-auto text-[#64748B] mb-3" />
                <p className="text-[#64748B]">No jobs in progress</p>
              </CardContent>
            </Card>
          ) : (
            activeJobs.map((job) => (
              <Card key={job.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] border-l-4 border-l-[#F97316]" data-testid={`job-card-${job.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-[#0B1F3B] dark:text-white">
                        Job #{job.jobNumber}
                      </CardTitle>
                      <p className="text-sm text-[#64748B] mt-1">
                        {job.serviceType}
                      </p>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2 text-sm">
                      {job.scheduledDate && (
                        <p className="text-[#64748B]">
                          <Clock className="h-4 w-4 inline mr-2" />
                          {format(new Date(job.scheduledDate), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                      {job.actualCost && (
                        <p className="text-[#64748B]">
                          Cost: SAR {job.actualCost}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleCompleteJob(job.id)}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid={`button-complete-${job.id}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedJobs.length === 0 ? (
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-[#64748B] mb-3" />
                <p className="text-[#64748B]">No completed jobs</p>
              </CardContent>
            </Card>
          ) : (
            completedJobs.map((job) => (
              <Card key={job.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] opacity-75" data-testid={`job-card-${job.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-[#0B1F3B] dark:text-white">
                        Job #{job.jobNumber}
                      </CardTitle>
                      <p className="text-sm text-[#64748B] mt-1">
                        {job.serviceType}
                      </p>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {job.completionDate && (
                      <p className="text-[#64748B]">
                        Completed: {format(new Date(job.completionDate), "MMM d, yyyy")}
                      </p>
                    )}
                    {job.actualCost && (
                      <p className="text-[#64748B]">
                        Final Cost: SAR {job.actualCost}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
