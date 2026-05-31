import { type ReactNode } from "react";
import { Link } from "wouter";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlan } from "@/hooks/usePlan";
import type { PlanId } from "@shared/plans";

interface PlanGateProps {
  /** Minimum plan required to render `children`. */
  minPlan: PlanId;
  children: ReactNode;
  /** Custom denied UI (overrides the default upgrade panel). */
  fallback?: ReactNode;
  /** Short module name used in the default upgrade card. */
  moduleName?: string;
}

const PLAN_BADGE: Record<PlanId, string> = {
  STARTER: "bg-slate-500/15 text-slate-500",
  PRO: "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white",
  ENTERPRISE: "bg-gradient-to-r from-[#7C5CFF] to-[#F97316] text-white",
};

/**
 * PlanGate — declarative wrapper that renders `children` only when the
 * current garage's plan meets `minPlan`. Otherwise shows a friendly
 * upgrade panel with a CTA to the subscriptions page.
 */
export function PlanGate({ minPlan, children, fallback, moduleName }: PlanGateProps) {
  const { hasPlan, plan, isLoading } = usePlan();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A5ED7]" />
      </div>
    );
  }

  if (hasPlan(minPlan)) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="max-w-lg w-full border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0A5ED7] to-[#7C5CFF] grid place-items-center text-white shadow-lg shadow-[#0A5ED7]/30">
              <Lock className="w-6 h-6" />
            </div>
            <Badge className={PLAN_BADGE[minPlan]}>
              <Sparkles className="w-3 h-3 mr-1" />
              {minPlan}
            </Badge>
          </div>
          <CardTitle className="text-[#0B1F3B] dark:text-white">
            {moduleName ? `${moduleName} is part of ${minPlan}` : `Available on ${minPlan} and above`}
          </CardTitle>
          <CardDescription className="text-[#64748B]">
            You're currently on the <strong>{plan}</strong> plan. Upgrade to {minPlan} to unlock this module
            (along with the rest of the {minPlan === "PRO" ? "Pro" : "Enterprise"} feature set).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/subscriptions">
            <Button
              data-testid="plan-gate-upgrade"
              className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
            >
              Compare plans & upgrade
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <p className="text-xs text-[#64748B] text-center">
            Platform admins can override individual garages from the Billing tab.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/** Tiny pill rendered next to nav items / buttons that are above the user's plan. */
export function PlanRequiredBadge({ plan }: { plan: PlanId }) {
  return (
    <Badge variant="outline" className={`text-[10px] py-0 px-1.5 ${PLAN_BADGE[plan]}`}>
      {plan}
    </Badge>
  );
}
