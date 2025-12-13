import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Star,
  Clock,
  Package,
} from "lucide-react";
import type { SupplierPriceList, Supplier, SparePart } from "@shared/schema";

export default function PurchaseAgentPriceCompare() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPart, setSelectedPart] = useState<string>("");

  const { data: priceLists = [], isLoading } = useQuery<SupplierPriceList[]>({
    queryKey: ["/api/supplier-price-lists"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: spareParts = [] } = useQuery<SparePart[]>({
    queryKey: ["/api/spare-parts"],
  });

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.name || "Unknown";
  };

  const getPartName = (partId: string) => {
    const part = spareParts.find((p) => p.id === partId);
    return part?.name || "Unknown";
  };

  const uniquePartNames = Array.from(new Set(priceLists.map((p) => p.partName))).filter(Boolean);

  const filteredPriceLists = priceLists.filter((item) => {
    const matchesSearch =
      item.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.partNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPart = !selectedPart || item.partName === selectedPart;
    return matchesSearch && matchesPart && item.isActive;
  });

  const groupedByPart = filteredPriceLists.reduce((acc, item) => {
    const key = item.partName;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, SupplierPriceList[]>);

  const getBestPrice = (items: SupplierPriceList[]) => {
    if (items.length === 0) return null;
    return items.reduce((min, item) =>
      parseFloat(item.unitPrice) < parseFloat(min.unitPrice) ? item : min
    );
  };

  const getAvailabilityBadge = (availability: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      in_stock: { variant: "default", label: "In Stock" },
      limited: { variant: "secondary", label: "Limited" },
      out_of_stock: { variant: "destructive", label: "Out of Stock" },
      discontinued: { variant: "outline", label: "Discontinued" },
    };
    const { variant, label } = config[availability] || config.in_stock;
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Price Comparison
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Compare prices across suppliers to find the best deals
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{uniquePartNames.length}</div>
                <p className="text-sm text-gray-500">Parts with Pricing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{priceLists.length}</div>
                <p className="text-sm text-gray-500">Price Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20">
                <Star className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{suppliers.filter((s) => s.isActive).length}</div>
                <p className="text-sm text-gray-500">Active Suppliers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search parts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
              <Select value={selectedPart} onValueChange={setSelectedPart}>
                <SelectTrigger className="w-52" data-testid="select-part-filter">
                  <SelectValue placeholder="Filter by part" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Parts</SelectItem>
                  {uniquePartNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading price data...</div>
          ) : Object.keys(groupedByPart).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No price data found
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByPart).map(([partName, items]) => {
                const bestPrice = getBestPrice(items);
                const sortedItems = [...items].sort(
                  (a, b) => parseFloat(a.unitPrice) - parseFloat(b.unitPrice)
                );

                return (
                  <div
                    key={partName}
                    className="border rounded-lg overflow-hidden"
                    data-testid={`price-group-${partName}`}
                  >
                    <div className="bg-gray-50 dark:bg-salis-gray-dark px-4 py-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {partName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {items.length} supplier{items.length !== 1 ? "s" : ""} offering this part
                        </p>
                      </div>
                      {bestPrice && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Best Price</p>
                          <p className="text-lg font-bold text-green-600">
                            ${bestPrice.unitPrice}
                          </p>
                        </div>
                      )}
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Part Number</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Min Order</TableHead>
                          <TableHead>Lead Time</TableHead>
                          <TableHead>Availability</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedItems.map((item, index) => (
                          <TableRow
                            key={item.id}
                            className={index === 0 ? "bg-green-50/50 dark:bg-green-900/10" : ""}
                            data-testid={`price-row-${item.id}`}
                          >
                            <TableCell className="font-medium">
                              {getSupplierName(item.supplierId)}
                            </TableCell>
                            <TableCell>{item.partNumber || "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  ${item.unitPrice}
                                </span>
                                {index === 0 && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                    Best
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.minimumOrderQuantity || 1}</TableCell>
                            <TableCell>
                              {item.leadTimeDays ? (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  {item.leadTimeDays} days
                                </div>
                              ) : (
                                "N/A"
                              )}
                            </TableCell>
                            <TableCell>
                              {getAvailabilityBadge(item.availability || "in_stock")}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                data-testid={`button-order-${item.id}`}
                              >
                                Order
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
