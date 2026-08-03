-- Customer phone verification (OTP flow).
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone_verified_at" timestamp;
