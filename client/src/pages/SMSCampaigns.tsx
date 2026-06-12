import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TabsPageLayout } from "@/components/layouts";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  MessageSquare,
  Send,
  LayoutDashboard,
  FileText,
  BarChart3,
  Plus,
  Pause,
  Eye,
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone,
  Target,
  Zap,
  Mail,
  MousePointerClick,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────

interface SMSCampaign {
  id: string;
  name: string;
  templateName: string;
  audienceFilter: string;
  audienceSize: number;
  sentCount: number;
  deliveredCount: number;
  clickedCount: number;
  failedCount: number;
  status: string;
  deliveryRate: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  totalCost: number;
}

interface SMSTemplate {
  id: string;
  name: string;
  category: string;
  body: string;
  variables: string[];
  charCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SMSStats {
  totalSent: number;
  totalDelivered: number;
  totalClicked: number;
  totalFailed: number;
  totalOptOuts: number;
  totalCost: number;
  deliveryRate: number;
  clickRate: number;
  optOutRate: number;
  costPerMessage: number;
  totalCampaigns: number;
  activeCampaigns: number;
  deliveryTrend: { month: string; sent: number; delivered: number; rate: number }[];
  bestCampaigns: { id: string; name: string; deliveryRate: number; clickRate: number; sentCount: number }[];
  audienceSegmentation: { segment: string; size: number; campaigns: number }[];
}

// ─── Campaigns Tab ──────────────────────────────────────────────────

function CampaignsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data } = useQuery<{ campaigns: SMSCampaign[] }>({
    queryKey: ["/api/sms/campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/sms/campaigns");
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      return res.json();
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sms/campaigns/${id}/send`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to send campaign");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Campaign Sent", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/sms/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sms/stats"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send campaign", variant: "destructive" });
    },
  });

  const campaigns = data?.campaigns ?? [];

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "outline", label: "Draft" },
      scheduled: { variant: "secondary", label: "Scheduled" },
      sending: { variant: "default", label: "Sending" },
      sent: { variant: "default", label: "Sent" },
      paused: { variant: "destructive", label: "Paused" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const s = map[status] || { variant: "outline" as const, label: status };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">All Campaigns</CardTitle>
          <CardDescription>Manage and track your SMS campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                  <th className="text-left py-3 px-4 font-medium text-[#64748B]">Campaign</th>
                  <th className="text-left py-3 px-4 font-medium text-[#64748B]">Audience</th>
                  <th className="text-left py-3 px-4 font-medium text-[#64748B]">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-[#64748B]">Sent</th>
                  <th className="text-right py-3 px-4 font-medium text-[#64748B]">Delivered</th>
                  <th className="text-right py-3 px-4 font-medium text-[#64748B]">Delivery Rate</th>
                  <th className="text-right py-3 px-4 font-medium text-[#64748B]">Clicked</th>
                  <th className="text-right py-3 px-4 font-medium text-[#64748B]">Cost</th>
                  <th className="text-right py-3 px-4 font-medium text-[#64748B]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#1A2030]">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-[#0B1F3B] dark:text-white">{c.name}</p>
                        <p className="text-xs text-[#64748B]">{c.templateName}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-[#64748B]" />
                        <span className="text-[#0B1F3B] dark:text-white">{c.audienceSize.toLocaleString()}</span>
                        <span className="text-xs text-[#64748B] capitalize">({c.audienceFilter})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{statusBadge(c.status)}</td>
                    <td className="py-3 px-4 text-right text-[#0B1F3B] dark:text-white">{c.sentCount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-[#0B1F3B] dark:text-white">{c.deliveredCount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={c.deliveryRate >= 95 ? "text-green-600" : c.deliveryRate >= 90 ? "text-yellow-600" : "text-red-600"}>
                        {c.deliveryRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#0B1F3B] dark:text-white">{c.clickedCount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-[#0B1F3B] dark:text-white">SAR {c.totalCost.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(c.status === "draft" || c.status === "scheduled") && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => sendMutation.mutate(c.id)}
                            disabled={sendMutation.isPending}
                            className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                          >
                            <Send className="h-3.5 w-3.5 mr-1" />
                            Send
                          </Button>
                        )}
                        {c.status === "sending" && (
                          <Button size="sm" variant="outline">
                            <Pause className="h-3.5 w-3.5 mr-1" />
                            Pause
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {campaigns.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#64748B]">
                      No campaigns yet. Create your first campaign!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Create Campaign Tab ────────────────────────────────────────────

function CreateCampaignTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const { data: templatesData } = useQuery<{ templates: SMSTemplate[] }>({
    queryKey: ["/api/sms/templates"],
    queryFn: async () => {
      const res = await fetch("/api/sms/templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });

  const templates = templatesData?.templates ?? [];
  const selectedTemplate = templates.find((t) => t.id === templateId);

  const audienceSizes: Record<string, number> = {
    all: 3200,
    recent: 620,
    inactive: 1100,
    vip: 380,
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const scheduledAt = scheduleDate && scheduleTime ? `${scheduleDate}T${scheduleTime}:00Z` : null;
      const res = await fetch("/api/sms/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, templateId, audienceFilter, scheduledAt }),
      });
      if (!res.ok) throw new Error("Failed to create campaign");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Campaign Created", description: "Your SMS campaign has been created successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/sms/campaigns"] });
      setName("");
      setTemplateId("");
      setAudienceFilter("");
      setScheduleDate("");
      setScheduleTime("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create campaign", variant: "destructive" });
    },
  });

  const messagePreview = selectedTemplate?.body ?? "Select a template to preview the message";
  const charCount = selectedTemplate?.charCount ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#0A5ED7]" />
            Campaign Details
          </CardTitle>
          <CardDescription>Configure your SMS campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Campaign Name</Label>
            <Input
              placeholder="e.g., March Service Reminder"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>SMS Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.category.replace(/_/g, " ")})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Audience Filter</Label>
            <Select value={audienceFilter} onValueChange={setAudienceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers (3,200)</SelectItem>
                <SelectItem value="recent">Recent Customers (620)</SelectItem>
                <SelectItem value="inactive">Inactive Customers (1,100)</SelectItem>
                <SelectItem value="vip">VIP Customers (380)</SelectItem>
              </SelectContent>
            </Select>
            {audienceFilter && (
              <p className="text-xs text-[#64748B] flex items-center gap-1">
                <Users className="h-3 w-3" />
                {audienceSizes[audienceFilter]?.toLocaleString()} recipients | Est. cost: SAR{" "}
                {((audienceSizes[audienceFilter] || 0) * 0.12).toFixed(2)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Schedule Date (optional)</Label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Schedule Time</Label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={() => createMutation.mutate()}
            disabled={!name || !templateId || !audienceFilter || createMutation.isPending}
            className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {createMutation.isPending ? "Creating..." : "Create Campaign"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-[#0A5ED7]" />
            Message Preview
          </CardTitle>
          <CardDescription>Preview how your SMS will appear</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-[#F1F5F9] dark:bg-[#0B1425] rounded-2xl p-6 mb-4">
            <div className="bg-white dark:bg-[#1A2030] rounded-xl p-4 shadow-sm max-w-xs mx-auto">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E2E8F0] dark:border-[#232A36]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#0B1F3B] dark:text-white">SLIS Garage</p>
                  <p className="text-[10px] text-[#64748B]">SMS</p>
                </div>
              </div>
              <p className="text-sm text-[#0B1F3B] dark:text-white leading-relaxed">{messagePreview}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#64748B] flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {charCount} characters
            </span>
            <span className={`font-medium ${charCount > 160 ? "text-yellow-600" : "text-green-600"}`}>
              {charCount > 160
                ? `${Math.ceil(charCount / 153)} SMS segments`
                : "1 SMS segment"}
            </span>
          </div>
          {selectedTemplate && (
            <div className="mt-4 p-3 rounded-lg bg-[#F1F5F9] dark:bg-[#0B1425]">
              <p className="text-xs font-medium text-[#64748B] mb-1">Variables:</p>
              <div className="flex flex-wrap gap-1">
                {selectedTemplate.variables.map((v) => (
                  <Badge key={v} variant="outline" className="text-xs">
                    {`{{${v}}}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Templates Tab ──────────────────────────────────────────────────

function TemplatesTab() {
  const { data } = useQuery<{ templates: SMSTemplate[] }>({
    queryKey: ["/api/sms/templates"],
    queryFn: async () => {
      const res = await fetch("/api/sms/templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });

  const templates = data?.templates ?? [];

  const categoryConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Mail }> = {
    service_reminder: { label: "Service Reminder", color: "text-[#0A5ED7]", bg: "bg-[#0A5ED7]/10", icon: Clock },
    promo: { label: "Promotion", color: "text-[#F97316]", bg: "bg-[#F97316]/10", icon: Zap },
    feedback_request: { label: "Feedback Request", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", icon: MessageSquare },
    appointment_confirm: { label: "Appointment Confirm", color: "text-[#10B981]", bg: "bg-[#10B981]/10", icon: CheckCircle },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => {
          const cat = categoryConfig[template.category] || {
            label: template.category,
            color: "text-[#64748B]",
            bg: "bg-[#64748B]/10",
            icon: FileText,
          };
          const CatIcon = cat.icon;

          return (
            <Card
              key={template.id}
              className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${cat.bg}`}>
                      <CatIcon className={`h-5 w-5 ${cat.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base text-[#0B1F3B] dark:text-white">
                        {template.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {cat.label}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-[#F8FAFC] dark:bg-[#0B1425] rounded-lg p-3 mb-3">
                  <p className="text-sm text-[#0B1F3B] dark:text-[#CBD5E1] leading-relaxed">
                    {template.body}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {template.charCount} chars
                    {template.charCount > 160 && (
                      <span className="text-yellow-600 ml-1">
                        ({Math.ceil(template.charCount / 153)} segments)
                      </span>
                    )}
                  </span>
                  <span>{template.variables.length} variables</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Analytics Tab ──────────────────────────────────────────────────

const CHART_COLORS = ["#0A5ED7", "#0BB3FF", "#10B981", "#F97316", "#8B5CF6"];

function AnalyticsTab() {
  const { data } = useQuery<{ stats: SMSStats }>({
    queryKey: ["/api/sms/stats"],
    queryFn: async () => {
      const res = await fetch("/api/sms/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const stats = data?.stats;

  const statCards = [
    {
      label: "Total Sent",
      value: stats?.totalSent?.toLocaleString() ?? "0",
      icon: Send,
      color: "text-[#0A5ED7]",
      bg: "bg-[#0A5ED7]/10",
    },
    {
      label: "Delivery Rate",
      value: `${stats?.deliveryRate ?? 0}%`,
      icon: CheckCircle,
      color: "text-[#10B981]",
      bg: "bg-[#10B981]/10",
    },
    {
      label: "Total Cost",
      value: `SAR ${stats?.totalCost?.toFixed(2) ?? "0.00"}`,
      icon: DollarSign,
      color: "text-[#F97316]",
      bg: "bg-[#F97316]/10",
    },
    {
      label: "Opt-Out Rate",
      value: `${stats?.optOutRate ?? 0}%`,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Click Rate",
      value: `${stats?.clickRate ?? 0}%`,
      icon: MousePointerClick,
      color: "text-[#8B5CF6]",
      bg: "bg-[#8B5CF6]/10",
    },
    {
      label: "Cost Per Message",
      value: `SAR ${stats?.costPerMessage?.toFixed(2) ?? "0.00"}`,
      icon: Target,
      color: "text-[#0BB3FF]",
      bg: "bg-[#0BB3FF]/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.label}
              className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${card.bg}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </div>
                <p className="text-xs text-[#64748B]">{card.label}</p>
                <p className="text-lg font-bold text-[#0B1F3B] dark:text-white">{card.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Rate Trend */}
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#0A5ED7]" />
              Delivery Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats?.deliveryTrend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[88, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Delivery Rate %"
                  stroke="#0A5ED7"
                  strokeWidth={2}
                  dot={{ fill: "#0A5ED7", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Audience Segmentation */}
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#0BB3FF]" />
              Audience Segmentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats?.audienceSegmentation ?? []}
                  dataKey="size"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ segment, size }) => `${segment}: ${size}`}
                >
                  {(stats?.audienceSegmentation ?? []).map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sent vs Delivered Bar Chart */}
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#10B981]" />
              Monthly Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats?.deliveryTrend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" name="Sent" fill="#0A5ED7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivered" name="Delivered" fill="#0BB3FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Best Performing Campaigns */}
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#F97316]" />
              Best Performing Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.bestCampaigns ?? []).map((campaign, idx) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1425]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center text-white text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                        {campaign.name}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {campaign.sentCount.toLocaleString()} sent
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{campaign.clickRate}% click</p>
                    <p className="text-xs text-[#64748B]">{campaign.deliveryRate}% delivered</p>
                  </div>
                </div>
              ))}
              {(stats?.bestCampaigns ?? []).length === 0 && (
                <p className="text-center text-[#64748B] py-4">No campaign data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export default function SMSCampaigns() {
  const [activeTab, setActiveTab] = useState("campaigns");

  return (
    <TabsPageLayout
      title="SMS Campaign Management"
      description="Create, manage, and analyze SMS marketing campaigns"
      icon={Smartphone}
      tabs={[
        {
          id: "campaigns",
          label: "Campaigns",
          icon: LayoutDashboard,
          content: <CampaignsTab />,
        },
        {
          id: "create",
          label: "Create Campaign",
          icon: Plus,
          content: <CreateCampaignTab />,
        },
        {
          id: "templates",
          label: "Templates",
          icon: FileText,
          content: <TemplatesTab />,
        },
        {
          id: "analytics",
          label: "Analytics",
          icon: BarChart3,
          content: <AnalyticsTab />,
        },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
