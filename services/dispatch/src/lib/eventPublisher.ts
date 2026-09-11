// Event publisher seam. Today this only writes to the append-only
// dispatch_events table (see schema.ts) — no broker is provisioned yet.
// When Redis Streams/RabbitMQ is added (see ADR-001, "once geo/ETA enters
// the picture"), swap the implementation here; callers of publish() do not
// change.
import { db } from "../db";
import { dispatchEvents } from "../schema";

export interface DispatchEvent {
  type: "dispatch.assignment.decided" | "dispatch.assignment.failed";
  requestId: string | null;
  payload: Record<string, unknown>;
}

export async function publish(event: DispatchEvent): Promise<void> {
  await db.insert(dispatchEvents).values({
    type: event.type,
    requestId: event.requestId,
    payload: event.payload,
  });
  // Future: also publish to a broker here, e.g.
  //   await broker.publish(event.type, event.payload, { requestId: event.requestId });
}
