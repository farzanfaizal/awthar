import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { searchLocationsSchema } from "@/shared/validators";
import { db } from "@/lib/db";
import { locations } from "@/shared/schema";
import { eq, like, or, asc, desc, and } from "drizzle-orm";

/**
 * GET /api/locations - Get locations with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const { search, emirate, popular, limit = 100 } = searchLocationsSchema.parse(searchParams);

    const conditions = [];

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
        )!
      );
    }

    const result = await db
      .select()
      .from(locations)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(locations.popular), asc(locations.emirate), asc(locations.name))
      .limit(limit);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, { path: "/api/locations", method: "GET" });
  }
}
