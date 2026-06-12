import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2,
  Maximize2,
  Clock,
  CheckCheck,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
}

export function CustomerChatWidget() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: supportTickets = [] } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support/tickets'],
    enabled: isOpen && !!user,
  });

  const activeTicket = supportTickets.find(t => t.conversationId === activeConversationId);

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/conversations', activeConversationId, 'messages'],
    enabled: !!activeConversationId,
    refetchInterval: isConnected ? false : 5000,
  });

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const createTicketMutation = useMutation({
    mutationFn: async (data: { subject: string; category: string }) => {
      const res = await apiRequest('POST', '/api/support/tickets', {
        subject: data.subject,
        category: data.category,
        priority: 'medium',
        createConversation: true,
        // Active UI locale so Arabic requests can be routed to an Arabic agent.
        language: i18n.language,
      });
      return res.json() as Promise<SupportTicket>;
    },
    onSuccess: (ticket: SupportTicket) => {
      setActiveConversationId(ticket.conversationId);
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      toast({
        title: t('supportChat.ticketCreated', 'Support Request Created'),
        description: t('supportChat.ticketCreatedDesc', 'Our team will respond shortly.'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('supportChat.createError', 'Failed to create support request'),
        variant: 'destructive',
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeConversationId) throw new Error('No active conversation');
      const res = await apiRequest('POST', `/api/chat/conversations/${activeConversationId}/messages`, {
        content,
        messageType: 'text',
      });
      return res.json();
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ 
        queryKey: ['/api/chat/conversations', activeConversationId, 'messages'] 
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('supportChat.sendError', 'Failed to send message'),
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
        console.log('Chat WebSocket connected');
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
            if (data.data.conversationId === activeConversationId) {
              queryClient.invalidateQueries({ 
                queryKey: ['/api/chat/conversations', activeConversationId, 'messages'] 
              });
            }
          } else if (data.type === 'typing') {
            if (data.data.conversationId === activeConversationId && data.data.userId !== user.id) {
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
        console.log('Chat WebSocket disconnected');
        setIsConnected(false);
        setWs(null);
        
        if (isOpen && reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectWebSocket();
          }, delay);
        }
      };

      socket.onerror = (error) => {
        console.error('Chat WebSocket error:', error);
        setIsConnected(false);
      };

      setWs(socket);
      wsRef.current = socket;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  };

  useEffect(() => {
    if (!isOpen || !user) return;

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
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sortedMessages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const handleStartNewChat = () => {
    createTicketMutation.mutate({
      subject: t('supportChat.newInquiry', 'Customer Inquiry'),
      category: 'general',
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-[#0A5ED7]/10 text-[#0A5ED7] border-[#0A5ED7]/30';
      case 'in_progress':
        return 'bg-[#0BB3FF]/10 text-[#0BB3FF] border-[#0BB3FF]/30';
      case 'resolved':
        return 'bg-[#0A5ED7]/20 text-[#0A5ED7] border-[#0A5ED7]/40';
      case 'closed':
        return 'bg-[#0B1F3B]/10 text-[#0B1F3B] dark:text-white/60 border-[#0B1F3B]/30';
      default:
        return 'bg-[#0B1F3B]/10 text-[#0B1F3B] dark:text-white/60 border-[#0B1F3B]/30';
    }
  };

  if (!user) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-[#0B1F3B] rounded-xl shadow-2xl border border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30 flex flex-col z-50 overflow-hidden"
            data-testid="panel-chat-widget"
            role="dialog"
            aria-label={t('supportChat.title', 'Support Chat')}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                <span className="font-['Poppins',Helvetica] font-semibold">
                  {t('supportChat.title', 'Support Chat')}
                </span>
                {isConnected && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" aria-label={t('supportChat.connected', 'Connected')} />
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-white hover:bg-white/20"
                  onClick={() => setIsMinimized(true)}
                  data-testid="button-minimize-chat"
                  aria-label={t('supportChat.minimize', 'Minimize chat')}
                >
                  <Minimize2 className="w-4 h-4" aria-hidden="true" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-white hover:bg-white/20"
                  onClick={() => setIsOpen(false)}
                  data-testid="button-close-chat"
                  aria-label={t('supportChat.close', 'Close chat')}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            {!activeConversationId ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#0B1F3B]/5 dark:bg-[#0B1F3B]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-[#0A5ED7]" aria-hidden="true" />
                </div>
                <h3 className="font-['Poppins',Helvetica] font-semibold text-lg text-[#0B1F3B] dark:text-white mb-2">
                  {t('supportChat.welcome', 'Need Help?')}
                </h3>
                <p className="text-sm text-[#0B1F3B]/60 dark:text-white/60 mb-6">
                  {t('supportChat.welcomeDesc', 'Our support team is here to assist you with any questions.')}
                </p>
                
                {supportTickets.length > 0 && (
                  <div className="w-full mb-4">
                    <p className="text-xs text-[#0B1F3B]/60 dark:text-white/60 mb-2">{t('supportChat.recentTickets', 'Recent Conversations')}</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {supportTickets.slice(0, 3).map((ticket) => (
                        <button
                          key={ticket.id}
                          onClick={() => setActiveConversationId(ticket.conversationId)}
                          className="w-full p-2 rounded-lg border border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30 hover:bg-[#0A5ED7]/5 dark:hover:bg-[#0A5ED7]/10 transition-colors text-left bg-white dark:bg-[#151A23]"
                          data-testid={`button-ticket-${ticket.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-[#0A5ED7]">
                              #{ticket.ticketNumber}
                            </span>
                            <Badge variant="outline" className={`text-[10px] ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-[#0B1F3B] dark:text-white truncate mt-1">{ticket.subject}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={handleStartNewChat}
                  disabled={createTicketMutation.isPending}
                  className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white border-0"
                  data-testid="button-start-chat"
                >
                  {createTicketMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  ) : (
                    <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                  )}
                  {createTicketMutation.isPending 
                    ? t('supportChat.starting', 'Starting...')
                    : t('supportChat.startChat', 'Start New Chat')
                  }
                </Button>
              </div>
            ) : (
              <>
                {activeTicket && (
                  <div className="px-4 py-2 border-b border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30 bg-[#0A5ED7]/5 dark:bg-[#0B1F3B]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#0A5ED7]">#{activeTicket.ticketNumber}</span>
                        <Badge variant="outline" className={`text-[10px] ${getStatusColor(activeTicket.status)}`}>
                          {activeTicket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs text-[#0A5ED7] hover:text-[#0BB3FF] hover:bg-[#0A5ED7]/10"
                        onClick={() => setActiveConversationId(null)}
                        data-testid="button-back-to-list"
                      >
                        {t('supportChat.backToList', 'Back')}
                      </Button>
                    </div>
                  </div>
                )}

                <ScrollArea className="flex-1 p-4 bg-[#0B1F3B]/5 dark:bg-[#0B1F3B]">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-[#0A5ED7]" aria-label={t('common.loading', 'Loading')} />
                    </div>
                  ) : sortedMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Clock className="w-8 h-8 text-[#0B1F3B]/40 dark:text-white/40 mb-2" aria-hidden="true" />
                      <p className="text-sm text-[#0B1F3B]/60 dark:text-white/60">
                        {t('supportChat.noMessages', 'No messages yet. Start the conversation!')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3" role="log" aria-label={t('supportChat.messageHistory', 'Message history')}>
                      {sortedMessages.map((msg) => {
                        const isOwn = msg.senderId === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            data-testid={`message-item-${msg.id}`}
                          >
                            <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                              <div
                                className={`px-3 py-2 rounded-lg ${
                                  isOwn
                                    ? 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white'
                                    : 'bg-white dark:bg-[#151A23] text-[#0B1F3B] dark:text-white border border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30'
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
                          <div className="bg-white dark:bg-[#151A23] border border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30 px-3 py-2 rounded-lg">
                            <div className="flex gap-1" aria-label={t('supportChat.agentTyping', 'Agent is typing')}>
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

                <div className="p-4 border-t border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30 bg-white dark:bg-[#151A23]">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={t('supportChat.typePlaceholder', 'Type your message...')}
                      className="flex-1 border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30 bg-white dark:bg-[#0B1F3B] focus:border-[#0A5ED7] focus:ring-[#0A5ED7]"
                      disabled={sendMessageMutation.isPending}
                      data-testid="input-chat-message"
                      aria-label={t('supportChat.messageInput', 'Chat message input')}
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!message.trim() || sendMessageMutation.isPending}
                      className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white border-0"
                      data-testid="button-send-message"
                      aria-label={t('supportChat.send', 'Send message')}
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Send className="w-4 h-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isMinimized && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 right-6 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 cursor-pointer z-50 border-0"
          onClick={() => setIsMinimized(false)}
          data-testid="button-restore-chat"
          aria-label={t('supportChat.restore', 'Restore chat window')}
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm font-medium">{t('supportChat.title', 'Support Chat')}</span>
          <Maximize2 className="w-4 h-4" aria-hidden="true" />
        </motion.button>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white shadow-lg flex items-center justify-center z-50 hover:shadow-xl transition-shadow border-0"
        data-testid="button-chat-toggle"
        aria-label={isOpen ? t('supportChat.close', 'Close support chat') : t('supportChat.open', 'Open support chat')}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <MessageCircle className="w-6 h-6" aria-hidden="true" />}
      </motion.button>
    </>
  );
}

export default CustomerChatWidget;
