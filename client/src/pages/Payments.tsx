import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const columns: Column<Payment>[] = [
    {
      key: "invoiceId",
      label: t('payments.invoiceNumber', 'Invoice #'),
      render: (payment) => (
        <span className="font-mono text-sm text-[#0B1F3B] dark:text-white">{payment.invoiceId}</span>
      ),
    },
    {
      key: "customerName",
      label: t('payments.customer', 'Customer'),
      render: (payment) => (
        <div>
          <p className="font-medium text-[#0B1F3B] dark:text-white">{payment.customerName}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: t('common.amount', 'Amount'),
      render: (payment) => (
        <span className="font-semibold text-[#0B1F3B] dark:text-white">${payment.amount.toFixed(2)}</span>
      ),
    },
    {
      key: "method",
      label: t('payments.paymentMethod', 'Payment Method'),
      render: (payment) => (
        <Badge variant="outline" className="capitalize border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">
          {payment.method}
        </Badge>
      ),
    },
    {
      key: "status",
      label: t('common.status', 'Status'),
      render: (payment) => {
        const statusConfig = {
          completed: { icon: CheckCircle, className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
          pending: { icon: Clock, className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
          failed: { icon: XCircle, className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
          refunded: { icon: XCircle, className: "bg-gray-100 text-[#64748B] dark:bg-gray-900/30 dark:text-gray-400" },
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
      label: t('payments.transactionId', 'Transaction ID'),
      render: (payment) =>
        payment.transactionId ? (
          <span className="font-mono text-xs text-[#64748B]">{payment.transactionId}</span>
        ) : (
          <span className="text-[#64748B]">-</span>
        ),
    },
    {
      key: "paidAt",
      label: t('payments.paidDate', 'Paid Date'),
      render: (payment) =>
        payment.paidAt ? (
          <span className="text-[#64748B]">{new Date(payment.paidAt).toLocaleDateString()}</span>
        ) : (
          <span className="text-[#64748B]">-</span>
        ),
    },
    {
      key: "actions",
      label: t('common.actions', 'Actions'),
      render: (payment) => (
        <Button
          size="sm"
          variant="outline"
          className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-gradient-to-r hover:from-[#0A5ED7] hover:to-[#0BB3FF] hover:text-white hover:border-transparent"
          data-testid={`button-receipt-${payment.id}`}
        >
          <Download className="h-4 w-4 mr-1" />
          {t('payments.receipt', 'Receipt')}
        </Button>
      ),
    },
  ];

  const filters = [
    {
      id: "status",
      label: t('common.status', 'Status'),
      options: [
        { value: "all", label: t('payments.allStatuses', 'All Statuses') },
        { value: "completed", label: t('common.completed', 'Completed') },
        { value: "pending", label: t('common.pending', 'Pending') },
        { value: "failed", label: t('common.failed', 'Failed') },
        { value: "refunded", label: t('payments.refunded', 'Refunded') },
      ],
    },
    {
      id: "method",
      label: t('payments.method', 'Method'),
      options: [
        { value: "all", label: t('payments.allMethods', 'All Methods') },
        { value: "card", label: t('payments.card', 'Card') },
        { value: "cash", label: t('payments.cash', 'Cash') },
        { value: "bank_transfer", label: t('payments.bankTransfer', 'Bank Transfer') },
        { value: "check", label: t('payments.check', 'Check') },
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
      title={t('payments.title', 'Payments')}
      description={t('payments.description', 'Track and manage all payment transactions')}
      icon={DollarSign}
      data={payments}
      isLoading={isLoading}
      columns={columns}
      searchPlaceholder={t('payments.searchPayments', 'Search payments...')}
      filters={filters}
      additionalContent={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] rounded-lg">
            <p className="text-sm text-[#64748B]">{t('payments.totalReceived', 'Total Received')}</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] bg-clip-text text-transparent">${totalAmount.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] rounded-lg">
            <p className="text-sm text-[#64748B]">{t('common.pending', 'Pending')}</p>
            <p className="text-2xl font-bold text-[#F97316]">${pendingAmount.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] rounded-lg">
            <p className="text-sm text-[#64748B]">{t('payments.totalTransactions', 'Total Transactions')}</p>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{payments.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] rounded-lg">
            <p className="text-sm text-[#64748B]">{t('payments.successRate', 'Success Rate')}</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] bg-clip-text text-transparent">
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
        title: t('payments.noPaymentsFound', 'No payments found'),
        description: t('payments.noPaymentsDescription', 'Payment transactions will appear here once customers make payments'),
      }}
    />
  );
}
