import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  Building2,
  Eye,
  TrendingUp,
  Package,
} from "lucide-react";
import type { Supplier, SupplierPerformance } from "@shared/schema";

export default function PurchaseAgentSuppliers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: performance = [] } = useQuery<SupplierPerformance[]>({
    queryKey: ["/api/supplier-performance"],
  });

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSupplierPerformance = (supplierId: string) => {
    return performance.filter((p) => p.supplierId === supplierId);
  };

  const getAverageRating = (supplierId: string) => {
    const perfData = getSupplierPerformance(supplierId);
    if (perfData.length === 0) return null;
    const total = perfData.reduce(
      (sum, p) => sum + parseFloat(p.overallRating || "0"),
      0
    );
    return (total / perfData.length).toFixed(1);
  };

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailsOpen(true);
  };

  const activeSuppliers = suppliers.filter((s) => s.isActive).length;
  const inactiveSuppliers = suppliers.filter((s) => !s.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
            Supplier Management
          </h1>
          <p className="text-[#64748B] mt-1">
            View and manage your supplier network
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                <Building2 className="h-6 w-6 text-[#0A5ED7]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{suppliers.length}</div>
                <p className="text-sm text-[#64748B]">Total Suppliers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{activeSuppliers}</div>
                <p className="text-sm text-[#64748B]">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[#F8FAFC] dark:bg-[#0E1117]">
                <Package className="h-6 w-6 text-[#64748B]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#64748B]">{inactiveSuppliers}</div>
                <p className="text-sm text-[#64748B]">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-search"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-[#64748B]">Loading suppliers...</div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-8 text-[#64748B]">
              No suppliers found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                  <TableHead className="text-[#0B1F3B] dark:text-white">Supplier</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Contact</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Location</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Rating</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Status</TableHead>
                  <TableHead className="text-right text-[#0B1F3B] dark:text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => {
                  const rating = getAverageRating(supplier.id);
                  return (
                    <TableRow key={supplier.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-supplier-${supplier.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[#0B1F3B] dark:text-white">{supplier.name}</p>
                          <p className="text-sm text-[#64748B]">{supplier.contactPerson}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {supplier.email && (
                            <div className="flex items-center gap-1 text-sm text-[#64748B]">
                              <Mail className="h-3 w-3" />
                              {supplier.email}
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-1 text-sm text-[#64748B]">
                              <Phone className="h-3 w-3" />
                              {supplier.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {supplier.city && (
                          <div className="flex items-center gap-1 text-sm text-[#64748B]">
                            <MapPin className="h-3 w-3" />
                            {supplier.city}, {supplier.country}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium text-[#0B1F3B] dark:text-white">{rating}</span>
                          </div>
                        ) : (
                          <span className="text-[#64748B] text-sm">No rating</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={supplier.isActive ? "default" : "secondary"}>
                          {supplier.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(supplier)}
                          data-testid={`button-view-${supplier.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#151A23]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{selectedSupplier?.name}</DialogTitle>
            <DialogDescription className="text-[#64748B]">
              Supplier details and performance information
            </DialogDescription>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#64748B]">Contact Person</p>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedSupplier.contactPerson || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Email</p>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedSupplier.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Phone</p>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedSupplier.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Location</p>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">
                    {selectedSupplier.city || "N/A"}, {selectedSupplier.country || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Address</p>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedSupplier.address || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Tax ID</p>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedSupplier.taxId || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-[#64748B]">Payment Terms</p>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">{selectedSupplier.paymentTerms || "N/A"}</p>
                </div>
              </div>

              {selectedSupplier.notes && (
                <div>
                  <p className="text-sm text-[#64748B]">Notes</p>
                  <p className="mt-1 text-[#0B1F3B] dark:text-white">
                    {selectedSupplier.notes}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-3 text-[#0B1F3B] dark:text-white">Performance History</h4>
                {getSupplierPerformance(selectedSupplier.id).length === 0 ? (
                  <p className="text-[#64748B] text-sm">No performance data available</p>
                ) : (
                  <div className="space-y-2">
                    {getSupplierPerformance(selectedSupplier.id).map((perf) => (
                      <div
                        key={perf.id}
                        className="flex justify-between items-center p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                      >
                        <div>
                          <p className="font-medium text-[#0B1F3B] dark:text-white">{perf.period}</p>
                          <p className="text-sm text-[#64748B]">
                            {perf.totalOrders} orders • ${perf.totalValue} total
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium text-[#0B1F3B] dark:text-white">{perf.overallRating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
