// @ts-nocheck
/**
 * SALIS AUTO - Engine Module Entry Point
 * Initializes the workflow engine, event bus, and cross-module triggers.
 */

export { eventBus } from './event-bus';
export { workflowEngine } from './workflow-engine';
export { stateMachines, jobCardMachine, appointmentMachine, invoiceMachine, purchaseOrderMachine, estimateMachine } from './state-machines';
export type { TransitionResult, EntityType } from './state-machines';
export type { TransitionRequest, TransitionResponse } from './workflow-engine';
import { registerWorkflowTriggers } from './triggers';
import { runScheduledChecks } from './scheduled-checks';
import { db } from '../db';
import { garages } from '../../shared/schema';
export { registerWorkflowTriggers };

const SCHEDULED_CHECK_INTERVAL_MS = 15 * 60 * 1000;
let scheduledTimer: NodeJS.Timeout | null = null;

async function runScheduledChecksForAllGarages(): Promise<void> {
  try {
    const rows = await db.select({ id: garages.id }).from(garages);
    await Promise.all(
      rows.map((g: { id: string }) =>
        runScheduledChecks(g.id).catch(err =>
          console.error(`[scheduled-checks] garage ${g.id} failed:`, err),
        ),
      ),
    );
  } catch (err) {
    console.error('[scheduled-checks] tick failed:', err);
  }
}

/**
 * Initialize the complete workflow engine.
 * Call this once during server startup.
 */
export function initializeEngine(): void {
  registerWorkflowTriggers();

  if (scheduledTimer === null) {
    scheduledTimer = setInterval(runScheduledChecksForAllGarages, SCHEDULED_CHECK_INTERVAL_MS);
    // Don't keep the event loop alive for the interval alone.
    scheduledTimer.unref?.();
    process.once('SIGTERM', shutdownEngine);
    process.once('SIGINT', shutdownEngine);
  }

  console.log('SALIS AUTO Workflow Engine initialized (scheduled checks every 15 min)');
}

export function shutdownEngine(): void {
  if (scheduledTimer !== null) {
    clearInterval(scheduledTimer);
    scheduledTimer = null;
  }
}
