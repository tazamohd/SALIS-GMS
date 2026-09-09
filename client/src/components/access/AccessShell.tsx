import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import logoImage from "@assets/Logo_blue_orange_1760743036292.png";

interface AccessShellProps {
  /** Gradient stops from the portal registry, e.g. "from-[#0A5ED7] to-[#0BB3FF]". */
  accent: string;
  title: string;
  description: string;
  /** Optional icon rendered in the accent bubble above the title. */
  icon?: ReactNode;
  /** "md" for a single-column form, "lg" for the multi-column business forms. */
  width?: "md" | "lg" | "xl";
  /** Rendered under the card — quick-pick panels, help text, alternate links. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * The common chrome behind every portal access page: brand backdrop, theme
 * toggle, logo, a per-portal accent, and a "switch portal" escape hatch back to
 * the chooser. Each access page then only owns its form.
 */
export function AccessShell({
  accent,
  title,
  description,
  icon,
  width = "md",
  footer,
  children,
}: AccessShellProps) {
  const { t } = useTranslation();
  const maxWidth = width === "xl" ? "max-w-4xl" : width === "lg" ? "max-w-2xl" : "max-w-md";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-10">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#0E1117]" />
        <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl ${accent} opacity-[0.08] rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr ${accent} opacity-[0.08] rounded-full blur-3xl`} />
      </div>

      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className={`w-full ${maxWidth} p-4`}>
        <Link
          href="/portals"
          className="mb-4 inline-flex items-center gap-2 text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0] hover:text-[#0A5ED7] dark:hover:text-[#0BB3FF]"
          data-testid="link-switch-portal"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("portals.switchPortal", "Not you? Choose a different portal")}
        </Link>

        <Card className="bg-white/85 dark:bg-[#151A23]/95 backdrop-blur-xl border border-[#E2E8F0] dark:border-[#232A36] shadow-2xl">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex justify-center">
              <img
                src={logoImage}
                alt={t("app.name", "SALIS AUTO")}
                className="w-36 h-auto drop-shadow-lg"
                data-testid="logo-salis-auto"
              />
            </div>
            {icon && (
              <div className="flex justify-center">
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-r ${accent} text-white flex items-center justify-center shadow-lg`}>
                  {icon}
                </div>
              </div>
            )}
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-montserrat font-bold text-[#0B1F3B] dark:text-white">
                {title}
              </CardTitle>
              <CardDescription className="font-poppins text-[#64748B] dark:text-[#9BA4B0]">
                {description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        {footer}
      </div>
    </div>
  );
}

/** Shared input styling so every access form matches without repeating classes. */
export const accessInputClass =
  "h-12 font-poppins bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] " +
  "text-[#0B1F3B] dark:text-[#E6EAF0] placeholder:text-[#9BA4B0] " +
  "focus:border-[#0A5ED7] dark:focus:border-[#0BB3FF] focus:ring-[#0A5ED7]/20 dark:focus:ring-[#0BB3FF]/20";

/** Primary submit button styling, tinted by the portal accent. */
export function accessButtonClass(accent: string) {
  return `w-full h-12 bg-gradient-to-r ${accent} text-white font-poppins font-semibold shadow-lg transition-all duration-200 hover:opacity-95 hover:shadow-xl`;
}
