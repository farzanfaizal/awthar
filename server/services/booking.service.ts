import { db } from "../db";
import { 
  bookings, 
  services, 
  users, 
  providerProfiles, 
  type Booking, 
  type InsertBooking, 
  bookingStatusEnum
} from "@shared/schema";
import { eq, and, desc, or, gte, lte, sql } from "drizzle-orm";

type BookingStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled";

export class BookingService {
  // Create booking
  static async createBooking(data: {
    serviceId: string;
    customerId: string;
    scheduledDate: Date;
    notes?: string;
    agreedPrice?: number;
  }): Promise<Booking> {
    // Verify service exists and is active
    const service = await db.query.services.findFirst({
      where: eq(services.id, data.serviceId),
      with: {
        provider: true
      }
    });

    if (!service) {
      throw new Error("Service not found");
    }

    if (service.status !== "active") {
      throw new Error("Service is not active");
    }

    // Use provided price or service minimum price as fallback
    const price = data.agreedPrice || parseFloat(service.priceMin || "0");

    const [booking] = await db.insert(bookings).values({
      serviceId: data.serviceId,
      customerId: data.customerId,
      providerId: service.providerId,
      status: "pending",
      scheduledDate: data.scheduledDate,
      notes: data.notes,
      agreedPrice: price.toString(),
    }).returning();

    return booking;
  }

  // Get booking by ID
  static async getBookingById(id: string): Promise<Booking | undefined> {
    return db.query.bookings.findFirst({
      where: eq(bookings.id, id),
      with: {
        service: true,
        customer: true,
        provider: {
          with: {
            user: true
          }
        }
      }
    });
  }

  // List bookings (filtered by user role)
  static async getBookings(filters: {
    userId: string;
    role: 'customer' | 'provider';
    status?: BookingStatus;
    limit?: number;
    offset?: number;
  }) {
    let whereClause;

    if (filters.role === 'customer') {
      whereClause = eq(bookings.customerId, filters.userId);
    } else {
      // For providers, we need to find their provider profile ID first
      const profile = await db.query.providerProfiles.findFirst({
        where: eq(providerProfiles.userId, filters.userId)
      });

      if (!profile) {
        return [];
      }

      whereClause = eq(bookings.providerId, profile.id);
    }

    if (filters.status) {
      whereClause = and(whereClause, eq(bookings.status, filters.status));
    }

    return db.query.bookings.findMany({
      where: whereClause,
      orderBy: [desc(bookings.createdAt)],
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      with: {
        service: true,
        customer: true,
        provider: {
          with: {
            user: true
          }
        }
      }
    });
  }

  // Update booking status
  static async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    userId: string
  ): Promise<Booking> {
    const booking = await this.getBookingById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Permission check handled in controller, but good to double check logic
    // ...

    const [updatedBooking] = await db.update(bookings)
      .set({ 
        status,
        updatedAt: new Date(),
        ...(status === 'completed' ? { completedDate: new Date() } : {})
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    // If completed, increment provider completed jobs count
    if (status === 'completed') {
      await db.update(providerProfiles)
        .set({ 
          completedJobs: sql`${providerProfiles.completedJobs} + 1` 
        })
        .where(eq(providerProfiles.id, booking.providerId));
    }

    return updatedBooking;
  }

  // Cancel booking
  static async cancelBooking(
    bookingId: string,
    userId: string,
    reason?: string
  ): Promise<Booking> {
    // Logic to verify if user is allowed to cancel (customer or provider)
    // This verification is partially expected to be done by the caller/controller for security context

    return this.updateBookingStatus(bookingId, 'cancelled', userId);
  }

  // Complete booking
  static async completeBooking(
    bookingId: string,
    providerId: string // ID of the provider profile
  ): Promise<Booking> {
     // Verify provider owns this booking
    const booking = await this.getBookingById(bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.providerId !== providerId) throw new Error("Unauthorized");

    return this.updateBookingStatus(bookingId, 'completed', ""); // userId not strictly needed for internal update if verified
  }
}
