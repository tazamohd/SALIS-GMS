import { useTranslation } from "react-i18next";
import { CARD, EYEBROW, FIGURE, STATUS_STYLES, type JobStatus } from "./statusTokens";

interface BayPipelineProps {
  counts: Record<JobStatus, number>;
}

/**
 * Stations in the order work actually moves through the shop. These are the five
 * sequential statuses the API persists; `cancelled` is shown apart because a
 * cancelled job leaves the flow rather than advancing through it.
 *
 * The previous version rendered a "QC" station backed by the same
 * `status === 'completed'` filter as the "Done" station beside it, so the two
 * always displayed an identical number. There is no quality-check status in the
 * schema, so that station is gone rather than faked.
 */
const STATIONS: JobStatus[] = ["pending", "assigned", "in_progress", "completed", "delivered"];

const STATION_LABELS: Record<JobStatus, [string, string]> = {
  pending: ["dashboard.checkIn", "Check-in"],
  assigned: ["dashboard.assigned", "Assigned"],
  in_progress: ["dashboard.repair", "In repair"],
  completed: ["dashboard.completed", "Completed"],
  delivered: ["dashboard.delivered", "Delivered"],
  cancelled: ["dashboard.cancelled", "Cancelled"],
};

export function BayPipeline({ counts }: BayPipelineProps) {
  const { t } = useTranslation();

  const peak = Math.max(1, ...STATIONS.map((s) => counts[s] ?? 0));

  /**
   * The busiest station that still has work ahead of it is where the shop is
   * backing up. Terminal states are excluded — a large `delivered` count is
   * throughput, not a queue.
   */
  const queueing = STATIONS.slice(0, 3);
  const bottleneck = queueing.reduce<JobStatus | null>((worst, s) => {
    const n = counts[s] ?? 0;
    if (n < 2) return worst;
    return worst === null || n > (counts[worst] ?? 0) ? s : worst;
  }, null);

  return (
    <section className={`${CARD} p-5 md:p-6`} aria-label={t("dashboard.pipeline", "Bay pipeline")}>
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="text-[15px] font-semibold text-[#0B1F3B] dark:text-[#EAEFF7]">
          {t("dashboard.pipeline", "Bay pipeline")}
        </h2>
        <span className={EYEBROW}>
          {t("dashboard.pipelineHint", "In the order work moves")}
        </span>
      </div>

      <div className="overflow-x-auto pt-5">
        <div className="grid grid-cols-5 gap-0 min-w-[680px]">
          {STATIONS.map((status, index) => {
            const style = STATUS_STYLES[status];
            const value = counts[status] ?? 0;
            const [key, fallback] = STATION_LABELS[status];
            const isLast = index === STATIONS.length - 1;

            return (
              <div
                key={status}
                className={`relative ${isLast ? "" : "pe-5"}`}
                data-testid={`card-status-${index}`}
              >
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute top-[13px] end-1.5 w-[7px] h-[7px] border-t-[1.5px] border-e-[1.5px] border-[#C6D0DE] dark:border-[#33415A] rotate-45"
                  />
                )}

                <div className="h-[3px] rounded-full bg-[#DFE5EE] dark:bg-[#222C3C] overflow-hidden mb-3">
                  <span
                    className="block h-full rounded-full dark:hidden"
                    style={{ width: `${(value / peak) * 100}%`, backgroundColor: style.hex }}
                  />
                  <span
                    className="hidden h-full rounded-full dark:block"
                    style={{ width: `${(value / peak) * 100}%`, backgroundColor: style.hexDark }}
                  />
                </div>

                <div className="text-xs font-medium text-[#55637A] dark:text-[#93A2B8]">
                  {t(key, fallback)}
                </div>
                <div className={`${FIGURE} text-3xl leading-none mt-1`}>{value}</div>

                {bottleneck === status && (
                  <span className="inline-block mt-2 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-[0.06em] bg-[#9C5B00]/[0.13] text-[#9C5B00] dark:bg-[#D9962F]/[0.15] dark:text-[#D9962F]">
                    {t("dashboard.bottleneck", "Backing up")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {(counts.cancelled ?? 0) > 0 && (
        <p className="mt-5 pt-4 border-t border-[#DFE5EE] dark:border-[#222C3C] text-xs text-[#55637A] dark:text-[#93A2B8] tabular-nums">
          {counts.cancelled} {t("dashboard.cancelledOutsideFlow", "cancelled, outside the flow")}
        </p>
      )}
    </section>
  );
}
