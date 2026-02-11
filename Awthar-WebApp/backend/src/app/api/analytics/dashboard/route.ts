import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError, NotFoundError } from "@/lib/errors";
import { ProviderService } from "@/services/provider.service";
import { db } from "@/lib/db";
import { services, conversations } from "@/shared/schema";
import { eq, count } from "drizzle-orm";

/**
 * GET /api/analytics/dashboard - Get dashboard stats for provider
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const provider = await ProviderService.getProviderByUserId(user.id);
    if (!provider) {
      throw new NotFoundError("Provider profile not found");
    }

    const providerServices = await db.query.services.findMany({
      where: eq(services.providerId, provider.id),
    });

    const activeListings = providerServices.filter((s) => s.status === "active").length;
    const totalListings = providerServices.length;
    const totalViews = providerServices.reduce((sum, s) => sum + s.viewCount, 0);

    const [contactRequestsResult] = await db
      .select({ count: count() })
      .from(conversations)
      .where(eq(conversations.providerId, provider.id));

    const contactRequests = contactRequestsResult?.count || 0;

    const averageRating = provider.rating ? parseFloat(provider.rating.toString()) : 0;
    const reviewCount = provider.totalReviews || 0;

    return NextResponse.json({
      profileViews: totalViews,
      contactRequests,
      activeListings,
      totalListings,
      averageRating,
      reviewCount,
    });
  } catch (error) {
    return handleApiError(error, { path: "/api/analytics/dashboard", method: "GET" });
  }
}
