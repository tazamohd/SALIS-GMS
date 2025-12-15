import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Send,
  Inbox,
  MessageSquare,
  Building2,
  Bell,
  ShoppingCart,
  BarChart3,
  Settings,
  ArrowLeft,
  Menu,
  X,
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
    icon: Package,
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
    title: "Messages",
    titleAr: "الرسائل",
    href: "/parts-network/messages",
    icon: MessageSquare,
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
  {
    title: "Notifications",
    titleAr: "الإشعارات",
    href: "/parts-network/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    titleAr: "الإعدادات",
    href: "/parts-network/settings",
    icon: Settings,
  },
];

export default function PartsNetworkLayout({ children, title, description }: PartsNetworkLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/parts-network/notifications/unread-count"],
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-800">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="font-bold">Parts Network</h1>
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
            lg:transform-none bg-gray-950 border-r border-gray-800
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <ScrollArea className="h-full py-4">
            {/* Logo / Back */}
            <div className="px-4 mb-6 hidden lg:block">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start gap-2 text-gray-400 hover:text-white">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            {/* Network Title */}
            <div className="px-4 mb-6">
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6 text-blue-500" />
                <div>
                  <h2 className="font-bold text-lg">Parts Network</h2>
                  <p className="text-xs text-gray-400">شبكة قطع الغيار B2B</p>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-800 mb-4" />

            {/* Navigation */}
            <nav className="px-2 space-y-1">
              {navigationItems.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-3 ${
                        isActive
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
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

            <Separator className="bg-gray-800 my-4" />

            {/* Quick Stats */}
            <div className="px-4 space-y-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-400">12</p>
                  <p className="text-xs text-gray-400">Open Requests</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">8</p>
                  <p className="text-xs text-gray-400">New Quotes</p>
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
        <main className="flex-1 min-h-screen">
          <div className="p-4 lg:p-6">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && <p className="text-gray-400 mt-1">{description}</p>}
            </div>

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
