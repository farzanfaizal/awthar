import { z } from "zod";

// ─── Services ───
export const searchServicesSchema = z.object({
  role: z.enum(["provider"]).optional(),
  category: z.union([z.string(), z.array(z.string())]).optional(),
  search: z.string().optional(),
  minPrice: z.string().transform((val) => parseFloat(val)).pipe(z.number().nonnegative()).optional(),
  maxPrice: z.string().transform((val) => parseFloat(val)).pipe(z.number().nonnegative()).optional(),
  limit: z.string().transform((val) => parseInt(val)).pipe(z.number().positive().max(100)).optional(),
  offset: z.string().transform((val) => parseInt(val)).pipe(z.number().nonnegative()).optional(),
  sortBy: z.enum(["price_asc", "price_desc", "rating", "newest"]).optional(),
  latitude: z.string().transform((val) => parseFloat(val)).pipe(z.number()).optional(),
  longitude: z.string().transform((val) => parseFloat(val)).pipe(z.number()).optional(),
  radius: z.string().transform((val) => parseFloat(val)).pipe(z.number().positive()).optional(),
  paymentMethod: z.union([z.string(), z.array(z.string())]).optional(),
});

export const createServiceSchema = z.object({
  titleEn: z.string().min(5).max(200),
  titleAr: z.string().max(200).optional(),
  descriptionEn: z.string().min(20).max(5000),
  descriptionAr: z.string().max(5000).optional(),
  categoryId: z.string().uuid(),
  pricingType: z.enum(["fixed", "hourly", "custom"]).optional(),
  priceMin: z.coerce.number().nonnegative().transform(String).optional(),
  priceMax: z.coerce.number().nonnegative().transform(String).optional(),
  tags: z.union([
    z.array(z.string()),
    z.string().transform((s) => s ? s.split(",").map((t) => t.trim()).filter(Boolean) : []),
  ]).optional(),
  paymentMethods: z.union([
    z.array(z.string()),
    z.string().transform((s) => s ? s.split(",").map((t) => t.trim()).filter(Boolean) : []),
  ]).optional(),
  images: z.array(z.string()).optional(),
  location: z.object({
    emirate: z.string().optional(),
    city: z.string().optional(),
    area: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

// ─── Bookings ───
export const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  scheduledDate: z.string().datetime(),
  notes: z.string().max(500).optional(),
  agreedPrice: z.number().positive().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["pending", "accepted", "in_progress", "completed", "cancelled"]),
});

export const getBookingsSchema = z.object({
  role: z.enum(["customer", "provider"]),
  status: z.enum(["pending", "accepted", "in_progress", "completed", "cancelled"]).optional(),
  limit: z.string().transform((val) => parseInt(val)).pipe(z.number().positive().max(100)).optional(),
  offset: z.string().transform((val) => parseInt(val)).pipe(z.number().nonnegative()).optional(),
});

// ─── Chat ───
export const getUserConversationsSchema = z.object({
  role: z.enum(["customer", "provider"]).optional(),
});

export const createConversationSchema = z.object({
  providerId: z.string().uuid(),
  serviceId: z.string().uuid().optional(),
  initialMessage: z.string().min(1).max(1000).optional(),
});

export const createMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(1000),
  attachments: z.array(z.string().url()).optional(),
});

// ─── Reviews ───
export const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  providerId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
});

// ─── Favorites ───
export const addFavoriteSchema = z.object({
  serviceId: z.string().uuid(),
});

// ─── Reports ───
export const createReportSchema = z
  .object({
    serviceId: z.string().uuid().optional(),
    providerId: z.string().uuid().optional(),
    type: z.enum(["spam", "inappropriate", "fraud", "other"]),
    reason: z.string().min(10).max(1000),
  })
  .refine((data) => data.serviceId || data.providerId, {
    message: "Either serviceId or providerId must be provided",
  });

// ─── Locations ───
export const searchLocationsSchema = z.object({
  search: z.string().optional(),
  emirate: z.string().optional(),
  popular: z.string().transform((val) => val === "true").optional(),
  limit: z.string().transform((val) => parseInt(val)).pipe(z.number().positive().max(100)).optional(),
});
