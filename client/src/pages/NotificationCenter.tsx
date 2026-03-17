import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Trash2,
  Mail,
  MailOpen,
  Filter,
  Inbox,
  Settings,
  Sparkles,
} from "lucide-react";
import { DashboardPage } from "@/components/layouts/DashboardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type NotificationType = "info" | "warning" | "error" | "success";

interface NotificationItem {
  id: string;
  userId: string;
  garageId: string;
  title: string;
  message: string;
  type: NotificationType;
  channel: string;
  category: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

interface PreferencesResponse {
  preferences: Record<string, { inApp: boolean; sms: boolean; email: boolean }>;
}

const typeIconMap: Record<NotificationType, typeof CheckCircle> = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const typeColorMap: Record<NotificationType, string> = {
  success: "text-emerald-500",
  warning: "text-amber-500",
  error: "text-red-500",
  info: "text-blue-500",
};

const typeBgMap: Record<NotificationType, string> = {
  success: "bg-emerald-50 dark:bg-emerald-500/10",
  warning: "bg-amber-50 dark:bg-amber-500/10",
  error: "bg-red-50 dark:bg-red-500/10",
  info: "bg-blue-50 dark:bg-blue-500/10",
};

const categories = [
  "All",
  "Job Updates",
  "Inventory Alerts",
  "Payment Received",
  "Appointment Reminders",
  "System Alerts",
];

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationCenter() {
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const { toast } = useToast();

  // Fetch notifications
  const { data: notifData, isLoading: notifLoading } = useQuery<NotificationsResponse>({
    queryKey: ["/api/notification-center", activeTab, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeTab === "unread") params.set("unreadOnly", "true");
      if (categoryFilter !== "All") params.set("category", categoryFilter);
      const res = await fetch(`/api/notification-center/notifications?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    refetchInterval: 30000,
  });

  // Fetch preferences
  const { data: prefsData } = useQuery<PreferencesResponse>({
    queryKey: ["/api/notification-center/notifications/preferences"],
    queryFn: async () => {
      const res = await fetch("/api/notification-center/notifications/preferences", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch preferences");
      return res.json();
    },
  });

  // Mark as read
  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("POST", `/api/notification-center/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-center"] });
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/notification-center/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-center"] });
      toast({ title: "All notifications marked as read" });
    },
  });

  // Delete notification
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/notification-center/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-center"] });
      toast({ title: "Notification deleted" });
    },
  });

  // Update preferences
  const updatePrefsMutation = useMutation({
    mutationFn: (prefs: Record<string, { inApp: boolean; sms: boolean; email: boolean }>) =>
      apiRequest("PUT", "/api/notification-center/notifications/preferences", { preferences: prefs }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-center/notifications/preferences"] });
      toast({ title: "Preferences updated" });
    },
  });

  // Seed demo notifications
  const seedMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/notification-center/notifications/seed"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-center"] });
      toast({ title: "Demo notifications created", description: "5 sample notifications have been added." });
    },
  });

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;
  const preferences = prefsData?.preferences || {};

  const handleTogglePref = (
    category: string,
    channel: "inApp" | "sms" | "email",
    value: boolean
  ) => {
    const updated = { ...preferences };
    if (updated[category]) {
      updated[category] = { ...updated[category], [channel]: value };
    }
    updatePrefsMutation.mutate(updated);
  };

  const metrics = [
    {
      label: "Total Notifications",
      value: notifications.length,
      icon: Bell,
    },
    {
      label: "Unread",
      value: unreadCount,
      icon: Mail,
    },
    {
      label: "Read",
      value: notifications.length - notifications.filter((n) => !n.read).length,
      icon: MailOpen,
    },
    {
      label: "Categories",
      value: Object.keys(preferences).length || 6,
      icon: Filter,
    },
  ];

  return (
    <DashboardPage
      title="Notification Center"
      description="Manage your notifications and alert preferences"
      icon={Bell}
      metrics={metrics}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all">All Notifications</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] px-1.5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {activeTab !== "preferences" && (
            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllReadMutation.mutate()}
                disabled={unreadCount === 0}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark All Read
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => seedMutation.mutate()}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Seed Demo
              </Button>
            </div>
          )}
        </div>

        {/* All Notifications Tab */}
        <TabsContent value="all">
          <NotificationList
            notifications={notifications}
            isLoading={notifLoading}
            onMarkRead={(id) => markReadMutation.mutate(id)}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        </TabsContent>

        {/* Unread Tab */}
        <TabsContent value="unread">
          <NotificationList
            notifications={notifications}
            isLoading={notifLoading}
            onMarkRead={(id) => markReadMutation.mutate(id)}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 py-3 px-4 text-sm font-semibold text-muted-foreground">
                  <div>Category</div>
                  <div className="text-center">In-App</div>
                  <div className="text-center">SMS</div>
                  <div className="text-center">Email</div>
                </div>
                <Separator />

                {Object.entries(preferences).map(([category, channels]) => (
                  <div key={category}>
                    <div className="grid grid-cols-4 gap-4 py-4 px-4 items-center hover:bg-muted/50 rounded-lg transition-colors">
                      <div className="font-medium text-sm">{category}</div>
                      <div className="flex justify-center">
                        <Switch
                          checked={channels.inApp}
                          onCheckedChange={(val) => handleTogglePref(category, "inApp", val)}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Switch
                          checked={channels.sms}
                          onCheckedChange={(val) => handleTogglePref(category, "sms", val)}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Switch
                          checked={channels.email}
                          onCheckedChange={(val) => handleTogglePref(category, "email", val)}
                        />
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardPage>
  );
}

function NotificationList({
  notifications,
  isLoading,
  onMarkRead,
  onDelete,
}: {
  notifications: NotificationItem[];
  isLoading: boolean;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading notifications...
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Inbox className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No notifications found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Use the "Seed Demo" button to generate sample notifications
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notif) => {
        const Icon = typeIconMap[notif.type];
        const iconColor = typeColorMap[notif.type];
        const bgColor = typeBgMap[notif.type];

        return (
          <Card
            key={notif.id}
            className={`transition-all duration-200 hover:shadow-md ${
              !notif.read
                ? "border-l-4 border-l-[#0A5ED7] bg-blue-50/30 dark:bg-blue-500/5"
                : "opacity-75"
            }`}
          >
            <CardContent className="py-4 px-5">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-2 rounded-xl ${bgColor} shrink-0 mt-0.5`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-semibold ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#0A5ED7] shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {notif.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(notif.createdAt)}
                        </span>
                        {notif.actionUrl && (
                          <a
                            href={notif.actionUrl}
                            className="text-xs text-[#0A5ED7] hover:underline font-medium"
                          >
                            View Details
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onMarkRead(notif.id)}
                          title="Mark as read"
                        >
                          <MailOpen className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => onDelete(notif.id)}
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
