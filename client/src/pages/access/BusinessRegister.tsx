import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { Wrench, Package, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { extractApiMessage } from "@/lib/apiError";
import { AccessShell, accessButtonClass, accessInputClass } from "@/components/access/AccessShell";
import { PORTALS, isProviderType, type ProviderType } from "@/config/portals";

const ICONS = { Wrench, Package, ShieldCheck } as const;

/**
 * Fields that differ per provider type. They ride along in the application's
 * `metadata`, so adding a question to one business kind never touches the
 * others — or the shared columns.
 */
interface ExtraField {
  key: string;
  label: string;
  placeholder?: string;
  hint?: string;
  type?: "text" | "number";
}

const EXTRA_FIELDS: Record<ProviderType, ExtraField[]> = {
  garage: [
    { key: "bayCount", label: "Service bays", type: "number", placeholder: "6" },
    { key: "technicianCount", label: "Technicians", type: "number", placeholder: "12" },
    { key: "specialties", label: "Specialities", placeholder: "Engine, A/C, bodywork", hint: "Comma separated" },
    { key: "workingHours", label: "Working hours", placeholder: "Sat–Thu 08:00–20:00" },
  ],
  parts_store: [
    { key: "brands", label: "Brands carried", placeholder: "Toyota, Denso, Bosch", hint: "Comma separated" },
    { key: "warehouseCount", label: "Warehouses", type: "number", placeholder: "2" },
    { key: "deliveryCities", label: "Delivery coverage", placeholder: "Riyadh, Jeddah, Dammam" },
    { key: "minOrderValue", label: "Minimum order (SAR)", type: "number", placeholder: "250" },
  ],
  insurance: [
    { key: "samaLicenseNumber", label: "SAMA licence number", placeholder: "TMN/…", hint: "Insurance regulator licence" },
    { key: "claimsEmail", label: "Claims inbox", placeholder: "claims@example.com" },
    { key: "coverageTypes", label: "Coverage offered", placeholder: "Comprehensive, third-party" },
    { key: "networkSize", label: "Accredited garages", type: "number", placeholder: "40" },
  ],
};

interface SubmitResult {
  status: "approved" | "pending";
  autoApproved?: boolean;
  garageId?: string;
}

/**
 * Business registration for every provider kind. All three share one intake
 * (`POST /api/garage-applications`) because the platform verifies them the same
 * way — official VAT + commercial registration — and provisions the same shape
 * of account. What changes is the wording and the handful of type-specific
 * questions collected into `metadata`.
 */
export default function BusinessRegister() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const initialType = new URLSearchParams(window.location.search).get("type");
  const [providerType, setProviderType] = useState<ProviderType>(
    isProviderType(initialType) ? initialType : "garage",
  );

  const portal = PORTALS[providerType];
  const Icon = ICONS[portal.icon as keyof typeof ICONS] ?? Wrench;

  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    city: "",
    country: "Saudi Arabia",
    requestedPlan: "STARTER",
    taxNumber: "",
    commercialRegistration: "",
    password: "",
    isDemo: false,
  });
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const submit = useMutation({
    mutationFn: async (): Promise<SubmitResult> => {
      const metadata = Object.fromEntries(
        Object.entries(extra).filter(([, v]) => v.trim() !== ""),
      );
      const res = await apiRequest("POST", "/api/garage-applications", {
        ...form,
        providerType,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      });
      return await res.json();
    },
    onSuccess: setResult,
    onError: (error: Error) => {
      toast({
        title: t("providerSignup.couldNotSubmit", "Could not submit"),
        description: extractApiMessage(error),
        variant: "destructive",
      });
    },
  });

  const canSubmit =
    form.businessName.trim() !== "" &&
    form.ownerName.trim() !== "" &&
    form.email.trim() !== "" &&
    form.password.length >= 8 &&
    form.taxNumber.trim() !== "" &&
    form.commercialRegistration.trim() !== "" &&
    !submit.isPending;

  if (result) {
    return (
      <AccessShell
        accent={portal.accent}
        icon={<Icon className="h-6 w-6" />}
        title={t(portal.titleKey, portal.title)}
        description=""
        width="md"
      >
        <div className="text-center py-6 space-y-4" data-testid="signup-result">
          {result.status === "approved" ? (
            <>
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-semibold text-[#0B1F3B] dark:text-white">
                {t("providerSignup.verifiedActivated", "Verified & activated!")}
              </h3>
              <p className="text-[#64748B] dark:text-[#9BA4B0] font-poppins">
                {t(
                  "providerSignup.verifiedDescNext",
                  "Your identifiers checked out. Sign in and we'll walk you through branding, invoice layout and importing your existing data — it takes a few minutes.",
                )}
              </p>
              <Link href={portal.loginPath}>
                <Button className={accessButtonClass(portal.accent)} data-testid="button-go-signin">
                  {t("providerSignup.goToSignIn", "Go to sign in")}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Clock className="h-14 w-14 text-amber-500 mx-auto" />
              <h3 className="text-xl font-semibold text-[#0B1F3B] dark:text-white">
                {t("providerSignup.submittedForReview", "Submitted for review")}
              </h3>
              <p className="text-[#64748B] dark:text-[#9BA4B0] font-poppins">
                {t(
                  "providerSignup.reviewDesc",
                  "Your details are well-formed but need a quick manual check. We'll activate your account shortly.",
                )}
              </p>
              <Link href={portal.loginPath} className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline">
                {t("providerSignup.backToSignIn", "Back to sign in")}
              </Link>
            </>
          )}
        </div>
      </AccessShell>
    );
  }

  return (
    <AccessShell
      accent={portal.accent}
      icon={<Icon className="h-6 w-6" />}
      width="lg"
      title={t("providerSignup.title", "Register your business")}
      description={t(
        "providerSignup.subtitle",
        "We verify your official tax & commercial registration and activate you automatically.",
      )}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit.mutate();
        }}
        className="space-y-6"
      >
        {/* Business kind — switching it swaps the type-specific questions. */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-poppins font-medium text-[#0B1F3B] dark:text-[#E6EAF0] mb-2">
            {t("providerSignup.businessType", "Business type")}
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {(["garage", "parts_store", "insurance"] as ProviderType[]).map((type) => {
              const TypeIcon = ICONS[PORTALS[type].icon as keyof typeof ICONS];
              const selected = providerType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setProviderType(type)}
                  aria-pressed={selected}
                  data-testid={`select-type-${type}`}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-poppins font-medium transition-all ${
                    selected
                      ? "border-[#0A5ED7] bg-[#0A5ED7]/5 text-[#0A5ED7] dark:border-[#0BB3FF] dark:text-[#0BB3FF]"
                      : "border-[#E2E8F0] dark:border-[#232A36] text-[#64748B] dark:text-[#9BA4B0] hover:border-[#0A5ED7]/50"
                  }`}
                >
                  <TypeIcon className="h-5 w-5" />
                  {t(PORTALS[type].titleKey, PORTALS[type].title)}
                </button>
              );
            })}
          </div>
        </fieldset>

        <Section title={t("providerSignup.sectionBusiness", "Your business")}>
          <Field label={`${t("providerSignup.businessName", "Business name")} *`}>
            <Input className={accessInputClass} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} data-testid="input-business-name" />
          </Field>
          <Field label={`${t("providerSignup.ownerName", "Owner name")} *`}>
            <Input className={accessInputClass} value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} data-testid="input-owner-name" />
          </Field>
          <Field label={`${t("common.email", "Email")} *`}>
            <Input type="email" autoComplete="email" className={accessInputClass} value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="input-email" />
          </Field>
          <Field label={t("common.phone", "Phone")}>
            <Input type="tel" className={accessInputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} data-testid="input-phone" />
          </Field>
          <Field label={t("common.city", "City")}>
            <Input className={accessInputClass} value={form.city} onChange={(e) => set("city", e.target.value)} data-testid="input-city" />
          </Field>
          <Field label={t("common.country", "Country")}>
            <Input className={accessInputClass} value={form.country} onChange={(e) => set("country", e.target.value)} data-testid="input-country" />
          </Field>
        </Section>

        <Section title={t("providerSignup.sectionLegal", "Official registration")}>
          <Field label={`${t("providerSignup.taxNumber", "Tax number (VAT)")} *`} hint={t("providerSignup.taxHint", "15 digits, starts with 3")}>
            <Input inputMode="numeric" className={accessInputClass} value={form.taxNumber} onChange={(e) => set("taxNumber", e.target.value)} data-testid="input-tax-number" />
          </Field>
          <Field label={`${t("providerSignup.commercialRegistration", "Commercial registration (Sejel)")} *`} hint={t("providerSignup.crHint", "10 digits")}>
            <Input inputMode="numeric" className={accessInputClass} value={form.commercialRegistration} onChange={(e) => set("commercialRegistration", e.target.value)} data-testid="input-cr" />
          </Field>
        </Section>

        <Section title={t("providerSignup.sectionDetails", "About your operation")}>
          {EXTRA_FIELDS[providerType].map((field) => (
            <Field key={field.key} label={t(`providerSignup.field.${field.key}`, field.label)} hint={field.hint}>
              <Input
                type={field.type === "number" ? "number" : "text"}
                inputMode={field.type === "number" ? "numeric" : undefined}
                placeholder={field.placeholder}
                className={accessInputClass}
                value={extra[field.key] ?? ""}
                onChange={(e) => setExtra((x) => ({ ...x, [field.key]: e.target.value }))}
                data-testid={`input-${field.key}`}
              />
            </Field>
          ))}
        </Section>

        <Section title={t("providerSignup.sectionAccount", "Your sign-in")}>
          <Field label={t("providerSignup.plan", "Plan")}>
            <select
              value={form.requestedPlan}
              onChange={(e) => set("requestedPlan", e.target.value)}
              data-testid="select-plan"
              className={`w-full rounded-md px-3 ${accessInputClass}`}
            >
              <option value="STARTER">Starter</option>
              <option value="PRO">Pro</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </Field>
          <Field label={`${t("common.password", "Password")} *`} hint={t("providerSignup.passwordHint", "min 8 characters")}>
            <Input type="password" autoComplete="new-password" className={accessInputClass} value={form.password} onChange={(e) => set("password", e.target.value)} data-testid="input-password" />
          </Field>
        </Section>

        <label className="flex items-center gap-2 text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0]">
          <input type="checkbox" checked={form.isDemo} onChange={(e) => set("isDemo", e.target.checked)} data-testid="checkbox-demo" />
          {t("providerSignup.demoAccount", "This is a demo account (try the platform with demo identifiers)")}
        </label>

        <div>
          <Button type="submit" disabled={!canSubmit} data-testid="button-submit" className={accessButtonClass(portal.accent)}>
            {submit.isPending
              ? t("providerSignup.submitting", "Submitting...")
              : t("providerSignup.submitApplication", "Create business account")}
          </Button>
          <p className="text-center text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0] pt-3">
            {t("providerSignup.alreadyRegistered", "Already registered?")}{" "}
            <Link href={portal.loginPath} className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline font-semibold" data-testid="link-login">
              {t("auth.signIn", "Sign in")}
            </Link>
          </p>
        </div>
      </form>
    </AccessShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-poppins font-semibold uppercase tracking-wider text-[#94A3B8]">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="font-poppins text-[#0B1F3B] dark:text-[#E6EAF0] font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs font-poppins text-[#94A3B8]">{hint}</p>}
    </div>
  );
}
