import express from "express";
import { correlationMiddleware } from "./middleware/correlation";
import { assignmentsRouter } from "./routes/assignments";
import { checkDbHealth } from "./db";

const app = express();
const port = Number(process.env.PORT) || 4100;

app.use(express.json());
app.use(correlationMiddleware);

// Liveness: process is up. Readiness: DB is reachable. See ADR-001 /
// k8s/dispatch manifests for how these are wired as probes.
app.get("/health/live", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/health/ready", async (_req, res) => {
  const dbOk = await checkDbHealth();
  if (!dbOk) {
    res.status(503).json({ status: "not_ready", db: false });
    return;
  }
  res.status(200).json({ status: "ready", db: true });
});

app.use(assignmentsRouter);

app.listen(port, () => {
  console.log(`[dispatch] listening on :${port}`);
});

export { app };
