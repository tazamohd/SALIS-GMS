import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/tools', isAuthenticated, async (req, res) => {
  try {
    const { garage_id, is_global } = req.query;
    const tools = await storage.getTools(
      garage_id as string,
      is_global === 'true',
    );
    res.json(tools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ message: 'Failed to fetch tools' });
  }
});

router.get('/tools/:toolId/usage', isAuthenticated, async (req, res) => {
  try {
    const { toolId } = req.params;
    const usageLogs = await storage.getToolUsageLogs(toolId);
    res.json(usageLogs);
  } catch (error) {
    console.error('Error fetching tool usage logs:', error);
    res.status(500).json({ message: 'Failed to fetch tool usage logs' });
  }
});

router.get('/tools/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const tool = await storage.getTool(id);
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    res.json(tool);
  } catch (error) {
    console.error('Error fetching tool:', error);
    res.status(500).json({ message: 'Failed to fetch tool' });
  }
});

router.get('/tool-availability', isAuthenticated, async (req, res) => {
  try {
    const { garage_id, tool_id } = req.query;
    if (!garage_id) {
      return res.status(400).json({ message: 'garage_id is required' });
    }
    const availability = await storage.getToolAvailability(
      garage_id as string,
      tool_id as string,
    );
    res.json(availability);
  } catch (error) {
    console.error('Error fetching tool availability:', error);
    res.status(500).json({ message: 'Failed to fetch tool availability' });
  }
});

export default router;
