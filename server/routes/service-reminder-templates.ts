import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/service-reminder-templates', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const templates = await storage.getServiceReminderTemplates(garageId);
    res.json(templates);
  } catch (error: any) {
    console.error('Error fetching reminder templates:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/service-reminder-templates/:id', isAuthenticated, async (req: any, res) => {
  try {
    const template = await storage.getServiceReminderTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    // Tenant scope (audit H-2): garage_id is nullable — a NULL garage means a
    // global/system template visible to everyone. A garaged caller sees only
    // their own garage's templates plus globals; another garage's template 404s.
    // Platform/cross-garage principals have no session garage and see all.
    const sessionGarage = req.user?.garageId;
    if (sessionGarage && template.garageId && template.garageId !== sessionGarage) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  } catch (error: any) {
    console.error('Error fetching template:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
