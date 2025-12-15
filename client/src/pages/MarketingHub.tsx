import { useState } from "react";
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
  Clock
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

export default function MarketingHub() {
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
                <p className="text-sm text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-bold">${totalSpend.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">of ${totalBudget.toLocaleString()} budget</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-impressions">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Impressions</p>
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
                <p className="text-sm text-muted-foreground">Clicks</p>
                <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{avgCTR}% CTR</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-conversions">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{totalConversions}</p>
                <p className="text-xs text-muted-foreground">${(totalSpend / Math.max(totalConversions, 1)).toFixed(2)} CPA</p>
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
              Connected Platforms
            </CardTitle>
            <CardDescription>Manage your advertising platform connections</CardDescription>
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
              Connect New Platform
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-tasks">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Tasks
            </CardTitle>
            <CardDescription>Marketing tasks requiring attention</CardDescription>
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
                      <p className="text-xs text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
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
            Active Campaigns
          </CardTitle>
          <CardDescription>Performance overview of running campaigns</CardDescription>
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
                      <p className="text-muted-foreground">Spent</p>
                      <p className="font-medium">${campaign.spent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Impressions</p>
                      <p className="font-medium">{(campaign.impressions / 1000).toFixed(1)}K</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CTR</p>
                      <p className="font-medium">{campaign.ctr}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conv.</p>
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
          <h3 className="text-lg font-semibold">Platform Accounts</h3>
          <p className="text-sm text-muted-foreground">Manage your advertising platform connections</p>
        </div>
        <Button onClick={() => setIsConnectDialogOpen(true)} data-testid="button-add-account">
          <Plus className="h-4 w-4 mr-2" />
          Add Account
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
                      <p className="text-sm text-muted-foreground capitalize">{platform.type} advertising</p>
                      {accounts.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {accounts.length} account(s) connected
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
                        Connect
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" data-testid={`button-manage-${platform.id}`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
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
          <h3 className="text-lg font-semibold">All Campaigns</h3>
          <p className="text-sm text-muted-foreground">Manage campaigns across all platforms</p>
        </div>
        <Button data-testid="button-create-campaign">
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]" data-testid="select-platform-filter">
            <SelectValue placeholder="All Platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {PLATFORMS.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
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
                      <p className="text-sm text-muted-foreground capitalize">
                        {platform?.name} • {campaign.objective}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-medium">${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</p>
                      <Progress value={budgetPercent} className="w-24 h-1 mt-1" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Impressions</p>
                      <p className="font-medium">{campaign.impressions.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Clicks</p>
                      <p className="font-medium">{campaign.clicks.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">CTR</p>
                      <p className="font-medium">{campaign.ctr}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">CPC</p>
                      <p className="font-medium">${campaign.cpc}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Conversions</p>
                      <p className="font-medium">{campaign.conversions}</p>
                    </div>
                    <Button variant="ghost" size="icon" data-testid={`button-edit-campaign-${campaign.id}`}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const reportsContent = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Performance Reports</h3>
          <p className="text-sm text-muted-foreground">Unified analytics across all marketing platforms</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="7d">
            <SelectTrigger className="w-[150px]" data-testid="select-date-range">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-export-report">
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Ad Spend</p>
            <p className="text-3xl font-bold text-green-600">${totalSpend.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">+12.5% vs last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Impressions</p>
            <p className="text-3xl font-bold text-blue-600">{(totalImpressions / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground mt-1">+8.3% vs last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Avg. CTR</p>
            <p className="text-3xl font-bold text-purple-600">{avgCTR}%</p>
            <p className="text-xs text-muted-foreground mt-1">+0.5% vs last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Conversions</p>
            <p className="text-3xl font-bold text-orange-600">{totalConversions}</p>
            <p className="text-xs text-muted-foreground mt-1">+15.2% vs last period</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-platform-breakdown">
        <CardHeader>
          <CardTitle>Platform Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MOCK_ACCOUNTS.filter(a => a.status === "connected").map(account => {
              const platform = getPlatformInfo(account.providerId);
              const PlatformIcon = platform.icon;
              const ctr = account.impressions > 0 ? ((account.clicks / account.impressions) * 100).toFixed(2) : "0";
              const cpc = account.clicks > 0 ? (account.spend / account.clicks).toFixed(2) : "0";
              const cpa = account.conversions > 0 ? (account.spend / account.conversions).toFixed(2) : "0";
              
              return (
                <div 
                  key={account.id} 
                  className="flex items-center justify-between p-4 rounded-lg border"
                  data-testid={`report-platform-${account.id}`}
                >
                  <div className="flex items-center gap-4">
                    <PlatformIcon className={`h-8 w-8 ${platform.color}`} />
                    <div>
                      <p className="font-semibold">{platform.name}</p>
                      <p className="text-sm text-muted-foreground">{account.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-8 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Spend</p>
                      <p className="font-medium">${account.spend.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Impressions</p>
                      <p className="font-medium">{(account.impressions / 1000).toFixed(1)}K</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clicks</p>
                      <p className="font-medium">{account.clicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CTR</p>
                      <p className="font-medium">{ctr}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CPC</p>
                      <p className="font-medium">${cpc}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Conversions</p>
                      <p className="font-medium">{account.conversions}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-campaign-performance">
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_CAMPAIGNS.filter(c => c.status === "active" || c.status === "paused").map(campaign => {
              const account = MOCK_ACCOUNTS.find(a => a.id === campaign.accountId);
              const platform = account ? getPlatformInfo(account.providerId) : null;
              const roas = campaign.conversions > 0 ? ((campaign.conversions * 50) / campaign.spent).toFixed(2) : "0";
              
              return (
                <div 
                  key={campaign.id} 
                  className="flex items-center justify-between p-3 rounded-lg border"
                  data-testid={`report-campaign-${campaign.id}`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusBadge(campaign.status)}
                    <div>
                      <p className="font-medium text-sm">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground">{platform?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-muted-foreground">Spend</p>
                      <p className="font-medium">${campaign.spent.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">CTR</p>
                      <p className="font-medium">{campaign.ctr}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Conv.</p>
                      <p className="font-medium">{campaign.conversions}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">ROAS</p>
                      <p className="font-medium">{roas}x</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <TabsPageLayout
        title="Marketing Platform Hub"
        description="Unified management for all your advertising platforms"
        icon={LayoutDashboard}
        tabs={[
          { id: "overview", label: "Overview", icon: LayoutDashboard, content: overviewContent },
          { id: "accounts", label: "Accounts", icon: LinkIcon, content: accountsContent },
          { id: "campaigns", label: "Campaigns", icon: BarChart3, content: campaignsContent },
          { id: "reports", label: "Reports", icon: TrendingUp, content: reportsContent },
        ]}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
        actions={
          <Button variant="outline" data-testid="button-sync-all">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync All
          </Button>
        }
      />

      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Connect Advertising Platform</DialogTitle>
            <DialogDescription>
              Choose a platform to connect and start managing your ads
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {PLATFORMS.map(platform => {
              const PlatformIcon = platform.icon;
              const isConnected = MOCK_ACCOUNTS.some(a => a.providerId === platform.id);
              
              return (
                <Button
                  key={platform.id}
                  variant={selectedPlatform === platform.id ? "default" : "outline"}
                  className="h-20 flex-col gap-2"
                  onClick={() => setSelectedPlatform(platform.id)}
                  disabled={isConnected}
                  data-testid={`button-select-${platform.id}`}
                >
                  <PlatformIcon className={`h-6 w-6 ${isConnected ? "" : platform.color}`} />
                  <span className="text-sm">{platform.name}</span>
                  {isConnected && <span className="text-xs text-muted-foreground">Connected</span>}
                </Button>
              );
            })}
          </div>
          {selectedPlatform && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Name</label>
                <Input placeholder="Enter account name" data-testid="input-account-name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key / Account ID</label>
                <Input placeholder="Enter your API key or account ID" data-testid="input-api-key" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Budget</label>
                <Input type="number" placeholder="5000" data-testid="input-budget" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              disabled={!selectedPlatform}
              onClick={() => setIsConnectDialogOpen(false)}
              data-testid="button-confirm-connect"
            >
              Connect Platform
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
