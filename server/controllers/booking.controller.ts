import { Router } from "express";
import { BookingService } from "../services/booking.service";
import { isAuthenticated, getUserId } from "../auth";
import { z } from "zod";

const router = Router();

// Create booking
router.post("/", isAuthenticated, async (req, res) => {
  try {
    // Basic validation schema
    const createBookingSchema = z.object({
      serviceId: z.string().uuid(),
      scheduledDate: z.string().datetime(), // Expect ISO string
      notes: z.string().optional(),
      agreedPrice: z.number().optional(),
    });

    const validatedData = createBookingSchema.parse(req.body);
    const userId = getUserId(req);

    const booking = await BookingService.createBooking({
      serviceId: validatedData.serviceId,
      customerId: userId,
      scheduledDate: new Date(validatedData.scheduledDate),
      notes: validatedData.notes,
      agreedPrice: validatedData.agreedPrice
    });

    res.status(201).json(booking);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Get bookings (for logged-in user)
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { role, status, limit, offset } = req.query;

    if (role !== 'customer' && role !== 'provider') {
      return res.status(400).json({ message: "Role must be 'customer' or 'provider'" });
    }

    const bookings = await BookingService.getBookings({
      userId,
      role: role as 'customer' | 'provider',
      status: status as any,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    });

    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get booking details
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const bookingId = req.params.id;

    const booking = await BookingService.getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check access rights
    // Customer can see their own bookings
    // Provider can see bookings for their services
    const isCustomer = booking.customerId === userId;
    const isProvider = (booking as any).provider.userId === userId;

    if (!isCustomer && !isProvider) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking status
router.patch("/:id/status", isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const bookingId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const booking = await BookingService.getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isCustomer = booking.customerId === userId;
    const isProvider = (booking as any).provider.userId === userId;

    // Validate status transitions
    // pending -> accepted (provider only)
    // pending -> cancelled (both)
    // accepted -> in_progress (provider only)
    // accepted -> cancelled (both)
    // in_progress -> completed (provider only)
    // in_progress -> cancelled (both)
    
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
      return res.status(403).json({ message: `Transition from ${booking.status} to ${status} not allowed for this user role` });
    }

    const updatedBooking = await BookingService.updateBookingStatus(bookingId, status, userId);
    res.json(updatedBooking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking (Delete verb often used for cancellation, but here we update status)
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).claims.sub;
    const bookingId = req.params.id;

    // Reuse the status update logic logic
    const booking = await BookingService.getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isCustomer = booking.customerId === userId;
    const isProvider = (booking as any).provider.userId === userId;

    if (!isCustomer && !isProvider) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedBooking = await BookingService.cancelBooking(bookingId, userId);
    res.json(updatedBooking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export const bookingController = router;
