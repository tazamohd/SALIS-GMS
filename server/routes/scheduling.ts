import { Router } from 'express';
import { isAuthenticated } from '../auth';
import * as phase5Service from '../phase5-operations-service';

const router = Router();

function parseLimit(limit: unknown, fallback: number) {
  if (typeof limit !== 'string') {
    return fallback;
  }

  const parsed = Number.parseInt(limit, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** The optimizer's built-in rule set, returned until a garage stores its own
 *  overrides in ai_scheduling_rules. */
const DEFAULT_SCHEDULING_RULES = [
  {
    id: 'default-skills',
    name: 'Match technician skills to job type',
    priority: 1,
    considerTechnicianSkills: true,
    isActive: true,
    isDefault: true,
  },
  {
    id: 'default-workload',
    name: 'Balance workload across technicians',
    priority: 2,
    considerTechnicianWorkload: true,
    maxJobsPerTechnician: 5,
    isActive: true,
    isDefault: true,
  },
  {
    id: 'default-parts',
    name: 'Only schedule when required parts are available',
    priority: 3,
    considerPartAvailability: true,
    isActive: true,
    isDefault: true,
  },
  {
    id: 'default-buffer',
    name: 'Keep a buffer between consecutive jobs',
    priority: 4,
    bufferTimeBetweenJobs: 15,
    isActive: true,
    isDefault: true,
  },
];

router.get('/scheduling/rules', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const rules = await phase5Service.getSchedulingRules(garageId);
    // A garage with no stored rules still runs the optimizer on the built-in
    // catalog, so that is what this endpoint reports.
    res.json(rules.length > 0 ? rules : DEFAULT_SCHEDULING_RULES);
  } catch (error) {
    console.error('Error fetching scheduling rules:', error);
    res.status(500).json({ message: 'Failed to fetch scheduling rules' });
  }
});

router.get('/scheduling/history', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { limit } = req.query;
    const history = await phase5Service.getSchedulingHistory(garageId, parseLimit(limit, 30));
    res.json(history);
  } catch (error) {
    console.error('Error fetching scheduling history:', error);
    res.status(500).json({ message: 'Failed to fetch scheduling history' });
  }
});

router.get('/scheduling/optimizations', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { limit } = req.query;
    const optimizations = await phase5Service.getSchedulingHistory(garageId, parseLimit(limit, 30));
    res.json(optimizations);
  } catch (error) {
    console.error('Error fetching scheduling optimizations:', error);
    res.status(500).json({ message: 'Failed to fetch scheduling optimizations' });
  }
});

export default router;
