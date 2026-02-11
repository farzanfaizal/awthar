import { db } from "@/lib/db";
import { providerProfiles, services, bookings, insertProviderProfileSchema } from "@/shared/schema";
import type { InsertProviderProfile } from "@/shared/schema";
import { eq, sql } from "drizzle-orm";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export class ProviderService {
  static async getAnalytics(userId: string) {
    const provider = await this.getProviderByUserId(userId);
    if (!provider) throw new Error("Provider profile not found");

    const providerBookings = await db.query.bookings.findMany({
      where: eq(bookings.providerId, provider.id),
      with: {
        service: {
          with: {
            category: true,
          },
        },
      },
    });

    const providerServices = await db.query.services.findMany({
      where: eq(services.providerId, provider.id),
    });

    const totalRevenue = providerBookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + parseFloat(b.agreedPrice || "0"), 0);

    const totalBookings = providerBookings.length;
    const totalViews = providerServices.reduce((sum, s) => sum + s.viewCount, 0);
    const conversionRate = totalViews > 0 ? (totalBookings / totalViews) * 100 : 0;

    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthName = format(date, "MMM");
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthlyRevenue = providerBookings
        .filter(
          (b) =>
            b.status === "completed" &&
            b.completedDate &&
            new Date(b.completedDate) >= monthStart &&
            new Date(b.completedDate) <= monthEnd
        )
        .reduce((sum, b) => sum + parseFloat(b.agreedPrice || "0"), 0);

      revenueData.push({ name: monthName, total: monthlyRevenue });
    }

    const serviceDistMap = new Map<string, number>();
    providerBookings.forEach((b) => {
      const catName = b.service?.category?.nameEn || "Other";
      serviceDistMap.set(catName, (serviceDistMap.get(catName) || 0) + 1);
    });

    const serviceData = Array.from(serviceDistMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      stats: { totalRevenue, totalBookings, totalViews, conversionRate },
      charts: { revenue: revenueData, services: serviceData },
    };
  }

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

    const [newProvider] = await db
      .insert(providerProfiles)
      .values(validatedData as typeof providerProfiles.$inferInsert)
      .returning();
    return newProvider;
  }

  static async updateProviderRating(providerId: string, newRating: number) {
    const provider = await db.query.providerProfiles.findFirst({
      where: eq(providerProfiles.id, providerId),
    });

    if (!provider) {
      console.error(`[ProviderService] updateProviderRating: provider ${providerId} not found`);
      return;
    }

    await db
      .update(providerProfiles)
      .set({
        ratingSum: sql`${providerProfiles.ratingSum} + ${newRating}`,
        totalReviews: sql`${providerProfiles.totalReviews} + 1`,
        rating: sql`(${providerProfiles.ratingSum} + ${newRating})::numeric / (${providerProfiles.totalReviews} + 1)`,
        updatedAt: new Date(),
      })
      .where(eq(providerProfiles.id, providerId));
  }
}
