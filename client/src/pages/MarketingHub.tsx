import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  MousePointer,
  BarChart3,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Inbox,
  MessageCircle,
  Send,
  User,
  ThumbsUp,
  Reply,
  Archive,
  Tag
} from "lucide-react";
import { SiFacebook, SiInstagram, SiGoogle, SiLinkedin, SiX, SiTiktok, SiYoutube } from "react-icons/si";
import { TabsPageLayout } from "@/components/layouts";

const PLATFORMS = [
  { id: "google_ads", name: "Google Ads", icon: SiGoogle, color: "text-red-500", type: "search" },
  { id: "facebook", name: "Facebook Ads", icon: SiFacebook, color: "text-blue-600", type: "social" },
  { id: "instagram", name: "Instagram Ads", icon: SiInstagram, color: "text-pink-500", type: "social" },
  { id: "twitter", name: "X (Twitter) Ads", icon: SiX, color: "text-gray-900 dark:text-white", type: "social" },
  { id: "linkedin", name: "LinkedIn Ads", icon: SiLinkedin, color: "text-blue-700", type: "social" },
  { id: "tiktok", name: "TikTok Ads", icon: SiTiktok, color: "text-black dark:text-white", type: "video" },
  { id: "youtube", name: "YouTube Ads", icon: SiYoutube, color: "text-red-600", type: "video" },
];

const MOCK_ACCOUNTS = [
  { id: "1", providerId: "google_ads", name: "SALIS AUTO - Search Campaigns", status: "connected", spend: 4520.50, budget: 5000, impressions: 125000, clicks: 3200, conversions: 85 },
  { id: "2", providerId: "facebook", name: "SALIS AUTO - Social Media", status: "connected", spend: 2150.00, budget: 3000, impressions: 89000, clicks: 2100, conversions: 42 },
  { id: "3", providerId: "instagram", name: "SALIS AUTO - Instagram Brand", status: "connected", spend: 1850.00, budget: 2500, impressions: 67000, clicks: 1850, conversions: 28 },
  { id: "4", providerId: "linkedin", name: "SALIS AUTO - B2B Outreach", status: "pending", spend: 0, budget: 1500, impressions: 0, clicks: 0, conversions: 0 },
];

const MOCK_CAMPAIGNS = [
  { id: "1", accountId: "1", name: "Winter Service Promotion", objective: "conversions", status: "active", budget: 1500, spent: 1280.50, impressions: 45000, clicks: 1200, conversions: 32, ctr: 2.67, cpc: 1.07 },
  { id: "2", accountId: "1", name: "Oil Change Special", objective: "traffic", status: "active", budget: 800, spent: 650.00, impressions: 28000, clicks: 890, conversions: 18, ctr: 3.18, cpc: 0.73 },
  { id: "3", accountId: "2", name: "New Customer Acquisition", objective: "leads", status: "active", budget: 1200, spent: 980.00, impressions: 52000, clicks: 1450, conversions: 25, ctr: 2.79, cpc: 0.68 },
  { id: "4", accountId: "3", name: "Brand Awareness - Stories", objective: "awareness", status: "paused", budget: 500, spent: 320.00, impressions: 35000, clicks: 650, conversions: 8, ctr: 1.86, cpc: 0.49 },
  { id: "5", accountId: "1", name: "Summer Tire Sale", objective: "conversions", status: "draft", budget: 2000, spent: 0, impressions: 0, clicks: 0, conversions: 0, ctr: 0, cpc: 0 },
];

const MOCK_TASKS = [
  { id: "1", title: "Set up LinkedIn Ads account", type: "account_setup", status: "pending", priority: "high", dueDate: "2024-12-20" },
  { id: "2", title: "Review Google Ads performance", type: "performance_review", status: "in_progress", priority: "medium", dueDate: "2024-12-18" },
  { id: "3", title: "Create new Facebook ad creatives", type: "creative_review", status: "pending", priority: "medium", dueDate: "2024-12-22" },
  { id: "4", title: "Optimize campaign budgets", type: "budget_review", status: "completed", priority: "low", dueDate: "2024-12-15" },
];

const MOCK_CONVERSATIONS = [
  { id: "1", providerId: "facebook", name: "Ahmed Al-Rashid", handle: "@ahmed_rashid", avatar: "", status: "open", unread: 2, lastMessage: "Hi, I saw your ad about the winter service special. Is it still available?", lastMessageTime: "10 min ago", platform: "Messenger" },
  { id: "2", providerId: "instagram", name: "Sara Al-Mansouri", handle: "@sara_cars", avatar: "", status: "open", unread: 1, lastMessage: "When is the best time to come for an oil change?", lastMessageTime: "25 min ago", platform: "Instagram DM" },
  { id: "3", providerId: "twitter", name: "Mohammed Fahad", handle: "@mfahad_auto", avatar: "", status: "pending", unread: 0, lastMessage: "Thanks for the quick response!", lastMessageTime: "1 hour ago", platform: "X DM" },
  { id: "4", providerId: "facebook", name: "Layla Hassan", handle: "@layla.hassan", avatar: "", status: "open", unread: 3, lastMessage: "Do you offer pickup service for my car?", lastMessageTime: "2 hours ago", platform: "Messenger" },
  { id: "5", providerId: "linkedin", name: "Khalid Ibrahim", handle: "Khalid Ibrahim", avatar: "", status: "resolved", unread: 0, lastMessage: "Great, I'll schedule the fleet service for next week.", lastMessageTime: "1 day ago", platform: "LinkedIn" },
];

const MOCK_MESSAGES = [
  { id: "1", conversationId: "1", direction: "inbound", content: "Hi, I saw your ad about the winter service special. Is it still available?", time: "10:30 AM" },
  { id: "2", conversationId: "1", direction: "outbound", content: "Hello Ahmed! Yes, our Winter Service Special is still available until December 31st. Would you like to book an appointment?", time: "10:35 AM" },
  { id: "3", conversationId: "1", direction: "inbound", content: "Yes please! What times are available this Saturday?", time: "10:38 AM" },
];

const MOCK_COMMENT_THREADS = [
  { id: "1", providerId: "facebook", postContent: "Winter is here! Get your car ready with our comprehensive winter service package...", platform: "Facebook", totalComments: 12, unreplied: 3, sentiment: "positive" },
  { id: "2", providerId: "instagram", postContent: "Before & After: Watch this amazing transformation of a 2020 BMW...", platform: "Instagram", totalComments: 45, unreplied: 8, sentiment: "mixed" },
  { id: "3", providerId: "youtube", postContent: "How to maintain your car's engine: Expert tips from SALIS AUTO", platform: "YouTube", totalComments: 89, unreplied: 15, sentiment: "positive" },
];

const MOCK_COMMENTS = [
  { id: "1", threadId: "1", author: "Ali Mohammed", content: "Great service! I brought my car last week and they did an amazing job.", likes: 5, sentiment: "positive", hasReplied: true, postedAt: "2 hours ago" },
  { id: "2", threadId: "1", author: "Fatima Al-Saud", content: "What's included in the winter package?", likes: 2, sentiment: "neutral", hasReplied: false, postedAt: "3 hours ago" },
  { id: "3", threadId: "1", author: "Hassan Khalil", content: "How much does the full service cost?", likes: 1, sentiment: "neutral", hasReplied: false, postedAt: "4 hours ago" },
  { id: "4", threadId: "2", author: "Noor Ahmed", content: "Wow! Amazing transformation 👏", likes: 12, sentiment: "positive", hasReplied: true, postedAt: "1 day ago" },
  { id: "5", threadId: "2", author: "Yusuf Ibrahim", content: "Is this covered under warranty?", likes: 3, sentiment: "neutral", hasReplied: false, postedAt: "1 day ago" },
];

export default function MarketingHub() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const totalSpend = MOCK_ACCOUNTS.reduce((sum, acc) => sum + acc.spend, 0);
  const totalBudget = MOCK_ACCOUNTS.reduce((sum, acc) => sum + acc.budget, 0);
  const totalImpressions = MOCK_ACCOUNTS.reduce((sum, acc) => sum + acc.impressions, 0);
  const totalClicks = MOCK_ACCOUNTS.reduce((sum, acc) => sum + acc.clicks, 0);
  const totalConversions = MOCK_ACCOUNTS.reduce((sum, acc) => sum + acc.conversions, 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0";

  const getPlatformInfo = (providerId: string) => {
    return PLATFORMS.find(p => p.id === providerId) || PLATFORMS[0];
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      connected: "default",
      active: "default",
      pending: "secondary",
      paused: "outline",
      draft: "outline",
      error: "destructive",
      disconnected: "destructive",
      completed: "default",
      in_progress: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>;
  };

  const overviewContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card data-testid="card-total-spend">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t('marketing.totalSpend', 'Total Spend')}</p>
                <p className="text-2xl font-bold">${totalSpend.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{t('marketing.ofBudget', 'of ${{budget}} budget', { budget: totalBudget.toLocaleString() })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-impressions">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t('marketing.impressions', 'Impressions')}</p>
                <p className="text-2xl font-bold">{(totalImpressions / 1000).toFixed(1)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-clicks">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MousePointer className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t('marketing.clicks', 'Clicks')}</p>
                <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{avgCTR}% {t('marketing.ctr', 'CTR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-conversions">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t('marketing.conversions', 'Conversions')}</p>
                <p className="text-2xl font-bold">{totalConversions}</p>
                <p className="text-xs text-muted-foreground">${(totalSpend / Math.max(totalConversions, 1)).toFixed(2)} {t('marketing.cpa', 'CPA')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-connected-platforms">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              {t('marketing.connectedPlatforms', 'Connected Platforms')}
            </CardTitle>
            <CardDescription>{t('marketing.managePlatformConnections', 'Manage your advertising platform connections')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_ACCOUNTS.map(account => {
                const platform = getPlatformInfo(account.providerId);
                const PlatformIcon = platform.icon;
                const spendPercent = (account.spend / account.budget) * 100;
                
                return (
                  <div 
                    key={account.id} 
                    className="flex items-center justify-between p-3 rounded-lg border"
                    data-testid={`account-${account.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <PlatformIcon className={`h-6 w-6 ${platform.color}`} />
                      <div>
                        <p className="font-medium text-sm">{account.name}</p>
                        <p className="text-xs text-muted-foreground">{platform.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {account.status === "connected" && (
                        <div className="text-right">
                          <p className="text-sm font-medium">${account.spend.toLocaleString()}</p>
                          <Progress value={spendPercent} className="w-20 h-1" />
                        </div>
                      )}
                      {getStatusBadge(account.status)}
                    </div>
                  </div>
                );
              })}
            </div>
            <Button 
              className="w-full mt-4" 
              variant="outline"
              onClick={() => setIsConnectDialogOpen(true)}
              data-testid="button-connect-platform"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('marketing.connectNewPlatform', 'Connect New Platform')}
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-tasks">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('marketing.pendingTasks', 'Pending Tasks')}
            </CardTitle>
            <CardDescription>{t('marketing.tasksRequiringAttention', 'Marketing tasks requiring attention')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_TASKS.filter(t => t.status !== "completed").map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 rounded-lg border"
                  data-testid={`task-${task.id}`}
                >
                  <div className="flex items-center gap-3">
                    {task.status === "pending" ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{t('marketing.due', 'Due')}: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={task.priority === "high" ? "destructive" : "outline"}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-active-campaigns">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('marketing.activeCampaigns', 'Active Campaigns')}
          </CardTitle>
          <CardDescription>{t('marketing.performanceOverview', 'Performance overview of running campaigns')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_CAMPAIGNS.filter(c => c.status === "active").map(campaign => {
              const account = MOCK_ACCOUNTS.find(a => a.id === campaign.accountId);
              const platform = account ? getPlatformInfo(account.providerId) : null;
              const PlatformIcon = platform?.icon || LayoutDashboard;
              
              return (
                <div 
                  key={campaign.id} 
                  className="flex items-center justify-between p-4 rounded-lg border"
                  data-testid={`campaign-${campaign.id}`}
                >
                  <div className="flex items-center gap-3">
                    <PlatformIcon className={`h-5 w-5 ${platform?.color || ""}`} />
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{campaign.objective} • {platform?.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-6 text-center text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('marketing.spent', 'Spent')}</p>
                      <p className="font-medium">${campaign.spent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('marketing.impressions', 'Impressions')}</p>
                      <p className="font-medium">{(campaign.impressions / 1000).toFixed(1)}K</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('marketing.ctr', 'CTR')}</p>
                      <p className="font-medium">{campaign.ctr}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('marketing.conv', 'Conv.')}</p>
                      <p className="font-medium">{campaign.conversions}</p>
                    </div>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const accountsContent = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t('marketing.platformAccounts', 'Platform Accounts')}</h3>
          <p className="text-sm text-muted-foreground">{t('marketing.managePlatformConnections', 'Manage your advertising platform connections')}</p>
        </div>
        <Button onClick={() => setIsConnectDialogOpen(true)} data-testid="button-add-account">
          <Plus className="h-4 w-4 mr-2" />
          {t('marketing.addAccount', 'Add Account')}
        </Button>
      </div>

      <div className="grid gap-4">
        {PLATFORMS.map(platform => {
          const accounts = MOCK_ACCOUNTS.filter(a => a.providerId === platform.id);
          const PlatformIcon = platform.icon;
          
          return (
            <Card key={platform.id} data-testid={`platform-card-${platform.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-muted`}>
                      <PlatformIcon className={`h-8 w-8 ${platform.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{platform.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">{platform.type} {t('marketing.advertising', 'advertising')}</p>
                      {accounts.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('marketing.accountsConnected', '{{count}} account(s) connected', { count: accounts.length })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {accounts.length === 0 ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedPlatform(platform.id);
                          setIsConnectDialogOpen(true);
                        }}
                        data-testid={`button-connect-${platform.id}`}
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        {t('marketing.connect', 'Connect')}
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" data-testid={`button-manage-${platform.id}`}>
                        <Settings className="h-4 w-4 mr-2" />
                        {t('marketing.manage', 'Manage')}
                      </Button>
                    )}
                  </div>
                </div>

                {accounts.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {accounts.map(account => (
                      <div 
                        key={account.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          {account.status === "connected" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-sm font-medium">{account.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm">${account.spend.toLocaleString()} / ${account.budget.toLocaleString()}</span>
                          {getStatusBadge(account.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const campaignsContent = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t('marketing.allCampaigns', 'All Campaigns')}</h3>
          <p className="text-sm text-muted-foreground">{t('marketing.manageCampaignsAcrossPlatforms', 'Manage campaigns across all platforms')}</p>
        </div>
        <Button data-testid="button-create-campaign">
          <Plus className="h-4 w-4 mr-2" />
          {t('marketing.createCampaign', 'Create Campaign')}
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]" data-testid="select-platform-filter">
            <SelectValue placeholder={t('marketing.allPlatforms', 'All Platforms')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('marketing.allPlatforms', 'All Platforms')}</SelectItem>
            {PLATFORMS.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder={t('marketing.allStatus', 'All Status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('marketing.allStatus', 'All Status')}</SelectItem>
            <SelectItem value="active">{t('common.active', 'Active')}</SelectItem>
            <SelectItem value="paused">{t('marketing.paused', 'Paused')}</SelectItem>
            <SelectItem value="draft">{t('common.draft', 'Draft')}</SelectItem>
            <SelectItem value="completed">{t('common.completed', 'Completed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {MOCK_CAMPAIGNS.map(campaign => {
          const account = MOCK_ACCOUNTS.find(a => a.id === campaign.accountId);
          const platform = account ? getPlatformInfo(account.providerId) : null;
          const PlatformIcon = platform?.icon || LayoutDashboard;
          const budgetPercent = (campaign.spent / campaign.budget) * 100;
          
          return (
            <Card key={campaign.id} data-testid={`campaign-card-${campaign.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <PlatformIcon className={`h-6 w-6 ${platform?.color || ""}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{campaign.name}</p>
                        {getStatusBadge(campaign.status)}
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">{campaign.objective} • {platform?.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-6 text-center text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('marketing.budget', 'Budget')}</p>
                      <p className="font-medium">${campaign.budget}</p>
                      <Progress value={budgetPercent} className="w-16 h-1 mt-1" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('marketing.impressions', 'Impressions')}</p>
                      <p className="font-medium">{campaign.impressions > 0 ? `${(campaign.impressions / 1000).toFixed(1)}K` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('marketing.clicks', 'Clicks')}</p>
                      <p className="font-medium">{campaign.clicks || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('marketing.ctr', 'CTR')}</p>
                      <p className="font-medium">{campaign.ctr > 0 ? `${campaign.ctr}%` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('marketing.conversions', 'Conversions')}</p>
                      <p className="font-medium">{campaign.conversions || "-"}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const inboxContent = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t('marketing.unifiedInbox', 'Unified Inbox')}</h3>
          <p className="text-sm text-muted-foreground">{t('marketing.manageConversations', 'Manage all conversations from one place')}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{t('marketing.open', 'Open')}: {MOCK_CONVERSATIONS.filter(c => c.status === "open").length}</Badge>
          <Badge variant="secondary">{t('marketing.pending', 'Pending')}: {MOCK_CONVERSATIONS.filter(c => c.status === "pending").length}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1 space-y-2">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                {t('marketing.conversations', 'Conversations')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {MOCK_CONVERSATIONS.map(conv => {
                  const platform = getPlatformInfo(conv.providerId);
                  const PlatformIcon = platform.icon;
                  
                  return (
                    <div 
                      key={conv.id}
                      className="p-3 hover:bg-muted/50 cursor-pointer"
                      data-testid={`conversation-${conv.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="absolute -bottom-1 -right-1">
                            <PlatformIcon className={`h-4 w-4 ${platform.color}`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">{conv.name}</p>
                            <span className="text-xs text-muted-foreground">{conv.lastMessageTime}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={conv.status === "open" ? "default" : conv.status === "resolved" ? "secondary" : "outline"} className="text-xs">
                              {conv.status}
                            </Badge>
                            {conv.unread > 0 && (
                              <Badge variant="destructive" className="text-xs">{conv.unread}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Ahmed Al-Rashid</p>
                    <p className="text-xs text-muted-foreground">@ahmed_rashid • Messenger</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4 mr-2" />
                    {t('marketing.archive', 'Archive')}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Tag className="h-4 w-4 mr-2" />
                    {t('marketing.tag', 'Tag')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4 mb-4">
                {MOCK_MESSAGES.map(msg => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      msg.direction === "outbound" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder={t('marketing.typeMessage', 'Type your message...')} className="flex-1" />
                <Button>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const commentsContent = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t('marketing.commentManagement', 'Comment Management')}</h3>
          <p className="text-sm text-muted-foreground">{t('marketing.respondToComments', 'Respond to comments across all platforms')}</p>
        </div>
        <Badge variant="destructive">{t('marketing.unreplied', 'Unreplied')}: {MOCK_COMMENT_THREADS.reduce((sum, t) => sum + t.unreplied, 0)}</Badge>
      </div>

      <div className="space-y-4">
        {MOCK_COMMENT_THREADS.map(thread => {
          const platform = getPlatformInfo(thread.providerId);
          const PlatformIcon = platform.icon;
          const threadComments = MOCK_COMMENTS.filter(c => c.threadId === thread.id);
          
          return (
            <Card key={thread.id} data-testid={`thread-${thread.id}`}>
              <CardHeader className="py-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <PlatformIcon className={`h-6 w-6 ${platform.color}`} />
                    <div>
                      <p className="font-medium text-sm">{thread.platform}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{thread.postContent}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{thread.totalComments} {t('marketing.comments', 'comments')}</Badge>
                    {thread.unreplied > 0 && (
                      <Badge variant="destructive">{thread.unreplied} {t('marketing.unreplied', 'unreplied')}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {threadComments.map(comment => (
                    <div 
                      key={comment.id}
                      className={`p-3 rounded-lg border ${!comment.hasReplied ? "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{comment.author}</p>
                            <p className="text-xs text-muted-foreground">{comment.postedAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" /> {comment.likes}
                          </span>
                          {!comment.hasReplied && (
                            <Button size="sm" variant="outline">
                              <Reply className="h-3 w-3 mr-1" />
                              {t('marketing.reply', 'Reply')}
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm mt-2">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <TabsPageLayout
        title={t('nav.marketing_hub', 'Marketing Hub')}
        description={t('marketing.hubDescription', 'Unified platform for managing all your marketing campaigns and social media')}
        icon={LayoutDashboard}
        tabs={[
          {
            id: "overview",
            label: t('marketing.overview', 'Overview'),
            icon: LayoutDashboard,
            content: overviewContent,
          },
          {
            id: "accounts",
            label: t('marketing.accounts', 'Accounts'),
            icon: LinkIcon,
            content: accountsContent,
          },
          {
            id: "campaigns",
            label: t('marketing.campaigns', 'Campaigns'),
            icon: BarChart3,
            content: campaignsContent,
          },
          {
            id: "inbox",
            label: t('marketing.inbox', 'Inbox'),
            icon: MessageCircle,
            content: inboxContent,
            badge: MOCK_CONVERSATIONS.filter(c => c.unread > 0).length,
          },
          {
            id: "comments",
            label: t('marketing.comments', 'Comments'),
            icon: MessageCircle,
            content: commentsContent,
            badge: MOCK_COMMENT_THREADS.reduce((sum, t) => sum + t.unreplied, 0),
          },
        ]}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('marketing.connectAdPlatform', 'Connect Advertising Platform')}</DialogTitle>
            <DialogDescription>
              {t('marketing.connectAdPlatformDesc', 'Link your advertising account to manage campaigns from one place')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.map(platform => {
                const PlatformIcon = platform.icon;
                const isSelected = selectedPlatform === platform.id;
                
                return (
                  <Button
                    key={platform.id}
                    variant={isSelected ? "default" : "outline"}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => setSelectedPlatform(platform.id)}
                    data-testid={`platform-button-${platform.id}`}
                  >
                    <PlatformIcon className={`h-8 w-8 ${isSelected ? "" : platform.color}`} />
                    <span className="text-xs">{platform.name}</span>
                  </Button>
                );
              })}
            </div>
            {selectedPlatform && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">{t('marketing.accountName', 'Account Name')}</label>
                  <Input placeholder={t('marketing.accountNamePlaceholder', 'My Campaign Account')} className="mt-1" data-testid="input-account-name" />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('marketing.apiKeyOrAccountId', 'API Key / Account ID')}</label>
                  <Input placeholder={t('marketing.enterApiKey', 'Enter your API key or account ID')} data-testid="input-api-key" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button disabled={!selectedPlatform} data-testid="button-connect-account">
              {t('marketing.connectAccount', 'Connect Account')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
