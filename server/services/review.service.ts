import { db } from "../db";
import { reviews, providerProfiles } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { insertReviewSchema } from "@shared/schema";
import type { InsertReview } from "@shared/schema";
import { ProviderService } from "./provider.service";

export class ReviewService {
  static async getProviderReviews(providerId: string) {
    return db.query.reviews.findMany({
      where: eq(reviews.providerId, providerId),
      with: {
        customer: true,
        booking: true,
      },
      orderBy: [desc(reviews.createdAt)],
      limit: 50,
    });
  }

  static async createReview(customerId: string, data: Partial<InsertReview>) {
    const validatedData = insertReviewSchema.parse({
      ...data,
      customerId,
    });

    const [newReview] = await db.insert(reviews).values(validatedData).returning();

    // Efficiently update provider rating using the new O(1) method
    await ProviderService.updateProviderRating(validatedData.providerId, validatedData.rating);

    return newReview;
  }
}
