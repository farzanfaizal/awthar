import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError, NotFoundError, ForbiddenError } from "@/lib/errors";
import { BookingService } from "@/services/booking.service";
import { updateBookingStatusSchema } from "@/shared/validators";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/bookings/[id]/status - Update booking status with transition validation
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = updateBookingStatusSchema.parse(body);

    const booking = await BookingService.getBookingById(id);
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    const isCustomer = booking.customerId === user.id;
    // provider relation is loaded via `with` in getBookingById but not in the base Booking type
    const provider = (booking as unknown as { provider?: { userId?: string } }).provider;
    const isProvider = provider?.userId === user.id;

    let allowed = false;

    if (isProvider) {
      if (booking.status === "pending" && (status === "accepted" || status === "cancelled")) allowed = true;
      if (booking.status === "accepted" && (status === "in_progress" || status === "cancelled")) allowed = true;
      if (booking.status === "in_progress" && (status === "completed" || status === "cancelled")) allowed = true;
    }

    if (isCustomer) {
      if (["pending", "accepted", "in_progress"].includes(booking.status) && status === "cancelled") allowed = true;
    }

    if (!allowed) {
      throw new ForbiddenError(`Transition from ${booking.status} to ${status} not allowed for your role`);
    }

    const updatedBooking = await BookingService.updateBookingStatus(id, status, user.id);
    return NextResponse.json(updatedBooking);
  } catch (error) {
    return handleApiError(error, { path: "/api/bookings/[id]/status", method: "PATCH" });
  }
}
