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
    queryKey: ["/api/vehicles", user?.id],
    enabled: !!user?.id,
  });

  const { data: jobCards, isLoading } = useQuery({
    queryKey: ["/api/job-cards"],
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds for live updates
  });

  const myVehicles = Array.isArray(vehicles)
    ? vehicles.filter((v: any) => v.customerId === user?.id)
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
        return <Wrench className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          Live Service Tracking
        </h1>
        <p className="text-muted-foreground mt-1">
          Real-time updates on your vehicle services in progress
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      ) : activeJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Clock className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Services</h3>
            <p className="text-muted-foreground text-center">
              You don't have any services in progress at the moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {activeJobs.map((job: any) => (
            <Card key={job.id} className="overflow-hidden" data-testid={`job-tracking-${job.id}`}>
              <div className="bg-primary/5 p-6 border-b">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Job #{job.jobNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getVehicleInfo(job.vehicleId)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="animate-pulse">
                    In Progress
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{getProgressPercentage(job)}%</span>
                  </div>
                  <Progress value={getProgressPercentage(job)} className="h-2" />
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Started</p>
                    <p className="font-medium">
                      {new Date(job.createdAt).toLocaleDateString()} at{" "}
                      {new Date(job.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Elapsed Time</p>
                    <p className="font-medium">{formatElapsedTime(job.createdAt)}</p>
                  </div>
                </div>

                {job.assignedTechnician && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Technician</p>
                      <p className="font-medium">{job.assignedTechnician}</p>
                    </div>
                  </div>
                )}

                {job.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Service Details</p>
                    <p className="text-sm text-muted-foreground">{job.description}</p>
                  </div>
                )}

                {job.estimatedCompletionTime && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Completion</span>
                      <span className="font-medium">
                        {new Date(job.estimatedCompletionTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Live updates • Refreshes every 30 seconds
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Completed */}
      {activeJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Service Timeline</CardTitle>
            <CardDescription>Current service progress stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Inspection", "Diagnosis", "Parts Ordering", "Repair", "Quality Check", "Completion"].map(
                (stage, index) => (
                  <div key={stage} className="flex items-center gap-4">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      index < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {index < 3 ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{stage}</p>
                      <p className="text-xs text-muted-foreground">
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
