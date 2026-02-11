import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError, BadRequestError } from "@/lib/errors";
import { BookingService } from "@/services/booking.service";
import { createBookingSchema, getBookingsSchema } from "@/shared/validators";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * POST /api/bookings - Create a booking
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimited = checkRateLimit(request, RATE_LIMITS.booking);
    if (rateLimited) return rateLimited;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    const scheduledDate = new Date(validatedData.scheduledDate);
    if (scheduledDate <= new Date()) {
      throw new BadRequestError("Scheduled date must be in the future");
    }

    const booking = await BookingService.createBooking({
      serviceId: validatedData.serviceId,
      customerId: user.id,
      scheduledDate,
      notes: validatedData.notes,
      agreedPrice: validatedData.agreedPrice,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return handleApiError(error, { path: "/api/bookings", method: "POST" });
  }
}

/**
 * GET /api/bookings - Get bookings for current user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validatedQuery = getBookingsSchema.parse(searchParams);

    const bookings = await BookingService.getBookings({
      userId: user.id,
      role: validatedQuery.role,
      status: validatedQuery.status,
      limit: validatedQuery.limit,
      offset: validatedQuery.offset,
    });

    return NextResponse.json(bookings);
  } catch (error) {
    return handleApiError(error, { path: "/api/bookings", method: "GET" });
  }
}
