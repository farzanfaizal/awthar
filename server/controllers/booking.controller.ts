import { Router, Request, Response } from "express";
import { BookingService } from "../services/booking.service";
import { isAuthenticated, getUserId } from "../auth";
import { bookingLimiter } from "../middleware/rate-limit";
import { z } from "zod";
import { asyncHandler, BadRequestError, NotFoundError, ForbiddenError } from "../lib/errors";

const router = Router();

// Validation schemas
const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  scheduledDate: z.string().datetime(),
  notes: z.string().max(500).optional(),
  agreedPrice: z.number().positive().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'in_progress', 'completed', 'cancelled']),
});

const getBookingsSchema = z.object({
  role: z.enum(['customer', 'provider']),
  status: z.enum(['pending', 'accepted', 'in_progress', 'completed', 'cancelled']).optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().positive().max(100)).optional(),
  offset: z.string().transform(val => parseInt(val)).pipe(z.number().nonnegative()).optional(),
});

// Helper to check booking access
function checkBookingAccess(booking: any, userId: string): {isCustomer: boolean, isProvider: boolean} {
  const isCustomer = booking.customerId === userId;
  const isProvider = booking.service?.providerId === userId || booking.provider?.userId === userId;
  return { isCustomer, isProvider };
}

// Create booking
router.post("/", isAuthenticated, bookingLimiter, asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createBookingSchema.parse(req.body);
  const userId = getUserId(req);

  const scheduledDate = new Date(validatedData.scheduledDate);

  // Validate future date
  if (scheduledDate <= new Date()) {
    throw new BadRequestError("Scheduled date must be in the future");
  }

  const booking = await BookingService.createBooking({
    serviceId: validatedData.serviceId,
    customerId: userId,
    scheduledDate,
    notes: validatedData.notes,
    agreedPrice: validatedData.agreedPrice
  });

  res.status(201).json(booking);
}));

// Get bookings (for logged-in user)
router.get("/", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const validatedQuery = getBookingsSchema.parse(req.query);

  const bookings = await BookingService.getBookings({
    userId,
    role: validatedQuery.role,
    status: validatedQuery.status,
    limit: validatedQuery.limit,
    offset: validatedQuery.offset
  });

  res.json(bookings);
}));

// Get booking details
router.get("/:id", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const bookingId = req.params.id;

  const booking = await BookingService.getBookingById(bookingId);

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  // Check access rights
  const { isCustomer, isProvider } = checkBookingAccess(booking, userId);

  if (!isCustomer && !isProvider) {
    throw new ForbiddenError("You don't have permission to view this booking");
  }

  res.json(booking);
}));

// Update booking status
router.patch("/:id/status", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const bookingId = req.params.id;
  const { status } = updateStatusSchema.parse(req.body);

  const booking = await BookingService.getBookingById(bookingId);
  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  const { isCustomer, isProvider } = checkBookingAccess(booking, userId);

  // Validate status transitions
  let allowed = false;

  if (isProvider) {
    if (booking.status === 'pending' && (status === 'accepted' || status === 'cancelled')) allowed = true;
    if (booking.status === 'accepted' && (status === 'in_progress' || status === 'cancelled')) allowed = true;
    if (booking.status === 'in_progress' && (status === 'completed' || status === 'cancelled')) allowed = true;
  }

  if (isCustomer) {
    if (['pending', 'accepted', 'in_progress'].includes(booking.status) && status === 'cancelled') allowed = true;
  }

  if (!allowed) {
    throw new ForbiddenError(`Transition from ${booking.status} to ${status} not allowed for your role`);
  }

  const updatedBooking = await BookingService.updateBookingStatus(bookingId, status, userId);
  res.json(updatedBooking);
}));

// Cancel booking
router.delete("/:id", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const bookingId = req.params.id;

  const booking = await BookingService.getBookingById(bookingId);
  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  const { isCustomer, isProvider } = checkBookingAccess(booking, userId);

  if (!isCustomer && !isProvider) {
    throw new ForbiddenError("You don't have permission to cancel this booking");
  }

  const updatedBooking = await BookingService.cancelBooking(bookingId, userId);
  res.json(updatedBooking);
}));

export const bookingController = router;
