/**
 * Google My Business (Business Profile) live sync — key-deferred.
 *
 * Pulls reviews from the Google Business Profile API into the local
 * `gmb_reviews` table and stamps `google_business_profiles.last_synced_at`.
 * No-ops (returns `{ configured: false }`) until Google OAuth credentials are
 * supplied, mirroring the payment-gateway / Sentry / ZATCA key-deferred pattern.
 *
 * Enable by setting EITHER a short-lived bearer token:
 *   GOOGLE_GMB_ACCESS_TOKEN
 * OR a refreshable OAuth client (preferred for production):
 *   GOOGLE_GMB_CLIENT_ID + GOOGLE_GMB_CLIENT_SECRET + GOOGLE_GMB_REFRESH_TOKEN
 *
 * The local CRUD over profiles/posts/reviews is always available; this module
 * only adds the live pull-down from Google.
 */
import { eq } from "drizzle-orm";
import { db } from "../db";
import { googleBusinessProfiles, gmbReviews } from "@shared/schema";
import { logger } from "../logger";

const GMB_API_BASE = "https://mybusiness.googleapis.com/v4";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";

/** Google starRating enum → 1..5 integer. */
const STAR_TO_INT: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

export interface GmbSyncResult {
  configured: boolean;
  profileId?: string;
  reviewsFetched?: number;
  reviewsUpserted?: number;
  error?: string;
  message?: string;
}

/** True when enough Google credentials are present to attempt a live sync. */
export function isGmbConfigured(): boolean {
  if (process.env.GOOGLE_GMB_ACCESS_TOKEN) return true;
  return !!(
    process.env.GOOGLE_GMB_CLIENT_ID &&
    process.env.GOOGLE_GMB_CLIENT_SECRET &&
    process.env.GOOGLE_GMB_REFRESH_TOKEN
  );
}

/** Resolve a bearer token, refreshing via OAuth when a refresh token is set. */
async function getAccessToken(): Promise<string | null> {
  const direct = process.env.GOOGLE_GMB_ACCESS_TOKEN;
  if (direct) return direct;

  const clientId = process.env.GOOGLE_GMB_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_GMB_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_GMB_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  const resp = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!resp.ok) {
    logger.error("GMB OAuth token refresh failed", { status: resp.status });
    return null;
  }
  const data: any = await resp.json().catch(() => ({}));
  return data.access_token ?? null;
}

/**
 * Sync reviews for a single profile from the Google Business Profile API into
 * `gmb_reviews` (upsert keyed on the external reviewId). Returns a structured
 * result; never throws on an API/credential failure — surfaces it in `error`.
 */
export async function syncProfileReviews(profile: {
  id: string;
  accountId: string;
  locationId: string;
}): Promise<GmbSyncResult> {
  if (!isGmbConfigured()) {
    return {
      configured: false,
      profileId: profile.id,
      message: "GMB live sync not configured — set GOOGLE_GMB_* credentials.",
    };
  }

  const token = await getAccessToken();
  if (!token) {
    return {
      configured: true,
      profileId: profile.id,
      error: "Failed to obtain a Google access token.",
    };
  }

  const url =
    `${GMB_API_BASE}/accounts/${encodeURIComponent(profile.accountId)}` +
    `/locations/${encodeURIComponent(profile.locationId)}/reviews`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    return {
      configured: true,
      profileId: profile.id,
      error: `GMB reviews API HTTP ${resp.status}: ${text.slice(0, 200)}`,
    };
  }

  const data: any = await resp.json().catch(() => ({}));
  const reviews: any[] = Array.isArray(data.reviews) ? data.reviews : [];

  let upserted = 0;
  for (const r of reviews) {
    const reviewId = r.reviewId ?? r.name;
    if (!reviewId) continue;
    const rating = STAR_TO_INT[String(r.starRating)] ?? 0;
    const reviewDate = r.createTime ? new Date(r.createTime) : new Date();
    const responseText = r.reviewReply?.comment ?? null;
    const respondedAt = r.reviewReply?.updateTime ? new Date(r.reviewReply.updateTime) : null;

    await db
      .insert(gmbReviews)
      .values({
        profileId: profile.id,
        reviewId: String(reviewId),
        reviewerName: r.reviewer?.displayName ?? null,
        rating,
        comment: r.comment ?? null,
        reviewDate,
        responseText,
        respondedAt,
      })
      .onConflictDoUpdate({
        target: gmbReviews.reviewId,
        set: {
          reviewerName: r.reviewer?.displayName ?? null,
          rating,
          comment: r.comment ?? null,
          responseText,
          respondedAt,
          updatedAt: new Date(),
        },
      });
    upserted++;
  }

  await db
    .update(googleBusinessProfiles)
    .set({ lastSyncedAt: new Date(), updatedAt: new Date() })
    .where(eq(googleBusinessProfiles.id, profile.id));

  return {
    configured: true,
    profileId: profile.id,
    reviewsFetched: reviews.length,
    reviewsUpserted: upserted,
  };
}
