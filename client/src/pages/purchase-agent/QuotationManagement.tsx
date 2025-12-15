import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FileText,
  Search,
  Plus,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  Edit,
  Truck,
  Package,
  Star,
  TrendingDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupplierQuotation {
  id: number;
  supplierId: number;
  supplierName: string;
  supplierLocation: string;
  supplierRating: number;
  deliveryTime: string;
  totalPrice: number;
  currency: string;
  validUntil: string;
  paymentTerms: string;
  items: {
    partNumber: string;
    partName: string;
    quantity: number;
    unitPrice: number;
    availability: "in_stock" | "low_stock" | "out_of_stock" | "on_order";
    leadTime: string;
  }[];
  notes: string;
  isRecommended: boolean;
}

interface QuotationRequest {
  id: number;
  requestNumber: string;
  taskNumber: string;
  title: string;
  status: "draft" | "sent" | "received" | "selected" | "cancelled";
  storeLocation: string;
  createdAt: string;
  dueDate: string;
  quotations: SupplierQuotation[];
  selectedQuotationId: number | null;
}

const mockRequests: QuotationRequest[] = [
  {
    id: 1,
    requestNumber: "QR-2024-001",
    taskNumber: "PT-2024-001",
    title: "Brake Pads for Toyota Camry",
    status: "received",
    storeLocation: "Main Warehouse - Riyadh",
    createdAt: "2024-12-15T09:30:00Z",
    dueDate: "2024-12-16",
    selectedQuotationId: null,
    quotations: [
      {
        id: 1,
        supplierId: 1,
        supplierName: "AutoParts Plus",
        supplierLocation: "Riyadh Industrial City",
        supplierRating: 4.8,
        deliveryTime: "Same Day",
        totalPrice: 850,
        currency: "SAR",
        validUntil: "2024-12-20",
        paymentTerms: "Net 30",
        items: [
          { partNumber: "BP-TOY-001", partName: "Front Brake Pads - Toyota", quantity: 4, unitPrice: 125, availability: "in_stock", leadTime: "Immediate" },
          { partNumber: "BP-TOY-002", partName: "Rear Brake Pads - Toyota", quantity: 4, unitPrice: 87.5, availability: "in_stock", leadTime: "Immediate" },
        ],
        notes: "OEM quality parts, 1-year warranty included",
        isRecommended: true,
      },
      {
        id: 2,
        supplierId: 2,
        supplierName: "Gulf Auto Supplies",
        supplierLocation: "Jeddah Port Area",
        supplierRating: 4.5,
        deliveryTime: "1-2 Days",
        totalPrice: 780,
        currency: "SAR",
        validUntil: "2024-12-18",
        paymentTerms: "COD",
        items: [
          { partNumber: "BP-TOY-001", partName: "Front Brake Pads - Toyota", quantity: 4, unitPrice: 110, availability: "in_stock", leadTime: "1 Day" },
          { partNumber: "BP-TOY-002", partName: "Rear Brake Pads - Toyota", quantity: 4, unitPrice: 85, availability: "low_stock", leadTime: "2 Days" },
        ],
        notes: "Aftermarket quality, 6-month warranty",
        isRecommended: false,
      },
      {
        id: 3,
        supplierId: 3,
        supplierName: "Premium Parts KSA",
        supplierLocation: "Dammam Industrial",
        supplierRating: 4.9,
        deliveryTime: "Next Day",
        totalPrice: 920,
        currency: "SAR",
        validUntil: "2024-12-22",
        paymentTerms: "Net 15",
        items: [
          { partNumber: "BP-TOY-001", partName: "Front Brake Pads - Toyota", quantity: 4, unitPrice: 135, availability: "in_stock", leadTime: "Next Day" },
          { partNumber: "BP-TOY-002", partName: "Rear Brake Pads - Toyota", quantity: 4, unitPrice: 95, availability: "in_stock", leadTime: "Next Day" },
        ],
        notes: "Genuine OEM parts from Toyota, 2-year warranty",
        isRecommended: false,
      },
    ],
  },
  {
    id: 2,
    requestNumber: "QR-2024-002",
    taskNumber: "PT-2024-002",
    title: "Oil Filters Monthly Restock",
    status: "sent",
    storeLocation: "Branch Store - Jeddah",
    createdAt: "2024-12-14T14:45:00Z",
    dueDate: "2024-12-20",
    selectedQuotationId: null,
    quotations: [],
  },
  {
    id: 3,
    requestNumber: "QR-2024-003",
    taskNumber: "PT-2024-003",
    title: "Mercedes Engine Parts",
    status: "selected",
    storeLocation: "Main Warehouse - Riyadh",
    createdAt: "2024-12-13T10:00:00Z",
    dueDate: "2024-12-18",
    selectedQuotationId: 4,
    quotations: [
      {
        id: 4,
        supplierId: 4,
        supplierName: "Mercedes Authorized Dealer",
        supplierLocation: "Riyadh Mercedes Center",
        supplierRating: 5.0,
        deliveryTime: "2-3 Days",
        totalPrice: 4500,
        currency: "SAR",
        validUntil: "2024-12-25",
        paymentTerms: "Net 30",
        items: [
          { partNumber: "EP-MER-001", partName: "Mercedes Engine Gasket Set", quantity: 1, unitPrice: 1800, availability: "in_stock", leadTime: "2 Days" },
          { partNumber: "EP-MER-002", partName: "Mercedes Timing Chain Kit", quantity: 1, unitPrice: 2700, availability: "in_stock", leadTime: "2 Days" },
        ],
        notes: "Genuine Mercedes-Benz parts with full warranty",
        isRecommended: true,
      },
    ],
  },
];

export default function QuotationManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<number | null>(null);
  const { toast } = useToast();

  const requests = mockRequests;

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "draft" && req.status === "draft") ||
      (activeTab === "sent" && req.status === "sent") ||
      (activeTab === "received" && req.status === "received") ||
      (activeTab === "selected" && req.status === "selected");

    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string }> = {
      draft: { variant: "outline", label: "Draft" },
      sent: { variant: "secondary", label: "Sent to Suppliers" },
      received: { variant: "default", label: "Quotations Received", className: "bg-blue-500" },
      selected: { variant: "default", label: "Supplier Selected", className: "bg-green-500" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const { variant, label, className } = config[status] || { variant: "secondary", label: status };
    return <Badge variant={variant} className={className}>{label}</Badge>;
  };

  const getAvailabilityBadge = (availability: string) => {
    const config: Record<string, { className: string; label: string }> = {
      in_stock: { className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "In Stock" },
      low_stock: { className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", label: "Low Stock" },
      out_of_stock: { className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Out of Stock" },
      on_order: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", label: "On Order" },
    };
    const { className, label } = config[availability] || config.in_stock;
    return <Badge className={className}>{label}</Badge>;
  };

  const handleSelectQuotation = (quotationId: number) => {
    setSelectedQuotation(quotationId);
    toast({
      title: "Quotation Selected",
      description: "Quotation has been selected. You can now proceed with the order.",
    });
  };

  const stats = [
    { label: "Total Requests", value: requests.length, icon: FileText, color: "text-blue-500" },
    { label: "Awaiting Response", value: requests.filter(r => r.status === "sent").length, icon: Clock, color: "text-orange-500" },
    { label: "Ready to Select", value: requests.filter(r => r.status === "received").length, icon: CheckCircle, color: "text-green-500" },
    { label: "Completed", value: requests.filter(r => r.status === "selected").length, icon: Package, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quotation Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage supplier quotations with store location information and pricing details
          </p>
        </div>
        <Button data-testid="button-new-quotation-request">
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
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
                <FileText className="h-5 w-5" />
                Quotation Requests
              </CardTitle>
              <CardDescription>Compare and select the best supplier quotations</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
                data-testid="input-search-requests"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="sent" data-testid="tab-sent">Sent</TabsTrigger>
              <TabsTrigger value="received" data-testid="tab-received">Received</TabsTrigger>
              <TabsTrigger value="selected" data-testid="tab-selected">Selected</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No quotation requests found</p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                    data-testid={`request-${request.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm text-gray-500">{request.requestNumber}</span>
                          {getStatusBadge(request.status)}
                          {request.quotations.length > 0 && (
                            <Badge variant="outline">{request.quotations.length} Quotations</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{request.title}</h3>
                        <p className="text-sm text-gray-500">Task: {request.taskNumber}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <MapPin className="h-4 w-4" />
                            <span>{request.storeLocation}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>Due: {new Date(request.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {request.quotations.length > 0 && request.status === "received" && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-xs text-gray-500 mb-2">Price Comparison:</p>
                            <div className="flex flex-wrap gap-3">
                              {request.quotations.map((q) => (
                                <div
                                  key={q.id}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded border ${
                                    q.isRecommended
                                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                      : "border-gray-200 dark:border-gray-700"
                                  }`}
                                >
                                  {q.isRecommended && <Star className="h-3 w-3 text-green-500" />}
                                  <span className="text-sm font-medium">{q.supplierName}</span>
                                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {q.totalPrice} {q.currency}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                              data-testid={`button-view-request-${request.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Quotation Request - {request.requestNumber}</DialogTitle>
                              <DialogDescription>{request.title}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div>
                                  <p className="text-sm text-gray-500">Store Location</p>
                                  <p className="font-medium flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {request.storeLocation}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Due Date</p>
                                  <p className="font-medium">{new Date(request.dueDate).toLocaleDateString()}</p>
                                </div>
                              </div>

                              {request.quotations.length > 0 ? (
                                <div>
                                  <h4 className="font-semibold mb-3">Supplier Quotations</h4>
                                  <RadioGroup
                                    value={selectedQuotation?.toString() || ""}
                                    onValueChange={(v) => setSelectedQuotation(parseInt(v))}
                                  >
                                    <div className="space-y-4">
                                      {request.quotations.map((quotation) => (
                                        <div
                                          key={quotation.id}
                                          className={`border rounded-lg p-4 ${
                                            quotation.isRecommended
                                              ? "border-green-500 bg-green-50/50 dark:bg-green-900/10"
                                              : ""
                                          }`}
                                        >
                                          <div className="flex items-start gap-3">
                                            <RadioGroupItem
                                              value={quotation.id.toString()}
                                              id={`quotation-${quotation.id}`}
                                              className="mt-1"
                                            />
                                            <div className="flex-1">
                                              <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                  <Label
                                                    htmlFor={`quotation-${quotation.id}`}
                                                    className="font-semibold text-lg cursor-pointer"
                                                  >
                                                    {quotation.supplierName}
                                                  </Label>
                                                  {quotation.isRecommended && (
                                                    <Badge className="bg-green-500">
                                                      <Star className="h-3 w-3 mr-1" />
                                                      Recommended
                                                    </Badge>
                                                  )}
                                                  <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-sm">{quotation.supplierRating}</span>
                                                  </div>
                                                </div>
                                                <div className="text-right">
                                                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {quotation.totalPrice} {quotation.currency}
                                                  </p>
                                                  <p className="text-sm text-gray-500">
                                                    Valid until {new Date(quotation.validUntil).toLocaleDateString()}
                                                  </p>
                                                </div>
                                              </div>

                                              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                  <MapPin className="h-4 w-4" />
                                                  {quotation.supplierLocation}
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                  <Truck className="h-4 w-4" />
                                                  {quotation.deliveryTime}
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                  <DollarSign className="h-4 w-4" />
                                                  {quotation.paymentTerms}
                                                </div>
                                              </div>

                                              <div className="border rounded overflow-hidden">
                                                <table className="w-full text-sm">
                                                  <thead className="bg-gray-100 dark:bg-gray-700">
                                                    <tr>
                                                      <th className="px-3 py-2 text-left">Part</th>
                                                      <th className="px-3 py-2 text-center">Qty</th>
                                                      <th className="px-3 py-2 text-right">Unit Price</th>
                                                      <th className="px-3 py-2 text-center">Availability</th>
                                                      <th className="px-3 py-2 text-center">Lead Time</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {quotation.items.map((item, idx) => (
                                                      <tr key={idx} className="border-t">
                                                        <td className="px-3 py-2">
                                                          <p className="font-medium">{item.partName}</p>
                                                          <p className="text-xs text-gray-500">{item.partNumber}</p>
                                                        </td>
                                                        <td className="px-3 py-2 text-center">{item.quantity}</td>
                                                        <td className="px-3 py-2 text-right">{item.unitPrice} SAR</td>
                                                        <td className="px-3 py-2 text-center">
                                                          {getAvailabilityBadge(item.availability)}
                                                        </td>
                                                        <td className="px-3 py-2 text-center">{item.leadTime}</td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>

                                              {quotation.notes && (
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                                                  Note: {quotation.notes}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </RadioGroup>

                                  <div className="flex justify-end gap-2 mt-4">
                                    <Button
                                      variant="outline"
                                      disabled={!selectedQuotation}
                                      data-testid="button-request-revision"
                                    >
                                      Request Revision
                                    </Button>
                                    <Button
                                      disabled={!selectedQuotation}
                                      onClick={() => selectedQuotation && handleSelectQuotation(selectedQuotation)}
                                      data-testid="button-confirm-selection"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Confirm Selection
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                  <p className="text-gray-600 dark:text-gray-400">
                                    Waiting for supplier quotations...
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
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
