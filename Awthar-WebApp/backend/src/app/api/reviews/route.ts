import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError, ForbiddenError, BadRequestError } from "@/lib/errors";
import { ReviewService } from "@/services/review.service";
import { BookingService } from "@/services/booking.service";
import { createReviewSchema } from "@/shared/validators";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * POST /api/reviews - Create a review
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimited = checkRateLimit(request, RATE_LIMITS.review);
    if (rateLimited) return rateLimited;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);

    // Verify the reviewer owns this booking and it's completed
    if (validatedData.bookingId) {
      const booking = await BookingService.getBookingById(validatedData.bookingId);
      if (!booking) {
        throw new BadRequestError("Booking not found");
      }
      if (booking.customerId !== user.id) {
        throw new ForbiddenError("You can only review your own bookings");
      }
      if (booking.status !== "completed") {
        throw new BadRequestError("You can only review completed bookings");
      }
    }

    const newReview = await ReviewService.createReview(user.id, validatedData);
    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    return handleApiError(error, { path: "/api/reviews", method: "POST" });
  }
}
