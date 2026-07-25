/**
 * AI Repair Guide — backs POST /api/ai/repair-guide.
 * Generates a step-by-step repair plan for a given vehicle + guide name.
 *
 * - If AI_INTEGRATIONS_OPENAI_API_KEY is set: uses gpt-5 with JSON response format.
 * - Otherwise: returns a deterministic preset for the 6 known guide names.
 *
 * Response shape consumed by ARRepairGuide.tsx:
 *   { vehicleInfo: string, steps: Array<{ id, title, description, completed: false }> }
 */
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { requirePlan } from "../middleware/requirePlan";
import { openai, AI_MODEL } from "../ai";

const router = Router();

const reqSchema = z.object({
  vehicleId: z.union([z.string(), z.number()]).transform(String),
  guide: z.string().min(1),
});

const PRESETS: Record<string, Array<{ title: string; description: string }>> = {
  "Oil Change": [
    { title: "Safety Check", description: "Park on level ground, engage parking brake, allow engine to cool." },
    { title: "Locate Drain Plug", description: "Position drain pan; locate oil pan drain plug under engine." },
    { title: "Drain Old Oil", description: "Loosen plug with socket; allow oil to fully drain (~10 min)." },
    { title: "Remove Old Filter", description: "Use filter wrench to remove old oil filter; have rag ready for spills." },
    { title: "Install New Filter", description: "Apply fresh oil to new filter gasket; hand-tighten the new filter." },
    { title: "Replace Drain Plug", description: "Reinstall plug with new crush washer; torque to manufacturer spec." },
    { title: "Add Fresh Oil", description: "Pour the correct grade and quantity through oil filler cap." },
    { title: "Check Level", description: "Run engine 30 s; verify level on dipstick; top up if needed." },
  ],
  "Brake Replacement": [
    { title: "Safety Check", description: "Loosen lug nuts; jack vehicle; secure with stands." },
    { title: "Remove Wheel", description: "Remove lug nuts and wheel to access brake assembly." },
    { title: "Remove Caliper", description: "Remove caliper bolts; suspend caliper to avoid hose strain." },
    { title: "Replace Pads", description: "Slide out old pads; compress caliper piston; install new pads." },
    { title: "Inspect Rotor", description: "Check rotor for grooves or warping; replace if out of spec." },
    { title: "Reassemble", description: "Reattach caliper, reinstall wheel, torque lugs to spec." },
    { title: "Bed-In Pads", description: "Test brakes at low speed; perform manufacturer bedding procedure." },
  ],
  "Air Filter Replacement": [
    { title: "Locate Airbox", description: "Open hood and find the engine air filter housing." },
    { title: "Open Housing", description: "Release clips or screws securing the airbox lid." },
    { title: "Remove Old Filter", description: "Lift out the dirty filter; inspect for debris in housing." },
    { title: "Install New Filter", description: "Place new filter with correct orientation arrow." },
    { title: "Close Housing", description: "Reseat lid and re-secure all clips/screws." },
  ],
  "Battery Replacement": [
    { title: "Safety Check", description: "Wear gloves; ensure ignition is off; note radio code if needed." },
    { title: "Disconnect Negative", description: "Loosen and remove the negative (−) terminal first." },
    { title: "Disconnect Positive", description: "Loosen and remove the positive (+) terminal." },
    { title: "Remove Old Battery", description: "Unbolt hold-down clamp; lift battery out carefully." },
    { title: "Install New Battery", description: "Set new battery; reinstall hold-down clamp." },
    { title: "Reconnect Positive then Negative", description: "Attach positive (+) first, then negative (−); tighten." },
    { title: "Verify", description: "Start engine; check warning lights; reset clock if needed." },
  ],
  "Tire Rotation": [
    { title: "Loosen Lugs", description: "Crack each lug nut while wheels are still on ground." },
    { title: "Lift Vehicle", description: "Jack vehicle; support all four corners with stands." },
    { title: "Remove Wheels", description: "Fully remove lug nuts and pull each wheel." },
    { title: "Rotate Pattern", description: "Move tires per manufacturer pattern (e.g. rearward cross)." },
    { title: "Reinstall", description: "Mount tires; hand-tighten lugs; lower vehicle." },
    { title: "Torque Lugs", description: "Final-torque each lug nut in a star pattern to spec." },
  ],
  "Spark Plug Replacement": [
    { title: "Cool Engine", description: "Ensure engine is fully cold to avoid head damage." },
    { title: "Remove Coil/Wire", description: "Unclip coil pack or pull plug wire from each plug." },
    { title: "Remove Old Plug", description: "Use spark plug socket to back out each old plug." },
    { title: "Gap New Plug", description: "Verify gap with gauge; adjust to spec if needed." },
    { title: "Install New Plug", description: "Thread by hand; torque to spec; avoid overtightening." },
    { title: "Reassemble", description: "Refit coil pack or plug wire; repeat for remaining cylinders." },
    { title: "Verify", description: "Start engine; confirm smooth idle and no misfire codes." },
  ],
};

function fallbackSteps(guide: string) {
  const key = Object.keys(PRESETS).find(k => k.toLowerCase() === guide.toLowerCase()) || "Oil Change";
  return PRESETS[key].map((s, idx) => ({
    id: idx + 1,
    title: s.title,
    description: s.description,
    completed: false,
  }));
}

router.post("/ai/repair-guide", isAuthenticated, requirePlan("ENTERPRISE"), async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });

  const parsed = reqSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid request", errors: parsed.error.flatten() });

  let vehicleInfo = "Vehicle";
  try {
    const vehicle: any = await storage.getVehicle(parsed.data.vehicleId);
    if (vehicle) {
      vehicleInfo = `${vehicle.year ?? ""} ${vehicle.make ?? ""} ${vehicle.model ?? ""}`.trim() || "Vehicle";
    }
  } catch {
    /* non-fatal — fall through with generic vehicleInfo */
  }

  // Graceful fallback when no AI integration key is configured
  if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return res.json({
      vehicleInfo,
      steps: fallbackSteps(parsed.data.guide),
      source: "preset",
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert automotive technician. Produce a JSON object with key `steps` containing an ordered array of 5-10 repair steps. Each step has `id` (number), `title` (short imperative), and `description` (one sentence). Be specific to the vehicle and procedure. Respond with ONLY valid JSON.",
        },
        {
          role: "user",
          content: `Vehicle: ${vehicleInfo}\nRepair procedure: ${parsed.data.guide}`,
        },
      ],
      max_completion_tokens: 1500,
    });
    const raw = completion.choices[0]?.message?.content?.trim() || "{}";
    const parsedJson = JSON.parse(raw);
    const aiSteps = Array.isArray(parsedJson.steps) ? parsedJson.steps : [];
    const steps = aiSteps.length
      ? aiSteps.map((s: any, idx: number) => ({
          id: Number(s.id ?? idx + 1),
          title: String(s.title ?? "Step"),
          description: String(s.description ?? ""),
          completed: false,
        }))
      : fallbackSteps(parsed.data.guide);
    res.json({ vehicleInfo, steps, source: "ai" });
  } catch (err) {
    console.error("[ai/repair-guide] LLM error, falling back:", err);
    res.json({ vehicleInfo, steps: fallbackSteps(parsed.data.guide), source: "preset" });
  }
});

export const aiRepairGuideRoutes = router;
