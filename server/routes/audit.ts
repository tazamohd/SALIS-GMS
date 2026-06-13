import { Router } from 'express';
import { getAuditLog, getAuditStats, seedAuditLog } from '../services/audit-trail';

const router = Router();

router.get('/audit/log', async (req, res) => {
  const garageId = (req as any).user?.garageId;
  if (!garageId) return res.status(403).json({ message: 'Garage context required' });
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

router.get('/audit/stats', async (req, res) => {
  const garageId = (req as any).user?.garageId;
  if (!garageId) return res.status(403).json({ message: 'Garage context required' });
  res.json(await getAuditStats(garageId));
});

router.post('/audit/seed', async (req, res) => {
  const garageId = (req as any).user?.garageId;
  if (!garageId) return res.status(403).json({ message: 'Garage context required' });
  await seedAuditLog(garageId);
  res.json({ success: true, message: 'Demo audit entries created' });
});

export default router;
