import { useState } from "react";
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Facebook, Twitter, Instagram, Linkedin, MessageSquare, ThumbsUp, Share2, TrendingUp } from "lucide-react";

export default function SocialMediaMonitoring() {
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("7days");

  const platforms = [
    { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600 dark:text-blue-400" },
    { id: "twitter", name: "Twitter", icon: Twitter, color: "text-sky-500 dark:text-sky-400" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-600 dark:text-pink-400" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-700 dark:text-blue-500" },
  ];

  const metrics = [
    { label: "Total Mentions", value: "1,247", change: "+12%", icon: MessageSquare },
    { label: "Engagement Rate", value: "8.5%", change: "+2.3%", icon: TrendingUp },
    { label: "Total Likes", value: "3,892", change: "+18%", icon: ThumbsUp },
    { label: "Total Shares", value: "456", change: "+25%", icon: Share2 },
  ];

  const recentPosts = [
    {
      id: 1,
      platform: "facebook",
      content: "Great service at SalisAuto! My car runs like new after their maintenance check.",
      author: "Sarah Johnson",
      timestamp: "2 hours ago",
      likes: 45,
      shares: 12,
      sentiment: "positive"
    },
    {
      id: 2,
      platform: "twitter",
      content: "Thanks @SalisAuto for the quick turnaround on my brake repair!",
      author: "Mike Chen",
      timestamp: "5 hours ago",
      likes: 28,
      shares: 5,
      sentiment: "positive"
    },
    {
      id: 3,
      platform: "instagram",
      content: "Check out SalisAuto's new facility! Modern and professional.",
      author: "Emily Davis",
      timestamp: "1 day ago",
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
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
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
      title="Social Media Monitoring"
      description="Track and analyze social media mentions and engagement"
      icon={MessageSquare}
    >
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger data-testid="select-platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {platforms.map(platform => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger data-testid="select-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24hours">Last 24 Hours</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                  {metric.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {platforms.map(platform => (
          <Card key={platform.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <platform.icon className={`w-8 h-8 ${platform.color}`} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{platform.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Followers</span>
                  <span className="font-medium text-gray-900 dark:text-white">2,450</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Engagement</span>
                  <span className="font-medium text-gray-900 dark:text-white">7.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Mentions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Mentions</CardTitle>
          <CardDescription>Latest social media posts mentioning your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts.map(post => (
              <div
                key={post.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                data-testid={`post-${post.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getPlatformIcon(post.platform)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{post.author}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{post.timestamp}</p>
                      </div>
                      <Badge className={getSentimentColor(post.sentiment)}>
                        {post.sentiment}
                      </Badge>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        {post.shares}
                      </span>
                      <Button variant="ghost" size="sm" data-testid={`button-reply-${post.id}`}>
                        Reply
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
