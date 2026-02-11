// Frontend-only type definitions matching backend schema
// No drizzle runtime imports — pure TypeScript interfaces

export interface User {
  id: string;
  supabaseId: string | null;
  email: string | null;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: "customer" | "provider" | "both";
  authProvider: "email" | "google" | "apple" | "github";
  createdAt: string;
  updatedAt: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  providerType: "casual_tasker" | "licensed_professional";
  companyName: string | null;
  bio: string | null;
  phone: string | null;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  verificationDocuments: string[] | null;
  subscriptionTier: "free" | "pro" | "premium";
  rating: string | null;
  ratingSum: number;
  totalReviews: number;
  completedJobs: number;
  responseTime: number | null;
  languages: string[] | null;
  serviceRadius: number;
  serviceAreas: {
    emirates?: string[];
    cities?: string[];
    districts?: string[];
  } | null;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  parentId: string | null;
  iconName: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface Location {
  id: string;
  name: string;
  nameAr: string | null;
  emirate: string;
  lat: string;
  lng: string;
  popular: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  providerId: string;
  categoryId: string;
  titleEn: string;
  titleAr: string | null;
  descriptionEn: string;
  descriptionAr: string | null;
  pricingType: "fixed" | "hourly" | "custom";
  priceMin: string | null;
  priceMax: string | null;
  currency: string;
  images: string[] | null;
  status: "draft" | "active" | "paused" | "deleted";
  location: {
    emirate?: string;
    city?: string;
    area?: string;
    building?: string;
    poBox?: string;
    landmarks?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  latitude: string | null;
  longitude: string | null;
  tags: string[] | null;
  paymentMethods: string[] | null;
  viewCount: number;
  contactCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  customerId: string;
  providerId: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  scheduledDate: string | null;
  completedDate: string | null;
  notes: string | null;
  agreedPrice: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  providerId: string;
  customerId: string;
  rating: number;
  comment: string | null;
  response: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  serviceId: string | null;
  customerId: string;
  providerId: string;
  lastMessageAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: string[] | null;
  status: "sent" | "delivered" | "read";
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  serviceId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  serviceId: string | null;
  providerId: string | null;
  type: "spam" | "inappropriate" | "fraud" | "other";
  reason: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  reviewedBy: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Composite types used by frontend components
export interface ServiceWithProvider extends Service {
  provider: ProviderProfile & { user: User };
  category?: Category;
}

export interface ReviewWithCustomer extends Review {
  customer: User;
}

export interface ConversationWithDetails extends Conversation {
  service?: Service;
  customer?: User;
  provider?: ProviderProfile & { user: User };
  lastMessage?: Message;
}

export interface BookingWithDetails extends Booking {
  service?: Service;
  customer?: User;
  provider?: ProviderProfile & { user: User };
}

// API response wrappers
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  errors?: Array<{ field: string; message: string }>;
}
