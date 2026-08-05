import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SupplierQuotation {
  id: string;
  supplierId: string;
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
  id: string;
  requestNumber: string;
  taskNumber: string;
  title: string;
  status: "draft" | "sent" | "received" | "selected" | "cancelled";
  storeLocation: string;
  createdAt: string;
  dueDate: string;
  quotations: SupplierQuotation[];
  selectedQuotationId: string | null;
}

export default function QuotationManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: requests = [], isLoading } = useQuery<QuotationRequest[]>({
    queryKey: ["/api/quotation-requests"],
  });

  const updateRequestMutation = useMutation({
    mutationFn: (data: { id: string; status: string; selectedQuotationId?: string }) =>
      apiRequest("PATCH", `/api/quotation-requests/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotation-requests"] });
      toast({ title: "Quotation Updated", description: "Quotation request has been updated." });
    },
  });

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
      received: { variant: "default", label: "Quotations Received", className: "bg-[#0A5ED7]" },
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

  const handleSelectQuotation = (quotationId: string) => {
    setSelectedQuotation(quotationId);
    if (selectedRequest) {
      updateRequestMutation.mutate({
        id: selectedRequest.id,
        status: "selected",
        selectedQuotationId: quotationId,
      });
    }
    toast({
      title: "Quotation Selected",
      description: "Quotation has been selected. You can now proceed with the order.",
    });
  };

  const stats = [
    { label: "Total Requests", value: requests.length, icon: FileText, color: "text-[#0A5ED7]" },
    { label: "Awaiting Response", value: requests.filter(r => r.status === "sent").length, icon: Clock, color: "text-[#F97316]" },
    { label: "Ready to Select", value: requests.filter(r => r.status === "received").length, icon: CheckCircle, color: "text-green-500" },
    { label: "Completed", value: requests.filter(r => r.status === "selected").length, icon: Package, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
            Quotation Management
          </h1>
          <p className="text-[#64748B] mt-1">
            Manage supplier quotations with store location information and pricing details
          </p>
        </div>
        <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white" data-testid="button-new-quotation-request">
          <Plus className="h-4 w-4 me-2" />
          New Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{stat.value}</p>
                  <p className="text-sm text-[#64748B]">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <FileText className="h-5 w-5 text-[#0A5ED7]" />
                Quotation Requests
              </CardTitle>
              <CardDescription className="text-[#64748B]">Compare and select the best supplier quotations</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 w-64 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
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
                  <FileText className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
                  <p className="text-[#64748B]">No quotation requests found</p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 hover:border-[#0A5ED7] dark:hover:border-[#0A5ED7] transition-colors bg-[#F8FAFC] dark:bg-[#0E1117]"
                    data-testid={`request-${request.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm text-[#64748B]">{request.requestNumber}</span>
                          {getStatusBadge(request.status)}
                          {request.quotations.length > 0 && (
                            <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]">{request.quotations.length} Quotations</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{request.title}</h3>
                        <p className="text-sm text-[#64748B]">Task: {request.taskNumber}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1 text-[#64748B]">
                            <MapPin className="h-4 w-4" />
                            <span>{request.storeLocation}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#64748B]">
                            <Clock className="h-4 w-4" />
                            <span>Due: {new Date(request.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {request.quotations.length > 0 && request.status === "received" && (
                          <div className="mt-4 p-3 bg-white dark:bg-[#151A23] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                            <p className="text-xs text-[#64748B] mb-2">Price Comparison:</p>
                            <div className="flex flex-wrap gap-3">
                              {request.quotations.map((q) => (
                                <div
                                  key={q.id}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded border ${
                                    q.isRecommended
                                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                      : "border-[#E2E8F0] dark:border-[#232A36]"
                                  }`}
                                >
                                  {q.isRecommended && <Star className="h-3 w-3 text-green-500" />}
                                  <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">{q.supplierName}</span>
                                  <span className="text-sm font-bold text-[#0B1F3B] dark:text-white">
                                    {q.totalPrice} {q.currency}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ms-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#E2E8F0] dark:border-[#232A36]"
                              onClick={() => setSelectedRequest(request)}
                              data-testid={`button-view-request-${request.id}`}
                            >
                              <Eye className="h-4 w-4 me-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white dark:bg-[#151A23]">
                            <DialogHeader>
                              <DialogTitle className="text-[#0B1F3B] dark:text-white">Quotation Request - {request.requestNumber}</DialogTitle>
                              <DialogDescription className="text-[#64748B]">{request.title}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4 p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg">
                                <div>
                                  <p className="text-sm text-[#64748B]">Store Location</p>
                                  <p className="font-medium flex items-center gap-1 text-[#0B1F3B] dark:text-white">
                                    <MapPin className="h-4 w-4" />
                                    {request.storeLocation}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-[#64748B]">Due Date</p>
                                  <p className="font-medium text-[#0B1F3B] dark:text-white">{new Date(request.dueDate).toLocaleDateString()}</p>
                                </div>
                              </div>

                              {request.quotations.length > 0 ? (
                                <div>
                                  <h4 className="font-semibold mb-3 text-[#0B1F3B] dark:text-white">Supplier Quotations</h4>
                                  <RadioGroup
                                    value={selectedQuotation || ""}
                                    onValueChange={(v) => setSelectedQuotation(v)}
                                  >
                                    <div className="space-y-4">
                                      {request.quotations.map((quotation) => (
                                        <div
                                          key={quotation.id}
                                          className={`border rounded-lg p-4 ${
                                            quotation.isRecommended
                                              ? "border-green-500 bg-green-50/50 dark:bg-green-900/10"
                                              : "border-[#E2E8F0] dark:border-[#232A36]"
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
                                                    className="font-semibold text-lg cursor-pointer text-[#0B1F3B] dark:text-white"
                                                  >
                                                    {quotation.supplierName}
                                                  </Label>
                                                  {quotation.isRecommended && (
                                                    <Badge className="bg-green-500">
                                                      <Star className="h-3 w-3 me-1" />
                                                      Recommended
                                                    </Badge>
                                                  )}
                                                  <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-sm text-[#64748B]">{quotation.supplierRating}</span>
                                                  </div>
                                                </div>
                                                <div className="text-end">
                                                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
                                                    {quotation.totalPrice} {quotation.currency}
                                                  </p>
                                                  <p className="text-sm text-[#64748B]">
                                                    Valid until {new Date(quotation.validUntil).toLocaleDateString()}
                                                  </p>
                                                </div>
                                              </div>

                                              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                                                <div className="flex items-center gap-1 text-[#64748B]">
                                                  <MapPin className="h-4 w-4" />
                                                  {quotation.supplierLocation}
                                                </div>
                                                <div className="flex items-center gap-1 text-[#64748B]">
                                                  <Truck className="h-4 w-4" />
                                                  {quotation.deliveryTime}
                                                </div>
                                                <div className="flex items-center gap-1 text-[#64748B]">
                                                  <DollarSign className="h-4 w-4" />
                                                  {quotation.paymentTerms}
                                                </div>
                                              </div>

                                              <div className="border border-[#E2E8F0] dark:border-[#232A36] rounded overflow-hidden">
                                                <table className="w-full text-sm">
                                                  <thead className="bg-[#F8FAFC] dark:bg-[#0E1117]">
                                                    <tr>
                                                      <th className="px-3 py-2 text-start text-[#0B1F3B] dark:text-white">Part</th>
                                                      <th className="px-3 py-2 text-center text-[#0B1F3B] dark:text-white">Qty</th>
                                                      <th className="px-3 py-2 text-end text-[#0B1F3B] dark:text-white">Unit Price</th>
                                                      <th className="px-3 py-2 text-center text-[#0B1F3B] dark:text-white">Availability</th>
                                                      <th className="px-3 py-2 text-center text-[#0B1F3B] dark:text-white">Lead Time</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {quotation.items.map((item, idx) => (
                                                      <tr key={idx} className="border-t border-[#E2E8F0] dark:border-[#232A36]">
                                                        <td className="px-3 py-2">
                                                          <p className="font-medium text-[#0B1F3B] dark:text-white">{item.partName}</p>
                                                          <p className="text-xs text-[#64748B]">{item.partNumber}</p>
                                                        </td>
                                                        <td className="px-3 py-2 text-center text-[#0B1F3B] dark:text-white">{item.quantity}</td>
                                                        <td className="px-3 py-2 text-end font-medium text-[#0B1F3B] dark:text-white">{item.unitPrice} SAR</td>
                                                        <td className="px-3 py-2 text-center">
                                                          {getAvailabilityBadge(item.availability)}
                                                        </td>
                                                        <td className="px-3 py-2 text-center text-[#64748B]">{item.leadTime}</td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>

                                              {quotation.notes && (
                                                <p className="text-sm text-[#64748B] mt-2 italic">{quotation.notes}</p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </RadioGroup>

                                  {request.status === "received" && (
                                    <div className="flex justify-end mt-4">
                                      <Button
                                        className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
                                        disabled={!selectedQuotation}
                                        onClick={() => selectedQuotation && handleSelectQuotation(selectedQuotation)}
                                        data-testid="button-confirm-selection"
                                      >
                                        <CheckCircle className="h-4 w-4 me-2" />
                                        Confirm Selection & Create Order
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <Clock className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
                                  <p className="text-[#64748B]">Waiting for supplier quotations...</p>
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
