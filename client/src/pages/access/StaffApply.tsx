import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { IdCard, Building2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { extractApiMessage } from "@/lib/apiError";
import { AccessShell, accessButtonClass, accessInputClass } from "@/components/access/AccessShell";
import { PORTALS } from "@/config/portals";

/** Roles an applicant can say they do. The employer still decides what is granted. */
const REQUESTABLE_ROLES = [
  { key: "TECHNICIAN", label: "Technician" },
  { key: "LEAD_TECHNICIAN", label: "Lead technician" },
  { key: "SERVICE_ADVISOR", label: "Service advisor" },
  { key: "RECEPTIONIST", label: "Receptionist" },
  { key: "CSR", label: "Customer service" },
  { key: "PARTS_MANAGER", label: "Parts" },
  { key: "ACCOUNTANT", label: "Accountant" },
  { key: "SERVICE_MANAGER", label: "Manager" },
];

/**
 * Applying to a workplace with its public code.
 *
 * This path grants nothing: it files a request the business owner reviews, and
 * the role the applicant selects is a hint the approver can override. That is
 * the whole reason it can be open to anyone who knows the workplace code.
 */
export default function StaffApply() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const portal = PORTALS.staff;

  const [joinCode, setJoinCode] = useState(
    (new URLSearchParams(window.location.search).get("code") ?? "").toUpperCase(),
  );
  const [workplace, setWorkplace] = useState<{ businessName: string; city?: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    requestedRoleKey: "TECHNICIAN",
    message: "",
    password: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const lookup = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/staff/public/workplace/${encodeURIComponent(joinCode.trim().toUpperCase())}`, {
        credentials: "include",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message ?? "No workplace found for that code");
      return body;
    },
    onSuccess: (data) => setWorkplace({ businessName: data.businessName, city: data.city }),
    onError: (error: Error) => {
      toast({
        title: t("staffApply.notFound", "Workplace not found"),
        description: extractApiMessage(error),
        variant: "destructive",
      });
    },
  });

  const apply = useMutation({
    mutationFn: async () =>
      (await apiRequest("POST", "/api/staff/public/apply", {
        ...form,
        joinCode: joinCode.trim().toUpperCase(),
      })).json(),
    onSuccess: () => setSubmitted(true),
    onError: (error: Error) => {
      toast({
        title: t("staffApply.couldNotSubmit", "Could not send your request"),
        description: extractApiMessage(error),
        variant: "destructive",
      });
    },
  });

  if (submitted) {
    return (
      <AccessShell
        accent={portal.accent}
        icon={<Clock className="h-6 w-6" />}
        title={t("staffApply.sentTitle", "Request sent")}
        description={t(
          "staffApply.sentDesc",
          "Your workplace has to approve you before you can sign in. You'll be able to use the email and password you just chose as soon as they do.",
        )}
      >
        <div className="text-center pt-2">
          <Link href={portal.loginPath} className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline font-semibold" data-testid="link-login">
            {t("providerSignup.backToSignIn", "Back to sign in")}
          </Link>
        </div>
      </AccessShell>
    );
  }

  return (
    <AccessShell
      accent={portal.accent}
      icon={<IdCard className="h-6 w-6" />}
      title={t("staffApply.title", "Apply to your workplace")}
      description={t("staffApply.subtitle", "Ask your employer for their workplace code — they approve the request.")}
    >
      {!workplace ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (joinCode.trim()) lookup.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="joinCode" className="font-poppins text-[#0B1F3B] dark:text-[#E6EAF0] font-medium">
              {t("staffApply.workplaceCode", "Workplace code")}
            </Label>
            <Input
              id="joinCode"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="AB23CD"
              data-testid="input-join-code"
              className={`${accessInputClass} text-center text-lg tracking-[0.3em] font-semibold`}
            />
          </div>
          <Button
            type="submit"
            disabled={!joinCode.trim() || lookup.isPending}
            data-testid="button-find-workplace"
            className={accessButtonClass(portal.accent)}
          >
            {lookup.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("staffApply.searching", "Looking up…")}
              </span>
            ) : (
              t("staffJoin.continue", "Continue")
            )}
          </Button>
          <p className="text-center text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0] pt-2">
            {t("staffApply.haveInvite", "Have an invite code instead?")}{" "}
            <Link href="/staff/join" className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline font-semibold" data-testid="link-staff-join">
              {t("portals.joinWithInvite", "Join with an invite code")}
            </Link>
          </p>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            apply.mutate();
          }}
          className="space-y-4"
        >
          <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] dark:border-[#232A36] p-4" data-testid="workplace-summary">
            <Building2 className="h-5 w-5 shrink-0 text-[#0A5ED7] dark:text-[#0BB3FF]" />
            <div className="text-sm font-poppins">
              <p className="font-semibold text-[#0B1F3B] dark:text-white">{workplace.businessName}</p>
              {workplace.city && <p className="text-[#64748B] dark:text-[#9BA4B0]">{workplace.city}</p>}
            </div>
          </div>

          <SimpleField label={`${t("auth.fullName", "Full name")} *`}>
            <Input required autoComplete="name" className={accessInputClass} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} data-testid="input-fullname" />
          </SimpleField>
          <SimpleField label={`${t("common.email", "Email")} *`}>
            <Input required type="email" autoComplete="email" className={accessInputClass} value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="input-email" />
          </SimpleField>
          <SimpleField label={t("common.phone", "Phone")}>
            <Input type="tel" autoComplete="tel" className={accessInputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} data-testid="input-phone" />
          </SimpleField>
          <SimpleField label={t("staffApply.yourJob", "What do you do?")} hint={t("staffApply.roleHint", "Your employer confirms the final role.")}>
            <select
              value={form.requestedRoleKey}
              onChange={(e) => set("requestedRoleKey", e.target.value)}
              data-testid="select-requested-role"
              className={`w-full rounded-md px-3 ${accessInputClass}`}
            >
              {REQUESTABLE_ROLES.map((role) => (
                <option key={role.key} value={role.key}>
                  {t(`roles.${role.key}`, role.label)}
                </option>
              ))}
            </select>
          </SimpleField>
          <SimpleField label={t("staffApply.message", "Anything to add?")}>
            <Textarea
              rows={3}
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder={t("staffApply.messagePlaceholder", "e.g. I start on the 1st, employee no. 214")}
              data-testid="input-message"
              className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-[#E6EAF0]"
            />
          </SimpleField>
          <SimpleField label={`${t("common.password", "Password")} *`} hint={t("staffApply.passwordHint", "Choose it now — it works the moment you're approved.")}>
            <Input required type="password" autoComplete="new-password" className={accessInputClass} value={form.password} onChange={(e) => set("password", e.target.value)} data-testid="input-password" />
          </SimpleField>

          <Button
            type="submit"
            disabled={!form.fullName || !form.email || form.password.length < 8 || apply.isPending}
            data-testid="button-apply"
            className={accessButtonClass(portal.accent)}
          >
            {apply.isPending ? t("staffApply.sending", "Sending…") : t("staffApply.send", "Send request")}
          </Button>

          <button
            type="button"
            onClick={() => setWorkplace(null)}
            className="w-full text-center text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0] hover:text-[#0A5ED7] dark:hover:text-[#0BB3FF]"
            data-testid="button-change-code"
          >
            {t("staffApply.useDifferentCode", "Use a different workplace code")}
          </button>
        </form>
      )}
    </AccessShell>
  );
}

function SimpleField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="font-poppins text-[#0B1F3B] dark:text-[#E6EAF0] font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs font-poppins text-[#94A3B8]">{hint}</p>}
    </div>
  );
}
