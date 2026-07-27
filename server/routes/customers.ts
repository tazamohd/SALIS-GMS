import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { parsePagination, sendPaginated } from './pagination';

const router = Router();

router.get('/customers', isAuthenticated, async (req, res) => {
  try {
    const { garage_id, search } = req.query;
    const pagination = parsePagination(req);
    // If a search query is present, use the scoped search method (with implicit small limit).
    // Otherwise return a paginated list. (SA-017)
    if (search && typeof search === 'string' && search.length >= 2) {
      const searchPattern = `%${search.toLowerCase()}%`;
      // Pin to the caller's garage; honor ?garage_id only when the session
      // has none (platform admins). The reverse order let any tenant read
      // another garage's customers by forging the query param.
      const results = await storage.searchCustomers(
        (req.user as any)?.garageId || (garage_id as string),
        searchPattern,
        pagination.limit,
      );
      return sendPaginated(res, results, results.length, pagination, pagination.explicit);
    }
    const garageId = (req.user as any)?.garageId || (garage_id as string);
    const [data, total] = await Promise.all([
      storage.getCustomersPaginated(garageId, pagination.limit, pagination.offset),
      storage.countCustomers(garageId),
    ]);
    sendPaginated(res, data, total, pagination, pagination.explicit);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

router.get('/customers/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await storage.getCustomer(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Failed to fetch customer' });
  }
});

router.get('/customers/:id/vehicles', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const vehicles = await storage.getCustomerVehicles(id);
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching customer vehicles:', error);
    res.status(500).json({ message: 'Failed to fetch customer vehicles' });
  }
});

router.get('/customers/:id/job-cards', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const jobCards = await storage.getCustomerJobCards(id);
    res.json(jobCards);
  } catch (error) {
    console.error('Error fetching customer job cards:', error);
    res.status(500).json({ message: 'Failed to fetch customer job cards' });
  }
});

router.get('/customers/:id/invoices', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const invoices = await storage.getCustomerInvoices(id);
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching customer invoices:', error);
    res.status(500).json({ message: 'Failed to fetch customer invoices' });
  }
});

router.get('/customers/:id/payments', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const payments = await storage.getCustomerPayments(id);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching customer payments:', error);
    res.status(500).json({ message: 'Failed to fetch customer payments' });
  }
});

router.get('/customers/:id/notes', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const notes = await storage.getCustomerNotes(id);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching customer notes:', error);
    res.status(500).json({ message: 'Failed to fetch customer notes' });
  }
});

router.get('/customers/:customerId/service-reminders', isAuthenticated, async (req, res) => {
  try {
    const { customerId } = req.params;
    const reminders = await storage.getCustomerServiceReminders(customerId);
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching service reminders:', error);
    res.status(500).json({ message: 'Failed to fetch service reminders' });
  }
});

router.get('/customers/:customerId/reviews', isAuthenticated, async (req, res) => {
  try {
    const { customerId } = req.params;
    const reviews = await storage.getCustomerServiceReviews(customerId);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching service reviews:', error);
    res.status(500).json({ message: 'Failed to fetch service reviews' });
  }
});

router.get('/customers/:customerId/signatures', isAuthenticated, async (req, res) => {
  try {
    const { customerId } = req.params;
    const signatures = await storage.getCustomerServiceSignatures(customerId);
    res.json(signatures);
  } catch (error) {
    console.error('Error fetching service signatures:', error);
    res.status(500).json({ message: 'Failed to fetch service signatures' });
  }
});

export default router;
