import { useState } from "react";
import { FileText, Plus, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StandardTablePage } from "@/components/layouts";
import { Badge } from "@/components/ui/badge";
import { CreateInvoiceDialog } from "@/components/CreateInvoiceDialog";
import { InvoiceDetailsDialog } from "@/components/InvoiceDetailsDialog";
import type { Invoice, Garage, User } from "@shared/schema";
import type { Column } from "@/components/DataTable";

export function Invoices() {
  const [selectedGarageId, setSelectedGarageId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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
      draft: "bg-gray-100 dark:bg-salis-gray-dark text-gray-800 dark:text-gray-300",
      sent: "bg-gray-100 dark:bg-salis-gray-dark text-gray-900 dark:text-white",
      paid: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
      overdue: "bg-salis-black dark:bg-white text-white dark:text-salis-black",
      cancelled: "bg-gray-100 dark:bg-salis-gray-dark text-gray-600 dark:text-gray-400",
    };
    return colors[status] || "bg-gray-100 dark:bg-salis-gray-dark text-gray-800 dark:text-gray-300";
  };

  const columns: Column<Invoice>[] = [
    {
      key: "invoiceNumber",
      label: "Invoice #",
      render: (invoice) => (
        <span className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white">
          {invoice.invoiceNumber}
        </span>
      ),
    },
    {
      key: "customerId",
      label: "Customer",
      render: (invoice) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {customers?.find(c => c.id === invoice.customerId)?.fullName || 
           customers?.find(c => c.id === invoice.customerId)?.email || 
           "Unknown"}
        </span>
      ),
    },
    {
      key: "invoiceDate",
      label: "Invoice Date",
      render: (invoice) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {new Date(invoice.invoiceDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (invoice) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {new Date(invoice.dueDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      render: (invoice) => (
        <span className="font-['Poppins',Helvetica] font-semibold text-sm text-gray-900 dark:text-white">
          ${parseFloat(invoice.totalAmount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "balanceAmount",
      label: "Balance",
      render: (invoice) => (
        <span className="font-['Poppins',Helvetica] font-semibold text-sm text-gray-900 dark:text-white">
          ${parseFloat(invoice.balanceAmount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (invoice) => (
        <Badge className={`capitalize ${getStatusColor(invoice.status)}`}>
          {invoice.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (invoice) => (
        <InvoiceDetailsDialog 
          invoice={invoice}
          customer={customers?.find(c => c.id === invoice.customerId)}
        />
      ),
    },
  ];

  return (
    <>
      <StandardTablePage
        title="Invoices & Billing"
        description="Manage invoices and payments"
        icon={FileText}
        actions={[
          {
            label: "Create Invoice",
            onClick: () => setIsCreateDialogOpen(true),
            icon: Plus,
          },
        ]}
        data={invoices ?? []}
        isLoading={isLoading}
        columns={columns}
        searchPlaceholder="Search invoices..."
        filters={[
          {
            id: "garageId",
            label: "Garage",
            options: [
              { value: "all", label: "All Garages" },
              ...(garages ?? []).map((garage) => ({
                value: garage.id,
                label: garage.name,
              })),
            ],
            defaultValue: selectedGarageId,
          },
          {
            id: "status",
            label: "Status",
            options: [
              { value: "all", label: "All Status" },
              { value: "draft", label: "Draft" },
              { value: "sent", label: "Sent" },
              { value: "paid", label: "Paid" },
              { value: "overdue", label: "Overdue" },
              { value: "cancelled", label: "Cancelled" },
            ],
            defaultValue: statusFilter,
          },
        ]}
        filterValues={{
          garageId: selectedGarageId,
          status: statusFilter,
        }}
        onFilterChange={(id, value) => {
          if (id === "garageId") setSelectedGarageId(value);
          if (id === "status") setStatusFilter(value);
        }}
        emptyState={{
          icon: FileText,
          title: "No Invoices",
          description: "Create your first invoice to start billing customers",
          actions: [
            {
              label: "Create Invoice",
              onClick: () => setIsCreateDialogOpen(true),
              icon: Plus,
            },
          ],
        }}
        mode="controlled"
      />
      
      {isCreateDialogOpen && <CreateInvoiceDialog />}
    </>
  );
}
