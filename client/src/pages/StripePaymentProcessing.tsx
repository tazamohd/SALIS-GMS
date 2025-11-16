import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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

const CURRENCIES = [
  { code: 'usd', symbol: '$', name: 'USD' },
  { code: 'eur', symbol: '€', name: 'EUR' },
  { code: 'gbp', symbol: '£', name: 'GBP' },
  { code: 'cad', symbol: 'C$', name: 'CAD' },
];

export default function StripePaymentProcessing() {
  const { toast } = useToast();
  const [createPaymentOpen, setCreatePaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCurrency, setPaymentCurrency] = useState("usd");
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
        title: "Payment Intent Created",
        description: `Payment intent ${data.paymentIntentId} created successfully`,
      });
      setCreatePaymentOpen(false);
      setPaymentAmount("");
      setPaymentCurrency("usd");
    },
    onError: (error: any) => {
      toast({
        title: "Payment Creation Failed",
        description: error.message || "Failed to create payment intent",
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
        title: "Refund Processed",
        description: `Refund ${data.refundId} processed successfully`,
      });
      setRefundDialogOpen(false);
      setSelectedPaymentId("");
      setRefundAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Refund Failed",
        description: error.message || "Failed to process refund",
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
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
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
        title: "No Payment Selected",
        description: "Please select a payment to refund",
        variant: "destructive",
      });
      return;
    }

    const amount = refundAmount ? parseFloat(refundAmount) : undefined;
    if (amount !== undefined && (isNaN(amount) || amount <= 0)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid refund amount",
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
      title="Stripe Payment Processing"
      description="Manage payment intents, refunds, and transaction status"
      icon={CreditCard}
      actions={[
        {
          label: "Create Payment",
          onClick: () => setCreatePaymentOpen(true),
          icon: CreditCard,
          variant: "default",
        },
        {
          label: "Process Refund",
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
            <CardTitle className="text-sm font-medium">Create Payment Intent</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Start a new payment transaction</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusDialogOpen(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check Payment Status</CardTitle>
            <CheckCircle className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Track payment intent status</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setRefundDialogOpen(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Process Refund</CardTitle>
            <Banknote className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Refund a completed payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Processing Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Stripe Integration Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2 dark:text-white">Setup Instructions</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>Add your Stripe Secret Key to environment secrets</li>
              <li>Configure webhook endpoints for payment confirmations</li>
              <li>Test with Stripe test mode before going live</li>
              <li>Review Stripe dashboard for transaction details</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium mb-2 dark:text-white">Payment Statuses</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Succeeded - Payment complete</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">Processing - In progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-gray-600 dark:text-gray-400">Failed - Payment failed</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400">Requires Action - User input needed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Payment Dialog */}
      <Dialog open={createPaymentOpen} onOpenChange={setCreatePaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Payment Intent</DialogTitle>
            <DialogDescription>
              Create a new Stripe payment intent for processing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
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
              <Label htmlFor="currency">Currency</Label>
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
              Cancel
            </Button>
            <Button
              onClick={handleCreatePayment}
              disabled={createPaymentMutation.isPending}
              data-testid="button-confirm-payment"
            >
              {createPaymentMutation.isPending ? "Creating..." : "Create Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Refund a completed payment. Leave amount empty for full refund.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentIntentId">Payment Intent ID</Label>
              <Input
                id="paymentIntentId"
                placeholder="pi_..."
                value={selectedPaymentId}
                onChange={(e) => setSelectedPaymentId(e.target.value)}
                data-testid="input-payment-intent-id"
              />
            </div>
            <div>
              <Label htmlFor="refundAmount">Refund Amount (optional)</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                placeholder="Leave empty for full refund"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                data-testid="input-refund-amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProcessRefund}
              disabled={refundMutation.isPending}
              variant="destructive"
              data-testid="button-confirm-refund"
            >
              {refundMutation.isPending ? "Processing..." : "Process Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Check Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check Payment Status</DialogTitle>
            <DialogDescription>
              Retrieve the current status of a payment intent
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="statusPaymentId">Payment Intent ID</Label>
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
                    <span>Payment Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status:</span>
                    <Badge variant={getStatusBadgeVariant(paymentStatus.status)} data-testid="badge-payment-status">
                      {paymentStatus.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Amount:</span>
                    <span className="font-medium" data-testid="text-payment-amount">
                      {paymentStatus.currency?.toUpperCase()} {(paymentStatus.amount / 100).toFixed(2)}
                    </span>
                  </div>
                  {paymentStatus.created && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Created:</span>
                      <span className="text-sm">{new Date(paymentStatus.created * 1000).toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => refetchStatus()}
              disabled={!statusPaymentId}
              data-testid="button-check-status"
            >
              Check Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </StandardPageLayout>
  );
}
