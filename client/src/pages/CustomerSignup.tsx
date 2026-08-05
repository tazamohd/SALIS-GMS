import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Mail, Lock, User, Phone } from "lucide-react";

export default function CustomerSignup() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ email: "", password: "", fullName: "", phone: "" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const register = useMutation({
    mutationFn: async () => (await apiRequest("POST", "/api/customer/register", form)).json(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: t("customerSignup.welcome", "Welcome!"), description: t("customerSignup.accountReady", "Your account is ready.") });
      // With a phone on file, verify it next (OTP); otherwise straight in.
      window.location.href = form.phone ? `/otp?phone=${encodeURIComponent(form.phone)}` : "/";
    },
    onError: (error: Error) => {
      let msg = error.message;
      const m = error.message.match(/\{.*\}/);
      if (m) { try { msg = JSON.parse(m[0]).message || msg; } catch { /* keep raw */ } }
      toast({ title: t("customerSignup.signUpFailed", "Sign up failed"), description: msg, variant: "destructive" });
    },
  });

  const inputCls = "ps-10 h-12 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-[#E6EAF0]";
  const canSubmit = form.email && form.password.length >= 8;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[#F8FAFC] dark:bg-[#0E1117]" />
      <div className="fixed top-4 right-4 z-50"><ThemeToggle /></div>
      <div className="w-full max-w-md p-4">
        <Card className="bg-white/90 dark:bg-[#151A23]/95 border border-[#E2E8F0] dark:border-[#232A36] shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{t("customerSignup.title", "Create your account")}</CardTitle>
            <CardDescription className="text-[#64748B] dark:text-[#9BA4B0]">
              {t("customerSignup.subtitle", "One account to reach every garage, parts store and insurer on SALIS.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); register.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#0B1F3B] dark:text-[#E6EAF0]">{t("customerSignup.fullName", "Full name")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" />
                  <Input className={inputCls} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} data-testid="input-fullname" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[#0B1F3B] dark:text-[#E6EAF0]">{t("common.email", "Email")} *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" />
                  <Input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="input-email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[#0B1F3B] dark:text-[#E6EAF0]">{t("common.phone", "Phone")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" />
                  <Input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} data-testid="input-phone" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[#0B1F3B] dark:text-[#E6EAF0]">{t("common.password", "Password")} *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" />
                  <Input type="password" className={inputCls} value={form.password} onChange={(e) => set("password", e.target.value)} data-testid="input-password" placeholder={t("providerSignup.passwordHint", "min 8 characters")} />
                </div>
              </div>
              <Button type="submit" disabled={!canSubmit || register.isPending} data-testid="button-signup"
                className="w-full h-12 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white font-semibold">
                {register.isPending ? t("customerSignup.creating", "Creating…") : t("customerSignup.createAccount", "Create account")}
              </Button>
              <p className="text-center text-sm text-[#64748B] dark:text-[#9BA4B0] pt-2">
                {t("customerSignup.alreadyHaveAccount", "Already have an account?")}{" "}
                <Link href="/login" className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline font-semibold">{t("auth.signIn", "Sign in")}</Link>
                {" · "}
                <Link href="/marketplace" className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline">{t("myBookings.browseProviders", "Browse providers")}</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
