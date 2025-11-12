import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, User, Loader2, Calendar, Wrench, AlertCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatbotAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch existing conversations on mount
  const { data: existingConversations, isLoading: loadingConversations } = useQuery<any[]>({
    queryKey: ["/api/chatbot/conversations"],
    enabled: !!user?.garageId,
  });

  // Fetch messages for active conversation
  const { data: conversationMessages } = useQuery<any>({
    queryKey: ["/api/chatbot/conversations", conversationId],
    enabled: !!conversationId,
  });

  // Update messages when conversation data loads
  useEffect(() => {
    if (conversationMessages?.messages) {
      setMessages(conversationMessages.messages);
    }
  }, [conversationMessages]);

  // Create conversation on mount or load existing one
  useEffect(() => {
    if (user && !conversationId && !loadingConversations && existingConversations) {
      const activeConv = existingConversations.find((c) => c.status === "active");
      if (activeConv) {
        setConversationId(activeConv.id);
      } else {
        createConversationMutation.mutate({});
      }
    }
  }, [user, conversationId, loadingConversations, existingConversations]);

  const createConversationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/chatbot/conversation", data);
    },
    onSuccess: (data) => {
      setConversationId(data.id);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: string; message: string }) => {
      return await apiRequest("POST", "/api/chatbot/message", data);
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: data.userMessage },
        { role: "assistant", content: data.aiResponse },
      ]);
      setInputMessage("");
      // Invalidate conversation query to keep cache in sync
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/conversations", conversationId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const diagnoseMutation = useMutation({
    mutationFn: async (symptoms: string) => {
      return await apiRequest("POST", "/api/chatbot/diagnose", { symptoms });
    },
    onSuccess: (data) => {
      const diagnosisMessage = `Based on your symptoms, here's what I found:\n\nPossible Issues:\n${data.possibleIssues.map((issue: string, i: number) => `${i + 1}. ${issue}`).join('\n')}\n\nRecommendations:\n${data.recommendations.map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')}\n\nUrgency: ${data.urgency.toUpperCase()}\nEstimated Cost: ${data.estimatedCost || 'Contact us for quote'}`;
      
      setMessages((prev) => [...prev, { role: "assistant", content: diagnosisMessage }]);
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !conversationId) return;

    sendMessageMutation.mutate({
      conversationId,
      message: inputMessage,
    });
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-600" />
            AI Service Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Ask questions, book services, or get vehicle diagnostics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Chat with AI Assistant</CardTitle>
                <CardDescription>
                  Get instant help with service questions and vehicle issues
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-4" data-testid="chat-messages">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                      <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p>Start a conversation! Ask me anything about:</p>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Service pricing and availability</li>
                        <li>• Booking appointments</li>
                        <li>• Vehicle diagnostics and repairs</li>
                        <li>• Maintenance recommendations</li>
                      </ul>
                    </div>
                  )}

                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      data-testid={`message-${msg.role}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}

                  {sendMessageMutation.isPending && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your message..."
                    disabled={sendMessageMutation.isPending || !conversationId}
                    data-testid="chat-input"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || sendMessageMutation.isPending || !conversationId}
                    data-testid="send-button"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction("I need to book an oil change service")}
                  data-testid="quick-oil-change"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Oil Change
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction("What services do you offer?")}
                  data-testid="quick-services"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  View Services
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction("My check engine light is on. What should I do?")}
                  data-testid="quick-diagnosis"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Check Engine Light
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">AI</Badge>
                  <span className="text-gray-600 dark:text-gray-400">
                    Natural language understanding
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">24/7</Badge>
                  <span className="text-gray-600 dark:text-gray-400">
                    Always available
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">Smart</Badge>
                  <span className="text-gray-600 dark:text-gray-400">
                    Context-aware responses
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
