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
      <DialogContent className="sm:max-w-[600px] p-0 bg-midnight-blue border-dark-steel" data-testid="modal-quick-actions">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="font-['Poppins',Helvetica] font-semibold text-xl text-chrome-silver flex items-center gap-2">
            <Command className="w-5 h-5 text-electric-blue" />
            Quick Actions
          </DialogTitle>
          <DialogDescription className="sr-only">
            Search and navigate to common actions and pages in the SALIS AUTO management system
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-chrome-silver/70" />
            <Input
              type="text"
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-dark-steel bg-dark-steel text-chrome-silver placeholder:text-chrome-silver/50"
              data-testid="input-quick-actions-search"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {filteredActions.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-chrome-silver/60 font-['Poppins',Helvetica]">
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
                    className="w-full flex items-start gap-4 px-4 py-3 rounded-lg hover:bg-dark-steel/50 transition-colors text-left"
                    data-testid={`button-${action.id}`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-electric-blue/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-electric-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-['Poppins',Helvetica] font-medium text-sm text-chrome-silver mb-1">
                        {action.label}
                      </h3>
                      <p className="font-['Poppins',Helvetica] text-xs text-chrome-silver/70">
                        {action.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-dark-steel px-6 py-3 bg-dark-steel/30">
          <p className="text-xs text-chrome-silver/70 font-['Poppins',Helvetica] flex items-center gap-2">
            <kbd className="px-2 py-1 bg-dark-steel border border-chrome-silver/20 rounded text-chrome-silver font-mono">
              {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}
            </kbd>
            <kbd className="px-2 py-1 bg-dark-steel border border-chrome-silver/20 rounded text-chrome-silver font-mono">
              K
            </kbd>
            <span>to open quick actions</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
