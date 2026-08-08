/**
 * Next-gen repository (Phase E). The only data-layer access for the next-gen
 * showcase domain: a generic list/create dispatch over the `storage` methods
 * named in the resource catalogue. Delegation only.
 */

import { storage } from '../../../storage';
import { NEXTGEN_RESOURCES } from '../nextgen.resources';

type StorageAny = Record<string, (...args: unknown[]) => Promise<unknown>>;

export class NextGenRepository {
  private readonly getters: Record<string, string> = {};
  private readonly creators: Record<string, string> = {};

  constructor() {
    for (const r of NEXTGEN_RESOURCES) {
      this.getters[r.path] = r.get;
      this.creators[r.path] = r.create;
    }
  }

  list(path: string, garageId: string): Promise<unknown> {
    return (storage as unknown as StorageAny)[this.getters[path]](garageId);
  }

  create(path: string, data: unknown): Promise<unknown> {
    return (storage as unknown as StorageAny)[this.creators[path]](data);
  }
}
