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
  { code: 'sar', symbol: 'ر.س', name: 'SAR - Saudi Riyal' },
  { code: 'usd', symbol: '$', name: 'USD - US Dollar' },
  { code: 'aed', symbol: 'د.إ', name: 'AED - UAE Dirham' },
  { code: 'bhd', symbol: 'د.ب', name: 'BHD - Bahraini Dinar' },
  { code: 'kwd', symbol: 'د.ك', name: 'KWD - Kuwaiti Dinar' },
  { code: 'omr', symbol: 'ر.ع', name: 'OMR - Omani Rial' },
  { code: 'qar', symbol: 'ر.ق', name: 'QAR - Qatari Riyal' },
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

  // Create payment intent mutation
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

  // Process refund mutation
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

  // Get payment status query
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
      amount: Math.round(amount * 100), // Convert to cents
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
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'requires_payment_method':
      case 'requires_confirmation':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCreatePaymentOpen(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('payments.stripe.createPaymentIntent', 'Create Payment Intent')}</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">{t('payments.stripe.startNewTransaction', 'Start a new payment transaction')}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusDialogOpen(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('payments.stripe.checkPaymentStatus', 'Check Payment Status')}</CardTitle>
            <CheckCircle className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">{t('payments.stripe.trackPaymentStatus', 'Track payment intent status')}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setRefundDialogOpen(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('payments.stripe.processRefund', 'Process Refund')}</CardTitle>
            <Banknote className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">{t('payments.stripe.refundCompletedPayment', 'Refund a completed payment')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Accepted Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t('payments.stripe.acceptedPaymentMethods', 'Accepted Payment Methods')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Local Saudi Payment Methods */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <div className="w-12 h-12 mx-auto mb-2 bg-[#004D8D] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">mada</span>
              </div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">Mada</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">مدى</p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <div className="w-12 h-12 mx-auto mb-2 bg-[#4F008C] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">STC Pay</span>
              </div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">STC Pay</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">إس تي سي باي</p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <div className="w-12 h-12 mx-auto mb-2 bg-[#4F008C] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">STC</span>
              </div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">STC Bank</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">بنك إس تي سي</p>
            </div>

            {/* International Cards */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <div className="w-12 h-12 mx-auto mb-2 bg-[#1A1F71] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VISA</span>
              </div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">Visa</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">فيزا</p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-[#EB001B] to-[#F79E1B] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">MC</span>
              </div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">Mastercard</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">ماستركارد</p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <div className="w-12 h-12 mx-auto mb-2 bg-[#006FCF] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">AMEX</span>
              </div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">American Express</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">أمريكان إكسبريس</p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <div className="w-12 h-12 mx-auto mb-2 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">Pay</span>
              </div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">Apple Pay</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">آبل باي</p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-600 rounded-lg flex items-center justify-center">
                <Banknote className="w-6 h-6 text-white" />
              </div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">{t('payments.methods.bankTransfer', 'Bank Transfer')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">تحويل بنكي</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white">{t('payments.stripe.defaultCurrency', 'Default Currency')}:</strong> Saudi Riyal (SAR) ر.س
              <span className="mx-2">|</span>
              <strong className="text-gray-900 dark:text-white">{t('payments.stripe.supported', 'Supported')}:</strong> SAR, AED, BHD, KWD, OMR, QAR, USD, EUR, GBP
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Processing Guide */}
      <Card>
        <CardHeader>
          <CardTitle>{t('payments.stripe.integrationGuide', 'Payment Integration Guide')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2 dark:text-white">{t('payments.stripe.setupInstructions', 'Setup Instructions')}</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>{t('payments.stripe.step1', 'Add your Stripe Secret Key to environment secrets')}</li>
              <li>{t('payments.stripe.step2', 'Configure webhook endpoints for payment confirmations')}</li>
              <li>{t('payments.stripe.step3', 'Test with Stripe test mode before going live')}</li>
              <li>{t('payments.stripe.step4', 'Review Stripe dashboard for transaction details')}</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium mb-2 dark:text-white">{t('payments.stripe.paymentStatuses', 'Payment Statuses')}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">{t('payments.stripe.status.succeeded', 'Succeeded - Payment complete')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">{t('payments.stripe.status.processing', 'Processing - In progress')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-gray-600 dark:text-gray-400">{t('payments.stripe.status.failed', 'Failed - Payment failed')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400">{t('payments.stripe.status.requiresAction', 'Requires Action - User input needed')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Payment Dialog */}
      <Dialog open={createPaymentOpen} onOpenChange={setCreatePaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('payments.stripe.createPaymentIntent', 'Create Payment Intent')}</DialogTitle>
            <DialogDescription>
              {t('payments.stripe.createPaymentDescription', 'Create a new Stripe payment intent for processing')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">{t('common.amount', 'Amount')}</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                data-testid="input-payment-amount"
              />
            </div>
            <div>
              <Label htmlFor="currency">{t('payments.stripe.currency', 'Currency')}</Label>
              <Select value={paymentCurrency} onValueChange={setPaymentCurrency}>
                <SelectTrigger id="currency" data-testid="select-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
            <Button variant="outline" onClick={() => setCreatePaymentOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleCreatePayment}
              disabled={createPaymentMutation.isPending}
              data-testid="button-confirm-payment"
            >
              {createPaymentMutation.isPending ? t('common.creating', 'Creating...') : t('payments.stripe.createPayment', 'Create Payment')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('payments.stripe.processRefund', 'Process Refund')}</DialogTitle>
            <DialogDescription>
              {t('payments.stripe.refundDescription', 'Refund a completed payment. Leave amount empty for full refund.')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentIntentId">{t('payments.stripe.paymentIntentId', 'Payment Intent ID')}</Label>
              <Input
                id="paymentIntentId"
                placeholder="pi_..."
                value={selectedPaymentId}
                onChange={(e) => setSelectedPaymentId(e.target.value)}
                data-testid="input-payment-intent-id"
              />
            </div>
            <div>
              <Label htmlFor="refundAmount">{t('payments.stripe.refundAmountOptional', 'Refund Amount (optional)')}</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                placeholder={t('payments.stripe.leaveEmptyForFullRefund', 'Leave empty for full refund')}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                data-testid="input-refund-amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleProcessRefund}
              disabled={refundMutation.isPending}
              variant="destructive"
              data-testid="button-confirm-refund"
            >
              {refundMutation.isPending ? t('common.processing', 'Processing...') : t('payments.stripe.processRefund', 'Process Refund')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Check Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('payments.stripe.checkPaymentStatus', 'Check Payment Status')}</DialogTitle>
            <DialogDescription>
              {t('payments.stripe.retrievePaymentStatus', 'Retrieve the current status of a payment intent')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="statusPaymentId">{t('payments.stripe.paymentIntentId', 'Payment Intent ID')}</Label>
              <Input
                id="statusPaymentId"
                placeholder="pi_..."
                value={statusPaymentId}
                onChange={(e) => setStatusPaymentId(e.target.value)}
                data-testid="input-status-payment-id"
              />
            </div>

            {paymentStatus && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center space-x-2">
                    {getStatusIcon(paymentStatus.status)}
                    <span>{t('payments.stripe.paymentStatus', 'Payment Status')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{t('common.status', 'Status')}:</span>
                    <Badge variant={getStatusBadgeVariant(paymentStatus.status)} data-testid="badge-payment-status">
                      {paymentStatus.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{t('common.amount', 'Amount')}:</span>
                    <span className="font-medium" data-testid="text-payment-amount">
                      {paymentStatus.currency?.toUpperCase()} {(paymentStatus.amount / 100).toFixed(2)}
                    </span>
                  </div>
                  {paymentStatus.created && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{t('common.created', 'Created')}:</span>
                      <span className="text-sm">{new Date(paymentStatus.created * 1000).toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              {t('common.close', 'Close')}
            </Button>
            <Button
              onClick={() => refetchStatus()}
              disabled={!statusPaymentId}
              data-testid="button-check-status"
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
