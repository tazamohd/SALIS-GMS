import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import logoImage from "@assets/Logo_blue_orange_1760743036292.png";

/**
 * SPA auth-gate landing. Premium dark hero shown when an unauthenticated user
 * lands on the app. Mirrors the brand language of public/index.html (animated
 * gradient mesh, glass surfaces, brand-gradient CTA) for a coherent first
 * impression across the marketing page and the app entry.
 */
export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050714] text-white">
      {/* Animated radial gradient mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 animate-[mesh_24s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(10,94,215,0.30), transparent 60%)," +
            "radial-gradient(ellipse 60% 50% at 80% 20%, rgba(11,179,255,0.22), transparent 60%)," +
            "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(124,92,255,0.20), transparent 60%)",
        }}
      />

      {/* Subtle masked grid noise */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 80%)",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 80%)",
        }}
      />

      {/* Floating orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 z-0 h-96 w-96 rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #0A5ED7, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 z-0 h-96 w-96 rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(circle, #7C5CFF, transparent 70%)" }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg text-center animate-[fadeUp_0.8s_cubic-bezier(0.22,1,0.36,1)_both]">
          {/* Pill */}
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-md">
            <span
              className="rounded-full bg-gradient-to-r from-[#0A5ED7] via-[#0BB3FF] to-[#7C5CFF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
            >
              {t("landing.pillTag", "Welcome")}
            </span>
            {t("landing.pillText", "Sign in to your workspace")}
          </div>

          {/* Logo */}
          <div className="mb-10 flex justify-center">
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 -z-10 rounded-2xl blur-2xl opacity-50"
                style={{
                  background:
                    "radial-gradient(circle, rgba(10,94,215,0.6), transparent 70%)",
                }}
              />
              <img
                src={logoImage}
                alt={t("app.name", "SALIS AUTO")}
                className="h-auto w-44 drop-shadow-[0_8px_24px_rgba(11,179,255,0.25)]"
                data-testid="logo-salis-auto-login"
              />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">
            <span
              className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
            >
              {t("landing.welcomeTitle", "Welcome to SALIS AUTO")}
            </span>
          </h1>

          {/* Tagline */}
          <p className="mt-5 text-base md:text-lg text-slate-300 font-medium">
            {t("app.tagline", "The operating system for modern garages")}
          </p>

          {/* Subline */}
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            {t(
              "landing.signInPrompt",
              "Sign in to access your dashboard and manage your garage operations efficiently."
            )}
          </p>

          {/* CTAs */}
          <div className="mt-10 space-y-3">
            <Link href="/login">
              <button
                data-testid="button-sign-in"
                className="group relative w-full overflow-hidden rounded-xl px-6 py-4 text-base font-semibold text-white shadow-[0_8px_24px_rgba(10,94,215,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(10,94,215,0.55),inset_0_1px_0_rgba(255,255,255,0.25)]"
                style={{
                  background:
                    "linear-gradient(135deg, #0A5ED7 0%, #0BB3FF 50%, #7C5CFF 100%)",
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {t("auth.signIn", "Sign In")}
                  <svg
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
                {/* Subtle inner shimmer on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
              </button>
            </Link>

            <Link href="/register">
              <button
                data-testid="button-register"
                className="group w-full rounded-xl border border-white/15 bg-white/[0.04] px-6 py-4 text-base font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0BB3FF] hover:bg-white/[0.08]"
              >
                <span className="flex items-center justify-center gap-2">
                  {t("auth.createAccount", "Create Account")}
                  <svg
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 opacity-70"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </Link>
          </div>

          {/* Trust strip */}
          <div className="mt-10 flex items-center justify-center gap-x-6 gap-y-3 flex-wrap text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-[#0BB3FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("landing.trustZatca", "ZATCA Phase 2")}
            </span>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-[#0BB3FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("landing.trustMultiCurrency", "Multi-currency")}
            </span>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-[#0BB3FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("landing.trustRealtime", "Real-time telemetry")}
            </span>
          </div>
        </div>
      </div>

      {/* Inline keyframes (avoids touching global CSS) */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mesh {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50%      { transform: translate3d(-2%, -3%, 0) scale(1.05); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}
