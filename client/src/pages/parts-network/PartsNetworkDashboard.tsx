import PartsNetworkLayout from "./PartsNetworkLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Send,
  Inbox,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Users,
  ArrowUpRight,
} from "lucide-react";

export default function PartsNetworkDashboard() {
  const { data: stats } = useQuery<{
    openRequests: number;
    pendingQuotes: number;
    unreadMessages: number;
    activeOrders: number;
    networkMembers: number;
    totalSavings: string;
  }>({
    queryKey: ["/api/parts-network/stats"],
  });

  const { data: recentRequests } = useQuery<Array<{
    id: string;
    requestNumber: string;
    partName: string;
    brand: string;
    status: string;
    responseCount: number;
    createdAt: string;
  }>>({
    queryKey: ["/api/parts-network/requests/recent"],
  });

  const { data: recentQuotes } = useQuery<Array<{
    id: string;
    requestNumber: string;
    partName: string;
    supplierName: string;
    unitPrice: string;
    currency: string;
    status: string;
    createdAt: string;
  }>>({
    queryKey: ["/api/parts-network/quotations/recent"],
  });

  const displayStats = stats || {
    openRequests: 12,
    pendingQuotes: 8,
    unreadMessages: 5,
    activeOrders: 3,
    networkMembers: 156,
    totalSavings: "12,450",
  };

  const displayRecentRequests = recentRequests || [
    { id: "1", requestNumber: "RFQ-2025-001", partName: "Brake Pads Set", brand: "Toyota", status: "open", responseCount: 4, createdAt: "2025-01-15" },
    { id: "2", requestNumber: "RFQ-2025-002", partName: "Oil Filter", brand: "Honda", status: "reviewing", responseCount: 6, createdAt: "2025-01-14" },
    { id: "3", requestNumber: "RFQ-2025-003", partName: "Alternator", brand: "Nissan", status: "ordered", responseCount: 3, createdAt: "2025-01-13" },
  ];

  const displayRecentQuotes = recentQuotes || [
    { id: "1", requestNumber: "RFQ-2025-001", partName: "Brake Pads Set", supplierName: "Al-Faisal Auto Parts", unitPrice: "250.00", currency: "SAR", status: "submitted", createdAt: "2025-01-15" },
    { id: "2", requestNumber: "RFQ-2025-002", partName: "Oil Filter", supplierName: "Saudi Parts Co", unitPrice: "45.00", currency: "SAR", status: "selected", createdAt: "2025-01-14" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-500/20 text-blue-400";
      case "reviewing": return "bg-yellow-500/20 text-yellow-400";
      case "ordered": return "bg-green-500/20 text-green-400";
      case "cancelled": return "bg-red-500/20 text-red-400";
      case "submitted": return "bg-gray-500/20 text-gray-400";
      case "selected": return "bg-green-500/20 text-green-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <PartsNetworkLayout 
      title="Parts Network Dashboard" 
      description="لوحة تحكم شبكة قطع الغيار - B2B Marketplace"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Send className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">{displayStats.openRequests}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Open Requests</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Inbox className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold">{displayStats.pendingQuotes}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Pending Quotes</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <MessageSquare className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold">{displayStats.unreadMessages}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Unread Messages</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <ShoppingCart className="h-8 w-8 text-orange-400" />
              <span className="text-2xl font-bold">{displayStats.activeOrders}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Active Orders</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-cyan-400" />
              <span className="text-2xl font-bold">{displayStats.networkMembers}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Network Members</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-8 w-8 text-emerald-400" />
              <span className="text-2xl font-bold">{displayStats.totalSavings}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">SAR Saved</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-900/50 to-blue-800/30 border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Send className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Request Quotation</h3>
                <p className="text-sm text-gray-400">Send a new part price request to suppliers</p>
              </div>
              <Link href="/parts-network/send-request">
                <Button className="bg-blue-600 hover:bg-blue-700" data-testid="btn-send-request">
                  Send Request
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-900/50 to-green-800/30 border-green-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-full">
                <Inbox className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">View Incoming Requests</h3>
                <p className="text-sm text-gray-400">Respond to quotation requests from garages</p>
              </div>
              <Link href="/parts-network/incoming-requests">
                <Button className="bg-green-600 hover:bg-green-700" data-testid="btn-view-incoming">
                  View Requests
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Requests</CardTitle>
              <Link href="/parts-network/my-requests">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <CardDescription>Your latest quotation requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayRecentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                  data-testid={`request-${request.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium">{request.partName}</p>
                      <p className="text-sm text-gray-400">
                        {request.requestNumber} • {request.brand}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                    <p className="text-sm text-gray-400 mt-1">
                      {request.responseCount} quotes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Quotations */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Quotations</CardTitle>
              <Link href="/parts-network/quotations">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <CardDescription>Latest price offers received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayRecentQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                  data-testid={`quote-${quote.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">{quote.partName}</p>
                      <p className="text-sm text-gray-400">
                        {quote.supplierName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">
                      {quote.unitPrice} {quote.currency}
                    </p>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PartsNetworkLayout>
  );
}
