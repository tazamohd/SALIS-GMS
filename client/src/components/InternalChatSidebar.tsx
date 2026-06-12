import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { 
  MessageCircle, 
  Send, 
  Search, 
  Users, 
  Plus,
  Loader2,
  CheckCheck,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";

interface ChatConversation {
  id: string;
  title: string;
  type: string;
  lastMessageAt: Date | null;
  isActive: boolean;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: Date;
}

export function InternalChatSidebar() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ChatConversation[]>({
    queryKey: ['/api/chat/conversations'],
    enabled: isOpen && !!user,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/conversations', selectedConversation?.id, 'messages'],
    enabled: !!selectedConversation && !!user,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: showNewChatDialog && !!user,
  });

  const filteredConversations = conversations.filter(c => 
    c.type === 'direct' || c.type === 'group'
  ).filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          if (data.type === 'new_message' || data.type === 'message_updated' || data.type === 'message_deleted') {
            if (data.data?.conversationId === selectedConversation?.id) {
              queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations', selectedConversation?.id, 'messages'] });
            }
            queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
          }
        } catch (e) {
          console.error('Failed to parse chat WebSocket message:', e);
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
  }, [user, selectedConversation?.id]);

  useEffect(() => {
    if (isOpen && user) {
      connectWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isOpen, user, connectWebSocket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest('POST', `/api/chat/conversations/${selectedConversation?.id}/messages`, { content }),
    onSuccess: () => {
      setMessageContent("");
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations', selectedConversation?.id, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
    },
    onError: () => {
      toast({
        title: t('chat.error', 'Error'),
        description: t('chat.sendFailed', 'Failed to send message'),
        variant: 'destructive',
      });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: (data: { title: string; type: string; participantIds: string[] }) =>
      apiRequest('POST', '/api/chat/conversations', data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      setShowNewChatDialog(false);
      setNewChatTitle("");
      setSelectedUsers([]);
      setSelectedConversation(data);
      toast({
        title: t('chat.conversationCreated', 'Conversation created'),
        description: t('chat.conversationCreatedDesc', 'Your new conversation has been created'),
      });
    },
    onError: () => {
      toast({
        title: t('chat.error', 'Error'),
        description: t('chat.createFailed', 'Failed to create conversation'),
        variant: 'destructive',
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedConversation) return;
    sendMessageMutation.mutate(messageContent.trim());
  };

  const handleCreateConversation = () => {
    if (!newChatTitle.trim()) return;
    createConversationMutation.mutate({
      title: newChatTitle.trim(),
      type: selectedUsers.length > 1 ? 'group' : 'direct',
      participantIds: selectedUsers,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-[#0A5ED7]/10"
          data-testid="button-internal-chat"
          aria-label={t('chat.openChat', 'Open internal chat')}
        >
          <MessageCircle className="h-5 w-5 text-[#0B1F3B] dark:text-white" aria-hidden="true" />
          {wsConnected && (
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#0A5ED7] rounded-full" aria-hidden="true" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-[400px] sm:w-[450px] p-0 bg-white dark:bg-[#151A23] border-l-[#0A5ED7]/20"
        data-testid="panel-internal-chat"
      >
        <SheetHeader className="p-4 border-b border-[#0A5ED7]/10 dark:border-[#0A5ED7]/20">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-['Poppins',Helvetica] font-semibold text-lg text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#0A5ED7]" aria-hidden="true" />
              {t('chat.internalChat', 'Team Chat')}
              {wsConnected && (
                <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] text-[10px]">
                  {t('chat.live', 'Live')}
                </Badge>
              )}
            </SheetTitle>
            <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-[#0A5ED7]/10"
                  data-testid="button-new-conversation"
                  aria-label={t('chat.newConversation', 'New conversation')}
                >
                  <Plus className="h-4 w-4 text-[#0A5ED7]" aria-hidden="true" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-[#151A23] border-[#0A5ED7]/20">
                <DialogHeader>
                  <DialogTitle className="text-[#0B1F3B] dark:text-white">
                    {t('chat.newConversation', 'New Conversation')}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Input
                      placeholder={t('chat.conversationTitle', 'Conversation title...')}
                      value={newChatTitle}
                      onChange={(e) => setNewChatTitle(e.target.value)}
                      className="border-[#0A5ED7]/20 focus:border-[#0A5ED7]"
                      data-testid="input-conversation-title"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-[#0B1F3B]/60 dark:text-white/60 mb-2">
                      {t('chat.selectParticipants', 'Select participants:')}
                    </p>
                    <ScrollArea className="h-40 border rounded-md border-[#0A5ED7]/20 p-2">
                      {users.filter(u => u.id !== user.id).map((u) => (
                        <div
                          key={u.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                            selectedUsers.includes(u.id) 
                              ? 'bg-[#0A5ED7]/10' 
                              : 'hover:bg-[#0A5ED7]/5'
                          }`}
                          onClick={() => {
                            setSelectedUsers(prev =>
                              prev.includes(u.id)
                                ? prev.filter(id => id !== u.id)
                                : [...prev, u.id]
                            );
                          }}
                          data-testid={`user-option-${u.id}`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] text-white text-xs">
                              {getInitials(u.email || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-[#0B1F3B] dark:text-white">{u.email}</span>
                          {selectedUsers.includes(u.id) && (
                            <CheckCheck className="h-4 w-4 text-[#0A5ED7] ml-auto" aria-hidden="true" />
                          )}
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateConversation}
                    disabled={!newChatTitle.trim() || createConversationMutation.isPending}
                    className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90"
                    data-testid="button-create-conversation"
                  >
                    {createConversationMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                    )}
                    {t('chat.create', 'Create')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </SheetHeader>

        {!selectedConversation ? (
          <div className="flex flex-col h-[calc(100vh-80px)]">
            <div className="p-3 border-b border-[#0A5ED7]/10 dark:border-[#0A5ED7]/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0B1F3B]/40 dark:text-white/40" aria-hidden="true" />
                <Input
                  placeholder={t('chat.searchConversations', 'Search conversations...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-[#0A5ED7]/20 focus:border-[#0A5ED7] bg-[#F8FAFC] dark:bg-[#0B1F3B]/30"
                  data-testid="input-search-conversations"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {conversationsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0A5ED7]" aria-hidden="true" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                  <MessageCircle className="h-10 w-10 text-[#0B1F3B]/30 dark:text-white/30 mb-3" aria-hidden="true" />
                  <p className="text-sm text-[#0B1F3B]/60 dark:text-white/60">
                    {t('chat.noConversations', 'No conversations yet')}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-[#0A5ED7]"
                    onClick={() => setShowNewChatDialog(true)}
                    data-testid="button-start-conversation"
                  >
                    <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                    {t('chat.startConversation', 'Start a conversation')}
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-[#0A5ED7]/10 dark:divide-[#0A5ED7]/20" role="list">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="p-3 hover:bg-[#0A5ED7]/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedConversation(conversation)}
                      role="listitem"
                      data-testid={`conversation-item-${conversation.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] text-white">
                            {getInitials(conversation.title)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-[#0B1F3B] dark:text-white truncate">
                            {conversation.title}
                          </h4>
                          <p className="text-xs text-[#0B1F3B]/60 dark:text-white/60">
                            {conversation.lastMessageAt
                              ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })
                              : t('chat.noMessages', 'No messages')}
                          </p>
                        </div>
                        <Badge className={`text-[10px] ${
                          conversation.type === 'group' 
                            ? 'bg-[#0BB3FF]/10 text-[#0BB3FF]' 
                            : 'bg-[#0A5ED7]/10 text-[#0A5ED7]'
                        }`}>
                          {conversation.type === 'group' ? t('chat.group', 'Group') : t('chat.direct', 'Direct')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-80px)]">
            <div className="p-3 border-b border-[#0A5ED7]/10 dark:border-[#0A5ED7]/20 flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-[#0A5ED7]/10"
                onClick={() => setSelectedConversation(null)}
                data-testid="button-back-to-list"
                aria-label={t('chat.back', 'Back to conversations')}
              >
                <ChevronDown className="h-4 w-4 rotate-90" aria-hidden="true" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] text-white text-xs">
                  {getInitials(selectedConversation.title)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-[#0B1F3B] dark:text-white truncate">
                  {selectedConversation.title}
                </h4>
              </div>
            </div>

            <ScrollArea className="flex-1 p-3">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0A5ED7]" aria-hidden="true" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <MessageCircle className="h-8 w-8 text-[#0B1F3B]/30 dark:text-white/30 mb-2" aria-hidden="true" />
                  <p className="text-sm text-[#0B1F3B]/60 dark:text-white/60">
                    {t('chat.startTyping', 'Start the conversation!')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3" role="log" aria-label={t('chat.messageLog', 'Message log')}>
                  {messages.map((msg) => {
                    const isOwn = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        data-testid={`message-item-${msg.id}`}
                      >
                        <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-lg px-3 py-2 ${
                              isOwn
                                ? 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white'
                                : 'bg-[#F8FAFC] dark:bg-[#0B1F3B]/50 text-[#0B1F3B] dark:text-white'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <span className={`text-[10px] text-[#0B1F3B]/60 dark:text-white/60 mt-1 block ${isOwn ? 'text-right' : 'text-left'}`}>
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <div className="p-3 border-t border-[#0A5ED7]/10 dark:border-[#0A5ED7]/20">
              <div className="flex gap-2">
                <Textarea
                  placeholder={t('chat.typeMessage', 'Type a message...')}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[40px] max-h-[120px] resize-none border-[#0A5ED7]/20 focus:border-[#0A5ED7]"
                  rows={1}
                  data-testid="input-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || sendMessageMutation.isPending}
                  className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90 px-3"
                  data-testid="button-send-message"
                  aria-label={t('chat.send', 'Send message')}
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
