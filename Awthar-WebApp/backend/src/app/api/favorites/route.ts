import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError, BadRequestError } from "@/lib/errors";
import { addFavoriteSchema } from "@/shared/validators";
import { db } from "@/lib/db";
import { favorites } from "@/shared/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * GET /api/favorites - Get user's favorite services with full provider data
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userFavorites = await db.query.favorites.findMany({
      where: eq(favorites.userId, user.id),
      orderBy: [desc(favorites.createdAt)],
      with: {
        service: {
          with: {
            provider: {
              with: { user: true },
            },
            category: true,
          },
        },
      },
    });

    return NextResponse.json(userFavorites);
  } catch (error) {
    return handleApiError(error, { path: "/api/favorites", method: "GET" });
  }
}

/**
 * POST /api/favorites - Add service to favorites
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = addFavoriteSchema.parse(body);

    const existing = await db.query.favorites.findFirst({
      where: and(
        eq(favorites.userId, user.id),
        eq(favorites.serviceId, validatedData.serviceId)
      ),
    });

    if (existing) {
      throw new BadRequestError("Service already in favorites");
    }

    const [favorite] = await db
      .insert(favorites)
      .values({ userId: user.id, serviceId: validatedData.serviceId })
      .returning();

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    return handleApiError(error, { path: "/api/favorites", method: "POST" });
  }
}
