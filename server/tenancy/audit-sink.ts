/**
 * SALIS-GMS — Tenancy audit sink (Story 5.1 / FR-9)
 *
 * Makes the isolation-leak hook from Story 1.3 durable: a detected cross-tenant
 * access/mutation attempt is written as an append-only Audit Event via the
 * existing audit_log pipeline (server/services/audit-trail.ts), attributed to the
 * acting user + garage from the Tenant Scope.
 */
import type { TenantScope } from "./tenant-context";
import { getTenantScope } from "./tenant-context";

export interface IsolationLeakDetail {
  action: "create" | "update" | "delete" | "read";
  table?: string;
  suppliedGarageId?: string | null;
  scopedGarageId?: string | null;
  id?: string;
}

/**
 * Awaitable durable write — used directly by tests and internally by
 * persistIsolationLeak. Resolves even if auditing fails so it never breaks a request.
 */
export async function writeIsolationLeakAudit(
  detail: IsolationLeakDetail,
  scope: TenantScope | undefined = getTenantScope(),
): Promise<void> {
  try {
    const { logAudit } = await import("../services/audit-trail");
    await logAudit({
      userId: scope?.userId ?? "anonymous",
      userName: scope?.userId ?? "anonymous",
      action: "ISOLATION_LEAK_ATTEMPT",
      resource: detail.table ?? "unknown",
      resourceId: detail.id ?? "",
      details: JSON.stringify(detail),
      ipAddress: "",
      userAgent: "",
      garageId: scope?.garageId ?? scope?.impersonation?.targetGarageId ?? "unknown",
      severity: "high",
    });
  } catch {
    // Auditing must never break the operation it is recording.
  }
}

/** Fire-and-forget durable persistence for the data-layer leak hook. */
export function persistIsolationLeak(detail: IsolationLeakDetail): void {
  void writeIsolationLeakAudit(detail);
}
