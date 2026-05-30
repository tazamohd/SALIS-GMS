import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { chatWebSocket } from "@/lib/chatWebSocket";
import { useAuth } from "@/hooks/useAuth";
import type { User, ChatConversation, ChatMessage } from "@shared/schema";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Send,
  Search,
  Plus,
  MessageCircle,
  User as UserIcon,
  Loader2,
  Circle,
  CheckCheck,
  Phone,
  Mail,
  Wrench,
  Car,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { StandardPageLayout } from "@/components/layouts";

interface ConversationWithDetails extends ChatConversation {
  participants?: Array<{
    userId: string;
    user?: User;
  }>;
  unreadCount?: number;
  lastMessage?: ChatMessage;
}

interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

export default function DirectMessages() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const isRtl = i18n.language === "ar";

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("");
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());
  const [userPresence, setUserPresence] = useState<Map<string, string>>(new Map());
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCustomer = user?.userType === "customer" || user?.role === "CUSTOMER";
  const isTechnician = user?.userType === "technician" || user?.role === "TECHNICIAN";

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ConversationWithDetails[]>({
    queryKey: ["/api/chat/conversations"],
    enabled: !!user?.id,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/conversations", selectedConversationId, "messages"],
    enabled: !!selectedConversationId,
  });

  const { data: technicians = [] } = useQuery<User[]>({
    queryKey: ["/api/technicians"],
    enabled: isCustomer && showNewConversationDialog,
  });

  const { data: customers = [] } = useQuery<User[]>({
    queryKey: ["/api/customers"],
    enabled: isTechnician && showNewConversationDialog,
  });

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["/api/chat/unread-count"],
    enabled: !!user?.id,
  });

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
  );

  const createConversationMutation = useMutation({
    mutationFn: async (data: { participantId: string; title?: string }) => {
      const res = await apiRequest("POST", "/api/chat/conversations", {
        type: "direct",
        title: data.title || t("directMessages.directConversation", "Direct Conversation"),
        participantIds: [data.participantId],
      });
      return res.json();
    },
    onSuccess: (conversation: ChatConversation) => {
      setSelectedConversationId(conversation.id);
      setShowNewConversationDialog(false);
      setSelectedRecipientId("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      toast({
        title: t("directMessages.conversationCreated", "Conversation Started"),
        description: t("directMessages.conversationCreatedDesc", "You can now send messages."),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error", "Error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversationId) throw new Error("No conversation selected");
      const res = await apiRequest("POST", `/api/chat/conversations/${selectedConversationId}/messages`, {
        content,
        messageType: "text",
      });
      return res.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({
        queryKey: ["/api/chat/conversations", selectedConversationId, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      setIsTyping(false);
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error", "Error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return apiRequest("POST", `/api/chat/conversations/${conversationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/unread-count"] });
    },
  });

  useEffect(() => {
    if (user?.id && user?.garageId) {
      chatWebSocket.connect(user.id, user.garageId);

      const unsubscribeNewMessage = chatWebSocket.on("new_message", (data: { conversationId: string; message: ChatMessage }) => {
        if (data.conversationId === selectedConversationId) {
          queryClient.setQueryData(
            ["/api/chat/conversations", data.conversationId, "messages"],
            (old: ChatMessage[] = []) => [...old, data.message]
          );
        }
        queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
        queryClient.invalidateQueries({ queryKey: ["/api/chat/unread-count"] });
      });

      const unsubscribeTyping = chatWebSocket.on("typing", (data: TypingIndicator) => {
        if (data.userId !== user.id && data.conversationId === selectedConversationId) {
          setTypingUsers((prev) => {
            const next = new Map(prev);
            next.set(data.userId, data.isTyping);
            if (data.isTyping) {
              setTimeout(() => {
                setTypingUsers((current) => {
                  const updated = new Map(current);
                  updated.delete(data.userId);
                  return updated;
                });
              }, 3000);
            }
            return next;
          });
        }
      });

      const unsubscribePresence = chatWebSocket.on("presence_update", (data: { userId: string; status: string }) => {
        setUserPresence((prev) => {
          const next = new Map(prev);
          next.set(data.userId, data.status);
          return next;
        });
      });

      return () => {
        unsubscribeNewMessage();
        unsubscribeTyping();
        unsubscribePresence();
      };
    }
  }, [user, selectedConversationId]);

  useEffect(() => {
    if (selectedConversationId) {
      markAsReadMutation.mutate(selectedConversationId);
    }
  }, [selectedConversationId, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedMessages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversationId) {
      sendMessageMutation.mutate(newMessage);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    if (!isTyping && selectedConversationId) {
      setIsTyping(true);
      chatWebSocket.send({
        type: "typing",
        data: {
          conversationId: selectedConversationId,
          isTyping: true,
        },
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedConversationId) {
        chatWebSocket.send({
          type: "typing",
          data: {
            conversationId: selectedConversationId,
            isTyping: false,
          },
        });
      }
    }, 2000);
  };

  const handleCreateConversation = () => {
    if (!selectedRecipientId) {
      toast({
        title: t("directMessages.selectRecipient", "Select Recipient"),
        description: t("directMessages.selectRecipientDesc", "Please select someone to message."),
        variant: "destructive",
      });
      return;
    }
    createConversationMutation.mutate({ participantId: selectedRecipientId });
  };

  const getOtherParticipant = (conversation: ConversationWithDetails): User | null => {
    if (!conversation.participants) return null;
    const other = conversation.participants.find((p) => p.userId !== user?.id);
    return other?.user || null;
  };

  const getPresenceStatus = (userId: string) => {
    return userPresence.get(userId) || "offline";
  };

  const getPresenceColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      default:
        return "bg-muted-foreground/30";
    }
  };

  const formatTime = (dateStr: string | Date | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return format(date, "HH:mm");
  };

  const directConversations = conversations.filter((c) => c.type === "direct");
  const filteredConversations = directConversations.filter((conv) =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);
  const otherParticipant = selectedConversation ? getOtherParticipant(selectedConversation) : null;
  const isOtherTyping = Array.from(typingUsers.values()).some((v) => v);

  const recipientOptions = isCustomer ? technicians : isTechnician ? customers : [];

  return (
    <StandardPageLayout
      title={t("directMessages.title", "Messages")}
      description={t("directMessages.description", "Direct messaging with customers and technicians")}
      icon={MessageCircle}
      contentClassName="!p-0 !h-[calc(100vh-4rem)]"
    >
      <div className={cn("h-full flex", isRtl && "flex-row-reverse")}>
        <Card className={cn(
          "w-80 flex flex-col border-r rounded-none bg-card border-border",
          isRtl && "border-r-0 border-l"
        )}>
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {t("directMessages.conversations", "Conversations")}
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewConversationDialog(true)}
                className="text-primary hover:text-primary/80"
                data-testid="button-new-conversation"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t("directMessages.new", "New")}
              </Button>
            </div>
            <div className="relative">
              <Search className={cn(
                "absolute top-2.5 h-4 w-4 text-muted-foreground",
                isRtl ? "right-3" : "left-3"
              )} />
              <Input
                placeholder={t("directMessages.searchConversations", "Search conversations...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("bg-background border-border", isRtl ? "pr-9" : "pl-9")}
                data-testid="input-search-conversations"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {conversationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {t("directMessages.noConversations", "No conversations yet")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowNewConversationDialog(true)}
                  >
                    {t("directMessages.startConversation", "Start a conversation")}
                  </Button>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const other = getOtherParticipant(conversation);
                  const presenceStatus = other ? getPresenceStatus(other.id) : "offline";
                  const isSelected = conversation.id === selectedConversationId;

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={cn(
                        "w-full p-3 rounded-lg mb-1 text-left transition-colors",
                        isSelected
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted border border-transparent"
                      )}
                      data-testid={`conversation-${conversation.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/20 text-primary text-sm">
                              {other?.fullName?.charAt(0) || <UserIcon className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={cn(
                              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                              getPresenceColor(presenceStatus)
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-foreground truncate">
                              {other?.fullName || conversation.title}
                            </span>
                            {conversation.lastMessageAt && (
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: false })}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {other?.userType === "technician" && (
                              <Wrench className="h-3 w-3 text-primary" />
                            )}
                            {other?.userType === "customer" && (
                              <Car className="h-3 w-3 text-primary" />
                            )}
                            <span className="text-xs text-muted-foreground capitalize">
                              {other?.userType || t("directMessages.user", "User")}
                            </span>
                          </div>
                          {(conversation as any).unreadCount > 0 && (
                            <Badge variant="destructive" className="mt-1 text-xs">
                              {(conversation as any).unreadCount} {t("directMessages.unread", "unread")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </Card>

        <div className="flex-1 flex flex-col bg-background">
          {selectedConversationId ? (
            <>
              <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {otherParticipant?.fullName?.charAt(0) || <UserIcon className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    {otherParticipant && (
                      <span
                        className={cn(
                          "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                          getPresenceColor(getPresenceStatus(otherParticipant.id))
                        )}
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {otherParticipant?.fullName || selectedConversation?.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {otherParticipant?.userType === "technician" && (
                        <>
                          <Wrench className="h-3 w-3" />
                          <span>{t("directMessages.technician", "Technician")}</span>
                        </>
                      )}
                      {otherParticipant?.userType === "customer" && (
                        <>
                          <Car className="h-3 w-3" />
                          <span>{t("directMessages.customer", "Customer")}</span>
                        </>
                      )}
                      <span className="mx-1">•</span>
                      <span className="capitalize">{getPresenceStatus(otherParticipant?.id || "")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {otherParticipant?.phone && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`tel:${otherParticipant.phone}`}>
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </a>
                    </Button>
                  )}
                  {otherParticipant?.email && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`mailto:${otherParticipant.email}`}>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : sortedMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {t("directMessages.noMessages", "No messages yet. Start the conversation!")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4" role="log">
                    {sortedMessages.map((msg, index) => {
                      const isOwn = msg.senderId === user?.id;
                      const showDate =
                        index === 0 ||
                        new Date(sortedMessages[index - 1].createdAt!).toDateString() !==
                          new Date(msg.createdAt!).toDateString();

                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="flex items-center justify-center my-4">
                              <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                {format(new Date(msg.createdAt!), "MMMM d, yyyy")}
                              </span>
                            </div>
                          )}
                          <div
                            className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                            data-testid={`message-${msg.id}`}
                          >
                            <div className={cn("max-w-[70%]", isOwn ? "order-2" : "order-1")}>
                              <div
                                className={cn(
                                  "px-4 py-2 rounded-2xl",
                                  isOwn
                                    ? "bg-primary text-primary-foreground rounded-br-sm"
                                    : "bg-muted text-foreground rounded-bl-sm"
                                )}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              </div>
                              <div
                                className={cn(
                                  "flex items-center gap-1 mt-1",
                                  isOwn ? "justify-end" : "justify-start"
                                )}
                              >
                                <span className="text-[10px] text-muted-foreground">
                                  {formatTime(msg.createdAt)}
                                </span>
                                {isOwn && (
                                  <CheckCheck className="h-3 w-3 text-primary" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isOtherTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-sm">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <div className="p-4 border-t border-border bg-card">
                <div className={cn("flex gap-2", isRtl && "flex-row-reverse")}>
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={t("directMessages.typeMessage", "Type a message...")}
                    className="flex-1 bg-background border-border"
                    disabled={sendMessageMutation.isPending}
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="button-send"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <MessageCircle className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t("directMessages.selectConversation", "Select a conversation")}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {t("directMessages.selectConversationDesc", "Choose a conversation from the list or start a new one to begin messaging.")}
              </p>
              <Button onClick={() => setShowNewConversationDialog(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                {t("directMessages.newConversation", "New Conversation")}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {t("directMessages.newConversation", "New Conversation")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {isCustomer
                ? t("directMessages.selectTechnician", "Select a technician to message")
                : t("directMessages.selectCustomer", "Select a customer to message")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipient" className="text-foreground">
                {isCustomer
                  ? t("directMessages.technician", "Technician")
                  : t("directMessages.customer", "Customer")}
              </Label>
              <Select value={selectedRecipientId} onValueChange={setSelectedRecipientId}>
                <SelectTrigger className="bg-background border-border" data-testid="select-recipient">
                  <SelectValue placeholder={t("directMessages.selectRecipient", "Select recipient")} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {recipientOptions.map((recipient) => (
                    <SelectItem key={recipient.id} value={recipient.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {recipient.fullName?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{recipient.fullName || recipient.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewConversationDialog(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={!selectedRecipientId || createConversationMutation.isPending}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-create-conversation"
            >
              {createConversationMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t("directMessages.startConversation", "Start Conversation")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
}
