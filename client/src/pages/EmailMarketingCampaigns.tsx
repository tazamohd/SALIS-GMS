import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardPage } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Send, Users, Eye, MousePointer, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EmailMarketingCampaigns() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: campaigns = [] } = useQuery({
    queryKey: ["/api/email/campaigns"],
  });

  const createCampaign = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/email/campaigns", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Campaign created", description: "Your email campaign has been created successfully." });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/email/campaigns"] });
    },
  });

  const sendCampaign = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/email/campaigns/${id}/send`, "POST", {});
    },
    onSuccess: () => {
      toast({ title: "Campaign sent", description: "Your email campaign is being sent." });
      queryClient.invalidateQueries({ queryKey: ["/api/email/campaigns"] });
    },
  });

  const mockCampaigns = [
    {
      id: "1",
      name: "Winter Service Special",
      subject: "Get 20% Off Winter Maintenance",
      status: "sent",
      totalRecipients: 1284,
      emailsSent: 1284,
      emailsOpened: 512,
      clickThroughs: 156,
      createdAt: "2024-10-20T10:00:00Z",
      sentAt: "2024-10-21T09:00:00Z",
    },
    {
      id: "2",
      name: "Service Reminder - Oil Change Due",
      subject: "Your Vehicle is Due for Service",
      status: "scheduled",
      totalRecipients: 342,
      scheduledAt: "2024-10-28T08:00:00Z",
      createdAt: "2024-10-25T14:30:00Z",
    },
    {
      id: "3",
      name: "New Customer Welcome Series",
      subject: "Welcome to SALIS AUTO",
      status: "draft",
      targetAudience: "new_customers",
      createdAt: "2024-10-26T11:00:00Z",
    },
  ];

  const stats = {
    totalCampaigns: 15,
    sentThisMonth: 8,
    averageOpenRate: 39.9,
    averageClickRate: 12.1,
    totalSubscribers: 1842,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: "secondary",
      scheduled: "default",
      sending: "default",
      sent: "default",
      failed: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const metrics = [
    { label: "Total Campaigns", value: stats.totalCampaigns, icon: Mail, color: "text-blue-600" },
    { label: "Sent This Month", value: stats.sentThisMonth, icon: Send, color: "text-green-600" },
    { label: "Avg Open Rate", value: `${stats.averageOpenRate}%`, icon: Eye, color: "text-purple-600" },
    { label: "Avg Click Rate", value: `${stats.averageClickRate}%`, icon: MousePointer, color: "text-orange-600" },
  ];

  return (
    <DashboardPage
      title="📧 Email Marketing"
      description="Create and manage automated email campaigns"
      icon={Mail}
      metrics={metrics}
    >
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button data-testid="button-create-campaign" className="mb-6">
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Email Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Campaign Name</label>
              <Input placeholder="e.g., Spring Promotion" className="mt-1" data-testid="input-campaign-name" />
            </div>
            <div>
              <label className="text-sm font-medium">Subject Line</label>
              <Input placeholder="e.g., Get 20% Off All Services" className="mt-1" data-testid="input-subject" />
            </div>
            <div>
              <label className="text-sm font-medium">Target Audience</label>
              <Select>
                <SelectTrigger className="mt-1" data-testid="select-audience">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="new_customers">New Customers</SelectItem>
                  <SelectItem value="inactive">Inactive Customers</SelectItem>
                  <SelectItem value="vip">VIP Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Write your email content..."
                className="mt-1 h-32"
                data-testid="textarea-message"
              />
            </div>
            <Button className="w-full" onClick={() => {
              createCampaign.mutate({
                name: "New Campaign",
                subject: "Test Subject",
                targetAudience: "all"
              });
            }} data-testid="button-save-campaign">
              Create Campaign
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                data-testid={`campaign-${campaign.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{campaign.name}</h3>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{campaign.subject}</p>
                  {campaign.status === "sent" && (
                    <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Sent: {campaign.emailsSent}</span>
                      <span>Opened: {campaign.emailsOpened} ({((campaign.emailsOpened! / campaign.emailsSent!) * 100).toFixed(1)}%)</span>
                      <span>Clicks: {campaign.clickThroughs}</span>
                    </div>
                  )}
                  {campaign.status === "scheduled" && (
                    <p className="text-sm text-blue-600 mt-1">
                      Scheduled for: {new Date(campaign.scheduledAt!).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {campaign.status === "draft" && (
                    <Button size="sm" onClick={() => sendCampaign.mutate(campaign.id)} data-testid={`button-send-${campaign.id}`}>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  )}
                  <Button size="sm" variant="outline" data-testid={`button-view-${campaign.id}`}>
                    View Stats
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
