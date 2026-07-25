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
import { spawn } from 'node:child_process';
import path from 'node:path';
import { logger } from '../logger';
export { registerWorkflowTriggers };

const SCHEDULED_CHECK_INTERVAL_MS = 15 * 60 * 1000;
let scheduledTimer: NodeJS.Timeout | null = null;

// Daily backup at 02:00 UTC. Re-checked every hour; the script runs only when
// the current UTC hour matches BACKUP_HOUR_UTC and BACKUP_ENABLED is truthy.
// Disabled by default in dev so the engine init doesn't spawn pg_dump on
// every refresh. Set BACKUP_ENABLED=true to opt in.
const BACKUP_CHECK_INTERVAL_MS = 60 * 60 * 1000;
const BACKUP_HOUR_UTC = Number(process.env.BACKUP_HOUR_UTC) || 2;
let backupTimer: NodeJS.Timeout | null = null;
let lastBackupDate: string | null = null;

function tryRunDailyBackup(): void {
  if (process.env.BACKUP_ENABLED !== 'true') return;
  const now = new Date();
  if (now.getUTCHours() !== BACKUP_HOUR_UTC) return;
  const dateKey = now.toISOString().slice(0, 10);
  if (lastBackupDate === dateKey) return; // already ran today
  lastBackupDate = dateKey;

  const scriptPath = path.resolve(process.cwd(), 'scripts', 'backup-pg-dump.mjs');
  const child = spawn('node', [scriptPath], {
    env: process.env,
    stdio: ['ignore', 'inherit', 'inherit'],
    detached: false,
  });
  child.on('error', (err) => logger.error('backup spawn error', { error: String(err) }));
  child.on('exit', (code) => {
    if (code !== 0) logger.error('backup exited non-zero', { code });
  });
}

async function runScheduledChecksForAllGarages(): Promise<void> {
  try {
    const rows = await db.select({ id: garages.id }).from(garages);
    await Promise.all(
      rows.map((g: { id: string }) =>
        runScheduledChecks(g.id).catch(err =>
          logger.error('scheduled-checks per-garage failure', { garageId: g.id, error: String(err) }),
        ),
      ),
    );
  } catch (err) {
    logger.error('scheduled-checks tick failed', { error: String(err) });
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

  if (backupTimer === null) {
    backupTimer = setInterval(tryRunDailyBackup, BACKUP_CHECK_INTERVAL_MS);
    backupTimer.unref?.();
  }

  console.log(
    `SALIS AUTO Workflow Engine initialized (scheduled checks every 15 min, daily backup at ${pad(BACKUP_HOUR_UTC)}:00 UTC ${process.env.BACKUP_ENABLED === 'true' ? 'ENABLED' : 'DISABLED — set BACKUP_ENABLED=true to opt in'})`,
  );
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function shutdownEngine(): void {
  if (scheduledTimer !== null) {
    clearInterval(scheduledTimer);
    scheduledTimer = null;
  }
  if (backupTimer !== null) {
    clearInterval(backupTimer);
    backupTimer = null;
  }
}
