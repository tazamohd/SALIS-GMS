import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Truck,
  Search,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Building2,
  Calendar,
  Phone,
  User,
  AlertTriangle,
  Navigation,
  Eye,
  MessageSquare,
  Radio,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "wouter";

interface DeliveryRecord {
  id: number;
  orderNumber: string;
  supplierName: string;
  supplierContact: string;
  supplierPhone: string;
  deliveryLocation: string;
  deliveryAddress: string;
  status: "pending" | "dispatched" | "in_transit" | "arrived" | "delivered" | "delayed";
  estimatedDelivery: string;
  actualDelivery: string | null;
  trackingNumber: string;
  carrier: string;
  items: {
    partName: string;
    quantity: number;
  }[];
  timeline: {
    status: string;
    timestamp: string;
    location: string;
    note: string;
  }[];
  guidanceNotes: string;
  additionalNotes: string;
  receivedBy: string | null;
}

const mockDeliveries: DeliveryRecord[] = [
  {
    id: 1,
    orderNumber: "PO-2024-001",
    supplierName: "AutoParts Plus",
    supplierContact: "Ahmed Al-Rashid",
    supplierPhone: "+966 50 123 4567",
    deliveryLocation: "Main Warehouse - Riyadh",
    deliveryAddress: "Industrial City, Building 45, Riyadh 12345",
    status: "in_transit",
    estimatedDelivery: "2024-12-15T14:00:00Z",
    actualDelivery: null,
    trackingNumber: "APL-2024-789456",
    carrier: "SMSA Express",
    items: [
      { partName: "Front Brake Pads - Toyota", quantity: 4 },
      { partName: "Rear Brake Pads - Toyota", quantity: 4 },
    ],
    timeline: [
      { status: "Order Placed", timestamp: "2024-12-15T08:00:00Z", location: "System", note: "Order confirmed" },
      { status: "Picked Up", timestamp: "2024-12-15T09:30:00Z", location: "AutoParts Plus Warehouse", note: "Package collected by carrier" },
      { status: "In Transit", timestamp: "2024-12-15T10:45:00Z", location: "Riyadh Distribution Center", note: "On the way to destination" },
    ],
    guidanceNotes: "Ensure parts are inspected upon delivery. Check for any visible damage.",
    additionalNotes: "Customer priority order - expedited delivery requested",
    receivedBy: null,
  },
  {
    id: 2,
    orderNumber: "PO-2024-002",
    supplierName: "Gulf Auto Supplies",
    supplierContact: "Mohammed Al-Faisal",
    supplierPhone: "+966 55 987 6543",
    deliveryLocation: "Branch Store - Jeddah",
    deliveryAddress: "Port Area, Warehouse 12, Jeddah 23456",
    status: "dispatched",
    estimatedDelivery: "2024-12-16T10:00:00Z",
    actualDelivery: null,
    trackingNumber: "GAS-2024-456123",
    carrier: "Aramex",
    items: [
      { partName: "Universal Oil Filter", quantity: 50 },
      { partName: "BMW Oil Filter", quantity: 20 },
    ],
    timeline: [
      { status: "Order Placed", timestamp: "2024-12-14T14:30:00Z", location: "System", note: "Order confirmed" },
      { status: "Processing", timestamp: "2024-12-14T16:00:00Z", location: "Gulf Auto Warehouse", note: "Order being prepared" },
      { status: "Dispatched", timestamp: "2024-12-15T08:00:00Z", location: "Gulf Auto Warehouse", note: "Handed to carrier" },
    ],
    guidanceNotes: "Bulk order - verify quantity matches invoice before signing",
    additionalNotes: "Monthly stock replenishment order",
    receivedBy: null,
  },
  {
    id: 3,
    orderNumber: "PO-2024-003",
    supplierName: "Mercedes Authorized Dealer",
    supplierContact: "Khalid Al-Mutairi",
    supplierPhone: "+966 56 456 7890",
    deliveryLocation: "Main Warehouse - Riyadh",
    deliveryAddress: "Industrial City, Building 45, Riyadh 12345",
    status: "delivered",
    estimatedDelivery: "2024-12-13T12:00:00Z",
    actualDelivery: "2024-12-13T11:30:00Z",
    trackingNumber: "MAD-2024-123789",
    carrier: "DHL Express",
    items: [
      { partName: "Mercedes Engine Gasket Set", quantity: 1 },
      { partName: "Mercedes Timing Chain Kit", quantity: 1 },
    ],
    timeline: [
      { status: "Order Placed", timestamp: "2024-12-11T09:00:00Z", location: "System", note: "Order confirmed" },
      { status: "Processing", timestamp: "2024-12-11T11:00:00Z", location: "Mercedes Parts Center", note: "Parts being packaged" },
      { status: "Dispatched", timestamp: "2024-12-12T08:00:00Z", location: "Mercedes Parts Center", note: "Shipped via DHL" },
      { status: "In Transit", timestamp: "2024-12-12T14:00:00Z", location: "Riyadh Hub", note: "Arrived at local hub" },
      { status: "Out for Delivery", timestamp: "2024-12-13T09:00:00Z", location: "Riyadh", note: "On delivery vehicle" },
      { status: "Delivered", timestamp: "2024-12-13T11:30:00Z", location: "Main Warehouse", note: "Signed by Omar Al-Hassan" },
    ],
    guidanceNotes: "OEM parts - verify authenticity with Mercedes serial numbers",
    additionalNotes: "High-value order - secure storage required",
    receivedBy: "Omar Al-Hassan",
  },
  {
    id: 4,
    orderNumber: "PO-2024-004",
    supplierName: "Premium Parts KSA",
    supplierContact: "Saad Al-Qahtani",
    supplierPhone: "+966 54 321 0987",
    deliveryLocation: "Branch Store - Dammam",
    deliveryAddress: "Industrial Zone, Unit 78, Dammam 34567",
    status: "delayed",
    estimatedDelivery: "2024-12-14T16:00:00Z",
    actualDelivery: null,
    trackingNumber: "PPK-2024-654321",
    carrier: "Fetchr",
    items: [
      { partName: "Michelin 205/55R16", quantity: 20 },
      { partName: "Bridgestone 225/45R17", quantity: 16 },
    ],
    timeline: [
      { status: "Order Placed", timestamp: "2024-12-10T10:00:00Z", location: "System", note: "Order confirmed" },
      { status: "Processing", timestamp: "2024-12-11T09:00:00Z", location: "Premium Parts Warehouse", note: "Order being prepared" },
      { status: "Dispatched", timestamp: "2024-12-12T14:00:00Z", location: "Premium Parts Warehouse", note: "Shipped" },
      { status: "Delayed", timestamp: "2024-12-14T10:00:00Z", location: "Dammam Distribution", note: "Delay due to high volume - reschedule for tomorrow" },
    ],
    guidanceNotes: "Large shipment - arrange forklift for unloading",
    additionalNotes: "Contact supplier if delay extends beyond 24 hours",
    receivedBy: null,
  },
];

export default function DeliveryTracking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);

  const deliveries = mockDeliveries;

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "in_transit" && (delivery.status === "in_transit" || delivery.status === "dispatched")) ||
      (activeTab === "delivered" && delivery.status === "delivered") ||
      (activeTab === "delayed" && delivery.status === "delayed");

    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string; icon: typeof Clock }> = {
      pending: { className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300", label: "Pending", icon: Clock },
      dispatched: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", label: "Dispatched", icon: Package },
      in_transit: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", label: "In Transit", icon: Truck },
      arrived: { className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", label: "Arrived", icon: MapPin },
      delivered: { className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "Delivered", icon: CheckCircle },
      delayed: { className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Delayed", icon: AlertTriangle },
    };
    const { className, label, icon: Icon } = config[status] || config.pending;
    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getDeliveryProgress = (status: string) => {
    const progressMap: Record<string, number> = {
      pending: 0,
      dispatched: 25,
      in_transit: 50,
      arrived: 75,
      delivered: 100,
      delayed: 50,
    };
    return progressMap[status] || 0;
  };

  const stats = [
    { label: "In Transit", value: deliveries.filter(d => d.status === "in_transit" || d.status === "dispatched").length, icon: Truck, color: "text-blue-500" },
    { label: "Arriving Today", value: deliveries.filter(d => {
      const today = new Date().toDateString();
      return new Date(d.estimatedDelivery).toDateString() === today && d.status !== "delivered";
    }).length, icon: Clock, color: "text-orange-500" },
    { label: "Delivered", value: deliveries.filter(d => d.status === "delivered").length, icon: CheckCircle, color: "text-green-500" },
    { label: "Delayed", value: deliveries.filter(d => d.status === "delayed").length, icon: AlertTriangle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Delivery Tracking
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track delivery location, time, and status for all purchase orders
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Status
              </CardTitle>
              <CardDescription>Real-time tracking for all incoming deliveries</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order or tracking #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-72"
                data-testid="input-search-deliveries"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="in_transit" data-testid="tab-in-transit">In Transit</TabsTrigger>
              <TabsTrigger value="delivered" data-testid="tab-delivered">Delivered</TabsTrigger>
              <TabsTrigger value="delayed" data-testid="tab-delayed">Delayed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredDeliveries.length === 0 ? (
                <div className="text-center py-12">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No deliveries found</p>
                </div>
              ) : (
                filteredDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className={`border rounded-lg p-4 ${
                      delivery.status === "delayed"
                        ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                        : ""
                    }`}
                    data-testid={`delivery-${delivery.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm text-gray-500">{delivery.orderNumber}</span>
                          {getStatusBadge(delivery.status)}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900 dark:text-white">{delivery.supplierName}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Delivery Location
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">{delivery.deliveryLocation}</p>
                            <p className="text-xs text-gray-500">{delivery.deliveryAddress}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {delivery.status === "delivered" ? "Delivered" : "Expected Delivery"}
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {delivery.actualDelivery
                                ? new Date(delivery.actualDelivery).toLocaleString()
                                : new Date(delivery.estimatedDelivery).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 flex items-center gap-1">
                              <Navigation className="h-3 w-3" />
                              Tracking
                            </p>
                            <p className="font-mono text-sm">{delivery.trackingNumber}</p>
                            <p className="text-xs text-gray-500">{delivery.carrier}</p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Delivery Progress</span>
                            <span className="text-xs text-gray-500">{getDeliveryProgress(delivery.status)}%</span>
                          </div>
                          <Progress value={getDeliveryProgress(delivery.status)} className="h-2" />
                        </div>

                        {delivery.guidanceNotes && (
                          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5" />
                              <div>
                                <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Guidance:</p>
                                <p className="text-blue-600 dark:text-blue-300">{delivery.guidanceNotes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {(delivery.status === "dispatched" || delivery.status === "in_transit" || delivery.status === "arrived") && (
                          <Link href={`/purchase-agent/delivery-tracking/${delivery.id}`}>
                            <Button
                              size="sm"
                              className="w-full bg-green-600 hover:bg-green-700"
                              data-testid={`button-track-live-${delivery.id}`}
                            >
                              <Radio className="h-4 w-4 mr-1 animate-pulse" />
                              Track Live
                            </Button>
                          </Link>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedDelivery(delivery)}
                              data-testid={`button-view-delivery-${delivery.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Delivery Details</DialogTitle>
                              <DialogDescription>{delivery.orderNumber} - {delivery.supplierName}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div>
                                  <p className="text-sm text-gray-500">Status</p>
                                  {getStatusBadge(delivery.status)}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-500">
                                    {delivery.status === "delivered" ? "Delivered At" : "Expected At"}
                                  </p>
                                  <p className="font-medium">
                                    {delivery.actualDelivery
                                      ? new Date(delivery.actualDelivery).toLocaleString()
                                      : new Date(delivery.estimatedDelivery).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Supplier Contact</p>
                                  <p className="font-medium flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {delivery.supplierContact}
                                  </p>
                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {delivery.supplierPhone}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Delivery Location</p>
                                  <p className="font-medium flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {delivery.deliveryLocation}
                                  </p>
                                  <p className="text-sm text-gray-500">{delivery.deliveryAddress}</p>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-500 mb-2">Items in Delivery</p>
                                <div className="border rounded-lg overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                      <tr>
                                        <th className="px-3 py-2 text-left">Part Name</th>
                                        <th className="px-3 py-2 text-center">Quantity</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {delivery.items.map((item, idx) => (
                                        <tr key={idx} className="border-t">
                                          <td className="px-3 py-2">{item.partName}</td>
                                          <td className="px-3 py-2 text-center">{item.quantity}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-500 mb-2">Delivery Timeline</p>
                                <div className="space-y-3">
                                  {delivery.timeline.map((event, idx) => (
                                    <div key={idx} className="flex gap-3">
                                      <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full ${
                                          idx === delivery.timeline.length - 1
                                            ? "bg-blue-500"
                                            : "bg-gray-300 dark:bg-gray-600"
                                        }`} />
                                        {idx < delivery.timeline.length - 1 && (
                                          <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                                        )}
                                      </div>
                                      <div className="flex-1 pb-3">
                                        <div className="flex items-center justify-between">
                                          <p className="font-medium text-gray-900 dark:text-white">{event.status}</p>
                                          <p className="text-xs text-gray-500">
                                            {new Date(event.timestamp).toLocaleString()}
                                          </p>
                                        </div>
                                        <p className="text-sm text-gray-500">{event.location}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{event.note}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {delivery.guidanceNotes && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                                    Guidance Notes
                                  </p>
                                  <p className="text-sm text-blue-600 dark:text-blue-300">{delivery.guidanceNotes}</p>
                                </div>
                              )}

                              {delivery.additionalNotes && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Additional Notes
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{delivery.additionalNotes}</p>
                                </div>
                              )}

                              {delivery.receivedBy && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="font-medium">Received by: {delivery.receivedBy}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-call-supplier-${delivery.id}`}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
