import { useState } from "react";
import { FileText, Plus, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { StandardTablePage } from "@/components/layouts";
import { StatusBadge } from "@/components/ui/status-badge";
import { CreateInvoiceDialog } from "@/components/CreateInvoiceDialog";
import { InvoiceDetailsDialog } from "@/components/InvoiceDetailsDialog";
import type { Invoice, Garage, User } from "@shared/schema";
import type { Column } from "@/components/DataTable";

export function Invoices() {
  const { t } = useTranslation();
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


  const columns: Column<Invoice>[] = [
    {
      key: "invoiceNumber",
      label: t('invoices.invoiceNumber', 'Invoice #'),
      render: (invoice) => (
        <span className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white">
          {invoice.invoiceNumber}
        </span>
      ),
    },
    {
      key: "customerId",
      label: t('invoices.customer', 'Customer'),
      render: (invoice) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {customers?.find(c => c.id === invoice.customerId)?.fullName || 
           customers?.find(c => c.id === invoice.customerId)?.email || 
           t('common.unknown', 'Unknown')}
        </span>
      ),
    },
    {
      key: "invoiceDate",
      label: t('invoices.invoiceDate', 'Invoice Date'),
      render: (invoice) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {new Date(invoice.invoiceDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "dueDate",
      label: t('invoices.dueDate', 'Due Date'),
      render: (invoice) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {new Date(invoice.dueDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "totalAmount",
      label: t('invoices.totalAmount', 'Total Amount'),
      render: (invoice) => (
        <span className="font-['Poppins',Helvetica] font-semibold text-sm text-gray-900 dark:text-white">
          ${parseFloat(invoice.totalAmount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "balanceAmount",
      label: t('invoices.balance', 'Balance'),
      render: (invoice) => (
        <span className="font-['Poppins',Helvetica] font-semibold text-sm text-gray-900 dark:text-white">
          ${parseFloat(invoice.balanceAmount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      label: t('common.status', 'Status'),
      render: (invoice) => (
        <StatusBadge status={invoice.status} />
      ),
    },
    {
      key: "actions",
      label: t('common.actions', 'Actions'),
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
        title={t('invoices.title', 'Invoices & Billing')}
        description={t('invoices.description', 'Manage invoices and payments')}
        icon={FileText}
        actions={[
          {
            label: t('invoices.createInvoice', 'Create Invoice'),
            onClick: () => setIsCreateDialogOpen(true),
            icon: Plus,
          },
        ]}
        data={invoices ?? []}
        isLoading={isLoading}
        columns={columns}
        searchPlaceholder={t('invoices.searchPlaceholder', 'Search invoices...')}
        filters={[
          {
            id: "garageId",
            label: t('invoices.garage', 'Garage'),
            options: [
              { value: "all", label: t('invoices.allGarages', 'All Garages') },
              ...(garages ?? []).map((garage) => ({
                value: garage.id,
                label: garage.name,
              })),
            ],
            defaultValue: selectedGarageId,
          },
          {
            id: "status",
            label: t('common.status', 'Status'),
            options: [
              { value: "all", label: t('invoices.allStatus', 'All Status') },
              { value: "draft", label: t('invoices.status.draft', 'Draft') },
              { value: "sent", label: t('invoices.status.sent', 'Sent') },
              { value: "paid", label: t('invoices.status.paid', 'Paid') },
              { value: "overdue", label: t('invoices.status.overdue', 'Overdue') },
              { value: "cancelled", label: t('invoices.status.cancelled', 'Cancelled') },
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
          title: t('invoices.noInvoices', 'No Invoices'),
          description: t('invoices.noInvoicesDescription', 'Create your first invoice to start billing customers'),
          actions: [
            {
              label: t('invoices.createInvoice', 'Create Invoice'),
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
