import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import logoImage from "@assets/Logo_blue_orange_1760743036292.png";

/**
 * Forgot-password screen (design: ForgotPassword.dc.html).
 *
 * NOTE: there is no password-reset backend yet, so this is a UI-only flow:
 * submitting shows the "check your email" confirmation locally. When a
 * POST /api/auth/forgot-password endpoint exists, wire `submit` to it.
 */
export default function ForgotPassword() {
  const { t, i18n } = useTranslation();
  const isRTL = (i18n.language || "en").split("-")[0] === "ar";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSent(true);
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      data-testid="page-forgot-password"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F8FAFC] dark:bg-[#0E1117] font-sans"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 right-0 h-[800px] w-[800px] rounded-full blur-[64px] bg-[radial-gradient(circle,rgba(10,94,215,0.10),transparent_65%)]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] p-4 animate-[fadeUp_0.3s_ease]">
        <div className="rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#131A24] p-6 shadow-xl">
          <div className="mb-4 flex flex-col items-center gap-2.5">
            <img
              src={logoImage}
              alt={t("app.name", "SALIS AUTO")}
              className="w-[120px] h-auto"
              data-testid="logo-salis-auto"
            />
            {sent ? (
              <>
                <h2 className="m-0 text-center font-montserrat text-xl font-bold text-[#0B1F3B] dark:text-white">
                  {t("forgotPassword.checkEmail", "Check your email")}
                </h2>
                <p className="m-0 text-center font-poppins text-[13px] text-[#64748B] dark:text-gray-400">
                  {t(
                    "forgotPassword.sentDesc",
                    "We sent a password reset link to your email address",
                  )}
                </p>
              </>
            ) : (
              <>
                <h2 className="m-0 text-center font-montserrat text-xl font-bold text-[#0B1F3B] dark:text-white">
                  {t("forgotPassword.reset", "Reset Password")}
                </h2>
                <p className="m-0 text-center font-poppins text-[13px] text-[#64748B] dark:text-gray-400">
                  {t(
                    "forgotPassword.willSend",
                    "We'll send a reset link to your email",
                  )}
                </p>
              </>
            )}
          </div>

          {!sent && (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-poppins text-xs font-medium text-[#0B1F3B] dark:text-gray-200">
                  {t("forgotPassword.email", "Email")}
                </label>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                  className="box-border h-12 w-full rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F1F5F9] dark:bg-[#0E1117] px-3.5 text-sm text-[#0B1F3B] dark:text-white outline-none placeholder:text-[#9BA4B0]"
                />
              </div>
              <button
                type="submit"
                data-testid="button-send-link"
                className="box-border h-12 w-full whitespace-nowrap rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] font-poppins text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(10,94,215,0.25)]"
              >
                {t("forgotPassword.sendLink", "Send Reset Link")}
              </button>
            </form>
          )}

          <Link
            href="/login"
            data-testid="link-back-to-signin"
            className="mt-4 block text-center font-poppins text-[13px] font-medium text-[#0A5ED7]"
          >
            {t("forgotPassword.backToSignIn", "Back to Sign In")}
          </Link>
        </div>
      </div>
    </div>
  );
}
