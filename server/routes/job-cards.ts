import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { jobCardParts } from '@shared/schema';
import { isAuthenticated } from '../auth';
import { db } from '../db';
import { storage } from '../storage';
import { parsePagination, sendPaginated } from './pagination';

const router = Router();

router.get('/job-cards', isAuthenticated, async (req, res) => {
  try {
    const { garage_id, assigned_to } = req.query;
    const pagination = parsePagination(req);
    // Session garage wins; ?garage_id only serves garageless sessions.
    const gid = (req.user as any)?.garageId || (garage_id as string);
    const assignedTo = assigned_to as string | undefined;
    const [data, total] = await Promise.all([
      storage.getJobCardsPaginated(gid, assignedTo, pagination.limit, pagination.offset),
      storage.countJobCards(gid, assignedTo),
    ]);
    sendPaginated(res, data, total, pagination, pagination.explicit);
  } catch (error) {
    console.error('Error fetching job cards:', error);
    res.status(500).json({ message: 'Failed to fetch job cards' });
  }
});

router.get('/job-cards/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const jobCard = await storage.getJobCard(id);
    if (!jobCard) {
      return res.status(404).json({ message: 'Job card not found' });
    }
    // Ownership check: a caller with a garage may only read records of that
    // garage (404, not 403, to avoid confirming the record exists).
    const sessionGarage = (req.user as any)?.garageId;
    if (sessionGarage && jobCard.garageId && jobCard.garageId !== sessionGarage) {
      return res.status(404).json({ message: 'Job card not found' });
    }
    res.json(jobCard);
  } catch (error) {
    console.error('Error fetching job card:', error);
    res.status(500).json({ message: 'Failed to fetch job card' });
  }
});

router.get('/job-cards/:id/details', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const jobCardDetails = await storage.getJobCardWithDetails(id);
    if (!jobCardDetails) {
      return res.status(404).json({ message: 'Job card not found' });
    }
    // Ownership check: a caller with a garage may only read records of that
    // garage (404, not 403, to avoid confirming the record exists).
    const sessionGarage = (req.user as any)?.garageId;
    if (sessionGarage && jobCardDetails.garageId && jobCardDetails.garageId !== sessionGarage) {
      return res.status(404).json({ message: 'Job card not found' });
    }
    res.json(jobCardDetails);
  } catch (error) {
    console.error('Error fetching job card details:', error);
    res.status(500).json({ message: 'Failed to fetch job card details' });
  }
});

router.get('/job-cards/:jobCardId/parts', isAuthenticated, async (req, res) => {
  try {
    const { jobCardId } = req.params;
    const parts = await db.select().from(jobCardParts).where(eq(jobCardParts.jobCardId, jobCardId));
    res.json(parts);
  } catch (error) {
    console.error('Error fetching job card parts:', error);
    res.status(500).json({ message: 'Failed to fetch job card parts' });
  }
});

router.get('/job-cards/:jobCardId/tasks', isAuthenticated, async (req, res) => {
  try {
    const { jobCardId } = req.params;
    const tasks = await storage.getTaskAssignments(jobCardId);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching task assignments:', error);
    res.status(500).json({ message: 'Failed to fetch task assignments' });
  }
});

export default router;
