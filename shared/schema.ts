import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  jsonb,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Referenced from javascript_log_in_with_replit blueprint
// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const userRoleEnum = pgEnum("user_role", ["customer", "provider", "both"]);
export const providerTypeEnum = pgEnum("provider_type", ["casual_tasker", "licensed_professional"]);
export const verificationStatusEnum = pgEnum("verification_status", ["unverified", "pending", "verified", "rejected"]);
export const pricingTypeEnum = pgEnum("pricing_type", ["fixed", "hourly", "custom"]);
export const subscriptionTierEnum = pgEnum("subscription_tier", ["free", "pro", "premium"]);
export const serviceStatusEnum = pgEnum("service_status", ["draft", "active", "paused", "deleted"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "accepted", "in_progress", "completed", "cancelled"]);
export const messageStatusEnum = pgEnum("message_status", ["sent", "delivered", "read"]);

// Users table - Referenced from javascript_log_in_with_replit blueprint
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"), // For local auth (bcrypt hashed)
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("customer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Provider profiles
export const providerProfiles = pgTable("provider_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerType: providerTypeEnum("provider_type").default("casual_tasker").notNull(),
  companyName: varchar("company_name"),
  bio: text("bio"),
  phone: varchar("phone"),
  verificationStatus: verificationStatusEnum("verification_status").default("unverified").notNull(),
  verificationDocuments: text("verification_documents").array(),
  subscriptionTier: subscriptionTierEnum("subscription_tier").default("free").notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  ratingSum: integer("rating_sum").default(0).notNull(),
  totalReviews: integer("total_reviews").default(0).notNull(),
  completedJobs: integer("completed_jobs").default(0).notNull(),
  responseTime: integer("response_time"),
  languages: text("languages").array(),
  serviceRadius: integer("service_radius").default(25).notNull(),
  serviceAreas: jsonb("service_areas").$type<{
    emirates?: string[];
    cities?: string[];
    districts?: string[];
  }>(),
  isPremium: boolean("is_premium").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Service categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameEn: varchar("name_en").notNull(),
  nameAr: varchar("name_ar").notNull(),
  slug: varchar("slug").unique().notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  parentId: varchar("parent_id"),
  iconName: varchar("icon_name"),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Service listings
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").notNull().references(() => categories.id),
  titleEn: varchar("title_en").notNull(),
  titleAr: varchar("title_ar"),
  descriptionEn: text("description_en").notNull(),
  descriptionAr: text("description_ar"),
  pricingType: pricingTypeEnum("pricing_type").default("fixed").notNull(),
  priceMin: decimal("price_min", { precision: 10, scale: 2 }),
  priceMax: decimal("price_max", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("AED").notNull(),
  images: text("images").array(),
  status: serviceStatusEnum("status").default("active").notNull(),
  location: jsonb("location").$type<{
    emirate?: string;
    city?: string;
    area?: string;
    building?: string;
    poBox?: string;
    landmarks?: string;
    latitude?: number;
    longitude?: number;
  }>(),
  tags: text("tags").array(),
  viewCount: integer("view_count").default(0).notNull(),
  contactCount: integer("contact_count").default(0).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("services_provider_idx").on(table.providerId),
  index("services_category_idx").on(table.categoryId),
  index("services_status_idx").on(table.status),
]);

// Bookings
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceId: varchar("service_id").notNull().references(() => services.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  providerId: varchar("provider_id").notNull().references(() => providerProfiles.id),
  status: bookingStatusEnum("status").default("pending").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  notes: text("notes"),
  agreedPrice: decimal("agreed_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("bookings_customer_idx").on(table.customerId),
  index("bookings_provider_idx").on(table.providerId),
  index("bookings_service_idx").on(table.serviceId),
]);

// Reviews
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  providerId: varchar("provider_id").notNull().references(() => providerProfiles.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  response: text("response"),
  isVerified: boolean("is_verified").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("reviews_provider_idx").on(table.providerId),
  index("reviews_customer_idx").on(table.customerId),
]);

// Conversations
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceId: varchar("service_id").references(() => services.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  providerId: varchar("provider_id").notNull().references(() => providerProfiles.id),
  lastMessageAt: timestamp("last_message_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("conversations_customer_idx").on(table.customerId),
  index("conversations_provider_idx").on(table.providerId),
]);

// Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  attachments: text("attachments").array(),
  status: messageStatusEnum("status").default("sent").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("messages_conversation_idx").on(table.conversationId),
  index("messages_created_idx").on(table.createdAt),
]);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  providerProfile: one(providerProfiles, {
    fields: [users.id],
    references: [providerProfiles.userId],
  }),
  sentMessages: many(messages),
  customerBookings: many(bookings, { relationName: "customer_bookings" }),
  reviews: many(reviews),
  customerConversations: many(conversations, { relationName: "customer_conversations" }),
}));

export const providerProfilesRelations = relations(providerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [providerProfiles.userId],
    references: [users.id],
  }),
  services: many(services),
  bookings: many(bookings),
  reviews: many(reviews),
  conversations: many(conversations, { relationName: "provider_conversations" }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  provider: one(providerProfiles, {
    fields: [services.providerId],
    references: [providerProfiles.id],
  }),
  category: one(categories, {
    fields: [services.categoryId],
    references: [categories.id],
  }),
  bookings: many(bookings),
  conversations: many(conversations),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
  }),
  provider: one(providerProfiles, {
    fields: [bookings.providerId],
    references: [providerProfiles.id],
  }),
  review: one(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  provider: one(providerProfiles, {
    fields: [reviews.providerId],
    references: [providerProfiles.id],
  }),
  customer: one(users, {
    fields: [reviews.customerId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  service: one(services, {
    fields: [conversations.serviceId],
    references: [services.id],
  }),
  customer: one(users, {
    fields: [conversations.customerId],
    references: [users.id],
  }),
  provider: one(providerProfiles, {
    fields: [conversations.providerId],
    references: [providerProfiles.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertProviderProfileSchema = createInsertSchema(providerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  ratingSum: true,
  totalReviews: true,
  completedJobs: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  contactCount: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

export type ProviderProfile = typeof providerProfiles.$inferSelect;
export type InsertProviderProfile = z.infer<typeof insertProviderProfileSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
