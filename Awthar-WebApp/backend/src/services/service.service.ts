import { db } from "@/lib/db";
import { services, categories, insertServiceSchema } from "@/shared/schema";
import type { InsertService } from "@/shared/schema";
import { eq, and, desc, sql, lte, inArray } from "drizzle-orm";

export class ServiceService {
  static async getCategories() {
    return db
      .select({
        id: categories.id,
        nameEn: categories.nameEn,
        nameAr: categories.nameAr,
        slug: categories.slug,
        descriptionEn: categories.descriptionEn,
        descriptionAr: categories.descriptionAr,
        iconName: categories.iconName,
        parentId: categories.parentId,
        displayOrder: categories.displayOrder,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
        serviceCount: sql<number>`count(${services.id})::int`.as("serviceCount"),
      })
      .from(categories)
      .leftJoin(
        services,
        and(
          eq(services.categoryId, categories.id),
          eq(services.status, "active")
        )
      )
      .where(eq(categories.isActive, true))
      .groupBy(categories.id)
      .orderBy(categories.displayOrder);
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
    providerId?: string;
    limit?: number;
    offset?: number;
    sortBy?: "price_asc" | "price_desc" | "rating" | "newest";
    latitude?: number;
    longitude?: number;
    radius?: number;
    paymentMethods?: string[];
  }) {
    const conditions = [];

    if (filters.providerId) {
      conditions.push(eq(services.providerId, filters.providerId));
      conditions.push(sql`${services.status} != 'deleted'`);
    } else {
      conditions.push(eq(services.status, "active"));
    }

    // Haversine radius search
    if (filters.latitude && filters.longitude && filters.radius) {
      conditions.push(sql`${services.latitude} IS NOT NULL`);
      conditions.push(sql`${services.longitude} IS NOT NULL`);

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
      const categoriesList = Array.isArray(filters.category)
        ? filters.category
        : [filters.category];
      const validCategories = categoriesList.filter((c) => c && c.trim() !== "");

      if (validCategories.length > 0) {
        const categoryRecords = await db.query.categories.findMany({
          where: inArray(categories.slug, validCategories),
        });

        const categoryIds = categoryRecords.map((c) => c.id);

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        validCategories.forEach((c) => {
          if (uuidRegex.test(c)) categoryIds.push(c);
        });

        if (categoryIds.length > 0) {
          conditions.push(inArray(services.categoryId, categoryIds));
        } else {
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
      conditions.push(sql`CAST(${services.priceMin} AS DECIMAL) >= ${filters.minPrice}`);
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(
        sql`COALESCE(CAST(${services.priceMax} AS DECIMAL), CAST(${services.priceMin} AS DECIMAL)) <= ${filters.maxPrice}`
      );
    }

    if (filters.paymentMethods && filters.paymentMethods.length > 0) {
      conditions.push(
        sql`${services.paymentMethods} && ARRAY[${sql.join(
          filters.paymentMethods.map((m) => sql`${m}`),
          sql`, `
        )}]::text[]`
      );
    }

    let orderByClause = [desc(services.createdAt)];

    if (filters.sortBy === "price_asc") {
      orderByClause = [sql`CAST(${services.priceMin} AS DECIMAL) ASC`];
    } else if (filters.sortBy === "price_desc") {
      orderByClause = [sql`CAST(${services.priceMin} AS DECIMAL) DESC`];
    } else if (filters.sortBy === "rating") {
      orderByClause = [desc(services.viewCount)]; // Uses view count as popularity proxy
    } else if (filters.sortBy === "newest") {
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
    await db
      .update(services)
      .set({ viewCount: sql`${services.viewCount} + 1` })
      .where(eq(services.id, id));
  }

  static async createService(providerId: string, data: Partial<InsertService>) {
    if (data.location && typeof data.location === "object") {
      if (data.location.latitude && !data.latitude) {
        data.latitude = data.location.latitude.toString();
      }
      if (data.location.longitude && !data.longitude) {
        data.longitude = data.location.longitude.toString();
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
    if (data.location && typeof data.location === "object") {
      if (data.location.latitude && !data.latitude) {
        data.latitude = data.location.latitude.toString();
      }
      if (data.location.longitude && !data.longitude) {
        data.longitude = data.location.longitude.toString();
      }
    }

    const validatedData = insertServiceSchema.partial().parse(data);
    const [updatedService] = await db
      .update(services)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  static async deleteService(id: string) {
    await db
      .update(services)
      .set({ status: "deleted" })
      .where(eq(services.id, id));
  }
}
