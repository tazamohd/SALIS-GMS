import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
    onSuccess: (data) => {
      setRecommendations(data.recommendations || []);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to get AI recommendations",
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
        title: "Success",
        description: "Technician assigned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
      setRecommendations([]);
      setSelectedJobId("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign technician",
        variant: "destructive",
      });
    },
  });

  const unassignedJobs = jobs?.filter((job: any) => !job.assignedTo && job.status === "pending") || [];

  const handleGetRecommendations = async (jobId: string) => {
    setSelectedJobId(jobId);
    recommendationsMutation.mutate(jobId);
  };

  const handleAssign = (technicianId: string, aiRecommendationId?: string) => {
    if (!selectedJobId) return;
    assignMutation.mutate({ jobCardId: selectedJobId, technicianId, aiRecommendationId });
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return <Badge className="bg-green-500" data-testid={`badge-confidence-${confidence}`}>High {confidence}%</Badge>;
    if (confidence >= 60) return <Badge className="bg-yellow-500" data-testid={`badge-confidence-${confidence}`}>Medium {confidence}%</Badge>;
    return <Badge className="bg-gray-500" data-testid={`badge-confidence-${confidence}`}>Low {confidence}%</Badge>;
  };

  const getWorkloadBadge = (workload: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-500",
      medium: "bg-yellow-500",
      high: "bg-red-500"
    };
    return <Badge className={colors[workload] || "bg-gray-500"} data-testid={`badge-workload-${workload}`}>{workload}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Smart Job Assignment
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered technician recommendations for optimal job assignments
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Jobs</CardTitle>
            <CardDescription>Select a job to get AI recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : unassignedJobs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8" data-testid="text-no-jobs">
                No unassigned jobs available
              </p>
            ) : (
              <div className="space-y-3">
                {unassignedJobs.map((job: any) => (
                  <Card
                    key={job.id}
                    className={`cursor-pointer transition-all hover:border-primary ${selectedJobId === job.id ? "border-primary bg-primary/5" : ""}`}
                    onClick={() => handleGetRecommendations(job.id)}
                    data-testid={`card-job-${job.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold" data-testid={`text-job-number-${job.id}`}>{job.jobNumber}</p>
                          <p className="text-sm text-muted-foreground">{job.serviceType}</p>
                        </div>
                        <Badge data-testid={`badge-priority-${job.priority}`}>{job.priority}</Badge>
                      </div>
                      <p className="text-sm mt-2 line-clamp-2">{job.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>Top technician matches for selected job</CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedJobId ? (
              <p className="text-muted-foreground text-center py-8" data-testid="text-select-job">
                Select a job to see AI recommendations
              </p>
            ) : recommendationsMutation.isPending ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
              </div>
            ) : recommendations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8" data-testid="text-no-recommendations">
                No recommendations available
              </p>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <Card key={rec.technicianId} className="border-2" data-testid={`card-recommendation-${rec.technicianId}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold flex items-center gap-2" data-testid={`text-technician-name-${rec.technicianId}`}>
                              <User className="h-4 w-4" />
                              {rec.technicianName}
                            </p>
                          </div>
                        </div>
                        {getConfidenceBadge(rec.confidence)}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className="h-4 w-4" />
                          {getWorkloadBadge(rec.estimatedWorkload)}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4" />
                          <span className="text-muted-foreground" data-testid={`text-availability-${rec.technicianId}`}>{rec.availability}</span>
                        </div>
                      </div>

                      {rec.matchedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <Award className="h-4 w-4 mt-1" />
                          {rec.matchedSkills.map((skill) => (
                            <Badge key={skill} variant="outline" data-testid={`badge-skill-${skill}`}>{skill}</Badge>
                          ))}
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground" data-testid={`text-rationale-${rec.technicianId}`}>
                        {rec.rationale}
                      </p>

                      <Button
                        onClick={() => handleAssign(rec.technicianId, rec.id)}
                        disabled={assignMutation.isPending}
                        className="w-full"
                        data-testid={`button-assign-${rec.technicianId}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {assignMutation.isPending ? "Assigning..." : "Assign to Job"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
