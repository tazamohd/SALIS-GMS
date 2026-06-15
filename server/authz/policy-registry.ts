/**
 * SALIS-GMS — RBAC policy registry (Story 3.2)
 *
 * Declarative map of mutation route patterns → allowed coarse roles, per the
 * approved rbac-policy-matrix-PROPOSAL.md (coarse-roles axis; stricter variants).
 * ADMIN is always allowed (handled by the authorize middleware's bypass).
 *
 * Reads are governed by tenant isolation (Epic 1), not this registry. Unmapped
 * mutations are currently allowed (incremental rollout) — the set of mapped
 * groups is expanded over time toward full deny-by-default.
 */
export interface RbacPolicy {
  methods: ReadonlyArray<"POST" | "PUT" | "PATCH" | "DELETE">;
  pattern: RegExp;
  roles: ReadonlyArray<string>;
  note?: string;
}

const ALL_MUT = ["POST", "PUT", "PATCH", "DELETE"] as const;

export const RBAC_POLICIES: ReadonlyArray<RbacPolicy> = [
  // Financial
  { methods: ALL_MUT, pattern: /^\/api\/(invoices|payments|estimates|refunds)\b/, roles: ["ACCOUNTANT", "MANAGER"] },
  // Procurement & inventory
  { methods: ALL_MUT, pattern: /^\/api\/(purchase-orders|suppliers|spare-parts|tools|inventory)\b/, roles: ["MANAGER"] },
  // HR — mutations for ACCOUNTANT/MANAGER, deletes ADMIN-only (handled by bypass since ADMIN passes all)
  { methods: ["DELETE"], pattern: /^\/api\/(hr|payroll|commissions|attendance|shifts)\b/, roles: ["ADMIN"] },
  { methods: ["POST", "PUT", "PATCH"], pattern: /^\/api\/(hr|payroll|commissions|attendance|shifts|performance|training)\b/, roles: ["ACCOUNTANT", "MANAGER"] },
  // Core operations
  { methods: ALL_MUT, pattern: /^\/api\/(job-cards|tasks|appointments|customers|vehicles|scheduling|technicians)\b/, roles: ["ADVISOR", "MANAGER"] },
  // Configuration & administration (ADMIN only)
  { methods: ALL_MUT, pattern: /^\/api\/(settings|feature-flags|config|users|roles|rbac|permissions)\b/, roles: ["ADMIN"] },
];

/** Find the first policy matching a request method + path, if any. */
export function matchPolicy(method: string, path: string): RbacPolicy | undefined {
  const m = method.toUpperCase() as RbacPolicy["methods"][number];
  return RBAC_POLICIES.find((p) => p.methods.includes(m) && p.pattern.test(path));
}
