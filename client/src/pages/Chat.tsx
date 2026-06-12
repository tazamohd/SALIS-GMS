import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { chatWebSocket } from "@/lib/chatWebSocket";
import type { User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Send,
  Search,
  MoreVertical,
  MessageCircle,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Ticket,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { StandardPageLayout } from "@/components/layouts";

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
  replyToId: string | null;
  isEdited: boolean;
  editedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
}

interface ChatParticipant {
  id: string;
  conversationId: string;
  userId: string;
  role: string;
  lastReadAt: Date | null;
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  assignedTo: string | null;
  category: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  conversationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
}

interface ChatAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  createdAt: Date;
}

interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

interface TypingIndicator {
  userId: string;
  conversationId: string;
  userName: string;
}

interface PresenceUpdate {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
}

export default function Chat() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator>>(new Map());
  const [userPresence, setUserPresence] = useState<Map<string, string>>(new Map());
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketCategory, setTicketCategory] = useState("");
  const [ticketPriority, setTicketPriority] = useState("medium");

  const { data: conversations = [] } = useQuery<ChatConversation[]>({
    queryKey: ['/api/chat/conversations'],
  });

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/conversations', selectedConversationId, 'messages'],
    enabled: !!selectedConversationId,
  });

  const { data: participants = [] } = useQuery<ChatParticipant[]>({
    queryKey: ['/api/chat/conversations', selectedConversationId, 'participants'],
    enabled: !!selectedConversationId,
  });

  const { data: tickets = [] } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support/tickets'],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      return apiRequest('POST', `/api/chat/conversations/${selectedConversationId}/messages`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/chat/conversations', selectedConversationId, 'messages'],
      });
      setNewMessage("");
      setUploadingFiles([]);
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: {
      subject: string;
      description: string;
      category: string;
      priority: string;
    }) => {
      return apiRequest('POST', '/api/support/tickets', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      setShowSupportDialog(false);
      setTicketSubject("");
      setTicketDescription("");
      setTicketCategory("");
      setTicketPriority("medium");
      toast({
        title: t('chat.ticketCreated', 'Support Ticket Created'),
        description: t('chat.ticketCreatedDesc', 'Your support ticket has been created successfully.'),
      });
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: async ({ messageId, file }: { messageId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/chat/messages/${messageId}/attachments`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('chat.fileUploaded', 'File Uploaded'),
        description: t('chat.fileUploadedDesc', 'Your file has been attached successfully.'),
      });
    },
  });

  const addReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      return apiRequest('POST', `/api/chat/messages/${messageId}/reactions`, { emoji });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/chat/conversations', selectedConversationId, 'messages'],
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return apiRequest('POST', `/api/chat/conversations/${conversationId}/read`, {});
    },
  });

  useEffect(() => {
    if (user?.id && user?.garageId) {
      chatWebSocket.connect(user.id, user.garageId);

      const unsubscribeNewMessage = chatWebSocket.on('new_message', (data: { conversationId: string; message: ChatMessage }) => {
        queryClient.setQueryData(
          ['/api/chat/conversations', data.conversationId, 'messages'],
          (old: ChatMessage[] = []) => [data.message, ...old]
        );
        queryClient.invalidateQueries({
          queryKey: ['/api/chat/conversations'],
        });
      });

      const unsubscribeMessageUpdated = chatWebSocket.on('message_updated', (data: { messageId: string; message: ChatMessage }) => {
        queryClient.setQueryData(
          ['/api/chat/conversations', data.message.conversationId, 'messages'],
          (old: ChatMessage[] = []) =>
            old.map(msg => msg.id === data.messageId ? data.message : msg)
        );
      });

      const unsubscribeMessageDeleted = chatWebSocket.on('message_deleted', (data: { messageId: string; conversationId: string }) => {
        queryClient.setQueryData(
          ['/api/chat/conversations', data.conversationId, 'messages'],
          (old: ChatMessage[] = []) =>
            old.filter(msg => msg.id !== data.messageId)
        );
      });

      const unsubscribeTyping = chatWebSocket.on('user_typing', (data: TypingIndicator) => {
        if (data.userId !== user.id) {
          setTypingUsers(prev => {
            const next = new Map(prev);
            next.set(data.userId, data);
            setTimeout(() => {
              setTypingUsers(current => {
                const updated = new Map(current);
                updated.delete(data.userId);
                return updated;
              });
            }, 3000);
            return next;
          });
        }
      });

      const unsubscribePresence = chatWebSocket.on('presence_update', (data: PresenceUpdate) => {
        setUserPresence(prev => {
          const next = new Map(prev);
          next.set(data.userId, data.status);
          return next;
        });
      });

      return () => {
        unsubscribeNewMessage();
        unsubscribeMessageUpdated();
        unsubscribeMessageDeleted();
        unsubscribeTyping();
        unsubscribePresence();
        chatWebSocket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversationId) {
      markAsReadMutation.mutate(selectedConversationId);
    }
  }, [selectedConversationId, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversationId) {
      sendMessageMutation.mutate({ content: newMessage });
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    if (!isTyping && selectedConversationId) {
      setIsTyping(true);
      chatWebSocket.send({
        type: 'typing',
        data: {
          conversationId: selectedConversationId,
          userName: user?.fullName || 'User',
        },
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: t('chat.fileTooLarge', 'File Too Large'),
          description: t('chat.fileSizeLimit', '{{name}} exceeds 50MB limit', { name: file.name }),
          variant: "destructive",
        });
        return false;
      }
      return true;
    });
    setUploadingFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateTicket = () => {
    if (!ticketSubject.trim() || !ticketDescription.trim() || !ticketCategory) {
      toast({
        title: t('chat.validationError', 'Validation Error'),
        description: t('chat.fillAllFields', 'Please fill in all required fields'),
        variant: "destructive",
      });
      return;
    }

    createTicketMutation.mutate({
      subject: ticketSubject,
      description: ticketDescription,
      category: ticketCategory,
      priority: ticketPriority,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-[#0A5ED7]';
      case 'in_progress':
        return 'text-[#F97316]';
      case 'resolved':
        return 'text-green-500';
      case 'closed':
        return 'text-[#64748B]';
      default:
        return 'text-[#64748B]';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-[#F97316]';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-[#64748B]';
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const conversationTypingUsers = Array.from(typingUsers.values()).filter(
    t => t.conversationId === selectedConversationId
  );

  return (
    <StandardPageLayout
      title={t('chat.title', 'Support & Chat')}
      description={t('chat.description', 'Real-time messaging and support ticket management')}
      icon={MessageCircle}
      contentClassName="!p-0 !h-[calc(100vh-4rem)]"
    >
      <div className="h-full flex">
        <Card className="w-80 flex flex-col border-r rounded-none bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <div className="p-4 border-b border-[#E2E8F0] dark:border-[#232A36]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-montserrat font-semibold text-[#0B1F3B] dark:text-white">
                {t('chat.messages', 'Messages')}
              </h2>
              <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-[#0A5ED7] dark:text-[#0BB3FF]" data-testid="button-new-ticket">
                    <Ticket className="h-4 w-4 mr-1" />
                    {t('chat.newTicket', 'New Ticket')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <DialogHeader>
                    <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('chat.createSupportTicket', 'Create Support Ticket')}</DialogTitle>
                    <DialogDescription className="text-[#64748B]">
                      {t('chat.supportTicketDesc', 'Submit a support request and our team will assist you shortly.')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="subject" className="text-[#0B1F3B] dark:text-white">{t('chat.subject', 'Subject')} *</Label>
                      <Input
                        id="subject"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder={t('chat.subjectPlaceholder', 'Brief description of your issue')}
                        className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                        data-testid="input-ticket-subject"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category" className="text-[#0B1F3B] dark:text-white">{t('chat.category', 'Category')} *</Label>
                      <Select value={ticketCategory} onValueChange={setTicketCategory}>
                        <SelectTrigger data-testid="select-ticket-category" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                          <SelectValue placeholder={t('chat.selectCategory', 'Select category')} />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="technical">{t('chat.technicalSupport', 'Technical Support')}</SelectItem>
                          <SelectItem value="billing">{t('chat.billing', 'Billing')}</SelectItem>
                          <SelectItem value="feature">{t('chat.featureRequest', 'Feature Request')}</SelectItem>
                          <SelectItem value="bug">{t('chat.bugReport', 'Bug Report')}</SelectItem>
                          <SelectItem value="account">{t('chat.accountIssue', 'Account Issue')}</SelectItem>
                          <SelectItem value="other">{t('chat.other', 'Other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="priority" className="text-[#0B1F3B] dark:text-white">{t('chat.priority', 'Priority')}</Label>
                      <Select value={ticketPriority} onValueChange={setTicketPriority}>
                        <SelectTrigger data-testid="select-ticket-priority" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="low">{t('chat.low', 'Low')}</SelectItem>
                          <SelectItem value="medium">{t('chat.medium', 'Medium')}</SelectItem>
                          <SelectItem value="high">{t('chat.high', 'High')}</SelectItem>
                          <SelectItem value="urgent">{t('chat.urgent', 'Urgent')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description" className="text-[#0B1F3B] dark:text-white">{t('chat.description', 'Description')} *</Label>
                      <Textarea
                        id="description"
                        value={ticketDescription}
                        onChange={(e) => setTicketDescription(e.target.value)}
                        placeholder={t('chat.descriptionPlaceholder', 'Provide detailed information about your issue')}
                        rows={4}
                        className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                        data-testid="textarea-ticket-description"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleCreateTicket}
                      disabled={createTicketMutation.isPending}
                      className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                      data-testid="button-submit-ticket"
                    >
                      {createTicketMutation.isPending ? t('chat.creating', 'Creating...') : t('chat.createTicket', 'Create Ticket')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder={t('chat.searchConversations', 'Search conversations...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                data-testid="input-search-conversations"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {tickets.length > 0 && (
              <div className="p-2 border-b border-[#E2E8F0] dark:border-[#232A36]">
                <h3 className="text-xs font-semibold text-[#64748B] px-3 py-2 mb-1">
                  {t('chat.supportTickets', 'Support Tickets')}
                </h3>
                {tickets.slice(0, 3).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] mb-1 cursor-pointer"
                    data-testid={`ticket-${ticket.id}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-mono text-[#64748B]">
                        {ticket.ticketNumber}
                      </span>
                      <div className={cn("text-xs", getStatusColor(ticket.status))}>
                        {getStatusIcon(ticket.status)}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-[#0B1F3B] dark:text-white truncate mb-1">
                      {ticket.subject}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-xs text-white", getPriorityColor(ticket.priority))}>
                        {ticket.priority}
                      </Badge>
                      <span className="text-xs text-[#64748B]">
                        {ticket.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-2">
              <h3 className="text-xs font-semibold text-[#64748B] px-3 py-2 mb-1">
                {t('chat.conversations', 'Conversations')}
              </h3>
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto text-[#64748B] mb-3" />
                  <p className="text-sm text-[#64748B]">{t('chat.noConversations', 'No conversations yet')}</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-colors mb-1",
                      selectedConversationId === conversation.id
                        ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                        : "hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] text-[#0B1F3B] dark:text-white"
                    )}
                    data-testid={`button-conversation-${conversation.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className={cn(
                            "font-medium",
                            selectedConversationId === conversation.id
                              ? "bg-white/20 text-white"
                              : "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                          )}>
                            {conversation.title?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium font-poppins truncate">
                            {conversation.title || t('chat.untitledConversation', 'Untitled Conversation')}
                          </p>
                          {conversation.lastMessageAt && (
                            <p className={cn(
                              "text-xs",
                              selectedConversationId === conversation.id
                                ? "text-white/70"
                                : "text-[#64748B]"
                            )}>
                              {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                                addSuffix: true,
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        <div className="flex-1 flex flex-col bg-[#F8FAFC] dark:bg-[#0E1117]">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white font-medium">
                        {selectedConversation.title?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                        {selectedConversation.title || t('chat.untitledConversation', 'Untitled Conversation')}
                      </h3>
                      {conversationTypingUsers.length > 0 && (
                        <p className="text-sm text-[#64748B]">
                          {conversationTypingUsers.map(u => u.userName).join(', ')} {t('chat.isTyping', 'is typing...')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-[#64748B] hover:text-[#0B1F3B] dark:hover:text-white">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.slice().reverse().map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.senderId === user?.id ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg p-3",
                          message.senderId === user?.id
                            ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                            : "bg-white dark:bg-[#151A23] text-[#0B1F3B] dark:text-white border border-[#E2E8F0] dark:border-[#232A36]"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={cn(
                          "text-xs mt-1",
                          message.senderId === user?.id ? "text-white/60" : "text-[#64748B]"
                        )}>
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
                {uploadingFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {uploadingFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-[#F8FAFC] dark:bg-[#0E1117] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#232A36]"
                      >
                        <span className="text-sm truncate max-w-[150px] text-[#0B1F3B] dark:text-white">{file.name}</span>
                        <button onClick={() => removeFile(index)} className="text-[#64748B] hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#64748B] hover:text-[#0A5ED7]"
                    data-testid="button-attach-file"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder={t('chat.typeMessage', 'Type a message...')}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={handleKeyPress}
                    className="flex-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                    data-testid="button-send-message"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto text-[#64748B] mb-4" />
                <h3 className="text-xl font-semibold text-[#0B1F3B] dark:text-white mb-2">
                  {t('chat.selectConversation', 'Select a conversation')}
                </h3>
                <p className="text-[#64748B]">
                  {t('chat.selectConversationDesc', 'Choose a conversation from the sidebar to start chatting')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </StandardPageLayout>
  );
}
