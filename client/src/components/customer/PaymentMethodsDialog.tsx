import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PaymentDialog } from "@/components/customer/PaymentDialog";
import { CreditCard, Wallet, CalendarClock, Banknote, Building2, Loader2 } from "lucide-react";

type MethodInfo = {
  id: string;
  label: string;
  labelAr: string;
  category: "card" | "wallet" | "bnpl" | "bank" | "cash";
  gateway: string;
};

const CATEGORY_META: Record<MethodInfo["category"], { title: string; icon: any }> = {
  card: { title: "Cards & Mada", icon: CreditCard },
  wallet: { title: "Wallets", icon: Wallet },
  bnpl: { title: "Pay Later (Instalments)", icon: CalendarClock },
  bank: { title: "Bank", icon: Building2 },
  cash: { title: "Cash", icon: Banknote },
};

/**
 * Customer-facing payment method picker. Fetches the gateways that are actually
 * configured, lets the customer choose one, then routes:
 *  - redirect      → send the browser to the gateway's hosted checkout
 *  - client_secret → open the inline Stripe Elements dialog
 *  - manual        → record cash/transfer and close
 */
export function PaymentMethodsDialog({
  open,
  onOpenChange,
  invoiceId,
  amount,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  invoiceId: string;
  amount: number;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [stripeOpen, setStripeOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  const { data, isLoading } = useQuery<{ methods: MethodInfo[] }>({
    queryKey: ["/api/payments/methods"],
    enabled: open,
  });

  const initiate = useMutation({
    mutationFn: async (method: string) => {
      const res = await apiRequest("POST", "/api/payments/initiate", { invoiceId, method });
      return res.json();
    },
    onSuccess: (result: any) => {
      if (result.kind === "redirect" && result.url) {
        window.location.href = result.url;
        return;
      }
      if (result.kind === "client_secret" && result.clientSecret) {
        setClientSecret(result.clientSecret);
        setStripeOpen(true);
        return;
      }
      if (result.kind === "manual") {
        toast({ title: "Payment recorded", description: "Marked as paid." });
        onOpenChange(false);
        onSuccess();
        return;
      }
      toast({ title: "Could not start payment", description: result.message || "Unknown error", variant: "destructive" });
    },
    onError: (err: Error) => {
      toast({ title: "Payment failed", description: err.message, variant: "destructive" });
    },
  });

  const methods = data?.methods || [];
  const categories = (["card", "wallet", "bnpl", "bank", "cash"] as const).filter((c) =>
    methods.some((m) => m.category === c),
  );

  return (
    <>
      <Dialog open={open && !stripeOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose a payment method</DialogTitle>
            <DialogDescription>
              Pay SAR {amount.toFixed(2)} — pick how you'd like to pay.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-[#64748B]">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading methods…
            </div>
          ) : methods.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#64748B]">
              No online payment methods are configured yet. Please pay at the counter.
            </p>
          ) : (
            <div className="space-y-4">
              {categories.map((cat) => {
                const Meta = CATEGORY_META[cat];
                const Icon = Meta.icon;
                return (
                  <div key={cat}>
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      <Icon className="h-3.5 w-3.5" /> {Meta.title}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {methods.filter((m) => m.category === cat).map((m) => (
                        <Button
                          key={m.id}
                          variant="outline"
                          disabled={initiate.isPending}
                          onClick={() => initiate.mutate(m.id)}
                          className="justify-start h-11"
                          data-testid={`button-paymethod-${m.id}`}
                        >
                          {initiate.isPending && initiate.variables === m.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          {m.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {clientSecret && (
        <PaymentDialog
          open={stripeOpen}
          onOpenChange={(v) => {
            setStripeOpen(v);
            if (!v) onOpenChange(false);
          }}
          invoiceId={invoiceId}
          amount={amount}
          clientSecret={clientSecret}
          onSuccess={() => {
            setStripeOpen(false);
            onOpenChange(false);
            onSuccess();
          }}
        />
      )}
    </>
  );
}
