import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, AlertCircle, Wrench, User, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LiveTracking() {
  const { user } = useAuth();

  const { data: vehicles } = useQuery({
    queryKey: ["/api/vehicles", (user as any)?.id],
    enabled: !!(user as any)?.id,
  });

  const { data: jobCards, isLoading } = useQuery({
    queryKey: ["/api/job-cards"],
    enabled: !!(user as any)?.id,
    refetchInterval: 30000,
  });

  const myVehicles = Array.isArray(vehicles)
    ? vehicles.filter((v: any) => v.customerId === (user as any)?.id)
    : [];

  const activeJobs = Array.isArray(jobCards)
    ? jobCards.filter((jc: any) => {
        const vehicle = myVehicles.find((v: any) => v.id === jc.vehicleId);
        return vehicle && jc.status === "in_progress";
      })
    : [];

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = myVehicles.find((v: any) => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} - ${vehicle.licensePlate}` : "Unknown Vehicle";
  };

  const getProgressPercentage = (job: any) => {
    if (job.status === "completed") return 100;
    if (job.status === "in_progress") return 60;
    if (job.status === "pending") return 20;
    return 0;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Wrench className="h-5 w-5 text-[#0A5ED7] animate-pulse" />;
      case "pending":
        return <Clock className="h-5 w-5 text-[#F97316]" />;
      default:
        return <AlertCircle className="h-5 w-5 text-[#64748B]" />;
    }
  };

  const formatElapsedTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const hours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    const minutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60)) % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-page-title">
          Live Service Tracking
        </h1>
        <p className="text-[#64748B] mt-1">
          Real-time updates on your vehicle services in progress
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 bg-[#E2E8F0] dark:bg-[#232A36]" />
          <Skeleton className="h-96 bg-[#E2E8F0] dark:bg-[#232A36]" />
        </div>
      ) : activeJobs.length === 0 ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Clock className="h-16 w-16 text-[#64748B] mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-[#0B1F3B] dark:text-white">No Active Services</h3>
            <p className="text-[#64748B] text-center">
              You don't have any services in progress at the moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {activeJobs.map((job: any) => (
            <Card key={job.id} className="overflow-hidden bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`job-tracking-${job.id}`}>
              <div className="bg-gradient-to-r from-[#0A5ED7]/5 to-[#0BB3FF]/5 dark:from-[#0A5ED7]/10 dark:to-[#0BB3FF]/10 p-6 border-b border-[#E2E8F0] dark:border-[#232A36]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">Job #{job.jobNumber}</h3>
                    <p className="text-sm text-[#64748B]">
                      {getVehicleInfo(job.vehicleId)}
                    </p>
                  </div>
                  <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white animate-pulse">
                    In Progress
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748B]">Progress</span>
                    <span className="font-medium text-[#0B1F3B] dark:text-white">{getProgressPercentage(job)}%</span>
                  </div>
                  <Progress value={getProgressPercentage(job)} className="h-2" />
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-[#64748B]" />
                  <div>
                    <p className="text-[#64748B]">Started</p>
                    <p className="font-medium text-[#0B1F3B] dark:text-white">
                      {new Date(job.createdAt).toLocaleDateString()} at{" "}
                      {new Date(job.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-[#64748B]" />
                  <div>
                    <p className="text-[#64748B]">Elapsed Time</p>
                    <p className="font-medium text-[#0B1F3B] dark:text-white">{formatElapsedTime(job.createdAt)}</p>
                  </div>
                </div>

                {job.assignedTechnician && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-[#64748B]" />
                    <div>
                      <p className="text-[#64748B]">Technician</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{job.assignedTechnician}</p>
                    </div>
                  </div>
                )}

                {job.description && (
                  <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#232A36]">
                    <p className="text-sm font-medium mb-2 text-[#0B1F3B] dark:text-white">Service Details</p>
                    <p className="text-sm text-[#64748B]">{job.description}</p>
                  </div>
                )}

                {job.estimatedCompletionTime && (
                  <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#232A36]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#64748B]">Estimated Completion</span>
                      <span className="font-medium text-[#0B1F3B] dark:text-white">
                        {new Date(job.estimatedCompletionTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#232A36]">
                  <div className="flex items-center gap-2 text-xs text-[#64748B]">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Live updates • Refreshes every 30 seconds
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeJobs.length > 0 && (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">Service Timeline</CardTitle>
            <CardDescription className="text-[#64748B]">Current service progress stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Inspection", "Diagnosis", "Parts Ordering", "Repair", "Quality Check", "Completion"].map(
                (stage, index) => (
                  <div key={stage} className="flex items-center gap-4">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      index < 3 
                        ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" 
                        : "bg-[#E2E8F0] dark:bg-[#232A36] text-[#64748B]"
                    }`}>
                      {index < 3 ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">{stage}</p>
                      <p className="text-xs text-[#64748B]">
                        {index < 3 ? "Completed" : "Pending"}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
