import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, ThumbsUp, TrendingUp, MessageCircle, Plus, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CustomerReviewsRatings() {
  const [isRespondDialogOpen, setIsRespondDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [responseText, setResponseText] = useState("");
  const { toast } = useToast();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["/api/reviews"],
  });

  const reviewsArray = (reviews as any[]) || [];

  const respondMutation = useMutation({
    mutationFn: async ({ id, response }: any) => {
      return await apiRequest(`/api/reviews/${id}/respond`, "POST", { response });
    },
    onSuccess: () => {
      toast({ title: "Response posted", description: "Your response has been published." });
      setIsRespondDialogOpen(false);
      setResponseText("");
      setSelectedReview(null);
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
    },
  });

  const stats = {
    averageRating: reviewsArray.length > 0
      ? (reviewsArray.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsArray.length).toFixed(1)
      : "0.0",
    totalReviews: reviewsArray.length || 0,
    recommendationRate: reviewsArray.length > 0
      ? Math.round((reviewsArray.filter((r: any) => r.wouldRecommend === true).length / reviewsArray.length) * 100)
      : 0,
    responseRate: reviewsArray.length > 0
      ? Math.round((reviewsArray.filter((r: any) => r.responseText || r.respondedAt).length / reviewsArray.length) * 100)
      : 0,
  };

  const renderStars = (rating: number | null | undefined) => {
    const r = rating || 0;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={`star-${i}`}
            className={`h-5 w-5 ${i < r ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-96"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-128"></div>
        </div>
      </div>
    );
  }

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
                    {renderStars(Math.round(parseFloat(stats.averageRating)))}
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

      {/* Empty State */}
      {reviewsArray.length === 0 && !isLoading && (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-12">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Customer Reviews
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No customer reviews found. Customer feedback will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviewsArray.length > 0 && (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviewsArray.map((review: any, index: number) => (
                <div
                  key={`review-${review.id || index}`}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
                  data-testid={`review-${review.id || index}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {review.customerName || "Customer"}
                        </h3>
                        {review.platform && <Badge>{review.platform}</Badge>}
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Date N/A"}
                    </span>
                  </div>

                  {review.title && (
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{review.title}</h4>
                  )}
                  {review.comment && (
                    <p className="text-gray-900 dark:text-white mb-3">{review.comment}</p>
                  )}

                  {(review.serviceQualityRating || review.pricingRating || review.speedRating || review.communicationRating) && (
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {review.serviceQualityRating && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Service Quality:</span>
                          {renderStars(review.serviceQualityRating)}
                        </div>
                      )}
                      {review.pricingRating && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Pricing:</span>
                          {renderStars(review.pricingRating)}
                        </div>
                      )}
                      {review.speedRating && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Speed:</span>
                          {renderStars(review.speedRating)}
                        </div>
                      )}
                      {review.communicationRating && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Communication:</span>
                          {renderStars(review.communicationRating)}
                        </div>
                      )}
                    </div>
                  )}

                  {review.wouldRecommend && (
                    <div className="flex items-center gap-2 mb-3">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">Would recommend</span>
                    </div>
                  )}

                  {review.responseText && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        Response from SALIS AUTO:
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{review.responseText}</p>
                      {review.respondedAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Responded: {new Date(review.respondedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {!review.responseText && !review.respondedAt && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReview(review);
                        setIsRespondDialogOpen(true);
                      }}
                      data-testid={`button-respond-${review.id || index}`}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Respond to Review
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Respond Dialog */}
      <Dialog open={isRespondDialogOpen} onOpenChange={setIsRespondDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedReview && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {selectedReview.customerName || "Customer"} - {selectedReview.rating || 0} stars
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedReview.comment || "No comment"}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Your Response</label>
              <Textarea
                className="mt-1"
                rows={4}
                placeholder="Thank you for your feedback..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                data-testid="textarea-response"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (selectedReview && responseText.trim()) {
                  respondMutation.mutate({
                    id: selectedReview.id,
                    response: responseText.trim(),
                  });
                }
              }}
              disabled={!responseText.trim() || respondMutation.isPending}
              data-testid="button-submit-response"
            >
              {respondMutation.isPending ? "Posting..." : "Post Response"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
