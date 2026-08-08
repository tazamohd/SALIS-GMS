/**
 * Platform module assembly (Phase E1/E2). Hosts the platform/administration
 * surface as one layered router wired via DI:
 *  - feature-flags: per-garage CRUD (from `server/routes/feature-flags.ts`)
 *  - backup: admin backup status/create/list/export (from `server/routes/backup.ts`)
 * Route paths, auth/role gates, and response shapes are identical to the legacy
 * route files.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireAdmin } from '../../middleware/requireRole';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { FEATURE_FLAG_SERVICE, BACKUP_SERVICE } from '../../infrastructure/di/tokens';
import { makeFeatureFlagController } from './controllers/feature-flag.controller';
import { makeBackupController } from './controllers/backup.controller';
import type { FeatureFlagService } from './services/feature-flag.service';
import type { BackupService } from './services/backup.service';

export interface PlatformModuleDeps {
  featureFlagService?: FeatureFlagService;
  backupService?: BackupService;
}

export function createPlatformModule(deps: PlatformModuleDeps = {}): Router {
  const container = getAppContainer();
  const flags = makeFeatureFlagController(
    deps.featureFlagService ?? container.resolve(FEATURE_FLAG_SERVICE),
  );
  const backup = makeBackupController(
    deps.backupService ?? container.resolve(BACKUP_SERVICE),
  );
  const router = Router();

  // Feature flags (authenticated).
  router.get('/feature-flags', isAuthenticated, flags.list);
  router.get('/feature-flags/:id', isAuthenticated, flags.get);
  router.post('/feature-flags', isAuthenticated, flags.create);
  router.patch('/feature-flags/:id', isAuthenticated, flags.update);
  router.delete('/feature-flags/:id', isAuthenticated, flags.remove);

  // Backup administration (ADMIN only).
  router.get('/backup/status', isAuthenticated, requireAdmin, backup.status);
  router.post('/backup/create', isAuthenticated, requireAdmin, backup.create);
  router.get('/backup/list', isAuthenticated, requireAdmin, backup.list);
  router.get('/backup/export/:type', isAuthenticated, requireAdmin, backup.exportData);

  return router;
}

export default createPlatformModule();
