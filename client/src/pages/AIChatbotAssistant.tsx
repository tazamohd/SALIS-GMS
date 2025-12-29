import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, User, Loader2, Calendar, Wrench, AlertCircle } from "lucide-react";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatbotAssistant() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { data: existingConversations, isLoading: loadingConversations } = useQuery<any[]>({
    queryKey: ["/api/chatbot/conversations"],
    enabled: !!user?.garageId,
  });

  const { data: conversationMessages } = useQuery<any>({
    queryKey: ["/api/chatbot/conversations", conversationId],
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (conversationMessages?.messages) {
      setMessages(conversationMessages.messages);
    }
  }, [conversationMessages]);

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
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/conversations", conversationId] });
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('aiChatbot.failedToSendMessage', 'Failed to send message. Please try again.'),
        variant: "destructive",
      });
    },
  });

  const diagnoseMutation = useMutation({
    mutationFn: async (symptoms: string) => {
      return await apiRequest("POST", "/api/chatbot/diagnose", { symptoms });
    },
    onSuccess: (data) => {
      const diagnosisMessage = `${t('aiChatbot.basedOnSymptoms', 'Based on your symptoms, here\'s what I found')}:\n\n${t('aiChatbot.possibleIssues', 'Possible Issues')}:\n${data.possibleIssues.map((issue: string, i: number) => `${i + 1}. ${issue}`).join('\n')}\n\n${t('aiChatbot.recommendations', 'Recommendations')}:\n${data.recommendations.map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')}\n\n${t('aiChatbot.urgency', 'Urgency')}: ${data.urgency.toUpperCase()}\n${t('aiChatbot.estimatedCost', 'Estimated Cost')}: ${data.estimatedCost || t('aiChatbot.contactUsForQuote', 'Contact us for quote')}`;
      
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
    <StandardPageLayout
      title={t('aiChatbot.title', 'AI Service Assistant')}
      description={t('aiChatbot.description', 'Ask questions, book services, or get vehicle diagnostics')}
      icon={Bot}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>{t('aiChatbot.chatWithAssistant', 'Chat with AI Assistant')}</CardTitle>
              <CardDescription>
                {t('aiChatbot.getInstantHelp', 'Get instant help with service questions and vehicle issues')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-4" data-testid="chat-messages">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>{t('aiChatbot.startConversation', 'Start a conversation! Ask me anything about')}:</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• {t('aiChatbot.servicePricingAvailability', 'Service pricing and availability')}</li>
                      <li>• {t('aiChatbot.bookingAppointments', 'Booking appointments')}</li>
                      <li>• {t('aiChatbot.vehicleDiagnosticsRepairs', 'Vehicle diagnostics and repairs')}</li>
                      <li>• {t('aiChatbot.maintenanceRecommendations', 'Maintenance recommendations')}</li>
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

              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={t('aiChatbot.typeYourMessage', 'Type your message...')}
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

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('aiChatbot.quickActions', 'Quick Actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleQuickAction(t('aiChatbot.bookOilChangeMessage', 'I need to book an oil change service'))}
                data-testid="quick-oil-change"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {t('aiChatbot.bookOilChange', 'Book Oil Change')}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleQuickAction(t('aiChatbot.viewServicesMessage', 'What services do you offer?'))}
                data-testid="quick-services"
              >
                <Wrench className="w-4 h-4 mr-2" />
                {t('aiChatbot.viewServices', 'View Services')}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleQuickAction(t('aiChatbot.checkEngineLightMessage', 'My check engine light is on. What should I do?'))}
                data-testid="quick-diagnosis"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                {t('aiChatbot.checkEngineLight', 'Check Engine Light')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('aiChatbot.features', 'Features')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">{t('aiChatbot.aiBadge', 'AI')}</Badge>
                <span className="text-gray-600 dark:text-gray-400">
                  {t('aiChatbot.naturalLanguageUnderstanding', 'Natural language understanding')}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">{t('aiChatbot.alwaysAvailable', '24/7')}</Badge>
                <span className="text-gray-600 dark:text-gray-400">
                  {t('aiChatbot.alwaysAvailableDesc', 'Always available')}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">{t('aiChatbot.smartBadge', 'Smart')}</Badge>
                <span className="text-gray-600 dark:text-gray-400">
                  {t('aiChatbot.contextAwareResponses', 'Context-aware responses')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardPageLayout>
  );
}
