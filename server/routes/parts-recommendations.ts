import { Router } from 'express';
import { recommendParts } from '../services/parts-recommender';
import { validate } from '../middleware/validate';
import { partsRecommendationSchema } from '../schemas/validation';

const router = Router();

router.get('/ai/parts-recommendations', async (req, res) => {
  const garageId = (req as any).user?.garageId || '1';
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
  const garageId = (req as any).user?.garageId || '1';
  try {
    const recommendations = await recommendParts(garageId, req.body);
    res.json({ recommendations, total: recommendations.length });
  } catch (e) { res.json({ recommendations: [], total: 0 }); }
});

export default router;
