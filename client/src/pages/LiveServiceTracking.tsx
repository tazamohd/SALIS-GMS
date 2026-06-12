import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle, Clock, Wrench, MapPin, Plus } from "lucide-react";

export default function LiveServiceTracking() {
  const { t } = useTranslation();
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
      if (!response.ok) throw new Error(t('liveTracking.failedFetchTimeline', 'Failed to fetch timeline'));
      return response.json();
    },
    enabled: !!selectedJobCard,
  });

  const postUpdateMutation = useMutation({
    mutationFn: async (data: typeof updateForm) => {
      if (!selectedJobCard) throw new Error(t('liveTracking.noJobCardSelected', 'No job card selected'));
      return await apiRequest(`/api/service-tracking/${selectedJobCard}/update`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-tracking", selectedJobCard] });
      toast({ title: t('liveTracking.updatePosted', 'Update Posted'), description: t('liveTracking.updatePostedSuccess', 'Service tracking update has been posted successfully') });
      setIsAddUpdateOpen(false);
      setUpdateForm({ status: "", message: "", photoUrl: "", estimatedCompletion: "" });
    },
    onError: (error: any) => {
      toast({ title: t('common.error', 'Error'), description: error.message || t('liveTracking.failedPostUpdate', 'Failed to post service update'), variant: "destructive" });
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
      vehicle: vehicleStr || t('liveTracking.unknownVehicle', 'Unknown Vehicle'),
      customer: job.customerName || t('liveTracking.unknown', 'Unknown'),
      progress: status === 'completed' ? 100 : status === 'in_progress' ? 50 : 10,
    };
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-0">{status}</Badge>;
      case "in_progress":
        return <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] border-0">{status}</Badge>;
      default:
        return <Badge className="bg-[#64748B]/10 text-[#64748B] border-0">{status}</Badge>;
    }
  };

  return (
    <StandardPageLayout
      title={t('liveTracking.title', 'Live Service Tracking')}
      description={t('liveTracking.description', 'Real-time service progress updates for customers')}
      icon={MapPin}
      actions={[
        {
          label: t('liveTracking.postUpdate', 'Post Update'),
          icon: Plus,
          onClick: () => setIsAddUpdateOpen(true),
          variant: "default",
        },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('liveTracking.activeJobCards', 'Active Job Cards')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transformedJobs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center mx-auto mb-4">
                    <Wrench className="h-8 w-8 text-[#0A5ED7]" />
                  </div>
                  <p className="text-[#64748B]">{t('liveTracking.noActiveJobCards', 'No active job cards')}</p>
                </div>
              ) : (
                transformedJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedJobCard === job.id
                        ? "border-[#0A5ED7] bg-[#0A5ED7]/5 dark:bg-[#0A5ED7]/10 shadow-sm"
                        : "border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] hover:border-[#0A5ED7]/50"
                    }`}
                    onClick={() => setSelectedJobCard(job.id)}
                    data-testid={`job-card-${job.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{job.jobNumber}</h3>
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="text-sm text-[#64748B] mb-2">{job.vehicle}</p>
                    <p className="text-sm text-[#64748B] mb-2">{job.customer}</p>
                    <div className="relative">
                      <Progress value={job.progress} className="h-2 bg-[#E2E8F0] dark:bg-[#232A36]" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('liveTracking.serviceTimeline', 'Service Timeline')}</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedJobCard ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-[#0A5ED7]" />
                </div>
                <p className="text-[#64748B]">{t('liveTracking.selectJobCard', 'Select a job card to view timeline')}</p>
              </div>
            ) : timelineLoading ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Clock className="h-8 w-8 text-[#0A5ED7]" />
                </div>
                <p className="text-[#64748B]">{t('liveTracking.loadingTimeline', 'Loading timeline...')}</p>
              </div>
            ) : selectedTimeline.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-[#0A5ED7]" />
                </div>
                <p className="text-[#64748B]">{t('liveTracking.noUpdatesYet', 'No updates yet')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(selectedTimeline as any[]).map((update, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        update.status === 'completed' 
                          ? 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]' 
                          : 'bg-[#0A5ED7]/10'
                      }`}>
                        {update.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-white" />
                        ) : (
                          <Clock className="h-4 w-4 text-[#0A5ED7]" />
                        )}
                      </div>
                      {index < selectedTimeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gradient-to-b from-[#0A5ED7] to-[#0BB3FF] mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-semibold text-[#0B1F3B] dark:text-white capitalize">{update.status}</p>
                      <p className="text-sm text-[#64748B]">{update.message}</p>
                      <p className="text-xs text-[#64748B]/70 mt-1">
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
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('liveTracking.postServiceUpdate', 'Post Service Update')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</Label>
              <Select value={updateForm.status} onValueChange={(value) => setUpdateForm({ ...updateForm, status: value })}>
                <SelectTrigger className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-status">
                  <SelectValue placeholder={t('liveTracking.selectStatus', 'Select status')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectItem value="started">{t('liveTracking.statusStarted', 'Started')}</SelectItem>
                  <SelectItem value="in_progress">{t('common.inProgress', 'In Progress')}</SelectItem>
                  <SelectItem value="completed">{t('common.completed', 'Completed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#0B1F3B] dark:text-white">{t('liveTracking.message', 'Message')}</Label>
              <Textarea
                placeholder={t('liveTracking.updateMessagePlaceholder', 'Update message for customer...')}
                value={updateForm.message}
                onChange={(e) => setUpdateForm({ ...updateForm, message: e.target.value })}
                className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                data-testid="textarea-message"
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C1] hover:to-[#0AA3E8] text-white border-0"
              onClick={() => postUpdateMutation.mutate(updateForm)}
              disabled={!selectedJobCard || !updateForm.status || !updateForm.message}
              data-testid="button-post-update"
            >
              {t('liveTracking.postUpdate', 'Post Update')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
}
