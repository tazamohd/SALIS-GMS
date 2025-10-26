import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, ThumbsUp, TrendingUp, MessageCircle, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CustomerReviewsRatings() {
  const [isRespondDialogOpen, setIsRespondDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const { toast } = useToast();

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/customer-reviews"],
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, responseText }: any) => {
      return await apiRequest(`/api/customer-reviews/${id}/respond`, "POST", { responseText });
    },
    onSuccess: () => {
      toast({ title: "Response posted", description: "Your response has been published." });
      setIsRespondDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/customer-reviews"] });
    },
  });

  // Mock data
  const mockReviews = [
    {
      id: "1",
      customerName: "John Smith",
      rating: 5,
      serviceQualityRating: 5,
      pricingRating: 4,
      speedRating: 5,
      communicationRating: 5,
      title: "Outstanding Service!",
      comment: "The team at SALIS AUTO exceeded my expectations. Professional, fast, and transparent pricing. My car runs like new!",
      wouldRecommend: true,
      platform: "google",
      jobCardNumber: "JC-2024-1820",
      createdAt: "2024-10-25T14:30:00Z",
      hasResponse: true,
      responseText: "Thank you for your kind words, John! We're thrilled to hear you had such a positive experience. We look forward to serving you again!",
    },
    {
      id: "2",
      customerName: "Sarah Johnson",
      rating: 4,
      serviceQualityRating: 5,
      pricingRating: 3,
      speedRating: 4,
      communicationRating: 4,
      title: "Great work, a bit pricey",
      comment: "Quality of work was excellent. Technicians were knowledgeable. However, the pricing was higher than expected. Overall satisfied.",
      wouldRecommend: true,
      platform: "yelp",
      jobCardNumber: "JC-2024-1835",
      createdAt: "2024-10-24T11:15:00Z",
      hasResponse: false,
    },
    {
      id: "3",
      customerName: "Mike Wilson",
      rating: 5,
      serviceQualityRating: 5,
      pricingRating: 5,
      speedRating: 5,
      communicationRating: 5,
      title: "Best garage in town",
      comment: "Honest, reliable, and fair pricing. They always explain everything clearly and never try to upsell unnecessary services. Highly recommend!",
      wouldRecommend: true,
      platform: "facebook",
      jobCardNumber: "JC-2024-1848",
      createdAt: "2024-10-23T09:45:00Z",
      hasResponse: true,
      responseText: "We're honored to be your trusted garage, Mike! Thank you for the wonderful review.",
    },
  ];

  const stats = {
    averageRating: 4.7,
    totalReviews: 156,
    recommendationRate: 94,
    responseRate: 88,
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            ⭐ Customer Reviews & Ratings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and respond to customer feedback
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-avg-rating">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
                <div className="flex items-center gap-2 mt-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageRating}</h3>
                  <div className="flex">
                    {renderStars(Math.round(stats.averageRating))}
                  </div>
                </div>
              </div>
              <Star className="h-12 w-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-total-reviews">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalReviews}</h3>
              </div>
              <MessageCircle className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-recommendation-rate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Would Recommend</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.recommendationRate}%</h3>
              </div>
              <ThumbsUp className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-response-rate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Response Rate</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.responseRate}%</h3>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReviews.map((review) => (
              <div
                key={review.id}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
                data-testid={`review-${review.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{review.customerName}</h3>
                      <Badge>{review.platform}</Badge>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{review.title}</h4>
                <p className="text-gray-900 dark:text-white mb-3">{review.comment}</p>

                <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Service Quality:</span>
                    {renderStars(review.serviceQualityRating)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Pricing:</span>
                    {renderStars(review.pricingRating)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Speed:</span>
                    {renderStars(review.speedRating)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Communication:</span>
                    {renderStars(review.communicationRating)}
                  </div>
                </div>

                {review.wouldRecommend && (
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Would recommend</span>
                  </div>
                )}

                {review.hasResponse ? (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mt-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Your Response:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{review.responseText}</p>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedReview(review);
                      setIsRespondDialogOpen(true);
                    }}
                    data-testid={`button-respond-${review.id}`}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Respond
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Respond Dialog */}
      <Dialog open={isRespondDialogOpen} onOpenChange={setIsRespondDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Your Response</label>
              <Textarea
                placeholder="Write your response..."
                className="mt-1 h-32"
                data-testid="textarea-response"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (selectedReview) {
                  respondMutation.mutate({ id: selectedReview.id, responseText: "Thank you for your feedback!" });
                }
              }}
              data-testid="button-submit-response"
            >
              Submit Response
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
