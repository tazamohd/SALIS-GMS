// Generic candidate/task matching engine. Generalized from the monolith's
// server/services/scheduling-optimizer.ts (garage-job-card-specific) so the
// same scoring logic serves garage jobs, fleet trips, roadside dispatch, and
// future ride-share matching without forking per mini-app.

export interface Candidate {
  id: string;
  name: string;
  skills: string[];
  currentLoad: number; // number of active assignments
  maxLoad: number;
  available: boolean;
  efficiency: number; // 0-1 historical performance rating
}

export interface Task {
  id: string;
  type: string;
  requiredSkills: string[];
  estimatedHours: number;
  priority: "low" | "medium" | "high" | "urgent";
  context?: string; // free-form description surfaced in the rationale
}

export interface ScoredCandidate {
  candidateId: string;
  candidateName: string;
  score: number;
  reasons: string[];
}

export interface Decision {
  taskId: string;
  best: ScoredCandidate | null;
  ranked: ScoredCandidate[];
}

const PRIORITY_ORDER: Record<Task["priority"], number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function scoreCandidate(
  candidate: Candidate,
  task: Task,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Skill match (0-40 points)
  const matchedSkills = task.requiredSkills.filter((s) =>
    candidate.skills.includes(s),
  );
  const skillScore =
    task.requiredSkills.length > 0
      ? (matchedSkills.length / task.requiredSkills.length) * 40
      : 20;
  score += skillScore;
  if (matchedSkills.length > 0) {
    reasons.push(`Skills match: ${matchedSkills.join(", ")}`);
  }

  // Availability (0 or 20 points)
  if (candidate.available) {
    score += 20;
    reasons.push("Available now");
  }

  // Load balance (0-20 points) — prefer less-loaded candidates
  const loadRatio =
    candidate.maxLoad > 0 ? 1 - candidate.currentLoad / candidate.maxLoad : 0;
  const loadScore = loadRatio * 20;
  score += loadScore;
  if (loadRatio > 0.5) reasons.push("Low current workload");

  // Efficiency (0-20 points)
  score += candidate.efficiency * 20;
  if (candidate.efficiency > 0.8) reasons.push("High efficiency rating");

  return { score: Math.round(score), reasons };
}

/**
 * Score every eligible candidate for one task and return the ranked list.
 * Ineligible candidates (unavailable or already at max load) are excluded.
 */
export function rankCandidates(candidates: Candidate[], task: Task): Decision {
  const eligible = candidates.filter(
    (c) => c.available && c.currentLoad < c.maxLoad,
  );

  const ranked = eligible
    .map((c) => {
      const { score, reasons } = scoreCandidate(c, task);
      return { candidateId: c.id, candidateName: c.name, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  return {
    taskId: task.id,
    best: ranked[0] ?? null,
    ranked,
  };
}

/**
 * Batch-assign multiple tasks against a shared candidate pool, respecting
 * priority order and updating load as each task is assigned — mirrors the
 * monolith's optimizeSchedule() for callers that submit a batch.
 */
export function rankBatch(candidates: Candidate[], tasks: Task[]): Decision[] {
  const load = new Map(candidates.map((c) => [c.id, c.currentLoad]));
  const sortedTasks = [...tasks].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );

  const decisions: Decision[] = [];
  for (const task of sortedTasks) {
    const liveCandidates = candidates.map((c) => ({
      ...c,
      currentLoad: load.get(c.id) ?? c.currentLoad,
    }));
    const decision = rankCandidates(liveCandidates, task);
    decisions.push(decision);
    if (decision.best) {
      load.set(decision.best.candidateId, (load.get(decision.best.candidateId) ?? 0) + 1);
    }
  }
  return decisions;
}
