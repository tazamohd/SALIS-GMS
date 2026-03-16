interface Technician {
  id: string;
  name: string;
  skills: string[];
  currentLoad: number; // number of active jobs
  maxLoad: number;
  availability: boolean;
  efficiency: number; // 0-1 rating based on history
}

interface Job {
  id: string;
  type: string;
  requiredSkills: string[];
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  vehicleInfo: string;
}

interface Assignment {
  jobId: string;
  technicianId: string;
  technicianName: string;
  score: number;
  reasons: string[];
}

// Score a technician for a job based on skills match, availability, load, and efficiency
function scoreTechnician(tech: Technician, job: Job): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Skill match (0-40 points)
  const matchedSkills = job.requiredSkills.filter(s => tech.skills.includes(s));
  const skillScore = job.requiredSkills.length > 0 ? (matchedSkills.length / job.requiredSkills.length) * 40 : 20;
  score += skillScore;
  if (matchedSkills.length > 0) reasons.push(`Skills match: ${matchedSkills.join(', ')}`);

  // Availability (0 or 20 points)
  if (tech.availability) { score += 20; reasons.push('Available now'); }

  // Load balance (0-20 points) - prefer less loaded technicians
  const loadRatio = tech.maxLoad > 0 ? 1 - (tech.currentLoad / tech.maxLoad) : 0;
  const loadScore = loadRatio * 20;
  score += loadScore;
  if (loadRatio > 0.5) reasons.push('Low current workload');

  // Efficiency (0-20 points)
  score += tech.efficiency * 20;
  if (tech.efficiency > 0.8) reasons.push('High efficiency rating');

  return { score: Math.round(score), reasons };
}

// Optimize assignments for a list of unassigned jobs
export function optimizeSchedule(technicians: Technician[], jobs: Job[]): Assignment[] {
  const assignments: Assignment[] = [];
  const techLoad = new Map(technicians.map(t => [t.id, t.currentLoad]));

  // Sort jobs by priority (urgent first)
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const sortedJobs = [...jobs].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  for (const job of sortedJobs) {
    const scores = technicians
      .filter(t => t.availability && (techLoad.get(t.id) || 0) < t.maxLoad)
      .map(t => {
        const currentTech = { ...t, currentLoad: techLoad.get(t.id) || 0 };
        const { score, reasons } = scoreTechnician(currentTech, job);
        return { techId: t.id, techName: t.name, score, reasons };
      })
      .sort((a, b) => b.score - a.score);

    if (scores.length > 0) {
      const best = scores[0];
      assignments.push({
        jobId: job.id,
        technicianId: best.techId,
        technicianName: best.techName,
        score: best.score,
        reasons: best.reasons,
      });
      techLoad.set(best.techId, (techLoad.get(best.techId) || 0) + 1);
    }
  }

  return assignments;
}

// Generate schedule optimization report
export function generateScheduleReport(technicians: Technician[], assignments: Assignment[]) {
  const techAssignments = new Map<string, number>();
  assignments.forEach(a => {
    techAssignments.set(a.technicianId, (techAssignments.get(a.technicianId) || 0) + 1);
  });

  return {
    totalJobs: assignments.length,
    averageScore: assignments.length > 0 ? Math.round(assignments.reduce((s, a) => s + a.score, 0) / assignments.length) : 0,
    technicianUtilization: technicians.map(t => ({
      id: t.id,
      name: t.name,
      assignedJobs: techAssignments.get(t.id) || 0,
      currentLoad: t.currentLoad,
      maxLoad: t.maxLoad,
      utilization: Math.round(((t.currentLoad + (techAssignments.get(t.id) || 0)) / t.maxLoad) * 100),
    })),
    unassignedJobs: 0,
  };
}
