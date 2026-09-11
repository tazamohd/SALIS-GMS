// Client for the extracted Dispatch service (services/dispatch). Wraps every
// call in a timeout + a single retry + a circuit breaker, with a local
// fallback to the monolith's own scoring so callers never hard-fail on a
// Dispatch outage during the strangler-fig migration. See
// docs/02-technical/adr/ADR-001-dispatch-service-extraction.md.
import { randomUUID } from "crypto";
import { CircuitBreaker } from "../lib/circuitBreaker";
import { optimizeSchedule } from "../services/scheduling-optimizer";

export interface DispatchCandidate {
  id: string;
  name: string;
  skills: string[];
  currentLoad: number;
  maxLoad: number;
  available: boolean;
  efficiency: number;
}

export interface DispatchTaskInput {
  entityType: string; // job_card | fleet_trip | roadside_call | ride
  entityId: string;
  taskType: string;
  requiredSkills: string[];
  estimatedHours?: number;
  priority: "low" | "medium" | "high" | "urgent";
  candidates: DispatchCandidate[];
}

export interface DispatchScoredCandidate {
  candidateId: string;
  candidateName: string;
  score: number;
  reasons: string[];
}

export interface DispatchResult {
  requestId: string | null;
  best: DispatchScoredCandidate | null;
  ranked: DispatchScoredCandidate[];
  source: "dispatch-service" | "local-fallback";
}

const DISPATCH_BASE_URL = process.env.DISPATCH_SERVICE_URL || "http://localhost:4100";
const REQUEST_TIMEOUT_MS = 2_000;
const MAX_RETRIES = 1;

const breaker = new CircuitBreaker(5, 30_000);

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callDispatchService(
  task: DispatchTaskInput,
  correlationId: string,
): Promise<DispatchResult> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(
        `${DISPATCH_BASE_URL}/v1/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-correlation-id": correlationId,
          },
          body: JSON.stringify(task),
        },
        REQUEST_TIMEOUT_MS,
      );

      if (!res.ok) {
        throw new Error(`Dispatch service returned ${res.status}`);
      }

      const body = (await res.json()) as {
        requestId: string;
        best: DispatchScoredCandidate | null;
        ranked: DispatchScoredCandidate[];
      };

      return {
        requestId: body.requestId,
        best: body.best,
        ranked: body.ranked,
        source: "dispatch-service",
      };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

/**
 * Local fallback: run the monolith's own (pre-extraction) scoring so a
 * Dispatch outage never blocks a fleet/garage operation. Runs the same
 * skills/availability/load/efficiency math, just in-process.
 */
function localFallback(task: DispatchTaskInput): DispatchResult {
  const technicians = task.candidates.map((c) => ({
    id: c.id,
    name: c.name,
    skills: c.skills,
    currentLoad: c.currentLoad,
    maxLoad: c.maxLoad,
    availability: c.available,
    efficiency: c.efficiency,
  }));

  const assignments = optimizeSchedule(technicians, [
    {
      id: task.entityId,
      type: task.taskType,
      requiredSkills: task.requiredSkills,
      estimatedHours: task.estimatedHours ?? 0,
      priority: task.priority,
      vehicleInfo: "",
    },
  ]);

  const match = assignments[0];
  return {
    requestId: null,
    best: match
      ? {
          candidateId: match.technicianId,
          candidateName: match.technicianName,
          score: match.score,
          reasons: match.reasons,
        }
      : null,
    ranked: match
      ? [
          {
            candidateId: match.technicianId,
            candidateName: match.technicianName,
            score: match.score,
            reasons: match.reasons,
          },
        ]
      : [],
    source: "local-fallback",
  };
}

export async function requestAssignment(
  task: DispatchTaskInput,
  correlationId: string = randomUUID(),
): Promise<DispatchResult> {
  try {
    return await breaker.exec(() => callDispatchService(task, correlationId));
  } catch (err) {
    console.warn(
      `[dispatchClient] falling back to local scoring (correlationId=${correlationId}):`,
      err instanceof Error ? err.message : err,
    );
    return localFallback(task);
  }
}
