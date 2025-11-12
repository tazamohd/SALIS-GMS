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

  const { data: allJobCards, isLoading } = useQuery<JobCard[]>({
    queryKey: ["/api/job-cards"],
    enabled: !!user?.id,
  });

  // TODO: Replace with technician-scoped API endpoint /api/technicians/:id/job-cards
  // Current implementation uses client-side filtering (security risk)
  const jobCards = allJobCards?.filter((job) => job.assignedTechnicianId === user?.id) || [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/job-cards/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
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
      in_progress: { label: "In Progress", className: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300" },
      completed: { label: "Completed", className: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" },
      pending: { label: "Pending", className: "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300" },
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
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const assignedJobs = filteredJobs.filter((j) => j.status === "assigned");
  const activeJobs = filteredJobs.filter((j) => j.status === "in_progress");
  const completedJobs = filteredJobs.filter((j) => j.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Jobs
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your assigned job cards
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by job number or service type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-jobs"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
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

      {/* Jobs Tabs */}
      <Tabs defaultValue="assigned" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
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
            <Card className="bg-white dark:bg-salis-gray-dark">
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No assigned jobs</p>
              </CardContent>
            </Card>
          ) : (
            assignedJobs.map((job) => (
              <Card key={job.id} className="bg-white dark:bg-salis-gray-dark" data-testid={`job-card-${job.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white">
                        Job #{job.jobNumber}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                        <p className="text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 inline mr-2" />
                          {format(new Date(job.scheduledDate), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                      {job.estimatedCost && (
                        <p className="text-gray-600 dark:text-gray-400">
                          Estimated: SAR {job.estimatedCost}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleStartJob(job.id)}
                      className="bg-orange-600 hover:bg-orange-700"
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
            <Card className="bg-white dark:bg-salis-gray-dark">
              <CardContent className="text-center py-12">
                <PauseCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No jobs in progress</p>
              </CardContent>
            </Card>
          ) : (
            activeJobs.map((job) => (
              <Card key={job.id} className="bg-white dark:bg-salis-gray-dark border-l-4 border-l-orange-500" data-testid={`job-card-${job.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white">
                        Job #{job.jobNumber}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                        <p className="text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 inline mr-2" />
                          {format(new Date(job.scheduledDate), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                      {job.actualCost && (
                        <p className="text-gray-600 dark:text-gray-400">
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
            <Card className="bg-white dark:bg-salis-gray-dark">
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No completed jobs</p>
              </CardContent>
            </Card>
          ) : (
            completedJobs.map((job) => (
              <Card key={job.id} className="bg-white dark:bg-salis-gray-dark opacity-75" data-testid={`job-card-${job.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white">
                        Job #{job.jobNumber}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {job.serviceType}
                      </p>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {job.completionDate && (
                      <p className="text-gray-600 dark:text-gray-400">
                        Completed: {format(new Date(job.completionDate), "MMM d, yyyy")}
                      </p>
                    )}
                    {job.actualCost && (
                      <p className="text-gray-600 dark:text-gray-400">
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
