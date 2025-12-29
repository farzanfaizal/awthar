import { db } from "../db";
import { providerProfiles, services, bookings, categories } from "@shared/schema";
import { eq, sql, desc, and, inArray } from "drizzle-orm";
import { insertProviderProfileSchema } from "@shared/schema";
import type { InsertProviderProfile } from "@shared/schema";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export class ProviderService {
  static async getAnalytics(userId: string) {
    const provider = await this.getProviderByUserId(userId);
    if (!provider) throw new Error("Provider profile not found");

    // 1. Fetch Bookings
    const providerBookings = await db.query.bookings.findMany({
      where: eq(bookings.providerId, provider.id),
      with: {
        service: {
          with: {
            category: true
          }
        }
      }
    });

    // 2. Fetch Services (for views)
    const providerServices = await db.query.services.findMany({
      where: eq(services.providerId, provider.id)
    });

    // 3. Calculate Stats
    const totalRevenue = providerBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (parseFloat(b.agreedPrice || "0")), 0);

    // Bookings count (excluding cancelled for success metric, or all for activity? Let's do active+completed)
    // Actually, dashboard usually shows "Total Bookings" received.
    const validBookings = providerBookings.filter(b => b.status !== 'cancelled');
    const totalBookings = providerBookings.length; // Raw count

    // Views
    const totalViews = providerServices.reduce((sum, s) => sum + s.viewCount, 0);

    // Conversion (Bookings / Views)
    // Avoid division by zero
    const conversionRate = totalViews > 0 ? (totalBookings / totalViews) * 100 : 0;

    // 4. Chart Data: Revenue (Last 6 Months)
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthName = format(date, "MMM");
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthlyRevenue = providerBookings
        .filter(b => 
          b.status === 'completed' && 
          b.completedDate && 
          new Date(b.completedDate) >= monthStart && 
          new Date(b.completedDate) <= monthEnd
        )
        .reduce((sum, b) => sum + (parseFloat(b.agreedPrice || "0")), 0);

      revenueData.push({ name: monthName, total: monthlyRevenue });
    }

    // 5. Chart Data: Service Distribution
    const serviceDistMap = new Map<string, number>();
    providerBookings.forEach(b => {
      const catName = b.service?.category?.nameEn || "Other";
      serviceDistMap.set(catName, (serviceDistMap.get(catName) || 0) + 1);
    });

    const serviceData = Array.from(serviceDistMap.entries()).map(([name, value]) => ({
      name,
      value
    }));

    return {
      stats: {
        totalRevenue,
        totalBookings,
        totalViews,
        conversionRate,
      },
      charts: {
        revenue: revenueData,
        services: serviceData
      }
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
