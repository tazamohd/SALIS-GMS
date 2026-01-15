import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Banknote,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CURRENCIES as CURRENCY_CONFIG, PAYMENT_METHODS, getPaymentMethods } from "@/lib/currency";

const CURRENCIES = [
  { code: 'sar', symbol: 'SAR', name: 'SAR - Saudi Riyal' },
  { code: 'usd', symbol: '$', name: 'USD - US Dollar' },
  { code: 'aed', symbol: 'AED', name: 'AED - UAE Dirham' },
  { code: 'bhd', symbol: 'BHD', name: 'BHD - Bahraini Dinar' },
  { code: 'kwd', symbol: 'KWD', name: 'KWD - Kuwaiti Dinar' },
  { code: 'omr', symbol: 'OMR', name: 'OMR - Omani Rial' },
  { code: 'qar', symbol: 'QAR', name: 'QAR - Qatari Riyal' },
  { code: 'eur', symbol: '€', name: 'EUR - Euro' },
  { code: 'gbp', symbol: '£', name: 'GBP - British Pound' },
];

export default function StripePaymentProcessing() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [createPaymentOpen, setCreatePaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCurrency, setPaymentCurrency] = useState("sar");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("mada");
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusPaymentId, setStatusPaymentId] = useState("");

  const createPaymentMutation = useMutation({
    mutationFn: async ({ amount, currency }: { amount: number; currency: string }) => {
      return apiRequest('POST', '/api/stripe/create-payment-intent', { amount, currency });
    },
    onSuccess: (data: any) => {
      toast({
        title: t('payments.stripe.paymentIntentCreated', 'Payment Intent Created'),
        description: t('payments.stripe.paymentIntentCreatedDesc', 'Payment intent {{id}} created successfully').replace('{{id}}', data.paymentIntentId),
      });
      setCreatePaymentOpen(false);
      setPaymentAmount("");
      setPaymentCurrency("usd");
    },
    onError: (error: any) => {
      toast({
        title: t('payments.stripe.paymentCreationFailed', 'Payment Creation Failed'),
        description: error.message || t('payments.stripe.failedToCreatePaymentIntent', 'Failed to create payment intent'),
        variant: "destructive",
      });
    },
  });

  const refundMutation = useMutation({
    mutationFn: async ({ paymentIntentId, amount }: { paymentIntentId: string; amount?: number }) => {
      return apiRequest('POST', '/api/stripe/refund', { paymentIntentId, amount });
    },
    onSuccess: (data: any) => {
      toast({
        title: t('payments.stripe.refundProcessed', 'Refund Processed'),
        description: t('payments.stripe.refundProcessedDesc', 'Refund {{id}} processed successfully').replace('{{id}}', data.refundId),
      });
      setRefundDialogOpen(false);
      setSelectedPaymentId("");
      setRefundAmount("");
    },
    onError: (error: any) => {
      toast({
        title: t('payments.stripe.refundFailed', 'Refund Failed'),
        description: error.message || t('payments.stripe.failedToProcessRefund', 'Failed to process refund'),
        variant: "destructive",
      });
    },
  });

  const { data: paymentStatus, refetch: refetchStatus } = useQuery<any>({
    queryKey: ['/api/stripe/payment-status', statusPaymentId],
    queryFn: async () => {
      if (!statusPaymentId) return null;
      const res = await fetch(`/api/stripe/payment-status/${statusPaymentId}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to fetch payment status');
      }
      return res.json();
    },
    enabled: !!statusPaymentId && statusDialogOpen,
  });

  const handleCreatePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: t('payments.stripe.invalidAmount', 'Invalid Amount'),
        description: t('payments.stripe.enterValidAmount', 'Please enter a valid amount greater than 0'),
        variant: "destructive",
      });
      return;
    }

    createPaymentMutation.mutate({
      amount: Math.round(amount * 100),
      currency: paymentCurrency,
    });
  };

  const handleProcessRefund = () => {
    if (!selectedPaymentId) {
      toast({
        title: t('payments.stripe.noPaymentSelected', 'No Payment Selected'),
        description: t('payments.stripe.selectPaymentToRefund', 'Please select a payment to refund'),
        variant: "destructive",
      });
      return;
    }

    const amount = refundAmount ? parseFloat(refundAmount) : undefined;
    if (amount !== undefined && (isNaN(amount) || amount <= 0)) {
      toast({
        title: t('payments.stripe.invalidAmount', 'Invalid Amount'),
        description: t('payments.stripe.enterValidRefundAmount', 'Please enter a valid refund amount'),
        variant: "destructive",
      });
      return;
    }

    refundMutation.mutate({
      paymentIntentId: selectedPaymentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-[#0A5ED7]" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'requires_payment_method':
      case 'requires_confirmation':
        return <AlertCircle className="w-5 h-5 text-[#F97316]" />;
      default:
        return <AlertCircle className="w-5 h-5 text-[#64748B]" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'default';
      case 'processing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <StandardPageLayout
      title={t('payments.stripe.title', 'Stripe Payment Processing')}
      description={t('payments.stripe.description', 'Manage payment intents, refunds, and transaction status')}
      icon={CreditCard}
      actions={[
        {
          label: t('payments.stripe.createPayment', 'Create Payment'),
          onClick: () => setCreatePaymentOpen(true),
          icon: CreditCard,
          variant: "default",
        },
        {
          label: t('payments.stripe.processRefund', 'Process Refund'),
          onClick: () => setRefundDialogOpen(true),
          icon: RefreshCw,
          variant: "outline",
        },
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" onClick={() => setCreatePaymentOpen(true)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('payments.stripe.createPaymentIntent', 'Create Payment Intent')}</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#64748B]">{t('payments.stripe.startNewTransaction', 'Start a new payment transaction')}</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" onClick={() => setStatusDialogOpen(true)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('payments.stripe.checkPaymentStatus', 'Check Payment Status')}</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#64748B]">{t('payments.stripe.trackPaymentStatus', 'Track payment intent status')}</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" onClick={() => setRefundDialogOpen(true)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('payments.stripe.processRefund', 'Process Refund')}</CardTitle>
              <div className="p-2 rounded-lg bg-[#F97316]">
                <Banknote className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#64748B]">{t('payments.stripe.refundCompletedPayment', 'Refund a completed payment')}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <CreditCard className="h-5 w-5 text-[#0A5ED7]" />
              {t('payments.stripe.acceptedPaymentMethods', 'Accepted Payment Methods')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg text-center hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors bg-white dark:bg-[#0E1117]">
                <div className="w-12 h-12 mx-auto mb-2 bg-[#004D8D] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">mada</span>
                </div>
                <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">{t('payments.methods.mada', 'Mada')}</p>
              </div>

              <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg text-center hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors bg-white dark:bg-[#0E1117]">
                <div className="w-12 h-12 mx-auto mb-2 bg-[#4F008C] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">STC Pay</span>
                </div>
                <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">{t('payments.methods.stcPay', 'STC Pay')}</p>
              </div>

              <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg text-center hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors bg-white dark:bg-[#0E1117]">
                <div className="w-12 h-12 mx-auto mb-2 bg-[#4F008C] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">STC</span>
                </div>
                <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">{t('payments.methods.stcBank', 'STC Bank')}</p>
              </div>

              <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg text-center hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors bg-white dark:bg-[#0E1117]">
                <div className="w-12 h-12 mx-auto mb-2 bg-[#1A1F71] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VISA</span>
                </div>
                <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">{t('payments.methods.visa', 'Visa')}</p>
              </div>

              <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg text-center hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors bg-white dark:bg-[#0E1117]">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-[#EB001B] to-[#F79E1B] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">MC</span>
                </div>
                <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">{t('payments.methods.mastercard', 'Mastercard')}</p>
              </div>

              <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg text-center hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors bg-white dark:bg-[#0E1117]">
                <div className="w-12 h-12 mx-auto mb-2 bg-[#006FCF] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">AMEX</span>
                </div>
                <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">{t('payments.methods.amex', 'American Express')}</p>
              </div>

              <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg text-center hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors bg-white dark:bg-[#0E1117]">
                <div className="w-12 h-12 mx-auto mb-2 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">Pay</span>
                </div>
                <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">{t('payments.methods.applePay', 'Apple Pay')}</p>
              </div>

              <div className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg text-center hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors bg-white dark:bg-[#0E1117]">
                <div className="w-12 h-12 mx-auto mb-2 bg-[#64748B] rounded-lg flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <p className="font-medium text-sm text-[#0B1F3B] dark:text-white">{t('payments.methods.bankTransfer', 'Bank Transfer')}</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
              <p className="text-sm text-[#64748B]">
                <strong className="text-[#0B1F3B] dark:text-white">{t('payments.stripe.defaultCurrency', 'Default Currency')}:</strong> {t('payments.currency.sar', 'Saudi Riyal (SAR)')}
                <span className="mx-2">|</span>
                <strong className="text-[#0B1F3B] dark:text-white">{t('payments.stripe.supported', 'Supported')}:</strong> SAR, AED, BHD, KWD, OMR, QAR, USD, EUR, GBP
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('payments.stripe.integrationGuide', 'Payment Integration Guide')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2 text-[#0B1F3B] dark:text-white">{t('payments.stripe.setupInstructions', 'Setup Instructions')}</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-[#64748B]">
                <li>{t('payments.stripe.step1', 'Add your Stripe Secret Key to environment secrets')}</li>
                <li>{t('payments.stripe.step2', 'Configure webhook endpoints for payment confirmations')}</li>
                <li>{t('payments.stripe.step3', 'Test with Stripe test mode before going live')}</li>
                <li>{t('payments.stripe.step4', 'Review Stripe dashboard for transaction details')}</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium mb-2 text-[#0B1F3B] dark:text-white">{t('payments.stripe.paymentStatuses', 'Payment Statuses')}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-[#64748B]">{t('payments.stripe.status.succeeded', 'Succeeded - Payment complete')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#0A5ED7]" />
                  <span className="text-[#64748B]">{t('payments.stripe.status.processing', 'Processing - In progress')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-[#64748B]">{t('payments.stripe.status.failed', 'Failed - Payment failed')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-[#F97316]" />
                  <span className="text-[#64748B]">{t('payments.stripe.status.requiresAction', 'Requires Action - User input needed')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={createPaymentOpen} onOpenChange={setCreatePaymentOpen}>
          <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <DialogHeader>
              <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('payments.stripe.createPaymentIntent', 'Create Payment Intent')}</DialogTitle>
              <DialogDescription className="text-[#64748B]">
                {t('payments.stripe.createPaymentDescription', 'Create a new Stripe payment intent for processing')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-[#0B1F3B] dark:text-white">{t('common.amount', 'Amount')}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-payment-amount"
                />
              </div>
              <div>
                <Label htmlFor="currency" className="text-[#0B1F3B] dark:text-white">{t('payments.stripe.currency', 'Currency')}</Label>
                <Select value={paymentCurrency} onValueChange={setPaymentCurrency}>
                  <SelectTrigger id="currency" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                    {CURRENCIES.map(currency => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreatePaymentOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                onClick={handleCreatePayment}
                disabled={createPaymentMutation.isPending}
                className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90"
                data-testid="button-confirm-payment"
              >
                {createPaymentMutation.isPending ? t('common.creating', 'Creating...') : t('payments.stripe.createPayment', 'Create Payment')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
          <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <DialogHeader>
              <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('payments.stripe.processRefund', 'Process Refund')}</DialogTitle>
              <DialogDescription className="text-[#64748B]">
                {t('payments.stripe.refundDescription', 'Refund a completed payment. Leave amount empty for full refund.')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentIntentId" className="text-[#0B1F3B] dark:text-white">{t('payments.stripe.paymentIntentId', 'Payment Intent ID')}</Label>
                <Input
                  id="paymentIntentId"
                  placeholder="pi_..."
                  value={selectedPaymentId}
                  onChange={(e) => setSelectedPaymentId(e.target.value)}
                  className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-payment-intent-id"
                />
              </div>
              <div>
                <Label htmlFor="refundAmount" className="text-[#0B1F3B] dark:text-white">{t('payments.stripe.refundAmountOptional', 'Refund Amount (optional)')}</Label>
                <Input
                  id="refundAmount"
                  type="number"
                  step="0.01"
                  placeholder={t('payments.stripe.leaveEmptyForFullRefund', 'Leave empty for full refund')}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-refund-amount"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRefundDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                onClick={handleProcessRefund}
                disabled={refundMutation.isPending}
                className="bg-[#F97316] hover:bg-[#F97316]/90"
                data-testid="button-confirm-refund"
              >
                {refundMutation.isPending ? t('common.processing', 'Processing...') : t('payments.stripe.processRefund', 'Process Refund')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <DialogHeader>
              <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('payments.stripe.checkPaymentStatus', 'Check Payment Status')}</DialogTitle>
              <DialogDescription className="text-[#64748B]">
                {t('payments.stripe.retrievePaymentStatus', 'Retrieve the current status of a payment intent')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="statusPaymentId" className="text-[#0B1F3B] dark:text-white">{t('payments.stripe.paymentIntentId', 'Payment Intent ID')}</Label>
                <Input
                  id="statusPaymentId"
                  placeholder="pi_..."
                  value={statusPaymentId}
                  onChange={(e) => setStatusPaymentId(e.target.value)}
                  className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-status-payment-id"
                />
              </div>

              {paymentStatus && (
                <Card className="bg-[#F8FAFC] dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2 text-[#0B1F3B] dark:text-white">
                      {getStatusIcon(paymentStatus.status)}
                      <span>{t('payments.stripe.paymentStatus', 'Payment Status')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#64748B]">{t('common.status', 'Status')}:</span>
                      <Badge variant={getStatusBadgeVariant(paymentStatus.status)}>
                        {paymentStatus.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#64748B]">{t('common.amount', 'Amount')}:</span>
                      <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                        {paymentStatus.currency?.toUpperCase()} {(paymentStatus.amount / 100).toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                {t('common.close', 'Close')}
              </Button>
              <Button
                onClick={() => refetchStatus()}
                disabled={!statusPaymentId}
                className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90"
              >
                {t('payments.stripe.checkStatus', 'Check Status')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StandardPageLayout>
  );
}
