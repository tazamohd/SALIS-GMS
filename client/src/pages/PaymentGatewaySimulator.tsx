import { useState } from "react";
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
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [gateway, setGateway] = useState("stripe");
  const [cardNumber, setCardNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const simulatePayment = async () => {
    if (!amount || !cardNumber) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
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
        title: success ? "Payment Successful" : "Payment Failed",
        description: success
          ? `Successfully processed $${amount} via ${gateway}`
          : "Payment was declined. Please try again.",
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
      title="Payment Gateway Simulator"
      description="Test payment processing with different gateways"
      icon={CreditCard}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Simulate Payment</CardTitle>
            <CardDescription>Test payment processing flow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gateway">Payment Gateway</Label>
              <Select value={gateway} onValueChange={setGateway}>
                <SelectTrigger id="gateway" data-testid="select-gateway">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="authorize">Authorize.Net</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number (Test)</Label>
              <Input
                id="cardNumber"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                data-testid="input-card-number"
              />
              <p className="text-xs text-muted-foreground">
                Test cards: 4242 4242 4242 4242 (success), 4000 0000 0000 0002 (declined)
              </p>
            </div>

            <Button
              onClick={simulatePayment}
              disabled={isProcessing}
              className="w-full"
              data-testid="button-process-payment"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Process Payment
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent simulated transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="p-3 border rounded-lg"
                    data-testid={`transaction-${txn.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {txn.status === "success" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">${txn.amount.toFixed(2)}</span>
                      </div>
                      <Badge
                        className={
                          txn.status === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {txn.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Gateway: {txn.gateway}</p>
                      <p>Card: **** **** **** {txn.cardLast4}</p>
                      <p>{txn.timestamp.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Gateway Statistics</CardTitle>
          <CardDescription>Success rates by payment gateway</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["stripe", "paypal", "square", "authorize"].map((gw) => {
              const gwTransactions = transactions.filter((t) => t.gateway === gw);
              const successRate = gwTransactions.length
                ? (gwTransactions.filter((t) => t.status === "success").length / gwTransactions.length) * 100
                : 0;

              return (
                <div key={gw} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-muted-foreground capitalize">{gw}</p>
                  <p className="text-2xl font-bold">{successRate.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">
                    {gwTransactions.length} transactions
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
