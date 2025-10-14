import { useState } from "react";
import { ShoppingCart, Package, Plus, Search, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddSupplierDialog } from "@/components/AddSupplierDialog";
import type { PurchaseOrder, Supplier, Garage } from "@shared/schema";

export function PurchaseOrders() {
  const [selectedGarageId, setSelectedGarageId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: garages } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  const poQueryParams = new URLSearchParams();
  if (selectedGarageId !== "all") {
    poQueryParams.append("garage_id", selectedGarageId);
  }
  if (statusFilter !== "all") {
    poQueryParams.append("status", statusFilter);
  }
  const poUrl = `/api/purchase-orders${poQueryParams.toString() ? `?${poQueryParams.toString()}` : ''}`;

  const { data: purchaseOrders, isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: [poUrl],
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-purple-100 text-purple-700';
      case 'partial': return 'bg-yellow-100 text-yellow-700';
      case 'received': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = (suppliers ?? []).find(s => s.id === supplierId);
    return supplier?.name || 'Unknown Supplier';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',Helvetica] font-bold text-3xl text-[#222029]">
            Purchase Orders
          </h1>
          <p className="font-['Poppins',Helvetica] font-normal text-sm text-[#999999] mt-1">
            Manage purchase orders and suppliers
          </p>
        </div>
        <div className="flex gap-2">
          <AddSupplierDialog />
          <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-po">
            <Plus className="w-4 h-4 mr-2" />
            Create Purchase Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
          <SelectTrigger className="w-[200px]" data-testid="select-garage-filter-po">
            <Building2 className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Garages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Garages</SelectItem>
            {(garages ?? []).map((garage) => (
              <SelectItem key={garage.id} value={garage.id}>
                {garage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Purchase Orders List */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading purchase orders...</p>
            </div>
          ) : (purchaseOrders ?? []).length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-['Poppins',Helvetica] font-semibold text-lg text-gray-600 mb-2">
                No Purchase Orders
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Create your first purchase order to start managing inventory
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Purchase Order
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                      PO Number
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                      Supplier
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                      Order Date
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                      Expected Delivery
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                      Total Amount
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders?.map((po) => (
                    <tr key={po.id} className="border-b border-gray-100 hover:bg-gray-50" data-testid={`po-row-${po.id}`}>
                      <td className="py-3 px-4">
                        <span className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029]">
                          {po.poNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {getSupplierName(po.supplierId)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {new Date(po.orderDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                          ${parseFloat(po.totalAmount).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(po.status)}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" data-testid={`button-view-po-${po.id}`}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
