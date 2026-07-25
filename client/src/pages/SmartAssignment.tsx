import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Brain, User, TrendingUp, Clock, Award, CheckCircle } from "lucide-react";

interface Recommendation {
  id?: string;
  technicianId: string;
  technicianName: string;
  confidence: number;
  rationale: string;
  matchedSkills: string[];
  estimatedWorkload: string;
  availability: string;
}

export function SmartAssignment() {
  const { t } = useTranslation();
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const { toast } = useToast();

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/job-cards"],
  });

  const recommendationsMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return await apiRequest("POST", `/api/assignments/recommend/${jobId}`, {});
    },
    onSuccess: (data: any) => {
      setRecommendations(data.recommendations || []);
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('smartAssignment.failedToGetRecommendations', 'Failed to get AI recommendations'),
        variant: "destructive",
      });
      setRecommendations([]);
    },
  });

  const assignMutation = useMutation({
    mutationFn: async (params: { jobCardId: string; technicianId: string; aiRecommendationId?: string }) => {
      return await apiRequest("POST", "/api/assignments/assign", params);
    },
    onSuccess: () => {
      toast({
        title: t('common.success', 'Success'),
        description: t('smartAssignment.technicianAssignedSuccessfully', 'Technician assigned successfully'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
      setRecommendations([]);
      setSelectedJobId("");
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('smartAssignment.failedToAssignTechnician', 'Failed to assign technician'),
        variant: "destructive",
      });
    },
  });

  const unassignedJobs = (jobs as any[] || []).filter((job: any) => !job.assignedTo && job.status === "pending");

  const handleGetRecommendations = async (jobId: string) => {
    setSelectedJobId(jobId);
    recommendationsMutation.mutate(jobId);
  };

  const handleAssign = (technicianId: string, aiRecommendationId?: string) => {
    if (!selectedJobId) return;
    assignMutation.mutate({ jobCardId: selectedJobId, technicianId, aiRecommendationId });
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return <Badge className="bg-emerald-500/10 text-emerald-600" data-testid={`badge-confidence-${confidence}`}>{t('smartAssignment.high', 'High')} {confidence}%</Badge>;
    if (confidence >= 60) return <Badge className="bg-[#F97316]/10 text-[#F97316]" data-testid={`badge-confidence-${confidence}`}>{t('smartAssignment.medium', 'Medium')} {confidence}%</Badge>;
    return <Badge className="bg-[#64748B]/10 text-[#64748B]" data-testid={`badge-confidence-${confidence}`}>{t('smartAssignment.low', 'Low')} {confidence}%</Badge>;
  };

  const getWorkloadBadge = (workload: string) => {
    const colors: Record<string, string> = {
      low: "bg-emerald-500/10 text-emerald-600",
      medium: "bg-[#F97316]/10 text-[#F97316]",
      high: "bg-red-500/10 text-red-600"
    };
    return <Badge className={colors[workload] || "bg-[#64748B]/10 text-[#64748B]"} data-testid={`badge-workload-${workload}`}>{workload}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-[#64748B]/10 text-[#64748B]",
      medium: "bg-[#0A5ED7]/10 text-[#0A5ED7]",
      high: "bg-[#F97316]/10 text-[#F97316]",
      urgent: "bg-red-500/10 text-red-600"
    };
    return colors[priority] || "bg-[#64748B]/10 text-[#64748B]";
  };

  return (
    <StandardPageLayout
      title={t('smartAssignment.title', 'Smart Job Assignment')}
      description={t('smartAssignment.description', 'AI-powered technician recommendations for optimal job assignments')}
      icon={Brain}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('smartAssignment.unassignedJobs', 'Unassigned Jobs')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('smartAssignment.selectJobForRecommendations', 'Select a job to get AI recommendations')}</CardDescription>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : unassignedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#0A5ED7]/20" />
                </div>
                <p className="text-[#64748B] text-center" data-testid="text-no-jobs">
                  {t('smartAssignment.noUnassignedJobs', 'No unassigned jobs available')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {unassignedJobs.map((job: any) => (
                  <Card
                    key={job.id}
                    className={`cursor-pointer transition-all bg-[#F8FAFC] dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7]/50 ${selectedJobId === job.id ? "border-[#0A5ED7] bg-[#0A5ED7]/5" : ""}`}
                    onClick={() => handleGetRecommendations(job.id)}
                    data-testid={`card-job-${job.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-[#0B1F3B] dark:text-white" data-testid={`text-job-number-${job.id}`}>{job.jobNumber}</p>
                          <p className="text-sm text-[#64748B]">{job.serviceType}</p>
                        </div>
                        <Badge className={getPriorityBadge(job.priority)} data-testid={`badge-priority-${job.priority}`}>{job.priority}</Badge>
                      </div>
                      <p className="text-sm mt-2 line-clamp-2 text-[#64748B]">{job.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#0A5ED7]" />
              {t('smartAssignment.aiRecommendations', 'AI Recommendations')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('smartAssignment.topTechnicianMatches', 'Top technician matches for selected job')}</CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedJobId ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#0A5ED7]/20" />
                  <div className="absolute -bottom-1 -left-2 w-5 h-5 rounded-full bg-[#0BB3FF]/20" />
                </div>
                <p className="text-[#64748B] text-center" data-testid="text-select-job">
                  {t('smartAssignment.selectJobToSeeRecommendations', 'Select a job to see AI recommendations')}
                </p>
              </div>
            ) : recommendationsMutation.isPending ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
              </div>
            ) : recommendations.length === 0 ? (
              <p className="text-[#64748B] text-center py-8" data-testid="text-no-recommendations">
                {t('smartAssignment.noRecommendationsAvailable', 'No recommendations available')}
              </p>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <Card key={rec.technicianId} className="border-2 bg-[#F8FAFC] dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`card-recommendation-${rec.technicianId}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white font-bold">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold flex items-center gap-2 text-[#0B1F3B] dark:text-white" data-testid={`text-technician-name-${rec.technicianId}`}>
                              <User className="h-4 w-4 text-[#0A5ED7]" />
                              {rec.technicianName}
                            </p>
                          </div>
                        </div>
                        {getConfidenceBadge(rec.confidence)}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className="h-4 w-4 text-[#0A5ED7]" />
                          {getWorkloadBadge(rec.estimatedWorkload)}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4 text-[#0A5ED7]" />
                          <span className="text-[#64748B]" data-testid={`text-availability-${rec.technicianId}`}>{rec.availability}</span>
                        </div>
                      </div>

                      {rec.matchedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <Award className="h-4 w-4 mt-1 text-[#0A5ED7]" />
                          {rec.matchedSkills.map((skill) => (
                            <Badge key={skill} variant="outline" className="border-[#0A5ED7]/30 text-[#0A5ED7]" data-testid={`badge-skill-${skill}`}>{skill}</Badge>
                          ))}
                        </div>
                      )}

                      <p className="text-sm text-[#64748B]" data-testid={`text-rationale-${rec.technicianId}`}>
                        {rec.rationale}
                      </p>

                      <Button
                        onClick={() => handleAssign(rec.technicianId, rec.id)}
                        disabled={assignMutation.isPending}
                        className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
                        data-testid={`button-assign-${rec.technicianId}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {assignMutation.isPending ? t('smartAssignment.assigning', 'Assigning...') : t('smartAssignment.assignToJob', 'Assign to Job')}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
}
