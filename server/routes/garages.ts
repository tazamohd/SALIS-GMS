import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { parsePagination, sendPaginated } from './pagination';

const router = Router();

router.get('/garages', isAuthenticated, async (req, res) => {
  try {
    const pagination = parsePagination(req);
    const [data, total] = await Promise.all([
      storage.getGaragesPaginated(pagination.limit, pagination.offset),
      storage.countGarages(),
    ]);
    sendPaginated(res, data, total, pagination, pagination.explicit);
  } catch (error) {
    console.error('Error fetching garages:', error);
    res.status(500).json({ message: 'Failed to fetch garages' });
  }
});

router.get('/garages/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const garage = await storage.getGarageById(id);
    if (!garage) {
      return res.status(404).json({ message: 'Garage not found' });
    }
    res.json(garage);
  } catch (error) {
    console.error('Error fetching garage:', error);
    res.status(500).json({ message: 'Failed to fetch garage' });
  }
});

router.get('/garages/:id/branches', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const branches = await storage.getBranchesByGarageId(id);
    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ message: 'Failed to fetch branches' });
  }
});

router.get('/roles', isAuthenticated, async (_req, res) => {
  try {
    const roles = await storage.getRoles();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
});

router.get('/user/:id/roles', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userRoles = await storage.getUserRoles(id);
    res.json(userRoles);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    res.status(500).json({ message: 'Failed to fetch user roles' });
  }
});

export default router;
