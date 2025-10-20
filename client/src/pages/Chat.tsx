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
  Send,
  Search,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  MessageCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

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

export default function Chat() {
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      return apiRequest('POST', `/api/chat/conversations/${selectedConversationId}/messages`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/chat/conversations', selectedConversationId, 'messages'],
      });
      setNewMessage("");
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

      return () => {
        unsubscribeNewMessage();
        unsubscribeMessageUpdated();
        unsubscribeMessageDeleted();
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
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <Card className="w-80 flex flex-col border-r rounded-none bg-white dark:bg-salis-black">
        <div className="p-4 border-b dark:border-salis-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-montserrat font-semibold text-salis-black dark:text-salis-white">
              Messages
            </h2>
            <Button size="sm" variant="ghost" data-testid="button-new-chat">
              <Plus className="h-4 w-4" />
            </Button>
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
          <div className="p-2">
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

      <div className="flex-1 flex flex-col bg-salis-gray-light/10 dark:bg-salis-black">
        {selectedConversation ? (
          <>
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
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-white dark:bg-salis-black dark:border-salis-gray-dark">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
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
                Select a conversation
              </h3>
              <p className="text-salis-gray dark:text-salis-gray-light">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
