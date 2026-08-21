/**
 * Integration test for the route-policy middleware, exercising the FULL
 * middleware chain against the assembled Express app — not the mocked
 * `req`/`res` unit tests in the sibling file.
 *
 * The unit tests prove the middleware behaves as documented given a request.
 * They cannot prove the middleware is actually reached by every route: if
 * `enforceRoutePolicy` were dropped from `registerRoutes` tomorrow, every unit
 * test would still pass. This one wouldn't.
 *
 * For each declared policy, a role NOT in that policy's allowed set (and
 * NOT ADMIN) must receive a 403 when it calls the prefix. If the endpoint
 * itself doesn't exist, Express would 404 — a 403 proves the middleware
 * blocked the request before route resolution, which is the boundary we care
 * about.
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { Express } from "express";
import { createTestApp } from "../../__tests__/setup";
import { loginAsRole } from "../../__tests__/helpers";
import { ROUTE_POLICIES, type RoutePolicy } from "../routePolicy";

/** The five staff roles the policy layer knows about. */
const STAFF_ROLES = ["ADMIN", "MANAGER", "ADVISOR", "TECHNICIAN", "ACCOUNTANT"] as const;
type StaffRole = (typeof STAFF_ROLES)[number];

/** A method every policy row is exercised with. When a policy is scoped to
 *  writes only, use its first method — a GET wouldn't fire the rule. */
function probeMethod(policy: RoutePolicy): "get" | "post" | "put" | "patch" | "delete" {
  if (!policy.methods || policy.methods.length === 0) return "get";
  return policy.methods[0].toLowerCase() as "post" | "put" | "patch" | "delete";
}

/** Who should be denied by a given policy: every role that isn't ADMIN and
 *  isn't listed in `policy.roles`. */
function deniedRoles(policy: RoutePolicy): StaffRole[] {
  const allowed = new Set<string>(["ADMIN", ...policy.roles]);
  return STAFF_ROLES.filter((r) => !allowed.has(r));
}

/** The endpoint path the test hits for a given policy. `req.path` inside the
 *  route-policy middleware is post-mount (already stripped of `/api`), but
 *  supertest hits the app from outside — so the request URL includes `/api`. */
function probePath(policy: RoutePolicy): string {
  return `/api${policy.prefix}`;
}

describe("route policy — integration: middleware is actually wired", () => {
  let app: Express;
  const agents = new Map<StaffRole, ReturnType<typeof loginAsRole>>();

  beforeAll(async () => {
    ({ app } = await createTestApp());
    // Fire all logins in parallel; each ends with its own `agent`.
    await Promise.all(
      STAFF_ROLES.map((role) => {
        const p = loginAsRole(app, role);
        agents.set(role, p);
        return p;
      }),
    );
  }, 60_000);

  /** Every declared policy row must actually reject the roles it's supposed to
   *  reject. Loops the whole table so a new policy is covered automatically. */
  for (const policy of ROUTE_POLICIES) {
    const method = probeMethod(policy);
    const path = probePath(policy);
    for (const role of deniedRoles(policy)) {
      it(`denies ${role} on ${method.toUpperCase()} ${path}`, async () => {
        const { agent } = await agents.get(role)!;
        const res = await (agent as any)[method](path).send({});
        expect(res.status).toBe(403);
      });
    }

    /** ADMIN is implicitly allowed on every rule at the policy layer. But
     *  some handlers add a `requirePlatformAdmin` layer on top (defence in
     *  depth — the licensing control plane is one), so a garage ADMIN can
     *  still see a 403 from the handler even though the policy admits them.
     *  Only the policies that name at least one non-admin role are asserted
     *  here; empty-list ("ADMIN-only in policy terms") ones can be
     *  further-locked at the handler and that's a legitimate design. */
    if (policy.roles.length > 0) {
      it(`admits ADMIN on ${method.toUpperCase()} ${path}`, async () => {
        const { agent } = await agents.get("ADMIN")!;
        const res = await (agent as any)[method](path).send({});
        expect(res.status).not.toBe(403);
      });
    }
  }

  /** The documented omissions in routePolicy.ts. If someone quietly adds a
   *  rule for one, the header comment becomes a lie — this catches that by
   *  asserting the middleware does NOT block a technician from those paths. */
  const documentedOmissions = ["/reports", "/documents", "/ai", "/mobile"] as const;
  for (const prefix of documentedOmissions) {
    it(`leaves ${prefix} unlisted, so a technician passes the policy layer`, async () => {
      const { agent } = await agents.get("TECHNICIAN")!;
      // Deep path — proves the prefix match is boundary-aware (`/hr` matches
      // `/hr/x` but not `/hrothers`), so a real endpoint under the prefix
      // still isn't policy-blocked.
      const res = await agent.get(`/api${prefix}/none-such-endpoint`);
      expect(res.status).not.toBe(403);
    });
  }
});
