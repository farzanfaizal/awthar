import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { db } from "@/lib/db";
import { locations } from "@/shared/schema";
import { like, or, asc, desc } from "drizzle-orm";

type Params = { params: Promise<{ query: string }> };

/**
 * GET /api/locations/search/[query] - Search locations by name
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { query } = await params;
    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : 10;

    const result = await db
      .select()
      .from(locations)
      .where(
        or(
          like(locations.name, `%${query}%`),
          like(locations.emirate, `%${query}%`)
        )
      )
      .orderBy(desc(locations.popular), asc(locations.name))
      .limit(limit);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, { path: "/api/locations/search/[query]", method: "GET" });
  }
}
