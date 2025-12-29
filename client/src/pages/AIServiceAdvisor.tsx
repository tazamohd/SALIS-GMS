import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, Wrench, DollarSign, Clock, CheckCircle } from "lucide-react";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";

interface Message {
  role: "user" | "assistant";
  content: string;
  recommendations?: Recommendation[];
  timestamp: string;
}

interface Recommendation {
  service: string;
  urgency: "high" | "medium" | "low";
  cost: number;
  duration: number;
  reason: string;
}

export default function AIServiceAdvisor() {
  const { t } = useTranslation();
  
  const initialMessages: Message[] = [
    {
      role: "assistant",
      content: t('aiServiceAdvisor.welcomeMessage', "Hello! I'm your AI Service Advisor. I can help you diagnose vehicle issues, recommend services, and provide cost estimates. How can I assist you today?"),
      timestamp: new Date().toISOString()
    }
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const exampleQueries = [
    t('aiServiceAdvisor.exampleBrakeNoise', 'My car is making a squeaking noise when I brake'),
    t('aiServiceAdvisor.exampleMaintenance', 'What maintenance does my 2019 Honda Civic need at 50,000 miles?'),
    t('aiServiceAdvisor.exampleCheckEngine', 'Check engine light is on, what could be wrong?'),
    t('aiServiceAdvisor.exampleBrakeCost', 'How much does a complete brake service cost?')
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const recommendations: Recommendation[] = [];
    let response = "";

    if (input.toLowerCase().includes("brake") || input.toLowerCase().includes("squeak")) {
      response = t('aiServiceAdvisor.brakeNoiseResponse', "Based on the squeaking noise when braking, I've identified potential issues. Here are my recommendations:");
      recommendations.push(
        {
          service: t('aiServiceAdvisor.brakePadReplacement', 'Brake Pad Replacement'),
          urgency: "high",
          cost: 280,
          duration: 2,
          reason: t('aiServiceAdvisor.brakePadReason', 'Worn brake pads are the most common cause of squeaking. Your vehicle history shows brake pads are at 3mm (replace at 2mm).')
        },
        {
          service: t('aiServiceAdvisor.brakeRotorInspection', 'Brake Rotor Inspection'),
          urgency: "medium",
          cost: 0,
          duration: 0.5,
          reason: t('aiServiceAdvisor.brakeRotorReason', 'Free inspection to check for warping or scoring that could cause noise.')
        },
        {
          service: t('aiServiceAdvisor.brakeFluidFlush', 'Brake Fluid Flush'),
          urgency: "low",
          cost: 120,
          duration: 1,
          reason: t('aiServiceAdvisor.brakeFluidReason', 'Recommended every 30,000 miles. Your vehicle is at 28,500 miles.')
        }
      );
    } else if (input.toLowerCase().includes("maintenance") || input.toLowerCase().includes("miles")) {
      response = t('aiServiceAdvisor.maintenanceResponse', "For a 2019 Honda Civic at 50,000 miles, here's the recommended maintenance schedule:");
      recommendations.push(
        {
          service: t('aiServiceAdvisor.majorServicePackage', 'Major Service Package'),
          urgency: "high",
          cost: 450,
          duration: 3,
          reason: t('aiServiceAdvisor.majorServiceReason', '50K miles is a major service interval including oil change, filter replacements, and inspections.')
        },
        {
          service: t('aiServiceAdvisor.transmissionFluidService', 'Transmission Fluid Service'),
          urgency: "medium",
          cost: 180,
          duration: 1.5,
          reason: t('aiServiceAdvisor.transmissionFluidReason', 'Honda recommends transmission fluid service at 45-60K miles for CVT transmissions.')
        },
        {
          service: t('aiServiceAdvisor.tireRotationAlignment', 'Tire Rotation & Alignment'),
          urgency: "medium",
          cost: 95,
          duration: 1,
          reason: t('aiServiceAdvisor.tireRotationReason', 'Regular rotation extends tire life. Alignment check prevents uneven wear.')
        }
      );
    } else if (input.toLowerCase().includes("check engine") || input.toLowerCase().includes("light")) {
      response = t('aiServiceAdvisor.checkEngineResponse', "The check engine light can indicate various issues. I recommend a diagnostic scan first:");
      recommendations.push(
        {
          service: t('aiServiceAdvisor.obdDiagnosticScan', 'OBD-II Diagnostic Scan'),
          urgency: "high",
          cost: 95,
          duration: 0.5,
          reason: t('aiServiceAdvisor.obdDiagnosticReason', 'Identifies the specific error code(s) causing the check engine light. Essential first step.')
        },
        {
          service: t('aiServiceAdvisor.oxygenSensorInspection', 'Oxygen Sensor Inspection'),
          urgency: "medium",
          cost: 220,
          duration: 1.5,
          reason: t('aiServiceAdvisor.oxygenSensorReason', 'O2 sensors are a common cause of check engine lights (accounts for 35% of cases).')
        }
      );
    } else {
      response = t('aiServiceAdvisor.genericResponse', "I can help you with various automotive services and diagnostics. Could you provide more details about your vehicle issue or what service you're interested in?");
    }

    const assistantMessage: Message = {
      role: "assistant",
      content: response,
      recommendations,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900";
      case "medium": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900";
      case "low": return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800";
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "high": return t('aiServiceAdvisor.urgencyHigh', 'high');
      case "medium": return t('aiServiceAdvisor.urgencyMedium', 'medium');
      case "low": return t('aiServiceAdvisor.urgencyLow', 'low');
      default: return urgency;
    }
  };

  return (
    <StandardPageLayout
      title={t('aiServiceAdvisor.title', 'AI Service Advisor')}
      description={t('aiServiceAdvisor.description', 'Natural language service recommendations powered by advanced AI')}
      icon={Bot}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-500" />
              {t('aiServiceAdvisor.aiAssistant', 'AI Assistant')}
            </CardTitle>
            <CardDescription>
              {t('aiServiceAdvisor.describeIssue', 'Describe your issue or ask about recommended services')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {messages.map((message, idx) => (
                  <div key={idx} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
                      <div className={`rounded-lg p-4 ${
                        message.role === "user" 
                          ? "bg-blue-500 text-white ml-auto" 
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      
                      {message.recommendations && message.recommendations.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.recommendations.map((rec, recIdx) => (
                            <Card key={recIdx} className={`border ${getUrgencyColor(rec.urgency)}`} data-testid={`card-recommendation-${recIdx}`}>
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white" data-testid={`text-service-name-${recIdx}`}>
                                        {rec.service}
                                      </h4>
                                      <Badge variant="outline" className={getUrgencyColor(rec.urgency)} data-testid={`badge-urgency-${recIdx}`}>
                                        {getUrgencyLabel(rec.urgency)}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400" data-testid={`text-reason-${recIdx}`}>
                                      {rec.reason}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    <span data-testid={`text-cost-${recIdx}`}>${rec.cost}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span data-testid={`text-duration-${recIdx}`}>{rec.duration} {t('aiServiceAdvisor.hours', 'hrs')}</span>
                                  </div>
                                  <Button size="sm" variant="outline" className="ml-auto" data-testid={`button-book-${recIdx}`}>
                                    {t('aiServiceAdvisor.bookService', 'Book Service')}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                placeholder={t('aiServiceAdvisor.inputPlaceholder', 'Describe your issue or ask a question...')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                data-testid="input-message"
              />
              <Button onClick={handleSend} data-testid="button-send">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">{t('aiServiceAdvisor.quickQuestions', 'Quick Questions')}</CardTitle>
              <CardDescription>{t('aiServiceAdvisor.tryCommonQueries', 'Try these common queries')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {exampleQueries.map((query, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => setInput(query)}
                  data-testid={`button-example-${idx}`}
                >
                  <MessageCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{query}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800" data-testid="card-insights">
            <CardHeader>
              <CardTitle className="text-lg">{t('aiServiceAdvisor.aiInsights', 'AI Insights')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg" data-testid="card-accuracy">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white" data-testid="text-accuracy">{t('aiServiceAdvisor.accuracy', '95% Accuracy')}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('aiServiceAdvisor.aiDiagnosticAccuracyRate', 'AI diagnostic accuracy rate')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg" data-testid="card-response-time">
                <Wrench className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white" data-testid="text-response-time">{t('aiServiceAdvisor.responseTime', '2.3 Min')}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('aiServiceAdvisor.averageResponseTime', 'Average response time')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg" data-testid="card-avg-cost">
                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white" data-testid="text-avg-cost">{t('aiServiceAdvisor.avgCost', '$420 Avg')}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('aiServiceAdvisor.perRecommendedService', 'Per recommended service')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardPageLayout>
  );
}
