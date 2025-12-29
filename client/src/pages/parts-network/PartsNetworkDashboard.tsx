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
  CheckCircle,
  Package,
  Users,
  ArrowUpRight,
  ArrowRight,
  Clock,
  DollarSign,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="border-gray-400 text-gray-600 dark:border-gray-500 dark:text-gray-300">Open</Badge>;
      case "reviewing":
        return <Badge variant="outline" className="border-gray-500 text-gray-700 dark:border-gray-400 dark:text-gray-200">Reviewing</Badge>;
      case "ordered":
        return <Badge className="bg-gray-900 text-white dark:bg-white dark:text-gray-900">Ordered</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "submitted":
        return <Badge variant="secondary" className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">Submitted</Badge>;
      case "selected":
        return <Badge className="bg-gray-900 text-white dark:bg-white dark:text-gray-900">Selected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <PartsNetworkLayout 
      title="Parts Network Dashboard" 
      description="B2B Marketplace for Automotive Parts - لوحة تحكم شبكة قطع الغيار"
    >
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Send className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayStats.openRequests}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Open Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Inbox className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayStats.pendingQuotes}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pending Quotes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <MessageSquare className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayStats.unreadMessages}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Unread Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayStats.activeOrders}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Users className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayStats.networkMembers}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Network Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 dark:bg-white border-gray-800 dark:border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 dark:bg-gray-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-white dark:text-gray-900" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white dark:text-gray-900">{displayStats.totalSavings}</p>
                <p className="text-xs text-gray-400 dark:text-gray-600">SAR Saved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-900 dark:bg-white rounded-xl">
                <Send className="h-6 w-6 text-white dark:text-gray-900" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Request Quotation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Send a new part price request to suppliers</p>
              </div>
              <Link href="/parts-network/send-request">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900" data-testid="btn-send-request">
                  Send Request
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-900 dark:bg-white rounded-xl">
                <Inbox className="h-6 w-6 text-white dark:text-gray-900" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">View Incoming Requests</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Respond to quotation requests from garages</p>
              </div>
              <Link href="/parts-network/incoming-requests">
                <Button variant="outline" className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800" data-testid="btn-view-incoming">
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
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Recent Requests</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">Your latest quotation requests</CardDescription>
              </div>
              <Link href="/parts-network/my-requests">
                <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayRecentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                  data-testid={`request-${request.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{request.partName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {request.requestNumber} • {request.brand}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    {getStatusBadge(request.status)}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {request.responseCount} quotes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Quotations */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Recent Quotations</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">Latest price offers received</CardDescription>
              </div>
              <Link href="/parts-network/quotations">
                <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayRecentQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                  data-testid={`quote-${quote.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{quote.partName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {quote.supplierName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {quote.unitPrice} {quote.currency}
                    </p>
                    {getStatusBadge(quote.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Stats Summary */}
      <Card className="mt-6 bg-gray-900 dark:bg-gray-950 border-gray-800 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Network Performance</h3>
                <p className="text-gray-400">Your parts network is performing well this month</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">94%</p>
                <p className="text-sm text-gray-400">Response Rate</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">2.4h</p>
                <p className="text-sm text-gray-400">Avg. Response</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">18%</p>
                <p className="text-sm text-gray-400">Cost Savings</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PartsNetworkLayout>
  );
}
