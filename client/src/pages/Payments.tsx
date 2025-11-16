import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardTablePage } from "@/components/layouts";
import { DollarSign, CheckCircle, XCircle, Clock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Column } from "@/components/DataTable";

type Payment = {
  id: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  method: string;
  status: "completed" | "pending" | "failed" | "refunded";
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
};

export default function Payments() {
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const columns: Column<Payment>[] = [
    {
      key: "invoiceId",
      label: "Invoice #",
      render: (payment) => (
        <span className="font-mono text-sm">{payment.invoiceId}</span>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      render: (payment) => (
        <div>
          <p className="font-medium">{payment.customerName}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (payment) => (
        <span className="font-semibold">${payment.amount.toFixed(2)}</span>
      ),
    },
    {
      key: "method",
      label: "Payment Method",
      render: (payment) => (
        <Badge variant="outline" className="capitalize">
          {payment.method}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (payment) => {
        const statusConfig = {
          completed: { icon: CheckCircle, className: "bg-green-100 text-green-700 dark:bg-green-900/30" },
          pending: { icon: Clock, className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30" },
          failed: { icon: XCircle, className: "bg-red-100 text-red-700 dark:bg-red-900/30" },
          refunded: { icon: XCircle, className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30" },
        };
        const config = statusConfig[payment.status];
        const Icon = config.icon;

        return (
          <Badge className={config.className}>
            <Icon className="h-3 w-3 mr-1" />
            {payment.status}
          </Badge>
        );
      },
    },
    {
      key: "transactionId",
      label: "Transaction ID",
      render: (payment) =>
        payment.transactionId ? (
          <span className="font-mono text-xs">{payment.transactionId}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "paidAt",
      label: "Paid Date",
      render: (payment) =>
        payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "-",
    },
    {
      key: "actions",
      label: "Actions",
      render: (payment) => (
        <Button
          size="sm"
          variant="outline"
          data-testid={`button-receipt-${payment.id}`}
        >
          <Download className="h-4 w-4 mr-1" />
          Receipt
        </Button>
      ),
    },
  ];

  const filters = [
    {
      id: "status",
      label: "Status",
      options: [
        { value: "all", label: "All Statuses" },
        { value: "completed", label: "Completed" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" },
        { value: "refunded", label: "Refunded" },
      ],
    },
    {
      id: "method",
      label: "Method",
      options: [
        { value: "all", label: "All Methods" },
        { value: "card", label: "Card" },
        { value: "cash", label: "Cash" },
        { value: "bank_transfer", label: "Bank Transfer" },
        { value: "check", label: "Check" },
      ],
    },
  ];

  const totalAmount = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <StandardTablePage
      title="Payments"
      description="Track and manage all payment transactions"
      icon={DollarSign}
      data={payments}
      isLoading={isLoading}
      columns={columns}
      searchPlaceholder="Search payments..."
      filters={filters}
      additionalContent={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-card border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Received</p>
            <p className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-card border rounded-lg">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-card border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">{payments.length}</p>
          </div>
          <div className="p-4 bg-card border rounded-lg">
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-bold">
              {payments.length > 0
                ? ((payments.filter((p) => p.status === "completed").length / payments.length) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>
      }
      emptyState={{
        icon: DollarSign,
        title: "No payments found",
        description: "Payment transactions will appear here once customers make payments",
      }}
    />
  );
}
