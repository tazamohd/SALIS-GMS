/**
 * SALIS AUTO - State Machine Engine
 * Enforces valid state transitions for all entities.
 * Prevents invalid status changes and triggers automated workflows.
 */

import type { StateTransition } from '../../shared/workflows';
import {
  JOB_CARD_TRANSITIONS,
  APPOINTMENT_TRANSITIONS,
  INVOICE_TRANSITIONS,
  PURCHASE_ORDER_TRANSITIONS,
  ESTIMATE_TRANSITIONS,
  type JobCardStatus,
  type AppointmentStatus,
  type InvoiceStatus,
  type PurchaseOrderStatus,
  type EstimateStatus,
} from '../../shared/workflows';

export interface TransitionResult {
  allowed: boolean;
  reason?: string;
  autoTriggers: string[];
  label: string;
}

class StateMachine<S extends string> {
  private transitions: StateTransition<S>[];
  private entityName: string;

  constructor(entityName: string, transitions: StateTransition<S>[]) {
    this.entityName = entityName;
    this.transitions = transitions;
  }

  /**
   * Check if a transition is valid and return the triggers
   */
  canTransition(from: S, to: S, userRoles: string[] = []): TransitionResult {
    const transition = this.transitions.find(t => t.from === from && t.to === to);

    if (!transition) {
      const allowedTargets = this.getAvailableTransitions(from).map(t => t.to);
      return {
        allowed: false,
        reason: `Invalid ${this.entityName} transition: "${from}" → "${to}". Allowed: ${allowedTargets.join(', ') || 'none'}`,
        autoTriggers: [],
        label: '',
      };
    }

    if (transition.requiredRoles && transition.requiredRoles.length > 0) {
      const hasRole = transition.requiredRoles.some(r => userRoles.includes(r));
      if (!hasRole) {
        return {
          allowed: false,
          reason: `Insufficient permissions. Required roles: ${transition.requiredRoles.join(', ')}`,
          autoTriggers: [],
          label: transition.label,
        };
      }
    }

    return {
      allowed: true,
      autoTriggers: transition.autoTriggers || [],
      label: transition.label,
    };
  }

  /**
   * Get all valid transitions from a given state
   */
  getAvailableTransitions(from: S, userRoles: string[] = []): Array<{ to: S; label: string }> {
    return this.transitions
      .filter(t => {
        if (t.from !== from) return false;
        if (t.requiredRoles && t.requiredRoles.length > 0) {
          return t.requiredRoles.some(r => userRoles.includes(r));
        }
        return true;
      })
      .map(t => ({ to: t.to, label: t.label }));
  }

  /**
   * Validate a status value is a known state
   */
  isValidStatus(status: string): status is S {
    const allStatuses = new Set<string>();
    for (const t of this.transitions) {
      allStatuses.add(t.from);
      allStatuses.add(t.to);
    }
    return allStatuses.has(status);
  }
}

// ─── Pre-built State Machine Instances ───────────────────────────────────────

export const jobCardMachine = new StateMachine<JobCardStatus>('Job Card', JOB_CARD_TRANSITIONS);
export const appointmentMachine = new StateMachine<AppointmentStatus>('Appointment', APPOINTMENT_TRANSITIONS);
export const invoiceMachine = new StateMachine<InvoiceStatus>('Invoice', INVOICE_TRANSITIONS);
export const purchaseOrderMachine = new StateMachine<PurchaseOrderStatus>('Purchase Order', PURCHASE_ORDER_TRANSITIONS);
export const estimateMachine = new StateMachine<EstimateStatus>('Estimate', ESTIMATE_TRANSITIONS);

// ─── Registry for dynamic lookup ────────────────────────────────────────────

export const stateMachines = {
  jobCard: jobCardMachine,
  appointment: appointmentMachine,
  invoice: invoiceMachine,
  purchaseOrder: purchaseOrderMachine,
  estimate: estimateMachine,
} as const;

export type EntityType = keyof typeof stateMachines;
