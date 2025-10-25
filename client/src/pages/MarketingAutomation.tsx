import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Users, BarChart3, Calendar, TrendingUp, Eye, MousePointer, UserX } from "lucide-react";
import { format } from "date-fns";

// Campaign Form Schema
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
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("campaigns");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  // Fetch campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/marketing-campaigns", statusFilter, typeFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("campaignType", typeFilter);
      return fetch(`/api/marketing-campaigns?${params}`).then(r => r.json());
    }
  });

  // Fetch campaign analytics
  const { data: analytics } = useQuery({
    queryKey: ["/api/marketing-campaigns", selectedCampaign?.id, "analytics"],
    queryFn: () => fetch(`/api/marketing-campaigns/${selectedCampaign.id}/analytics`).then(r => r.json()),
    enabled: !!selectedCampaign?.id
  });

  // Create Campaign Form
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

  // Create Campaign Mutation
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
      toast({ title: "Success", description: "Campaign created successfully" });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create campaign", variant: "destructive" });
    }
  });

  // Update Campaign Status Mutation
  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiRequest("PATCH", `/api/marketing-campaigns/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-campaigns"] });
      toast({ title: "Success", description: "Campaign updated successfully" });
    }
  });

  // Delete Campaign Mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/marketing-campaigns/${id}`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-campaigns"] });
      toast({ title: "Success", description: "Campaign deleted successfully" });
    }
  });

  const onSubmit = (data: CampaignFormData) => {
    createCampaignMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-salis-gray text-white",
      scheduled: "bg-salis-gray-dark text-white",
      sending: "bg-salis-black text-white",
      sent: "bg-salis-gray text-white",
      completed: "bg-salis-black text-white",
      paused: "bg-salis-gray-light text-salis-black",
      cancelled: "bg-salis-gray-light text-salis-black",
    };
    return colors[status] || "bg-salis-gray text-white";
  };

  const getCampaignTypeIcon = (type: string) => {
    return type === "email" ? <Mail className="h-4 w-4" /> : <Send className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto py-6 space-y-6 bg-white dark:bg-[#010101] min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-montserrat font-semibold text-salis-black dark:text-white" data-testid="heading-marketing">
            Marketing Automation
          </h1>
          <p className="text-salis-gray dark:text-salis-gray-light font-poppins mt-1" data-testid="text-subtitle">
            Manage email and SMS campaigns, track analytics, and engage customers
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
          data-testid="button-create-campaign"
        >
          <Mail className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="bg-salis-gray-light dark:bg-salis-gray-dark" data-testid="tabs-marketing">
          <TabsTrigger value="campaigns" className="font-poppins" data-testid="tab-campaigns">
            <Mail className="mr-2 h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="analytics" className="font-poppins" data-testid="tab-analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
            <CardHeader>
              <CardTitle className="font-montserrat text-salis-black dark:text-white">Campaign Management</CardTitle>
              <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
                Create and manage marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]" data-testid="select-status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="sending">Sending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[200px]" data-testid="select-type-filter">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {campaignsLoading ? (
                <p className="text-salis-gray font-poppins" data-testid="text-loading">Loading campaigns...</p>
              ) : campaigns.length === 0 ? (
                <p className="text-salis-gray font-poppins" data-testid="text-no-campaigns">No campaigns found</p>
              ) : (
                <div className="grid gap-4">
                  {campaigns.map((campaign: any) => (
                    <Card 
                      key={campaign.id} 
                      className="border-salis-gray-light dark:border-salis-gray-dark cursor-pointer hover:border-salis-gray dark:hover:border-salis-gray transition-colors"
                      onClick={() => setSelectedCampaign(campaign)}
                      data-testid={`card-campaign-${campaign.id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getCampaignTypeIcon(campaign.campaignType)}
                              <h3 className="text-lg font-montserrat font-medium text-salis-black dark:text-white" data-testid={`text-campaign-name-${campaign.id}`}>
                                {campaign.name}
                              </h3>
                              <Badge className={getStatusColor(campaign.status)} data-testid={`badge-status-${campaign.id}`}>
                                {campaign.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins mb-3" data-testid={`text-campaign-subject-${campaign.id}`}>
                              {campaign.subject || "No subject"}
                            </p>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-salis-gray dark:text-salis-gray-light font-poppins">Recipients</p>
                                <p className="font-semibold text-salis-black dark:text-white" data-testid={`text-recipients-${campaign.id}`}>
                                  {campaign.totalRecipients ?? 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-salis-gray dark:text-salis-gray-light font-poppins">Sent</p>
                                <p className="font-semibold text-salis-black dark:text-white" data-testid={`text-sent-${campaign.id}`}>
                                  {campaign.sentCount ?? 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-salis-gray dark:text-salis-gray-light font-poppins">Delivered</p>
                                <p className="font-semibold text-salis-black dark:text-white" data-testid={`text-delivered-${campaign.id}`}>
                                  {campaign.deliveredCount ?? 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-salis-gray dark:text-salis-gray-light font-poppins">Opened</p>
                                <p className="font-semibold text-salis-black dark:text-white" data-testid={`text-opened-${campaign.id}`}>
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
                                className="bg-salis-black hover:bg-salis-gray-dark text-white"
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
                                if (confirm("Delete this campaign?")) {
                                  deleteCampaignMutation.mutate(campaign.id);
                                }
                              }}
                              className="border-salis-gray-light dark:border-salis-gray-dark"
                              data-testid={`button-delete-${campaign.id}`}
                            >
                              Delete
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
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
            <CardHeader>
              <CardTitle className="font-montserrat text-salis-black dark:text-white">Campaign Analytics</CardTitle>
              <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
                {selectedCampaign ? `Analytics for: ${selectedCampaign.name}` : "Select a campaign to view analytics"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedCampaign ? (
                <p className="text-salis-gray font-poppins text-center py-8" data-testid="text-no-campaign-selected">
                  Click on a campaign from the Campaigns tab to view its analytics
                </p>
              ) : analytics ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-salis-gray-light dark:border-salis-gray-dark" data-testid="card-total-recipients">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Users className="h-8 w-8 text-salis-gray dark:text-salis-gray-light" />
                          <div>
                            <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins">Total Recipients</p>
                            <p className="text-2xl font-bold text-salis-black dark:text-white" data-testid="text-total-recipients">
                              {analytics.totalRecipients}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-salis-gray-light dark:border-salis-gray-dark" data-testid="card-delivery-rate">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-8 w-8 text-salis-gray dark:text-salis-gray-light" />
                          <div>
                            <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins">Delivery Rate</p>
                            <p className="text-2xl font-bold text-salis-black dark:text-white" data-testid="text-delivery-rate">
                              {analytics.deliveryRate}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-salis-gray-light dark:border-salis-gray-dark" data-testid="card-open-rate">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Eye className="h-8 w-8 text-salis-gray dark:text-salis-gray-light" />
                          <div>
                            <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins">Open Rate</p>
                            <p className="text-2xl font-bold text-salis-black dark:text-white" data-testid="text-open-rate">
                              {analytics.openRate}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-salis-gray-light dark:border-salis-gray-dark" data-testid="card-click-rate">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <MousePointer className="h-8 w-8 text-salis-gray dark:text-salis-gray-light" />
                          <div>
                            <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins">Click Rate</p>
                            <p className="text-2xl font-bold text-salis-black dark:text-white" data-testid="text-click-rate">
                              {analytics.clickRate}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border border-salis-gray-light dark:border-salis-gray-dark rounded-lg">
                      <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins mb-2">Sent</p>
                      <p className="text-3xl font-bold text-salis-black dark:text-white" data-testid="text-analytics-sent">
                        {analytics.sentCount}
                      </p>
                    </div>
                    <div className="text-center p-4 border border-salis-gray-light dark:border-salis-gray-dark rounded-lg">
                      <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins mb-2">Delivered</p>
                      <p className="text-3xl font-bold text-salis-black dark:text-white" data-testid="text-analytics-delivered">
                        {analytics.deliveredCount}
                      </p>
                    </div>
                    <div className="text-center p-4 border border-salis-gray-light dark:border-salis-gray-dark rounded-lg">
                      <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins mb-2">Opened</p>
                      <p className="text-3xl font-bold text-salis-black dark:text-white" data-testid="text-analytics-opened">
                        {analytics.openedCount}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-salis-gray font-poppins" data-testid="text-loading-analytics">Loading analytics...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#010101] border-salis-gray-light dark:border-salis-gray-dark">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">Create Marketing Campaign</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              Create a new email or SMS campaign to engage your customers
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white font-poppins">Campaign Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Summer Sale 2024" data-testid="input-campaign-name" className="bg-white dark:bg-[#010101]" />
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
                    <FormLabel className="text-salis-black dark:text-white font-poppins">Campaign Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-campaign-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
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
                    <FormLabel className="text-salis-black dark:text-white font-poppins">Subject (Email only)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Get 20% off your next service!" data-testid="input-subject" className="bg-white dark:bg-[#010101]" />
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
                    <FormLabel className="text-salis-black dark:text-white font-poppins">Message Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter your campaign message..." rows={5} data-testid="input-message-content" className="bg-white dark:bg-[#010101]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-salis-gray-light dark:border-salis-gray-dark"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCampaignMutation.isPending}
                  className="bg-salis-black hover:bg-salis-gray-dark text-white"
                  data-testid="button-submit"
                >
                  {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
