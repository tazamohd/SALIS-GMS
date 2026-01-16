import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, ThumbsUp, TrendingUp, MessageCircle, Plus, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";

export default function CustomerReviewsRatings() {
  const { t } = useTranslation();
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
      toast({ title: t('customers.reviews.responsePosted', 'Response posted'), description: t('customers.reviews.responsePublished', 'Your response has been published.') });
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
      <StandardPageLayout
        title={t('customers.reviews.title', 'Customer Reviews & Ratings')}
        description={t('customers.reviews.description', 'Manage and respond to customer feedback')}
        icon={Star}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-96"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-128"></div>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title={t('customers.reviews.title', 'Customer Reviews & Ratings')}
      description={t('customers.reviews.description', 'Manage and respond to customer feedback')}
      icon={Star}
    >

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-avg-rating">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('customers.reviews.averageRating', 'Average Rating')}</p>
                <div className="flex items-center gap-2 mt-2">
                  <h3 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{stats.averageRating}</h3>
                  <div className="flex">
                    {renderStars(Math.round(parseFloat(stats.averageRating)))}
                  </div>
                </div>
              </div>
              <Star className="h-12 w-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-reviews">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('customers.reviews.totalReviews', 'Total Reviews')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">{stats.totalReviews}</h3>
              </div>
              <MessageCircle className="h-12 w-12 text-[#0A5ED7]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-recommendation-rate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('customers.reviews.wouldRecommend', 'Would Recommend')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">{stats.recommendationRate}%</h3>
              </div>
              <ThumbsUp className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-response-rate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('customers.reviews.responseRate', 'Response Rate')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">{stats.responseRate}%</h3>
              </div>
              <TrendingUp className="h-12 w-12 text-[#0BB3FF]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {reviewsArray.length === 0 && !isLoading && (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-12">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-[#64748B]" />
              <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white mb-2">
                {t('customers.reviews.noReviews', 'No Customer Reviews')}
              </h3>
              <p className="text-[#64748B] mb-4">
                {t('customers.reviews.noReviewsDescription', 'No customer reviews found. Customer feedback will appear here.')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviewsArray.length > 0 && (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('customers.reviews.recentReviews', 'Recent Reviews')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviewsArray.map((review: any, index: number) => (
                <div
                  key={`review-${review.id || index}`}
                  className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 bg-[#F8FAFC] dark:bg-[#0E1117]"
                  data-testid={`review-${review.id || index}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                          {review.customerName || t('customers.reviews.customer', 'Customer')}
                        </h3>
                        {review.platform && <Badge>{review.platform}</Badge>}
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-[#64748B]">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : t('customers.reviews.dateNA', 'Date N/A')}
                    </span>
                  </div>

                  {review.title && (
                    <h4 className="font-semibold text-[#0B1F3B] dark:text-white mb-2">{review.title}</h4>
                  )}
                  {review.comment && (
                    <p className="text-[#0B1F3B] dark:text-white mb-3">{review.comment}</p>
                  )}

                  {(review.serviceQualityRating || review.pricingRating || review.speedRating || review.communicationRating) && (
                    <div className="flex flex-wrap gap-3 text-sm text-[#64748B] mb-3">
                      {review.serviceQualityRating && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t('customers.reviews.serviceQuality', 'Service Quality')}:</span>
                          {renderStars(review.serviceQualityRating)}
                        </div>
                      )}
                      {review.pricingRating && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t('customers.reviews.pricing', 'Pricing')}:</span>
                          {renderStars(review.pricingRating)}
                        </div>
                      )}
                      {review.speedRating && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t('customers.reviews.speed', 'Speed')}:</span>
                          {renderStars(review.speedRating)}
                        </div>
                      )}
                      {review.communicationRating && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t('customers.reviews.communication', 'Communication')}:</span>
                          {renderStars(review.communicationRating)}
                        </div>
                      )}
                    </div>
                  )}

                  {review.wouldRecommend && (
                    <div className="flex items-center gap-2 mb-3">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">{t('customers.reviews.wouldRecommendLabel', 'Would recommend')}</span>
                    </div>
                  )}

                  {review.responseText && (
                    <div className="bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 dark:from-[#0A5ED7]/20 dark:to-[#0BB3FF]/20 rounded-lg p-3 mb-3">
                      <p className="text-sm font-semibold text-[#0B1F3B] dark:text-white mb-1">
                        {t('customers.reviews.responseFrom', 'Response from SALIS AUTO')}:
                      </p>
                      <p className="text-sm text-[#0B1F3B] dark:text-gray-300">{review.responseText}</p>
                      {review.respondedAt && (
                        <p className="text-xs text-[#64748B] mt-1">
                          {t('customers.reviews.responded', 'Responded')}: {new Date(review.respondedAt).toLocaleString()}
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
                      {t('customers.reviews.respondToReview', 'Respond to Review')}
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
        <DialogContent className="sm:max-w-lg bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('customers.reviews.respondToReview', 'Respond to Review')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedReview && (
              <div className="bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg p-3 mb-3 border border-[#E2E8F0] dark:border-[#232A36]">
                <p className="text-sm font-medium text-[#0B1F3B] dark:text-white mb-1">
                  {selectedReview.customerName || t('customers.reviews.customer', 'Customer')} - {selectedReview.rating || 0} {t('customers.reviews.stars', 'stars')}
                </p>
                <p className="text-sm text-[#64748B]">
                  {selectedReview.comment || t('customers.reviews.noComment', 'No comment')}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('customers.reviews.yourResponse', 'Your Response')}</label>
              <Textarea
                className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                rows={4}
                placeholder={t('customers.reviews.responsePlaceholder', 'Thank you for your feedback...')}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                data-testid="textarea-response"
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
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
              {respondMutation.isPending ? t('common.posting', 'Posting...') : t('customers.reviews.postResponse', 'Post Response')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
}
