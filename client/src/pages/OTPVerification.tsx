import { useRef, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { MessageSquareText } from "lucide-react";

/**
 * OTP verification screen (design: OTPVerification.dc.html).
 *
 * NOTE: there is no OTP backend yet, so verification is UI-only — "Verify"
 * routes to /login. When an SMS/OTP endpoint exists, wire `verify` to it.
 */
export default function OTPVerification() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const isRTL = (i18n.language || "en").split("-")[0] === "ar";

  const [codes, setCodes] = useState<string[]>(["", "", "", "", "", ""]);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const setDigit = (i: number, value: string) => {
    const c = [...codes];
    c[i] = value.slice(-1);
    setCodes(c);
    if (value && i < 5) inputs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codes[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const verify = () => setLocation("/login");

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
            <span
              dir="ltr"
              className="font-semibold text-[#0B1F3B] dark:text-white"
            >
              +966 55 •••• 471
            </span>
          </p>

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
            data-testid="button-verify"
            className="box-border h-12 w-full whitespace-nowrap rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] font-poppins text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(10,94,215,0.25)]"
          >
            {t("otpVerification.verify", "Verify")}
          </button>

          <p className="mt-4 text-[13px] text-[#64748B] dark:text-gray-400">
            {t("otpVerification.noCode", "Didn't receive a code?")}{" "}
            <button
              type="button"
              onClick={() => setCodes(["", "", "", "", "", ""])}
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
