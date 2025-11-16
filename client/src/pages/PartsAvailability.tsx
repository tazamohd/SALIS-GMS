import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, RefreshCw, Package, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { SupplierPartsAvailability } from "@shared/schema";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";

export function PartsAvailability() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { toast } = useToast();

  const { data: availability = [], isLoading } = useQuery<SupplierPartsAvailability[]>({
    queryKey: ['/api/supplier-availability/search', debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) {
        params.append('part_name', debouncedSearch);
      }
      const response = await fetch(`/api/supplier-availability/search?${params}`);
      if (!response.ok) throw new Error('Failed to fetch availability');
      return response.json();
    },
  });

  const syncMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/supplier-availability/sync', data),
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/supplier-availability/search'] });
      toast({
        title: "Sync Complete",
        description: result.message || "Supplier availability synced successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    setDebouncedSearch(searchTerm);
  };

  const handleMockSync = () => {
    const mockData = {
      availabilityData: [
        {
          supplierId: "550e8400-e29b-41d4-a716-446655440001",
          sparePartId: "550e8400-e29b-41d4-a716-446655440002",
          quantityAvailable: 25,
          leadTimeDays: 2,
          pricePerUnit: "45.99",
          currency: "SAR",
          externalPartNumber: "BP-2024-001",
          externalSku: "BRK-PAD-FR-001",
          supplierSource: "tecdoc",
          status: "active",
          notes: "Premium brake pads - Front"
        },
        {
          supplierId: "550e8400-e29b-41d4-a716-446655440003",
          sparePartId: "550e8400-e29b-41d4-a716-446655440002",
          quantityAvailable: 12,
          leadTimeDays: 5,
          pricePerUnit: "42.50",
          currency: "SAR",
          externalPartNumber: "BP-2024-001-ALT",
          externalSku: "BRK-PAD-FR-002",
          supplierSource: "manual",
          status: "active",
          notes: "Standard brake pads - Front"
        },
        {
          supplierId: "550e8400-e29b-41d4-a716-446655440001",
          sparePartId: "550e8400-e29b-41d4-a716-446655440004",
          quantityAvailable: 0,
          leadTimeDays: 14,
          pricePerUnit: "125.00",
          currency: "SAR",
          externalPartNumber: "OIL-FLT-2024",
          externalSku: "OIL-FILTER-001",
          supplierSource: "api",
          status: "backordered",
          notes: "Oil filter - On backorder"
        }
      ]
    };
    
    syncMutation.mutate(mockData);
  };

  const getStatusBadge = (status: string, quantity: number) => {
    if (status === 'backordered' || quantity === 0) {
      return <Badge variant="destructive" data-testid={`badge-status-${status}`}><XCircle className="w-3 h-3 mr-1" />Out of Stock</Badge>;
    }
    if (quantity < 5) {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600" data-testid="badge-status-low"><AlertCircle className="w-3 h-3 mr-1" />Low Stock</Badge>;
    }
    return <Badge variant="default" className="bg-green-600" data-testid="badge-status-available"><CheckCircle className="w-3 h-3 mr-1" />In Stock</Badge>;
  };

  return (
    <StandardPageLayout
      title="Parts Availability Tracker"
      description="Real-time multi-supplier parts availability"
      icon={Package}
      actions={[
        {
          label: "Sync Mock Data",
          icon: RefreshCw,
          onClick: handleMockSync,
          variant: "default",
        },
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle>Search Parts</CardTitle>
          <CardDescription>Search for parts across all suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter part name, SKU, or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              data-testid="input-search-parts"
            />
            <Button onClick={handleSearch} data-testid="button-search">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : availability.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium" data-testid="text-no-results">No parts availability found</p>
            <p className="text-sm text-muted-foreground">Try searching or syncing supplier data</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availability.map((item) => (
            <Card key={item.id} data-testid={`card-availability-${item.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg" data-testid={`text-part-number-${item.id}`}>
                      {item.externalPartNumber || 'Unknown Part'}
                    </CardTitle>
                    <CardDescription data-testid={`text-sku-${item.id}`}>
                      SKU: {item.externalSku || 'N/A'}
                    </CardDescription>
                  </div>
                  {getStatusBadge(item.status || 'active', item.quantityAvailable || 0)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Package className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span data-testid={`text-quantity-${item.id}`}>
                    <strong>Quantity:</strong> {item.quantityAvailable || 0} units
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span data-testid={`text-price-${item.id}`}>
                    <strong>Price:</strong> {item.pricePerUnit ? `${item.pricePerUnit} ${item.currency}` : 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span data-testid={`text-lead-time-${item.id}`}>
                    <strong>Lead Time:</strong> {item.leadTimeDays ? `${item.leadTimeDays} days` : 'N/A'}
                  </span>
                </div>

                {item.notes && (
                  <p className="text-xs text-muted-foreground pt-2 border-t" data-testid={`text-notes-${item.id}`}>
                    {item.notes}
                  </p>
                )}

                {item.lastSyncedAt && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Last synced:</strong> {formatDistanceToNow(new Date(item.lastSyncedAt), { addSuffix: true })}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </StandardPageLayout>
  );
}
