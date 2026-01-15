import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import {
  Package,
  Send,
  Inbox,
  Building2,
  ShoppingCart,
  BarChart3,
  ArrowLeft,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface PartsNetworkLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/parts-network",
    icon: LayoutDashboard,
  },
  {
    title: "Send Request",
    titleAr: "إرسال طلب",
    href: "/parts-network/send-request",
    icon: Send,
  },
  {
    title: "My Requests",
    titleAr: "طلباتي",
    href: "/parts-network/my-requests",
    icon: Inbox,
  },
  {
    title: "Incoming Requests",
    titleAr: "الطلبات الواردة",
    href: "/parts-network/incoming-requests",
    icon: Inbox,
    badge: "supplier",
  },
  {
    title: "Quotations",
    titleAr: "عروض الأسعار",
    href: "/parts-network/quotations",
    icon: BarChart3,
  },
  {
    title: "Orders",
    titleAr: "الطلبات",
    href: "/parts-network/orders",
    icon: ShoppingCart,
  },
  {
    title: "Network Members",
    titleAr: "أعضاء الشبكة",
    href: "/parts-network/members",
    icon: Building2,
  },
];

export default function PartsNetworkLayout({ children, title, description }: PartsNetworkLayoutProps) {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/parts-network/notifications/unread-count"],
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-[#64748B] dark:text-[#64748B]">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="font-bold text-[#0B1F3B] dark:text-white">Parts Network</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          data-testid="toggle-sidebar"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 z-40 h-screen w-64 
            transform transition-transform duration-200 ease-in-out
            lg:transform-none bg-white dark:bg-[#151A23] border-r border-[#E2E8F0] dark:border-[#232A36]
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <ScrollArea className="h-full py-4">
            {/* Logo / Back */}
            <div className="px-4 mb-6 hidden lg:block">
              <Link href="/">
                <Button variant="ghost" className="w-full justify-start gap-2 text-[#64748B] hover:text-[#0B1F3B] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            {/* Network Title */}
            <div className="px-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-[#0B1F3B] dark:text-white">{t("partsNetwork.title", "Parts Network")}</h2>
                  <p className="text-xs text-[#64748B]">{t("partsNetwork.subtitle", "B2B Parts Marketplace")}</p>
                </div>
              </div>
            </div>

            <Separator className="bg-[#E2E8F0] dark:bg-[#232A36] mb-4" />

            {/* Navigation */}
            <nav className="px-3 space-y-1">
              {navigationItems.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 ${
                        isActive
                          ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white shadow-sm"
                          : "text-[#64748B] hover:text-[#0B1F3B] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                      data-testid={`nav-${item.href.split("/").pop()}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.href === "/parts-network/notifications" && unreadCount?.count ? (
                        <Badge variant="destructive" className="ml-auto">
                          {unreadCount.count}
                        </Badge>
                      ) : null}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            <Separator className="bg-[#E2E8F0] dark:bg-[#232A36] my-4" />

            {/* Quick Stats */}
            <div className="px-4 space-y-3">
              <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg p-3 text-center border border-[#E2E8F0] dark:border-[#232A36]">
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">12</p>
                  <p className="text-xs text-[#64748B]">Open Requests</p>
                </div>
                <div className="bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg p-3 text-center border border-[#E2E8F0] dark:border-[#232A36]">
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">8</p>
                  <p className="text-xs text-[#64748B]">New Quotes</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen bg-[#F8FAFC] dark:bg-[#0E1117]">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{title}</h1>
              {description && <p className="text-[#64748B] mt-1">{description}</p>}
            </div>

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
