-- Adds language-routing support for Arabic-language support tickets
-- Migration: 0004_add_arabic_support_fields.sql

-- =============================================
-- USERS: preferred language + Arabic support flag
-- =============================================

-- Customer/agent preferred interface & support language (e.g. "en", "ar").
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';

-- Marks a support agent as able to handle Arabic-language conversations.
-- Combined with role = 'arabic_support_agent' to auto-route Arabic tickets.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS supports_arabic BOOLEAN DEFAULT false;

-- Helps the auto-router quickly find Arabic-capable agents in a garage.
CREATE INDEX IF NOT EXISTS idx_users_supports_arabic ON users (supports_arabic);
