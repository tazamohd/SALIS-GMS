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
        return <Badge variant="outline" className="border-[#0A5ED7] text-[#0A5ED7] dark:border-[#0BB3FF] dark:text-[#0BB3FF]">Open</Badge>;
      case "reviewing":
        return <Badge variant="outline" className="border-[#F97316] text-[#F97316]">Reviewing</Badge>;
      case "ordered":
        return <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">Ordered</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "submitted":
        return <Badge variant="secondary" className="bg-[#F8FAFC] text-[#64748B] dark:bg-[#232A36] dark:text-[#64748B]">Submitted</Badge>;
      case "selected":
        return <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">Selected</Badge>;
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
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg">
                <Send className="h-5 w-5 text-[#0A5ED7]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{displayStats.openRequests}</p>
                <p className="text-xs text-[#64748B]">Open Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg">
                <Inbox className="h-5 w-5 text-[#0A5ED7]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{displayStats.pendingQuotes}</p>
                <p className="text-xs text-[#64748B]">Pending Quotes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg">
                <MessageSquare className="h-5 w-5 text-[#0A5ED7]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{displayStats.unreadMessages}</p>
                <p className="text-xs text-[#64748B]">Unread Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg">
                <ShoppingCart className="h-5 w-5 text-[#0A5ED7]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{displayStats.activeOrders}</p>
                <p className="text-xs text-[#64748B]">Active Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg">
                <Users className="h-5 w-5 text-[#0A5ED7]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{displayStats.networkMembers}</p>
                <p className="text-xs text-[#64748B]">Network Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] border-transparent hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{displayStats.totalSavings}</p>
                <p className="text-xs text-white/80">SAR Saved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-xl">
                <Send className="h-6 w-6 text-[#0A5ED7]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-[#0B1F3B] dark:text-white">Request Quotation</h3>
                <p className="text-sm text-[#64748B]">Send a new part price request to suppliers</p>
              </div>
              <Link href="/parts-network/send-request">
                <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white" data-testid="btn-send-request">
                  Send Request
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-xl">
                <Inbox className="h-6 w-6 text-[#0A5ED7]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-[#0B1F3B] dark:text-white">View Incoming Requests</h3>
                <p className="text-sm text-[#64748B]">Respond to quotation requests from garages</p>
              </div>
              <Link href="/parts-network/incoming-requests">
                <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white" data-testid="btn-view-incoming">
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
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">Recent Requests</CardTitle>
                <CardDescription className="text-[#64748B]">Your latest quotation requests</CardDescription>
              </div>
              <Link href="/parts-network/my-requests">
                <Button variant="ghost" size="sm" className="text-[#64748B] hover:text-[#0A5ED7]">
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
                  className="flex items-center justify-between p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors"
                  data-testid={`request-${request.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-[#151A23] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                      <Package className="h-5 w-5 text-[#0A5ED7]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{request.partName}</p>
                      <p className="text-sm text-[#64748B]">
                        {request.requestNumber} • {request.brand}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    {getStatusBadge(request.status)}
                    <p className="text-sm text-[#64748B]">
                      {request.responseCount} quotes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Quotations */}
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">Recent Quotations</CardTitle>
                <CardDescription className="text-[#64748B]">Latest price offers received</CardDescription>
              </div>
              <Link href="/parts-network/quotations">
                <Button variant="ghost" size="sm" className="text-[#64748B] hover:text-[#0A5ED7]">
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
                  className="flex items-center justify-between p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors"
                  data-testid={`quote-${quote.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-[#151A23] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                      <CheckCircle className="h-5 w-5 text-[#0A5ED7]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{quote.partName}</p>
                      <p className="text-sm text-[#64748B]">
                        {quote.supplierName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-bold text-[#0B1F3B] dark:text-white">
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
      <Card className="mt-6 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] border-transparent text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Network Performance</h3>
                <p className="text-white/80">Your parts network is performing well this month</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">94%</p>
                <p className="text-sm text-white/80">Response Rate</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">2.4h</p>
                <p className="text-sm text-white/80">Avg. Response</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">18%</p>
                <p className="text-sm text-white/80">Cost Savings</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PartsNetworkLayout>
  );
}
