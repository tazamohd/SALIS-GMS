import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, Mail, MessageSquare, CheckCircle, XCircle, Trash2, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { NotificationPreferences } from "@/components/NotificationPreferences";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";

export default function Notifications() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [showPreferences, setShowPreferences] = useState(false);
  const { toast } = useToast();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest('PATCH', `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest('DELETE', `/api/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      toast({
        title: "Notification deleted",
        description: "The notification has been removed.",
      });
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const getFilteredNotifications = (filter: string) => {
    return notifications.filter((notification) => {
      if (filter === "all") return true;
      if (filter === "unread") return notification.status !== 'read';
      if (filter === "email") return notification.type === 'email';
      if (filter === "in-app") return notification.type === 'in-app';
      return true;
    });
  };

  const unreadCount = notifications.filter(n => n.status !== 'read').length;
  const emailCount = notifications.filter(n => n.type === 'email').length;
  const inAppCount = notifications.filter(n => n.type === 'in-app').length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5 text-gray-700 dark:text-gray-300" />;
      case 'sms':
        return <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      case 'in-app':
        return <Bell className="h-5 w-5 text-gray-800 dark:text-gray-200" />;
      default:
        return <Bell className="h-5 w-5 text-gray-900 dark:text-white/60" />;
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'read') return <CheckCircle className="h-4 w-4 text-gray-700 dark:text-gray-300" />;
    if (status === 'failed') return <XCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    return null;
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      appointment: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
      invoice: 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100',
      job_completed: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
      feedback_request: 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100',
      general: 'bg-gray-100 dark:bg-salis-gray-dark text-gray-700 dark:text-gray-300',
    };

    return (
      <Badge className={colors[category] || colors.general} variant="secondary">
        {category.replace('_', ' ')}
      </Badge>
    );
  };

  const renderNotificationList = (filteredNotifications: Notification[]) => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      );
    }

    if (filteredNotifications.length === 0) {
      return (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-900 dark:text-white/60">No notifications to display</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card
            key={notification.id}
            className={`${
              notification.status !== 'read' ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600' : ''
            }`}
            data-testid={`notification-card-${notification.id}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base">
                        {notification.title}
                      </CardTitle>
                      {getStatusIcon(notification.status)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {getCategoryBadge(notification.category)}
                      <Badge variant="outline" className="text-xs">
                        {notification.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {notification.status !== 'read' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      data-testid={`button-mark-read-${notification.id}`}
                    >
                      Mark as read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(notification.id)}
                    data-testid={`button-delete-${notification.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm whitespace-pre-wrap">
                {notification.message}
              </CardDescription>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-900 dark:text-white/60">
                <span>
                  {notification.createdAt &&
                    formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                </span>
                {notification.sentAt && (
                  <span>
                    Sent {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}
                  </span>
                )}
                {notification.status === 'failed' && notification.failureReason && (
                  <span className="text-gray-700 dark:text-gray-300">Failed: {notification.failureReason}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (showPreferences) {
    return (
      <div className="p-8 bg-gray-50 dark:bg-salis-black min-h-screen">
        <Button
          variant="ghost"
          onClick={() => setShowPreferences(false)}
          className="mb-4"
          data-testid="button-back-to-notifications"
        >
          ← Back to Notifications
        </Button>
        <NotificationPreferences />
      </div>
    );
  }

  return (
    <TabsPageLayout
      title="Notifications"
      description="Manage your notifications and alerts"
      icon={Bell}
      primaryAction={{
        label: "Preferences",
        icon: Settings,
        onClick: () => setShowPreferences(true),
        variant: "outline",
        testId: "button-notification-preferences",
      }}
      tabs={[
        {
          id: "all",
          label: "All",
          badge: notifications.length,
          content: renderNotificationList(getFilteredNotifications("all")),
        },
        {
          id: "unread",
          label: "Unread",
          badge: unreadCount,
          content: renderNotificationList(getFilteredNotifications("unread")),
        },
        {
          id: "email",
          label: "Email",
          badge: emailCount,
          content: renderNotificationList(getFilteredNotifications("email")),
        },
        {
          id: "in-app",
          label: "In-App",
          badge: inAppCount,
          content: renderNotificationList(getFilteredNotifications("in-app")),
        },
      ]}
      activeTab={selectedTab}
      onTabChange={setSelectedTab}
    />
  );
}
