import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Car, Wrench, Package, ShieldCheck, IdCard, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AccessShell, accessButtonClass, accessInputClass } from "@/components/access/AccessShell";
import { getPortal, resolveUserHome, type PortalId } from "@/config/portals";

const ICONS = { Car, Wrench, Package, ShieldCheck, IdCard } as const;

interface PortalLoginProps {
  /** Fixed portal for /customer/login and /staff/login. */
  portalId?: PortalId;
  /** When true (business login), the portal comes from ?type=. */
  fromQuery?: boolean;
}

/**
 * One sign-in page, rendered per portal. The credentials check is identical for
 * every audience — what differs is the branding, the registration link it
 * offers, and which demo accounts it lists. After a successful sign-in the user
 * always lands on the home their own role resolves to, never on the portal they
 * happened to click, so a customer who signs in on the garage page still gets
 * the customer workspace.
 */
export default function PortalLogin({ portalId, fromQuery }: PortalLoginProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const queryType = fromQuery
    ? new URLSearchParams(window.location.search).get("type")
    : null;
  const portal = getPortal(portalId ?? queryType ?? "customer");
  const Icon = ICONS[portal.icon];

  const login = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/login", { email, password });
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      window.location.href = resolveUserHome(user);
    },
    onError: (error: Error) => {
      toast({
        title: t("auth.loginFailed", "Login Failed"),
        description: error.message || t("auth.invalidCredentials", "Invalid email or password"),
        variant: "destructive",
      });
    },
  });

  return (
    <AccessShell
      accent={portal.accent}
      icon={<Icon className="h-6 w-6" />}
      title={t(portal.titleKey, portal.title)}
      description={t("auth.enterCredentials", "Enter your credentials to access your account")}
      footer={<DemoQuickPick portalId={portal.id} onFill={(e, p) => { setEmail(e); setPassword(p); }} />}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!email || !password) {
            toast({
              title: t("common.error", "Error"),
              description: t("auth.fillAllFields", "Please fill in all fields"),
              variant: "destructive",
            });
            return;
          }
          login.mutate();
        }}
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="email" className="font-poppins text-[#0B1F3B] dark:text-[#E6EAF0] font-medium">
            {t("auth.email", "Email")}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B] dark:text-[#9BA4B0]" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t("auth.emailPlaceholder", "your@email.com")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-email"
              className={`ps-10 ${accessInputClass}`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="font-poppins text-[#0B1F3B] dark:text-[#E6EAF0] font-medium">
            {t("auth.password", "Password")}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B] dark:text-[#9BA4B0]" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="input-password"
              className={`ps-10 pe-10 ${accessInputClass}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t("auth.hidePassword", "Hide password") : t("auth.showPassword", "Show password")}
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#9BA4B0] hover:text-[#0A5ED7] dark:hover:text-[#0BB3FF] transition-colors"
              data-testid="toggle-password-visibility"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={login.isPending}
          data-testid="login-submit"
          className={accessButtonClass(portal.accent)}
        >
          {login.isPending ? t("auth.signingIn", "Signing in...") : t("auth.signIn", "Sign In")}
        </Button>

        <p className="text-center text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0] pt-2">
          {t("auth.dontHaveAccount", "Don't have an account?")}{" "}
          <Link
            href={portal.registerPath}
            className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline font-semibold"
            data-testid="link-register"
          >
            {portal.id === "staff"
              ? t("portals.joinWithInvite", "Join with an invite code")
              : t("auth.register", "Register")}
          </Link>
        </p>

        {portal.id === "staff" && (
          <p className="text-center text-xs font-poppins text-[#64748B] dark:text-[#9BA4B0]">
            {t("portals.noInvite", "No invite code?")}{" "}
            <Link href="/staff/apply" className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline" data-testid="link-staff-apply">
              {t("portals.applyToWorkplace", "Apply to your workplace")}
            </Link>
          </p>
        )}
      </form>
    </AccessShell>
  );
}

type DemoAccount = {
  roleKey: string;
  roleName: string;
  email: string;
  label?: string;
  description?: string;
  portals?: string[];
};

type DemoAccountsResponse = {
  enabled: boolean;
  password?: string;
  accounts?: DemoAccount[];
};

/**
 * Demo quick access, filtered to the accounts that belong to this portal.
 * Renders nothing unless the server has demo mode on, so production login pages
 * are unaffected.
 */
function DemoQuickPick({
  portalId,
  onFill,
}: {
  portalId: PortalId;
  onFill: (email: string, password: string) => void;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data } = useQuery<DemoAccountsResponse>({
    queryKey: ["/api/demo/accounts"],
    queryFn: async () => {
      const res = await fetch("/api/demo/accounts", { credentials: "include" });
      if (!res.ok) return { enabled: false, accounts: [] };
      return res.json();
    },
    retry: false,
  });

  const demoLogin = useMutation({
    mutationFn: async (roleKey: string) => (await apiRequest("POST", "/api/demo/login", { roleKey })).json(),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      window.location.href = resolveUserHome(user);
    },
    onError: (error: Error) => {
      toast({
        title: t("auth.loginFailed", "Login Failed"),
        description: error.message || t("auth.demoUnavailable", "Demo login is unavailable"),
        variant: "destructive",
      });
    },
  });

  // A demo account with no `portals` list predates this filter — show it on the
  // staff portal, which is where the original quick-pick lived.
  const accounts = (data?.accounts ?? []).filter((a) =>
    a.portals?.length ? a.portals.includes(portalId) : portalId === "staff",
  );

  if (!data?.enabled || accounts.length === 0) return null;

  return (
    <div className="mt-6 p-4 bg-white/60 dark:bg-[#151A23]/60 backdrop-blur-sm rounded-xl border border-[#E2E8F0] dark:border-[#232A36]">
      <p className="text-xs font-poppins text-[#64748B] dark:text-[#9BA4B0] text-center mb-3 uppercase tracking-wider">
        {t("auth.demoQuickAccess", "Demo quick access")}
      </p>
      <div
        role="group"
        aria-label={t("auth.demoAccounts", "Demo accounts")}
        className={accounts.length > 4 ? "grid grid-cols-3 gap-1.5" : "grid grid-cols-2 gap-1.5"}
      >
        {accounts.map((acc) => {
          const isActive = demoLogin.isPending && demoLogin.variables === acc.roleKey;
          const label = acc.label ?? acc.roleName;
          return (
            <Button
              key={acc.roleKey}
              type="button"
              variant="outline"
              disabled={demoLogin.isPending}
              aria-busy={isActive}
              aria-label={t("auth.demoLoginAs", "Sign in as {{role}} ({{email}})", { role: label, email: acc.email })}
              onClick={() => {
                onFill(acc.email, data?.password ?? "");
                demoLogin.mutate(acc.roleKey);
              }}
              data-testid={`demo-login-${acc.roleKey.toLowerCase()}`}
              className="h-auto min-h-[2.75rem] w-full min-w-0 flex flex-col items-center justify-center gap-0 whitespace-normal break-words py-1.5 px-1.5 text-center font-poppins border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-[#E6EAF0] hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] hover:text-[#0A5ED7] dark:hover:text-[#0BB3FF] disabled:opacity-60"
              title={acc.description ? `${acc.email} — ${acc.description}` : acc.email}
            >
              <span className="text-[11px] font-semibold leading-tight">
                {isActive ? t("auth.signingIn", "Signing in...") : label}
              </span>
            </Button>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] font-poppins text-[#94A3B8] dark:text-[#6B7280] text-center">
        {t("auth.demoOneClickNote", "Demo only · click a role to fill its credentials and sign in")}
      </p>
    </div>
  );
}
