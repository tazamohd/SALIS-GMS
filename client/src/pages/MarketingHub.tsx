// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { SiFacebook, SiInstagram, SiGoogle, SiX, SiTiktok, SiYoutube } from "react-icons/si";
import { Linkedin as SiLinkedin } from "lucide-react";
import { TabsPageLayout } from "@/components/layouts";

const PLATFORMS = [
  { id: "google_ads", name: "Google Ads", icon: SiGoogle, color: "text-red-500", type: "search" },
  { id: "facebook", name: "Facebook Ads", icon: SiFacebook, color: "text-[#0A5ED7]", type: "social" },
  { id: "instagram", name: "Instagram Ads", icon: SiInstagram, color: "text-pink-500", type: "social" },
  { id: "twitter", name: "X (Twitter) Ads", icon: SiX, color: "text-[#0B1F3B] dark:text-white", type: "social" },
  { id: "linkedin", name: "LinkedIn Ads", icon: SiLinkedin, color: "text-[#0A5ED7]", type: "social" },
  { id: "tiktok", name: "TikTok Ads", icon: SiTiktok, color: "text-[#0B1F3B] dark:text-white", type: "video" },
  { id: "youtube", name: "YouTube Ads", icon: SiYoutube, color: "text-red-600", type: "video" },
];

export default function MarketingHub() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const { data: accountsData } = useQuery<{ accounts: any[] }>({
    queryKey: ['/api/marketing/accounts'],
    queryFn: async () => {
      const response = await fetch('/api/marketing/accounts');
      if (!response.ok) throw new Error('Failed to fetch accounts');
      return response.json();
    },
  });
  const accounts = accountsData?.accounts ?? [];

  const { data: campaignsData } = useQuery<{ campaigns: any[] }>({
    queryKey: ['/api/marketing/campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/marketing/campaigns');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return response.json();
    },
  });
  const campaigns = campaignsData?.campaigns ?? [];

  const { data: tasksData } = useQuery<{ tasks: any[] }>({
    queryKey: ['/api/marketing/tasks'],
    queryFn: async () => {
      const response = await fetch('/api/marketing/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
  });
  const tasks = tasksData?.tasks ?? [];

  const { data: socialData } = useQuery<{ conversations: any[]; messages: any[]; commentThreads: any[]; comments: any[] }>({
    queryKey: ['/api/marketing/social'],
    queryFn: async () => {
      const response = await fetch('/api/marketing/social');
      if (!response.ok) throw new Error('Failed to fetch social data');
      return response.json();
    },
  });
  const conversations = socialData?.conversations ?? [];
  const messages = socialData?.messages ?? [];
  const commentThreads = socialData?.commentThreads ?? [];
  const comments = socialData?.comments ?? [];

  const totalSpend = accounts.reduce((sum: number, acc: any) => sum + (acc.spend || 0), 0);
  const totalBudget = accounts.reduce((sum: number, acc: any) => sum + (acc.budget || 0), 0);
  const totalImpressions = accounts.reduce((sum: number, acc: any) => sum + (acc.impressions || 0), 0);
  const totalClicks = accounts.reduce((sum: number, acc: any) => sum + (acc.clicks || 0), 0);
  const totalConversions = accounts.reduce((sum: number, acc: any) => sum + (acc.conversions || 0), 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0";

  const getPlatformInfo = (providerId: string) => {
    return PLATFORMS.find(p => p.id === providerId) || PLATFORMS[0];
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      connected: "bg-green-600 text-white",
      active: "bg-green-600 text-white",
      pending: "bg-[#F97316] text-white",
      paused: "bg-[#64748B] text-white",
      draft: "bg-[#64748B] text-white",
      error: "bg-red-600 text-white",
      disconnected: "bg-red-600 text-white",
      completed: "bg-green-600 text-white",
      in_progress: "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white",
    };
    return <Badge className={statusColors[status] || "bg-[#64748B] text-white"}>{status.replace("_", " ")}</Badge>;
  };

  const overviewContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-spend">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-[#64748B]">{t('marketing.totalSpend', 'Total Spend')}</p>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">${totalSpend.toLocaleString()}</p>
                <p className="text-xs text-[#64748B]">{t('marketing.ofBudget', 'of ${{budget}} budget', { budget: totalBudget.toLocaleString() })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-impressions">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-[#0A5ED7]" />
              <div>
                <p className="text-sm text-[#64748B]">{t('marketing.impressions', 'Impressions')}</p>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{(totalImpressions / 1000).toFixed(1)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-clicks">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MousePointer className="h-8 w-8 text-[#0BB3FF]" />
              <div>
                <p className="text-sm text-[#64748B]">{t('marketing.clicks', 'Clicks')}</p>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{totalClicks.toLocaleString()}</p>
                <p className="text-xs text-[#64748B]">{avgCTR}% {t('marketing.ctr', 'CTR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-conversions">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-[#F97316]" />
              <div>
                <p className="text-sm text-[#64748B]">{t('marketing.conversions', 'Conversions')}</p>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{totalConversions}</p>
                <p className="text-xs text-[#64748B]">${(totalSpend / Math.max(totalConversions, 1)).toFixed(2)} {t('marketing.cpa', 'CPA')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-connected-platforms">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <LinkIcon className="h-5 w-5" />
              {t('marketing.connectedPlatforms', 'Connected Platforms')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('marketing.managePlatformConnections', 'Manage your advertising platform connections')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accounts.map(account => {
                const platform = getPlatformInfo(account.providerId);
                const PlatformIcon = platform.icon;
                const spendPercent = (account.spend / account.budget) * 100;
                
                return (
                  <div 
                    key={account.id} 
                    className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] transition-colors"
                    data-testid={`account-${account.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <PlatformIcon className={`h-6 w-6 ${platform.color}`} />
                      <div>
                        <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">{account.name}</p>
                        <p className="text-xs text-[#64748B]">{platform.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {account.status === "connected" && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">${account.spend.toLocaleString()}</p>
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
              className="w-full mt-4 border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" 
              variant="outline"
              onClick={() => setIsConnectDialogOpen(true)}
              data-testid="button-connect-platform"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('marketing.connectNewPlatform', 'Connect New Platform')}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-pending-tasks">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Clock className="h-5 w-5" />
              {t('marketing.pendingTasks', 'Pending Tasks')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('marketing.tasksRequiringAttention', 'Marketing tasks requiring attention')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.filter(t => t.status !== "completed").map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] transition-colors"
                  data-testid={`task-${task.id}`}
                >
                  <div className="flex items-center gap-3">
                    {task.status === "pending" ? (
                      <AlertCircle className="h-5 w-5 text-[#F97316]" />
                    ) : (
                      <RefreshCw className="h-5 w-5 text-[#0A5ED7] animate-spin" />
                    )}
                    <div>
                      <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">{task.title}</p>
                      <p className="text-xs text-[#64748B]">{t('marketing.due', 'Due')}: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge className={task.priority === "high" ? "bg-[#F97316] text-white" : "bg-[#64748B] text-white"}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-active-campaigns">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <BarChart3 className="h-5 w-5" />
            {t('marketing.activeCampaigns', 'Active Campaigns')}
          </CardTitle>
          <CardDescription className="text-[#64748B]">{t('marketing.performanceOverview', 'Performance overview of running campaigns')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaigns.filter(c => c.status === "active").map(campaign => {
              const account = accounts.find(a => a.id === campaign.accountId);
              const platform = account ? getPlatformInfo(account.providerId) : null;
              const PlatformIcon = platform?.icon || LayoutDashboard;
              
              return (
                <div 
                  key={campaign.id} 
                  className="flex items-center justify-between p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] transition-colors"
                  data-testid={`campaign-${campaign.id}`}
                >
                  <div className="flex items-center gap-3">
                    <PlatformIcon className={`h-5 w-5 ${platform?.color || ""}`} />
                    <div>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{campaign.name}</p>
                      <p className="text-xs text-[#64748B] capitalize">{campaign.objective} • {platform?.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-6 text-center text-sm">
                    <div>
                      <p className="text-[#64748B]">{t('marketing.spent', 'Spent')}</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">${campaign.spent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[#64748B]">{t('marketing.impressions', 'Impressions')}</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{(campaign.impressions / 1000).toFixed(1)}K</p>
                    </div>
                    <div>
                      <p className="text-[#64748B]">{t('marketing.ctr', 'CTR')}</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{campaign.ctr}%</p>
                    </div>
                    <div>
                      <p className="text-[#64748B]">{t('marketing.conv', 'Conv.')}</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{campaign.conversions}</p>
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
          <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">{t('marketing.platformAccounts', 'Platform Accounts')}</h3>
          <p className="text-sm text-[#64748B]">{t('marketing.managePlatformConnections', 'Manage your advertising platform connections')}</p>
        </div>
        <Button onClick={() => setIsConnectDialogOpen(true)} data-testid="button-add-account" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#09a3e8] text-white">
          <Plus className="h-4 w-4 mr-2" />
          {t('marketing.addAccount', 'Add Account')}
        </Button>
      </div>

      <div className="grid gap-4">
        {PLATFORMS.map(platform => {
          const accounts = accounts.filter(a => a.providerId === platform.id);
          const PlatformIcon = platform.icon;
          
          return (
            <Card key={platform.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`platform-card-${platform.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                      <PlatformIcon className={`h-8 w-8 ${platform.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0B1F3B] dark:text-white">{platform.name}</h4>
                      <p className="text-sm text-[#64748B] capitalize">{platform.type} {t('marketing.advertising', 'advertising')}</p>
                      {accounts.length > 0 && (
                        <p className="text-xs text-[#64748B] mt-1">
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
                        className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        {t('marketing.connect', 'Connect')}
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" data-testid={`button-manage-${platform.id}`} className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]">
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
                        className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                      >
                        <div className="flex items-center gap-2">
                          {account.status === "connected" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-[#F97316]" />
                          )}
                          <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">{account.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-[#0B1F3B] dark:text-white">${account.spend.toLocaleString()} / ${account.budget.toLocaleString()}</span>
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
          <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">{t('marketing.allCampaigns', 'All Campaigns')}</h3>
          <p className="text-sm text-[#64748B]">{t('marketing.manageCampaignsAcrossPlatforms', 'Manage campaigns across all platforms')}</p>
        </div>
        <Button data-testid="button-create-campaign" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#09a3e8] text-white">
          <Plus className="h-4 w-4 mr-2" />
          {t('marketing.createCampaign', 'Create Campaign')}
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-platform-filter">
            <SelectValue placeholder={t('marketing.allPlatforms', 'All Platforms')} />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <SelectItem value="all">{t('marketing.allPlatforms', 'All Platforms')}</SelectItem>
            {PLATFORMS.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-status-filter">
            <SelectValue placeholder={t('marketing.allStatus', 'All Status')} />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <SelectItem value="all">{t('marketing.allStatus', 'All Status')}</SelectItem>
            <SelectItem value="active">{t('common.active', 'Active')}</SelectItem>
            <SelectItem value="paused">{t('marketing.paused', 'Paused')}</SelectItem>
            <SelectItem value="draft">{t('common.draft', 'Draft')}</SelectItem>
            <SelectItem value="completed">{t('common.completed', 'Completed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {campaigns.map(campaign => {
          const account = accounts.find(a => a.id === campaign.accountId);
          const platform = account ? getPlatformInfo(account.providerId) : null;
          const PlatformIcon = platform?.icon || LayoutDashboard;
          const budgetPercent = (campaign.spent / campaign.budget) * 100;
          
          return (
            <Card key={campaign.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`campaign-card-${campaign.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <PlatformIcon className={`h-6 w-6 ${platform?.color || ""}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#0B1F3B] dark:text-white">{campaign.name}</p>
                        {getStatusBadge(campaign.status)}
                      </div>
                      <p className="text-xs text-[#64748B] capitalize">{campaign.objective} • {platform?.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-6 text-center text-sm">
                    <div>
                      <p className="text-[#64748B]">{t('marketing.budget', 'Budget')}</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">${campaign.budget}</p>
                      <Progress value={budgetPercent} className="w-16 h-1 mt-1" />
                    </div>
                    <div>
                      <p className="text-[#64748B]">{t('marketing.impressions', 'Impressions')}</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{campaign.impressions > 0 ? `${(campaign.impressions / 1000).toFixed(1)}K` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-[#64748B]">{t('marketing.clicks', 'Clicks')}</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{campaign.clicks || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[#64748B]">{t('marketing.ctr', 'CTR')}</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{campaign.ctr > 0 ? `${campaign.ctr}%` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-[#64748B]">{t('marketing.conversions', 'Conversions')}</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{campaign.conversions || "-"}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#64748B] hover:text-[#0B1F3B] dark:hover:text-white">
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
          <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">{t('marketing.unifiedInbox', 'Unified Inbox')}</h3>
          <p className="text-sm text-[#64748B]">{t('marketing.manageConversations', 'Manage all conversations from one place')}</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-600 text-white">{t('marketing.open', 'Open')}: {conversations.filter(c => c.status === "open").length}</Badge>
          <Badge className="bg-[#64748B] text-white">{t('marketing.pending', 'Pending')}: {conversations.filter(c => c.status === "pending").length}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1 space-y-2">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Inbox className="h-4 w-4" />
                {t('marketing.conversations', 'Conversations')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#E2E8F0] dark:divide-[#232A36]">
                {conversations.map(conv => {
                  const platform = getPlatformInfo(conv.providerId);
                  const PlatformIcon = platform.icon;
                  
                  return (
                    <div 
                      key={conv.id}
                      className="p-3 hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] cursor-pointer transition-colors"
                      data-testid={`conversation-${conv.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-[#F8FAFC] dark:bg-[#0E1117] flex items-center justify-center border border-[#E2E8F0] dark:border-[#232A36]">
                            <User className="h-5 w-5 text-[#64748B]" />
                          </div>
                          <div className="absolute -bottom-1 -right-1">
                            <PlatformIcon className={`h-4 w-4 ${platform.color}`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate text-[#0B1F3B] dark:text-white">{conv.name}</p>
                            <span className="text-xs text-[#64748B]">{conv.lastMessageTime}</span>
                          </div>
                          <p className="text-xs text-[#64748B] truncate">{conv.lastMessage}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={conv.status === "open" ? "bg-green-600 text-white" : conv.status === "resolved" ? "bg-[#64748B] text-white" : "bg-[#F97316] text-white"}>
                              {conv.status}
                            </Badge>
                            {conv.unread > 0 && (
                              <Badge className="bg-red-600 text-white">{conv.unread}</Badge>
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
          <Card className="h-full bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader className="py-3 border-b border-[#E2E8F0] dark:border-[#232A36]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F8FAFC] dark:bg-[#0E1117] flex items-center justify-center border border-[#E2E8F0] dark:border-[#232A36]">
                    <User className="h-5 w-5 text-[#64748B]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#0B1F3B] dark:text-white">Ahmed Al-Rashid</p>
                    <p className="text-xs text-[#64748B]">@ahmed_rashid • Messenger</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]">
                    <Archive className="h-4 w-4 mr-2" />
                    {t('marketing.archive', 'Archive')}
                  </Button>
                  <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]">
                    <Tag className="h-4 w-4 mr-2" />
                    {t('marketing.tag', 'Tag')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4 mb-4">
                {messages.map(msg => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      msg.direction === "outbound" 
                        ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" 
                        : "bg-[#F8FAFC] dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white"
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder={t('marketing.typeMessage', 'Type your message...')} className="flex-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#09a3e8] text-white">
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
          <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">{t('marketing.commentManagement', 'Comment Management')}</h3>
          <p className="text-sm text-[#64748B]">{t('marketing.respondToComments', 'Respond to comments across all platforms')}</p>
        </div>
        <Badge className="bg-[#F97316] text-white">{t('marketing.unreplied', 'Unreplied')}: {commentThreads.reduce((sum: number, thread: any) => sum + (thread.unreplied || 0), 0)}</Badge>
      </div>

      <div className="space-y-4">
        {commentThreads.map(thread => {
          const platform = getPlatformInfo(thread.providerId);
          const PlatformIcon = platform.icon;
          const threadComments = comments.filter(c => c.threadId === thread.id);
          
          return (
            <Card key={thread.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`thread-${thread.id}`}>
              <CardHeader className="py-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <PlatformIcon className={`h-6 w-6 ${platform.color}`} />
                    <div>
                      <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">{thread.platform}</p>
                      <p className="text-xs text-[#64748B] line-clamp-1">{thread.postContent}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#64748B] text-white">{thread.totalComments} {t('marketing.comments', 'comments')}</Badge>
                    {thread.unreplied > 0 && (
                      <Badge className="bg-[#F97316] text-white">{thread.unreplied} {t('marketing.unreplied', 'unreplied')}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {threadComments.map(comment => (
                    <div 
                      key={comment.id}
                      className={`p-3 rounded-lg border ${!comment.hasReplied ? "border-[#F97316]/50 bg-[#F97316]/10" : "border-[#E2E8F0] dark:border-[#232A36]"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#F8FAFC] dark:bg-[#0E1117] flex items-center justify-center border border-[#E2E8F0] dark:border-[#232A36]">
                            <User className="h-4 w-4 text-[#64748B]" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">{comment.author}</p>
                            <p className="text-xs text-[#64748B]">{comment.postedAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#64748B] flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" /> {comment.likes}
                          </span>
                          {!comment.hasReplied && (
                            <Button size="sm" variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]">
                              <Reply className="h-3 w-3 mr-1" />
                              {t('marketing.reply', 'Reply')}
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm mt-2 text-[#0B1F3B] dark:text-white">{comment.content}</p>
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
            badge: conversations.filter(c => c.unread > 0).length,
          },
          {
            id: "comments",
            label: t('marketing.comments', 'Comments'),
            icon: MessageCircle,
            content: commentsContent,
            badge: commentThreads.reduce((sum: number, thread: any) => sum + (thread.unreplied || 0), 0),
          },
        ]}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('marketing.connectAdPlatform', 'Connect Advertising Platform')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">
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
                    className={`h-auto py-4 flex flex-col items-center gap-2 ${isSelected ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" : "border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"}`}
                    onClick={() => setSelectedPlatform(platform.id)}
                    data-testid={`platform-button-${platform.id}`}
                  >
                    <PlatformIcon className={`h-8 w-8 ${isSelected ? "text-white" : platform.color}`} />
                    <span className="text-xs">{platform.name}</span>
                  </Button>
                );
              })}
            </div>
            {selectedPlatform && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('marketing.accountName', 'Account Name')}</label>
                  <Input placeholder={t('marketing.accountNamePlaceholder', 'My Campaign Account')} className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-account-name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('marketing.apiKeyOrAccountId', 'API Key / Account ID')}</label>
                  <Input placeholder={t('marketing.enterApiKey', 'Enter your API key or account ID')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-api-key" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]">
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button disabled={!selectedPlatform} data-testid="button-connect-account" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#09a3e8] text-white">
              {t('marketing.connectAccount', 'Connect Account')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
