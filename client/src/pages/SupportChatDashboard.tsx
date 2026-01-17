import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageCircle,
  Send,
  Clock,
  CheckCheck,
  AlertCircle,
  Filter,
  RefreshCw,
  UserPlus,
  Check,
  Inbox,
  Loader2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  isEdited?: boolean;
}

interface SupportTicket {
  id: string;
  conversationId: string;
  garageId: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  assignedTo: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function SupportChatDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: tickets = [], isLoading: ticketsLoading, refetch: refetchTickets } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support/tickets', statusFilter, priorityFilter],
  });

  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;
    return true;
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/staff'],
  });

  const selectedTicket = filteredTickets.find(t => t.id === selectedTicketId);

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/conversations', selectedTicket?.conversationId, 'messages'],
    enabled: !!selectedTicket?.conversationId,
    refetchInterval: isConnected ? false : 5000,
  });

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedTicket?.conversationId) throw new Error('No active conversation');
      const res = await apiRequest('POST', `/api/chat/conversations/${selectedTicket.conversationId}/messages`, {
        content,
        messageType: 'text',
      });
      return res.json();
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ 
        queryKey: ['/api/chat/conversations', selectedTicket?.conversationId, 'messages'] 
      });
      toast({
        title: t('supportDashboard.messageSent', 'Message Sent'),
        description: t('supportDashboard.messageSentDesc', 'Your response has been sent.'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('supportDashboard.sendError', 'Failed to send message'),
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const res = await apiRequest('PATCH', `/api/support/tickets/${ticketId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      toast({
        title: t('supportDashboard.statusUpdated', 'Status Updated'),
        description: t('supportDashboard.statusUpdatedDesc', 'Ticket status has been updated successfully.'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('supportDashboard.updateError', 'Failed to update status'),
        variant: 'destructive',
      });
    },
  });

  const assignTicketMutation = useMutation({
    mutationFn: async ({ ticketId, assignTo }: { ticketId: string; assignTo: string }) => {
      const res = await apiRequest('POST', `/api/support/tickets/${ticketId}/assign`, { assignTo });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      toast({
        title: t('supportDashboard.ticketAssigned', 'Ticket Assigned'),
        description: t('supportDashboard.ticketAssignedDesc', 'Ticket has been assigned successfully.'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('supportDashboard.assignError', 'Failed to assign ticket'),
        variant: 'destructive',
      });
    },
  });

  const connectWebSocket = () => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;

    try {
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('Support Dashboard WebSocket connected');
        socket.send(JSON.stringify({ type: 'auth', data: {} }));
        reconnectAttemptsRef.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'auth_success') {
            setIsConnected(true);
          } else if (data.type === 'error') {
            console.error('WebSocket auth error:', data.data?.message);
            setIsConnected(false);
          } else if (data.type === 'new_message' || data.type === 'support_chat.new_message') {
            if (selectedTicket && data.data.conversationId === selectedTicket.conversationId) {
              queryClient.invalidateQueries({ 
                queryKey: ['/api/chat/conversations', selectedTicket.conversationId, 'messages'] 
              });
            }
            refetchTickets();
          } else if (data.type === 'support_chat.new_ticket' || data.type === 'support_chat.ticket_updated') {
            refetchTickets();
          } else if (data.type === 'typing') {
            if (selectedTicket && data.data.conversationId === selectedTicket.conversationId && data.data.userId !== user.id) {
              setIsTyping(data.data.isTyping);
              if (data.data.isTyping) {
                setTimeout(() => setIsTyping(false), 3000);
              }
            }
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      socket.onclose = () => {
        console.log('Support Dashboard WebSocket disconnected');
        setIsConnected(false);
        setWs(null);

        if (reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectWebSocket();
          }, delay);
        }
      };

      socket.onerror = (error) => {
        console.error('Support Dashboard WebSocket error:', error);
        setIsConnected(false);
      };

      setWs(socket);
      wsRef.current = socket;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user, selectedTicket?.conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sortedMessages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-[#0A5ED7]/10 text-[#0A5ED7] border-[#0A5ED7]/30';
      case 'in_progress':
        return 'bg-[#0BB3FF]/10 text-[#0BB3FF] border-[#0BB3FF]/30';
      case 'waiting_customer':
        return 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30';
      case 'resolved':
        return 'bg-[#0A5ED7]/20 text-[#0A5ED7] border-[#0A5ED7]/40';
      case 'closed':
        return 'bg-[#0B1F3B]/10 text-[#0B1F3B] dark:text-white/60 border-[#0B1F3B]/30';
      default:
        return 'bg-[#0B1F3B]/10 text-[#0B1F3B] dark:text-white/60 border-[#0B1F3B]/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30';
      case 'high':
        return 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30';
      case 'medium':
        return 'bg-[#0BB3FF]/10 text-[#0BB3FF] border-[#0BB3FF]/30';
      case 'low':
        return 'bg-[#0B1F3B]/10 text-[#0B1F3B] dark:text-white/60 border-[#0B1F3B]/30';
      default:
        return 'bg-[#0B1F3B]/10 text-[#0B1F3B] dark:text-white/60 border-[#0B1F3B]/30';
    }
  };

  const openTickets = filteredTickets.filter(t => t.status === 'open').length;
  const inProgressTickets = filteredTickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = filteredTickets.filter(t => t.status === 'resolved').length;

  const getSenderName = (senderId: string) => {
    const sender = users.find(u => u.id === senderId);
    return sender?.fullName || t('supportDashboard.customer', 'Customer');
  };

  return (
    <div className="min-h-screen bg-[#0B1F3B]/5 dark:bg-[#0B1120] p-6" data-testid="page-support-dashboard">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-['Poppins',Helvetica] font-bold text-2xl text-[#0B1F3B] dark:text-white">
              {t('supportDashboard.title', 'Support Chat Dashboard')}
            </h1>
            <p className="text-sm text-[#0B1F3B]/60 dark:text-white/60 mt-1">
              {t('supportDashboard.subtitle', 'Manage customer support inquiries and chat conversations')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] border-[#0A5ED7]/30" data-testid="badge-connection-status">
                <span className="w-2 h-2 rounded-full bg-[#0A5ED7] animate-pulse mr-2" aria-hidden="true" />
                {t('supportDashboard.connected', 'Connected')}
              </Badge>
            ) : (
              <Badge className="bg-[#0B1F3B]/10 text-[#0B1F3B] dark:text-white/60 border-[#0B1F3B]/30" data-testid="badge-connection-status">
                <span className="w-2 h-2 rounded-full bg-[#0B1F3B] dark:bg-white/60 mr-2" aria-hidden="true" />
                {t('supportDashboard.disconnected', 'Disconnected')}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchTickets()}
              className="border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30 hover:bg-[#0A5ED7]/5 dark:hover:bg-[#0A5ED7]/10"
              data-testid="button-refresh-tickets"
              aria-label={t('common.refresh', 'Refresh')}
            >
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              {t('common.refresh', 'Refresh')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="relative overflow-hidden bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0" data-testid="card-stat-total">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8" aria-hidden="true" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">{t('supportDashboard.totalTickets', 'Total Tickets')}</p>
                  <p className="text-3xl font-bold" data-testid="text-total-count">{filteredTickets.length}</p>
                </div>
                <Inbox className="w-10 h-10 opacity-50" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-white dark:bg-[#151A23] border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30" data-testid="card-stat-open">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#0A5ED7]/5 rounded-full -mr-10 -mt-10" aria-hidden="true" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#0B1F3B]/60 dark:text-white/60">{t('supportDashboard.openTickets', 'Open')}</p>
                  <p className="text-3xl font-bold text-[#0A5ED7]" data-testid="text-open-count">{openTickets}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-[#0A5ED7]/30" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-white dark:bg-[#151A23] border-[#0BB3FF]/20 dark:border-[#0BB3FF]/30" data-testid="card-stat-progress">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#0BB3FF]/5 rounded-full -mr-10 -mt-10" aria-hidden="true" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#0B1F3B]/60 dark:text-white/60">{t('supportDashboard.inProgress', 'In Progress')}</p>
                  <p className="text-3xl font-bold text-[#0BB3FF]" data-testid="text-progress-count">{inProgressTickets}</p>
                </div>
                <Clock className="w-10 h-10 text-[#0BB3FF]/30" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-white dark:bg-[#151A23] border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30" data-testid="card-stat-resolved">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#0A5ED7]/5 rounded-full -mr-10 -mt-10" aria-hidden="true" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#0B1F3B]/60 dark:text-white/60">{t('supportDashboard.resolved', 'Resolved')}</p>
                  <p className="text-3xl font-bold text-[#0A5ED7]" data-testid="text-resolved-count">{resolvedTickets}</p>
                </div>
                <Check className="w-10 h-10 text-[#0A5ED7]/30" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4">
            <Card className="bg-white dark:bg-[#151A23] border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30 h-[calc(100vh-300px)]" data-testid="panel-ticket-list">
              <CardHeader className="border-b border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-['Poppins',Helvetica] font-semibold text-lg text-[#0B1F3B] dark:text-white">
                    {t('supportDashboard.tickets', 'Tickets')}
                  </CardTitle>
                  <Filter className="w-4 h-4 text-[#0B1F3B]/60 dark:text-white/60" aria-hidden="true" />
                </div>
                <div className="flex gap-2 mt-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger 
                      className="w-full h-8 text-xs border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30" 
                      data-testid="select-status-filter"
                      aria-label={t('supportDashboard.filterByStatus', 'Filter by status')}
                    >
                      <SelectValue placeholder={t('supportDashboard.status', 'Status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                      <SelectItem value="open">{t('supportDashboard.open', 'Open')}</SelectItem>
                      <SelectItem value="in_progress">{t('supportDashboard.inProgressStatus', 'In Progress')}</SelectItem>
                      <SelectItem value="waiting_customer">{t('supportDashboard.waitingCustomer', 'Waiting')}</SelectItem>
                      <SelectItem value="resolved">{t('supportDashboard.resolvedStatus', 'Resolved')}</SelectItem>
                      <SelectItem value="closed">{t('supportDashboard.closed', 'Closed')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger 
                      className="w-full h-8 text-xs border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30" 
                      data-testid="select-priority-filter"
                      aria-label={t('supportDashboard.filterByPriority', 'Filter by priority')}
                    >
                      <SelectValue placeholder={t('supportDashboard.priority', 'Priority')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                      <SelectItem value="urgent">{t('supportDashboard.urgent', 'Urgent')}</SelectItem>
                      <SelectItem value="high">{t('supportDashboard.high', 'High')}</SelectItem>
                      <SelectItem value="medium">{t('supportDashboard.medium', 'Medium')}</SelectItem>
                      <SelectItem value="low">{t('supportDashboard.low', 'Low')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-450px)]">
                  {ticketsLoading ? (
                    <div className="flex items-center justify-center h-40" aria-label={t('common.loading', 'Loading')}>
                      <Loader2 className="w-6 h-6 animate-spin text-[#0A5ED7]" aria-hidden="true" />
                    </div>
                  ) : filteredTickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                      <Inbox className="w-12 h-12 text-[#0B1F3B]/30 dark:text-white/30 mb-2" aria-hidden="true" />
                      <p className="text-sm text-[#0B1F3B]/60 dark:text-white/60">
                        {t('supportDashboard.noTickets', 'No support tickets found')}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#0A5ED7]/10 dark:divide-[#0A5ED7]/20" role="list" aria-label={t('supportDashboard.ticketList', 'Ticket list')}>
                      {filteredTickets.map((ticket) => (
                        <button
                          key={ticket.id}
                          onClick={() => setSelectedTicketId(ticket.id)}
                          className={`w-full p-4 text-left hover:bg-[#0A5ED7]/5 dark:hover:bg-[#0A5ED7]/10 transition-colors ${
                            selectedTicketId === ticket.id ? 'bg-[#0A5ED7]/5 dark:bg-[#0A5ED7]/10 border-l-2 border-[#0A5ED7]' : ''
                          }`}
                          data-testid={`button-ticket-${ticket.id}`}
                          aria-selected={selectedTicketId === ticket.id}
                          role="listitem"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-medium text-[#0A5ED7]">#{ticket.ticketNumber}</span>
                            <span className="text-[10px] text-[#0B1F3B]/60 dark:text-white/60">{formatDate(ticket.createdAt)}</span>
                          </div>
                          <p className="text-sm font-medium text-[#0B1F3B] dark:text-white truncate mb-2">
                            {ticket.subject}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-[10px] ${getStatusColor(ticket.status)}`}>
                              {t(`supportDashboard.statuses.${ticket.status}`, ticket.status.replace('_', ' '))}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] ${getPriorityColor(ticket.priority)}`}>
                              {t(`supportDashboard.priorities.${ticket.priority}`, ticket.priority)}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-8">
            <Card className="bg-white dark:bg-[#151A23] border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30 h-[calc(100vh-300px)] flex flex-col" data-testid="panel-chat-area">
              {!selectedTicket ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <MessageCircle className="w-16 h-16 text-[#0B1F3B]/30 dark:text-white/30 mb-4" aria-hidden="true" />
                  <h3 className="font-['Poppins',Helvetica] font-semibold text-lg text-[#0B1F3B] dark:text-white mb-2">
                    {t('supportDashboard.selectTicket', 'Select a Ticket')}
                  </h3>
                  <p className="text-sm text-[#0B1F3B]/60 dark:text-white/60">
                    {t('supportDashboard.selectTicketDesc', 'Choose a ticket from the list to view the conversation and respond.')}
                  </p>
                </div>
              ) : (
                <>
                  <CardHeader className="border-b border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-[#0A5ED7]">#{selectedTicket.ticketNumber}</span>
                          <Badge variant="outline" className={`text-[10px] ${getStatusColor(selectedTicket.status)}`}>
                            {t(`supportDashboard.statuses.${selectedTicket.status}`, selectedTicket.status.replace('_', ' '))}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] ${getPriorityColor(selectedTicket.priority)}`}>
                            {t(`supportDashboard.priorities.${selectedTicket.priority}`, selectedTicket.priority)}
                          </Badge>
                        </div>
                        <h3 className="font-['Poppins',Helvetica] font-semibold text-lg text-[#0B1F3B] dark:text-white">
                          {selectedTicket.subject}
                        </h3>
                        <p className="text-xs text-[#0B1F3B]/60 dark:text-white/60 mt-1">
                          {t('supportDashboard.category', 'Category')}: {selectedTicket.category} | {t('supportDashboard.created', 'Created')}: {formatDate(selectedTicket.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={selectedTicket.status}
                          onValueChange={(status) => updateStatusMutation.mutate({ ticketId: selectedTicket.id, status })}
                        >
                          <SelectTrigger 
                            className="w-36 h-8 text-xs border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30" 
                            data-testid="select-update-status"
                            aria-label={t('supportDashboard.updateStatus', 'Update ticket status')}
                          >
                            <SelectValue placeholder={t('supportDashboard.updateStatus', 'Update Status')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">{t('supportDashboard.open', 'Open')}</SelectItem>
                            <SelectItem value="in_progress">{t('supportDashboard.inProgressStatus', 'In Progress')}</SelectItem>
                            <SelectItem value="waiting_customer">{t('supportDashboard.waitingCustomer', 'Waiting')}</SelectItem>
                            <SelectItem value="resolved">{t('supportDashboard.resolvedStatus', 'Resolved')}</SelectItem>
                            <SelectItem value="closed">{t('supportDashboard.closed', 'Closed')}</SelectItem>
                          </SelectContent>
                        </Select>
                        {user && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => assignTicketMutation.mutate({ ticketId: selectedTicket.id, assignTo: user.id })}
                            disabled={selectedTicket.assignedTo === user.id || assignTicketMutation.isPending}
                            className="h-8 text-xs border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30 hover:bg-[#0A5ED7]/5 dark:hover:bg-[#0A5ED7]/10"
                            data-testid="button-assign-to-me"
                            aria-label={selectedTicket.assignedTo === user.id 
                              ? t('supportDashboard.assignedToYou', 'Already assigned to you')
                              : t('supportDashboard.assignToMe', 'Assign ticket to me')
                            }
                          >
                            {assignTicketMutation.isPending ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" aria-hidden="true" />
                            ) : (
                              <UserPlus className="w-3 h-3 mr-1" aria-hidden="true" />
                            )}
                            {selectedTicket.assignedTo === user.id 
                              ? t('supportDashboard.assignedToYou', 'Assigned to You')
                              : t('supportDashboard.assignToMe', 'Assign to Me')
                            }
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full" aria-label={t('common.loading', 'Loading messages')}>
                        <Loader2 className="w-6 h-6 animate-spin text-[#0A5ED7]" aria-hidden="true" />
                      </div>
                    ) : sortedMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Clock className="w-8 h-8 text-[#0B1F3B]/40 dark:text-white/40 mb-2" aria-hidden="true" />
                        <p className="text-sm text-[#0B1F3B]/60 dark:text-white/60">
                          {t('supportDashboard.noMessages', 'No messages yet. Start the conversation!')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4" role="log" aria-label={t('supportDashboard.messageHistory', 'Message history')}>
                        {sortedMessages.map((msg) => {
                          const isOwn = msg.senderId === user?.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                              data-testid={`message-item-${msg.id}`}
                            >
                              <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                {!isOwn && (
                                  <p className="text-xs text-[#0B1F3B]/60 dark:text-white/60 mb-1 ml-1">
                                    {getSenderName(msg.senderId)}
                                  </p>
                                )}
                                <div
                                  className={`px-4 py-3 rounded-lg ${
                                    isOwn
                                      ? 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white'
                                      : 'bg-[#0B1F3B]/5 dark:bg-[#0B1F3B] text-[#0B1F3B] dark:text-white border border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30'
                                  }`}
                                >
                                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-[10px] text-[#0B1F3B]/60 dark:text-white/60">{formatTime(msg.createdAt)}</span>
                                  {isOwn && <CheckCheck className="w-3 h-3 text-[#0A5ED7]" aria-hidden="true" />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {isTyping && (
                          <div className="flex justify-start" aria-live="polite">
                            <div className="bg-[#0B1F3B]/5 dark:bg-[#0B1F3B] border border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30 px-4 py-3 rounded-lg">
                              <div className="flex gap-1" aria-label={t('supportDashboard.customerTyping', 'Customer is typing')}>
                                <span className="w-2 h-2 bg-[#0A5ED7] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-[#0A5ED7] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-[#0A5ED7] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  <div className="p-4 border-t border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30">
                    <div className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('supportDashboard.typePlaceholder', 'Type your response...')}
                        className="flex-1 border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30 bg-white dark:bg-[#0B1F3B] focus:border-[#0A5ED7] focus:ring-[#0A5ED7]"
                        disabled={sendMessageMutation.isPending}
                        data-testid="input-agent-message"
                        aria-label={t('supportDashboard.messageInput', 'Response message input')}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || sendMessageMutation.isPending}
                        className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white border-0"
                        data-testid="button-send-agent-message"
                        aria-label={t('supportDashboard.sendResponse', 'Send response')}
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                        )}
                        {t('common.send', 'Send')}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
