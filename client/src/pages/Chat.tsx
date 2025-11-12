import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Plus,
  MoreVertical,
  MessageCircle,
  Paperclip,
  Smile,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  User as UserIcon,
  Ticket,
  Upload,
  X,
  Download,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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

  // Support ticket form state
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
        title: "Support Ticket Created",
        description: "Your support ticket has been created successfully.",
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
        title: "File Uploaded",
        description: "Your file has been attached successfully.",
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

  // WebSocket event handlers
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
          title: "File Too Large",
          description: `${file.name} exceeds 50MB limit`,
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
        title: "Validation Error",
        description: "Please fill in all required fields",
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
        return 'text-blue-500';
      case 'in_progress':
        return 'text-yellow-500';
      case 'resolved':
        return 'text-green-500';
      case 'closed':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
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
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <Card className="w-80 flex flex-col border-r rounded-none bg-white dark:bg-salis-black">
        <div className="p-4 border-b dark:border-salis-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-montserrat font-semibold text-salis-black dark:text-salis-white">
              Support & Chat
            </h2>
            <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" data-testid="button-new-ticket">
                  <Ticket className="h-4 w-4 mr-1" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription>
                    Submit a support request and our team will assist you shortly.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                      data-testid="input-ticket-subject"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={ticketCategory} onValueChange={setTicketCategory}>
                      <SelectTrigger data-testid="select-ticket-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="account">Account Issue</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={ticketPriority} onValueChange={setTicketPriority}>
                      <SelectTrigger data-testid="select-ticket-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      placeholder="Provide detailed information about your issue"
                      rows={4}
                      data-testid="textarea-ticket-description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateTicket}
                    disabled={createTicketMutation.isPending}
                    data-testid="button-submit-ticket"
                  >
                    {createTicketMutation.isPending ? "Creating..." : "Create Ticket"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-salis-gray dark:text-salis-gray-light" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-conversations"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {/* Support Tickets Section */}
          {tickets.length > 0 && (
            <div className="p-2 border-b dark:border-salis-gray-dark">
              <h3 className="text-xs font-semibold text-salis-gray dark:text-salis-gray-light px-3 py-2 mb-1">
                Support Tickets
              </h3>
              {tickets.slice(0, 3).map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3 rounded-lg hover:bg-salis-gray-light/20 dark:hover:bg-salis-gray-dark/20 mb-1 cursor-pointer"
                  data-testid={`ticket-${ticket.id}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-mono text-salis-gray dark:text-salis-gray-light">
                      {ticket.ticketNumber}
                    </span>
                    <div className={cn("text-xs", getStatusColor(ticket.status))}>
                      {getStatusIcon(ticket.status)}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-salis-black dark:text-salis-white truncate mb-1">
                    {ticket.subject}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", getPriorityColor(ticket.priority))}>
                      {ticket.priority}
                    </Badge>
                    <span className="text-xs text-salis-gray dark:text-salis-gray-light">
                      {ticket.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Conversations Section */}
          <div className="p-2">
            <h3 className="text-xs font-semibold text-salis-gray dark:text-salis-gray-light px-3 py-2 mb-1">
              Conversations
            </h3>
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto text-salis-gray dark:text-salis-gray-light mb-3" />
                <p className="text-sm text-salis-gray dark:text-salis-gray-light">No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-colors mb-1",
                    selectedConversationId === conversation.id
                      ? "bg-salis-black dark:bg-salis-white text-salis-white dark:text-salis-black"
                      : "hover:bg-salis-gray-light/20 dark:hover:bg-salis-gray-dark/20"
                  )}
                  data-testid={`button-conversation-${conversation.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="bg-salis-gray dark:bg-salis-gray-dark text-salis-white font-medium">
                          {conversation.title?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium font-poppins truncate">
                          {conversation.title || 'Untitled Conversation'}
                        </p>
                        {conversation.lastMessageAt && (
                          <p className="text-xs text-salis-gray dark:text-salis-gray-light">
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-salis-gray-light/10 dark:bg-salis-black">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white dark:bg-salis-black dark:border-salis-gray-dark">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-salis-black dark:bg-salis-white text-salis-white dark:text-salis-black font-medium">
                      {selectedConversation.title?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-montserrat font-semibold text-salis-black dark:text-salis-white">
                      {selectedConversation.title || 'Untitled Conversation'}
                    </h3>
                    <p className="text-xs text-salis-gray dark:text-salis-gray-light">
                      {participants.length} participant{participants.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" data-testid="button-conversation-options">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="h-16 w-16 mx-auto text-salis-gray dark:text-salis-gray-light mb-4" />
                    <p className="text-salis-gray dark:text-salis-gray-light">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  [...messages].reverse().map((message) => {
                    const isOwnMessage = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          isOwnMessage ? "justify-end" : "justify-start"
                        )}
                        data-testid={`message-${message.id}`}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg p-3",
                            isOwnMessage
                              ? "bg-salis-black dark:bg-salis-white text-salis-white dark:text-salis-black"
                              : "bg-white dark:bg-salis-gray-dark text-salis-black dark:text-salis-white"
                          )}
                        >
                          <p className="font-poppins whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-xs opacity-70">
                              {formatDistanceToNow(new Date(message.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                            {message.isEdited && (
                              <Badge variant="outline" className="text-xs">
                                Edited
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => addReactionMutation.mutate({ messageId: message.id, emoji: '👍' })}
                            >
                              <Smile className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing Indicator */}
                {conversationTypingUsers.length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-salis-gray-dark rounded-lg px-4 py-2">
                      <p className="text-sm text-salis-gray dark:text-salis-gray-light italic">
                        {conversationTypingUsers[0].userName} is typing...
                      </p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* File Upload Preview */}
            {uploadingFiles.length > 0 && (
              <div className="px-4 py-2 border-t bg-white dark:bg-salis-black dark:border-salis-gray-dark">
                <div className="flex gap-2 flex-wrap">
                  {uploadingFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-salis-gray-light/20 dark:bg-salis-gray-dark/20 rounded px-3 py-2"
                    >
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t bg-white dark:bg-salis-black dark:border-salis-gray-dark">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-attach-file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  data-testid="input-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-24 w-24 mx-auto text-salis-gray dark:text-salis-gray-light mb-4" />
              <h3 className="font-montserrat font-semibold text-xl text-salis-black dark:text-salis-white mb-2">
                Welcome to Support & Chat
              </h3>
              <p className="text-salis-gray dark:text-salis-gray-light mb-4">
                Select a conversation or create a support ticket to get started
              </p>
              <Button
                onClick={() => setShowSupportDialog(true)}
                data-testid="button-create-ticket-cta"
              >
                <Ticket className="h-4 w-4 mr-2" />
                Create Support Ticket
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
