import { Router, Request, Response } from "express";
import { db } from "../db";
import { locations } from "@shared/schema";
import { eq, like, or, asc, desc } from "drizzle-orm";
import { asyncHandler } from "../lib/errors";
import { z } from "zod";

const locationRouter = Router();

// Validation schema for search
const searchLocationsSchema = z.object({
  search: z.string().optional(),
  emirate: z.string().optional(),
  popular: z.string().transform(val => val === 'true').optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().positive().max(100)).optional(),
});

/**
 * GET /api/locations
 * Get all locations with optional filtering
 */
locationRouter.get("/", asyncHandler(async (req: Request, res: Response) => {
  const { search, emirate, popular, limit = 100 } = searchLocationsSchema.parse(req.query);

  let query = db.select().from(locations);

  // Build conditions array
  const conditions: any[] = [];

  if (emirate) {
    conditions.push(eq(locations.emirate, emirate));
  }

  if (popular !== undefined) {
    conditions.push(eq(locations.popular, popular));
  }

  if (search) {
    conditions.push(
      or(
        like(locations.name, `%${search}%`),
        like(locations.emirate, `%${search}%`)
      )
    );
  }

  // Execute query with conditions
  let result;
  if (conditions.length > 0) {
    // Apply conditions using where clause
    result = await db.select()
      .from(locations)
      .where(conditions.length === 1 ? conditions[0] : conditions.reduce((a, b) => a && b))
      .orderBy(desc(locations.popular), asc(locations.emirate), asc(locations.name))
      .limit(limit);
  } else {
    result = await db.select()
      .from(locations)
      .orderBy(desc(locations.popular), asc(locations.emirate), asc(locations.name))
      .limit(limit);
  }

  res.json(result);
}));

/**
 * GET /api/locations/popular
 * Get popular locations only
 */
locationRouter.get("/popular", asyncHandler(async (req: Request, res: Response) => {
  const result = await db.select()
    .from(locations)
    .where(eq(locations.popular, true))
    .orderBy(asc(locations.emirate), asc(locations.name));

  res.json(result);
}));

/**
 * GET /api/locations/emirates
 * Get unique list of emirates
 */
locationRouter.get("/emirates", asyncHandler(async (req: Request, res: Response) => {
  const result = await db.selectDistinct({ emirate: locations.emirate })
    .from(locations)
    .orderBy(asc(locations.emirate));

  res.json(result.map(r => r.emirate));
}));

/**
 * GET /api/locations/search/:query
 * Search locations by name
 */
locationRouter.get("/search/:query", asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.params;
  const { limit = 10 } = req.query;

  const result = await db.select()
    .from(locations)
    .where(
      or(
        like(locations.name, `%${query}%`),
        like(locations.emirate, `%${query}%`)
      )
    )
    .orderBy(desc(locations.popular), asc(locations.name))
    .limit(Number(limit));

  res.json(result);
}));

export { locationRouter };
