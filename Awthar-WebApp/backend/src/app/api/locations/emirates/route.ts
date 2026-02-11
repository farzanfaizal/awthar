import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { db } from "@/lib/db";
import { locations } from "@/shared/schema";
import { asc } from "drizzle-orm";

/**
 * GET /api/locations/emirates - Get unique list of emirates
 */
export async function GET() {
  try {
    const result = await db
      .selectDistinct({ emirate: locations.emirate })
      .from(locations)
      .orderBy(asc(locations.emirate));

    return NextResponse.json(result.map((r) => r.emirate));
  } catch (error) {
    return handleApiError(error, { path: "/api/locations/emirates", method: "GET" });
  }
}
