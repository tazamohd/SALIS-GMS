import PartsNetworkLayout from "./PartsNetworkLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import {
  Package,
  Search,
  Filter,
  Send,
  Clock,
  MapPin,
  Car,
  AlertCircle,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";

interface IncomingRequest {
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
  deliveryPreference: string;
  requesterName: string;
  requesterCity: string;
  createdAt: string;
  expiresAt: string | null;
  hasResponded: boolean;
}

const sampleIncomingRequests: IncomingRequest[] = [
  {
    id: "1",
    requestNumber: "RFQ-2025-010",
    partNumber: "04465-33450",
    partName: "Front Brake Pads Set",
    brand: "Toyota",
    quantity: 4,
    vehicleMake: "Toyota",
    vehicleModel: "Camry",
    vehicleYear: 2022,
    urgency: "urgent",
    deliveryPreference: "delivery",
    requesterName: "Al-Madinah Auto Workshop",
    requesterCity: "Riyadh",
    createdAt: "2025-01-15T08:00:00Z",
    expiresAt: "2025-01-17T08:00:00Z",
    hasResponded: false,
  },
  {
    id: "2",
    requestNumber: "RFQ-2025-011",
    partNumber: null,
    partName: "Alternator 12V",
    brand: "Honda",
    quantity: 2,
    vehicleMake: "Honda",
    vehicleModel: "Civic",
    vehicleYear: 2021,
    urgency: "normal",
    deliveryPreference: "both",
    requesterName: "Quick Fix Garage",
    requesterCity: "Jeddah",
    createdAt: "2025-01-14T15:30:00Z",
    expiresAt: "2025-01-21T15:30:00Z",
    hasResponded: true,
  },
  {
    id: "3",
    requestNumber: "RFQ-2025-012",
    partNumber: "15400-RTA-003",
    partName: "Oil Filter Premium",
    brand: null,
    quantity: 10,
    vehicleMake: "Honda",
    vehicleModel: "Accord",
    vehicleYear: 2020,
    urgency: "low",
    deliveryPreference: "pickup",
    requesterName: "Premium Auto Services",
    requesterCity: "Dammam",
    createdAt: "2025-01-13T10:00:00Z",
    expiresAt: "2025-01-27T10:00:00Z",
    hasResponded: false,
  },
];

export default function IncomingRequests() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [respondedFilter, setRespondedFilter] = useState("all");

  const { data: requests } = useQuery<IncomingRequest[]>({
    queryKey: ["/api/parts-network/incoming-requests"],
  });

  const displayRequests = requests || sampleIncomingRequests;

  const filteredRequests = displayRequests.filter(request => {
    const matchesSearch = 
      request.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requesterName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUrgency = urgencyFilter === "all" || request.urgency === urgencyFilter;
    const matchesResponded = 
      respondedFilter === "all" || 
      (respondedFilter === "responded" && request.hasResponded) ||
      (respondedFilter === "pending" && !request.hasResponded);
    
    return matchesSearch && matchesUrgency && matchesResponded;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "bg-[#F97316]/20 text-[#F97316] border-[#F97316]/30";
      case "normal": return "bg-[#0A5ED7]/20 text-[#0A5ED7] border-[#0A5ED7]/30";
      case "low": return "bg-[#64748B]/20 text-[#64748B] border-[#64748B]/30";
      default: return "bg-[#64748B]/20 text-[#64748B] border-[#64748B]/30";
    }
  };

  const getDeliveryLabel = (pref: string) => {
    switch (pref) {
      case "delivery": return "Delivery Only";
      case "pickup": return "Pickup Only";
      case "both": return "Delivery/Pickup";
      default: return pref;
    }
  };

  return (
    <PartsNetworkLayout 
      title={t("partsNetwork.incomingRequests", "Incoming Quotation Requests")} 
      description={t("partsNetwork.incomingRequestsDescription", "Quotation requests from workshops")}
    >
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input
            placeholder="Search by part, request ID, or garage name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-2">
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-32 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-urgency-filter">
              <SelectValue placeholder="Urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={respondedFilter} onValueChange={setRespondedFilter}>
            <SelectTrigger className="w-36 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-responded-filter">
              <SelectValue placeholder="Response" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Not Responded</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-[#F97316]/10 border-[#F97316]/30 dark:bg-[#F97316]/10 dark:border-[#F97316]/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-[#F97316]">
              {displayRequests.filter(r => r.urgency === "urgent" && !r.hasResponded).length}
            </p>
            <p className="text-sm text-[#64748B]">Urgent Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0A5ED7]/10 border-[#0A5ED7]/30 dark:bg-[#0A5ED7]/10 dark:border-[#0A5ED7]/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-[#0A5ED7]">
              {displayRequests.filter(r => !r.hasResponded).length}
            </p>
            <p className="text-sm text-[#64748B]">Awaiting Response</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30 dark:bg-green-500/10 dark:border-green-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-500">
              {displayRequests.filter(r => r.hasResponded).length}
            </p>
            <p className="text-sm text-[#64748B]">Responded</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-[#64748B] mb-4" />
              <h3 className="font-medium text-lg mb-2 text-[#0B1F3B] dark:text-white">No Incoming Requests</h3>
              <p className="text-[#64748B]">
                No quotation requests match your filters
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card 
              key={request.id} 
              className={`border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors ${
                request.urgency === "urgent" && !request.hasResponded 
                  ? "bg-[#F97316]/5 border-[#F97316]/50 dark:bg-[#F97316]/5" 
                  : "bg-white dark:bg-[#151A23]"
              }`}
              data-testid={`incoming-request-${request.id}`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Part Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      request.urgency === "urgent" ? "bg-[#F97316]/20" : "bg-[#F8FAFC] dark:bg-[#0E1117]"
                    }`}>
                      <Package className={`h-6 w-6 ${
                        request.urgency === "urgent" ? "text-[#F97316]" : "text-[#0A5ED7]"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-[#0B1F3B] dark:text-white">{request.partName}</h3>
                        <Badge className={getUrgencyColor(request.urgency)}>
                          {request.urgency === "urgent" && <AlertCircle className="h-3 w-3 mr-1" />}
                          {request.urgency}
                        </Badge>
                        {request.hasResponded && (
                          <Badge className="bg-green-500/20 text-green-500">
                            Responded
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[#64748B]">
                        {request.requestNumber}
                        {request.partNumber && ` • Part: ${request.partNumber}`}
                        {request.brand && ` • Brand: ${request.brand}`}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[#64748B]">
                        {request.vehicleMake && (
                          <span className="flex items-center gap-1">
                            <Car className="h-4 w-4" />
                            {request.vehicleMake} {request.vehicleModel} {request.vehicleYear}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {getDeliveryLabel(request.deliveryPreference)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Requester & Timing */}
                  <div className="flex flex-col lg:items-end gap-2 min-w-48">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#64748B]" />
                      <span className="font-medium text-[#0B1F3B] dark:text-white">{request.requesterName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <MapPin className="h-4 w-4" />
                      {request.requesterCity}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-[#64748B]" />
                      <span className="text-[#64748B]">
                        {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {request.expiresAt && (
                      <p className="text-xs text-[#F97316]">
                        Expires: {format(new Date(request.expiresAt), "MMM d, HH:mm")}
                      </p>
                    )}
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-center px-4">
                      <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{request.quantity}</p>
                      <p className="text-xs text-[#64748B]">Qty Needed</p>
                    </div>
                    <Link href={`/parts-network/respond/${request.id}`}>
                      <Button 
                        className={request.hasResponded 
                          ? "bg-[#64748B] hover:bg-[#64748B]/80" 
                          : "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90"
                        }
                        data-testid={`btn-respond-${request.id}`}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {request.hasResponded ? "Update Quote" : "Send Quote"}
                      </Button>
                    </Link>
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
