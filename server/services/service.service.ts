import { db } from "../db";
import { services, categories, providerProfiles } from "@shared/schema";
import { eq, and, desc, sql, ilike, or, gte, lte, inArray } from "drizzle-orm";
import { insertServiceSchema } from "@shared/schema";
import type { InsertService } from "@shared/schema";

export class ServiceService {
  static async getCategories() {
    return db.query.categories.findMany({
      where: eq(categories.isActive, true),
      orderBy: [categories.displayOrder],
    });
  }

  static async getCategoryBySlug(slug: string) {
    return db.query.categories.findFirst({
      where: and(
        eq(categories.slug, slug),
        eq(categories.isActive, true)
      ),
    });
  }

  static async searchServices(filters: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    verifiedOnly?: boolean;
    professionalOnly?: boolean;
    providerId?: string;
    limit?: number;
    offset?: number;
  }) {
    const conditions = [];

    // If providerId is set, we want to show their services regardless of status (unless deleted)
    // Otherwise show only active
    if (filters.providerId) {
      conditions.push(eq(services.providerId, filters.providerId));
      conditions.push(sql`${services.status} != 'deleted'`);
    } else {
      conditions.push(eq(services.status, "active"));
    }

    if (filters.category) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(filters.category)) {
        conditions.push(eq(services.categoryId, filters.category));
      } else {
        const categoryRecord = await db.query.categories.findFirst({
          where: eq(categories.slug, filters.category)
        });
        
        if (categoryRecord) {
          conditions.push(eq(services.categoryId, categoryRecord.id));
        } else {
          // Category filter provided but not found - return empty result
          return [];
        }
      }
    }

    if (filters.search) {
      conditions.push(
        sql`(${services.titleEn} ILIKE ${`%${filters.search}%`} OR ${services.descriptionEn} ILIKE ${`%${filters.search}%`})`
      );
    }

    if (filters.minPrice !== undefined) {
       // Assuming 'fixed' pricing for simplicity in this query, or checking min_price
       conditions.push(gte(services.priceMin, filters.minPrice.toString()));
    }
    
    if (filters.maxPrice !== undefined) {
       // Use priceMin for max filter because priceMax might be null (fixed price)
       // We want services starting at or below the max budget
       conditions.push(lte(services.priceMin, filters.maxPrice.toString()));
    }

    // Complex filters requiring joins (rating, verification) are harder in simple 'findMany' 
    // without 'where' on relations which Drizzle supports partially.
    // We will do a two-step filter or use 'where' on relations if Drizzle version supports it well enough.
    // Given Drizzle version, we can filter on relations in 'findMany' but it's sometimes tricky.
    // Let's stick to core service filters for now to ensure stability, 
    // and handle advanced provider-based filtering by fetching and filtering in memory if needed 
    // OR by using a raw SQL query builder for maximum performance. 
    // For this scale, let's add what we can.

    return db.query.services.findMany({
      where: and(...conditions),
      with: {
        provider: {
          with: {
            user: true,
          },
        },
        category: true,
      },
      orderBy: [desc(services.createdAt)],
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    });
  }

  static async getServiceById(id: string) {
    return db.query.services.findFirst({
      where: eq(services.id, id),
      with: {
        provider: {
          with: {
            user: true,
          },
        },
        category: true,
      },
    });
  }

  static async incrementViewCount(id: string) {
    await db.update(services)
      .set({ viewCount: sql`${services.viewCount} + 1` })
      .where(eq(services.id, id));
  }

  static async createService(providerId: string, data: Partial<InsertService>) {
    const validatedData = insertServiceSchema.parse({
      ...data,
      providerId,
    });
    const [newService] = await db.insert(services).values(validatedData).returning();
    return newService;
  }

  static async updateService(id: string, data: Partial<InsertService>) {
    const validatedData = insertServiceSchema.partial().parse(data);
    const [updatedService] = await db.update(services)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  static async deleteService(id: string) {
    await db.update(services)
      .set({ status: "deleted" })
      .where(eq(services.id, id));
  }
}
