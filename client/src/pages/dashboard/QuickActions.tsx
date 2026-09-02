import { BoxesIcon, CalendarPlus, ClipboardList, Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { CARD, EYEBROW } from "./statusTokens";

const ACTIONS = [
  { href: "/job-cards", icon: ClipboardList, key: "dashboard.newJobCard", label: "New job card" },
  {
    href: "/appointments",
    icon: CalendarPlus,
    key: "dashboard.newAppointment",
    label: "New appointment",
  },
  { href: "/invoices", icon: Receipt, key: "dashboard.newInvoice", label: "New invoice" },
  { href: "/spare-parts", icon: BoxesIcon, key: "dashboard.checkInventory", label: "Check inventory" },
] as const;

/**
 * Four equal actions. The previous version gave each one a different tinted
 * background, which read as four different states rather than four peers.
 */
export function QuickActions() {
  const { t } = useTranslation();

  return (
    <section className={`${CARD} p-5 md:p-6`}>
      <span className={EYEBROW}>{t("dashboard.quickActions", "Quick actions")}</span>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4">
        {ACTIONS.map(({ href, icon: Icon, key, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 rounded-lg border border-[#DFE5EE] dark:border-[#222C3C] px-3.5 py-3 text-[13px] font-medium text-[#0B1F3B] dark:text-[#EAEFF7] hover:border-[#0A5ED7] hover:bg-[#0A5ED7]/[0.06] dark:hover:border-[#4E96F0] dark:hover:bg-[#4E96F0]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A5ED7] transition-colors"
          >
            <Icon
              className="w-4 h-4 shrink-0 text-[#0A5ED7] dark:text-[#4E96F0]"
              aria-hidden="true"
            />
            <span className="truncate">{t(key, label)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
