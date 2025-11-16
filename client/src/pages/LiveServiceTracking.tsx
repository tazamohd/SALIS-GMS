import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle, Clock, Wrench, MapPin, Plus } from "lucide-react";

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

  const { data: jobCards = [] } = useQuery({
    queryKey: ["/api/job-cards"],
  });

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

  const postUpdateMutation = useMutation({
    mutationFn: async (data: typeof updateForm) => {
      if (!selectedJobCard) throw new Error("No job card selected");
      return await apiRequest(`/api/service-tracking/${selectedJobCard}/update`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-tracking", selectedJobCard] });
      toast({ title: "Update Posted", description: "Service tracking update has been posted successfully" });
      setIsAddUpdateOpen(false);
      setUpdateForm({ status: "", message: "", photoUrl: "", estimatedCompletion: "" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to post service update", variant: "destructive" });
    },
  });

  const transformedJobs = (jobCards as any[]).map((job: any, index: number) => {
    const status = (job.status || '').toLowerCase() || 'unknown';
    const vehicleInfo = job.vehicleInfo || {};
    const vehicleStr = `${vehicleInfo.year || ''} ${vehicleInfo.make || ''} ${vehicleInfo.model || ''}`.trim();
    
    return {
      id: job.id || job.jobNumber || `missing-id-${index}`,
      jobNumber: job.jobNumber || 'N/A',
      status,
      vehicle: vehicleStr || 'Unknown Vehicle',
      customer: job.customerName || 'Unknown',
      progress: status === 'completed' ? 100 : status === 'in_progress' ? 50 : 10,
    };
  });

  return (
    <StandardPageLayout
      title="Live Service Tracking"
      description="Real-time service progress updates for customers"
      icon={MapPin}
      actions={[
        {
          label: "Post Update",
          icon: Plus,
          onClick: () => setIsAddUpdateOpen(true),
          variant: "default",
        },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Active Job Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transformedJobs.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No active job cards</p>
              ) : (
                transformedJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedJobCard === job.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                    }`}
                    onClick={() => setSelectedJobCard(job.id)}
                    data-testid={`job-card-${job.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{job.jobNumber}</h3>
                      <Badge>{job.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{job.vehicle}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{job.customer}</p>
                    <Progress value={job.progress} className="h-2" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Service Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedJobCard ? (
              <p className="text-center py-8 text-gray-500">Select a job card to view timeline</p>
            ) : timelineLoading ? (
              <p className="text-center py-8 text-gray-500">Loading timeline...</p>
            ) : selectedTimeline.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No updates yet</p>
            ) : (
              <div className="space-y-4">
                {(selectedTimeline as any[]).map((update, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        {update.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      {index < selectedTimeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800 mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{update.status}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{update.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {update.timestamp ? new Date(update.timestamp).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddUpdateOpen} onOpenChange={setIsAddUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Service Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Status</Label>
              <Select value={updateForm.status} onValueChange={(value) => setUpdateForm({ ...updateForm, status: value })}>
                <SelectTrigger className="mt-1" data-testid="select-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="started">Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                placeholder="Update message for customer..."
                value={updateForm.message}
                onChange={(e) => setUpdateForm({ ...updateForm, message: e.target.value })}
                className="mt-1"
                data-testid="textarea-message"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => postUpdateMutation.mutate(updateForm)}
              disabled={!selectedJobCard || !updateForm.status || !updateForm.message}
              data-testid="button-post-update"
            >
              Post Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
}
