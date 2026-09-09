import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Car, Wrench, Package, ShieldCheck, IdCard, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PORTALS, PORTAL_ORDER, type PortalDefinition } from "@/config/portals";
import logoImage from "@assets/Logo_blue_orange_1760743036292.png";

const ICONS = { Car, Wrench, Package, ShieldCheck, IdCard } as const;

/**
 * The front door. Every audience enters through its own portal, so the first
 * question the platform asks is "who are you?" — the answer decides which login
 * page, which registration form, and which home screen the visitor gets.
 */
export default function PortalChooser() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen relative overflow-hidden py-12 px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#0E1117]" />
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-gradient-to-bl from-[#0A5ED7]/10 to-transparent dark:from-[#0BB3FF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-[#F97316]/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-5xl">
        <header className="text-center space-y-4 mb-10">
          <img
            src={logoImage}
            alt={t("app.name", "SALIS AUTO")}
            className="mx-auto w-44 h-auto drop-shadow-lg"
            data-testid="logo-salis-auto"
          />
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-[#0B1F3B] dark:text-white">
            {t("portals.chooserTitle", "How do you use SALIS?")}
          </h1>
          <p className="font-poppins text-[#64748B] dark:text-[#9BA4B0] max-w-2xl mx-auto">
            {t(
              "portals.chooserSubtitle",
              "Pick your portal — each one asks only for what it actually needs and takes you straight to your own workspace.",
            )}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PORTAL_ORDER.map((id) => (
            <PortalCard key={id} portal={PORTALS[id]} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0]">
          {t("portals.justBrowsing", "Just looking around?")}{" "}
          <Link href="/marketplace" className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline font-semibold" data-testid="link-marketplace">
            {t("portals.browseMarketplace", "Browse the marketplace")}
          </Link>
        </p>
      </div>
    </div>
  );
}

function PortalCard({ portal }: { portal: PortalDefinition }) {
  const { t } = useTranslation();
  const Icon = ICONS[portal.icon];

  return (
    <div
      className="group relative flex flex-col rounded-2xl border border-[#E2E8F0] dark:border-[#232A36] bg-white/85 dark:bg-[#151A23]/95 p-6 shadow-lg backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
      data-testid={`portal-card-${portal.id}`}
    >
      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-r ${portal.accent} text-white flex items-center justify-center shadow-lg`}>
        <Icon className="h-6 w-6" />
      </div>

      <h2 className="mt-4 text-lg font-montserrat font-bold text-[#0B1F3B] dark:text-white">
        {t(portal.titleKey, portal.title)}
      </h2>
      <p className="mt-2 flex-1 text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0]">
        {t(portal.taglineKey, portal.tagline)}
      </p>

      <div className="mt-5 flex items-center gap-3">
        <Link
          href={portal.loginPath}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r ${portal.accent} px-4 py-2.5 text-sm font-poppins font-semibold text-white shadow transition-opacity hover:opacity-95`}
          data-testid={`portal-login-${portal.id}`}
        >
          {t("auth.signIn", "Sign in")}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
        <Link
          href={portal.registerPath}
          className="rounded-lg border border-[#E2E8F0] dark:border-[#232A36] px-4 py-2.5 text-sm font-poppins font-semibold text-[#0B1F3B] dark:text-[#E6EAF0] transition-colors hover:border-[#0A5ED7] hover:text-[#0A5ED7] dark:hover:border-[#0BB3FF] dark:hover:text-[#0BB3FF]"
          data-testid={`portal-register-${portal.id}`}
        >
          {portal.id === "staff"
            ? t("portals.joinTeam", "Join")
            : t("auth.register", "Register")}
        </Link>
      </div>
    </div>
  );
}
