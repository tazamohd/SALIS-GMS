import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { JobCard } from "@shared/schema";
import {
  CARD,
  EYEBROW,
  getPriorityClass,
  getServiceClass,
  getSeverityStripe,
  getStatusStyle,
} from "./statusTokens";

interface WorkOrdersTableProps {
  tasks: JobCard[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewTask: (task: JobCard) => void;
}

const TH =
  "text-start py-3 px-5 text-[10.5px] font-semibold uppercase tracking-[0.11em] text-[#8593A8] dark:text-[#6B7B93] whitespace-nowrap";
const TD = "py-3.5 px-5 text-[13.5px] align-middle";

function shortenId(id: string) {
  return id.substring(0, 8).toUpperCase();
}

export function WorkOrdersTable({
  tasks,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onViewTask,
}: WorkOrdersTableProps) {
  const { t } = useTranslation();

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);

  return (
    <section className={`${CARD} overflow-hidden`} data-testid="card-tasks">
      <div className="flex items-center justify-between gap-3 flex-wrap p-5 pb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-[#0B1F3B] dark:text-[#EAEFF7]">
            {t("dashboard.latestTasks", "Open work orders")}
          </h2>
          <span className={EYEBROW}>{t("dashboard.sortedByPriority", "Newest first")}</span>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/job-cards">
            {t("common.viewAll", "View all")}
            <ArrowUpRight className="w-4 h-4 ms-2" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="border-y border-[#DFE5EE] dark:border-[#222C3C]">
              <th className={TH}>{t("table.id", "Job")}</th>
              <th className={TH}>{t("table.vehicle", "Vehicle")}</th>
              <th className={TH}>{t("table.service", "Service")}</th>
              <th className={TH}>{t("common.status", "Status")}</th>
              <th className={TH}>{t("table.priority", "Priority")}</th>
              <th className={`${TH} text-end`}>{t("common.actions", "Action")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="w-7 h-7 mx-auto border-[3px] border-[#0A5ED7]/20 border-t-[#0A5ED7] rounded-full animate-spin" />
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-sm text-[#55637A] dark:text-[#93A2B8]"
                >
                  {t("dashboard.noTasksAvailable", "No open work orders")}
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const status = getStatusStyle(task.status);
                const vehicleInfo = task.vehicleInfo as
                  | { make?: string; model?: string; customerName?: string; owner?: string }
                  | null;
                const customer = vehicleInfo?.customerName || vehicleInfo?.owner;

                return (
                  <tr
                    key={task.id}
                    className="border-b border-[#DFE5EE] dark:border-[#222C3C] last:border-b-0 hover:bg-[#EDF1F7] dark:hover:bg-[#171F2C] transition-colors"
                    data-testid={`row-task-${task.id}`}
                  >
                    <td
                      className={`${TD} relative ps-6 before:absolute before:start-0 before:top-0 before:bottom-0 before:w-[3px] ${getSeverityStripe(task.priority)}`}
                    >
                      <span className="font-mono text-[12.5px] text-[#55637A] dark:text-[#93A2B8]">
                        {shortenId(task.id)}
                      </span>
                    </td>
                    <td className={TD}>
                      <div className="font-medium text-[#0B1F3B] dark:text-[#EAEFF7]">
                        {[vehicleInfo?.make, vehicleInfo?.model].filter(Boolean).join(" ") || "—"}
                      </div>
                      {customer && (
                        <div className="text-xs text-[#8593A8] dark:text-[#6B7B93] mt-0.5">
                          {customer}
                        </div>
                      )}
                    </td>
                    <td className={`${TD} ${getServiceClass(task.serviceType)}`}>
                      {task.serviceType}
                    </td>
                    <td className={TD}>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium ${status.chip}`}
                      >
                        <span
                          className="w-[5px] h-[5px] rounded-full bg-current"
                          aria-hidden="true"
                        />
                        {t(`status.${task.status}`, status.label)}
                      </span>
                    </td>
                    <td className={TD}>
                      <span
                        className={`text-[10.5px] font-semibold uppercase tracking-[0.07em] ${getPriorityClass(task.priority)}`}
                      >
                        {t(`priority.${task.priority}`, task.priority)}
                      </span>
                    </td>
                    <td className={`${TD} text-end`}>
                      <Button size="sm" variant="outline" onClick={() => onViewTask(task)}>
                        {t("common.view", "View")}
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 flex-wrap p-4 border-t border-[#DFE5EE] dark:border-[#222C3C]">
          <span className="text-xs tabular-nums text-[#55637A] dark:text-[#93A2B8]">
            {t("common.page", "Page")} {currentPage} / {totalPages}
          </span>
          <nav className="flex gap-1.5" aria-label={t("common.pagination", "Pagination")}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {t("common.previous", "Prev")}
            </Button>
            {pages.map((page) => (
              <Button
                key={page}
                size="sm"
                variant={page === currentPage ? "default" : "outline"}
                aria-current={page === currentPage ? "page" : undefined}
                onClick={() => onPageChange(page)}
                className="tabular-nums min-w-9"
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {t("common.next", "Next")}
            </Button>
          </nav>
        </div>
      )}
    </section>
  );
}
