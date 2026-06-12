import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Wrench, CheckCircle, AlertCircle, User as UserIcon, Award, Briefcase, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";
import type { JobCard, User, TechnicianProfile } from "@shared/schema";

export function TechnicianPortal() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const currentUser = user as User | undefined;

  const { data: technicianProfile } = useQuery<TechnicianProfile>({
    queryKey: ['/api/technician-profiles', currentUser?.id],
    enabled: !!currentUser?.id,
    queryFn: () => fetch(`/api/technician-profiles/${currentUser?.id}`).then((r) => r.json()),
  });

  const { data: jobCards, isLoading } = useQuery<JobCard[]>({
    queryKey: ['/api/job-cards', 'assigned', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/job-cards/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-cards'] });
      toast({
        title: t('common.success', 'Success'),
        description: t('technician.statusUpdatedSuccess', 'Job card status has been updated successfully.'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('technician.statusUpdateError', 'Failed to update job card status.'),
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (jobCardId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: jobCardId, status: newStatus });
  };

  const stats = {
    total: jobCards?.length || 0,
    pending: jobCards?.filter(j => j.status === 'pending' || j.status === 'assigned').length || 0,
    inProgress: jobCards?.filter(j => j.status === 'in_progress').length || 0,
    completed: jobCards?.filter(j => j.status === 'completed').length || 0,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-[#64748B] text-white';
      case 'assigned': return 'bg-[#0BB3FF] text-white';
      case 'in_progress': return 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white';
      case 'completed': return 'bg-[#0A5ED7] text-white';
      case 'cancelled': return 'bg-[#F97316] text-white';
      default: return 'bg-[#64748B] text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-[#F97316] text-white';
      case 'high': return 'bg-[#F97316] text-white';
      case 'medium': return 'bg-[#0A5ED7] text-white';
      case 'low': return 'bg-[#64748B] text-white';
      default: return 'bg-[#64748B] text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-[#F8FAFC] dark:bg-[#0E1117]">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#E2E8F0] dark:bg-[#232A36] rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-[#E2E8F0] dark:bg-[#232A36] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getLevelBadgeVariant = (level?: string) => {
    switch (level) {
      case "master":
        return "default";
      case "senior":
        return "secondary";
      case "intermediate":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <StandardPageLayout
      title={t('technician.portal', 'Technician Portal')}
      description={t('technician.welcomeBack', 'Welcome back, {{name}}! Here are your assigned tasks.', { name: currentUser?.fullName || t('technician.technician', 'Technician') })}
      icon={Wrench}
    >
      {technicianProfile && (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] mb-8" data-testid="card-profile">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#0B1F3B] dark:text-white" data-testid="text-profile-title">{t('technician.myProfile', 'My Profile')}</CardTitle>
                <CardDescription className="text-[#64748B]" data-testid="text-profile-subtitle">{t('technician.profileDescription', 'Your technician information and qualifications')}</CardDescription>
              </div>
              <div className="flex gap-2">
                {technicianProfile.level && (
                  <Badge variant={getLevelBadgeVariant(technicianProfile.level)} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0" data-testid="badge-level">
                    {technicianProfile.level}
                  </Badge>
                )}
                {technicianProfile.isLead && (
                  <Badge variant="default" className="bg-[#0A5ED7] text-white border-0" data-testid="badge-lead">{t('technician.leadTechnician', 'Lead Technician')}</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {technicianProfile.speciality && (
                <div className="flex items-start gap-3" data-testid="text-speciality">
                  <Briefcase className="h-5 w-5 mt-0.5 text-[#0A5ED7]" />
                  <div>
                    <div className="font-medium text-sm text-[#64748B]">{t('technician.speciality', 'Speciality')}</div>
                    <div className="text-sm text-[#0B1F3B] dark:text-white">{technicianProfile.speciality}</div>
                  </div>
                </div>
              )}

              {technicianProfile.yearsOfExperience !== undefined && (
                <div className="flex items-start gap-3" data-testid="text-experience">
                  <Clock className="h-5 w-5 mt-0.5 text-[#0A5ED7]" />
                  <div>
                    <div className="font-medium text-sm text-[#64748B]">{t('technician.experience', 'Experience')}</div>
                    <div className="text-sm text-[#0B1F3B] dark:text-white">{t('technician.yearsExperience', '{{count}} years', { count: technicianProfile.yearsOfExperience ?? 0 })}</div>
                  </div>
                </div>
              )}

              {technicianProfile.maxConcurrentJobs !== undefined && (
                <div className="flex items-start gap-3" data-testid="text-capacity">
                  <Wrench className="h-5 w-5 mt-0.5 text-[#0A5ED7]" />
                  <div>
                    <div className="font-medium text-sm text-[#64748B]">{t('technician.jobCapacity', 'Job Capacity')}</div>
                    <div className="text-sm text-[#0B1F3B] dark:text-white">{t('technician.upToJobs', 'Up to {{count}} jobs', { count: technicianProfile.maxConcurrentJobs ?? 0 })}</div>
                  </div>
                </div>
              )}
            </div>

            {(technicianProfile.qualifications || technicianProfile.certifications || technicianProfile.skills) && (
              <div className="mt-6 pt-6 border-t border-[#E2E8F0] dark:border-[#232A36] grid grid-cols-1 md:grid-cols-3 gap-6">
                {technicianProfile.qualifications && (
                  <div className="flex items-start gap-3" data-testid="text-qualifications">
                    <GraduationCap className="h-5 w-5 mt-0.5 text-[#0BB3FF]" />
                    <div>
                      <div className="font-medium text-sm text-[#64748B]">{t('technician.qualifications', 'Qualifications')}</div>
                      <div className="text-sm text-[#0B1F3B] dark:text-white">{technicianProfile.qualifications}</div>
                    </div>
                  </div>
                )}

                {technicianProfile.certifications && (
                  <div className="flex items-start gap-3" data-testid="text-certifications">
                    <Award className="h-5 w-5 mt-0.5 text-[#0BB3FF]" />
                    <div>
                      <div className="font-medium text-sm text-[#64748B]">{t('technician.certifications', 'Certifications')}</div>
                      <div className="text-sm text-[#0B1F3B] dark:text-white">{technicianProfile.certifications}</div>
                    </div>
                  </div>
                )}

                {technicianProfile.skills && (
                  <div className="flex items-start gap-3" data-testid="text-skills">
                    <Wrench className="h-5 w-5 mt-0.5 text-[#0BB3FF]" />
                    <div>
                      <div className="font-medium text-sm text-[#64748B]">{t('technician.skills', 'Skills')}</div>
                      <div className="text-sm text-[#0B1F3B] dark:text-white">{technicianProfile.skills}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="stat-total-jobs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('technician.totalJobs', 'Total Jobs')}</CardTitle>
            <Wrench className="h-4 w-4 text-[#0A5ED7]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{stats.total}</div>
            <p className="text-xs text-[#64748B]">{t('technician.allAssignedWork', 'All assigned work')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="stat-pending-jobs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('common.pending', 'Pending')}</CardTitle>
            <Clock className="h-4 w-4 text-[#64748B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{stats.pending}</div>
            <p className="text-xs text-[#64748B]">{t('technician.waitingToStart', 'Waiting to start')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="stat-in-progress-jobs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('common.inProgress', 'In Progress')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-[#0BB3FF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{stats.inProgress}</div>
            <p className="text-xs text-[#64748B]">{t('technician.currentlyWorking', 'Currently working')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="stat-completed-jobs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('common.completed', 'Completed')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-[#0A5ED7]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{stats.completed}</div>
            <p className="text-xs text-[#64748B]">{t('technician.finishedJobs', 'Finished jobs')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#0B1F3B] dark:text-white">{t('technician.myAssignedJobs', 'My Assigned Jobs')}</h2>
        
        {!jobCards || jobCards.length === 0 ? (
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wrench className="h-12 w-12 text-[#64748B] mb-4" />
              <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white mb-2">{t('technician.noJobsAssigned', 'No Jobs Assigned')}</h3>
              <p className="text-[#64748B] text-center">
                {t('technician.noJobsMessage', "You don't have any jobs assigned to you at the moment.")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobCards.map((job) => (
              <Card key={job.id} data-testid={`job-card-${job.id}`} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:shadow-lg hover:border-[#0A5ED7]/30 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{job.jobNumber}</CardTitle>
                      <CardDescription className="text-[#64748B]">{job.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(job.priority)} data-testid={`badge-priority-${job.id}`}>
                        {job.priority.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(job.status)} data-testid={`badge-status-${job.id}`}>
                        {job.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <UserIcon className="h-4 w-4 text-[#0A5ED7]" />
                      <span className="font-medium text-[#0B1F3B] dark:text-white">{t('technician.vehicle', 'Vehicle')}:</span>
                      <span className="text-[#64748B]">
                        {(job.vehicleInfo as any)?.year} {(job.vehicleInfo as any)?.make} {(job.vehicleInfo as any)?.model} - {(job.vehicleInfo as any)?.licensePlate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Wrench className="h-4 w-4 text-[#0A5ED7]" />
                      <span className="font-medium text-[#0B1F3B] dark:text-white">{t('technician.service', 'Service')}:</span>
                      <span className="text-[#64748B] capitalize">{job.serviceType.replace('_', ' ')}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-[#0A5ED7]" />
                      <span className="font-medium text-[#0B1F3B] dark:text-white">{t('technician.estTime', 'Est. Time')}:</span>
                      <span className="text-[#64748B]">{t('technician.hoursCount', '{{count}} hours', { count: Number(job.estimatedHours) || 0 })}</span>
                      {job.scheduledDate && (
                        <>
                          <span className="mx-2 text-[#64748B]">•</span>
                          <Calendar className="h-4 w-4 text-[#0BB3FF]" />
                          <span className="font-medium text-[#0B1F3B] dark:text-white">{t('technician.scheduled', 'Scheduled')}:</span>
                          <span className="text-[#64748B]">
                            {new Date(job.scheduledDate).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#232A36]">
                      <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('technician.updateStatus', 'Update Status')}:</label>
                      <Select
                        value={job.status}
                        onValueChange={(value) => handleStatusChange(job.id, value)}
                        data-testid={`select-status-${job.id}`}
                      >
                        <SelectTrigger className="w-48 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="assigned" className="text-[#0B1F3B] dark:text-white">{t('technician.statusAssigned', 'Assigned')}</SelectItem>
                          <SelectItem value="in_progress" className="text-[#0B1F3B] dark:text-white">{t('technician.statusInProgress', 'In Progress')}</SelectItem>
                          <SelectItem value="completed" className="text-[#0B1F3B] dark:text-white">{t('technician.statusCompleted', 'Completed')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StandardPageLayout>
  );
}
