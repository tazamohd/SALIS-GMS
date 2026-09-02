import { useTranslation } from "react-i18next";
import { CARD, EYEBROW, FIGURE } from "./statusTokens";

export interface DashboardSummary {
  todayRevenue: number;
  jobsInProgress: number;
  pendingJobs: number;
  completedToday: number;
  appointmentsToday: number;
  pendingInvoices: number;
  outstandingAmount: number;
  lowStockItems: number;
  technicianUtilization: number;
  activeTechnicians: number;
  totalTechnicians: number;
}

interface TodaySnapshotProps {
  summary: DashboardSummary;
}

/**
 * Today's figures, in one strip. Only `lowStockItems` changes colour, and only
 * when it is actually a problem — colour here means "look at this", not
 * decoration, so a green row for every healthy metric would drain it of meaning.
 */
export function TodaySnapshot({ summary }: TodaySnapshotProps) {
  const { t } = useTranslation();

  const cells = [
    {
      label: t("dashboard.todayRevenue", "Revenue today"),
      value: summary.todayRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 }),
      unit: "SAR",
    },
    { label: t("dashboard.jobsInProgress", "In progress"), value: summary.jobsInProgress },
    { label: t("dashboard.appointments", "Appointments"), value: summary.appointmentsToday },
    { label: t("dashboard.pendingInvoices", "Pending invoices"), value: summary.pendingInvoices },
    {
      label: t("dashboard.lowStock", "Low stock"),
      value: summary.lowStockItems,
      alert: summary.lowStockItems > 0,
    },
    {
      label: t("dashboard.techUtilization", "Tech utilisation"),
      value: summary.technicianUtilization,
      unit: "%",
    },
  ];

  return (
    <section className={`${CARD} p-5 md:p-6`}>
      <span className={EYEBROW}>{t("dashboard.todaySnapshot", "Today")}</span>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-5 gap-y-4 mt-4">
        {cells.map((cell) => (
          <div key={cell.label}>
            <div
              className={`${FIGURE} text-2xl leading-tight ${
                cell.alert ? "!text-[#B23A36] dark:!text-[#E4736E]" : ""
              }`}
            >
              {cell.value}
              {cell.unit && (
                <span className="ms-1 text-xs font-semibold tracking-normal text-[#55637A] dark:text-[#93A2B8]">
                  {cell.unit}
                </span>
              )}
            </div>
            <div className="mt-0.5 text-xs text-[#55637A] dark:text-[#93A2B8]">{cell.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
