import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Facebook, Twitter, Instagram, Linkedin, MessageSquare, ThumbsUp, Share2, TrendingUp } from "lucide-react";

export default function SocialMediaMonitoring() {
  const { t } = useTranslation();
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("7days");

  const platforms = [
    { id: "facebook", name: "Facebook", icon: Facebook, color: "text-[#0A5ED7]" },
    { id: "twitter", name: "Twitter", icon: Twitter, color: "text-[#0BB3FF]" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-[#0A5ED7]" },
  ];

  const metrics = [
    { label: t('social.totalMentions', 'Total Mentions'), value: "1,247", change: "+12%", icon: MessageSquare },
    { label: t('social.engagementRate', 'Engagement Rate'), value: "8.5%", change: "+2.3%", icon: TrendingUp },
    { label: t('social.totalLikes', 'Total Likes'), value: "3,892", change: "+18%", icon: ThumbsUp },
    { label: t('social.totalShares', 'Total Shares'), value: "456", change: "+25%", icon: Share2 },
  ];

  const recentPosts = [
    {
      id: 1,
      platform: "facebook",
      content: "Great service at SalisAuto! My car runs like new after their maintenance check.",
      author: "Sarah Johnson",
      timestamp: t('social.hoursAgo', '{{count}} hours ago', { count: 2 }),
      likes: 45,
      shares: 12,
      sentiment: "positive"
    },
    {
      id: 2,
      platform: "twitter",
      content: "Thanks @SalisAuto for the quick turnaround on my brake repair!",
      author: "Mike Chen",
      timestamp: t('social.hoursAgo', '{{count}} hours ago', { count: 5 }),
      likes: 28,
      shares: 5,
      sentiment: "positive"
    },
    {
      id: 3,
      platform: "instagram",
      content: "Check out SalisAuto's new facility! Modern and professional.",
      author: "Emily Davis",
      timestamp: t('social.dayAgo', '1 day ago'),
      likes: 156,
      shares: 23,
      sentiment: "positive"
    },
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "negative":
        return "bg-[#F97316]/20 text-[#F97316]";
      default:
        return "bg-[#F8FAFC] dark:bg-[#0E1117] text-[#64748B]";
    }
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return null;
    const Icon = platform.icon;
    return <Icon className={`w-5 h-5 ${platform.color}`} />;
  };

  return (
    <StandardPageLayout
      title={t('nav.social_media_monitoring', 'Social Media Monitoring')}
      description={t('social.monitoringDescription', 'Track and analyze social media mentions and engagement')}
      icon={MessageSquare}
    >
      <Card className="mb-6 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('common.filter', 'Filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('social.platform', 'Platform')}</label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger data-testid="select-platform" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectItem value="all">{t('social.allPlatforms', 'All Platforms')}</SelectItem>
                  {platforms.map(platform => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('social.timePeriod', 'Time Period')}</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger data-testid="select-period" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectItem value="24hours">{t('social.last24Hours', 'Last 24 Hours')}</SelectItem>
                  <SelectItem value="7days">{t('social.last7Days', 'Last 7 Days')}</SelectItem>
                  <SelectItem value="30days">{t('social.last30Days', 'Last 30 Days')}</SelectItem>
                  <SelectItem value="90days">{t('social.last90Days', 'Last 90 Days')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="w-5 h-5 text-[#0A5ED7]" />
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                  {metric.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{metric.value}</p>
              <p className="text-sm text-[#64748B]">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {platforms.map(platform => (
          <Card key={platform.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <platform.icon className={`w-8 h-8 ${platform.color}`} />
                <div>
                  <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{platform.name}</h3>
                  <p className="text-sm text-[#64748B]">{t('common.active', 'Active')}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">{t('social.followers', 'Followers')}</span>
                  <span className="font-medium text-[#0B1F3B] dark:text-white">2,450</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">{t('social.engagement', 'Engagement')}</span>
                  <span className="font-medium text-[#0B1F3B] dark:text-white">7.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('social.recentMentions', 'Recent Mentions')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('social.recentMentionsDesc', 'Latest social media posts mentioning your business')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts.map(post => (
              <div
                key={post.id}
                className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] transition-colors"
                data-testid={`post-${post.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getPlatformIcon(post.platform)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-[#0B1F3B] dark:text-white">{post.author}</p>
                        <p className="text-sm text-[#64748B]">{post.timestamp}</p>
                      </div>
                      <Badge className={getSentimentColor(post.sentiment)}>
                        {t(`social.sentiment.${post.sentiment}`, post.sentiment)}
                      </Badge>
                    </div>
                    <p className="text-[#0B1F3B] dark:text-white mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-[#64748B]">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        {post.shares}
                      </span>
                      <Button variant="ghost" size="sm" data-testid={`button-reply-${post.id}`} className="text-[#0A5ED7] hover:text-[#0952b8] hover:bg-[#0A5ED7]/10">
                        {t('social.reply', 'Reply')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
