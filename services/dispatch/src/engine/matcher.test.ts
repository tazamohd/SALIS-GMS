import { describe, it, expect } from "vitest";
import { scoreCandidate, rankCandidates, rankBatch, type Candidate, type Task } from "./matcher";

describe("Dispatch matching engine", () => {
  const candidates: Candidate[] = [
    { id: "1", name: "Ahmed", skills: ["oil_change", "brakes"], currentLoad: 1, maxLoad: 5, available: true, efficiency: 0.9 },
    { id: "2", name: "Mohammed", skills: ["engine", "transmission"], currentLoad: 3, maxLoad: 5, available: true, efficiency: 0.7 },
    { id: "3", name: "Ali", skills: ["oil_change", "ac"], currentLoad: 0, maxLoad: 5, available: false, efficiency: 0.85 },
  ];

  const tasks: Task[] = [
    { id: "t1", type: "job_card", requiredSkills: ["oil_change"], estimatedHours: 1, priority: "high" },
    { id: "t2", type: "job_card", requiredSkills: ["engine"], estimatedHours: 4, priority: "urgent" },
    { id: "t3", type: "job_card", requiredSkills: ["brakes"], estimatedHours: 2, priority: "medium" },
  ];

  it("ranks eligible candidates for a single task", () => {
    const decision = rankCandidates(candidates, tasks[0]);
    expect(decision.best?.candidateId).toBe("1");
  });

  it("excludes unavailable candidates", () => {
    const decision = rankCandidates(candidates, { ...tasks[0], requiredSkills: ["ac"] });
    expect(decision.ranked.find((r) => r.candidateId === "3")).toBeUndefined();
  });

  it("excludes candidates at max load", () => {
    const full: Candidate = { id: "4", name: "Saeed", skills: ["oil_change"], currentLoad: 5, maxLoad: 5, available: true, efficiency: 1 };
    const decision = rankCandidates([...candidates, full], tasks[0]);
    expect(decision.ranked.find((r) => r.candidateId === "4")).toBeUndefined();
  });

  it("returns null best when no candidate is eligible", () => {
    const noneAvailable: Candidate[] = candidates.map((c) => ({ ...c, available: false }));
    const decision = rankCandidates(noneAvailable, tasks[0]);
    expect(decision.best).toBeNull();
    expect(decision.ranked).toHaveLength(0);
  });

  it("assigns all tasks in a batch, urgent first", () => {
    const decisions = rankBatch(candidates, tasks);
    expect(decisions).toHaveLength(3);
    expect(decisions[0].taskId).toBe("t2"); // urgent processed first
  });

  it("increases load as batch assignments accumulate", () => {
    const heavy: Task[] = [
      { id: "a", type: "job_card", requiredSkills: ["oil_change"], estimatedHours: 1, priority: "high" },
      { id: "b", type: "job_card", requiredSkills: ["oil_change"], estimatedHours: 1, priority: "high" },
    ];
    const single: Candidate[] = [
      { id: "1", name: "Ahmed", skills: ["oil_change"], currentLoad: 0, maxLoad: 1, available: true, efficiency: 0.9 },
    ];
    const decisions = rankBatch(single, heavy);
    expect(decisions[0].best?.candidateId).toBe("1");
    expect(decisions[1].best).toBeNull(); // Ahmed now at max load
  });

  it("scores skill match, availability, load, and efficiency independently", () => {
    const perfect: Candidate = { id: "p", name: "Perfect", skills: ["x"], currentLoad: 0, maxLoad: 10, available: true, efficiency: 1 };
    const { score, reasons } = scoreCandidate(perfect, { id: "t", type: "x", requiredSkills: ["x"], estimatedHours: 1, priority: "low" });
    expect(score).toBe(100); // 40 skill + 20 available + 20 load + 20 efficiency
    expect(reasons.length).toBeGreaterThan(0);
  });
});
