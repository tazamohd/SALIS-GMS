import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/service-templates/all', isAuthenticated, async (_req, res) => {
  try {
    const allTemplates = await storage.getAllServiceTemplates();
    res.json(allTemplates);
  } catch (error) {
    console.error('Error fetching all service templates:', error);
    res.status(500).json({ message: 'Failed to fetch service templates' });
  }
});

router.get('/service-templates', isAuthenticated, async (req, res) => {
  try {
    const { garage_id } = req.query;
    if (!garage_id) {
      return res.status(400).json({ message: 'garage_id is required' });
    }
    const templates = await storage.getServiceTemplates(garage_id as string);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching service templates:', error);
    res.status(500).json({ message: 'Failed to fetch service templates' });
  }
});

router.get('/service-templates/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const template = await storage.getServiceTemplate(id);
    if (!template) {
      return res.status(404).json({ message: 'Service template not found' });
    }
    res.json(template);
  } catch (error) {
    console.error('Error fetching service template:', error);
    res.status(500).json({ message: 'Failed to fetch service template' });
  }
});

export default router;
