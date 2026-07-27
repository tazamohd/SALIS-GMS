-- Platform-admin actions are cross-tenant: they do not belong to any single
-- garage. server/auditMiddleware.ts already writes those rows with a NULL
-- garage_id, but the column was NOT NULL, so every platform-admin mutation
-- failed to be audited (the insert threw and was swallowed by the handler's
-- catch). Relax the constraint so the audit trail actually records them.
ALTER TABLE "audit_logs" ALTER COLUMN "garage_id" DROP NOT NULL;
