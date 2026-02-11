import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { db } from "@/lib/db";
import { favorites } from "@/shared/schema";
import { eq, and } from "drizzle-orm";

type Params = { params: Promise<{ serviceId: string }> };

/**
 * GET /api/favorites/check/[serviceId] - Check if service is favorited
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { serviceId } = await params;

    const favorite = await db.query.favorites.findFirst({
      where: and(
        eq(favorites.userId, user.id),
        eq(favorites.serviceId, serviceId)
      ),
    });

    return NextResponse.json({ isFavorited: !!favorite });
  } catch (error) {
    return handleApiError(error, { path: "/api/favorites/check/[serviceId]", method: "GET" });
  }
}
