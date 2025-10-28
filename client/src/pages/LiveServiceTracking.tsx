import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  CheckCircle,
  Clock,
  Wrench,
  Package,
  Search,
  Bell,
  MapPin,
  Plus,
} from "lucide-react";

export default function LiveServiceTracking() {
  const [selectedJobCard, setSelectedJobCard] = useState<string | null>(null);
  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    message: "",
    photoUrl: "",
    estimatedCompletion: "",
  });
  const { toast } = useToast();

  // Fetch all active job cards
  const { data: jobCards = [] } = useQuery({
    queryKey: ["/api/job-cards"],
  });

  // Fetch service tracking timeline for selected job card
  const { data: selectedTimeline = [], isLoading: timelineLoading } = useQuery({
    queryKey: ["/api/service-tracking", selectedJobCard],
    queryFn: async () => {
      if (!selectedJobCard) return [];
      const response = await fetch(`/api/service-tracking/${selectedJobCard}`);
      if (!response.ok) throw new Error("Failed to fetch timeline");
      return response.json();
    },
    enabled: !!selectedJobCard,
  });

  // Mutation to post service update
  const postUpdateMutation = useMutation({
    mutationFn: async (data: typeof updateForm) => {
      if (!selectedJobCard) throw new Error("No job card selected");
      return await apiRequest(`/api/service-tracking/${selectedJobCard}/update`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-tracking", selectedJobCard] });
      toast({
        title: "Update Posted",
        description: "Service tracking update has been posted successfully",
      });
      setIsAddUpdateOpen(false);
      setUpdateForm({ status: "", message: "", photoUrl: "", estimatedCompletion: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post service update",
        variant: "destructive",
      });
    },
  });

  // Transform backend job cards to frontend format with stable IDs
  const transformedJobs = (jobCards as any[]).map((job: any, index: number) => {
    const status = (job.status || '').toLowerCase() || 'unknown';
    const vehicleInfo = job.vehicleInfo || {};
    const vehicleStr = `${vehicleInfo.year || ''} ${vehicleInfo.make || ''} ${vehicleInfo.model || ''}`.trim();
    
    return {
      id: job.id || job.jobNumber || `missing-id-${index}`,  // Stable fallback using index
      jobNumber: job.jobNumber || 'N/A',
      status,
      customerName: job.customerName || (job.customerId ? `Customer ${job.customerId.slice(0, 8)}` : null),
      vehicle: vehicleStr || null,
      currentStep: status === 'unknown' ? null : status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      progress: job.progress !== undefined && job.progress !== null ? Number(job.progress) : null,
      estimatedCompletion: job.scheduledDate || job.createdAt || null,
      dueDate: job.scheduledDate || job.createdAt || null,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
    };
  });

  // Calculate statistics from real job cards with expanded status matching
  const activeJobs = transformedJobs.filter((job: any) => 
    job.status && !["completed", "cancelled", "closed"].includes(job.status)
  );
  const completedToday = transformedJobs.filter((job: any) => {
    if (job.status !== "completed") return false;
    const completedDate = job.completedAt || job.updatedAt;
    if (!completedDate) return false;
    try {
      const completed = new Date(completedDate);
      const today = new Date();
      return completed.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  });
  
  const stats = {
    activeJobs: activeJobs.length,
    completedToday: completedToday.length,
    averageProgress: (() => {
      const jobsWithProgress = activeJobs.filter((job: any) => job.progress !== null && job.progress !== undefined);
      return jobsWithProgress.length > 0 
        ? Math.round(jobsWithProgress.reduce((acc: number, job: any) => acc + job.progress, 0) / jobsWithProgress.length)
        : null;
    })(),
    onSchedule: activeJobs.filter((job: any) => {
      try {
        return job.estimatedCompletion && new Date(job.estimatedCompletion) > new Date();
      } catch {
        return false;
      }
    }).length,
  };

  // Mock data for fallback (will be hidden when real data loads)
  const mockActiveJobs = [
    {
      id: "JC-2024-1850",
      customerName: "John Smith",
      vehicle: "2020 Honda Civic",
      status: "in_progress",
      currentStep: "Brake System Repair",
      progress: 65,
      estimatedCompletion: "2024-10-26T16:00:00Z",
      updates: [
        {
          id: "1",
          status: "checked_in",
          title: "Vehicle Check-In Complete",
          description: "Vehicle received and initial inspection completed",
          timestamp: "2024-10-26T09:00:00Z",
          technicianName: "Mike Davis",
        },
        {
          id: "2",
          status: "diagnosing",
          title: "Diagnostic Scan Complete",
          description: "Identified worn brake pads and rotors requiring replacement",
          timestamp: "2024-10-26T09:30:00Z",
          technicianName: "Mike Davis",
        },
        {
          id: "3",
          status: "parts_ordered",
          title: "Parts Ordered",
          description: "OEM brake pads and rotors ordered, expected arrival in 1 hour",
          timestamp: "2024-10-26T10:00:00Z",
          technicianName: "Mike Davis",
        },
        {
          id: "4",
          status: "in_progress",
          title: "Repair In Progress",
          description: "Installing new brake pads and rotors on front axle",
          timestamp: "2024-10-26T13:00:00Z",
          technicianName: "Mike Davis",
        },
      ],
    },
    {
      id: "JC-2024-1851",
      customerName: "Sarah Johnson",
      vehicle: "2019 Toyota Camry",
      status: "diagnosing",
      currentStep: "Engine Diagnostic",
      progress: 25,
      estimatedCompletion: "2024-10-26T15:30:00Z",
      updates: [
        {
          id: "1",
          status: "checked_in",
          title: "Vehicle Check-In Complete",
          description: "Customer reported check engine light",
          timestamp: "2024-10-26T12:00:00Z",
          technicianName: "Emily Brown",
        },
        {
          id: "2",
          status: "diagnosing",
          title: "Running Diagnostic Tests",
          description: "OBD-II scan in progress, analyzing error codes",
          timestamp: "2024-10-26T12:30:00Z",
          technicianName: "Emily Brown",
        },
      ],
    },
    {
      id: "JC-2024-1848",
      customerName: "Mike Wilson",
      vehicle: "2021 Ford F-150",
      status: "ready",
      currentStep: "Quality Check Complete",
      progress: 100,
      estimatedCompletion: "2024-10-26T14:00:00Z",
      updates: [
        {
          id: "1",
          status: "completed",
          title: "Service Complete",
          description: "Oil change and tire rotation completed, ready for pickup",
          timestamp: "2024-10-26T13:45:00Z",
          technicianName: "John Smith",
        },
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      checked_in: { variant: "secondary", label: "Checked In" },
      diagnosing: { variant: "default", label: "Diagnosing" },
      parts_ordered: { variant: "default", label: "Parts Ordered" },
      in_progress: { variant: "default", label: "In Progress" },
      quality_check: { variant: "default", label: "Quality Check" },
      ready: { variant: "default", label: "Ready" },
      completed: { variant: "default", label: "Completed" },
    };
    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      checked_in: <MapPin className="h-5 w-5 text-blue-600" />,
      diagnosing: <Search className="h-5 w-5 text-purple-600" />,
      parts_ordered: <Package className="h-5 w-5 text-orange-600" />,
      in_progress: <Wrench className="h-5 w-5 text-blue-600" />,
      quality_check: <CheckCircle className="h-5 w-5 text-green-600" />,
      ready: <Bell className="h-5 w-5 text-green-600" />,
      completed: <CheckCircle className="h-5 w-5 text-green-600" />,
    };
    return icons[status] || <Clock className="h-5 w-5 text-gray-600" />;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            🚗 Live Service Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time updates on active service jobs
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-active-jobs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.activeJobs}</h3>
              </div>
              <Wrench className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-completed-today">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.completedToday}</h3>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-avg-progress">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {stats.averageProgress !== null ? `${stats.averageProgress}%` : 'N/A'}
                </h3>
              </div>
              <Clock className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-on-schedule">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">On Schedule</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.onSchedule}</h3>
              </div>
              <Bell className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Jobs List */}
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Service Jobs</CardTitle>
          {selectedJobCard && (
            <Dialog open={isAddUpdateOpen} onOpenChange={setIsAddUpdateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-update">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Update
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Post Service Update - {selectedJobCard}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={updateForm.status}
                      onValueChange={(value) => setUpdateForm({ ...updateForm, status: value })}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checked_in">Checked In</SelectItem>
                        <SelectItem value="diagnosing">Diagnosing</SelectItem>
                        <SelectItem value="parts_ordered">Parts Ordered</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="quality_check">Quality Check</SelectItem>
                        <SelectItem value="ready">Ready for Pickup</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="message">Update Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe what's happening with this service..."
                      value={updateForm.message}
                      onChange={(e) => setUpdateForm({ ...updateForm, message: e.target.value })}
                      rows={3}
                      data-testid="input-message"
                    />
                  </div>
                  <div>
                    <Label htmlFor="photoUrl">Photo URL (Optional)</Label>
                    <Input
                      id="photoUrl"
                      placeholder="https://..."
                      value={updateForm.photoUrl}
                      onChange={(e) => setUpdateForm({ ...updateForm, photoUrl: e.target.value })}
                      data-testid="input-photo-url"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedCompletion">Est. Completion (Optional)</Label>
                    <Input
                      id="estimatedCompletion"
                      type="datetime-local"
                      value={updateForm.estimatedCompletion}
                      onChange={(e) => setUpdateForm({ ...updateForm, estimatedCompletion: e.target.value })}
                      data-testid="input-estimated-completion"
                    />
                  </div>
                  <Button
                    onClick={() => postUpdateMutation.mutate(updateForm)}
                    disabled={!updateForm.status || !updateForm.message || postUpdateMutation.isPending}
                    className="w-full"
                    data-testid="button-submit-update"
                  >
                    {postUpdateMutation.isPending ? "Posting..." : "Post Update"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No active service jobs at the moment
              </div>
            ) : (
              activeJobs.map((job: any) => (
              <div
                key={job.id}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                onClick={() => setSelectedJobCard(job.id)}
                data-testid={`job-${job.id}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{job.id}</h3>
                    {getStatusBadge(job.status)}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ETA: {(job.estimatedCompletion || job.dueDate) 
                      ? new Date(job.estimatedCompletion || job.dueDate).toLocaleTimeString()
                      : 'Unavailable'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <div><span className="font-medium">Customer:</span> {job.customerName || "N/A"}</div>
                  <div><span className="font-medium">Vehicle:</span> {job.vehicle || "N/A"}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-900 dark:text-white font-medium">{job.currentStep || job.status}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {job.progress !== null && job.progress !== undefined ? `${job.progress}%` : 'N/A'}
                    </span>
                  </div>
                  {job.progress !== null && job.progress !== undefined ? (
                    <Progress value={job.progress} className="h-2" />
                  ) : (
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full">
                      <div className="h-full bg-gray-400 dark:bg-gray-600 rounded-full w-0" />
                    </div>
                  )}
                </div>
                {selectedJobCard === job.id && (selectedTimeline as any[]).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Service Updates</h4>
                    {timelineLoading ? (
                      <p className="text-sm text-gray-500">Loading timeline...</p>
                    ) : (
                      <div className="space-y-3">
                        {(selectedTimeline as any[]).map((update: any) => (
                          <div key={update.id} className="flex gap-3" data-testid={`update-${update.id}`}>
                            <div className="mt-1">{getStatusIcon(update.status)}</div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-white">{update.status}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{update.message}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span>{new Date(update.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
