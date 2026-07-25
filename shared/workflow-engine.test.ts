import { describe, it, expect } from 'vitest';
import { jobCardMachine, appointmentMachine, invoiceMachine } from '../server/engine/state-machines';

describe('Job Card State Machine', () => {
  it('allows valid transition: pending → assigned', () => {
    const result = jobCardMachine.canTransition('pending', 'assigned');
    expect(result.allowed).toBe(true);
  });

  it('does not allow direct transition: pending → completed', () => {
    const result = jobCardMachine.canTransition('pending', 'completed');
    expect(result.allowed).toBe(false);
  });

  it('getAvailableTransitions returns correct options for pending', () => {
    const available = jobCardMachine.getAvailableTransitions('pending');
    expect(available.length).toBeGreaterThan(0);
    const toStates = available.map(t => t.to);
    expect(toStates).toContain('assigned');
  });
});

describe('Appointment State Machine', () => {
  it('allows confirmed → checked_in', () => {
    const result = appointmentMachine.canTransition('confirmed', 'checked_in');
    expect(result.allowed).toBe(true);
  });
});

describe('Invoice State Machine', () => {
  it('allows sent → paid', () => {
    const result = invoiceMachine.canTransition('sent', 'paid');
    expect(result.allowed).toBe(true);
  });
});
