import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StandardPageLayout } from "@/components/layouts";
import { CreditCard, DollarSign, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Transaction = {
  id: string;
  amount: number;
  status: "success" | "failed" | "pending";
  timestamp: Date;
  gateway: string;
  cardLast4: string;
};

export default function PaymentGatewaySimulator() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [gateway, setGateway] = useState("stripe");
  const [cardNumber, setCardNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const simulatePayment = async () => {
    if (!amount || !cardNumber) {
      toast({
        title: t('common.error', 'Error'),
        description: t('paymentSimulator.fillAllFields', 'Please fill in all fields'),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const success = Math.random() > 0.2;
      const transaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        amount: parseFloat(amount),
        status: success ? "success" : "failed",
        timestamp: new Date(),
        gateway,
        cardLast4: cardNumber.slice(-4),
      };

      setTransactions([transaction, ...transactions]);
      setIsProcessing(false);

      toast({
        title: success ? t('paymentSimulator.paymentSuccessful', 'Payment Successful') : t('paymentSimulator.paymentFailed', 'Payment Failed'),
        description: success
          ? t('paymentSimulator.successMessage', `Successfully processed $${amount} via ${gateway}`)
          : t('paymentSimulator.failedMessage', 'Payment was declined. Please try again.'),
        variant: success ? "default" : "destructive",
      });

      if (success) {
        setAmount("");
        setCardNumber("");
      }
    }, 2000);
  };

  return (
    <StandardPageLayout
      title={t('paymentSimulator.title', 'Payment Gateway Simulator')}
      description={t('paymentSimulator.description', 'Test payment processing with different gateways')}
      icon={CreditCard}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('paymentSimulator.simulatePayment', 'Simulate Payment')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('paymentSimulator.testPaymentFlow', 'Test payment processing flow')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gateway" className="text-[#0B1F3B] dark:text-white">{t('paymentSimulator.paymentGateway', 'Payment Gateway')}</Label>
              <Select value={gateway} onValueChange={setGateway}>
                <SelectTrigger id="gateway" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-gateway">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectItem value="stripe">{t('paymentSimulator.gateways.stripe', 'Stripe')}</SelectItem>
                  <SelectItem value="paypal">{t('paymentSimulator.gateways.paypal', 'PayPal')}</SelectItem>
                  <SelectItem value="square">{t('paymentSimulator.gateways.square', 'Square')}</SelectItem>
                  <SelectItem value="authorize">{t('paymentSimulator.gateways.authorize', 'Authorize.Net')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-[#0B1F3B] dark:text-white">{t('paymentSimulator.amountDollar', 'Amount ($)')}</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-[#0B1F3B] dark:text-white">{t('paymentSimulator.cardNumberTest', 'Card Number (Test)')}</Label>
              <Input
                id="cardNumber"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-card-number"
              />
              <p className="text-xs text-[#64748B]">
                {t('paymentSimulator.testCardsHint', 'Test cards: 4242 4242 4242 4242 (success), 4000 0000 0000 0002 (declined)')}
              </p>
            </div>

            <Button
              onClick={simulatePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90"
              data-testid="button-process-payment"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {t('paymentSimulator.processing', 'Processing...')}
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  {t('paymentSimulator.processPayment', 'Process Payment')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('paymentSimulator.transactionHistory', 'Transaction History')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('paymentSimulator.recentTransactions', 'Recent simulated transactions')}</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-[#64748B]">
                <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t('paymentSimulator.noTransactionsYet', 'No transactions yet')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                    data-testid={`transaction-${txn.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {txn.status === "success" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium text-[#0B1F3B] dark:text-white">${txn.amount.toFixed(2)}</span>
                      </div>
                      <Badge
                        className={
                          txn.status === "success"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }
                      >
                        {t(`paymentSimulator.status.${txn.status}`, txn.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-[#64748B]">
                      <p>{t('paymentSimulator.gateway', 'Gateway')}: {t(`paymentSimulator.gateways.${txn.gateway}`, txn.gateway)}</p>
                      <p>{t('paymentSimulator.cardLabel', 'Card')}: **** **** **** {txn.cardLast4}</p>
                      <p>{txn.timestamp.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('paymentSimulator.gatewayStatistics', 'Gateway Statistics')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('paymentSimulator.successRatesByGateway', 'Success rates by payment gateway')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["stripe", "paypal", "square", "authorize"].map((gw) => {
              const gwTransactions = transactions.filter((t) => t.gateway === gw);
              const successRate = gwTransactions.length
                ? (gwTransactions.filter((t) => t.status === "success").length / gwTransactions.length) * 100
                : 0;

              return (
                <div key={gw} className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                  <p className="text-sm text-[#64748B]">{t(`paymentSimulator.gateways.${gw}`, gw)}</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] bg-clip-text text-transparent">{successRate.toFixed(0)}%</p>
                  <p className="text-xs text-[#64748B]">
                    {gwTransactions.length} {t('paymentSimulator.transactions', 'transactions')}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
