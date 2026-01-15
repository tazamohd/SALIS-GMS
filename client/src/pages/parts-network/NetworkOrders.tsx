import PartsNetworkLayout from "./PartsNetworkLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Package,
  Search,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Building2,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface NetworkOrder {
  id: string;
  orderNumber: string;
  partName: string;
  partNumber: string | null;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  currency: string;
  sellerName: string;
  sellerCity: string;
  deliveryMethod: string;
  deliveryAddress: string | null;
  expectedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  status: string;
  paymentStatus: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  createdAt: string;
}

const sampleOrders: NetworkOrder[] = [
  {
    id: "1",
    orderNumber: "ORD-2025-001",
    partName: "Front Brake Pads Set",
    partNumber: "04465-33450",
    quantity: 2,
    unitPrice: "250.00",
    totalAmount: "525.00",
    currency: "SAR",
    sellerName: "Al-Faisal Auto Parts",
    sellerCity: "Riyadh",
    deliveryMethod: "delivery",
    deliveryAddress: "123 King Fahd Road, Riyadh",
    expectedDeliveryDate: "2025-01-18T00:00:00Z",
    actualDeliveryDate: null,
    status: "shipped",
    paymentStatus: "paid",
    trackingNumber: "SA123456789",
    trackingUrl: "https://track.example.com/SA123456789",
    createdAt: "2025-01-15T14:00:00Z",
  },
  {
    id: "2",
    orderNumber: "ORD-2025-002",
    partName: "Oil Filter",
    partNumber: "15400-RTA-003",
    quantity: 5,
    unitPrice: "45.00",
    totalAmount: "225.00",
    currency: "SAR",
    sellerName: "Parts Hub KSA",
    sellerCity: "Dammam",
    deliveryMethod: "pickup",
    deliveryAddress: null,
    expectedDeliveryDate: null,
    actualDeliveryDate: "2025-01-14T16:30:00Z",
    status: "delivered",
    paymentStatus: "paid",
    trackingNumber: null,
    trackingUrl: null,
    createdAt: "2025-01-14T10:00:00Z",
  },
  {
    id: "3",
    orderNumber: "ORD-2025-003",
    partName: "Alternator Assembly",
    partNumber: "23100-28041",
    quantity: 1,
    unitPrice: "850.00",
    totalAmount: "900.00",
    currency: "SAR",
    sellerName: "Saudi Parts Company",
    sellerCity: "Jeddah",
    deliveryMethod: "delivery",
    deliveryAddress: "456 Prince Sultan Road, Jeddah",
    expectedDeliveryDate: "2025-01-20T00:00:00Z",
    actualDeliveryDate: null,
    status: "processing",
    paymentStatus: "pending",
    trackingNumber: null,
    trackingUrl: null,
    createdAt: "2025-01-13T11:00:00Z",
  },
];

export default function NetworkOrders() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders } = useQuery<NetworkOrder[]>({
    queryKey: ["/api/parts-network/orders"],
  });

  const displayOrders = orders || sampleOrders;

  const filteredOrders = displayOrders.filter(order => {
    const matchesSearch = 
      order.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-[#64748B]/20 text-[#64748B]";
      case "confirmed": return "bg-[#0A5ED7]/20 text-[#0A5ED7]";
      case "processing": return "bg-[#F97316]/20 text-[#F97316]";
      case "shipped": return "bg-purple-500/20 text-purple-500";
      case "delivered": return "bg-green-500/20 text-green-500";
      case "cancelled": return "bg-red-500/20 text-red-500";
      default: return "bg-[#64748B]/20 text-[#64748B]";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "confirmed": return <CheckCircle className="h-4 w-4" />;
      case "processing": return <Package className="h-4 w-4" />;
      case "shipped": return <Truck className="h-4 w-4" />;
      case "delivered": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "paid": return "text-green-500";
      case "pending": return "text-[#F97316]";
      case "partial": return "text-[#F97316]";
      case "refunded": return "text-red-500";
      default: return "text-[#64748B]";
    }
  };

  return (
    <PartsNetworkLayout 
      title={t("partsNetwork.myOrders", "My Orders")} 
      description={t("partsNetwork.myOrdersDescription", "Track your parts orders")}
    >
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input
            placeholder="Search by order number, part, or seller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
            data-testid="input-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-purple-500/10 border-purple-500/30 dark:bg-purple-500/10 dark:border-purple-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-500">
              {displayOrders.filter(o => o.status === "shipped").length}
            </p>
            <p className="text-sm text-[#64748B]">In Transit</p>
          </CardContent>
        </Card>
        <Card className="bg-[#F97316]/10 border-[#F97316]/30 dark:bg-[#F97316]/10 dark:border-[#F97316]/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-[#F97316]">
              {displayOrders.filter(o => o.status === "processing").length}
            </p>
            <p className="text-sm text-[#64748B]">Processing</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30 dark:bg-green-500/10 dark:border-green-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-500">
              {displayOrders.filter(o => o.status === "delivered").length}
            </p>
            <p className="text-sm text-[#64748B]">Delivered</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0A5ED7]/10 border-[#0A5ED7]/30 dark:bg-[#0A5ED7]/10 dark:border-[#0A5ED7]/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-[#0A5ED7]">
              {displayOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0).toLocaleString()} SAR
            </p>
            <p className="text-sm text-[#64748B]">Total Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card 
            key={order.id} 
            className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors"
            data-testid={`order-card-${order.id}`}
          >
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Order Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-lg ${
                    order.status === "shipped" ? "bg-purple-500/20" : 
                    order.status === "delivered" ? "bg-green-500/20" : "bg-[#F8FAFC] dark:bg-[#0E1117]"
                  }`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[#0B1F3B] dark:text-white">{order.partName}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#64748B]">
                      {order.orderNumber}
                      {order.partNumber && ` • ${order.partNumber}`}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[#64748B]">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {order.sellerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {order.sellerCity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="flex flex-col items-start lg:items-center gap-1 min-w-40">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[#64748B]" />
                    <span className="text-sm capitalize text-[#0B1F3B] dark:text-white">{order.deliveryMethod}</span>
                  </div>
                  {order.status === "shipped" && order.expectedDeliveryDate && (
                    <p className="text-sm text-[#0A5ED7]">
                      Expected: {format(new Date(order.expectedDeliveryDate), "MMM d")}
                    </p>
                  )}
                  {order.status === "delivered" && order.actualDeliveryDate && (
                    <p className="text-sm text-green-500">
                      Delivered: {format(new Date(order.actualDeliveryDate), "MMM d")}
                    </p>
                  )}
                  {order.trackingNumber && (
                    <a 
                      href={order.trackingUrl || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-[#0A5ED7] hover:underline"
                    >
                      Track: {order.trackingNumber}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* Price & Payment */}
                <div className="flex flex-col items-end gap-1 min-w-32">
                  <p className="text-xl font-bold text-[#0B1F3B] dark:text-white">
                    {order.totalAmount} <span className="text-sm text-[#64748B]">{order.currency}</span>
                  </p>
                  <p className="text-sm text-[#64748B]">
                    {order.quantity} x {order.unitPrice}
                  </p>
                  <p className={`text-sm ${getPaymentColor(order.paymentStatus)}`}>
                    Payment: {order.paymentStatus}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7]">
                    View Details
                  </Button>
                  {order.status === "delivered" && (
                    <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7]">
                      Leave Review
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-[#64748B] mb-4" />
              <h3 className="font-medium text-lg mb-2 text-[#0B1F3B] dark:text-white">No Orders Found</h3>
              <p className="text-[#64748B]">
                Your orders will appear here once you place them
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PartsNetworkLayout>
  );
}
