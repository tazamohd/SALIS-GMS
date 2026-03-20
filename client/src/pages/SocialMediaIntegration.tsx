// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TabsPageLayout, TabConfig } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThumbsUp, MessageCircle, Share2, Users, Star, Plus, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SocialMediaIntegration() {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("facebook");
  const { toast } = useToast();

  const { data: posts = [] } = useQuery({
    queryKey: ["/api/social/posts"],
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/social/reviews"],
  });

  const createPost = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/social/posts", "POST", data);
    },
    onSuccess: () => {
      toast({ title: t('social.postCreated', 'Post created'), description: t('social.postScheduled', 'Your post has been scheduled.') });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/social/posts"] });
    },
  });

  const mockPosts = [
    {
      id: "1",
      platform: "facebook",
      content: "🎉 Winter Special! Get 20% off all services this week. Book your appointment now!",
      status: "published",
      publishedAt: "2024-10-25T09:00:00Z",
      likes: 143,
      shares: 28,
      comments: 15,
      reach: 2840,
    },
    {
      id: "2",
      platform: "google",
      content: "Thank you for choosing SALIS AUTO! We appreciate your 5-star review.",
      postType: "review_response",
      status: "published",
      publishedAt: "2024-10-24T14:30:00Z",
    },
    {
      id: "3",
      platform: "instagram",
      content: "Behind the scenes at SALIS AUTO 🔧 #AutoRepair #CarCare",
      status: "scheduled",
      scheduledAt: "2024-10-27T10:00:00Z",
    },
  ];

  const mockReviews = [
    {
      id: "1",
      platform: "google",
      customerName: "John Smith",
      rating: 5,
      comment: "Excellent service! The team was professional and my car runs like new.",
      createdAt: "2024-10-25T16:20:00Z",
      responded: true,
    },
    {
      id: "2",
      platform: "yelp",
      customerName: "Sarah Johnson",
      rating: 4,
      comment: "Good work overall. Wait time was a bit long but quality was great.",
      createdAt: "2024-10-24T11:15:00Z",
      responded: false,
    },
    {
      id: "3",
      platform: "facebook",
      customerName: "Mike Davis",
      rating: 5,
      comment: "Best auto shop in town! Fair prices and honest mechanics.",
      createdAt: "2024-10-23T09:45:00Z",
      responded: true,
    },
  ];

  const stats = {
    totalPosts: 48,
    totalReviews: 156,
    averageRating: 4.7,
    responseRate: 94,
    totalFollowers: 3421,
  };

  const getPlatformIcon = (platform: string) => {
    return <div className="h-8 w-8 rounded-full bg-[#F8FAFC] dark:bg-[#0E1117] flex items-center justify-center text-xs font-bold text-[#0B1F3B] dark:text-white border border-[#E2E8F0] dark:border-[#232A36]">
      {platform.substring(0, 1).toUpperCase()}
    </div>;
  };

  const statsContent = (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-posts">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('social.totalPosts', 'Total Posts')}</p>
              <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">{stats.totalPosts}</h3>
            </div>
            <MessageCircle className="h-12 w-12 text-[#0A5ED7]" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-reviews">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('social.totalReviews', 'Total Reviews')}</p>
              <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">{stats.totalReviews}</h3>
            </div>
            <Star className="h-12 w-12 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-avg-rating">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('social.avgRating', 'Avg Rating')}</p>
              <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">{stats.averageRating} ⭐</h3>
            </div>
            <ThumbsUp className="h-12 w-12 text-green-600" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-response-rate">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('social.responseRate', 'Response Rate')}</p>
              <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">{stats.responseRate}%</h3>
            </div>
            <MessageCircle className="h-12 w-12 text-[#0BB3FF]" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-followers">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('social.followers', 'Followers')}</p>
              <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">{stats.totalFollowers}</h3>
            </div>
            <Users className="h-12 w-12 text-[#0A5ED7]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const postsContent = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader><CardTitle className="text-[#0B1F3B] dark:text-white">{t('social.socialMediaPosts', 'Social Media Posts')}</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockPosts.map((post) => (
            <div
              key={post.id}
              className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] transition-colors"
              data-testid={`post-${post.id}`}
            >
              <div className="flex items-start gap-3 mb-3">
                {getPlatformIcon(post.platform)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold capitalize text-[#0B1F3B] dark:text-white">{post.platform}</span>
                    <Badge className={post.status === "published" ? "bg-green-600 text-white" : "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"}>{post.status}</Badge>
                  </div>
                  <p className="text-[#0B1F3B] dark:text-white">{post.content}</p>
                  {post.status === "published" && post.likes !== undefined && (
                    <div className="flex gap-4 mt-3 text-sm text-[#64748B]">
                      <span className="flex items-center gap-1"><ThumbsUp className="h-4 w-4" /> {post.likes}</span>
                      <span className="flex items-center gap-1"><Share2 className="h-4 w-4" /> {post.shares}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {post.comments}</span>
                      <span>{t('social.reach', 'Reach')}: {post.reach}</span>
                    </div>
                  )}
                  {post.status === "scheduled" && (
                    <p className="text-sm text-[#0A5ED7] mt-2 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {t('social.scheduledFor', 'Scheduled for')}: {new Date(post.scheduledAt!).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const reviewsContent = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader><CardTitle className="text-[#0B1F3B] dark:text-white">{t('social.customerReviews', 'Customer Reviews')}</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockReviews.map((review) => (
            <div
              key={review.id}
              className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] transition-colors"
              data-testid={`review-${review.id}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getPlatformIcon(review.platform)}
                  <div>
                    <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{review.customerName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-[#E2E8F0] dark:text-[#232A36]"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-[#64748B]">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {review.responded ? (
                  <Badge className="bg-green-600 text-white">{t('social.responded', 'Responded')}</Badge>
                ) : (
                  <Button size="sm" variant="outline" data-testid={`button-respond-${review.id}`} className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]">
                    {t('social.respond', 'Respond')}
                  </Button>
                )}
              </div>
              <p className="text-[#0B1F3B] dark:text-white mt-2">{review.comment}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const tabs: TabConfig[] = [
    {
      id: "posts",
      label: t('social.posts', 'Posts'),
      icon: MessageCircle,
      content: postsContent,
      badge: mockPosts.length,
    },
    {
      id: "reviews",
      label: t('social.reviews', 'Reviews'),
      icon: Star,
      content: reviewsContent,
      badge: mockReviews.filter(r => !r.responded).length,
    },
  ];

  return (
    <TabsPageLayout
      title={t('nav.social_media_integration', 'Social Media & Reviews')}
      description={t('social.pageDescription', 'Manage social posts and respond to customer reviews')}
      icon={Share2}
      primaryAction={{
        label: t('social.createPost', 'Create Post'),
        icon: Plus,
        onClick: () => setIsCreateDialogOpen(true),
        testId: "button-create-post",
      }}
      headerContent={statsContent}
      tabs={tabs}
      defaultTab="posts"
    >
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-xl bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('social.createSocialMediaPost', 'Create Social Media Post')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('social.platform', 'Platform')}</label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="google">{t('social.googleBusiness', 'Google Business')}</SelectItem>
                  <SelectItem value="yelp">Yelp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('social.content', 'Content')}</label>
              <Textarea
                placeholder={t('social.writeYourPost', 'Write your post...')}
                className="mt-1 h-32 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="textarea-content"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('social.scheduleOptional', 'Schedule (Optional)')}</label>
              <div className="flex gap-2">
                <Input type="datetime-local" className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-schedule" />
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#09a3e8] text-white" onClick={() => {
              createPost.mutate({
                platform: selectedPlatform,
                content: "Test post",
                status: "draft"
              });
            }} data-testid="button-save-post">
              {t('social.createPost', 'Create Post')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TabsPageLayout>
  );
}
