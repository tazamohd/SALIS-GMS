import PartsNetworkLayout from "./PartsNetworkLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Truck,
  MapPin,
  Star,
  ArrowUpDown,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface Quotation {
  id: string;
  requestId: string;
  requestNumber: string;
  partName: string;
  supplierName: string;
  supplierId: string;
  supplierCity: string;
  supplierRating: number;
  offeredPartNumber: string | null;
  offeredBrand: string;
  partCondition: string;
  unitPrice: string;
  totalPrice: string;
  currency: string;
  availableQuantity: number;
  deliveryOption: string;
  deliveryCost: string;
  estimatedDeliveryDays: number | null;
  warranty: string | null;
  status: string;
  createdAt: string;
  validUntil: string | null;
}

const sampleQuotations: Quotation[] = [
  {
    id: "1",
    requestId: "req-1",
    requestNumber: "RFQ-2025-001",
    partName: "Front Brake Pads Set",
    supplierName: "Al-Faisal Auto Parts",
    supplierId: "sup-1",
    supplierCity: "Riyadh",
    supplierRating: 4.8,
    offeredPartNumber: "04465-33450",
    offeredBrand: "Toyota Genuine",
    partCondition: "new",
    unitPrice: "250.00",
    totalPrice: "500.00",
    currency: "SAR",
    availableQuantity: 10,
    deliveryOption: "both",
    deliveryCost: "25.00",
    estimatedDeliveryDays: 2,
    warranty: "1 Year",
    status: "submitted",
    createdAt: "2025-01-15T11:00:00Z",
    validUntil: "2025-01-22T11:00:00Z",
  },
  {
    id: "2",
    requestId: "req-1",
    requestNumber: "RFQ-2025-001",
    partName: "Front Brake Pads Set",
    supplierName: "Saudi Auto Spares",
    supplierId: "sup-2",
    supplierCity: "Jeddah",
    supplierRating: 4.5,
    offeredPartNumber: "BP-TY-001",
    offeredBrand: "Bosch",
    partCondition: "new",
    unitPrice: "180.00",
    totalPrice: "360.00",
    currency: "SAR",
    availableQuantity: 25,
    deliveryOption: "delivery",
    deliveryCost: "50.00",
    estimatedDeliveryDays: 3,
    warranty: "6 Months",
    status: "submitted",
    createdAt: "2025-01-15T12:30:00Z",
    validUntil: "2025-01-20T12:30:00Z",
  },
  {
    id: "3",
    requestId: "req-2",
    requestNumber: "RFQ-2025-002",
    partName: "Oil Filter",
    supplierName: "Parts Hub KSA",
    supplierId: "sup-3",
    supplierCity: "Dammam",
    supplierRating: 4.2,
    offeredPartNumber: "15400-RTA-003",
    offeredBrand: "Honda Genuine",
    partCondition: "new",
    unitPrice: "45.00",
    totalPrice: "225.00",
    currency: "SAR",
    availableQuantity: 50,
    deliveryOption: "pickup",
    deliveryCost: "0.00",
    estimatedDeliveryDays: null,
    warranty: "OEM Warranty",
    status: "selected",
    createdAt: "2025-01-14T16:00:00Z",
    validUntil: null,
  },
];

export default function QuotationsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "date" | "rating">("date");

  const { data: quotations } = useQuery<Quotation[]>({
    queryKey: ["/api/parts-network/quotations"],
  });

  const displayQuotations = quotations || sampleQuotations;

  const filteredQuotations = displayQuotations
    .filter(q => 
      q.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.requestNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return parseFloat(a.totalPrice) - parseFloat(b.totalPrice);
        case "rating":
          return b.supplierRating - a.supplierRating;
        case "date":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-blue-500/20 text-blue-400";
      case "viewed": return "bg-yellow-500/20 text-yellow-400";
      case "selected": return "bg-green-500/20 text-green-400";
      case "rejected": return "bg-red-500/20 text-red-400";
      case "expired": return "bg-gray-500/20 text-gray-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "selected": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Group quotations by request
  const groupedByRequest = filteredQuotations.reduce((acc, q) => {
    if (!acc[q.requestId]) {
      acc[q.requestId] = {
        requestNumber: q.requestNumber,
        partName: q.partName,
        quotations: [],
      };
    }
    acc[q.requestId].quotations.push(q);
    return acc;
  }, {} as Record<string, { requestNumber: string; partName: string; quotations: Quotation[] }>);

  return (
    <PartsNetworkLayout 
      title="Quotations Received" 
      description="عروض الأسعار المستلمة - Compare and select the best offers"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700"
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "price" ? "secondary" : "outline"}
            onClick={() => setSortBy("price")}
            className="border-gray-700"
            data-testid="btn-sort-price"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Price
          </Button>
          <Button
            variant={sortBy === "rating" ? "secondary" : "outline"}
            onClick={() => setSortBy("rating")}
            className="border-gray-700"
            data-testid="btn-sort-rating"
          >
            <Star className="h-4 w-4 mr-2" />
            Rating
          </Button>
          <Button
            variant={sortBy === "date" ? "secondary" : "outline"}
            onClick={() => setSortBy("date")}
            className="border-gray-700"
            data-testid="btn-sort-date"
          >
            <Clock className="h-4 w-4 mr-2" />
            Date
          </Button>
        </div>
      </div>

      {/* Grouped Quotations */}
      <div className="space-y-8">
        {Object.entries(groupedByRequest).map(([requestId, group]) => (
          <div key={requestId}>
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-blue-400" />
              <div>
                <h3 className="font-bold">{group.partName}</h3>
                <p className="text-sm text-gray-400">{group.requestNumber} • {group.quotations.length} quotes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.quotations.map((quote) => (
                <Card 
                  key={quote.id} 
                  className={`bg-gray-800 border-gray-700 hover:border-gray-600 transition-all ${
                    quote.status === "selected" ? "ring-2 ring-green-500/50" : ""
                  }`}
                  data-testid={`quote-card-${quote.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <div>
                          <CardTitle className="text-base">{quote.supplierName}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <MapPin className="h-3 w-3" />
                            {quote.supplierCity}
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              {quote.supplierRating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(quote.status)} flex items-center gap-1`}>
                        {getStatusIcon(quote.status)}
                        {quote.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Price */}
                    <div className="bg-gray-700/50 rounded-lg p-3 mb-3">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-gray-400">Unit Price</p>
                          <p className="text-lg font-bold">
                            {quote.unitPrice} <span className="text-sm text-gray-400">{quote.currency}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Total</p>
                          <p className="text-xl font-bold text-green-400">
                            {quote.totalPrice} {quote.currency}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Brand</span>
                        <span className="font-medium">{quote.offeredBrand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Condition</span>
                        <Badge variant="outline" className="text-xs">
                          {quote.partCondition}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Available</span>
                        <span>{quote.availableQuantity} units</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Delivery</span>
                        <span className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          {quote.estimatedDeliveryDays ? `${quote.estimatedDeliveryDays} days` : "Pickup"}
                          {parseFloat(quote.deliveryCost) > 0 && (
                            <span className="text-orange-400">+{quote.deliveryCost}</span>
                          )}
                        </span>
                      </div>
                      {quote.warranty && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Warranty</span>
                          <span className="text-green-400">{quote.warranty}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {quote.status === "submitted" || quote.status === "viewed" ? (
                        <>
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            data-testid={`btn-select-${quote.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Select
                          </Button>
                          <Button 
                            variant="outline" 
                            className="border-gray-600"
                            data-testid={`btn-negotiate-${quote.id}`}
                          >
                            Negotiate
                          </Button>
                        </>
                      ) : quote.status === "selected" ? (
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                          View Order
                        </Button>
                      ) : null}
                    </div>

                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Received {format(new Date(quote.createdAt), "MMM d, HH:mm")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedByRequest).length === 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <h3 className="font-medium text-lg mb-2">No Quotations Yet</h3>
              <p className="text-gray-400">
                Quotations from suppliers will appear here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PartsNetworkLayout>
  );
}
