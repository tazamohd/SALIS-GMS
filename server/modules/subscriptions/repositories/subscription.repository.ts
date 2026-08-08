/**
 * Subscription repository (Phase E4). The only data-layer access for the
 * subscriptions/billing domain. Delegates to the legacy `storage` facade
 * (strangler seam) — the plan catalog itself is static config (`shared/plans`)
 * and lives in the service, not here.
 */

import { storage } from '../../../storage';
import type { Subscription } from '@shared/schema';

// storage's update accepts a partial subscription patch; kept loose at the seam.
type Any = any;

export interface ISubscriptionRepository {
  ensure(garageId: string): Promise<Subscription>;
  update(garageId: string, data: Any): Promise<Subscription | undefined>;
  listAll(): Promise<Subscription[]>;
}

export class SubscriptionRepository implements ISubscriptionRepository {
  ensure(garageId: string) { return storage.ensureSubscription(garageId); }
  update(garageId: string, data: Any) { return storage.updateSubscription(garageId, data); }
  listAll() { return storage.listAllSubscriptions(); }
}
