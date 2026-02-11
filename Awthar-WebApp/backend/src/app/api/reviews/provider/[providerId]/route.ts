import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { ReviewService } from "@/services/review.service";

type Params = { params: Promise<{ providerId: string }> };

/**
 * GET /api/reviews/provider/[providerId] - Get reviews for a provider (public)
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { providerId } = await params;
    const reviews = await ReviewService.getProviderReviews(providerId);
    return NextResponse.json(reviews);
  } catch (error) {
    return handleApiError(error, { path: "/api/reviews/provider/[providerId]", method: "GET" });
  }
}
