import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, MessageSquare, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AiChatMessage, AIChatConversation } from "@shared/schema";

export default function AIChatbot() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const { data: conversations = [] } = useQuery<AIChatConversation[]>({ queryKey: ["/api/ai-chat-conversations"] });
  const { data: fetchedMessages = [] } = useQuery<AiChatMessage[]>({ 
    queryKey: ["/api/ai-chat-messages", selectedConversation],
    enabled: !!selectedConversation 
  });

  const messages = localMessages.length > 0 ? localMessages : fetchedMessages;

  const getStatusBadge = (status: string) => {
    const statuses: { [key: string]: { bg: string; text: string; icon: string } } = {
      active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: '🟢' },
      resolved: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: '✅' },
      escalated: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', icon: '⚠️' },
    };
    const s = statuses[status] || statuses.active;
    return <Badge className={`${s.bg} ${s.text} border-0`}>{s.icon} {status}</Badge>;
  };


  const handleSendMessage = async () => {
    if (!messageInput.trim() || isStreaming) return;
    
    const userMessage = messageInput;
    setMessageInput("");
    setIsStreaming(true);

    // Preserve existing messages and add new ones
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString()
    };
    
    const aiMsgId = `ai-${Date.now()}`;
    const aiMsg = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString()
    };

    // Seed with existing fetched messages to preserve history during streaming
    setLocalMessages([...fetchedMessages, userMsg, aiMsg]);

    let streamController: AbortController | null = null;
    let streamTimeout: NodeJS.Timeout | null = null;

    try {
      // Overall timeout after 60 seconds
      const controller = new AbortController();
      streamController = controller;
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch('/api/ai-chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation || undefined,
          message: userMessage
        }),
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let accumulatedText = '';
      let newConvId = selectedConversation;
      let buffer = ''; // Buffer for incomplete SSE frames

      const resetStreamTimeout = () => {
        if (streamTimeout) clearTimeout(streamTimeout);
        streamTimeout = setTimeout(() => {
          if (streamController) {
            streamController.abort();
          }
        }, 30000);
      };

      resetStreamTimeout();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (streamTimeout) clearTimeout(streamTimeout);
          break;
        }

        resetStreamTimeout();

        // Append new chunk to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE frames (ending with \n\n)
        const frames = buffer.split('\n\n');
        
        // Keep the last incomplete frame in buffer
        buffer = frames.pop() || '';
        
        // Process complete frames
        for (const frame of frames) {
          if (!frame.trim()) continue; // Skip empty frames
          
          const lines = frame.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6);
                const data = JSON.parse(jsonStr);
                
                if (data.chunk) {
                  accumulatedText += data.chunk;
                  setLocalMessages(prev => prev.map(msg =>
                    msg.id === aiMsgId ? { ...msg, content: accumulatedText } : msg
                  ));
                }
                if (data.done && data.conversationId) {
                  newConvId = data.conversationId;
                }
              } catch (e) {
                console.warn('Failed to parse SSE data:', line, e);
              }
            }
          }
        }
      }

      // Update conversation after streaming completes
      if (newConvId && !selectedConversation) {
        setSelectedConversation(newConvId);
      }
      
      // Clear local messages and refetch from backend to reconcile
      setLocalMessages([]);
      queryClient.invalidateQueries({ queryKey: ["/api/ai-chat-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-chat-messages", newConvId || selectedConversation] });
      
    } catch (error: any) {
      console.error('Streaming error:', error);
      
      const isAborted = error.name === 'AbortError' || error.message?.includes('abort');
      const errorMessage = isAborted 
        ? "Request timed out. Please try again."
        : "Failed to send message. Please try again.";
      
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
      });
      
      // Remove all local messages on error
      setLocalMessages([]);
    } finally {
      // Always cleanup
      if (streamTimeout) clearTimeout(streamTimeout);
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-salis-black min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-['Montserrat'] text-gray-900 dark:text-white mb-2">
          🤖 AI Chatbot
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-['Poppins']">
          AI-powered customer support with OpenAI integration for intelligent responses and automated tasks
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="chat" data-testid="tab-chat">
            <MessageSquare className="w-4 h-4 mr-2" /> Live Chat
          </TabsTrigger>
          <TabsTrigger value="conversations" data-testid="tab-conversations">
            <Bot className="w-4 h-4 mr-2" /> Conversations
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <TrendingUp className="w-4 h-4 mr-2" /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <Card className="lg:col-span-2 p-6 bg-white dark:bg-salis-black">
              <h2 className="text-xl font-bold font-['Montserrat'] mb-4 text-gray-900 dark:text-white">
                Chat with AI Assistant
              </h2>
              
              <ScrollArea className="h-[500px] mb-4 border border-gray-200 dark:border-gray-700 rounded p-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="font-['Poppins']">Start a conversation with the AI assistant</p>
                    <p className="text-sm mt-2">Ask about appointments, services, or vehicle status</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        data-testid={`message-${msg.id}`}
                      >
                        <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'} rounded-lg p-3`}>
                          <div className="flex items-center gap-2 mb-1">
                            {msg.role === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                            <span className="text-xs font-semibold">
                              {msg.role === 'user' ? 'You' : 'AI Assistant'}
                            </span>
                            {msg.intent && (
                              <Badge className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0">
                                {msg.intent}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-['Poppins'] text-gray-900 dark:text-gray-100">
                            {msg.content}
                          </p>
                          {msg.confidence && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Confidence: {Number(msg.confidence).toFixed(0)}%
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isStreaming}
                  data-testid="input-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isStreaming || !messageInput.trim()}
                  data-testid="button-send"
                >
                  {isStreaming ? "..." : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-white dark:bg-salis-black">
              <h3 className="text-lg font-bold font-['Montserrat'] mb-4 text-gray-900 dark:text-white">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left"
                  onClick={() => setMessageInput("I want to book an appointment")}
                  data-testid="button-book-appointment"
                >
                  📅 Book Appointment
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left"
                  onClick={() => setMessageInput("Check my vehicle status")}
                  data-testid="button-check-status"
                >
                  🚗 Check Vehicle Status
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left"
                  onClick={() => setMessageInput("Get a quote for service")}
                  data-testid="button-get-quote"
                >
                  💰 Get Quote
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left"
                  onClick={() => setMessageInput("View my service history")}
                  data-testid="button-service-history"
                >
                  📋 Service History
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                  AI Capabilities
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 font-['Poppins']">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                    Book & manage appointments
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                    Check service status
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                    Generate instant quotes
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                    Answer common questions
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversations">
          <Card className="p-6 bg-white dark:bg-salis-black">
            <h2 className="text-xl font-bold font-['Montserrat'] mb-4 text-gray-900 dark:text-white">
              Recent Conversations
            </h2>
            
            {conversations.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="font-['Poppins']">No conversations yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr className="text-left text-sm font-semibold text-gray-700 dark:text-gray-300 font-['Poppins']">
                      <th className="pb-3">Session</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Handler</th>
                      <th className="pb-3">Source</th>
                      <th className="pb-3">Created</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-['Poppins']">
                    {conversations.map((conv) => (
                      <tr
                        key={conv.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                        data-testid={`conversation-${conv.id}`}
                      >
                        <td className="py-3 text-gray-900 dark:text-gray-100">
                          {conv.sessionId || 'N/A'}
                        </td>
                        <td className="py-3">{getStatusBadge(conv.status || 'active')}</td>
                        <td className="py-3">
                          <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0">
                            {conv.handoffTo ? 'Escalated' : 'AI'}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0">
                            web
                          </Badge>
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          {conv.createdAt ? new Date(conv.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedConversation(conv.id)}
                            data-testid={`button-view-${conv.id}`}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white dark:bg-salis-black">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-['Poppins']">
                    Total Conversations
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white font-['Montserrat']" data-testid="text-total-conversations">
                    {conversations.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-salis-black">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-['Poppins']">
                    Resolved
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white font-['Montserrat']" data-testid="text-resolved">
                    {conversations.filter(c => c.status === 'resolved').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-salis-black">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-['Poppins']">
                    Active
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white font-['Montserrat']" data-testid="text-active">
                    {conversations.filter(c => c.status === 'active').length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="mt-6 p-6 bg-white dark:bg-salis-black">
            <h3 className="text-lg font-bold font-['Montserrat'] mb-4 text-gray-900 dark:text-white">
              📊 Performance Metrics
            </h3>
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="font-['Poppins']">Advanced analytics coming soon</p>
              <p className="text-sm mt-1">Response time, satisfaction scores, intent analysis</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
