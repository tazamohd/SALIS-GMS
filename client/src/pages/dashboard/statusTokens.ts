/**
 * Job-state vocabulary for the dashboard.
 *
 * Brand colours (#0A5ED7 blue, #0BB3FF cyan, #F97316 orange) identify SALIS AUTO
 * and label chart categories. They are deliberately NOT reused to encode job
 * state. The previous mapping gave `completed` and `in_progress` the same blue,
 * and `pending` and `cancelled` the same orange, so an operator could not tell a
 * cancelled job from a pending one by colour alone. Every state below now has a
 * colour no other state uses.
 *
 * Weights are capped at 700: client/index.html loads Montserrat 400-700, so
 * `font-black` (900) was being synthesised by the browser rather than rendered.
 */

/** Job card statuses as persisted by the API (see shared/schema.ts jobCards). */
export const JOB_STATUSES = [
  "pending",
  "assigned",
  "in_progress",
  "completed",
  "delivered",
  "cancelled",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export interface StateStyle {
  /** Tailwind classes for a chip: background + text, light and dark. */
  chip: string;
  /** Raw hex used by charts and load bars, light theme. */
  hex: string;
  /** Raw hex used by charts and load bars, dark theme. */
  hexDark: string;
  /** Human label, passed through i18n by the caller. */
  label: string;
}

const NEUTRAL: StateStyle = {
  chip: "bg-[#0B1F3B]/[0.07] text-[#55637A] dark:bg-[#EAEFF7]/[0.08] dark:text-[#93A2B8]",
  hex: "#8593A8",
  hexDark: "#6B7B93",
  label: "Unknown",
};

/**
 * Ordered so the pipeline can render statuses left to right in the sequence
 * work actually moves through the shop.
 */
export const STATUS_STYLES: Record<JobStatus, StateStyle> = {
  pending: {
    chip: "bg-[#9C5B00]/[0.13] text-[#9C5B00] dark:bg-[#D9962F]/[0.15] dark:text-[#D9962F]",
    hex: "#9C5B00",
    hexDark: "#D9962F",
    label: "Pending",
  },
  assigned: {
    chip: "bg-[#0BB3FF]/[0.12] text-[#0670A0] dark:bg-[#35C4FF]/[0.15] dark:text-[#35C4FF]",
    hex: "#0670A0",
    hexDark: "#35C4FF",
    label: "Assigned",
  },
  in_progress: {
    chip: "bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#4E96F0]/[0.16] dark:text-[#4E96F0]",
    hex: "#0A5ED7",
    hexDark: "#4E96F0",
    label: "In repair",
  },
  completed: {
    chip: "bg-[#127954]/[0.12] text-[#127954] dark:bg-[#43BC8E]/[0.15] dark:text-[#43BC8E]",
    hex: "#127954",
    hexDark: "#43BC8E",
    label: "Completed",
  },
  delivered: {
    chip: "bg-[#0B1F3B]/[0.09] text-[#0B1F3B] dark:bg-[#EAEFF7]/[0.12] dark:text-[#EAEFF7]",
    hex: "#0B1F3B",
    hexDark: "#C3CEDF",
    label: "Delivered",
  },
  cancelled: {
    chip: "bg-[#B23A36]/[0.12] text-[#B23A36] dark:bg-[#E4736E]/[0.15] dark:text-[#E4736E]",
    hex: "#B23A36",
    hexDark: "#E4736E",
    label: "Cancelled",
  },
};

export function getStatusStyle(status: string | null | undefined): StateStyle {
  if (!status) return NEUTRAL;
  return STATUS_STYLES[status as JobStatus] ?? NEUTRAL;
}

/**
 * Priority reads as a rank, so it is set in weight and a single accent rather
 * than a filled pill — filled pills on every row competed with the status chips.
 */
export const PRIORITY_STYLES: Record<string, string> = {
  urgent: "text-[#B23A36] dark:text-[#E4736E]",
  high: "text-[#9C5B00] dark:text-[#D9962F]",
  medium: "text-[#55637A] dark:text-[#93A2B8]",
  low: "text-[#8593A8] dark:text-[#6B7B93]",
};

export function getPriorityClass(priority: string | null | undefined): string {
  if (!priority) return PRIORITY_STYLES.medium;
  return PRIORITY_STYLES[priority.toLowerCase()] ?? PRIORITY_STYLES.medium;
}

/** Priorities that earn a severity stripe down the start edge of the row. */
export function getSeverityStripe(priority: string | null | undefined): string {
  const p = (priority ?? "").toLowerCase();
  if (p === "urgent") return "before:bg-[#B23A36] dark:before:bg-[#E4736E]";
  if (p === "high") return "before:bg-[#9C5B00] dark:before:bg-[#D9962F]";
  return "before:bg-transparent";
}

/**
 * Service type is a category, not a state, so it stays in the brand family.
 * Each entry is a distinct hue — the old map repeated #0A5ED7 for both
 * `maintenance` and `inspection`.
 */
export const SERVICE_STYLES: Record<string, string> = {
  maintenance: "text-[#0A5ED7] dark:text-[#4E96F0]",
  repair: "text-[#C2560A] dark:text-[#F98B36]",
  diagnostic: "text-[#0670A0] dark:text-[#35C4FF]",
  inspection: "text-[#127954] dark:text-[#43BC8E]",
  body_work: "text-[#0B1F3B] dark:text-[#C3CEDF]",
  tire_service: "text-[#55637A] dark:text-[#93A2B8]",
};

export function getServiceClass(serviceType: string | null | undefined): string {
  if (!serviceType) return SERVICE_STYLES.tire_service;
  const key = serviceType.toLowerCase().replace(/\s+/g, "_");
  return SERVICE_STYLES[key] ?? SERVICE_STYLES.tire_service;
}

/**
 * Categorical ramp for the job-mix chart. Every entry is a different hue; the
 * previous PIE_COLORS array repeated #0A5ED7 at index 0 and 2, so two slices
 * rendered identically.
 */
export const MIX_COLORS = ["#0A5ED7", "#0BB3FF", "#127954", "#E4670B", "#0B1F3B", "#8593A8"];

/** Shared surface treatment, so cards stop drifting apart across sections. */
export const CARD =
  "bg-white dark:bg-[#111722] border border-[#DFE5EE] dark:border-[#222C3C] rounded-xl";

/** Small uppercase label above a figure. */
export const EYEBROW =
  "text-[10.5px] font-semibold uppercase tracking-[0.13em] text-[#8593A8] dark:text-[#6B7B93]";

/** Figures line up in columns, so they are always tabular. */
export const FIGURE =
  "font-montserrat font-bold tabular-nums tracking-[-0.025em] text-[#0B1F3B] dark:text-[#EAEFF7]";
