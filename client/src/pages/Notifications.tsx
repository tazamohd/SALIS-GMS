import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        title: t('notifications.notificationDeleted', 'Notification deleted'),
        description: t('notifications.notificationRemoved', 'The notification has been removed.'),
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
        return <Mail className="h-5 w-5 text-[#0A5ED7]" />;
      case 'sms':
        return <MessageSquare className="h-5 w-5 text-[#64748B]" />;
      case 'in-app':
        return <Bell className="h-5 w-5 text-[#0BB3FF]" />;
      default:
        return <Bell className="h-5 w-5 text-[#64748B]" />;
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'read') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'failed') return <XCircle className="h-4 w-4 text-[#F97316]" />;
    return null;
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      appointment: 'bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0A5ED7]/20',
      invoice: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      job_completed: 'bg-[#0BB3FF]/10 text-[#0BB3FF] dark:bg-[#0BB3FF]/20',
      feedback_request: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      general: 'bg-[#F8FAFC] dark:bg-[#232A36] text-[#64748B]',
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A5ED7]" />
        </div>
      );
    }

    if (filteredNotifications.length === 0) {
      return (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-[#64748B] mb-4" />
            <p className="text-[#64748B]">{t('notifications.noNotificationsToDisplay', 'No notifications to display')}</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card
            key={notification.id}
            className={`bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] ${
              notification.status !== 'read' ? 'ring-1 ring-[#0A5ED7]/20' : ''
            }`}
            data-testid={`notification-card-${notification.id}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base text-[#0B1F3B] dark:text-white">
                        {notification.title}
                      </CardTitle>
                      {getStatusIcon(notification.status)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {getCategoryBadge(notification.category)}
                      <Badge variant="outline" className="text-xs border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">
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
                      className="text-[#0A5ED7] hover:text-[#0A5ED7]/80"
                      data-testid={`button-mark-read-${notification.id}`}
                    >
                      {t('notifications.markAsRead', 'Mark as read')}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(notification.id)}
                    className="text-[#64748B] hover:text-red-600"
                    data-testid={`button-delete-${notification.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm whitespace-pre-wrap text-[#64748B]">
                {notification.message}
              </CardDescription>
              <div className="mt-3 flex items-center gap-4 text-xs text-[#64748B]">
                <span>
                  {notification.createdAt &&
                    formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                </span>
                {notification.sentAt && (
                  <span>
                    {t('notifications.sent', 'Sent')} {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}
                  </span>
                )}
                {notification.status === 'failed' && notification.failureReason && (
                  <span className="text-[#F97316]">{t('common.failed', 'Failed')}: {notification.failureReason}</span>
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
      <div className="p-8 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
        <Button
          variant="ghost"
          onClick={() => setShowPreferences(false)}
          className="mb-4 text-[#0B1F3B] dark:text-white"
          data-testid="button-back-to-notifications"
        >
          ← {t('notifications.backToNotifications', 'Back to Notifications')}
        </Button>
        <NotificationPreferences />
      </div>
    );
  }

  return (
    <TabsPageLayout
      title={t('notifications.title', 'Notifications')}
      description={t('notifications.description', 'Manage your notifications and alerts')}
      icon={Bell}
      primaryAction={{
        label: t('notifications.preferences', 'Preferences'),
        icon: Settings,
        onClick: () => setShowPreferences(true),
        variant: "outline",
        testId: "button-notification-preferences",
      }}
      tabs={[
        {
          id: "all",
          label: t('common.all', 'All'),
          badge: notifications.length,
          content: renderNotificationList(getFilteredNotifications("all")),
        },
        {
          id: "unread",
          label: t('notifications.unread', 'Unread'),
          badge: unreadCount,
          content: renderNotificationList(getFilteredNotifications("unread")),
        },
        {
          id: "email",
          label: t('notifications.email', 'Email'),
          badge: emailCount,
          content: renderNotificationList(getFilteredNotifications("email")),
        },
        {
          id: "in-app",
          label: t('notifications.inApp', 'In-App'),
          badge: inAppCount,
          content: renderNotificationList(getFilteredNotifications("in-app")),
        },
      ]}
      activeTab={selectedTab}
      onTabChange={setSelectedTab}
    />
  );
}
