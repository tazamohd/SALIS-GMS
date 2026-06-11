/**
 * Tax configuration admin routes — read and update the live VAT / GOSI rates
 * without a code deploy. Reads are available to any authenticated user (the
 * invoice/payroll UIs need the current rate); writes are admin-only and create
 * an audited new active row.
 *
 *   GET  /api/tax-config            → { vat: { rate }, gosi: { ...rates } }
 *   PUT  /api/admin/tax-config/vat  → { vatRate, vatRegistrationNumber?, ... }
 *   PUT  /api/admin/tax-config/gosi → { saudiEmployeeRate?, saudiEmployerRate?, ... }
 */
import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { requireAdmin } from '../middleware/requireRole';
import { getVatRate, getGosiRates, setVatConfig, setGosiConfig } from '../services/tax-config';
import { logger } from '../logger';

const router = Router();

router.get('/tax-config', isAuthenticated, (_req, res) => {
  res.json({ vat: { rate: getVatRate() }, gosi: getGosiRates() });
});

router.put('/admin/tax-config/vat', isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const { vatRate, vatRegistrationNumber, companyNameEn, companyNameAr, changeReason } = req.body || {};
    if (vatRate !== undefined && (typeof vatRate !== 'number' || vatRate < 0 || vatRate > 1)) {
      return res.status(400).json({ message: 'vatRate must be a fraction between 0 and 1 (e.g. 0.15)' });
    }
    await setVatConfig(
      { vatRate, vatRegistrationNumber, companyNameEn, companyNameAr },
      req.user?.id,
      changeReason,
    );
    res.json({ vat: { rate: getVatRate() } });
  } catch (err: any) {
    logger.error('tax-config vat update failed', { error: String(err) });
    res.status(500).json({ message: 'Failed to update VAT config' });
  }
});

router.put('/admin/tax-config/gosi', isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const b = req.body || {};
    const rateFields = ['saudiEmployeeRate', 'saudiEmployerRate', 'nonSaudiEmployeeRate', 'nonSaudiEmployerRate'];
    for (const f of rateFields) {
      if (b[f] !== undefined && (typeof b[f] !== 'number' || b[f] < 0 || b[f] > 1)) {
        return res.status(400).json({ message: `${f} must be a fraction between 0 and 1` });
      }
    }
    await setGosiConfig(
      {
        saudiEmployeeRate: b.saudiEmployeeRate,
        saudiEmployerRate: b.saudiEmployerRate,
        nonSaudiEmployeeRate: b.nonSaudiEmployeeRate,
        nonSaudiEmployerRate: b.nonSaudiEmployerRate,
        maxContributionSalary: b.maxContributionSalary,
      },
      req.user?.id,
      b.changeReason,
    );
    res.json({ gosi: getGosiRates() });
  } catch (err: any) {
    logger.error('tax-config gosi update failed', { error: String(err) });
    res.status(500).json({ message: 'Failed to update GOSI config' });
  }
});

export default router;
