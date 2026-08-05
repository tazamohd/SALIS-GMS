import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { MessageSquareText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * OTP verification screen (design: OTPVerification.dc.html), wired to
 * /api/customer/request-otp + /api/customer/verify-otp. The phone comes from
 * the ?phone= query param (set by customer signup). When no SMS provider is
 * configured the server returns a demo code, which we surface so the flow is
 * usable end-to-end in demo mode.
 */
export default function OTPVerification() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isRTL = (i18n.language || "en").split("-")[0] === "ar";

  const phone = new URLSearchParams(window.location.search).get("phone") ?? "";
  const [codes, setCodes] = useState<string[]>(["", "", "", "", "", ""]);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const requested = useRef(false);

  const requestCode = async () => {
    try {
      const res = await (await apiRequest("POST", "/api/customer/request-otp", { phone })).json();
      if (res.demoOtp) setDemoCode(res.demoOtp);
      toast({ title: t("otpVerification.sentTitle", "Code sent"), description: res.message ?? "" });
    } catch (e: any) {
      toast({ title: t("otpVerification.sendFailed", "Could not send code"), description: e.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!requested.current && phone) {
      requested.current = true;
      requestCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDigit = (i: number, value: string) => {
    const c = [...codes];
    c[i] = value.slice(-1);
    setCodes(c);
    if (value && i < 5) inputs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codes[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const verify = async () => {
    setBusy(true);
    try {
      await (await apiRequest("POST", "/api/customer/verify-otp", { code: codes.join("") })).json();
      toast({ title: t("otpVerification.verified", "Phone verified!") });
      setLocation("/marketplace");
    } catch (e: any) {
      let msg = e.message;
      const m = e.message.match(/\{.*\}/);
      if (m) { try { msg = JSON.parse(m[0]).message || msg; } catch { /* keep */ } }
      toast({ title: t("otpVerification.failed", "Verification failed"), description: msg, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      data-testid="page-otp-verification"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F8FAFC] dark:bg-[#0E1117] font-sans"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 right-0 h-[800px] w-[800px] rounded-full blur-[64px] bg-[radial-gradient(circle,rgba(10,94,215,0.10),transparent_65%)]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] p-4 animate-[fadeUp_0.3s_ease]">
        <div className="rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#131A24] p-6 text-center shadow-xl">
          <span className="mb-3.5 inline-flex rounded-full bg-[rgba(10,94,215,0.10)] p-3.5 text-[#0A5ED7]">
            <MessageSquareText size={26} />
          </span>
          <h2 className="m-0 font-montserrat text-xl font-bold text-[#0B1F3B] dark:text-white">
            {t("otpVerification.title", "OTP Verification")}
          </h2>
          <p className="mx-0 mb-5 mt-2 font-poppins text-[13px] text-[#64748B] dark:text-gray-400">
            {t("otpVerification.desc", "Enter the 6-digit code sent to")}{" "}
            <span dir="ltr" className="font-semibold text-[#0B1F3B] dark:text-white">
              {phone || t("otpVerification.yourPhone", "your phone")}
            </span>
          </p>

          {demoCode && (
            <p className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-[13px] text-amber-700 dark:text-amber-400" data-testid="demo-otp">
              {t("otpVerification.demoCode", "Demo mode — your code is")} <b dir="ltr">{demoCode}</b>
            </p>
          )}

          <div dir="ltr" className="mb-5 flex justify-center gap-2">
            {codes.map((val, i) => (
              <input
                key={i}
                ref={(el) => (inputs.current[i] = el)}
                value={val}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                inputMode="numeric"
                maxLength={1}
                data-testid={`input-otp-${i}`}
                className="h-[52px] w-11 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F1F5F9] dark:bg-[#0E1117] text-center text-xl font-bold text-[#0B1F3B] dark:text-white outline-none"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={verify}
            disabled={busy || codes.join("").length !== 6}
            data-testid="button-verify"
            className="box-border h-12 w-full whitespace-nowrap rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] font-poppins text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(10,94,215,0.25)] disabled:opacity-60"
          >
            {busy ? t("otpVerification.verifying", "Verifying…") : t("otpVerification.verify", "Verify")}
          </button>

          <p className="mt-4 text-[13px] text-[#64748B] dark:text-gray-400">
            {t("otpVerification.noCode", "Didn't receive a code?")}{" "}
            <button
              type="button"
              onClick={() => { setCodes(["", "", "", "", "", ""]); requestCode(); }}
              data-testid="button-resend"
              className="font-semibold text-[#0A5ED7]"
            >
              {t("otpVerification.resend", "Resend Code")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
