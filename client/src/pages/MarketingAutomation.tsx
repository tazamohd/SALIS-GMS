// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Users, BarChart3, Calendar, TrendingUp, Eye, MousePointer } from "lucide-react";
import { TabsPageLayout } from "@/components/layouts";

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  campaignType: z.enum(["email", "sms"]),
  subject: z.string().optional(),
  messageContent: z.string().min(1, "Message content is required"),
  status: z.enum(["draft", "scheduled", "sending", "sent", "paused", "completed", "cancelled"]),
  scheduledFor: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

export default function MarketingAutomation() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("campaigns");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/marketing-campaigns", statusFilter, typeFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("campaignType", typeFilter);
      return fetch(`/api/marketing-campaigns?${params}`).then(r => r.json());
    }
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/marketing-campaigns", selectedCampaign?.id, "analytics"],
    queryFn: () => fetch(`/api/marketing-campaigns/${selectedCampaign.id}/analytics`).then(r => r.json()),
    enabled: !!selectedCampaign?.id
  });

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      campaignType: "email",
      subject: "",
      messageContent: "",
      status: "draft",
      scheduledFor: "",
    }
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data: CampaignFormData) => apiRequest("POST", "/api/marketing-campaigns", {
      ...data,
      totalRecipients: 0,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      unsubscribedCount: 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-campaigns"] });
      toast({ title: t('common.success', 'Success'), description: t('marketing.campaignCreated', 'Campaign created successfully') });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('marketing.campaignCreateError', 'Failed to create campaign'), variant: "destructive" });
    }
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiRequest("PATCH", `/api/marketing-campaigns/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-campaigns"] });
      toast({ title: t('common.success', 'Success'), description: t('marketing.campaignUpdated', 'Campaign updated successfully') });
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/marketing-campaigns/${id}`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-campaigns"] });
      toast({ title: t('common.success', 'Success'), description: t('marketing.campaignDeleted', 'Campaign deleted successfully') });
    }
  });

  const onSubmit = (data: CampaignFormData) => {
    createCampaignMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-[#64748B] text-white",
      scheduled: "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white",
      sending: "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white",
      sent: "bg-green-600 text-white",
      completed: "bg-green-600 text-white",
      paused: "bg-[#F97316] text-white",
      cancelled: "bg-[#64748B] text-white",
    };
    return colors[status] || "bg-[#64748B] text-white";
  };

  const getCampaignTypeIcon = (type: string) => {
    return type === "email" ? <Mail className="h-4 w-4" /> : <Send className="h-4 w-4" />;
  };

  const campaignsContent = (
    <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('marketing.campaignManagement', 'Campaign Management')}</CardTitle>
        <CardDescription className="text-[#64748B]">
          {t('marketing.campaignManagementDesc', 'Create and manage marketing campaigns')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-status-filter">
              <SelectValue placeholder={t('marketing.filterByStatus', 'Filter by status')} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <SelectItem value="">{t('marketing.allStatuses', 'All Statuses')}</SelectItem>
              <SelectItem value="draft">{t('common.draft', 'Draft')}</SelectItem>
              <SelectItem value="scheduled">{t('marketing.scheduled', 'Scheduled')}</SelectItem>
              <SelectItem value="sending">{t('marketing.sending', 'Sending')}</SelectItem>
              <SelectItem value="sent">{t('marketing.sent', 'Sent')}</SelectItem>
              <SelectItem value="completed">{t('common.completed', 'Completed')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-type-filter">
              <SelectValue placeholder={t('marketing.filterByType', 'Filter by type')} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <SelectItem value="">{t('marketing.allTypes', 'All Types')}</SelectItem>
              <SelectItem value="email">{t('marketing.email', 'Email')}</SelectItem>
              <SelectItem value="sms">{t('marketing.sms', 'SMS')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {campaignsLoading ? (
          <p className="text-[#64748B]" data-testid="text-loading">{t('common.loading', 'Loading...')}</p>
        ) : campaigns.length === 0 ? (
          <p className="text-[#64748B]" data-testid="text-no-campaigns">{t('marketing.noCampaigns', 'No campaigns found')}</p>
        ) : (
          <div className="grid gap-4">
            {campaigns.map((campaign: any) => (
              <Card 
                key={campaign.id} 
                className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23] cursor-pointer hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors"
                onClick={() => setSelectedCampaign(campaign)}
                data-testid={`card-campaign-${campaign.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getCampaignTypeIcon(campaign.campaignType)}
                        <h3 className="text-lg font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-campaign-name-${campaign.id}`}>
                          {campaign.name}
                        </h3>
                        <Badge className={getStatusColor(campaign.status)} data-testid={`badge-status-${campaign.id}`}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#64748B] mb-3" data-testid={`text-campaign-subject-${campaign.id}`}>
                        {campaign.subject || t('marketing.noSubject', 'No subject')}
                      </p>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-[#64748B]">{t('marketing.recipients', 'Recipients')}</p>
                          <p className="font-semibold text-[#0B1F3B] dark:text-white" data-testid={`text-recipients-${campaign.id}`}>
                            {campaign.totalRecipients ?? 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#64748B]">{t('marketing.sent', 'Sent')}</p>
                          <p className="font-semibold text-[#0B1F3B] dark:text-white" data-testid={`text-sent-${campaign.id}`}>
                            {campaign.sentCount ?? 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#64748B]">{t('marketing.delivered', 'Delivered')}</p>
                          <p className="font-semibold text-[#0B1F3B] dark:text-white" data-testid={`text-delivered-${campaign.id}`}>
                            {campaign.deliveredCount ?? 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#64748B]">{t('marketing.opened', 'Opened')}</p>
                          <p className="font-semibold text-[#0B1F3B] dark:text-white" data-testid={`text-opened-${campaign.id}`}>
                            {campaign.openedCount ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {campaign.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCampaignMutation.mutate({ id: campaign.id, status: "scheduled" });
                          }}
                          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#09a3e8] text-white"
                          data-testid={`button-schedule-${campaign.id}`}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(t('marketing.confirmDeleteCampaign', 'Delete this campaign?'))) {
                            deleteCampaignMutation.mutate(campaign.id);
                          }
                        }}
                        className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
                        data-testid={`button-delete-${campaign.id}`}
                      >
                        {t('common.delete', 'Delete')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const analyticsContent = (
    <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('marketing.campaignAnalytics', 'Campaign Analytics')}</CardTitle>
        <CardDescription className="text-[#64748B]">
          {selectedCampaign ? t('marketing.analyticsFor', 'Analytics for: {{name}}', { name: selectedCampaign.name }) : t('marketing.selectCampaignForAnalytics', 'Select a campaign to view analytics')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!selectedCampaign ? (
          <p className="text-[#64748B] text-center py-8" data-testid="text-no-campaign-selected">
            {t('marketing.clickCampaignForAnalytics', 'Click on a campaign from the Campaigns tab to view its analytics')}
          </p>
        ) : analytics ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]" data-testid="card-total-recipients">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-[#0A5ED7]" />
                    <div>
                      <p className="text-sm text-[#64748B]">{t('marketing.totalRecipients', 'Total Recipients')}</p>
                      <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-total-recipients">
                        {analytics.totalRecipients}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]" data-testid="card-delivery-rate">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-[#0BB3FF]" />
                    <div>
                      <p className="text-sm text-[#64748B]">{t('marketing.deliveryRate', 'Delivery Rate')}</p>
                      <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-delivery-rate">
                        {analytics.deliveryRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]" data-testid="card-open-rate">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Eye className="h-8 w-8 text-[#0A5ED7]" />
                    <div>
                      <p className="text-sm text-[#64748B]">{t('marketing.openRate', 'Open Rate')}</p>
                      <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-open-rate">
                        {analytics.openRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]" data-testid="card-click-rate">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <MousePointer className="h-8 w-8 text-[#0BB3FF]" />
                    <div>
                      <p className="text-sm text-[#64748B]">{t('marketing.clickRate', 'Click Rate')}</p>
                      <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-click-rate">
                        {analytics.clickRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                <p className="text-sm text-[#64748B] mb-2">{t('marketing.sent', 'Sent')}</p>
                <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-analytics-sent">
                  {analytics.sentCount}
                </p>
              </div>
              <div className="text-center p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                <p className="text-sm text-[#64748B] mb-2">{t('marketing.delivered', 'Delivered')}</p>
                <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-analytics-delivered">
                  {analytics.deliveredCount}
                </p>
              </div>
              <div className="text-center p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                <p className="text-sm text-[#64748B] mb-2">{t('marketing.opened', 'Opened')}</p>
                <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-analytics-opened">
                  {analytics.openedCount}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[#64748B]" data-testid="text-loading-analytics">{t('marketing.loadingAnalytics', 'Loading analytics...')}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <TabsPageLayout
        title={t('nav.marketing_automation', 'Marketing Automation')}
        description={t('marketing.pageDescription', 'Manage email and SMS campaigns, track analytics, and engage customers')}
        icon={Mail}
        tabs={[
          {
            id: "campaigns",
            label: t('marketing.campaigns', 'Campaigns'),
            icon: Mail,
            content: campaignsContent,
          },
          {
            id: "analytics",
            label: t('marketing.analytics', 'Analytics'),
            icon: BarChart3,
            content: analyticsContent,
          },
        ]}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
        actions={
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#09a3e8] text-white"
            data-testid="button-create-campaign"
          >
            <Mail className="mr-2 h-4 w-4" />
            {t('marketing.createCampaign', 'Create Campaign')}
          </Button>
        }
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('marketing.createMarketingCampaign', 'Create Marketing Campaign')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">
              {t('marketing.createCampaignDesc', 'Create a new email or SMS campaign to engage your customers')}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('marketing.campaignName', 'Campaign Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('marketing.campaignNamePlaceholder', 'Summer Sale 2024')} data-testid="input-campaign-name" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="campaignType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('marketing.campaignType', 'Campaign Type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-campaign-type" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectValue placeholder={t('marketing.selectType', 'Select type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                        <SelectItem value="email">{t('marketing.email', 'Email')}</SelectItem>
                        <SelectItem value="sms">{t('marketing.sms', 'SMS')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('marketing.subjectEmailOnly', 'Subject (Email only)')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('marketing.subjectPlaceholder', 'Get 20% off your next service!')} data-testid="input-subject" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="messageContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('marketing.messageContent', 'Message Content')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('marketing.messageContentPlaceholder', 'Enter your campaign message...')} rows={5} data-testid="input-message-content" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectValue placeholder={t('marketing.selectStatus', 'Select status')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                        <SelectItem value="draft">{t('common.draft', 'Draft')}</SelectItem>
                        <SelectItem value="scheduled">{t('marketing.scheduled', 'Scheduled')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledFor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('marketing.scheduledFor', 'Scheduled For')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" data-testid="input-scheduled-for" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={createCampaignMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#09a3e8] text-white" data-testid="button-submit-campaign">
                  {createCampaignMutation.isPending ? t('common.creating', 'Creating...') : t('marketing.createCampaign', 'Create Campaign')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
