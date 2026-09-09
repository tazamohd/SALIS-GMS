import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IdCard, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { extractApiMessage } from "@/lib/apiError";
import { AccessShell, accessButtonClass, accessInputClass } from "@/components/access/AccessShell";
import { PORTALS, resolveUserHome } from "@/config/portals";

interface InviteInfo {
  valid: boolean;
  businessName: string;
  roleName: string;
  lockedEmail: string | null;
}

/**
 * Redeeming a staff invite, in two beats: check the code, then fill in the
 * details. Checking first means the new employee sees *which* workplace and
 * *which* role they are joining before typing anything — and a wrong code costs
 * one field, not a whole form.
 */
export default function StaffJoin() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const portal = PORTALS.staff;

  const initialCode = (new URLSearchParams(window.location.search).get("code") ?? "").toUpperCase();
  const [code, setCode] = useState(initialCode);
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const check = useMutation({
    mutationFn: async (): Promise<InviteInfo> => {
      const res = await fetch(`/api/staff/public/invite/${encodeURIComponent(code.trim().toUpperCase())}`, {
        credentials: "include",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message ?? "This invite code is not valid");
      return body;
    },
    onSuccess: (info) => {
      setInvite(info);
      if (info.lockedEmail) set("email", info.lockedEmail);
    },
    onError: (error: Error) => {
      toast({
        title: t("staffJoin.invalidCode", "Invite not found"),
        description: extractApiMessage(error),
        variant: "destructive",
      });
    },
  });

  const join = useMutation({
    mutationFn: async () =>
      (await apiRequest("POST", "/api/staff/public/join", { code: code.trim().toUpperCase(), ...form })).json(),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      window.location.href = resolveUserHome(user);
    },
    onError: (error: Error) => {
      toast({
        title: t("staffJoin.couldNotJoin", "Could not complete sign-up"),
        description: extractApiMessage(error),
        variant: "destructive",
      });
    },
  });

  return (
    <AccessShell
      accent={portal.accent}
      icon={<IdCard className="h-6 w-6" />}
      title={t("staffJoin.title", "Join your workplace")}
      description={t("staffJoin.subtitle", "Enter the invite code your manager sent you.")}
    >
      {!invite ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) check.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="code" className="font-poppins text-[#0B1F3B] dark:text-[#E6EAF0] font-medium">
              {t("staffJoin.inviteCode", "Invite code")}
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABCD2345"
              autoComplete="one-time-code"
              data-testid="input-invite-code"
              className={`${accessInputClass} text-center text-lg tracking-[0.3em] font-semibold`}
            />
          </div>
          <Button
            type="submit"
            disabled={!code.trim() || check.isPending}
            data-testid="button-check-code"
            className={accessButtonClass(portal.accent)}
          >
            {check.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("staffJoin.checking", "Checking…")}
              </span>
            ) : (
              t("staffJoin.continue", "Continue")
            )}
          </Button>

          <p className="text-center text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0] pt-2">
            {t("portals.noInvite", "No invite code?")}{" "}
            <Link href="/staff/apply" className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline font-semibold" data-testid="link-staff-apply">
              {t("portals.applyToWorkplace", "Apply to your workplace")}
            </Link>
          </p>
          <p className="text-center text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0]">
            {t("auth.alreadyHaveAccount", "Already have an account?")}{" "}
            <Link href={portal.loginPath} className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline font-semibold" data-testid="link-login">
              {t("auth.signIn", "Sign in")}
            </Link>
          </p>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            join.mutate();
          }}
          className="space-y-4"
        >
          <div
            className="flex items-start gap-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 p-4"
            data-testid="invite-summary"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="text-sm font-poppins">
              <p className="font-semibold text-[#0B1F3B] dark:text-white">{invite.businessName}</p>
              <p className="text-[#64748B] dark:text-[#9BA4B0]">
                {t("staffJoin.joiningAs", "Joining as")} {invite.roleName}
              </p>
            </div>
          </div>

          <SimpleField label={`${t("auth.fullName", "Full name")} *`}>
            <Input required autoComplete="name" className={accessInputClass} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} data-testid="input-fullname" />
          </SimpleField>
          <SimpleField label={`${t("common.email", "Email")} *`} hint={invite.lockedEmail ? t("staffJoin.emailLocked", "This invite is issued to this address.") : undefined}>
            <Input
              required
              type="email"
              autoComplete="email"
              readOnly={Boolean(invite.lockedEmail)}
              className={`${accessInputClass} ${invite.lockedEmail ? "opacity-70" : ""}`}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              data-testid="input-email"
            />
          </SimpleField>
          <SimpleField label={t("common.phone", "Phone")}>
            <Input type="tel" autoComplete="tel" className={accessInputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} data-testid="input-phone" />
          </SimpleField>
          <SimpleField label={`${t("common.password", "Password")} *`} hint={t("providerSignup.passwordHint", "min 8 characters")}>
            <Input required type="password" autoComplete="new-password" className={accessInputClass} value={form.password} onChange={(e) => set("password", e.target.value)} data-testid="input-password" />
          </SimpleField>

          <Button
            type="submit"
            disabled={!form.fullName || !form.email || form.password.length < 8 || join.isPending}
            data-testid="button-join"
            className={accessButtonClass(portal.accent)}
          >
            {join.isPending ? t("staffJoin.creating", "Creating your account…") : t("staffJoin.join", "Join the team")}
          </Button>

          <button
            type="button"
            onClick={() => setInvite(null)}
            className="w-full text-center text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0] hover:text-[#0A5ED7] dark:hover:text-[#0BB3FF]"
            data-testid="button-change-code"
          >
            {t("staffJoin.useDifferentCode", "Use a different code")}
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
