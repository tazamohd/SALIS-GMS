import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, Mail, MessageSquare, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const [selectedTab, setSelectedTab] = useState("all");
  const { toast } = useToast();

  // Fetch all notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest('PATCH', `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  // Delete mutation
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

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "unread") return notification.status !== 'read';
    if (selectedTab === "email") return notification.type === 'email';
    if (selectedTab === "in-app") return notification.type === 'in-app';
    return true;
  });

  const unreadCount = notifications.filter(n => n.status !== 'read').length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5 text-blue-500" />;
      case 'sms':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'in-app':
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'read') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'failed') return <XCircle className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      appointment: 'bg-blue-100 text-blue-700',
      invoice: 'bg-green-100 text-green-700',
      job_completed: 'bg-cyan-100 text-cyan-700',
      feedback_request: 'bg-purple-100 text-purple-700',
      general: 'bg-gray-100 text-gray-700',
    };

    return (
      <Badge className={colors[category] || colors.general} variant="secondary">
        {category.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#222029]">Notifications</h1>
        <p className="text-[#999999] mt-2">Manage your notifications and alerts</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList data-testid="tabs-notifications">
          <TabsTrigger value="all" data-testid="tab-all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" data-testid="tab-unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="email" data-testid="tab-email">
            Email
          </TabsTrigger>
          <TabsTrigger value="in-app" data-testid="tab-in-app">
            In-App
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No notifications to display</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`${
                    notification.status !== 'read' ? 'bg-blue-50 border-blue-200' : ''
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
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm whitespace-pre-wrap">
                      {notification.message}
                    </CardDescription>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
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
                        <span className="text-red-500">Failed: {notification.failureReason}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
