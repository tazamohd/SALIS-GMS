import { useTranslation } from "react-i18next";
import { CARD, EYEBROW } from "./statusTokens";

export interface ActivityItem {
  type: string;
  description: string;
  timestamp: string;
  entityId: string;
  entityType: string;
  status: string;
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
}

/** Activity kinds are categories, so they stay in the brand family. */
const TYPE_TONE: Record<string, string> = {
  job_update: "text-[#0A5ED7] dark:text-[#4E96F0]",
  payment: "text-[#127954] dark:text-[#43BC8E]",
  appointment: "text-[#0670A0] dark:text-[#35C4FF]",
  invoice: "text-[#C2560A] dark:text-[#F98B36]",
};

function relativeTime(timestamp: string): string {
  if (!timestamp) return "";
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const { t } = useTranslation();

  return (
    <section className={`${CARD} p-5 md:p-6`}>
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="text-[15px] font-semibold text-[#0B1F3B] dark:text-[#EAEFF7]">
          {t("dashboard.recentActivity", "Recent activity")}
        </h2>
        <span className={`${EYEBROW} inline-flex items-center gap-1.5`}>
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#127954] dark:bg-[#43BC8E]"
            aria-hidden="true"
          />
          {t("dashboard.live", "Live")}
        </span>
      </div>

      {!activities || activities.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#55637A] dark:text-[#93A2B8]">
          {t("dashboard.noRecentActivity", "No recent activity")}
        </p>
      ) : (
        <ul className="mt-3 max-h-[360px] overflow-y-auto">
          {activities.map((item, idx) => (
            <li
              key={`${item.entityType}-${item.entityId}-${idx}`}
              className="grid grid-cols-[auto_1fr_auto] items-baseline gap-3 py-2.5 border-t border-[#DFE5EE] dark:border-[#222C3C] first:border-t-0"
            >
              <span
                className={`text-[10.5px] font-semibold uppercase tracking-[0.07em] ${
                  TYPE_TONE[item.type] ?? TYPE_TONE.job_update
                }`}
              >
                {item.type.replace(/_/g, " ")}
              </span>
              <span className="text-[13px] text-[#0B1F3B] dark:text-[#EAEFF7] truncate">
                {item.description}
              </span>
              <span className="text-xs tabular-nums text-[#8593A8] dark:text-[#6B7B93] whitespace-nowrap">
                {relativeTime(item.timestamp)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
