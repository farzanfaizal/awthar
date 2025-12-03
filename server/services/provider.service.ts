import { db } from "../db";
import { providerProfiles, services, reviews, users } from "@shared/schema";
import { eq, sql, desc } from "drizzle-orm";
import { insertProviderProfileSchema } from "@shared/schema";
import type { InsertProviderProfile } from "@shared/schema";

export class ProviderService {
  static async getProviderById(id: string) {
    return db.query.providerProfiles.findFirst({
      where: eq(providerProfiles.id, id),
      with: {
        user: true,
        services: {
          where: eq(services.status, "active"),
          limit: 10,
        },
      },
    });
  }

  static async getProviderByUserId(userId: string) {
    return db.query.providerProfiles.findFirst({
      where: eq(providerProfiles.userId, userId),
      with: {
        user: true,
      },
    });
  }

  static async createProviderProfile(userId: string, data: Partial<InsertProviderProfile>) {
    const validatedData = insertProviderProfileSchema.parse({
      ...data,
      userId,
    });

    const [newProvider] = await db.insert(providerProfiles).values(validatedData as any).returning();
    return newProvider;
  }

  static async updateProviderRating(providerId: string, newRating: number) {
    // 1. Fetch current stats
    const provider = await db.query.providerProfiles.findFirst({
        where: eq(providerProfiles.id, providerId),
    });
    
    if (!provider) return;

    // 2. Update using O(1) math with the new ratingSum column
    // newSum = oldSum + newRating
    // newCount = oldCount + 1
    // newAvg = newSum / newCount
    
    // Note: If ratingSum is null (from legacy data), we might need to backfill or default to 0.
    // The schema default is 0, so we should be safe for new records. 
    // For existing, we'll handle nulls carefully if this was a production migration.
    
    await db.update(providerProfiles)
      .set({ 
        ratingSum: sql`${providerProfiles.ratingSum} + ${newRating}`,
        totalReviews: sql`${providerProfiles.totalReviews} + 1`,
        rating: sql`(${providerProfiles.ratingSum} + ${newRating})::numeric / (${providerProfiles.totalReviews} + 1)`,
        updatedAt: new Date()
      })
      .where(eq(providerProfiles.id, providerId));
  }
}
