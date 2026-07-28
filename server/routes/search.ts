import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

type SearchResult = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  href: string;
};

const router = Router();

router.get('/search', isAuthenticated, async (req: any, res) => {
  try {
    const rawQuery = req.query.q;
    const query = typeof rawQuery === 'string' ? rawQuery.toLowerCase().trim() : '';
    if (query.length < 2) {
      return res.json([]);
    }

    const userGarageId = req.user?.garageId || req.user?.garage_id;
    if (!userGarageId) {
      return res.status(400).json({ message: 'User has no garage assigned' });
    }

    const results: SearchResult[] = [];
    const limit = 5;
    const searchPattern = `%${query}%`;

    const matchingCustomers = await storage.searchCustomers(userGarageId, searchPattern, limit);
    matchingCustomers.forEach((customer: any) => {
      results.push({
        id: customer.id,
        type: 'customer',
        title: customer.fullName || customer.email,
        subtitle: customer.phone || customer.email,
        href: `/customers?id=${customer.id}`,
      });
    });

    const matchingVehicles = await storage.searchVehicles(userGarageId, searchPattern, limit);
    matchingVehicles.forEach((vehicle: any) => {
      results.push({
        id: vehicle.id,
        type: 'vehicle',
        title: `${vehicle.make} ${vehicle.model} (${vehicle.year || ''})`,
        subtitle: vehicle.licensePlate || vehicle.vin || 'No plate',
        href: `/vehicles?id=${vehicle.id}`,
      });
    });

    const matchingParts = await storage.searchParts(userGarageId, searchPattern, limit);
    matchingParts.forEach((part: any) => {
      results.push({
        id: part.id,
        type: 'part',
        title: part.name || part.partNumber,
        subtitle: `${part.partNumber} - $${part.unitPrice || 0}`,
        href: `/inventory-management?id=${part.id}`,
      });
    });

    const matchingInvoices = await storage.searchInvoices(userGarageId, searchPattern, limit);
    matchingInvoices.forEach((invoice: any) => {
      results.push({
        id: invoice.id,
        type: 'invoice',
        title: invoice.invoiceNumber || `Invoice #${invoice.id.substring(0, 8)}`,
        subtitle: `$${invoice.totalAmount || 0} - ${invoice.status}`,
        href: `/invoices?id=${invoice.id}`,
      });
    });

    const matchingJobCards = await storage.searchJobCards(userGarageId, searchPattern, limit);
    matchingJobCards.forEach((jobCard: any) => {
      const vehicleInfo = jobCard.vehicleInfo as any;
      results.push({
        id: jobCard.id,
        type: 'jobcard',
        title: `Job #${jobCard.id.substring(0, 8).toUpperCase()}`,
        subtitle: `${vehicleInfo?.make || ''} ${vehicleInfo?.model || ''} - ${jobCard.status}`,
        href: `/job-cards?id=${jobCard.id}`,
      });
    });

    const matchingAppointments = await storage.searchAppointments(userGarageId, searchPattern, limit);
    matchingAppointments.forEach((appointment: any) => {
      results.push({
        id: appointment.id,
        type: 'appointment',
        title: appointment.serviceType || 'Appointment',
        subtitle: appointment.scheduledDate ? new Date(appointment.scheduledDate).toLocaleDateString() : 'No date',
        href: `/appointments?id=${appointment.id}`,
      });
    });

    res.json(results.slice(0, 20));
  } catch (error) {
    console.error('Error in search API:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

export default router;
