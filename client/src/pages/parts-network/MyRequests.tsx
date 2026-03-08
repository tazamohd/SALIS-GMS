import PartsNetworkLayout from "./PartsNetworkLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Package,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface QuotationRequest {
  id: string;
  requestNumber: string;
  partNumber: string | null;
  partName: string;
  brand: string | null;
  quantity: number;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  urgency: string;
  status: string;
  responseCount: number;
  viewCount: number;
  createdAt: string;
  expiresAt: string | null;
}

const sampleRequests: QuotationRequest[] = [
  {
    id: "1",
    requestNumber: "RFQ-2025-001",
    partNumber: "04465-33450",
    partName: "Front Brake Pads Set",
    brand: "Toyota",
    quantity: 2,
    vehicleMake: "Toyota",
    vehicleModel: "Camry",
    vehicleYear: 2022,
    urgency: "urgent",
    status: "open",
    responseCount: 4,
    viewCount: 12,
    createdAt: "2025-01-15T10:30:00Z",
    expiresAt: "2025-01-22T10:30:00Z",
  },
  {
    id: "2",
    requestNumber: "RFQ-2025-002",
    partNumber: null,
    partName: "Oil Filter",
    brand: "Honda",
    quantity: 5,
    vehicleMake: "Honda",
    vehicleModel: "Accord",
    vehicleYear: 2021,
    urgency: "normal",
    status: "reviewing",
    responseCount: 6,
    viewCount: 18,
    createdAt: "2025-01-14T14:00:00Z",
    expiresAt: "2025-01-21T14:00:00Z",
  },
  {
    id: "3",
    requestNumber: "RFQ-2025-003",
    partNumber: "23100-28041",
    partName: "Alternator Assembly",
    brand: "Nissan",
    quantity: 1,
    vehicleMake: "Nissan",
    vehicleModel: "Altima",
    vehicleYear: 2020,
    urgency: "low",
    status: "ordered",
    responseCount: 3,
    viewCount: 8,
    createdAt: "2025-01-13T09:15:00Z",
    expiresAt: null,
  },
];

export default function MyRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: requests, isLoading } = useQuery<QuotationRequest[]>({
    queryKey: ["/api/parts-network/requests"],
  });

  const displayRequests = requests || sampleRequests;

  const filteredRequests = displayRequests.filter(request => {
    const matchesSearch = 
      request.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.partNumber && request.partNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <Clock className="h-4 w-4" />;
      case "reviewing": return <Eye className="h-4 w-4" />;
      case "ordered": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      case "expired": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-[#0A5ED7]/20 text-[#0A5ED7] border-[#0A5ED7]/30";
      case "reviewing": return "bg-[#F97316]/20 text-[#F97316] border-[#F97316]/30";
      case "ordered": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "cancelled": return "bg-red-500/20 text-red-500 border-red-500/30";
      case "expired": return "bg-[#64748B]/20 text-[#64748B] border-[#64748B]/30";
      default: return "bg-[#64748B]/20 text-[#64748B] border-[#64748B]/30";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "bg-[#F97316]/20 text-[#F97316]";
      case "normal": return "bg-[#0A5ED7]/20 text-[#0A5ED7]";
      case "low": return "bg-[#64748B]/20 text-[#64748B]";
      default: return "bg-[#64748B]/20 text-[#64748B]";
    }
  };

  return (
    <PartsNetworkLayout 
      title="My Quotation Requests" 
      description="طلبات عروض الأسعار الخاصة بي"
    >
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input
            placeholder="Search by part name, number, or request ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-status-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/parts-network/send-request">
            <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white" data-testid="btn-new-request">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </Link>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-[#64748B] mb-4" />
              <h3 className="font-medium text-lg mb-2 text-[#0B1F3B] dark:text-white">No Requests Found</h3>
              <p className="text-[#64748B] mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your filters"
                  : "Start by sending your first quotation request"}
              </p>
              <Link href="/parts-network/send-request">
                <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card 
              key={request.id} 
              className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors"
              data-testid={`request-card-${request.id}`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Part Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                      <Package className="h-6 w-6 text-[#0A5ED7]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-[#0B1F3B] dark:text-white">{request.partName}</h3>
                        <Badge className={getUrgencyColor(request.urgency)}>
                          {request.urgency}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#64748B]">
                        {request.requestNumber}
                        {request.partNumber && ` • ${request.partNumber}`}
                        {request.brand && ` • ${request.brand}`}
                      </p>
                      {request.vehicleMake && (
                        <p className="text-sm text-[#64748B] mt-1">
                          {request.vehicleMake} {request.vehicleModel} {request.vehicleYear}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">{request.responseCount}</p>
                      <p className="text-[#64748B]">Quotes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#0A5ED7]">{request.viewCount}</p>
                      <p className="text-[#64748B]">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{request.quantity}</p>
                      <p className="text-[#64748B]">Qty</p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                      {getStatusIcon(request.status)}
                      {request.status}
                    </Badge>
                    <p className="text-xs text-[#64748B]">
                      {format(new Date(request.createdAt), "MMM d, yyyy")}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Link href={`/parts-network/requests/${request.id}`}>
                        <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7]" data-testid={`btn-view-${request.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7]" data-testid={`btn-messages-${request.id}`}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Messages
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PartsNetworkLayout>
  );
}
