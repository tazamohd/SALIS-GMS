import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight, Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { extractApiMessage } from "@/lib/apiError";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  BrandingStep,
  DocumentsStep,
  IdentityStep,
  ImportStep,
  IntegrationsStep,
  OperationsStep,
  type BusinessProfile,
} from "./onboarding/steps";

const STEPS = [
  { id: "identity", title: "Business details", blurb: "Name, contact and official registration" },
  { id: "branding", title: "Branding", blurb: "Logo and colours used across the app and your documents" },
  { id: "documents", title: "Invoices & printing", blurb: "Layout, numbering and the footer on every document" },
  { id: "operations", title: "Operations", blurb: "Hours and how you describe yourself to customers" },
  { id: "integrations", title: "Integrations", blurb: "Payments, messaging and accounting connections" },
  { id: "import", title: "Import your data", blurb: "Bring customers, vehicles and parts across from your old system" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

/**
 * Guided business setup.
 *
 * A newly-approved business lands here with the identifiers it already gave at
 * signup pre-filled, and walks through the handful of decisions that make the
 * platform print and look like their business. Every step saves on its own —
 * the wizard can be abandoned and resumed, and no step is mandatory, so a
 * business in a hurry can reach its dashboard in one click.
 */
export default function BusinessOnboarding() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);

  const { data: profile, isLoading } = useQuery<BusinessProfile>({
    queryKey: ["/api/business/profile"],
    queryFn: async () => {
      const res = await fetch("/api/business/profile", { credentials: "include" });
      if (!res.ok) throw new Error("Could not load your business profile");
      return res.json();
    },
    retry: false,
  });

  // Resume where the business left off.
  useEffect(() => {
    if (!profile?.onboardingStep) return;
    const resumeAt = STEPS.findIndex((s) => s.id === profile.onboardingStep);
    if (resumeAt > 0) setIndex(resumeAt);
  }, [profile?.onboardingStep]);

  const save = useMutation({
    mutationFn: async (patch: Partial<BusinessProfile>) =>
      (await apiRequest("PATCH", "/api/business/profile", patch)).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business/profile"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("onboarding.saveFailed", "Could not save"),
        description: extractApiMessage(error),
        variant: "destructive",
      });
    },
  });

  const finish = useMutation({
    mutationFn: async () => (await apiRequest("POST", "/api/business/onboarding/complete")).json(),
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: t("onboarding.finishFailed", "Could not finish setup"),
        description: extractApiMessage(error),
        variant: "destructive",
      });
    },
  });

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(next, 0), STEPS.length - 1);
    setIndex(clamped);
    // Remember the cursor; a failed bookmark must not block navigation.
    apiRequest("POST", "/api/business/onboarding/step", { step: STEPS[clamped].id }).catch(() => {});
  };

  const saveStep = save.mutate;
  const content = useMemo(() => {
    if (!profile) return null;
    const props = { profile, onSave: (patch: Partial<BusinessProfile>) => saveStep(patch), saving: save.isPending };
    switch (step.id as StepId) {
      case "identity":
        return <IdentityStep {...props} />;
      case "branding":
        return <BrandingStep {...props} />;
      case "documents":
        return <DocumentsStep {...props} />;
      case "operations":
        return <OperationsStep {...props} />;
      case "integrations":
        return <IntegrationsStep {...props} />;
      case "import":
        return <ImportStep {...props} />;
    }
  }, [profile, step.id, saveStep, save.isPending]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0E1117]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A5ED7] dark:text-[#0BB3FF]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0E1117] p-6 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-xl font-montserrat font-bold text-[#0B1F3B] dark:text-white">
            {t("onboarding.noBusiness", "No business linked to this account")}
          </h1>
          <p className="font-poppins text-[#64748B] dark:text-[#9BA4B0]">
            {t("onboarding.noBusinessHelp", "Guided setup is for business owners and managers.")}
          </p>
          <a href="/dashboard" className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline font-semibold">
            {t("onboarding.goToDashboard", "Go to the dashboard")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0E1117] py-8 px-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <p className="text-xs font-poppins uppercase tracking-wider text-[#94A3B8]">
            {t("onboarding.eyebrow", "Set up {{business}}", { business: profile.name })}
          </p>
          <h1 className="mt-1 text-2xl md:text-3xl font-montserrat font-bold text-[#0B1F3B] dark:text-white">
            {t(`onboarding.step.${step.id}.title`, step.title)}
          </h1>
          <p className="mt-1 font-poppins text-[#64748B] dark:text-[#9BA4B0]">
            {t(`onboarding.step.${step.id}.blurb`, step.blurb)}
          </p>
        </header>

        {/* Step rail — clickable, because nothing here is mandatory. */}
        <ol className="mb-6 flex flex-wrap gap-2" aria-label={t("onboarding.steps", "Setup steps")}>
          {STEPS.map((s, i) => {
            const state = i === index ? "current" : i < index ? "done" : "todo";
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={state === "current" ? "step" : undefined}
                  data-testid={`onboarding-step-${s.id}`}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-poppins font-medium transition-colors ${
                    state === "current"
                      ? "border-[#0A5ED7] bg-[#0A5ED7] text-white dark:border-[#0BB3FF] dark:bg-[#0BB3FF] dark:text-[#0E1117]"
                      : state === "done"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "border-[#E2E8F0] dark:border-[#232A36] text-[#64748B] dark:text-[#9BA4B0]"
                  }`}
                >
                  {state === "done" && <Check className="h-3 w-3" />}
                  {t(`onboarding.step.${s.id}.title`, s.title)}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23] p-6 shadow-lg">
          {content}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
            data-testid="button-back"
            className="border-[#E2E8F0] dark:border-[#232A36]"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {t("common.back", "Back")}
          </Button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => finish.mutate()}
              className="text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0] hover:text-[#0A5ED7] dark:hover:text-[#0BB3FF]"
              data-testid="button-skip-setup"
            >
              {t("onboarding.finishLater", "I'll finish this later")}
            </button>

            {isLast ? (
              <Button
                type="button"
                onClick={() => finish.mutate()}
                disabled={finish.isPending}
                data-testid="button-finish"
                className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white font-semibold"
              >
                <Rocket className="h-4 w-4" />
                {finish.isPending ? t("onboarding.finishing", "Finishing…") : t("onboarding.finish", "Start using SALIS")}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => goTo(index + 1)}
                data-testid="button-next"
                className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white font-semibold"
              >
                {t("common.next", "Next")}
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
