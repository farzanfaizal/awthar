import { db } from "@/lib/db";
import {
  bookings,
  services,
  providerProfiles,
  type Booking,
} from "@/shared/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

type BookingStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled";

export class BookingService {
  static async createBooking(data: {
    serviceId: string;
    customerId: string;
    scheduledDate: Date;
    notes?: string;
    agreedPrice?: number;
  }): Promise<Booking> {
    const service = await db.query.services.findFirst({
      where: eq(services.id, data.serviceId),
      with: { provider: true },
    });

    if (!service) throw new Error("Service not found");
    if (service.status !== "active") throw new Error("Service is not active");

    const now = new Date();
    const scheduledTime = new Date(data.scheduledDate);

    if (scheduledTime < now) {
      throw new Error("Cannot book a time in the past.");
    }

    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    if (scheduledTime < twoHoursFromNow) {
      throw new Error("Bookings must be made at least 2 hours in advance.");
    }

    const hour = scheduledTime.getHours();
    if (hour < 8 || hour >= 20) {
      throw new Error("Bookings are only available between 8:00 AM and 8:00 PM.");
    }

    const conflict = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.providerId, service.providerId),
        eq(bookings.scheduledDate, data.scheduledDate),
        inArray(bookings.status, ["pending", "accepted", "in_progress"])
      ),
    });

    if (conflict) {
      throw new Error("This time slot is already booked. Please choose another time.");
    }

    const price = data.agreedPrice || parseFloat(service.priceMin || "0");

    const [booking] = await db
      .insert(bookings)
      .values({
        serviceId: data.serviceId,
        customerId: data.customerId,
        providerId: service.providerId,
        status: "pending",
        scheduledDate: data.scheduledDate,
        notes: data.notes,
        agreedPrice: price.toString(),
      })
      .returning();

    return booking;
  }

  static async getBookingById(id: string): Promise<Booking | undefined> {
    return db.query.bookings.findFirst({
      where: eq(bookings.id, id),
      with: {
        service: true,
        customer: true,
        provider: {
          with: { user: true },
        },
      },
    });
  }

  static async getBookings(filters: {
    userId: string;
    role: "customer" | "provider";
    status?: BookingStatus;
    limit?: number;
    offset?: number;
  }) {
    let whereClause;

    if (filters.role === "customer") {
      whereClause = eq(bookings.customerId, filters.userId);
    } else {
      const profile = await db.query.providerProfiles.findFirst({
        where: eq(providerProfiles.userId, filters.userId),
      });

      if (!profile) return [];
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
          with: { user: true },
        },
        review: true,
      },
    });
  }

  static async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    userId: string
  ): Promise<Booking> {
    const booking = await this.getBookingById(bookingId);
    if (!booking) throw new Error("Booking not found");

    const [updatedBooking] = await db
      .update(bookings)
      .set({
        status,
        updatedAt: new Date(),
        ...(status === "completed" ? { completedDate: new Date() } : {}),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (status === "completed") {
      await db
        .update(providerProfiles)
        .set({
          completedJobs: sql`${providerProfiles.completedJobs} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(providerProfiles.id, booking.providerId));
    }

    return updatedBooking;
  }

  static async cancelBooking(bookingId: string, userId: string): Promise<Booking> {
    return this.updateBookingStatus(bookingId, "cancelled", userId);
  }
}
