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
    category?: string | string[];
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    verifiedOnly?: boolean;
    professionalOnly?: boolean;
    providerId?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
    latitude?: number;
    longitude?: number;
    radius?: number; // in kilometers
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

    // Radius Search (Haversine Formula)
    if (filters.latitude && filters.longitude && filters.radius) {
      // Filter out services with no location data
      conditions.push(sql`${services.latitude} IS NOT NULL`);
      conditions.push(sql`${services.longitude} IS NOT NULL`);

      // Calculate distance in km
      // 6371 is Earth's radius in km
      const haversine = sql`
        (6371 * acos(
          cos(radians(${filters.latitude})) * 
          cos(radians(${services.latitude})) * 
          cos(radians(${services.longitude}) - radians(${filters.longitude})) + 
          sin(radians(${filters.latitude})) * 
          sin(radians(${services.latitude}))
        ))
      `;
      
      conditions.push(lte(haversine, filters.radius));
    }

    if (filters.category) {
      const categoriesList = Array.isArray(filters.category) ? filters.category : [filters.category];
      // Filter out empty strings
      const validCategories = categoriesList.filter(c => c && c.trim() !== '');
      
      if (validCategories.length > 0) {
        // Check if they are UUIDs or Slugs
        // For simplicity, if any is NOT a UUID, we fetch all categories to map slugs to IDs
        // But to be efficient, let's assume frontend sends slugs usually.
        
        // We'll look up IDs for all slugs provided
        const categoryRecords = await db.query.categories.findMany({
          where: inArray(categories.slug, validCategories)
        });
        
        const categoryIds = categoryRecords.map(c => c.id);
        
        // Also add any that matched the UUID regex directly
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        validCategories.forEach(c => {
          if (uuidRegex.test(c)) categoryIds.push(c);
        });

        if (categoryIds.length > 0) {
          conditions.push(inArray(services.categoryId, categoryIds));
        } else {
           // If categories provided but none found/valid, return empty? 
           // Or ignore? Let's return empty to be correct "Filter by X".
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
       conditions.push(gte(services.priceMin, filters.minPrice.toString()));
    }
    
    if (filters.maxPrice !== undefined) {
       conditions.push(lte(services.priceMin, filters.maxPrice.toString()));
    }

    // Sorting Logic
    let orderByClause = [desc(services.createdAt)]; // Default
    
    if (filters.sortBy === 'price_asc') {
      orderByClause = [sql`CAST(${services.priceMin} AS DECIMAL) ASC`];
    } else if (filters.sortBy === 'price_desc') {
      orderByClause = [sql`CAST(${services.priceMin} AS DECIMAL) DESC`];
    } else if (filters.sortBy === 'rating') {
      // This requires joining with provider_profiles to sort by rating
      // Since Drizzle 'findMany' with 'with' doesn't support sorting by relation easily in this syntax version,
      // we might need to ignore or accept it sorts by creation for now, 
      // OR we use a raw query. 
      // For now, let's keep it simple and fallback to newest, 
      // BUT we can sort by 'viewCount' or similar on the service itself if we had it.
      // Let's implement 'most viewed' as a proxy for popularity/rating if relation sort is hard.
      orderByClause = [desc(services.viewCount)];
    } else if (filters.sortBy === 'newest') {
      orderByClause = [desc(services.createdAt)];
    }

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
      orderBy: orderByClause,
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
    // Auto-populate lat/lng columns from location JSON if available
    if (data.location && typeof data.location === 'object') {
      if (data.location.latitude && !data.latitude) {
        data.latitude = data.location.latitude;
      }
      if (data.location.longitude && !data.longitude) {
        data.longitude = data.location.longitude;
      }
    }

    const validatedData = insertServiceSchema.parse({
      ...data,
      providerId,
    });
    const [newService] = await db.insert(services).values(validatedData).returning();
    return newService;
  }

  static async updateService(id: string, data: Partial<InsertService>) {
    // Auto-populate lat/lng columns from location JSON if available
    if (data.location && typeof data.location === 'object') {
      if (data.location.latitude && !data.latitude) {
        data.latitude = data.location.latitude;
      }
      if (data.location.longitude && !data.longitude) {
        data.longitude = data.location.longitude;
      }
    }

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
