/**
 * Business profile & guided setup.
 *
 * Everything a newly-approved business needs to make the platform look and
 * print like *their* business: identity, official identifiers, branding, and
 * document/print preferences — plus the cursor that lets the guided setup be
 * left and resumed.
 *
 * Tenancy: the garage always comes from the session, never the body, so an
 * admin can only ever edit their own business.
 */
import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { garages } from "@shared/schema";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

const requireBusinessAdmin = [isAuthenticated, requireRole(["ADMIN", "MANAGER"])];

/** The ordered steps of the guided setup; the client renders them in order. */
export const ONBOARDING_STEPS = [
  "identity",
  "branding",
  "documents",
  "operations",
  "integrations",
  "import",
] as const;

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * Editable business profile. Deliberately narrow: plan, activation state,
 * business type and the join code are NOT settable here — they are decided by
 * onboarding/approval and by the platform admin.
 */
const profileSchema = z.object({
  name: z.string().trim().min(2).max(255).optional(),
  description: z.string().trim().max(2000).nullish(),
  phone: z.string().trim().max(50).nullish(),
  email: z.string().trim().email().max(255).nullish(),
  address: z.string().trim().max(1000).nullish(),
  city: z.string().trim().max(100).nullish(),
  country: z.string().trim().max(100).nullish(),
  workingHours: z.string().trim().max(255).nullish(),
  // Official identifiers — printed on tax invoices, so format-checked here the
  // same way the signup verification checks them.
  taxNumber: z.string().trim().regex(/^3\d{14}$/, "VAT number must be 15 digits starting with 3").nullish(),
  commercialRegistration: z.string().trim().regex(/^\d{10}$/, "Commercial registration must be 10 digits").nullish(),
  // Branding.
  logoUrl: z.string().trim().max(2000).nullish(),
  photoUrl: z.string().trim().max(2000).nullish(),
  brandPrimaryColor: z.string().trim().regex(HEX_COLOR, "Use a hex colour like #0A5ED7").nullish(),
  brandSecondaryColor: z.string().trim().regex(HEX_COLOR, "Use a hex colour like #0BB3FF").nullish(),
  // Print/document preferences. Free-form by design (paper size, footer, terms,
  // template id, which blocks to show) but bounded so it cannot become a dump.
  invoiceSettings: z
    .object({
      template: z.enum(["classic", "compact", "modern"]).optional(),
      paperSize: z.enum(["A4", "A5", "LETTER", "THERMAL_80"]).optional(),
      showLogo: z.boolean().optional(),
      showQrCode: z.boolean().optional(),
      footerText: z.string().max(500).optional(),
      termsText: z.string().max(2000).optional(),
      invoicePrefix: z.string().max(10).optional(),
      quotePrefix: z.string().max(10).optional(),
    })
    .nullish(),
});

/** The current business profile plus where the guided setup stands. */
router.get(
  "/business/profile",
  ...requireBusinessAdmin,
  asyncHandler(async (req: any, res) => {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "No business is linked to this account" });

    const [garage] = await db.select().from(garages).where(eq(garages.id, garageId)).limit(1);
    if (!garage) return res.status(404).json({ message: "Business not found" });

    res.json({
      ...garage,
      steps: ONBOARDING_STEPS,
      onboardingComplete: garage.onboardingCompletedAt != null,
    });
  }),
);

router.patch(
  "/business/profile",
  ...requireBusinessAdmin,
  asyncHandler(async (req: any, res) => {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "No business is linked to this account" });

    const parsed = profileSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Please check the form",
        errors: parsed.error.issues,
      });
    }
    // A PATCH with nothing recognisable should not silently succeed.
    const updates = Object.fromEntries(
      Object.entries(parsed.data).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const [updated] = await db.update(garages).set(updates).where(eq(garages.id, garageId)).returning();
    res.json(updated);
  }),
);

/** Save the guided-setup cursor so the wizard can be resumed later. */
router.post(
  "/business/onboarding/step",
  ...requireBusinessAdmin,
  asyncHandler(async (req: any, res) => {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "No business is linked to this account" });

    const step = String(req.body?.step ?? "");
    if (!(ONBOARDING_STEPS as readonly string[]).includes(step)) {
      return res.status(400).json({ message: "Unknown setup step" });
    }

    const [updated] = await db
      .update(garages)
      .set({ onboardingStep: step })
      .where(eq(garages.id, garageId))
      .returning();
    res.json({ onboardingStep: updated.onboardingStep });
  }),
);

router.post(
  "/business/onboarding/complete",
  ...requireBusinessAdmin,
  asyncHandler(async (req: any, res) => {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "No business is linked to this account" });

    const [updated] = await db
      .update(garages)
      .set({ onboardingCompletedAt: new Date(), onboardingStep: null })
      .where(eq(garages.id, garageId))
      .returning();
    res.json({ onboardingComplete: updated.onboardingCompletedAt != null });
  }),
);

export const businessOnboardingRoutes = router;
