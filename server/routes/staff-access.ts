/**
 * Staff access — how an employee gets a login without anyone self-minting
 * privileges.
 *
 * Two paths, both ending in a user row whose role the BUSINESS chose:
 *
 *   1. Invite  — an admin issues a code bound to a role (and optionally to one
 *      email). Redeeming it at /staff/join creates the account immediately.
 *   2. Apply   — a walk-up applicant types the workplace's public join code at
 *      /staff/apply. That only files a request; the business approves it and
 *      picks the real role at that point.
 *
 * Anonymous endpoints live under /api/staff/public/* so the auth allow-list and
 * the CSRF exemption can name a single prefix instead of a growing list. The
 * public responses deliberately reveal only the business name and the offered
 * role — never whether a given email exists.
 */
import { Router } from "express";
import crypto from "crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import {
  branches,
  garages,
  roles,
  staffApplications,
  staffInvites,
  userRoleBranch,
  users,
  insertStaffApplicationSchema,
} from "@shared/schema";
import { hashPassword } from "../auth";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { asyncHandler } from "../middleware/asyncHandler";
import { STANDARD_ROLES } from "../rbac-config";

const router = Router();

/** Guard roles the simple route guards understand. */
type GuardRole = "ADMIN" | "MANAGER" | "ADVISOR" | "TECHNICIAN" | "ACCOUNTANT";

/**
 * Which coarse guard role and userType each granular RBAC role maps to. An
 * invite names a granular role (what the business thinks in), but the runtime
 * guards only understand the coarse one, so both are stored on the invite.
 */
const ROLE_MAPPING: Record<string, { guardRole: GuardRole; userType: string }> = {
  SYSTEM_ADMIN: { guardRole: "ADMIN", userType: "admin" },
  OWNER: { guardRole: "ADMIN", userType: "admin" },
  GENERAL_MANAGER: { guardRole: "MANAGER", userType: "manager" },
  SERVICE_MANAGER: { guardRole: "MANAGER", userType: "manager" },
  PARTS_MANAGER: { guardRole: "MANAGER", userType: "manager" },
  HR_MANAGER: { guardRole: "MANAGER", userType: "manager" },
  MARKETING_MANAGER: { guardRole: "MANAGER", userType: "manager" },
  WAREHOUSE_MANAGER: { guardRole: "MANAGER", userType: "manager" },
  FRANCHISE_MANAGER: { guardRole: "MANAGER", userType: "manager" },
  ANALYST: { guardRole: "MANAGER", userType: "manager" },
  SERVICE_ADVISOR: { guardRole: "ADVISOR", userType: "advisor" },
  CSR: { guardRole: "ADVISOR", userType: "advisor" },
  RECEPTIONIST: { guardRole: "ADVISOR", userType: "advisor" },
  CALL_CENTER_AGENT: { guardRole: "ADVISOR", userType: "advisor" },
  LEAD_TECHNICIAN: { guardRole: "TECHNICIAN", userType: "technician" },
  TECHNICIAN: { guardRole: "TECHNICIAN", userType: "technician" },
  APPRENTICE: { guardRole: "TECHNICIAN", userType: "technician" },
  QC_INSPECTOR: { guardRole: "TECHNICIAN", userType: "technician" },
  FINANCE_MANAGER: { guardRole: "ACCOUNTANT", userType: "accountant" },
  ACCOUNTANT: { guardRole: "ACCOUNTANT", userType: "accountant" },
};

/** The roles a business may invite into — the catalog the UI renders. */
export const INVITABLE_ROLES = Object.keys(ROLE_MAPPING)
  // OWNER/SYSTEM_ADMIN are provisioned by onboarding, never handed out by invite.
  .filter((key) => key !== "OWNER" && key !== "SYSTEM_ADMIN")
  .map((key) => ({
    roleKey: key,
    name: (STANDARD_ROLES as Record<string, { name: string; description: string }>)[key]?.name ?? key,
    description: (STANDARD_ROLES as Record<string, { name: string; description: string }>)[key]?.description ?? "",
    ...ROLE_MAPPING[key],
  }));

function mappingFor(roleKey: string) {
  return ROLE_MAPPING[String(roleKey).toUpperCase()];
}

/** Unambiguous code alphabet — no O/0/I/1 to survive being read over a phone. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(length: number): string {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

function isRedeemable(invite: typeof staffInvites.$inferSelect): boolean {
  if (invite.revokedAt) return false;
  if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) return false;
  return invite.usedCount < invite.maxUses;
}

/** Link the granular RBAC role, mirroring what the demo seed does. */
async function assignRbacRole(userId: string, garageId: string, roleKey: string, branchId?: string | null) {
  const roleName = (STANDARD_ROLES as Record<string, { name: string }>)[roleKey.toUpperCase()]?.name;
  if (!roleName) return;

  const [role] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
  if (!role) return;

  let targetBranch = branchId ?? null;
  if (!targetBranch) {
    const [branch] = await db.select().from(branches).where(eq(branches.garageId, garageId)).limit(1);
    targetBranch = branch?.id ?? null;
  }
  // userRoleBranch requires a branch; a garage with no branch yet simply keeps
  // the coarse guard role until one exists.
  if (!targetBranch) return;

  await db.insert(userRoleBranch).values({
    userId,
    roleId: role.id,
    branchId: targetBranch,
    isPrimaryRole: true,
  });
}

// ───────────────────────────── Public endpoints ─────────────────────────────

/** Confirm an invite code before the applicant fills in the whole form. */
router.get(
  "/staff/public/invite/:code",
  asyncHandler(async (req, res) => {
    const [invite] = await db
      .select()
      .from(staffInvites)
      .where(eq(staffInvites.code, String(req.params.code).toUpperCase()))
      .limit(1);

    if (!invite || !isRedeemable(invite)) {
      return res.status(404).json({ valid: false, message: "This invite code is not valid or has expired" });
    }

    const [garage] = await db.select().from(garages).where(eq(garages.id, invite.garageId)).limit(1);
    const roleName = (STANDARD_ROLES as Record<string, { name: string }>)[invite.roleKey]?.name ?? invite.roleKey;

    res.json({
      valid: true,
      businessName: garage?.name ?? "",
      businessType: garage?.businessType ?? "garage",
      roleKey: invite.roleKey,
      roleName,
      // Present so the form can lock the email field; never used to confirm
      // whether an account already exists.
      lockedEmail: invite.email ?? null,
    });
  }),
);

/** Redeem an invite: creates the account with the invited role and signs in. */
router.post(
  "/staff/public/join",
  asyncHandler(async (req, res) => {
    const code = String(req.body?.code ?? "").trim().toUpperCase();
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");
    const fullName = String(req.body?.fullName ?? "").trim();
    const phone = req.body?.phone ? String(req.body.phone).trim() : null;

    if (!code || !email || !fullName) {
      return res.status(400).json({ message: "Invite code, name and email are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const [invite] = await db.select().from(staffInvites).where(eq(staffInvites.code, code)).limit(1);
    if (!invite || !isRedeemable(invite)) {
      return res.status(400).json({ message: "This invite code is not valid or has expired" });
    }
    if (invite.email && invite.email.toLowerCase() !== email) {
      return res.status(403).json({ message: "This invite was issued for a different email address" });
    }

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists — sign in instead" });
    }

    const [user] = await db
      .insert(users)
      .values({
        email,
        password: await hashPassword(password),
        fullName,
        phone,
        role: invite.guardRole,
        userType: invite.userType ?? mappingFor(invite.roleKey)?.userType ?? "advisor",
        garageId: invite.garageId,
        isActive: true,
      } as any)
      .returning();

    // Consume one use. The conditional WHERE makes a concurrent redeem of the
    // last remaining use lose rather than overrun maxUses.
    const consumed = await db
      .update(staffInvites)
      .set({ usedCount: sql`${staffInvites.usedCount} + 1` })
      .where(and(eq(staffInvites.id, invite.id), sql`${staffInvites.usedCount} < ${staffInvites.maxUses}`))
      .returning();
    if (consumed.length === 0) {
      await db.delete(users).where(eq(users.id, user.id));
      return res.status(409).json({ message: "This invite code has just been used up" });
    }

    await assignRbacRole(user.id, invite.garageId, invite.roleKey, invite.branchId);

    req.login(user as any, (err) => {
      if (err) {
        return res.status(500).json({ message: "Account created but sign-in failed — please sign in" });
      }
      const { password: _pw, ...safe } = user as any;
      res.status(201).json(safe);
    });
  }),
);

/** Look up a workplace by its public join code (name only). */
router.get(
  "/staff/public/workplace/:code",
  asyncHandler(async (req, res) => {
    const [garage] = await db
      .select({ id: garages.id, name: garages.name, businessType: garages.businessType, city: garages.city })
      .from(garages)
      .where(eq(garages.staffJoinCode, String(req.params.code).toUpperCase()))
      .limit(1);

    if (!garage) {
      return res.status(404).json({ found: false, message: "No workplace found for that code" });
    }
    res.json({ found: true, businessName: garage.name, businessType: garage.businessType, city: garage.city });
  }),
);

/** File a join request against a workplace. Grants nothing on its own. */
router.post(
  "/staff/public/apply",
  asyncHandler(async (req, res) => {
    const joinCode = String(req.body?.joinCode ?? "").trim().toUpperCase();
    const password = String(req.body?.password ?? "");
    if (!joinCode) {
      return res.status(400).json({ message: "A workplace code is required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const parsed = insertStaffApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Please check the form", errors: parsed.error.issues });
    }

    const [garage] = await db.select().from(garages).where(eq(garages.staffJoinCode, joinCode)).limit(1);
    if (!garage) {
      return res.status(404).json({ message: "No workplace found for that code" });
    }

    const email = parsed.data.email.toLowerCase();
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists — sign in instead" });
    }
    const [existingApplication] = await db
      .select()
      .from(staffApplications)
      .where(and(eq(staffApplications.email, email), eq(staffApplications.status, "pending")))
      .limit(1);
    if (existingApplication) {
      return res.status(409).json({ message: "You already have a request waiting for review" });
    }

    const [application] = await db
      .insert(staffApplications)
      .values({
        ...parsed.data,
        email,
        garageId: garage.id,
        passwordHash: await hashPassword(password),
        status: "pending",
      } as any)
      .returning();

    res.status(201).json({
      id: application.id,
      status: "pending",
      businessName: garage.name,
    });
  }),
);

// ─────────────────── Business-side management (admin/manager) ───────────────

const requireBusinessAdmin = [isAuthenticated, requireRole(["ADMIN", "MANAGER"])];

/** The role catalog a business can invite into. */
router.get("/staff/roles", ...requireBusinessAdmin, (_req, res) => {
  res.json(INVITABLE_ROLES);
});

router.get(
  "/staff/invites",
  ...requireBusinessAdmin,
  asyncHandler(async (req: any, res) => {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "No business is linked to this account" });

    const rows = await db
      .select()
      .from(staffInvites)
      .where(eq(staffInvites.garageId, garageId))
      .orderBy(desc(staffInvites.createdAt));

    res.json(rows.map((invite) => ({ ...invite, redeemable: isRedeemable(invite) })));
  }),
);

router.post(
  "/staff/invites",
  ...requireBusinessAdmin,
  asyncHandler(async (req: any, res) => {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "No business is linked to this account" });

    const roleKey = String(req.body?.roleKey ?? "").toUpperCase();
    const mapping = mappingFor(roleKey);
    if (!mapping || roleKey === "OWNER" || roleKey === "SYSTEM_ADMIN") {
      return res.status(400).json({ message: "Choose a role that can be invited" });
    }

    const maxUses = Math.min(Math.max(Number(req.body?.maxUses ?? 1) || 1, 1), 100);
    const expiresInDays = Math.min(Math.max(Number(req.body?.expiresInDays ?? 14) || 14, 1), 90);

    const [invite] = await db
      .insert(staffInvites)
      .values({
        garageId,
        branchId: req.body?.branchId ?? null,
        code: generateCode(8),
        email: req.body?.email ? String(req.body.email).trim().toLowerCase() : null,
        roleKey,
        guardRole: mapping.guardRole,
        userType: mapping.userType,
        maxUses,
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
        createdBy: req.user.id,
      })
      .returning();

    res.status(201).json(invite);
  }),
);

router.post(
  "/staff/invites/:id/revoke",
  ...requireBusinessAdmin,
  asyncHandler(async (req: any, res) => {
    const garageId = req.user?.garageId;
    const [invite] = await db
      .update(staffInvites)
      .set({ revokedAt: new Date() })
      .where(and(eq(staffInvites.id, req.params.id), eq(staffInvites.garageId, garageId)))
      .returning();

    if (!invite) return res.status(404).json({ message: "Invite not found" });
    res.json(invite);
  }),
);

router.get(
  "/staff/applications",
  ...requireBusinessAdmin,
  asyncHandler(async (req: any, res) => {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "No business is linked to this account" });

    const status = typeof req.query.status === "string" ? req.query.status : null;
    const where = status
      ? and(eq(staffApplications.garageId, garageId), eq(staffApplications.status, status))
      : eq(staffApplications.garageId, garageId);

    const rows = await db
      .select()
      .from(staffApplications)
      .where(where)
      .orderBy(desc(staffApplications.createdAt));

    // The stored hash never leaves the server.
    res.json(rows.map(({ passwordHash: _h, ...rest }) => rest));
  }),
);

router.post(
  "/staff/applications/:id/approve",
  ...requireBusinessAdmin,
  asyncHandler(async (req: any, res) => {
    const garageId = req.user?.garageId;
    const [application] = await db
      .select()
      .from(staffApplications)
      .where(and(eq(staffApplications.id, req.params.id), eq(staffApplications.garageId, garageId)))
      .limit(1);

    if (!application) return res.status(404).json({ message: "Request not found" });
    if (application.status !== "pending") {
      return res.status(409).json({ message: `This request was already ${application.status}` });
    }
    if (!application.passwordHash) {
      return res.status(400).json({ message: "This request has no password on file — ask the applicant to re-apply" });
    }

    // The APPROVER picks the role; the applicant's request is only a hint.
    const roleKey = String(req.body?.roleKey ?? application.requestedRoleKey ?? "").toUpperCase();
    const mapping = mappingFor(roleKey);
    if (!mapping || roleKey === "OWNER" || roleKey === "SYSTEM_ADMIN") {
      return res.status(400).json({ message: "Choose a role to grant" });
    }

    const [existing] = await db.select().from(users).where(eq(users.email, application.email)).limit(1);
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const [user] = await db
      .insert(users)
      .values({
        email: application.email,
        password: application.passwordHash,
        fullName: application.fullName,
        phone: application.phone,
        role: mapping.guardRole,
        userType: mapping.userType,
        garageId,
        isActive: true,
      } as any)
      .returning();

    await assignRbacRole(user.id, garageId, roleKey, req.body?.branchId ?? null);

    const [updated] = await db
      .update(staffApplications)
      .set({
        status: "approved",
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        provisionedUserId: user.id,
        updatedAt: new Date(),
      })
      .where(eq(staffApplications.id, application.id))
      .returning();

    const { passwordHash: _h, ...safeApplication } = updated as any;
    res.json({ application: safeApplication, userId: user.id, roleKey });
  }),
);

router.post(
  "/staff/applications/:id/reject",
  ...requireBusinessAdmin,
  asyncHandler(async (req: any, res) => {
    const garageId = req.user?.garageId;
    const [updated] = await db
      .update(staffApplications)
      .set({
        status: "rejected",
        rejectionReason: req.body?.reason ? String(req.body.reason) : null,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(staffApplications.id, req.params.id),
          eq(staffApplications.garageId, garageId),
          eq(staffApplications.status, "pending"),
        ),
      )
      .returning();

    if (!updated) return res.status(404).json({ message: "Pending request not found" });
    const { passwordHash: _h, ...safe } = updated as any;
    res.json(safe);
  }),
);

/** The workplace code staff type on /staff/apply. Created on first read. */
router.get(
  "/staff/join-code",
  ...requireBusinessAdmin,
  asyncHandler(async (req: any, res) => {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "No business is linked to this account" });

    const [garage] = await db.select().from(garages).where(eq(garages.id, garageId)).limit(1);
    if (!garage) return res.status(404).json({ message: "Business not found" });

    if (garage.staffJoinCode) return res.json({ joinCode: garage.staffJoinCode });

    const [updated] = await db
      .update(garages)
      .set({ staffJoinCode: generateCode(6) })
      .where(eq(garages.id, garageId))
      .returning();
    res.json({ joinCode: updated.staffJoinCode });
  }),
);

router.post(
  "/staff/join-code/regenerate",
  ...requireBusinessAdmin,
  asyncHandler(async (req: any, res) => {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "No business is linked to this account" });

    const [updated] = await db
      .update(garages)
      .set({ staffJoinCode: generateCode(6) })
      .where(eq(garages.id, garageId))
      .returning();
    res.json({ joinCode: updated.staffJoinCode });
  }),
);

export const staffAccessRoutes = router;
