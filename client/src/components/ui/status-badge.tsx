import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * StatusBadge — semantic status pill driven by the design-system tokens
 * (`--success`, `--warning`, `--info`, `--destructive`, `--muted`). No raw
 * Tailwind palette colors, no hardcoded hex.
 *
 * Pass a domain status string (e.g. `"in_progress"`, `"paid"`, `"cancelled"`)
 * and the variant is inferred. Override with `variant` for cases where the
 * inference is wrong. Use `tone="strong"` for solid-fill pills (default is
 * subtle: tinted background, semantic-colored text).
 *
 * This component is the single source of truth for status visuals — the
 * previous `<StatusPill>`, `<StatusDot>`, and `.status-pill-*` CSS utilities
 * were duplicates and have been removed.
 */

export type StatusVariant = "success" | "warning" | "info" | "destructive" | "neutral";
export type StatusTone = "subtle" | "strong";

interface StatusBadgeProps {
  /** Domain status string. Used both for variant inference (when `variant`
   *  is unset) and for the rendered label (prettified) when no children. */
  status?: string;
  /** Explicit semantic variant. Wins over `status`-based inference. */
  variant?: StatusVariant;
  /** Visual emphasis. `subtle` (default) = tinted bg + colored text;
   *  `strong` = solid bg + white text. */
  tone?: StatusTone;
  /** Optional label override; falls back to the prettified `status`. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Maps common domain status strings to semantic variants. Extend here when
 * a new status string appears — never add another status component.
 */
const STATUS_VARIANT_MAP: Record<string, StatusVariant> = {
  // success
  completed: "success",
  paid: "success",
  delivered: "success",
  active: "success",
  resolved: "success",
  approved: "success",
  signed: "success",
  // info (in-progress / informational)
  in_progress: "info",
  repair: "info",
  assigned: "info",
  sent: "info",
  scheduled: "info",
  shipped: "info",
  processing: "info",
  // warning (waiting / needs attention but not failed)
  pending: "warning",
  waiting: "warning",
  draft: "warning",
  on_hold: "warning",
  // destructive (failed / cancelled / overdue)
  cancelled: "destructive",
  canceled: "destructive",
  unpaid: "destructive",
  overdue: "destructive",
  failed: "destructive",
  rejected: "destructive",
  expired: "destructive",
};

/**
 * Token-driven class lookup. Uses arbitrary-value Tailwind referencing the
 * semantic HSL CSS vars defined in `client/src/index.css` — dark mode
 * inverts via the same vars under `.dark`, so no per-mode branches.
 */
const TONE_CLASSES: Record<StatusVariant, Record<StatusTone, string>> = {
  success: {
    subtle: "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]",
    strong: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
  },
  warning: {
    subtle: "bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))]",
    strong: "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]",
  },
  info: {
    subtle: "bg-[hsl(var(--info)/0.12)] text-[hsl(var(--info))]",
    strong: "bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))]",
  },
  destructive: {
    subtle: "bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))]",
    strong: "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]",
  },
  neutral: {
    subtle: "bg-muted text-muted-foreground",
    strong: "bg-foreground text-background",
  },
};

function inferVariant(status: string | undefined): StatusVariant {
  if (!status) return "neutral";
  const normalized = status.toLowerCase().replace(/\s+/g, "_");
  return STATUS_VARIANT_MAP[normalized] ?? "neutral";
}

function prettify(status: string | undefined): string {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusBadge({
  status,
  variant,
  tone = "subtle",
  children,
  className,
}: StatusBadgeProps) {
  const resolvedVariant = variant ?? inferVariant(status);
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, "_") || "";
  const label = children ?? prettify(status);

  return (
    <Badge
      className={cn(
        TONE_CLASSES[resolvedVariant][tone],
        "border-0 font-medium capitalize",
        className,
      )}
      data-testid={`status-badge-${normalizedStatus || resolvedVariant}`}
    >
      {label}
    </Badge>
  );
}
