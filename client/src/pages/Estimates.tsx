import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { CreateEstimateDialog } from "@/components/CreateEstimateDialog";
import { EstimateDetailsDialog } from "@/components/EstimateDetailsDialog";
import { StandardTablePage } from "@/components/layouts";
import type { Estimate, Garage, User } from "@shared/schema";

export function Estimates() {
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
      draft: "bg-gray-100 dark:bg-salis-gray-dark text-gray-800 dark:text-gray-200",
      sent: "bg-gray-100 dark:bg-salis-gray-dark text-gray-900 dark:text-white",
      accepted: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
      declined: "bg-salis-black dark:bg-white text-white dark:text-salis-black",
      expired: "bg-gray-100 dark:bg-salis-gray-dark text-gray-600 dark:text-gray-400",
    };
    return colors[status] || "bg-gray-100 dark:bg-salis-gray-dark text-gray-800 dark:text-gray-200";
  };

  const columns = [
    {
      key: "estimateNumber",
      label: "Estimate #",
      render: (estimate: Estimate) => (
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-gray-900 dark:text-white/50" />
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white" data-testid={`text-estimate-number-${estimate.id}`}>
              {estimate.estimateNumber}
            </p>
            <p className="text-xs text-gray-900 dark:text-white/60" data-testid={`text-customer-${estimate.id}`}>
              {customers?.find(c => c.id === estimate.customerId)?.fullName || "Unknown Customer"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "totalAmount",
      label: "Amount",
      render: (estimate: Estimate) => (
        <div className="text-right">
          <p className="font-bold text-sm text-gray-900 dark:text-white" data-testid={`text-amount-${estimate.id}`}>
            ${estimate.totalAmount}
          </p>
          {estimate.validUntil && (
            <p className="text-xs text-gray-900 dark:text-white/60">
              Valid until {new Date(estimate.validUntil).toLocaleDateString()}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
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
      title="Estimates & Quotes"
      description="Create and manage customer estimates"
      icon={FileText}
      actions={[
        {
          label: "Create Estimate",
          onClick: () => {},
          icon: Plus,
        },
      ]}
      data={estimates || []}
      isLoading={isLoading}
      columns={columns}
      searchPlaceholder="Search estimates..."
      filters={[
        {
          id: "garageId",
          label: "Garage",
          options: [
            { value: "all", label: "All Garages" },
            ...(garages || []).map(g => ({ value: g.id, label: g.name })),
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
            { value: "accepted", label: "Accepted" },
            { value: "declined", label: "Declined" },
            { value: "expired", label: "Expired" },
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
        title: "No Estimates",
        description: "Create your first estimate to start quoting customers",
      }}
      additionalContent={<CreateEstimateDialog />}
    />
  );
}
