import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { getAuditLog, getAuditStats, seedAuditLog } from '../services/audit-trail';

const router = Router();

router.get('/audit/log', isAuthenticated, async (req, res) => {
  const garageId = (req as any).user.garageId;
  const { userId, resource, action, severity, from, to, limit, offset } = req.query;
  const result = await getAuditLog({
    garageId,
    userId: userId as string,
    resource: resource as string,
    action: action as string,
    severity: severity as string,
    from: from as string,
    to: to as string,
    limit: limit ? Number(limit) : 50,
    offset: offset ? Number(offset) : 0,
  });
  res.json(result);
});

router.get('/audit/stats', isAuthenticated, async (req, res) => {
  const garageId = (req as any).user.garageId;
  res.json(await getAuditStats(garageId));
});

router.post('/audit/seed', isAuthenticated, async (req, res) => {
  const garageId = (req as any).user.garageId;
  await seedAuditLog(garageId);
  res.json({ success: true, message: 'Demo audit entries created' });
});

export default router;
