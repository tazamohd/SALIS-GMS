import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { recommendParts } from '../services/parts-recommender';
import { validate } from '../middleware/validate';
import { partsRecommendationSchema } from '../schemas/validation';

const router = Router();

// All routes in this router require an authenticated session.
router.use(isAuthenticated);

router.get('/ai/parts-recommendations', async (req, res) => {
  const garageId = (req as any).user.garageId;
  const { vehicleMake, vehicleModel, vehicleYear, serviceType, description } = req.query;
  try {
    const recommendations = await recommendParts(garageId, {
      vehicleMake: vehicleMake as string,
      vehicleModel: vehicleModel as string,
      vehicleYear: vehicleYear as string,
      serviceType: serviceType as string,
      description: description as string,
    });
    res.json({ recommendations, total: recommendations.length });
  } catch (e) { res.json({ recommendations: [], total: 0 }); }
});

router.post('/ai/parts-recommendations', validate(partsRecommendationSchema), async (req, res) => {
  const garageId = (req as any).user.garageId;
  try {
    const recommendations = await recommendParts(garageId, req.body);
    res.json({ recommendations, total: recommendations.length });
  } catch (e) { res.json({ recommendations: [], total: 0 }); }
});

export default router;
