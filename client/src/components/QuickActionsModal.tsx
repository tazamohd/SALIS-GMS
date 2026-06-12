import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Wrench,
  Calendar,
  Users,
  FileText,
  UserCog,
  ShoppingCart,
  Search,
  Command,
  Car,
  Receipt,
  Brain,
  Package,
  Shield,
  TrendingUp,
  Sparkles,
  User,
  History,
  Bell,
  MapPin,
  MessageCircle,
} from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  path: string;
  keywords: string[];
}

interface QuickActionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickActionsModal({ open, onOpenChange }: QuickActionsModalProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const quickActions: QuickAction[] = [
    {
      id: "create-job-card",
      label: "Create Job Card",
      description: "Start a new job card for a vehicle",
      icon: Wrench,
      path: "/job-cards",
      keywords: ["job", "card", "vehicle", "service", "repair", "work"],
    },
    {
      id: "new-appointment",
      label: "New Appointment",
      description: "Schedule a new customer appointment",
      icon: Calendar,
      path: "/appointments",
      keywords: ["appointment", "schedule", "booking", "calendar", "date"],
    },
    {
      id: "add-customer",
      label: "Add Customer",
      description: "Register a new customer",
      icon: Users,
      path: "/customers",
      keywords: ["customer", "client", "add", "new", "register"],
    },
    {
      id: "view-vehicles",
      label: "View Vehicles",
      description: "Manage customer vehicles",
      icon: Car,
      path: "/vehicles",
      keywords: ["vehicle", "car", "truck", "auto", "fleet", "manage"],
    },
    {
      id: "create-invoice",
      label: "Create Invoice",
      description: "Generate a new invoice",
      icon: FileText,
      path: "/invoices",
      keywords: ["invoice", "bill", "payment", "charge", "create"],
    },
    {
      id: "create-estimate",
      label: "Create Estimate",
      description: "Create a quote or estimate",
      icon: Receipt,
      path: "/estimates",
      keywords: ["estimate", "quote", "quotation", "proposal", "create"],
    },
    {
      id: "add-technician",
      label: "Add Technician",
      description: "Add a new technician to the team",
      icon: UserCog,
      path: "/technician-management",
      keywords: ["technician", "mechanic", "staff", "employee", "add"],
    },
    {
      id: "new-purchase-order",
      label: "New Purchase Order",
      description: "Create a purchase order for parts",
      icon: ShoppingCart,
      path: "/purchase-orders",
      keywords: ["purchase", "order", "parts", "supplier", "buy"],
    },
    {
      id: "smart-assignment",
      label: "Smart Job Assignment",
      description: "AI-powered technician job assignment",
      icon: Brain,
      path: "/smart-assignment",
      keywords: ["smart", "ai", "assignment", "technician", "job", "auto", "intelligent"],
    },
    {
      id: "smart-parts-recommendations",
      label: "Smart Parts Recommendations",
      description: "AI-powered parts suggestions for repairs",
      icon: Sparkles,
      path: "/smart-parts-recommendations",
      keywords: ["smart", "ai", "parts", "recommendations", "suggest", "auto"],
    },
    {
      id: "smart-parts-recommender",
      label: "Smart Parts Recommender",
      description: "Intelligent parts matching and suggestions",
      icon: Package,
      path: "/smart-parts-recommender",
      keywords: ["smart", "parts", "recommender", "match", "suggest", "inventory"],
    },
    {
      id: "smart-damage-assessment",
      label: "Smart Damage Assessment",
      description: "AI-powered vehicle damage analysis",
      icon: Shield,
      path: "/smart-damage-assessment",
      keywords: ["smart", "ai", "damage", "assessment", "analysis", "vehicle", "inspection"],
    },
    {
      id: "smart-inventory-forecasting",
      label: "Smart Inventory Forecasting",
      description: "AI-powered demand prediction for parts",
      icon: TrendingUp,
      path: "/smart-inventory-forecasting",
      keywords: ["smart", "ai", "inventory", "forecast", "prediction", "demand", "stock"],
    },
    {
      id: "customer-portal",
      label: "Customer Portal",
      description: "Access the customer self-service portal",
      icon: User,
      path: "/client/dashboard",
      keywords: ["customer", "portal", "client", "self-service", "dashboard"],
    },
    {
      id: "customer-service-history",
      label: "Customer Service History",
      description: "View customer vehicle service records",
      icon: History,
      path: "/client/service-history",
      keywords: ["customer", "service", "history", "records", "timeline", "portal"],
    },
    {
      id: "customer-reminders",
      label: "Service Reminders",
      description: "Customer service reminder notifications",
      icon: Bell,
      path: "/client/reminders",
      keywords: ["customer", "reminders", "notifications", "service", "due", "portal"],
    },
    {
      id: "customer-live-tracking",
      label: "Live Service Tracking",
      description: "Real-time vehicle service status tracking",
      icon: MapPin,
      path: "/client/live-tracking",
      keywords: ["customer", "live", "tracking", "status", "real-time", "portal"],
    },
    {
      id: "customer-review-chat",
      label: "Customer Reviews & Chat",
      description: "Customer feedback and support chat",
      icon: MessageCircle,
      path: "/client/review-chat",
      keywords: ["customer", "review", "chat", "feedback", "support", "portal"],
    },
  ];

  const filteredActions = quickActions.filter((action) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      action.label.toLowerCase().includes(query) ||
      action.description.toLowerCase().includes(query) ||
      action.keywords.some((keyword) => keyword.includes(query))
    );
  });

  const handleActionClick = (path: string) => {
    setLocation(path);
    onOpenChange(false);
    setSearchQuery("");
  };

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]" data-testid="modal-quick-actions">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="font-['Poppins',Helvetica] font-semibold text-xl text-[#0F172A] dark:text-[#E6EAF0] flex items-center gap-2">
            <Command className="w-5 h-5 text-[#0A5ED7] dark:text-[#0BB3FF]" />
            Quick Actions
          </DialogTitle>
          <DialogDescription className="sr-only">
            Search and navigate to common actions and pages in the SALIS AUTO management system
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#64748B] dark:text-[#9BA4B0]" />
            <Input
              type="text"
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117] text-[#0F172A] dark:text-[#E6EAF0] placeholder:text-[#94A3B8] dark:placeholder:text-[#6B7280]"
              data-testid="input-quick-actions-search"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {filteredActions.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-[#64748B] dark:text-[#9BA4B0] font-['Poppins',Helvetica]">
                No actions found for "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="px-2 pb-4">
              {filteredActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action.path)}
                    className="w-full flex items-start gap-4 px-4 py-3 rounded-lg hover:bg-[#0A5ED7]/10 dark:hover:bg-[#0BB3FF]/10 transition-colors text-left"
                    data-testid={`button-${action.id}`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#0A5ED7] dark:text-[#0BB3FF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-['Poppins',Helvetica] font-medium text-sm text-[#0F172A] dark:text-[#E6EAF0] mb-1">
                        {action.label}
                      </h3>
                      <p className="font-['Poppins',Helvetica] text-xs text-[#64748B] dark:text-[#9BA4B0]">
                        {action.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-[#E2E8F0] dark:border-[#232A36] px-6 py-3 bg-[#F8FAFC] dark:bg-[#0E1117]">
          <p className="text-xs text-[#64748B] dark:text-[#9BA4B0] font-['Poppins',Helvetica] flex items-center gap-2">
            <kbd className="px-2 py-1 bg-[#E2E8F0] dark:bg-[#232A36] border border-[#CBD5E1] dark:border-[#374151] rounded text-[#0F172A] dark:text-[#E6EAF0] font-mono">
              {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}
            </kbd>
            <kbd className="px-2 py-1 bg-[#E2E8F0] dark:bg-[#232A36] border border-[#CBD5E1] dark:border-[#374151] rounded text-[#0F172A] dark:text-[#E6EAF0] font-mono">
              K
            </kbd>
            <span>to open quick actions</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
