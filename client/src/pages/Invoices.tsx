import { useState } from "react";
import { FileText, Plus, Building2, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { StandardTablePage } from "@/components/layouts";
import { StatusBadge } from "@/components/ui/status-badge";
import { CreateInvoiceDialog } from "@/components/CreateInvoiceDialog";
import { InvoiceDetailsDialog } from "@/components/InvoiceDetailsDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { RoleGate } from "@/components/RoleGate";
import { RoleBadge } from "@/components/RoleBadge";
import type { Invoice, Garage, User } from "@shared/schema";
import type { Column } from "@/components/DataTable";

export function Invoices() {
  const { t } = useTranslation();
  const { canCreate, canEdit, canApprove, canView, hasPermission, getRoleDisplayName } = usePermissions();
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


  const canViewFinancialsCheck = hasPermission('invoices', 'view_financials');

  const columns: Column<Invoice>[] = [
    {
      key: "invoiceNumber",
      label: t('invoices.invoiceNumber', 'Invoice #'),
      render: (invoice) => (
        <span className="font-['Poppins',Helvetica] font-medium text-sm text-[#0B1F3B] dark:text-white">
          {invoice.invoiceNumber}
        </span>
      ),
    },
    {
      key: "customerId",
      label: t('invoices.customer', 'Customer'),
      render: (invoice) => (
        <span className="text-sm text-[#64748B] dark:text-gray-300">
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
        <span className="text-sm text-[#64748B] dark:text-gray-300">
          {new Date(invoice.invoiceDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "dueDate",
      label: t('invoices.dueDate', 'Due Date'),
      render: (invoice) => (
        <span className="text-sm text-[#64748B] dark:text-gray-300">
          {new Date(invoice.dueDate).toLocaleDateString()}
        </span>
      ),
    },
    ...(canViewFinancialsCheck ? [
      {
        key: "totalAmount" as const,
        label: t('invoices.totalAmount', 'Total Amount'),
        render: (invoice: Invoice) => (
          <span className="font-['Poppins',Helvetica] font-semibold text-sm text-[#0B1F3B] dark:text-white">
            ${parseFloat(invoice.totalAmount).toFixed(2)}
          </span>
        ),
      },
      {
        key: "balanceAmount" as const,
        label: t('invoices.balance', 'Balance'),
        render: (invoice: Invoice) => (
          <span className="font-['Poppins',Helvetica] font-semibold text-sm text-[#0B1F3B] dark:text-white">
            ${parseFloat(invoice.balanceAmount).toFixed(2)}
          </span>
        ),
      },
    ] : [
      {
        key: "totalAmount" as const,
        label: t('invoices.totalAmount', 'Total Amount'),
        render: () => (
          <span className="text-sm text-zinc-500 flex items-center gap-1">
            <Shield className="w-3 h-3" /> {t('permissions.restricted', 'Restricted')}
          </span>
        ),
      },
    ]),
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
        canViewFinancialsCheck ? (
          <InvoiceDetailsDialog 
            invoice={invoice}
            customer={customers?.find(c => c.id === invoice.customerId)}
          />
        ) : (
          <span className="text-xs text-zinc-500">{t('permissions.viewOnly', 'View Only')}</span>
        )
      ),
    },
  ];

  const pageActions = canCreate('invoices') ? [
    {
      label: t('invoices.createInvoice', 'Create Invoice'),
      onClick: () => setIsCreateDialogOpen(true),
      icon: Plus,
    },
  ] : [];

  const canViewFinancials = hasPermission('invoices', 'view_financials');

  return (
    <>
      {/* Role-Based Access Indicator */}
      <div className="mx-6 mt-4 flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-[#151A23]/50 border border-[#E2E8F0] dark:border-[#232A36]">
        <RoleBadge size="md" />
        {canViewFinancials ? (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            {t('permissions.fullFinancialAccess', 'Full financial access - You can view all billing details')}
          </span>
        ) : canCreate('invoices') ? (
          <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
            {t('permissions.canCreateInvoices', 'You can create and manage invoices')}
          </span>
        ) : (
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <Shield className="w-3 h-3" /> {t('permissions.viewOnlyContact', 'View only - Contact billing department for changes')}
          </span>
        )}
      </div>

      <StandardTablePage
        title={t('invoices.title', 'Invoices & Billing')}
        description={t('invoices.description', 'Manage invoices and payments')}
        icon={FileText}
        actions={pageActions}
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
      
      <CreateInvoiceDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        showTrigger={false}
      />
    </>
  );
}
