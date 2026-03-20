// @ts-nocheck
/**
 * SALIS AUTO - Workflow Engine
 * Central orchestrator that validates state transitions and fires events.
 * This is the backbone connecting all departments.
 */

import { eventBus } from './event-bus';
import { stateMachines, type EntityType, type TransitionResult } from './state-machines';
import type { WorkflowEvent } from '../../shared/workflows';

export interface TransitionRequest {
  entityType: EntityType;
  entityId: string;
  garageId: string;
  fromStatus: string;
  toStatus: string;
  userId: string;
  userRoles: string[];
  data?: Record<string, any>;
}

export interface TransitionResponse {
  success: boolean;
  error?: string;
  transition?: TransitionResult;
  event?: WorkflowEvent;
}

class WorkflowEngine {
  /**
   * Process a state transition request.
   * Validates the transition, emits events, and triggers cross-module automations.
   */
  async processTransition(request: TransitionRequest): Promise<TransitionResponse> {
    const machine = stateMachines[request.entityType];
    if (!machine) {
      return {
        success: false,
        error: `Unknown entity type: ${request.entityType}`,
      };
    }

    // Validate the transition
    const result = machine.canTransition(
      request.fromStatus as any,
      request.toStatus as any,
      request.userRoles
    );

    if (!result.allowed) {
      return {
        success: false,
        error: result.reason,
        transition: result,
      };
    }

    // Create the transition event
    const event = eventBus.createEvent(
      `${request.entityType}.${this.getActionName(request.toStatus)}`,
      request.entityType,
      request.entityId,
      request.garageId,
      {
        ...request.data,
        fromStatus: request.fromStatus,
        toStatus: request.toStatus,
        label: result.label,
      },
      request.userId
    );

    // Emit the main transition event
    await eventBus.emit(event);

    // Fire auto-triggers
    for (const trigger of result.autoTriggers) {
      const triggerEvent = eventBus.createEvent(
        trigger.replace('.', '_'), // normalize trigger name
        request.entityType,
        request.entityId,
        request.garageId,
        {
          ...request.data,
          triggerSource: `${request.entityType}.${request.fromStatus}_to_${request.toStatus}`,
        },
        request.userId
      );

      // Fire triggers asynchronously (don't block the transition)
      eventBus.emit(triggerEvent).catch(err => {
        console.error(`[WorkflowEngine] Trigger "${trigger}" failed:`, err);
      });
    }

    return {
      success: true,
      transition: result,
      event,
    };
  }

  /**
   * Get available next states for an entity
   */
  getAvailableTransitions(
    entityType: EntityType,
    currentStatus: string,
    userRoles: string[] = []
  ): Array<{ to: string; label: string }> {
    const machine = stateMachines[entityType];
    if (!machine) return [];
    return machine.getAvailableTransitions(currentStatus as any, userRoles);
  }

  /**
   * Validate if a status value is valid for an entity type
   */
  isValidStatus(entityType: EntityType, status: string): boolean {
    const machine = stateMachines[entityType];
    if (!machine) return false;
    return machine.isValidStatus(status);
  }

  /**
   * Emit a domain event directly (for non-transition events)
   */
  async emitEvent(
    type: string,
    entityType: string,
    entityId: string,
    garageId: string,
    data: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    const event = eventBus.createEvent(type, entityType, entityId, garageId, data, userId);
    await eventBus.emit(event);
  }

  /**
   * Get recent events for Command Center
   */
  getRecentEvents(limit = 50, garageId?: string): WorkflowEvent[] {
    return eventBus.getRecentEvents(limit, garageId);
  }

  /**
   * Get event statistics
   */
  getEventStats(since?: Date, garageId?: string): Record<string, number> {
    return eventBus.getEventCounts(since, garageId);
  }

  private getActionName(status: string): string {
    const actionMap: Record<string, string> = {
      pending: 'submitted',
      assigned: 'assigned',
      in_progress: 'started',
      paused: 'paused',
      qc_review: 'submitted_for_qc',
      rework: 'sent_to_rework',
      completed: 'completed',
      invoiced: 'invoiced',
      delivered: 'delivered',
      closed: 'closed',
      cancelled: 'cancelled',
      confirmed: 'confirmed',
      reminded: 'reminded',
      checked_in: 'checked_in',
      in_service: 'in_service',
      no_show: 'no_show',
      rescheduled: 'rescheduled',
      sent: 'sent',
      viewed: 'viewed',
      partially_paid: 'partially_paid',
      paid: 'paid',
      overdue: 'overdue',
      void: 'voided',
      refunded: 'refunded',
      submitted: 'submitted',
      approved: 'approved',
      rejected: 'rejected',
      ordered: 'ordered',
      partially_received: 'partially_received',
      received: 'received',
      converted: 'converted',
      expired: 'expired',
      draft: 'drafted',
    };
    return actionMap[status] || status;
  }
}

// Singleton instance
export const workflowEngine = new WorkflowEngine();
