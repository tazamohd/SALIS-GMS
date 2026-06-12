// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, QrCode, Package, DollarSign, Warehouse } from "lucide-react";
import type { SparePart } from "@shared/schema";

export default function TechnicianMobileLookup() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: parts, isLoading } = useQuery<{ data: SparePart[] }>({
    queryKey: ["/api/spare-parts"],
    enabled: searchQuery.length > 2,
  });

  const filteredParts = parts?.data?.filter(part =>
    part.partName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.partNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-4 space-y-4 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">Parts Lookup</h2>
        <p className="text-sm text-[#64748B]">Search inventory and check availability</p>
      </div>

      {/* Search Box */}
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B]" />
            <Input
              type="text"
              placeholder="Search by part name, number, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white placeholder:text-[#64748B]"
              data-testid="input-search-parts"
            />
          </div>
          <Button 
            variant="outline" 
            className="w-full border-[#E2E8F0] dark:border-[#232A36] text-[#0A5ED7] hover:bg-[#0A5ED7]/10"
            onClick={() => {
              alert("Barcode scanner would open here");
            }}
            data-testid="button-scan-barcode"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Scan Barcode
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {searchQuery.length > 2 && (
        <div className="space-y-2">
          {isLoading ? (
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A5ED7] mx-auto mb-4" />
                <p className="text-[#64748B]">Searching...</p>
              </CardContent>
            </Card>
          ) : filteredParts.length > 0 ? (
            filteredParts.map((part) => (
              <Card 
                key={part.id}
                className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid={`part-${part.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 rounded-lg">
                      <Package className="h-6 w-6 text-[#0A5ED7]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white mb-1">{part.partName}</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs text-[#64748B] mb-2">
                        <div>
                          <span className="font-medium">Part #:</span> {part.partNumber || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">SKU:</span> {part.sku || "N/A"}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Warehouse className="h-4 w-4 text-[#64748B]" />
                          <span className={`text-sm font-semibold ${
                            (part.quantityInStock || 0) > 0 
                              ? "text-[#0BB3FF]" 
                              : "text-[#F97316]"
                          }`}>
                            {part.quantityInStock || 0} in stock
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold text-[#0B1F3B] dark:text-white">
                          <DollarSign className="h-4 w-4" />
                          {Number(part.unitPrice || 0).toFixed(2)}
                        </div>
                      </div>

                      {part.location && (
                        <p className="text-xs text-[#64748B] mt-2">
                          📍 {part.location}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-[#E2E8F0] dark:text-[#232A36]" />
                <h3 className="text-lg font-semibold mb-2 text-[#0B1F3B] dark:text-white">No Parts Found</h3>
                <p className="text-sm text-[#64748B]">
                  Try a different search term or scan a barcode
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {searchQuery.length <= 2 && (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-8 text-center">
            <Search className="h-16 w-16 mx-auto mb-4 text-[#E2E8F0] dark:text-[#232A36]" />
            <h3 className="text-lg font-semibold mb-2 text-[#0B1F3B] dark:text-white">Search Parts</h3>
            <p className="text-sm text-[#64748B]">
              Enter at least 3 characters to search or scan a barcode
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
