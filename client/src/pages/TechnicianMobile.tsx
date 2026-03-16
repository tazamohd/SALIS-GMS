import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { DashboardPage } from "@/components/layouts/DashboardPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Clock, Wrench, CheckCircle, Play, Package, AlertTriangle, Car, Phone, User,
  Timer, BarChart3, HardHat, LogIn, LogOut, FileText
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@shared/schema";

interface Job {
  id: string;
  jobNumber: string;
  status: string;
  description: string;
  priority: string;
  estimatedHours: number | null;
  totalCost: number | null;
  createdAt: string;
  make: string;
  model: string;
  licensePlate: string;
  year: number;
  customerName: string;
  customerPhone: string;
}

interface TechStats {
  totalJobs: number;
  completedJobs: number;
  activeJobs: number;
  avgHoursPerJob: number;
}

const priorityConfig: Record<string, { label: string; variant: "destructive" | "default" | "secondary" | "outline" }> = {
  urgent: { label: "Urgent", variant: "destructive" },
  high: { label: "High", variant: "destructive" },
  medium: { label: "Medium", variant: "default" },
  low: { label: "Low", variant: "secondary" },
};

const statusConfig: Record<string, { label: string; variant: "destructive" | "default" | "secondary" | "outline" }> = {
  pending: { label: "Pending", variant: "outline" },
  assigned: { label: "Assigned", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export default function TechnicianMobile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const currentUser = user as UserType | undefined;
  const techId = currentUser?.id?.toString() || "";

  const [clockedIn, setClockedIn] = useState(false);
  const [partsDialogOpen, setPartsDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [partName, setPartName] = useState("");
  const [partQuantity, setPartQuantity] = useState("1");
  const [partUrgency, setPartUrgency] = useState("normal");
  const [partNotes, setPartNotes] = useState("");

  // Fetch technician's jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery<{ jobs: Job[] }>({
    queryKey: ["/api/technician/my-jobs", techId],
    queryFn: () => fetch(`/api/technician/my-jobs/${techId}`).then(r => r.json()),
    enabled: !!techId,
  });

  // Fetch performance stats
  const { data: statsData } = useQuery<{ stats: TechStats }>({
    queryKey: ["/api/technician/stats", techId],
    queryFn: () => fetch(`/api/technician/stats/${techId}`).then(r => r.json()),
    enabled: !!techId,
  });

  // Clock in/out mutation
  const clockMutation = useMutation({
    mutationFn: async (action: "in" | "out") => {
      return apiRequest("POST", "/api/technician/clock", {
        technicianId: techId,
        action,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: (_, action) => {
      setClockedIn(action === "in");
      toast({
        title: action === "in" ? "Clocked In" : "Clocked Out",
        description: `You have successfully clocked ${action} at ${new Date().toLocaleTimeString()}.`,
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Clock action failed.", variant: "destructive" });
    },
  });

  // Job update mutation
  const jobUpdateMutation = useMutation({
    mutationFn: async ({ jobId, status, notes }: { jobId: string; status: string; notes?: string }) => {
      return apiRequest("POST", "/api/technician/job-update", {
        jobId, status, notes, technicianId: techId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technician/my-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/technician/stats"] });
      toast({ title: "Job Updated", description: "Job status updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update job.", variant: "destructive" });
    },
  });

  // Parts request mutation
  const partsRequestMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/technician/parts-request", {
        jobId: selectedJobId,
        technicianId: techId,
        partName,
        quantity: parseInt(partQuantity, 10),
        urgency: partUrgency,
        notes: partNotes,
      });
    },
    onSuccess: () => {
      setPartsDialogOpen(false);
      setPartName("");
      setPartQuantity("1");
      setPartUrgency("normal");
      setPartNotes("");
      toast({ title: "Parts Requested", description: `Request for "${partName}" submitted.` });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit parts request.", variant: "destructive" });
    },
  });

  const jobs = jobsData?.jobs || [];
  const stats = statsData?.stats || { totalJobs: 0, completedJobs: 0, activeJobs: 0, avgHoursPerJob: 0 };

  const getNextStatus = (currentStatus: string): string | null => {
    const flow: Record<string, string> = {
      pending: "assigned",
      assigned: "in_progress",
      in_progress: "completed",
    };
    return flow[currentStatus] || null;
  };

  const getActionLabel = (currentStatus: string): string => {
    const labels: Record<string, string> = {
      pending: "Accept Job",
      assigned: "Start Work",
      in_progress: "Mark Complete",
    };
    return labels[currentStatus] || "";
  };

  const getActionIcon = (currentStatus: string) => {
    const icons: Record<string, typeof CheckCircle> = {
      pending: CheckCircle,
      assigned: Play,
      in_progress: CheckCircle,
    };
    return icons[currentStatus] || CheckCircle;
  };

  const metrics = [
    { label: "Total Jobs", value: stats.totalJobs, icon: Wrench, color: "primary" },
    { label: "Completed", value: stats.completedJobs, icon: CheckCircle, color: "secondary" },
    { label: "Active", value: stats.activeJobs, icon: Timer, color: "tertiary" },
    {
      label: "Avg Hours/Job",
      value: typeof stats.avgHoursPerJob === "number" ? stats.avgHoursPerJob.toFixed(1) : "0",
      icon: BarChart3,
      color: "muted",
    },
  ];

  return (
    <DashboardPage
      title="Technician App"
      description="Mobile-optimized workspace for technicians"
      icon={HardHat}
      metrics={metrics}
    >
      {/* Clock In/Out Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${clockedIn ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
              <div>
                <p className="text-lg font-semibold">
                  {clockedIn ? "Currently Clocked In" : "Not Clocked In"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
            <Button
              size="lg"
              variant={clockedIn ? "destructive" : "default"}
              className="min-w-[140px] h-14 text-base"
              onClick={() => clockMutation.mutate(clockedIn ? "out" : "in")}
              disabled={clockMutation.isPending}
            >
              {clockedIn ? <LogOut className="mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />}
              {clockedIn ? "Clock Out" : "Clock In"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Jobs Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            My Jobs
          </CardTitle>
          <CardDescription>
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} assigned to you, sorted by priority
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No jobs assigned</p>
              <p className="text-sm">New jobs will appear here when assigned to you.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const priority = priorityConfig[job.priority] || priorityConfig.low;
                const status = statusConfig[job.status] || statusConfig.pending;
                const nextStatus = getNextStatus(job.status);
                const ActionIcon = getActionIcon(job.status);

                return (
                  <Card key={job.id} className="border-l-4" style={{
                    borderLeftColor: job.priority === "urgent" ? "#ef4444" : job.priority === "high" ? "#f97316" : job.priority === "medium" ? "#3b82f6" : "#6b7280"
                  }}>
                    <CardContent className="p-4">
                      {/* Job Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-base">#{job.jobNumber}</span>
                            <Badge variant={priority.variant}>{priority.label}</Badge>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{job.description || "No description"}</p>
                        </div>
                      </div>

                      {/* Vehicle & Customer Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>{job.year} {job.make} {job.model}</span>
                          {job.licensePlate && (
                            <Badge variant="outline" className="ml-1 text-xs">{job.licensePlate}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>{job.customerName || "N/A"}</span>
                        </div>
                        {job.customerPhone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <a href={`tel:${job.customerPhone}`} className="text-primary hover:underline">{job.customerPhone}</a>
                          </div>
                        )}
                        {job.estimatedHours && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>Est. {job.estimatedHours}h</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {nextStatus && (
                          <Button
                            size="lg"
                            className="flex-1 min-w-[120px] h-12"
                            onClick={() => jobUpdateMutation.mutate({ jobId: job.id, status: nextStatus })}
                            disabled={jobUpdateMutation.isPending}
                          >
                            <ActionIcon className="mr-2 h-4 w-4" />
                            {getActionLabel(job.status)}
                          </Button>
                        )}
                        <Button
                          size="lg"
                          variant="outline"
                          className="flex-1 min-w-[120px] h-12"
                          onClick={() => {
                            setSelectedJobId(job.id);
                            setPartsDialogOpen(true);
                          }}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Request Parts
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parts Request Dialog */}
      <Dialog open={partsDialogOpen} onOpenChange={setPartsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Request Parts
            </DialogTitle>
            <DialogDescription>
              Submit a parts request for the selected job. The parts department will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Part Name</label>
              <Input
                placeholder="e.g. Brake Pads, Oil Filter..."
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                min="1"
                value={partQuantity}
                onChange={(e) => setPartQuantity(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Urgency</label>
              <Select value={partUrgency} onValueChange={setPartUrgency}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Can wait</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High - Needed soon</SelectItem>
                  <SelectItem value="urgent">Urgent - Blocking work</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Additional details about the parts needed..."
                value={partNotes}
                onChange={(e) => setPartNotes(e.target.value)}
                className="min-h-[80px] text-base"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPartsDialogOpen(false)} className="h-12">
              Cancel
            </Button>
            <Button
              onClick={() => partsRequestMutation.mutate()}
              disabled={!partName || partsRequestMutation.isPending}
              className="h-12"
            >
              <Package className="mr-2 h-4 w-4" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPage>
  );
}
