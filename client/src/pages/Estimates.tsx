import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { CreateEstimateDialog } from "@/components/CreateEstimateDialog";
import { EstimateDetailsDialog } from "@/components/EstimateDetailsDialog";
import { StandardTablePage } from "@/components/layouts";
import type { Estimate, Garage, User } from "@shared/schema";

export function Estimates() {
  const { t } = useTranslation();
  const [selectedGarageId, setSelectedGarageId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: garages } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  const estimateUrl = `/api/estimates${
    selectedGarageId !== "all" || statusFilter !== "all"
      ? `?${new URLSearchParams({
          ...(selectedGarageId !== "all" && { garage_id: selectedGarageId }),
          ...(statusFilter !== "all" && { status: statusFilter }),
        })}`
      : ""
  }`;

  const { data: estimates, isLoading } = useQuery<Estimate[]>({
    queryKey: [estimateUrl],
  });

  const { data: customers } = useQuery<User[]>({
    queryKey: ['/api/customers'],
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-[#64748B]/10 text-[#64748B]",
      sent: "bg-[#0A5ED7]/10 text-[#0A5ED7]",
      accepted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      declined: "bg-red-500/10 text-red-600 dark:text-red-400",
      expired: "bg-[#F97316]/10 text-[#F97316]",
    };
    return colors[status] || "bg-[#64748B]/10 text-[#64748B]";
  };

  const columns = [
    {
      key: "estimateNumber",
      label: t('estimates.estimateNumber', 'Estimate #'),
      render: (estimate: Estimate) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[#0B1F3B] dark:text-white" data-testid={`text-estimate-number-${estimate.id}`}>
              {estimate.estimateNumber}
            </p>
            <p className="text-xs text-[#64748B]" data-testid={`text-customer-${estimate.id}`}>
              {customers?.find(c => c.id === estimate.customerId)?.fullName || t('estimates.unknownCustomer', 'Unknown Customer')}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "totalAmount",
      label: t('common.amount', 'Amount'),
      render: (estimate: Estimate) => (
        <div className="text-right">
          <p className="font-bold text-sm text-[#0B1F3B] dark:text-white" data-testid={`text-amount-${estimate.id}`}>
            ${estimate.totalAmount}
          </p>
          {estimate.validUntil && (
            <p className="text-xs text-[#64748B]">
              {t('estimates.validUntil', 'Valid until')} {new Date(estimate.validUntil).toLocaleDateString()}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: t('common.status', 'Status'),
      render: (estimate: Estimate) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(estimate.status)}`}
          data-testid={`status-${estimate.id}`}
        >
          {estimate.status}
        </span>
      ),
    },
  ];

  return (
    <StandardTablePage
      title={t('nav.estimates', 'Estimates & Quotes')}
      description={t('estimates.description', 'Create and manage customer estimates')}
      icon={FileText}
      actions={[
        {
          label: t('estimates.createEstimate', 'Create Estimate'),
          onClick: () => {},
          icon: Plus,
        },
      ]}
      data={estimates || []}
      isLoading={isLoading}
      columns={columns}
      searchPlaceholder={t('estimates.searchPlaceholder', 'Search estimates...')}
      filters={[
        {
          id: "garageId",
          label: t('estimates.garage', 'Garage'),
          options: [
            { value: "all", label: t('estimates.allGarages', 'All Garages') },
            ...(garages || []).map(g => ({ value: g.id, label: g.name })),
          ],
          defaultValue: selectedGarageId,
        },
        {
          id: "status",
          label: t('common.status', 'Status'),
          options: [
            { value: "all", label: t('estimates.allStatus', 'All Status') },
            { value: "draft", label: t('common.draft', 'Draft') },
            { value: "sent", label: t('estimates.sent', 'Sent') },
            { value: "accepted", label: t('estimates.accepted', 'Accepted') },
            { value: "declined", label: t('estimates.declined', 'Declined') },
            { value: "expired", label: t('estimates.expired', 'Expired') },
          ],
          defaultValue: statusFilter,
        },
      ]}
      onFilterChange={(id, value) => {
        if (id === "garageId") setSelectedGarageId(value);
        if (id === "status") setStatusFilter(value);
      }}
      onRowClick={(estimate) => {}}
      emptyState={{
        icon: FileText,
        title: t('estimates.noEstimates', 'No Estimates'),
        description: t('estimates.noEstimatesDescription', 'Create your first estimate to start quoting customers'),
      }}
      additionalContent={<CreateEstimateDialog />}
    />
  );
}
