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
      return <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">Low Stock</Badge>;
    }
    return <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">In Stock</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Parts Lookup
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Search and check inventory for spare parts
        </p>
      </div>

      {/* Search */}
      <Card className="bg-white dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by part name, number, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-lg"
              data-testid="input-search-parts"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse h-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
          ))}
        </div>
      ) : filteredParts.length === 0 ? (
        <Card className="bg-white dark:bg-salis-gray-dark">
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {search ? "No parts found matching your search" : "Start typing to search for parts"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Found {filteredParts.length} {filteredParts.length === 1 ? "part" : "parts"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParts.map((part) => (
              <Card
                key={part.id}
                className="bg-white dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray hover:shadow-lg transition-shadow"
                data-testid={`part-card-${part.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        {part.partName}
                      </CardTitle>
                      {part.category && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Hash className="h-4 w-4" />
                        <span className="font-mono">{part.partNumber}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {part.quantityInStock} units available
                      </span>
                    </div>

                    {part.unitPrice && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-gray-900 dark:text-white font-semibold">
                          SAR {part.unitPrice}
                        </span>
                      </div>
                    )}

                    {part.minimumStockLevel && part.quantityInStock < part.minimumStockLevel && (
                      <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          Below minimum stock level ({part.minimumStockLevel})
                        </p>
                      </div>
                    )}

                    {part.supplier && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 border-t pt-2">
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
