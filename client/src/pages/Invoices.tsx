import { useState } from "react";
import { FileText, Plus, Search, Building2 } from "lucide-react";
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
import { CreateInvoiceDialog } from "@/components/CreateInvoiceDialog";
import { InvoiceDetailsDialog } from "@/components/InvoiceDetailsDialog";
import type { Invoice, Garage, User } from "@shared/schema";

export function Invoices() {
  const [selectedGarageId, setSelectedGarageId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: garages } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  const invoiceUrl = `/api/invoices${
    selectedGarageId !== "all" || statusFilter !== "all"
      ? `?${new URLSearchParams({
          ...(selectedGarageId !== "all" && { garage_id: selectedGarageId }),
          ...(statusFilter !== "all" && { status: statusFilter }),
        })}`
      : ""
  }`;

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: [invoiceUrl],
  });

  const { data: customers } = useQuery<User[]>({
    queryKey: ['/api/customers'],
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-600",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',Helvetica] font-bold text-3xl text-[#222029]">
            Invoices & Billing
          </h1>
          <p className="font-['Poppins',Helvetica] font-normal text-sm text-[#999999] mt-1">
            Manage invoices and payments
          </p>
        </div>
        <div className="flex gap-2">
          <CreateInvoiceDialog />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search invoices..."
            className="pl-10"
            data-testid="input-search-invoices"
          />
        </div>
        <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
          <SelectTrigger className="w-[200px]" data-testid="select-garage-filter">
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
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices List */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading invoices...</p>
            </div>
          ) : (invoices ?? []).length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-['Poppins',Helvetica] font-semibold text-lg text-gray-600 mb-2">
                No Invoices
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Create your first invoice to start billing customers
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                      Invoice #
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                      Invoice Date
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                      Due Date
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                      Total Amount
                    </th>
                    <th className="text-left py-3 px-4 font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                      Balance
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
                  {invoices?.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50" data-testid={`invoice-row-${invoice.id}`}>
                      <td className="py-3 px-4">
                        <span className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029]">
                          {invoice.invoiceNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {customers?.find(c => c.id === invoice.customerId)?.fullName || 
                           customers?.find(c => c.id === invoice.customerId)?.email || 
                           "Unknown"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                          ${parseFloat(invoice.totalAmount).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-['Poppins',Helvetica] font-semibold text-sm text-[#222029]">
                          ${parseFloat(invoice.balanceAmount).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <InvoiceDetailsDialog 
                          invoice={invoice}
                          customer={customers?.find(c => c.id === invoice.customerId)}
                        />
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
