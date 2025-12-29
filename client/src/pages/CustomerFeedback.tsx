import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from "@tanstack/react-query";
import { AnalyticsPage } from "@/components/layouts";
import { 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Minus, 
  Flag, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Brain,
  Send,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Car
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

const SENTIMENT_COLORS = {
  positive: "#22c55e",
  neutral: "#eab308",
  negative: "#ef4444",
  unanalyzed: "#6b7280",
};

const RATING_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600"
          }`}
        />
      ))}
    </div>
  );
}

function SentimentBadge({ sentiment, score }: { sentiment: string; score?: number }) {
  const config: Record<string, { icon: typeof ThumbsUp; color: string; label: string }> = {
    positive: { icon: ThumbsUp, color: "bg-green-500/10 text-green-600 dark:text-green-400", label: "إيجابي" },
    neutral: { icon: Minus, color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400", label: "محايد" },
    negative: { icon: ThumbsDown, color: "bg-red-500/10 text-red-600 dark:text-red-400", label: "سلبي" },
    unanalyzed: { icon: Brain, color: "bg-gray-500/10 text-gray-600 dark:text-gray-400", label: "غير محلل" },
  };

  const { icon: Icon, color, label } = config[sentiment] || config.unanalyzed;

  return (
    <Badge className={`${color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {label}
      {score !== undefined && (
        <span className="ml-1 text-xs opacity-75">({(score * 100).toFixed(0)}%)</span>
      )}
    </Badge>
  );
}

export default function CustomerFeedback() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedSentiment, setSelectedSentiment] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [responseText, setResponseText] = useState("");
  const [flagReason, setFlagReason] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: feedbackData = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/feedback'],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<any>({
    queryKey: ['/api/feedback/analytics'],
  });

  const analyzeSentimentMutation = useMutation({
    mutationFn: async (feedbackId: string) => {
      return await apiRequest(`/api/feedback/${feedbackId}/analyze-sentiment`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback/analytics'] });
      toast({
        title: t('customers.feedback.sentimentAnalyzed', 'Sentiment Analyzed'),
        description: t('customers.feedback.feedbackAnalyzedSuccess', 'The feedback has been analyzed successfully.'),
      });
    },
    onError: () => {
      toast({
        title: t('customers.feedback.analysisFailed', 'Analysis Failed'),
        description: t('customers.feedback.couldNotAnalyze', 'Could not analyze the feedback. Please try again.'),
        variant: "destructive",
      });
    },
  });

  const analyzeAllMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/feedback/analyze-all', 'POST');
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback/analytics'] });
      toast({
        title: t('customers.feedback.bulkAnalysisComplete', 'Bulk Analysis Complete'),
        description: t('customers.feedback.analyzedEntries', 'Analyzed {{count}} feedback entries.', { count: data.analyzed }),
      });
    },
    onError: () => {
      toast({
        title: t('customers.feedback.bulkAnalysisFailed', 'Bulk Analysis Failed'),
        description: t('customers.feedback.couldNotAnalyzeAll', 'Could not analyze all feedback. Please try again.'),
        variant: "destructive",
      });
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      return await apiRequest(`/api/feedback/${id}/respond`, 'POST', { response });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      setResponseDialogOpen(false);
      setResponseText("");
      toast({
        title: t('customers.feedback.responseSent', 'Response Sent'),
        description: t('customers.feedback.responseSavedSuccess', 'Your response has been saved successfully.'),
      });
    },
    onError: () => {
      toast({
        title: t('customers.feedback.responseFailed', 'Response Failed'),
        description: t('customers.feedback.couldNotSendResponse', 'Could not send response. Please try again.'),
        variant: "destructive",
      });
    },
  });

  const flagMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await apiRequest(`/api/feedback/${id}/flag`, 'POST', { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback/analytics'] });
      setFlagDialogOpen(false);
      setFlagReason("");
      toast({
        title: t('customers.feedback.feedbackFlagged', 'Feedback Flagged'),
        description: t('customers.feedback.flaggedForReview', 'The feedback has been flagged for review.'),
      });
    },
    onError: () => {
      toast({
        title: t('customers.feedback.flagFailed', 'Flag Failed'),
        description: t('customers.feedback.couldNotFlag', 'Could not flag feedback. Please try again.'),
        variant: "destructive",
      });
    },
  });

  const unflagMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/feedback/${id}/unflag`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback/analytics'] });
      toast({
        title: t('customers.feedback.flagRemoved', 'Flag Removed'),
        description: t('customers.feedback.flagRemovedDescription', 'The feedback flag has been removed.'),
      });
    },
  });

  const filteredFeedback = feedbackData.filter((item: any) => {
    const f = item.feedback;
    if (selectedSentiment !== "all" && f.sentiment !== selectedSentiment) return false;
    if (selectedRating !== "all" && f.overallRating !== parseInt(selectedRating)) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const customerName = `${item.customer?.firstName || ''} ${item.customer?.lastName || ''}`.toLowerCase();
      const comments = (f.comments || '').toLowerCase();
      if (!customerName.includes(searchLower) && !comments.includes(searchLower)) return false;
    }
    return true;
  });

  const sentimentChartData = analytics?.sentimentCounts
    ? Object.entries(analytics.sentimentCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: value as number,
        color: SENTIMENT_COLORS[name as keyof typeof SENTIMENT_COLORS] || SENTIMENT_COLORS.unanalyzed,
      }))
    : [];

  const ratingChartData = analytics?.ratingDistribution
    ? Object.entries(analytics.ratingDistribution)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([rating, count]) => ({
          rating: `${rating} Star${parseInt(rating) !== 1 ? 's' : ''}`,
          count: count as number,
          fill: RATING_COLORS[parseInt(rating) - 1],
        }))
    : [];

  const categoryData = analytics?.categoryRatings
    ? [
        { category: "Wait Time", rating: parseFloat(analytics.categoryRatings.waitTime) || 0 },
        { category: "Quality", rating: parseFloat(analytics.categoryRatings.quality) || 0 },
        { category: "Communication", rating: parseFloat(analytics.categoryRatings.communication) || 0 },
      ]
    : [];

  const filters = [
    {
      id: "sentiment",
      label: t('customers.feedback.sentiment', 'Sentiment'),
      type: "select" as const,
      options: [
        { value: "all", label: t('customers.feedback.allSentiments', 'All Sentiments') },
        { value: "positive", label: t('customers.feedback.positive', 'Positive') },
        { value: "neutral", label: t('customers.feedback.neutral', 'Neutral') },
        { value: "negative", label: t('customers.feedback.negative', 'Negative') },
        { value: "unanalyzed", label: t('customers.feedback.unanalyzed', 'Unanalyzed') },
      ],
      value: selectedSentiment,
      onChange: setSelectedSentiment,
    },
    {
      id: "rating",
      label: t('customers.feedback.rating', 'Rating'),
      type: "select" as const,
      options: [
        { value: "all", label: t('customers.feedback.allRatings', 'All Ratings') },
        { value: "5", label: t('customers.feedback.fiveStars', '5 Stars') },
        { value: "4", label: t('customers.feedback.fourStars', '4 Stars') },
        { value: "3", label: t('customers.feedback.threeStars', '3 Stars') },
        { value: "2", label: t('customers.feedback.twoStars', '2 Stars') },
        { value: "1", label: t('customers.feedback.oneStar', '1 Star') },
      ],
      value: selectedRating,
      onChange: setSelectedRating,
    },
  ];

  const actions = [
    {
      label: t('customers.feedback.analyzeAll', 'Analyze All'),
      icon: Brain,
      onClick: () => analyzeAllMutation.mutate(),
      variant: "outline" as const,
      disabled: analyzeAllMutation.isPending,
    },
    {
      label: t('common.refresh', 'Refresh'),
      icon: RefreshCw,
      onClick: () => refetch(),
      variant: "outline" as const,
    },
  ];

  const stats = [
    {
      title: t('customers.feedback.totalFeedback', 'Total Feedback'),
      value: analytics?.totalFeedback?.toString() || "0",
      icon: MessageSquare,
      trend: { value: 12, isPositive: true },
    },
    {
      title: t('customers.feedback.averageRating', 'Average Rating'),
      value: analytics?.avgOverallRating || "0.00",
      icon: Star,
      trend: { value: 0.2, isPositive: true },
    },
    {
      title: t('customers.feedback.positiveSentiment', 'Positive Sentiment'),
      value: `${analytics?.sentimentCounts?.positive || 0}`,
      icon: ThumbsUp,
      trend: { value: 5, isPositive: true },
    },
    {
      title: t('customers.feedback.pendingResponse', 'Pending Response'),
      value: analytics?.pendingResponseCount?.toString() || "0",
      icon: Clock,
      trend: { value: 3, isPositive: false },
    },
  ];

  return (
    <AnalyticsPage
      title={t('customers.feedback.title', 'Customer Feedback')}
      description={t('customers.feedback.description', 'Analyze customer feedback with AI-powered sentiment analysis')}
      stats={stats}
      filters={filters}
      actions={actions}
      isLoading={isLoading || analyticsLoading}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-100 dark:bg-salis-gray-dark/50">
          <TabsTrigger value="overview" data-testid="tab-overview">{t('customers.feedback.overview', 'Overview')}</TabsTrigger>
          <TabsTrigger value="feedback" data-testid="tab-feedback">{t('customers.feedback.allFeedback', 'All Feedback')}</TabsTrigger>
          <TabsTrigger value="sentiment" data-testid="tab-sentiment">{t('customers.feedback.sentimentAnalysis', 'Sentiment Analysis')}</TabsTrigger>
          <TabsTrigger value="flagged" data-testid="tab-flagged">{t('customers.feedback.flagged', 'Flagged')} ({analytics?.flaggedCount || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30 border-gray-200 dark:border-salis-gray-dark">
              <CardHeader>
                <CardTitle className="text-base font-medium">{t('customers.feedback.sentimentDistribution', 'Sentiment Distribution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={sentimentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {sentimentChartData.map((item: any) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30 border-gray-200 dark:border-salis-gray-dark">
              <CardHeader>
                <CardTitle className="text-base font-medium">{t('customers.feedback.ratingDistribution', 'Rating Distribution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ratingChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--foreground))" />
                    <YAxis dataKey="rating" type="category" width={60} stroke="hsl(var(--foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30 border-gray-200 dark:border-salis-gray-dark">
              <CardHeader>
                <CardTitle className="text-base font-medium">{t('customers.feedback.categoryRatings', 'Category Ratings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryData.map((cat: any) => (
                  <div key={cat.category}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{cat.category}</span>
                      <span className="text-sm font-medium">{cat.rating.toFixed(1)}/5</span>
                    </div>
                    <Progress value={(cat.rating / 5) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-50 dark:bg-salis-gray-dark/30 border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-base font-medium">{t('customers.feedback.recentFeedback', 'Recent Feedback')}</CardTitle>
              <CardDescription>{t('customers.feedback.latestSubmissions', 'Latest customer feedback submissions')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {filteredFeedback.slice(0, 10).map((item: any) => (
                    <FeedbackCard 
                      key={item.feedback.id} 
                      item={item}
                      onAnalyze={() => analyzeSentimentMutation.mutate(item.feedback.id)}
                      onRespond={() => {
                        setSelectedFeedback(item);
                        setResponseDialogOpen(true);
                      }}
                      onFlag={() => {
                        setSelectedFeedback(item);
                        setFlagDialogOpen(true);
                      }}
                      onUnflag={() => unflagMutation.mutate(item.feedback.id)}
                      isAnalyzing={analyzeSentimentMutation.isPending}
                    />
                  ))}
                  {filteredFeedback.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No feedback found matching your filters.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('customers.feedback.searchPlaceholder', 'Search by customer name or comment...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white dark:bg-salis-gray-dark"
                data-testid="input-search-feedback"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredFeedback.map((item: any) => (
              <FeedbackCard 
                key={item.feedback.id} 
                item={item}
                onAnalyze={() => analyzeSentimentMutation.mutate(item.feedback.id)}
                onRespond={() => {
                  setSelectedFeedback(item);
                  setResponseDialogOpen(true);
                }}
                onFlag={() => {
                  setSelectedFeedback(item);
                  setFlagDialogOpen(true);
                }}
                onUnflag={() => unflagMutation.mutate(item.feedback.id)}
                isAnalyzing={analyzeSentimentMutation.isPending}
                expanded
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <Card className="bg-gray-50 dark:bg-salis-gray-dark/30 border-gray-200 dark:border-salis-gray-dark">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">{t('customers.feedback.aiSentimentAnalysis', 'AI Sentiment Analysis')}</CardTitle>
                <CardDescription>{t('customers.feedback.poweredByGPT', 'Powered by GPT-4 for accurate sentiment detection')}</CardDescription>
              </div>
              <Button 
                onClick={() => analyzeAllMutation.mutate()}
                disabled={analyzeAllMutation.isPending}
                variant="outline"
                size="sm"
                data-testid="button-analyze-all"
              >
                <Brain className="h-4 w-4 mr-2" />
                {analyzeAllMutation.isPending ? t('customers.feedback.analyzing', 'Analyzing...') : t('customers.feedback.analyzeAllUnprocessed', 'Analyze All Unprocessed')}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3 mb-6">
                {Object.entries(SENTIMENT_COLORS).filter(([k]) => k !== 'unanalyzed').map(([sentiment, color]) => {
                  const count = analytics?.sentimentCounts?.[sentiment] || 0;
                  const total = analytics?.totalFeedback || 1;
                  const percentage = ((count / total) * 100).toFixed(1);
                  
                  return (
                    <Card key={sentiment} className="bg-white dark:bg-salis-gray-dark/50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            {sentiment === 'positive' && <ThumbsUp className="h-6 w-6" style={{ color }} />}
                            {sentiment === 'neutral' && <Minus className="h-6 w-6" style={{ color }} />}
                            {sentiment === 'negative' && <ThumbsDown className="h-6 w-6" style={{ color }} />}
                          </div>
                          <div>
                            <p className="text-2xl font-bold font-montserrat">{count}</p>
                            <p className="text-sm text-gray-500 capitalize">{sentiment} ({percentage}%)</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">{t('customers.feedback.feedbackBySentiment', 'Feedback by Sentiment')}</h4>
                {['positive', 'neutral', 'negative'].map((sentiment) => {
                  const items = feedbackData.filter((f: any) => f.feedback?.sentiment === sentiment);
                  return (
                    <div key={sentiment} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS] }} 
                        />
                        <span className="font-medium capitalize">{sentiment}</span>
                        <Badge variant="secondary">{items.length}</Badge>
                      </div>
                      {items.slice(0, 3).map((item: any) => (
                        <div 
                          key={item.feedback.id} 
                          className="ml-5 p-3 bg-white dark:bg-salis-gray-dark/50 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            "{item.feedback.comments}"
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <StarRating rating={item.feedback.overallRating} />
                            {item.feedback.sentimentKeywords && (
                              <div className="flex gap-1">
                                {(item.feedback.sentimentKeywords as string[]).slice(0, 3).map((kw: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          <Card className="bg-gray-50 dark:bg-salis-gray-dark/30 border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                {t('customers.feedback.flaggedFeedback', 'Flagged Feedback')}
              </CardTitle>
              <CardDescription>{t('customers.feedback.flaggedDescription', 'Feedback marked for review or moderation')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackData.filter((f: any) => f.feedback?.isFlagged).map((item: any) => (
                  <FeedbackCard 
                    key={item.feedback.id} 
                    item={item}
                    onAnalyze={() => analyzeSentimentMutation.mutate(item.feedback.id)}
                    onRespond={() => {
                      setSelectedFeedback(item);
                      setResponseDialogOpen(true);
                    }}
                    onFlag={() => {
                      setSelectedFeedback(item);
                      setFlagDialogOpen(true);
                    }}
                    onUnflag={() => unflagMutation.mutate(item.feedback.id)}
                    isAnalyzing={analyzeSentimentMutation.isPending}
                    expanded
                  />
                ))}
                {feedbackData.filter((f: any) => f.feedback?.isFlagged).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50 text-green-500" />
                    <p>{t('customers.feedback.noFlaggedFeedback', 'No flagged feedback. All clear!')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('customers.feedback.respondToFeedback', 'Respond to Feedback')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedFeedback && (
              <div className="p-3 bg-gray-100 dark:bg-salis-gray-dark/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  "{selectedFeedback.feedback?.comments}"
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={selectedFeedback.feedback?.overallRating} />
                  <span className="text-sm text-gray-500">
                    - {selectedFeedback.customer?.firstName} {selectedFeedback.customer?.lastName}
                  </span>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="response">{t('customers.feedback.yourResponse', 'Your Response')}</Label>
              <Textarea
                id="response"
                placeholder={t('customers.feedback.typePlaceholder', 'Type your response to this feedback...')}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
                data-testid="textarea-response"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button 
              onClick={() => selectedFeedback && respondMutation.mutate({ 
                id: selectedFeedback.feedback.id, 
                response: responseText 
              })}
              disabled={!responseText.trim() || respondMutation.isPending}
              data-testid="button-send-response"
            >
              <Send className="h-4 w-4 mr-2" />
              {respondMutation.isPending ? t('customers.feedback.sending', 'Sending...') : t('customers.feedback.sendResponse', 'Send Response')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t('customers.feedback.flagFeedbackTitle', 'Flag Feedback')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="flag-reason">{t('customers.feedback.reasonForFlagging', 'Reason for Flagging')}</Label>
              <Select value={flagReason} onValueChange={setFlagReason}>
                <SelectTrigger data-testid="select-flag-reason">
                  <SelectValue placeholder={t('customers.feedback.selectReason', 'Select a reason')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inappropriate">{t('customers.feedback.inappropriateContent', 'Inappropriate Content')}</SelectItem>
                  <SelectItem value="spam">{t('customers.feedback.spamOrFake', 'Spam or Fake')}</SelectItem>
                  <SelectItem value="review-needed">{t('customers.feedback.needsManagementReview', 'Needs Management Review')}</SelectItem>
                  <SelectItem value="complaint">{t('customers.feedback.seriousComplaint', 'Serious Complaint')}</SelectItem>
                  <SelectItem value="follow-up">{t('customers.feedback.requiresFollowUp', 'Requires Follow-up')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagDialogOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedFeedback && flagMutation.mutate({ 
                id: selectedFeedback.feedback.id, 
                reason: flagReason 
              })}
              disabled={!flagReason || flagMutation.isPending}
              data-testid="button-confirm-flag"
            >
              <Flag className="h-4 w-4 mr-2" />
              {flagMutation.isPending ? t('customers.feedback.flagging', 'Flagging...') : t('customers.feedback.flagFeedbackButton', 'Flag Feedback')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnalyticsPage>
  );
}

function FeedbackCard({ 
  item, 
  onAnalyze, 
  onRespond, 
  onFlag, 
  onUnflag,
  isAnalyzing,
  expanded = false 
}: { 
  item: any; 
  onAnalyze: () => void;
  onRespond: () => void;
  onFlag: () => void;
  onUnflag: () => void;
  isAnalyzing: boolean;
  expanded?: boolean;
}) {
  const f = item.feedback;
  const customer = item.customer;
  const vehicle = item.vehicle;
  const technician = item.technician;

  return (
    <Card className={`bg-white dark:bg-salis-gray-dark/50 border-gray-200 dark:border-gray-700 ${f.isFlagged ? 'border-l-4 border-l-yellow-500' : ''}`}>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {customer?.firstName || 'Unknown'} {customer?.lastName || 'Customer'}
                </span>
              </div>
              <StarRating rating={f.overallRating} />
              <SentimentBadge sentiment={f.sentiment || 'unanalyzed'} score={f.sentimentScore ? parseFloat(f.sentimentScore) : undefined} />
              {f.isFlagged && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Flag className="h-3 w-3" />
                  {f.flagReason}
                </Badge>
              )}
            </div>

            {vehicle && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Car className="h-4 w-4" />
                <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                {vehicle.licensePlate && <span>({vehicle.licensePlate})</span>}
              </div>
            )}

            <p className={`text-gray-600 dark:text-gray-300 ${expanded ? '' : 'line-clamp-2'}`}>
              "{f.comments || 'No comments provided'}"
            </p>

            {f.sentimentKeywords && (f.sentimentKeywords as string[]).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {(f.sentimentKeywords as string[]).map((kw: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                ))}
              </div>
            )}

            {f.response && (
              <div className="mt-3 p-3 bg-gray-100 dark:bg-salis-gray-dark/50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Response:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{f.response}</p>
                {f.respondedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Responded {format(new Date(f.respondedAt), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
              <span>{format(new Date(f.submittedAt), 'MMM d, yyyy h:mm a')}</span>
              {technician && (
                <span>Technician: {technician.firstName} {technician.lastName}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {!f.sentiment && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="h-7 px-2"
                data-testid={`button-analyze-${f.id}`}
              >
                <Brain className="h-3.5 w-3.5 mr-1" />
                Analyze
              </Button>
            )}
            {!f.response && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onRespond}
                className="h-7 px-2"
                data-testid={`button-respond-${f.id}`}
              >
                <Send className="h-3.5 w-3.5 mr-1" />
                Respond
              </Button>
            )}
            {f.isFlagged ? (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onUnflag}
                className="h-7 px-2"
                data-testid={`button-unflag-${f.id}`}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Unflag
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onFlag}
                className="h-7 px-2 text-yellow-600 hover:text-yellow-700"
                data-testid={`button-flag-${f.id}`}
              >
                <Flag className="h-3.5 w-3.5 mr-1" />
                Flag
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
