import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Sparkles,
  Crown,
  Zap,
  CreditCard,
  XCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePlan, usePlanCatalog } from "@/hooks/usePlan";
import type { PlanDefinition, PlanId } from "@shared/plans";

const PLAN_ICON: Record<PlanId, React.ComponentType<{ className?: string }>> = {
  STARTER: ShieldCheck,
  PRO: Zap,
  ENTERPRISE: Crown,
};

const PLAN_GRADIENT: Record<PlanId, string> = {
  STARTER: "from-slate-500 to-slate-700",
  PRO: "from-[#0A5ED7] to-[#0BB3FF]",
  ENTERPRISE: "from-[#7C5CFF] to-[#F97316]",
};

function formatLimit(v: number | "unlimited") {
  return v === "unlimited" ? "Unlimited" : v.toLocaleString();
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function Subscriptions() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { subscription, plan: currentPlan, status, isLoading } = usePlan();
  const { data: catalog, isLoading: catalogLoading } = usePlanCatalog();
  const [pending, setPending] = useState<PlanId | null>(null);

  const changeMutation = useMutation({
    mutationFn: async (plan: PlanId) => {
      const res = await apiRequest("POST", "/api/subscriptions/change-plan", { plan });
      return res.json();
    },
    onMutate: (plan: PlanId) => setPending(plan),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["/api/subscriptions/current"] });
      qc.invalidateQueries({ queryKey: ["/api/feature-flags"] });
      toast({
        title: "Plan updated",
        description: data?.note ?? "Your subscription has been changed.",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to change plan", description: err.message, variant: "destructive" });
    },
    onSettled: () => setPending(null),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscriptions/cancel", {});
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/subscriptions/current"] });
      toast({ title: "Cancellation scheduled", description: "Plan will revert to Starter at period end." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to cancel", description: err.message, variant: "destructive" });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscriptions/resume", {});
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/subscriptions/current"] });
      toast({ title: "Subscription resumed" });
    },
  });

  const plans = catalog?.plans ?? [];

  return (
    <div className="min-h-screen p-6 bg-[#F8FAFC] dark:bg-[#0E1117]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white" data-testid="page-title">
              Subscription &amp; Billing
            </h1>
            <p className="text-[#64748B] mt-1">
              Manage your garage's plan, unlock modules, and review billing.
            </p>
          </div>
        </div>

        {/* Current plan summary */}
        <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23] overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${PLAN_GRADIENT[currentPlan]}`} />
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${PLAN_GRADIENT[currentPlan]} grid place-items-center text-white shadow-lg`}
                >
                  {(() => {
                    const Icon = PLAN_ICON[currentPlan];
                    return <Icon className="w-6 h-6" />;
                  })()}
                </div>
                <div>
                  <CardTitle className="text-[#0B1F3B] dark:text-white" data-testid="current-plan">
                    {isLoading ? "Loading..." : `Current plan: ${currentPlan}`}
                  </CardTitle>
                  <CardDescription className="text-[#64748B]">
                    Status: <span data-testid="current-status">{status}</span>
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                {subscription?.cancelAt ? (
                  <Button
                    variant="outline"
                    className="border-[#E2E8F0] dark:border-[#232A36]"
                    onClick={() => resumeMutation.mutate()}
                    disabled={resumeMutation.isPending}
                    data-testid="button-resume"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                ) : currentPlan !== "STARTER" ? (
                  <Button
                    variant="outline"
                    className="border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]"
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                    data-testid="button-cancel"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel at period end
                  </Button>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryStat label="Current period start" value={formatDate(subscription?.currentPeriodStart ?? null)} />
              <SummaryStat label="Renews on" value={formatDate(subscription?.currentPeriodEnd ?? null)} />
              <SummaryStat label="Cancel scheduled" value={formatDate(subscription?.cancelAt ?? null)} />
              <SummaryStat
                label="Stripe"
                value={subscription?.stripeSubscriptionId ? "Connected" : "Dev mode"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Plan comparison */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-[#0B1F3B] dark:text-white">Choose your plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {catalogLoading ? (
              <p className="text-[#64748B] col-span-3">Loading plans…</p>
            ) : (
              plans.map((p) => (
                <PlanCard
                  key={p.id}
                  plan={p}
                  isCurrent={p.id === currentPlan}
                  onSelect={() => changeMutation.mutate(p.id)}
                  pending={pending === p.id || changeMutation.isPending}
                />
              ))
            )}
          </div>
        </div>

        {/* Footnote */}
        <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-sm text-[#64748B]">
              <CreditCard className="w-4 h-4 mt-0.5 text-[#0A5ED7] flex-shrink-0" />
              <p>
                Plan changes apply immediately in this environment. In production a Stripe Checkout
                redirect will collect payment before the upgrade lands. Existing data is preserved
                when downgrading; locked modules surface upgrade prompts instead.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]">
      <div className="text-xs text-[#64748B] uppercase tracking-wide font-semibold mb-1">{label}</div>
      <div className="text-sm font-medium text-[#0B1F3B] dark:text-white">{value}</div>
    </div>
  );
}

function PlanCard({
  plan,
  isCurrent,
  onSelect,
  pending,
}: {
  plan: PlanDefinition;
  isCurrent: boolean;
  onSelect: () => void;
  pending: boolean;
}) {
  const Icon = PLAN_ICON[plan.id];

  return (
    <Card
      className={`relative border bg-white dark:bg-[#151A23] transition-all ${
        isCurrent
          ? "border-[#0A5ED7] shadow-lg shadow-[#0A5ED7]/10 scale-[1.02]"
          : "border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0BB3FF]"
      }`}
      data-testid={`plan-card-${plan.id}`}
    >
      {plan.badge && (
        <div
          className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${PLAN_GRADIENT[plan.id]} text-white shadow`}
        >
          {plan.badge}
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${PLAN_GRADIENT[plan.id]} grid place-items-center text-white`}
          >
            <Icon className="w-5 h-5" />
          </div>
          {isCurrent && (
            <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7]">Current</Badge>
          )}
        </div>
        <CardTitle className="mt-3 text-[#0B1F3B] dark:text-white">{plan.name}</CardTitle>
        <CardDescription className="text-[#64748B]">{plan.tagline}</CardDescription>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#0B1F3B] dark:text-white">
            {plan.priceMonthly === 0 ? "Free" : `$${plan.priceMonthly}`}
          </span>
          {plan.priceMonthly > 0 && (
            <span className="text-sm text-[#64748B]">/ month / garage</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Limit label="Users" value={formatLimit(plan.limits.users)} />
          <Limit label="Branches" value={formatLimit(plan.limits.branches)} />
          <Limit label="Jobs / mo" value={formatLimit(plan.limits.jobsPerMonth)} />
          <Limit label="Storage" value={plan.limits.storageGb === "unlimited" ? "Unlimited" : `${plan.limits.storageGb} GB`} />
        </div>
        <Separator className="bg-[#E2E8F0] dark:bg-[#232A36]" />
        <ul className="space-y-2 text-sm">
          {plan.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-[#475569] dark:text-[#cbd5e1]">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#10B981] flex-shrink-0" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
        <Button
          className={`w-full ${
            isCurrent
              ? "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
              : `bg-gradient-to-r ${PLAN_GRADIENT[plan.id]} text-white hover:opacity-90`
          }`}
          disabled={isCurrent || pending}
          onClick={onSelect}
          data-testid={`select-plan-${plan.id}`}
        >
          {isCurrent ? (
            <>Current plan</>
          ) : pending ? (
            <>Switching…</>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Switch to {plan.name}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function Limit({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36] px-2 py-1.5">
      <div className="text-[10px] text-[#64748B] uppercase tracking-wide">{label}</div>
      <div className="text-sm font-semibold text-[#0B1F3B] dark:text-white">{value}</div>
    </div>
  );
}
