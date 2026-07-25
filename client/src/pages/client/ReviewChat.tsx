import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send, Star, ThumbsUp, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ReviewChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const { data: vehicles } = useQuery({
    queryKey: ["/api/vehicles", user?.id],
    enabled: !!user?.id,
  });

  const { data: jobCards, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/job-cards"],
    enabled: !!user?.id,
  });

  const { data: chatMessages } = useQuery({
    queryKey: ["/api/job-cards", selectedJob, "chat"],
    enabled: !!selectedJob,
    refetchInterval: 5000,
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

  const completedJobs = Array.isArray(jobCards)
    ? jobCards.filter((jc: any) => {
        const vehicle = myVehicles.find((v: any) => v.id === jc.vehicleId);
        return vehicle && jc.status === "completed";
      }).slice(0, 5)
    : [];

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { jobCardId: string; message: string }) => {
      const { apiRequest } = await import("@/lib/queryClient");
      return apiRequest("POST", `/api/job-cards/${data.jobCardId}/chat`, {
        senderId: user?.id,
        senderType: "customer",
        message: data.message,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards", variables.jobCardId, "chat"] });
      setMessage("");
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: { jobCardId: string; rating: number; comment: string }) => {
      const { apiRequest } = await import("@/lib/queryClient");
      return apiRequest("POST", `/api/customers/${user?.id}/reviews`, {
        jobCardId: data.jobCardId,
        rating: data.rating,
        comment: data.comment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
      setRating(0);
      setReviewComment("");
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
    },
  });

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = myVehicles.find((v: any) => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} - ${vehicle.licensePlate}` : "Unknown Vehicle";
  };

  const handleSendMessage = () => {
    if (!selectedJob || !message.trim()) return;
    sendMessageMutation.mutate({ jobCardId: selectedJob, message: message.trim() });
  };

  const handleSubmitReview = (jobId: string) => {
    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Rating Required",
        description: "Please select a star rating",
      });
      return;
    }
    submitReviewMutation.mutate({ jobCardId: jobId, rating, comment: reviewComment });
  };

  return (
    <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-page-title">
          Review & Chat
        </h1>
        <p className="text-[#64748B] mt-1">
          Communicate with your garage and leave reviews
        </p>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#E2E8F0] dark:bg-[#232A36]">
          <TabsTrigger value="chat" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#151A23] data-[state=active]:text-[#0B1F3B] dark:data-[state=active]:text-white" data-testid="tab-chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            Live Chat
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#151A23] data-[state=active]:text-[#0B1F3B] dark:data-[state=active]:text-white" data-testid="tab-reviews">
            <Star className="h-4 w-4 mr-2" />
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-active-jobs">
              <CardHeader>
                <CardTitle className="text-[#0B1F3B] dark:text-white">Active Services</CardTitle>
                <CardDescription className="text-[#64748B]">Select a service to chat</CardDescription>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 bg-[#E2E8F0] dark:bg-[#232A36]" />
                    <Skeleton className="h-20 bg-[#E2E8F0] dark:bg-[#232A36]" />
                  </div>
                ) : activeJobs.length === 0 ? (
                  <div className="text-center py-8 text-[#64748B] text-sm">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No active services</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeJobs.map((job: any) => (
                      <button
                        key={job.id}
                        onClick={() => setSelectedJob(job.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedJob === job.id 
                            ? "bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 border-[#0A5ED7]" 
                            : "border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
                        }`}
                        data-testid={`job-chat-${job.id}`}
                      >
                        <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">Job #{job.jobNumber}</p>
                        <p className="text-xs text-[#64748B] truncate">
                          {getVehicleInfo(job.vehicleId)}
                        </p>
                        <Badge className="mt-1 text-xs bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">
                          Active
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-chat-window">
              <CardHeader>
                <CardTitle className="text-[#0B1F3B] dark:text-white">
                  {selectedJob
                    ? `Chat - Job #${activeJobs.find((j: any) => j.id === selectedJob)?.jobNumber}`
                    : "Select a service to start chatting"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedJob ? (
                  <div className="space-y-4">
                    <ScrollArea className="h-96 pr-4">
                      <div className="space-y-4">
                        {Array.isArray(chatMessages) && chatMessages.length > 0 ? (
                          chatMessages.map((msg: any) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.senderType === "customer" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-xs rounded-lg p-3 ${
                                  msg.senderType === "customer"
                                    ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                                    : "bg-[#E2E8F0] dark:bg-[#232A36] text-[#0B1F3B] dark:text-white"
                                }`}
                              >
                                <p className="text-sm">{msg.message}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-[#64748B]">
                            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No messages yet. Start the conversation!</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    <Separator className="bg-[#E2E8F0] dark:bg-[#232A36]" />

                    <div className="flex gap-2">
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="min-h-[60px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white placeholder:text-[#64748B]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        data-testid="input-message"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || sendMessageMutation.isPending}
                        className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
                        data-testid="button-send-message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-[#64748B]">
                    <div className="text-center">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Select an active service to start chatting</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-reviews">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">Leave a Review</CardTitle>
              <CardDescription className="text-[#64748B]">Share your experience with completed services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {completedJobs.map((job: any) => (
                <div key={job.id} className="p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid={`review-job-${job.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">Job #{job.jobNumber}</p>
                      <p className="text-sm text-[#64748B]">{getVehicleInfo(job.vehicleId)}</p>
                      <p className="text-xs text-[#64748B]">
                        Completed: {new Date(job.completedAt || job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-green-500 text-white">Completed</Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-[#0B1F3B] dark:text-white">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110"
                            data-testid={`star-${star}`}
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= rating ? "fill-[#F97316] text-[#F97316]" : "text-[#E2E8F0] dark:text-[#232A36]"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-[#0B1F3B] dark:text-white">Your Review (Optional)</label>
                      <Textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience..."
                        className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white placeholder:text-[#64748B]"
                        data-testid="input-review-comment"
                      />
                    </div>

                    <Button
                      onClick={() => handleSubmitReview(job.id)}
                      disabled={rating === 0 || submitReviewMutation.isPending}
                      className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
                      data-testid="button-submit-review"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </div>
              ))}

              {completedJobs.length === 0 && (
                <div className="text-center py-12 text-[#64748B]">
                  <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No completed services to review</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
