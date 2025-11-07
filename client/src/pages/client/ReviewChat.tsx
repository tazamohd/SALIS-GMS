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
    queryKey: ["/api/service-chat", selectedJob],
    enabled: !!selectedJob,
    refetchInterval: 5000, // Refresh every 5 seconds
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
      return fetch("/api/service-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobCardId: data.jobCardId,
          senderId: user?.id,
          senderType: "customer",
          message: data.message,
        }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-chat"] });
      setMessage("");
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: { jobCardId: string; rating: number; comment: string }) => {
      return fetch("/api/service-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobCardId: data.jobCardId,
          customerId: user?.id,
          rating: data.rating,
          comment: data.comment,
        }),
      }).then(res => res.json());
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          Review & Chat
        </h1>
        <p className="text-muted-foreground mt-1">
          Communicate with your garage and leave reviews
        </p>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" data-testid="tab-chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            Live Chat
          </TabsTrigger>
          <TabsTrigger value="reviews" data-testid="tab-reviews">
            <Star className="h-4 w-4 mr-2" />
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Active Jobs List */}
            <Card data-testid="card-active-jobs">
              <CardHeader>
                <CardTitle>Active Services</CardTitle>
                <CardDescription>Select a service to chat</CardDescription>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </div>
                ) : activeJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
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
                          selectedJob === job.id ? "bg-primary/10 border-primary" : "hover:bg-accent"
                        }`}
                        data-testid={`job-chat-${job.id}`}
                      >
                        <p className="font-medium text-sm">Job #{job.jobNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {getVehicleInfo(job.vehicleId)}
                        </p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Active
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Window */}
            <Card className="lg:col-span-2" data-testid="card-chat-window">
              <CardHeader>
                <CardTitle>
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
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
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
                          <div className="text-center py-12 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No messages yet. Start the conversation!</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    <Separator />

                    <div className="flex gap-2">
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="min-h-[60px]"
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
                        data-testid="button-send-message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-muted-foreground">
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
          <Card data-testid="card-reviews">
            <CardHeader>
              <CardTitle>Leave a Review</CardTitle>
              <CardDescription>Share your experience with completed services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {completedJobs.map((job: any) => (
                <div key={job.id} className="p-4 rounded-lg border" data-testid={`review-job-${job.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-medium">Job #{job.jobNumber}</p>
                      <p className="text-sm text-muted-foreground">{getVehicleInfo(job.vehicleId)}</p>
                      <p className="text-xs text-muted-foreground">
                        Completed: {new Date(job.completedAt || job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="default">Completed</Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Rating</label>
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
                                star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Review (Optional)</label>
                      <Textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience..."
                        data-testid="input-review-comment"
                      />
                    </div>

                    <Button
                      onClick={() => handleSubmitReview(job.id)}
                      disabled={rating === 0 || submitReviewMutation.isPending}
                      data-testid="button-submit-review"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </div>
              ))}

              {completedJobs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
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
