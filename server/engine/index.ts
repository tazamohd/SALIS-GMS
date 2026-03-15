/**
 * SALIS AUTO - Engine Module Entry Point
 * Initializes the workflow engine, event bus, and cross-module triggers.
 */

export { eventBus } from './event-bus';
export { workflowEngine } from './workflow-engine';
export { stateMachines, jobCardMachine, appointmentMachine, invoiceMachine, purchaseOrderMachine, estimateMachine } from './state-machines';
export type { TransitionResult, EntityType } from './state-machines';
export type { TransitionRequest, TransitionResponse } from './workflow-engine';
export { registerWorkflowTriggers } from './triggers';

/**
 * Initialize the complete workflow engine.
 * Call this once during server startup.
 */
export function initializeEngine(): void {
  registerWorkflowTriggers();
  console.log('✅ SALIS AUTO Workflow Engine initialized');
}
