import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck, ExternalLink, Trash2, X, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@shared/schema";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function NotificationBell() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count'],
    refetchInterval: 30000,
    enabled: !!user,
  });

  const unreadCount = unreadData?.count || 0;

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: isOpen && !!user,
  });

  const connectWebSocket = useCallback(() => {
    if (!user || wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        reconnectAttempts.current = 0;
        ws.send(JSON.stringify({ type: 'auth', data: { userId: user.id } }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification') {
            queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
            queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
            toast({
              title: data.notification?.title || t('notifications.newNotification', 'New Notification'),
              description: data.notification?.message || t('notifications.received', 'You have a new notification'),
            });
          }
        } catch (e) {
          console.error('Failed to parse notification WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        wsRef.current = null;
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          setTimeout(connectWebSocket, delay);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [user, toast, t]);

  useEffect(() => {
    if (user) {
      connectWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user, connectWebSocket]);

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest('PATCH', `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
    onError: () => {
      toast({
        title: t('notifications.error', 'Error'),
        description: t('notifications.markReadFailed', 'Failed to mark notification as read'),
        variant: 'destructive',
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest('PATCH', '/api/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      toast({
        title: t('notifications.allMarkedRead', 'All marked as read'),
        description: t('notifications.allNotificationsRead', 'All notifications have been marked as read'),
      });
    },
    onError: () => {
      toast({
        title: t('notifications.error', 'Error'),
        description: t('notifications.markAllReadFailed', 'Failed to mark all as read'),
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
    onError: () => {
      toast({
        title: t('notifications.error', 'Error'),
        description: t('notifications.deleteFailed', 'Failed to delete notification'),
        variant: 'destructive',
      });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status !== 'read') {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const getNotificationTypeStyle = (type: string, isRead: boolean) => {
    if (isRead) return 'opacity-70';
    switch (type) {
      case 'urgent':
        return 'border-l-4 border-l-[#F97316] bg-[#F97316]/5';
      case 'info':
        return 'border-l-4 border-l-[#0A5ED7] bg-[#0A5ED7]/5';
      case 'success':
        return 'border-l-4 border-l-[#0BB3FF] bg-[#0BB3FF]/5';
      default:
        return 'border-l-4 border-l-[#0A5ED7] bg-[#0A5ED7]/5';
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, string> = {
      appointment: 'bg-[#0A5ED7]/10 text-[#0A5ED7]',
      invoice: 'bg-[#0BB3FF]/10 text-[#0BB3FF]',
      job_completed: 'bg-[#0A5ED7]/20 text-[#0A5ED7]',
      message: 'bg-[#0BB3FF]/20 text-[#0BB3FF]',
      system: 'bg-[#0B1F3B]/10 text-[#0B1F3B] dark:text-white/60',
    };
    return categoryColors[category] || categoryColors.system;
  };

  const recentNotifications = notifications.slice(0, 10);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-[#0A5ED7]/10"
          data-testid="button-notifications"
          aria-label={t('notifications.openNotifications', 'Open notifications')}
        >
          <Bell className="h-5 w-5 text-[#0B1F3B] dark:text-white" aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px] bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0"
              data-testid="badge-notification-count"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {wsConnected && (
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#0A5ED7] rounded-full" aria-hidden="true" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 bg-white dark:bg-[#151A23] border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30 shadow-lg"
        align="end"
        data-testid="panel-notifications"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#0A5ED7]/10 dark:border-[#0A5ED7]/20">
          <div className="flex items-center gap-2">
            <h3 className="font-['Poppins',Helvetica] font-semibold text-lg text-[#0B1F3B] dark:text-white">
              {t('notifications.title', 'Notifications')}
            </h3>
            {unreadCount > 0 && (
              <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-xs text-[#0A5ED7] hover:bg-[#0A5ED7]/10"
                data-testid="button-mark-all-read"
                aria-label={t('notifications.markAllAsRead', 'Mark all as read')}
              >
                <CheckCheck className="h-4 w-4 mr-1" aria-hidden="true" />
                {t('notifications.markAllRead', 'Mark all')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 hover:bg-[#0B1F3B]/10 dark:hover:bg-white/10"
              data-testid="button-close-notifications"
              aria-label={t('notifications.close', 'Close')}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-[#0A5ED7]" aria-hidden="true" />
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
              <Bell className="h-10 w-10 text-[#0B1F3B]/30 dark:text-white/30 mb-3" aria-hidden="true" />
              <p className="text-sm text-[#0B1F3B]/60 dark:text-white/60">
                {t('notifications.noNotifications', 'No notifications yet')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#0A5ED7]/10 dark:divide-[#0A5ED7]/20" role="list" aria-label={t('notifications.list', 'Notifications list')}>
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-[#0A5ED7]/5 transition-colors cursor-pointer ${getNotificationTypeStyle(notification.type || 'info', notification.status === 'read')}`}
                  role="listitem"
                  onClick={() => handleNotificationClick(notification)}
                  data-testid={`notification-item-${notification.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-[10px] ${getCategoryBadge(notification.category || 'system')}`}>
                          {notification.category?.replace('_', ' ') || 'system'}
                        </Badge>
                        <span className="text-[10px] text-[#0B1F3B]/60 dark:text-white/60">
                          {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {notification.status !== 'read' && (
                          <div className="h-2 w-2 bg-[#0A5ED7] rounded-full flex-shrink-0" aria-hidden="true" />
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-[#0B1F3B] dark:text-white truncate">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-[#0B1F3B]/60 dark:text-white/60 line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {notification.status !== 'read' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-[#0A5ED7]/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsReadMutation.mutate(notification.id);
                          }}
                          disabled={markAsReadMutation.isPending}
                          data-testid={`button-mark-read-${notification.id}`}
                          aria-label={t('notifications.markAsRead', 'Mark as read')}
                        >
                          <Check className="h-3 w-3 text-[#0A5ED7]" aria-hidden="true" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-[#F97316]/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(notification.id);
                        }}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${notification.id}`}
                        aria-label={t('notifications.delete', 'Delete')}
                      >
                        <Trash2 className="h-3 w-3 text-[#F97316]" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-[#0A5ED7]/10 dark:border-[#0A5ED7]/20">
          <Link href="/notifications">
            <Button
              variant="ghost"
              className="w-full text-[#0A5ED7] hover:bg-[#0A5ED7]/10"
              onClick={() => setIsOpen(false)}
              data-testid="link-view-all-notifications"
            >
              <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('notifications.viewAll', 'View All Notifications')}
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
