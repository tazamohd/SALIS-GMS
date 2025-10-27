// PHASE 4 - CUSTOMER EXPERIENCE BACKEND SERVICE
// 5 modules with database operations and real-time features

import { db } from "./db";
import { 
  serviceTrackingUpdates,
  videoEstimates,
  digitalWalkarounds,
  customerReviews,
  referralPrograms,
  customerReferrals,
  jobCards,
  users
} from "@shared/schema";
import { eq, desc, and, sql, gte } from "drizzle-orm";

// ========================================
// 1. LIVE SERVICE TRACKING
// ========================================

export async function getServiceUpdates(jobCardId: string) {
  try {
    const updates = await db
      .select()
      .from(serviceTrackingUpdates)
      .where(eq(serviceTrackingUpdates.jobCardId, jobCardId))
      .orderBy(desc(serviceTrackingUpdates.createdAt))
      .limit(50);
    
    return updates;
  } catch (error) {
    console.error('Error fetching service updates:', error);
    return [];
  }
}

export async function createServiceUpdate(data: {
  jobCardId: string;
  status: string;
  title: string;
  description?: string;
  estimatedCompletion?: Date;
  technicianId?: string;
  photoUrls?: any;
  customerNotified?: boolean;
}) {
  try {
    const [update] = await db
      .insert(serviceTrackingUpdates)
      .values(data)
      .returning();
    
    return update;
  } catch (error) {
    console.error('Error creating service update:', error);
    throw new Error('Failed to create service update');
  }
}

export async function getJobCardTimeline(jobCardId: string) {
  try {
    const timeline = await db
      .select({
        id: serviceTrackingUpdates.id,
        status: serviceTrackingUpdates.status,
        title: serviceTrackingUpdates.title,
        description: serviceTrackingUpdates.description,
        estimatedCompletion: serviceTrackingUpdates.estimatedCompletion,
        completedAt: serviceTrackingUpdates.completedAt,
        technicianName: users.fullName,
        photoUrls: serviceTrackingUpdates.photoUrls,
        createdAt: serviceTrackingUpdates.createdAt,
      })
      .from(serviceTrackingUpdates)
      .leftJoin(users, eq(serviceTrackingUpdates.technicianId, users.id))
      .where(eq(serviceTrackingUpdates.jobCardId, jobCardId))
      .orderBy(serviceTrackingUpdates.createdAt);
    
    return timeline;
  } catch (error) {
    console.error('Error fetching job card timeline:', error);
    return [];
  }
}

// ========================================
// 2. VIDEO ESTIMATES
// ========================================

export async function createVideoEstimate(data: {
  garageId: string;
  customerId: string;
  vehicleId?: string;
  technicianId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  transcription?: string;
  estimatedCost?: number;
  recommendedServices?: any;
}) {
  try {
    const [estimate] = await db
      .insert(videoEstimates)
      .values({
        ...data,
        estimatedCost: data.estimatedCost?.toString(),
      })
      .returning();
    
    return estimate;
  } catch (error) {
    console.error('Error creating video estimate:', error);
    throw new Error('Failed to create video estimate');
  }
}

export async function getVideoEstimates(customerId: string) {
  try {
    const estimates = await db
      .select({
        id: videoEstimates.id,
        videoUrl: videoEstimates.videoUrl,
        thumbnailUrl: videoEstimates.thumbnailUrl,
        duration: videoEstimates.duration,
        estimatedCost: videoEstimates.estimatedCost,
        recommendedServices: videoEstimates.recommendedServices,
        status: videoEstimates.status,
        viewedAt: videoEstimates.viewedAt,
        approvedAt: videoEstimates.approvedAt,
        technicianName: users.fullName,
        createdAt: videoEstimates.createdAt,
      })
      .from(videoEstimates)
      .leftJoin(users, eq(videoEstimates.technicianId, users.id))
      .where(eq(videoEstimates.customerId, customerId))
      .orderBy(desc(videoEstimates.createdAt))
      .limit(20);
    
    return estimates;
  } catch (error) {
    console.error('Error fetching video estimates:', error);
    return [];
  }
}

export async function updateVideoEstimateStatus(id: string, status: string) {
  try {
    const updateData: any = { status };
    
    if (status === 'viewed') {
      updateData.viewedAt = new Date();
    } else if (status === 'approved') {
      updateData.approvedAt = new Date();
    }
    
    const [estimate] = await db
      .update(videoEstimates)
      .set(updateData)
      .where(eq(videoEstimates.id, id))
      .returning();
    
    return estimate;
  } catch (error) {
    console.error('Error updating video estimate status:', error);
    throw new Error('Failed to update video estimate');
  }
}

// ========================================
// 3. DIGITAL VEHICLE WALKAROUNDS
// ========================================

export async function createDigitalWalkaround(data: {
  jobCardId: string;
  vehicleId: string;
  technicianId: string;
  walkaroundType: string;
  photos: any;
  mileageReading?: number;
  fuelLevel?: string;
  damagePreviouslyNoted?: any;
  newDamageIdentified?: any;
  interiorCondition?: string;
}) {
  try {
    const [walkaround] = await db
      .insert(digitalWalkarounds)
      .values(data)
      .returning();
    
    return walkaround;
  } catch (error) {
    console.error('Error creating digital walkaround:', error);
    throw new Error('Failed to create digital walkaround');
  }
}

export async function getWalkaroundsByJobCard(jobCardId: string) {
  try {
    const walkarounds = await db
      .select()
      .from(digitalWalkarounds)
      .where(eq(digitalWalkarounds.jobCardId, jobCardId))
      .orderBy(desc(digitalWalkarounds.createdAt));
    
    return walkarounds;
  } catch (error) {
    console.error('Error fetching walkarounds:', error);
    return [];
  }
}

export async function signWalkaround(id: string, signatureUrl: string) {
  try {
    const [walkaround] = await db
      .update(digitalWalkarounds)
      .set({
        customerSignatureUrl: signatureUrl,
        signedAt: new Date(),
      })
      .where(eq(digitalWalkarounds.id, id))
      .returning();
    
    return walkaround;
  } catch (error) {
    console.error('Error signing walkaround:', error);
    throw new Error('Failed to sign walkaround');
  }
}

// ========================================
// 4. CUSTOMER REVIEWS & RATINGS
// ========================================

export async function createCustomerReview(data: {
  garageId: string;
  customerId: string;
  jobCardId?: string;
  rating: number;
  serviceQualityRating?: number;
  pricingRating?: number;
  speedRating?: number;
  communicationRating?: number;
  title?: string;
  comment?: string;
  wouldRecommend?: boolean;
  platform?: string;
}) {
  try {
    const [review] = await db
      .insert(customerReviews)
      .values(data)
      .returning();
    
    return review;
  } catch (error) {
    console.error('Error creating customer review:', error);
    throw new Error('Failed to create customer review');
  }
}

export async function getGarageReviews(garageId: string, limit: number = 50) {
  try {
    const reviews = await db
      .select({
        id: customerReviews.id,
        rating: customerReviews.rating,
        serviceQualityRating: customerReviews.serviceQualityRating,
        pricingRating: customerReviews.pricingRating,
        speedRating: customerReviews.speedRating,
        communicationRating: customerReviews.communicationRating,
        title: customerReviews.title,
        comment: customerReviews.comment,
        wouldRecommend: customerReviews.wouldRecommend,
        platform: customerReviews.platform,
        responseText: customerReviews.responseText,
        respondedAt: customerReviews.respondedAt,
        customerName: users.fullName,
        createdAt: customerReviews.createdAt,
      })
      .from(customerReviews)
      .leftJoin(users, eq(customerReviews.customerId, users.id))
      .where(and(
        eq(customerReviews.garageId, garageId),
        eq(customerReviews.isPublic, true)
      ))
      .orderBy(desc(customerReviews.createdAt))
      .limit(limit);
    
    return reviews;
  } catch (error) {
    console.error('Error fetching garage reviews:', error);
    return [];
  }
}

export async function respondToReview(reviewId: string, responseText: string, respondedBy: string) {
  try {
    const [review] = await db
      .update(customerReviews)
      .set({
        responseText,
        respondedAt: new Date(),
        respondedBy,
      })
      .where(eq(customerReviews.id, reviewId))
      .returning();
    
    return review;
  } catch (error) {
    console.error('Error responding to review:', error);
    throw new Error('Failed to respond to review');
  }
}

export async function getReviewAnalytics(garageId: string) {
  try {
    const analytics = await db
      .select({
        totalReviews: sql<number>`count(*)::int`,
        averageRating: sql<number>`ROUND(AVG(${customerReviews.rating})::numeric, 2)`,
        averageServiceQuality: sql<number>`ROUND(AVG(${customerReviews.serviceQualityRating})::numeric, 2)`,
        averagePricing: sql<number>`ROUND(AVG(${customerReviews.pricingRating})::numeric, 2)`,
        averageSpeed: sql<number>`ROUND(AVG(${customerReviews.speedRating})::numeric, 2)`,
        averageCommunication: sql<number>`ROUND(AVG(${customerReviews.communicationRating})::numeric, 2)`,
        wouldRecommendPercentage: sql<number>`ROUND((COUNT(*) FILTER (WHERE ${customerReviews.wouldRecommend} = true)::numeric / NULLIF(COUNT(*)::numeric, 0)) * 100, 1)`,
      })
      .from(customerReviews)
      .where(eq(customerReviews.garageId, garageId));
    
    return analytics[0] || {
      totalReviews: 0,
      averageRating: 0,
      averageServiceQuality: 0,
      averagePricing: 0,
      averageSpeed: 0,
      averageCommunication: 0,
      wouldRecommendPercentage: 0,
    };
  } catch (error) {
    console.error('Error fetching review analytics:', error);
    return {
      totalReviews: 0,
      averageRating: 0,
      averageServiceQuality: 0,
      averagePricing: 0,
      averageSpeed: 0,
      averageCommunication: 0,
      wouldRecommendPercentage: 0,
    };
  }
}

// ========================================
// 5. REFERRAL PROGRAMS
// ========================================

export async function getReferralPrograms(garageId: string) {
  try {
    const programs = await db
      .select()
      .from(referralPrograms)
      .where(and(
        eq(referralPrograms.garageId, garageId),
        eq(referralPrograms.isActive, true)
      ));
    
    return programs;
  } catch (error) {
    console.error('Error fetching referral programs:', error);
    return [];
  }
}

export async function generateReferralCode(customerId: string, programId: string, refereeEmail: string, refereeName?: string) {
  try {
    // Generate unique referral code
    const code = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const [referral] = await db
      .insert(customerReferrals)
      .values({
        referrerId: customerId,
        programId,
        referralCode: code,
        refereeEmail,
        refereeName,
        status: 'pending',
      })
      .returning();
    
    return referral;
  } catch (error) {
    console.error('Error generating referral code:', error);
    throw new Error('Failed to generate referral code');
  }
}

export async function applyReferralCode(code: string, refereeId: string) {
  try {
    // Find referral by code
    const [referral] = await db
      .select()
      .from(customerReferrals)
      .where(and(
        eq(customerReferrals.referralCode, code),
        eq(customerReferrals.status, 'pending')
      ))
      .limit(1);
    
    if (!referral) {
      throw new Error('Invalid or expired referral code');
    }
    
    // Check if already used
    if (referral.refereeId) {
      throw new Error('Referral code already used');
    }
    
    // Update referral with referee
    const [updated] = await db
      .update(customerReferrals)
      .set({
        refereeId,
        firstVisitDate: new Date(),
        status: 'pending',
      })
      .where(eq(customerReferrals.id, referral.id))
      .returning();
    
    return updated;
  } catch (error) {
    console.error('Error applying referral code:', error);
    throw error;
  }
}

export async function getReferralAnalytics(customerId: string) {
  try {
    const analytics = await db
      .select({
        totalReferrals: sql<number>`count(*)::int`,
        completedReferrals: sql<number>`count(*) FILTER (WHERE status = 'completed')::int`,
        pendingReferrals: sql<number>`count(*) FILTER (WHERE status = 'pending')::int`,
        totalEarned: sql<number>`COALESCE(SUM(${customerReferrals.firstPurchaseAmount}), 0)`,
      })
      .from(customerReferrals)
      .where(eq(customerReferrals.referrerId, customerId));
    
    return analytics[0] || {
      totalReferrals: 0,
      completedReferrals: 0,
      pendingReferrals: 0,
      totalEarned: 0,
    };
  } catch (error) {
    console.error('Error fetching referral analytics:', error);
    return {
      totalReferrals: 0,
      completedReferrals: 0,
      pendingReferrals: 0,
      totalEarned: 0,
    };
  }
}

export async function completeReferral(referralId: string, purchaseAmount: number) {
  try {
    const [referral] = await db
      .update(customerReferrals)
      .set({
        status: 'completed',
        firstPurchaseAmount: purchaseAmount.toString(),
        referrerRewardClaimed: true,
        referrerRewardClaimedAt: new Date(),
      })
      .where(eq(customerReferrals.id, referralId))
      .returning();
    
    return referral;
  } catch (error) {
    console.error('Error completing referral:', error);
    throw new Error('Failed to complete referral');
  }
}
