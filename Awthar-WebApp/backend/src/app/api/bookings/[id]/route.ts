import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError, NotFoundError, ForbiddenError } from "@/lib/errors";
import { BookingService } from "@/services/booking.service";

type Params = { params: Promise<{ id: string }> };

function checkBookingAccess(booking: Record<string, unknown>, userId: string) {
  const isCustomer = (booking as { customerId?: string }).customerId === userId;
  const service = booking.service as { providerId?: string } | undefined;
  const provider = booking.provider as { userId?: string } | undefined;
  const isProvider = service?.providerId === userId || provider?.userId === userId;
  return { isCustomer, isProvider };
}

/**
 * GET /api/bookings/[id] - Get booking details
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const booking = await BookingService.getBookingById(id);

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    const { isCustomer, isProvider } = checkBookingAccess(booking as unknown as Record<string, unknown>, user.id);
    if (!isCustomer && !isProvider) {
      throw new ForbiddenError("You don't have permission to view this booking");
    }

    return NextResponse.json(booking);
  } catch (error) {
    return handleApiError(error, { path: "/api/bookings/[id]", method: "GET" });
  }
}

/**
 * DELETE /api/bookings/[id] - Cancel booking
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const booking = await BookingService.getBookingById(id);

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    const { isCustomer, isProvider } = checkBookingAccess(booking as unknown as Record<string, unknown>, user.id);
    if (!isCustomer && !isProvider) {
      throw new ForbiddenError("You don't have permission to cancel this booking");
    }

    const updatedBooking = await BookingService.cancelBooking(id, user.id);
    return NextResponse.json(updatedBooking);
  } catch (error) {
    return handleApiError(error, { path: "/api/bookings/[id]", method: "DELETE" });
  }
}
