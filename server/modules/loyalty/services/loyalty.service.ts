/**
 * Loyalty service (Phase E — Domain Services).
 *
 * Owns the customer-loyalty domain (Module 44): programs, accounts,
 * transactions, rewards, and redemptions. The monolith performed no body
 * validation here (it forwarded `req.body` to storage) so none is introduced;
 * the `garageId` injection on program/account create and the by-id 404s stay at
 * the controller boundary. All data access flows through the repository.
 */

import type { LoyaltyRepository } from '../repositories/loyalty.repository';

export class LoyaltyService {
  constructor(private readonly repository: LoyaltyRepository) {}

  // ---- Programs -----------------------------------------------------------
  createProgram(data: Parameters<LoyaltyRepository['createProgram']>[0]) {
    return this.repository.createProgram(data);
  }
  listPrograms(garageId: string) {
    return this.repository.getPrograms(garageId);
  }
  getProgram(id: string) {
    return this.repository.getProgramById(id);
  }
  updateProgram(id: string, data: Parameters<LoyaltyRepository['updateProgram']>[1]) {
    return this.repository.updateProgram(id, data);
  }
  deleteProgram(id: string) {
    return this.repository.deleteProgram(id);
  }

  // ---- Accounts -----------------------------------------------------------
  createAccount(data: Parameters<LoyaltyRepository['createAccount']>[0]) {
    return this.repository.createAccount(data);
  }
  listAccounts(programId?: string, customerId?: string) {
    return this.repository.getAccounts(programId, customerId);
  }
  getAccount(id: string) {
    return this.repository.getAccountById(id);
  }
  getAccountByCustomer(customerId: string) {
    return this.repository.getAccountByCustomer(customerId);
  }
  updateAccount(id: string, data: Parameters<LoyaltyRepository['updateAccount']>[1]) {
    return this.repository.updateAccount(id, data);
  }

  // ---- Transactions -------------------------------------------------------
  createTransaction(data: Parameters<LoyaltyRepository['createTransaction']>[0]) {
    return this.repository.createTransaction(data);
  }
  listTransactions(accountId: string) {
    return this.repository.getTransactions(accountId);
  }
  getTransaction(id: string) {
    return this.repository.getTransactionById(id);
  }

  // ---- Rewards ------------------------------------------------------------
  createReward(data: Parameters<LoyaltyRepository['createReward']>[0]) {
    return this.repository.createReward(data);
  }
  listRewards(programId: string, filters?: { isActive?: boolean }) {
    return this.repository.getRewards(programId, filters);
  }
  getReward(id: string) {
    return this.repository.getRewardById(id);
  }
  updateReward(id: string, data: Parameters<LoyaltyRepository['updateReward']>[1]) {
    return this.repository.updateReward(id, data);
  }
  deleteReward(id: string) {
    return this.repository.deleteReward(id);
  }

  // ---- Redemptions --------------------------------------------------------
  createRedemption(data: Parameters<LoyaltyRepository['createRedemption']>[0]) {
    return this.repository.createRedemption(data);
  }
  listRedemptions(accountId?: string, filters?: { status?: string }) {
    return this.repository.getRedemptions(accountId, filters);
  }
  getRedemption(id: string) {
    return this.repository.getRedemptionById(id);
  }
  updateRedemption(id: string, data: Parameters<LoyaltyRepository['updateRedemption']>[1]) {
    return this.repository.updateRedemption(id, data);
  }
}
