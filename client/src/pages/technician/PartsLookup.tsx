// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, DollarSign, Hash, AlertCircle } from "lucide-react";
import type { SparePart } from "@shared/schema";

export default function TechnicianPartsLookup() {
  const [search, setSearch] = useState("");

  const { data: parts, isLoading } = useQuery<SparePart[]>({
    queryKey: ["/api/spare-parts"],
  });

  const filteredParts = parts?.filter((part) => {
    const searchLower = search.toLowerCase();
    return (
      part.partName.toLowerCase().includes(searchLower) ||
      part.partNumber?.toLowerCase().includes(searchLower) ||
      part.category?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">Out of Stock</Badge>;
    } else if (quantity < 10) {
      return <Badge className="bg-orange-100 dark:bg-orange-900 text-[#F97316]">Low Stock</Badge>;
    }
    return <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">In Stock</Badge>;
  };

  return (
    <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white mb-2">
          Parts Lookup
        </h1>
        <p className="text-[#64748B]">
          Search and check inventory for spare parts
        </p>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B]" />
            <Input
              placeholder="Search by part name, number, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-lg bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              data-testid="input-search-parts"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse h-48 bg-[#E2E8F0] dark:bg-[#232A36] rounded"></div>
          ))}
        </div>
      ) : filteredParts.length === 0 ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-[#64748B] mb-4" />
            <p className="text-[#64748B] text-lg">
              {search ? "No parts found matching your search" : "Start typing to search for parts"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="text-sm text-[#64748B]">
            Found {filteredParts.length} {filteredParts.length === 1 ? "part" : "parts"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParts.map((part) => (
              <Card
                key={part.id}
                className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:shadow-lg transition-shadow"
                data-testid={`part-card-${part.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">
                        {part.partName}
                      </CardTitle>
                      {part.category && (
                        <p className="text-sm text-[#64748B] mt-1">
                          {part.category}
                        </p>
                      )}
                    </div>
                    {getStockBadge(part.quantityInStock)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {part.partNumber && (
                      <div className="flex items-center gap-2 text-sm text-[#64748B]">
                        <Hash className="h-4 w-4" />
                        <span className="font-mono">{part.partNumber}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-[#64748B]" />
                      <span className="text-[#0B1F3B] dark:text-white">
                        {part.quantityInStock} units available
                      </span>
                    </div>

                    {part.unitPrice && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-[#64748B]" />
                        <span className="text-[#0B1F3B] dark:text-white font-semibold">
                          SAR {part.unitPrice}
                        </span>
                      </div>
                    )}

                    {part.minimumStockLevel && part.quantityInStock < part.minimumStockLevel && (
                      <div className="flex items-start gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                        <AlertCircle className="h-4 w-4 text-[#F97316] mt-0.5" />
                        <p className="text-xs text-[#F97316]">
                          Below minimum stock level ({part.minimumStockLevel})
                        </p>
                      </div>
                    )}

                    {part.supplier && (
                      <p className="text-xs text-[#64748B] border-t border-[#E2E8F0] dark:border-[#232A36] pt-2">
                        Supplier: {part.supplier}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
