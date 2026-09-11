// Dispatch service's own schema — deliberately decoupled from the monolith's
// shared/schema.ts (database-per-service). Dispatch never references the
// monolith's tables; it identifies the caller's entity only by an opaque
// (entityType, entityId) pair. See ADR-001.
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const assignmentRequests = pgTable(
  "assignment_requests",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    // Opaque reference to the caller's own entity (e.g. a fleet trip id, a
    // garage job card id). Dispatch has no foreign key into it.
    entityType: text("entity_type").notNull(), // job_card | fleet_trip | roadside_call | ride
    entityId: text("entity_id").notNull(),
    taskType: text("task_type").notNull(),
    requiredSkills: jsonb("required_skills").notNull().default([]),
    estimatedHours: real("estimated_hours"),
    priority: text("priority").notNull().default("medium"),
    candidateCount: real("candidate_count").notNull(),
    correlationId: text("correlation_id"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byEntity: index("areq_entity_idx").on(t.entityType, t.entityId),
  }),
);

export const assignmentDecisions = pgTable(
  "assignment_decisions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    requestId: uuid("request_id")
      .notNull()
      .references(() => assignmentRequests.id),
    bestCandidateId: text("best_candidate_id"),
    bestCandidateName: text("best_candidate_name"),
    bestScore: real("best_score"),
    ranked: jsonb("ranked").notNull().default([]), // full ScoredCandidate[]
    status: text("status").notNull().default("decided"), // decided | no_match | accepted | rejected
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byRequest: index("adec_request_idx").on(t.requestId),
  }),
);

// Append-only audit trail. Also the seam where an event publisher would
// write out to a broker once one is provisioned (see lib/eventPublisher.ts).
export const dispatchEvents = pgTable(
  "dispatch_events",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    type: text("type").notNull(), // dispatch.assignment.decided | dispatch.assignment.failed
    requestId: uuid("request_id").references(() => assignmentRequests.id),
    payload: jsonb("payload").notNull().default({}),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byRequest: index("devt_request_idx").on(t.requestId),
  }),
);
