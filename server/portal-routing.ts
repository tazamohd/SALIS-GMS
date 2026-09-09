/**
 * Where a signed-in user belongs.
 *
 * The server is the authority on this: it is the only side that knows the
 * user's granular RBAC roles. The client mirrors the coarse fallbacks in
 * `client/src/config/portals.ts`, but whenever the server sends a
 * `primaryPortal` the client uses it verbatim.
 */

/** Granular RBAC role names (roles.name) that own a dedicated workspace. */
const ROLE_NAME_PORTALS: ReadonlyArray<[string, string]> = [
  ["Purchase Agent", "/purchase-agent/orders"],
  ["Call Center Agent", "/call-center"],
  ["HR Manager", "/hr-management"],
  ["HR Officer", "/hr-management"],
  ["Warehouse Manager", "/inventory"],
  ["Parts Manager", "/inventory"],
  ["Accountant", "/general-ledger"],
  ["Finance Manager", "/chart-of-accounts"],
];

export function resolvePrimaryPortal(
  user:
    | { userType?: string | null; role?: string | null; garageId?: string | null; onboardingCompleted?: boolean }
    | null
    | undefined,
  roleNames: readonly string[] = [],
): string {
  if (!user) return "/login";

  // A business whose guided setup is unfinished goes there first: branding,
  // invoice layout and data import are what make the rest of the app usable.
  // Only the people who can actually complete it are sent there.
  const guardRole = String(user.role ?? "").toUpperCase();
  if (
    user.garageId &&
    user.onboardingCompleted === false &&
    (guardRole === "ADMIN" || guardRole === "MANAGER")
  ) {
    return "/onboarding";
  }

  // Audience first — a customer never belongs in a garage workspace, whatever
  // roles happen to be attached.
  switch (String(user.userType ?? "").toLowerCase()) {
    case "customer":
      return "/client";
    case "technician":
      return "/technician-portal";
    case "platform_admin":
      return "/platform-admin";
    default:
      break;
  }

  for (const [name, portal] of ROLE_NAME_PORTALS) {
    if (roleNames.includes(name)) return portal;
  }

  switch (String(user.role ?? "").toUpperCase()) {
    case "CUSTOMER":
      return "/client";
    case "TECHNICIAN":
      return "/technician-portal";
    case "ACCOUNTANT":
      return "/general-ledger";
    case "PLATFORM_ADMIN":
    case "SUPER_ADMIN":
      return "/platform-admin";
    default:
      return "/dashboard";
  }
}
