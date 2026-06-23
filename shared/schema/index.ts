// Super-app shared rails + domain schemas.
// The existing schema.ts (391 tables) remains the primary schema file.
// These modules extend it with super-app capabilities without modifying
// or duplicating existing tables.

// Shared rails — build order: Identity → Ledger → Payments → Catalog → Orders → Notifications
export * from "./identity";
export * from "./ledger";
export * from "./payment-intents";
export * from "./catalog";
export * from "./orders";
export * from "./notifications-ext";

// Domain: Fleet management (Wave 2)
export * from "./fleet";
