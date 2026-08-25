/**
 * Loyalty repository (Phase E). The only data-layer access for the
 * customer-loyalty domain (Module 44): the `storage` CRUD + filtered lookups for
 * loyalty programs, accounts, transactions, rewards, and redemptions.
 * Delegation only.
 */

import { storage } from '../../../storage';

export class LoyaltyRepository {
  // ---- Programs -----------------------------------------------------------
  createProgram(data: Parameters<typeof storage.createLoyaltyProgram>[0]) {
    return storage.createLoyaltyProgram(data);
  }
  getPrograms(garageId: string) {
    return storage.getLoyaltyPrograms(garageId);
  }
  getProgramById(id: string) {
    return storage.getLoyaltyProgramById(id);
  }
  updateProgram(id: string, data: Parameters<typeof storage.updateLoyaltyProgram>[1]) {
    return storage.updateLoyaltyProgram(id, data);
  }
  deleteProgram(id: string) {
    return storage.deleteLoyaltyProgram(id);
  }

  // ---- Accounts -----------------------------------------------------------
  createAccount(data: Parameters<typeof storage.createLoyaltyAccount>[0]) {
    return storage.createLoyaltyAccount(data);
  }
  getAccounts(programId?: string, customerId?: string) {
    return storage.getLoyaltyAccounts(programId, customerId);
  }
  getAccountById(id: string) {
    return storage.getLoyaltyAccountById(id);
  }
  getAccountByCustomer(customerId: string) {
    return storage.getLoyaltyAccountByCustomer(customerId);
  }
  updateAccount(id: string, data: Parameters<typeof storage.updateLoyaltyAccount>[1]) {
    return storage.updateLoyaltyAccount(id, data);
  }

  // ---- Transactions -------------------------------------------------------
  createTransaction(data: Parameters<typeof storage.createLoyaltyTransaction>[0]) {
    return storage.createLoyaltyTransaction(data);
  }
  getTransactions(accountId: string) {
    return storage.getLoyaltyTransactions(accountId);
  }
  getTransactionById(id: string) {
    return storage.getLoyaltyTransactionById(id);
  }

  // ---- Rewards ------------------------------------------------------------
  createReward(data: Parameters<typeof storage.createLoyaltyReward>[0]) {
    return storage.createLoyaltyReward(data);
  }
  getRewards(programId: string, filters?: { isActive?: boolean }) {
    return storage.getLoyaltyRewards(programId, filters);
  }
  getRewardById(id: string) {
    return storage.getLoyaltyRewardById(id);
  }
  updateReward(id: string, data: Parameters<typeof storage.updateLoyaltyReward>[1]) {
    return storage.updateLoyaltyReward(id, data);
  }
  deleteReward(id: string) {
    return storage.deleteLoyaltyReward(id);
  }

  // ---- Redemptions --------------------------------------------------------
  createRedemption(data: Parameters<typeof storage.createLoyaltyRedemption>[0]) {
    return storage.createLoyaltyRedemption(data);
  }
  getRedemptions(accountId?: string, filters?: { status?: string }) {
    return storage.getLoyaltyRedemptions(accountId, filters);
  }
  getRedemptionById(id: string) {
    return storage.getLoyaltyRedemptionById(id);
  }
  updateRedemption(id: string, data: Parameters<typeof storage.updateLoyaltyRedemption>[1]) {
    return storage.updateLoyaltyRedemption(id, data);
  }
}
