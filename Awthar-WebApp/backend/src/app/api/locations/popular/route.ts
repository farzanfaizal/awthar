import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { db } from "@/lib/db";
import { locations } from "@/shared/schema";
import { eq, asc } from "drizzle-orm";

/**
 * GET /api/locations/popular - Get popular locations
 */
export async function GET() {
  try {
    const result = await db
      .select()
      .from(locations)
      .where(eq(locations.popular, true))
      .orderBy(asc(locations.emirate), asc(locations.name));

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, { path: "/api/locations/popular", method: "GET" });
  }
}
