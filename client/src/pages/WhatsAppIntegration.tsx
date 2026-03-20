import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  Settings,
  CheckCircle,
  Eye,
  MessageCircle,
  Users,
  TrendingUp,
  Phone,
  Search,
  AlertTriangle,
  Edit,
  Hash,
  Globe,
  Link as LinkIcon,
  Shield,
  BarChart3,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

// ─── Dashboard Tab ────────────────────────────────────────────────

function DashboardTab() {
  const { t } = useTranslation();

  const { data: statsData } = useQuery<{ stats: any }>({
    queryKey: ["/api/whatsapp/stats"],
    queryFn: async () => {
      const res = await fetch("/api/whatsapp/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const stats = statsData?.stats;
  const dailyVolume = stats?.dailyVolume ?? [];

  const statCards = [
    {
      label: t("whatsapp.sentToday", "Sent Today"),
      value: stats?.sentToday ?? 0,
      icon: Send,
      color: "text-[#25D366]",
      bg: "bg-[#25D366]/10",
    },
    {
      label: t("whatsapp.delivered", "Delivered"),
      value: stats?.deliveredToday ?? 0,
      icon: CheckCircle,
      color: "text-[#0A5ED7]",
      bg: "bg-[#0A5ED7]/10",
    },
    {
      label: t("whatsapp.read", "Read"),
      value: stats?.readToday ?? 0,
      icon: Eye,
      color: "text-[#0BB3FF]",
      bg: "bg-[#0BB3FF]/10",
    },
    {
      label: t("whatsapp.responded", "Responded"),
      value: stats?.respondedToday ?? 0,
      icon: MessageCircle,
      color: "text-[#F97316]",
      bg: "bg-[#F97316]/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.label}
              className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]"
              data-testid={`stat-${card.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${card.bg}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">{card.label}</p>
                    <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
                      {card.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-[#25D366]" />
            <div>
              <p className="text-sm text-[#64748B]">{t("whatsapp.deliveryRate", "Delivery Rate")}</p>
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
                {stats?.deliveryRate ?? 0}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6 flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-[#0A5ED7]" />
            <div>
              <p className="text-sm text-[#64748B]">{t("whatsapp.responseRate", "Response Rate")}</p>
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
                {stats?.responseRate ?? 0}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-[#64748B]">{t("whatsapp.optOuts", "Opt-Outs")}</p>
              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
                {stats?.optOutCount ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <BarChart3 className="h-5 w-5" />
            {t("whatsapp.messageVolume", "Message Volume (7 days)")}
          </CardTitle>
          <CardDescription className="text-[#64748B]">
            {t("whatsapp.messageVolumeDesc", "Daily message volume breakdown")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v: string) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  stroke="#64748B"
                />
                <YAxis stroke="#64748B" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#151A23",
                    border: "1px solid #232A36",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="sent" fill="#25D366" name="Sent" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivered" fill="#0A5ED7" name="Delivered" radius={[4, 4, 0, 0]} />
                <Bar dataKey="read" fill="#0BB3FF" name="Read" radius={[4, 4, 0, 0]} />
                <Bar dataKey="responded" fill="#F97316" name="Responded" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Templates Tab ────────────────────────────────────────────────

function TemplatesTab() {
  const { t } = useTranslation();

  const { data: templatesData } = useQuery<{ templates: any[] }>({
    queryKey: ["/api/whatsapp/templates"],
    queryFn: async () => {
      const res = await fetch("/api/whatsapp/templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });

  const templates = templatesData?.templates ?? [];

  const categoryLabels: Record<string, string> = {
    appointment_reminder: "Appointment Reminder",
    job_update: "Job Update",
    invoice: "Invoice",
    review_request: "Review Request",
  };

  const categoryColors: Record<string, string> = {
    appointment_reminder: "bg-[#0A5ED7]/10 text-[#0A5ED7]",
    job_update: "bg-[#25D366]/10 text-[#25D366]",
    invoice: "bg-[#F97316]/10 text-[#F97316]",
    review_request: "bg-purple-500/10 text-purple-500",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">
            {t("whatsapp.messageTemplates", "Message Templates")}
          </h3>
          <p className="text-sm text-[#64748B]">
            {t("whatsapp.templatesDesc", "Pre-approved WhatsApp Business API templates")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((tpl: any) => (
          <Card
            key={tpl.id}
            className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]"
            data-testid={`template-${tpl.id}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <SiWhatsapp className="h-5 w-5 text-[#25D366]" />
                  <CardTitle className="text-base text-[#0B1F3B] dark:text-white">
                    {tpl.name}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#64748B] hover:text-[#0B1F3B] dark:hover:text-white"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={categoryColors[tpl.category] || "bg-gray-100 text-gray-600"}>
                  {categoryLabels[tpl.category] || tpl.category}
                </Badge>
                <Badge className="bg-green-600/10 text-green-600">{tpl.status}</Badge>
                {tpl.language && (
                  <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">
                    {tpl.language.toUpperCase()}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg p-3 mb-3">
                <p className="text-sm text-[#0B1F3B] dark:text-gray-300 whitespace-pre-wrap">
                  {tpl.previewText}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-[#64748B]">
                  <Hash className="h-3.5 w-3.5" />
                  <span>
                    {tpl.variables?.length ?? 0} {t("whatsapp.variables", "variables")}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#64748B]">
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {tpl.sendCount.toLocaleString()} {t("whatsapp.sent", "sent")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Conversations Tab ────────────────────────────────────────────

function ConversationsTab() {
  const { t } = useTranslation();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

  const { data: convData } = useQuery<{ conversations: any[] }>({
    queryKey: ["/api/whatsapp/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/whatsapp/conversations");
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
  });

  const convs = convData?.conversations ?? [];
  const selectedConv = convs.find((c: any) => c.id === selectedConvId) || convs[0];

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="grid gap-4 md:grid-cols-3" style={{ minHeight: 500 }}>
      {/* Conversation list */}
      <div className="md:col-span-1">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] h-full">
          <CardHeader className="py-3 border-b border-[#E2E8F0] dark:border-[#232A36]">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[#64748B]" />
              <Input
                placeholder={t("whatsapp.searchConversations", "Search conversations...")}
                className="h-8 bg-transparent border-none focus-visible:ring-0 p-0 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#E2E8F0] dark:divide-[#232A36]">
              {convs.map((conv: any) => (
                <div
                  key={conv.id}
                  className={`p-3 cursor-pointer transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] ${
                    (selectedConv?.id === conv.id)
                      ? "bg-[#F8FAFC] dark:bg-[#0E1117] border-l-2 border-l-[#25D366]"
                      : ""
                  }`}
                  onClick={() => setSelectedConvId(conv.id)}
                  data-testid={`conv-item-${conv.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#25D366]" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate text-[#0B1F3B] dark:text-white">
                          {conv.customerName}
                        </p>
                        <span className="text-xs text-[#64748B] flex-shrink-0">
                          {formatTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] truncate mt-0.5">
                        {conv.direction === "outbound" ? "You: " : ""}
                        {conv.lastMessage}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#64748B]">{conv.customerPhone}</span>
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-[#25D366] text-white text-xs px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat view */}
      <div className="md:col-span-2">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] h-full flex flex-col">
          {selectedConv ? (
            <>
              <CardHeader className="py-3 border-b border-[#E2E8F0] dark:border-[#232A36]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#0B1F3B] dark:text-white">
                      {selectedConv.customerName}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {selectedConv.customerPhone}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-3">
                  {selectedConv.messages?.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] p-3 rounded-lg ${
                          msg.direction === "outbound"
                            ? "bg-[#25D366] text-white"
                            : "bg-[#F8FAFC] dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <p className="text-xs opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {msg.direction === "outbound" && (
                            <span className="text-xs opacity-70">
                              {msg.status === "read"
                                ? "Read"
                                : msg.status === "delivered"
                                ? "Delivered"
                                : "Sent"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <div className="p-3 border-t border-[#E2E8F0] dark:border-[#232A36]">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    className="flex-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  />
                  <Button className="bg-[#25D366] hover:bg-[#20BD5A] text-white">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-[#64748B]">
                <SiWhatsapp className="h-12 w-12 mx-auto mb-3 text-[#25D366] opacity-50" />
                <p>{t("whatsapp.selectConversation", "Select a conversation to view messages")}</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── Send Message Tab ─────────────────────────────────────────────

function SendMessageTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const { data: templatesData } = useQuery<{ templates: any[] }>({
    queryKey: ["/api/whatsapp/templates"],
    queryFn: async () => {
      const res = await fetch("/api/whatsapp/templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });

  const templates = templatesData?.templates ?? [];
  const selectedTemplate = templates.find((tpl: any) => tpl.id === selectedTemplateId);

  const sendMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Message Sent", description: "WhatsApp message sent successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/templates"] });
      setCustomerName("");
      setCustomerPhone("");
      setVariableValues({});
      setSelectedTemplateId("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    },
  });

  const handleSend = () => {
    if (!selectedTemplateId || !customerPhone || !customerName) return;
    sendMutation.mutate({
      templateId: selectedTemplateId,
      customerPhone,
      customerName,
      variables: { ...variableValues, customerName },
    });
  };

  // Build preview text
  let previewText = selectedTemplate?.previewText || "";
  if (selectedTemplate) {
    const allVars: Record<string, string> = { ...variableValues, customerName: customerName || "{{customerName}}" };
    for (const v of selectedTemplate.variables) {
      const val = allVars[v] || `{{${v}}}`;
      previewText = previewText.replace(new RegExp(`\\{\\{${v}\\}\\}`, "g"), val);
    }
  }

  // Demo customer suggestions
  const demoCustomers = [
    { name: "Ahmed Al-Rashid", phone: "+966501234567" },
    { name: "Fatima Al-Zahrani", phone: "+966509876543" },
    { name: "Mohammed Al-Otaibi", phone: "+966551112233" },
    { name: "Sara Al-Harbi", phone: "+966554443322" },
    { name: "Khalid Al-Dosari", phone: "+966557778899" },
    { name: "Noura Al-Qahtani", phone: "+966556667788" },
  ];

  const [customerSearch, setCustomerSearch] = useState("");
  const filteredCustomers = customerSearch.length > 0
    ? demoCustomers.filter(
        (c) =>
          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          c.phone.includes(customerSearch)
      )
    : [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Form */}
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <Send className="h-5 w-5 text-[#25D366]" />
            {t("whatsapp.sendMessage", "Send WhatsApp Message")}
          </CardTitle>
          <CardDescription className="text-[#64748B]">
            {t("whatsapp.sendDesc", "Select a template and fill in the details")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer search */}
          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">
              {t("whatsapp.customer", "Customer")}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder={t("whatsapp.searchCustomer", "Search customer by name or phone...")}
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                }}
                className="pl-9 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-customer-search"
              />
            </div>
            {filteredCustomers.length > 0 && (
              <div className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg overflow-hidden">
                {filteredCustomers.map((c) => (
                  <div
                    key={c.phone}
                    className="px-3 py-2 hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] cursor-pointer flex items-center justify-between"
                    onClick={() => {
                      setCustomerName(c.name);
                      setCustomerPhone(c.phone);
                      setCustomerSearch("");
                    }}
                  >
                    <span className="text-sm text-[#0B1F3B] dark:text-white">{c.name}</span>
                    <span className="text-xs text-[#64748B]">{c.phone}</span>
                  </div>
                ))}
              </div>
            )}
            {customerName && (
              <div className="flex items-center gap-2 text-sm bg-[#25D366]/10 rounded-lg p-2">
                <Users className="h-4 w-4 text-[#25D366]" />
                <span className="text-[#0B1F3B] dark:text-white font-medium">{customerName}</span>
                <span className="text-[#64748B]">{customerPhone}</span>
              </div>
            )}
          </div>

          {/* Customer phone (manual) */}
          {!customerName && (
            <>
              <div className="space-y-2">
                <Label className="text-[#0B1F3B] dark:text-white">
                  {t("whatsapp.customerName", "Customer Name")}
                </Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#0B1F3B] dark:text-white">
                  {t("whatsapp.phoneNumber", "Phone Number")}
                </Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+966XXXXXXXXX"
                  className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                />
              </div>
            </>
          )}

          {/* Template select */}
          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">
              {t("whatsapp.template", "Message Template")}
            </Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="select-template"
              >
                <SelectValue placeholder={t("whatsapp.selectTemplate", "Select a template...")} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                {templates.map((tpl: any) => (
                  <SelectItem key={tpl.id} value={tpl.id}>
                    <div className="flex items-center gap-2">
                      <SiWhatsapp className="h-3.5 w-3.5 text-[#25D366]" />
                      {tpl.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Variable fields */}
          {selectedTemplate &&
            selectedTemplate.variables
              .filter((v: string) => v !== "customerName")
              .map((v: string) => (
                <div key={v} className="space-y-2">
                  <Label className="text-[#0B1F3B] dark:text-white capitalize">
                    {v.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  <Input
                    value={variableValues[v] || ""}
                    onChange={(e) =>
                      setVariableValues((prev) => ({ ...prev, [v]: e.target.value }))
                    }
                    placeholder={`Enter ${v.replace(/([A-Z])/g, " $1").trim().toLowerCase()}`}
                    className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  />
                </div>
              ))}

          <Button
            className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white"
            onClick={handleSend}
            disabled={!selectedTemplateId || !customerPhone || !customerName || sendMutation.isPending}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4 mr-2" />
            {sendMutation.isPending
              ? t("whatsapp.sending", "Sending...")
              : t("whatsapp.sendWhatsApp", "Send WhatsApp Message")}
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <Eye className="h-5 w-5" />
            {t("whatsapp.preview", "Message Preview")}
          </CardTitle>
          <CardDescription className="text-[#64748B]">
            {t("whatsapp.previewDesc", "How the message will appear on WhatsApp")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-[#ECE5DD] dark:bg-[#0E1117] rounded-xl p-4 min-h-[300px] flex flex-col justify-end">
            {selectedTemplate ? (
              <div className="flex justify-end">
                <div className="bg-[#DCF8C6] dark:bg-[#005C4B] rounded-lg p-3 max-w-[85%] shadow-sm">
                  <p className="text-sm text-[#111B21] dark:text-white whitespace-pre-wrap">
                    {previewText}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs text-[#667781] dark:text-gray-400">
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <CheckCircle className="h-3 w-3 text-[#53BDEB]" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-[#64748B] py-12">
                <SiWhatsapp className="h-10 w-10 mx-auto mb-2 text-[#25D366] opacity-40" />
                <p className="text-sm">
                  {t("whatsapp.selectTemplatePreview", "Select a template to see the preview")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────

function SettingsTab() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <SiWhatsapp className="h-5 w-5 text-[#25D366]" />
            {t("whatsapp.apiConfig", "WhatsApp Business API Configuration")}
          </CardTitle>
          <CardDescription className="text-[#64748B]">
            {t(
              "whatsapp.apiConfigDesc",
              "Connect your WhatsApp Business account to enable messaging"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#64748B]" />
              {t("whatsapp.apiKey", "API Key / Access Token")}
            </Label>
            <Input
              type="password"
              placeholder="Enter your WhatsApp Business API access token"
              className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              data-testid="input-api-key"
            />
            <p className="text-xs text-[#64748B]">
              {t(
                "whatsapp.apiKeyHelp",
                "Obtain this from your Meta Business Suite or WhatsApp Business API provider"
              )}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#64748B]" />
              {t("whatsapp.phoneNumber", "Business Phone Number")}
            </Label>
            <Input
              placeholder="+966XXXXXXXXX"
              className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              data-testid="input-phone-number"
            />
            <p className="text-xs text-[#64748B]">
              {t(
                "whatsapp.phoneHelp",
                "The phone number registered with your WhatsApp Business Account"
              )}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#64748B]" />
              {t("whatsapp.businessId", "WhatsApp Business Account ID")}
            </Label>
            <Input
              placeholder="Enter your WABA ID"
              className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              data-testid="input-business-id"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-[#64748B]" />
              {t("whatsapp.webhookUrl", "Webhook URL")}
            </Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value="https://api.slis-gms.com/api/whatsapp/webhook"
                className="bg-[#F8FAFC] dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]"
                data-testid="input-webhook-url"
              />
              <Button
                variant="outline"
                size="sm"
                className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] whitespace-nowrap"
                onClick={() => navigator.clipboard.writeText("https://api.slis-gms.com/api/whatsapp/webhook")}
              >
                Copy
              </Button>
            </div>
            <p className="text-xs text-[#64748B]">
              {t(
                "whatsapp.webhookHelp",
                "Set this URL in your Meta Developer App webhook settings to receive incoming messages"
              )}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#64748B]" />
              {t("whatsapp.verifyToken", "Webhook Verify Token")}
            </Label>
            <Input
              placeholder="Enter a custom verify token"
              className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              data-testid="input-verify-token"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white"
              data-testid="button-save-settings"
            >
              {t("whatsapp.saveConfig", "Save Configuration")}
            </Button>
            <Button
              variant="outline"
              className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
              data-testid="button-test-connection"
            >
              {t("whatsapp.testConnection", "Test Connection")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <Settings className="h-5 w-5" />
            {t("whatsapp.automationSettings", "Automation Settings")}
          </CardTitle>
          <CardDescription className="text-[#64748B]">
            {t("whatsapp.automationDesc", "Configure automatic message triggers")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              label: "Auto-send appointment reminders",
              desc: "24 hours before scheduled appointment",
              enabled: true,
            },
            {
              label: "Auto-send job status updates",
              desc: "When job status changes in the system",
              enabled: true,
            },
            {
              label: "Auto-send invoice notifications",
              desc: "When a new invoice is generated",
              enabled: false,
            },
            {
              label: "Auto-send review requests",
              desc: "48 hours after service completion",
              enabled: false,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] dark:border-[#232A36]"
            >
              <div>
                <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">{item.label}</p>
                <p className="text-xs text-[#64748B]">{item.desc}</p>
              </div>
              <Badge
                className={
                  item.enabled
                    ? "bg-[#25D366]/10 text-[#25D366]"
                    : "bg-[#64748B]/10 text-[#64748B]"
                }
              >
                {item.enabled ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export default function WhatsAppIntegration() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <TabsPageLayout
      title={t("whatsapp.title", "WhatsApp Business Integration")}
      description={t(
        "whatsapp.description",
        "Send template-based messages, track conversations, and manage your WhatsApp Business account"
      )}
      icon={MessageSquare}
      tabs={[
        {
          id: "dashboard",
          label: t("whatsapp.dashboard", "Dashboard"),
          icon: LayoutDashboard,
          content: <DashboardTab />,
        },
        {
          id: "templates",
          label: t("whatsapp.templates", "Templates"),
          icon: FileText,
          content: <TemplatesTab />,
        },
        {
          id: "conversations",
          label: t("whatsapp.conversations", "Conversations"),
          icon: MessageSquare,
          content: <ConversationsTab />,
        },
        {
          id: "send",
          label: t("whatsapp.send", "Send Message"),
          icon: Send,
          content: <SendMessageTab />,
        },
        {
          id: "settings",
          label: t("whatsapp.settings", "Settings"),
          icon: Settings,
          content: <SettingsTab />,
        },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
