import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TabsPageLayout } from "@/components/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Target,
  Users,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Star,
  Lightbulb,
  FileText,
  PlayCircle,
  Search,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Award
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SalesProcess {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  steps: string[];
  tips: string[];
  icon: any;
}

interface SalesScript {
  id: string;
  scenario: string;
  scenarioAr: string;
  script: string;
  objections: { objection: string; response: string }[];
}

const salesProcesses: SalesProcess[] = [
  {
    id: "1",
    title: "Customer Greeting",
    titleAr: "استقبال العميل",
    description: "First impression matters. Greet every customer warmly within 30 seconds of arrival.",
    steps: [
      "Make eye contact and smile",
      "Greet with 'Welcome to SALIS AUTO'",
      "Introduce yourself by name",
      "Ask how you can help today",
      "Offer refreshments if appropriate"
    ],
    tips: [
      "Remember returning customers by name",
      "Note vehicle details before they mention",
      "Be attentive but not pushy"
    ],
    icon: Users
  },
  {
    id: "2",
    title: "Needs Assessment",
    titleAr: "تقييم الاحتياجات",
    description: "Understand the customer's needs before suggesting services.",
    steps: [
      "Ask open-ended questions",
      "Listen actively to responses",
      "Take notes on key points",
      "Confirm understanding",
      "Identify primary and secondary needs"
    ],
    tips: [
      "Let customers explain fully before responding",
      "Ask about vehicle usage patterns",
      "Inquire about previous service experiences"
    ],
    icon: Target
  },
  {
    id: "3",
    title: "Service Presentation",
    titleAr: "عرض الخدمات",
    description: "Present services that match customer needs with clear value propositions.",
    steps: [
      "Summarize understood needs",
      "Present recommended services",
      "Explain benefits, not just features",
      "Provide transparent pricing",
      "Offer service packages when appropriate"
    ],
    tips: [
      "Use visual aids when possible",
      "Compare service levels clearly",
      "Highlight warranties and guarantees"
    ],
    icon: FileText
  },
  {
    id: "4",
    title: "Handling Objections",
    titleAr: "معالجة الاعتراضات",
    description: "Address concerns professionally and turn objections into opportunities.",
    steps: [
      "Listen without interrupting",
      "Acknowledge the concern",
      "Ask clarifying questions",
      "Provide relevant information",
      "Confirm resolution"
    ],
    tips: [
      "Never argue with customers",
      "Use 'I understand' statements",
      "Offer alternatives when possible"
    ],
    icon: MessageSquare
  },
  {
    id: "5",
    title: "Closing the Sale",
    titleAr: "إتمام البيع",
    description: "Guide customers to a decision with confidence and professionalism.",
    steps: [
      "Summarize agreed services",
      "Present final pricing",
      "Ask for the commitment",
      "Process booking/payment",
      "Confirm next steps"
    ],
    tips: [
      "Use assumptive closing when appropriate",
      "Provide written estimates",
      "Set clear expectations for timing"
    ],
    icon: CheckCircle
  }
];

const salesScripts: SalesScript[] = [
  {
    id: "1",
    scenario: "Walk-in Customer",
    scenarioAr: "عميل يدخل المعرض",
    script: "Welcome to SALIS AUTO! I'm [Name], and I'll be happy to assist you today. Is this your first time visiting us, or are you a returning customer? What brings you in today?",
    objections: [
      {
        objection: "I'm just looking around",
        response: "That's perfectly fine! Feel free to look around. If you have any questions about our services or would like a vehicle inspection, I'm here to help. May I ask what type of vehicle you have?"
      },
      {
        objection: "I don't have an appointment",
        response: "No problem at all! We welcome walk-ins. Depending on your needs, we may be able to assist you right away or schedule a convenient time. What service are you interested in today?"
      }
    ]
  },
  {
    id: "2",
    scenario: "Phone Inquiry",
    scenarioAr: "استفسار هاتفي",
    script: "Thank you for calling SALIS AUTO, this is [Name] speaking. How may I assist you today?",
    objections: [
      {
        objection: "How much does [service] cost?",
        response: "Great question! The cost depends on your specific vehicle and requirements. May I have your vehicle details so I can provide an accurate estimate? What's the make, model, and year?"
      },
      {
        objection: "I'll call back later",
        response: "Of course! Before you go, may I take your contact information so we can follow up? We're currently offering [promotion] that expires soon, and I'd hate for you to miss it."
      }
    ]
  },
  {
    id: "3",
    scenario: "Price Objection",
    scenarioAr: "اعتراض على السعر",
    script: "I understand that price is an important consideration. Let me explain the value included in our service...",
    objections: [
      {
        objection: "That's more expensive than other garages",
        response: "I appreciate you sharing that. Our pricing reflects the quality of OEM parts we use, our certified technicians, and our comprehensive warranty. Many customers find that our service prevents costly repairs later. Would you like me to show you a comparison?"
      },
      {
        objection: "Can you give me a discount?",
        response: "I'd be happy to review our current promotions with you. We're offering [current promotion]. Additionally, joining our loyalty program gives you [X]% off all services. Would you like to learn more?"
      }
    ]
  },
  {
    id: "4",
    scenario: "Upselling Service Packages",
    scenarioAr: "بيع باقات الخدمة",
    script: "Based on your vehicle's mileage and service history, I'd recommend our [Package Name] which includes [services]. This provides better value than individual services and ensures comprehensive care for your vehicle.",
    objections: [
      {
        objection: "I only need the basic service",
        response: "Absolutely, we can do the basic service. However, I noticed your vehicle is due for [additional service] which, if delayed, could lead to [consequence]. Including it now would save you [amount] compared to scheduling separately. Would you like me to add it?"
      }
    ]
  }
];

const performanceTips = [
  {
    category: "Daily Habits",
    tips: [
      "Review customer appointments before they arrive",
      "Follow up on pending quotes within 24 hours",
      "Update CRM after every customer interaction",
      "Set 3 sales goals for each day"
    ]
  },
  {
    category: "Customer Relationship",
    tips: [
      "Remember customer names and vehicle details",
      "Send thank-you messages after service completion",
      "Follow up 1 week after major services",
      "Celebrate customer milestones (birthdays, anniversaries)"
    ]
  },
  {
    category: "Product Knowledge",
    tips: [
      "Stay updated on new services and promotions",
      "Understand competitor offerings",
      "Know your most profitable service packages",
      "Learn common vehicle issues by make/model"
    ]
  }
];

export default function SalesGuide() {
  const [searchQuery, setSearchQuery] = useState("");

  const processTab = (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search processes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-process"
        />
      </div>

      <div className="grid gap-6">
        {salesProcesses
          .filter(p => 
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.titleAr.includes(searchQuery) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((process, index) => {
            const Icon = process.icon;
            return (
              <Card key={process.id} data-testid={`card-process-${process.id}`}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900">
                      <span className="text-xl font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {process.title}
                      </CardTitle>
                      <CardDescription className="text-right font-arabic">{process.titleAr}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{process.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Steps
                      </h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {process.steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        Pro Tips
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {process.tips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );

  const scriptsTab = (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="space-y-4">
        {salesScripts.map((script) => (
          <AccordionItem key={script.id} value={script.id} className="border rounded-lg px-4" data-testid={`accordion-script-${script.id}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">{script.scenario}</p>
                  <p className="text-sm text-gray-500">{script.scenarioAr}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Opening Script
                  </h4>
                  <p className="italic">"{script.script}"</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Common Objections & Responses</h4>
                  <div className="space-y-3">
                    {script.objections.map((obj, i) => (
                      <div key={i} className="border-l-4 border-gray-300 pl-4">
                        <p className="font-medium text-red-600 dark:text-red-400">❝ {obj.objection}</p>
                        <p className="mt-1 text-green-600 dark:text-green-400">
                          <ArrowRight className="h-4 w-4 inline mr-1" />
                          {obj.response}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );

  const tipsTab = (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {performanceTips.map((category, i) => (
          <Card key={i} data-testid={`card-tips-${i}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {i === 0 ? <Clock className="h-5 w-5" /> : 
                 i === 1 ? <Users className="h-5 w-5" /> : 
                 <BookOpen className="h-5 w-5" />}
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {category.tips.map((tip, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Sales Excellence Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto text-green-500" />
              <p className="mt-2 text-2xl font-bold">85%</p>
              <p className="text-sm text-gray-500">Quote Conversion Target</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Phone className="h-8 w-8 mx-auto text-blue-500" />
              <p className="mt-2 text-2xl font-bold">2 hrs</p>
              <p className="text-sm text-gray-500">Max Response Time</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Star className="h-8 w-8 mx-auto text-yellow-500" />
              <p className="mt-2 text-2xl font-bold">4.5+</p>
              <p className="text-sm text-gray-500">Customer Rating Target</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto text-purple-500" />
              <p className="mt-2 text-2xl font-bold">20%</p>
              <p className="text-sm text-gray-500">Upsell Rate Target</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const resourcesTab = (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Reference Cards</CardTitle>
            <CardDescription>Printable guides for common scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" data-testid="button-pricing-guide">
                <FileText className="h-4 w-4 mr-2" />
                Service Pricing Guide
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-comparison-chart">
                <FileText className="h-4 w-4 mr-2" />
                Package Comparison Chart
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-warranty-info">
                <FileText className="h-4 w-4 mr-2" />
                Warranty Information
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-promotions">
                <FileText className="h-4 w-4 mr-2" />
                Current Promotions
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Videos</CardTitle>
            <CardDescription>Watch and learn from the best</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" data-testid="button-video-greeting">
                <PlayCircle className="h-4 w-4 mr-2" />
                Customer Greeting Techniques
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-video-objections">
                <PlayCircle className="h-4 w-4 mr-2" />
                Handling Price Objections
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-video-upselling">
                <PlayCircle className="h-4 w-4 mr-2" />
                Effective Upselling
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-video-closing">
                <PlayCircle className="h-4 w-4 mr-2" />
                Closing Techniques
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>Need help? Reach out to the sales team lead</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" data-testid="button-call-support">
              <Phone className="h-4 w-4 mr-2" />
              Call Sales Manager
            </Button>
            <Button variant="outline" data-testid="button-email-support">
              <Mail className="h-4 w-4 mr-2" />
              Email Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <TabsPageLayout
        title="Sales Guide"
        description="دليل المبيعات - Comprehensive sales training and resources for service advisors"
        defaultTab="process"
        tabs={[
          { id: "process", label: "Sales Process", icon: Target, content: processTab },
          { id: "scripts", label: "Scripts & Responses", icon: MessageSquare, content: scriptsTab },
          { id: "tips", label: "Performance Tips", icon: TrendingUp, content: tipsTab },
          { id: "resources", label: "Resources", icon: BookOpen, content: resourcesTab },
        ]}
      />
    </div>
  );
}
