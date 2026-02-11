import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { db } from "@/lib/db";
import { favorites } from "@/shared/schema";
import { eq, and } from "drizzle-orm";

type Params = { params: Promise<{ serviceId: string }> };

/**
 * DELETE /api/favorites/[serviceId] - Remove from favorites
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { serviceId } = await params;

    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, user.id),
          eq(favorites.serviceId, serviceId)
        )
      );

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error) {
    return handleApiError(error, { path: "/api/favorites/[serviceId]", method: "DELETE" });
  }
}
