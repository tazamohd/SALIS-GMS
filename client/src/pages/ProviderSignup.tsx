import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CheckCircle2, Clock, Building2 } from "lucide-react";

type ProviderType = "garage" | "parts_store" | "insurance";

interface SubmitResult {
  status: "approved" | "pending";
  autoApproved?: boolean;
  garageId?: string;
  verification?: { status: string };
}

const PROVIDER_LABELS: Record<ProviderType, string> = {
  garage: "Auto Repair Garage",
  parts_store: "Spare Parts Store",
  insurance: "Insurance Company",
};

export default function ProviderSignup() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    providerType: "garage" as ProviderType,
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
  const [result, setResult] = useState<SubmitResult | null>(null);

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const submit = useMutation({
    mutationFn: async (): Promise<SubmitResult> => {
      const res = await apiRequest("POST", "/api/garage-applications", form);
      return await res.json();
    },
    onSuccess: (data) => setResult(data),
    onError: (error: Error) => {
      // apiRequest throws "<status>: <json>"; surface the server message.
      let msg = error.message;
      const m = error.message.match(/\{.*\}/);
      if (m) {
        try { msg = JSON.parse(m[0]).message || msg; } catch { /* keep raw */ }
      }
      toast({ title: "Could not submit", description: msg, variant: "destructive" });
    },
  });

  const canSubmit =
    form.businessName && form.ownerName && form.email && form.password.length >= 8 &&
    form.taxNumber && form.commercialRegistration;

  const inputCls =
    "h-11 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-[#E6EAF0]";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-10">
      <div className="fixed inset-0 -z-10 bg-[#F8FAFC] dark:bg-[#0E1117]" />
      <div className="fixed top-4 right-4 z-50"><ThemeToggle /></div>

      <div className="w-full max-w-2xl p-4">
        <Card className="bg-white/90 dark:bg-[#151A23]/95 border border-[#E2E8F0] dark:border-[#232A36] shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="h-7 w-7 text-[#0A5ED7] dark:text-[#0BB3FF]" />
              <div>
                <CardTitle className="text-2xl font-bold text-[#0B1F3B] dark:text-white">Join the platform</CardTitle>
                <CardDescription className="text-[#64748B] dark:text-[#9BA4B0]">
                  Register your business. We verify your official tax &amp; commercial registration and activate you automatically.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {result ? (
              <div className="text-center py-8 space-y-4" data-testid="signup-result">
                {result.status === "approved" ? (
                  <>
                    <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
                    <h3 className="text-xl font-semibold text-[#0B1F3B] dark:text-white">Verified &amp; activated!</h3>
                    <p className="text-[#64748B] dark:text-[#9BA4B0]">
                      Your identifiers were verified automatically. You can sign in now with your email and password.
                    </p>
                    <Link href="/login" className="inline-block">
                      <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">Go to sign in</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Clock className="h-14 w-14 text-amber-500 mx-auto" />
                    <h3 className="text-xl font-semibold text-[#0B1F3B] dark:text-white">Submitted for review</h3>
                    <p className="text-[#64748B] dark:text-[#9BA4B0]">
                      Your details are well-formed but need a quick manual check. We'll activate your account shortly.
                    </p>
                    <Link href="/login" className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline">Back to sign in</Link>
                  </>
                )}
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); submit.mutate(); }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[#0B1F3B] dark:text-[#E6EAF0]">Business type *</Label>
                  <select
                    value={form.providerType}
                    onChange={(e) => set("providerType", e.target.value as ProviderType)}
                    data-testid="select-provider-type"
                    className={`w-full rounded-md px-3 ${inputCls}`}
                  >
                    {(Object.keys(PROVIDER_LABELS) as ProviderType[]).map((k) => (
                      <option key={k} value={k}>{PROVIDER_LABELS[k]}</option>
                    ))}
                  </select>
                </div>

                <Field label="Business name *"><Input className={inputCls} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} data-testid="input-business-name" /></Field>
                <Field label="Owner name *"><Input className={inputCls} value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} data-testid="input-owner-name" /></Field>
                <Field label="Email *"><Input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="input-email" /></Field>
                <Field label="Phone"><Input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} data-testid="input-phone" /></Field>
                <Field label="City"><Input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} data-testid="input-city" /></Field>
                <Field label="Country"><Input className={inputCls} value={form.country} onChange={(e) => set("country", e.target.value)} data-testid="input-country" /></Field>

                <Field label="Tax number (VAT) *" hint="15 digits, starts with 3">
                  <Input className={inputCls} value={form.taxNumber} onChange={(e) => set("taxNumber", e.target.value)} data-testid="input-tax-number" />
                </Field>
                <Field label="Commercial registration (Sejel) *" hint="10 digits">
                  <Input className={inputCls} value={form.commercialRegistration} onChange={(e) => set("commercialRegistration", e.target.value)} data-testid="input-cr" />
                </Field>

                <div className="space-y-2">
                  <Label className="text-[#0B1F3B] dark:text-[#E6EAF0]">Plan</Label>
                  <select
                    value={form.requestedPlan}
                    onChange={(e) => set("requestedPlan", e.target.value)}
                    data-testid="select-plan"
                    className={`w-full rounded-md px-3 ${inputCls}`}
                  >
                    <option value="STARTER">Starter</option>
                    <option value="PRO">Pro</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
                <Field label="Password *" hint="min 8 characters">
                  <Input type="password" className={inputCls} value={form.password} onChange={(e) => set("password", e.target.value)} data-testid="input-password" />
                </Field>

                <label className="md:col-span-2 flex items-center gap-2 text-sm text-[#64748B] dark:text-[#9BA4B0]">
                  <input type="checkbox" checked={form.isDemo} onChange={(e) => set("isDemo", e.target.checked)} data-testid="checkbox-demo" />
                  This is a demo account (try the platform with demo identifiers)
                </label>

                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    disabled={!canSubmit || submit.isPending}
                    data-testid="button-submit"
                    className="w-full h-12 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white font-semibold"
                  >
                    {submit.isPending ? "Submitting..." : "Submit application"}
                  </Button>
                  <p className="text-center text-sm text-[#64748B] dark:text-[#9BA4B0] pt-3">
                    Already registered?{" "}
                    <Link href="/login" className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline font-semibold">Sign in</Link>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-[#0B1F3B] dark:text-[#E6EAF0]">{label}</Label>
      {children}
      {hint && <p className="text-xs text-[#94A3B8]">{hint}</p>}
    </div>
  );
}
