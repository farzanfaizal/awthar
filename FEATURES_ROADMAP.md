# Awthar Marketplace - Features Roadmap & Implementation Plan

**Last Updated:** November 28, 2025
**Project Version:** 1.0.0
**Status:** Active Development

---

## Executive Summary

This document provides a comprehensive roadmap for implementing missing features and completing the Awthar Marketplace platform. The roadmap is organized by priority and includes detailed implementation specifications for each feature.

**Current Completion:** 60-70%
**Target Completion:** 100% (MVP)
**Estimated Total Effort:** 600-800 hours

---

## Table of Contents

1. [Feature Status Overview](#1-feature-status-overview)
2. [Critical Features (MVP Requirements)](#2-critical-features-mvp-requirements)
3. [High Priority Features](#3-high-priority-features)
4. [Medium Priority Features](#4-medium-priority-features)
5. [Low Priority Features (Nice to Have)](#5-low-priority-features-nice-to-have)
6. [Future Enhancements](#6-future-enhancements)
7. [Implementation Sprints](#7-implementation-sprints)

---

## 1. Feature Status Overview

### Fully Implemented Features ✅

#### Authentication & User Management
- [x] Replit Auth integration (OpenID Connect)
- [x] Session management (PostgreSQL store)
- [x] User creation and retrieval
- [x] Provider profile CRUD
- [x] Role-based access (customer/provider/both)
- [x] Dev mode authentication bypass

#### Service Listings
- [x] Service CRUD operations
- [x] Category management (8 pre-seeded categories)
- [x] Search by text (title/description)
- [x] Filter by category
- [x] Filter by price range
- [x] View count tracking
- [x] Bilingual schema (EN/AR)
- [x] Service status management (draft/active/paused/deleted)

#### Reviews & Ratings
- [x] Review creation
- [x] Provider rating calculation
- [x] Review retrieval by provider
- [x] Verified review badges

#### Real-time Messaging
- [x] WebSocket server integration
- [x] Conversation creation
- [x] Message sending
- [x] Real-time message broadcasting
- [x] Message status tracking

#### Frontend Infrastructure
- [x] React + TypeScript setup
- [x] Tailwind CSS + Shadcn UI
- [x] Dark/Light theme toggle
- [x] Responsive header/footer
- [x] Landing page
- [x] Browse page (partial)
- [x] Provider dashboard (partial)
- [x] 50+ UI components

---

### Partially Implemented Features ⚠️

#### Browse & Discovery
- [x] Search bar UI
- [x] Filter sidebar UI
- [ ] Filters connected to API
- [ ] Pagination
- [ ] Sort functionality
- [ ] Map view
- [ ] Distance-based filtering

#### Provider Dashboard
- [x] Dashboard layout
- [x] Overview page
- [ ] Listings management page
- [ ] Messages page
- [ ] Bookings page
- [ ] Analytics page
- [ ] Settings page

#### Service Detail
- [x] Backend API endpoint
- [ ] Detail page component
- [ ] Image gallery
- [ ] Location map
- [ ] Contact provider flow
- [ ] Book service flow

#### Provider Profile
- [x] Backend API endpoint
- [ ] Profile page component
- [ ] Services list
- [ ] Reviews display
- [ ] Contact form

---

### Missing Features ❌

#### Core Features (Blockers)
- [ ] Booking system (complete)
- [ ] Image/file upload
- [ ] Messaging UI
- [ ] Profile/settings pages
- [ ] Map integration

#### Important Features
- [ ] Email notifications
- [ ] Admin verification panel
- [ ] Bilingual UI switching
- [ ] Advanced search
- [ ] Favorites/bookmarks

#### Nice to Have
- [ ] Analytics dashboard
- [ ] Service comparison
- [ ] Export features
- [ ] Keyboard shortcuts
- [ ] Print styles

---

## 2. Critical Features (MVP Requirements)

### 2.1 Booking System (Complete Implementation)

**Priority:** 🔴 CRITICAL
**Effort:** 16-20 hours
**Dependencies:** Service detail page, notifications

**Description:**
Complete end-to-end booking system allowing customers to request services and providers to manage appointments.

**Implementation Spec:**

#### Database Schema (Already Exists)
```sql
-- bookings table exists in schema.ts
- id: varchar (UUID)
- serviceId: varchar (FK to services)
- customerId: varchar (FK to users)
- providerId: varchar (FK to provider_profiles)
- status: enum (pending/accepted/in_progress/completed/cancelled)
- scheduledDate: timestamp
- completedDate: timestamp (nullable)
- notes: text (nullable)
- agreedPrice: decimal
- timestamps
```

#### Backend Implementation

**File:** `server/services/booking.service.ts` (CREATE)
```typescript
export class BookingService {
  // Create booking
  static async createBooking(data: {
    serviceId: string;
    customerId: string;
    scheduledDate: Date;
    notes?: string;
    agreedPrice: number;
  }): Promise<Booking>

  // Get booking by ID
  static async getBookingById(id: string): Promise<Booking | undefined>

  // List bookings (filtered by user role)
  static async getBookings(filters: {
    userId: string;
    role: 'customer' | 'provider';
    status?: BookingStatus[];
    limit?: number;
    offset?: number;
  }): Promise<Booking[]>

  // Update booking status
  static async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    userId: string
  ): Promise<Booking>

  // Cancel booking
  static async cancelBooking(
    bookingId: string,
    userId: string,
    reason?: string
  ): Promise<Booking>

  // Complete booking
  static async completeBooking(
    bookingId: string,
    providerId: string
  ): Promise<Booking>
}
```

**File:** `server/controllers/booking.controller.ts` (CREATE)
```typescript
const router = Router();

// Create booking
router.post("/", isAuthenticated, async (req, res) => {
  // Validate request
  // Check service exists and is active
  // Get providerId from service
  // Create booking with status 'pending'
  // Send notification to provider
  // Return booking
});

// Get bookings (for logged-in user)
router.get("/", isAuthenticated, async (req, res) => {
  // Determine if user is customer or provider
  // Fetch bookings accordingly
  // Support filters (status, date range)
  // Return paginated list
});

// Get booking details
router.get("/:id", isAuthenticated, async (req, res) => {
  // Fetch booking
  // Verify user is customer or provider of this booking
  // Return booking with service and user details
});

// Update booking status
router.patch("/:id/status", isAuthenticated, async (req, res) => {
  // Validate status transition
  // Verify user has permission (provider can accept/reject, both can cancel)
  // Update status
  // Send notification
  // Return updated booking
});

// Cancel booking
router.delete("/:id", isAuthenticated, async (req, res) => {
  // Verify user is customer or provider
  // Set status to 'cancelled'
  // Send notification
  // Return confirmation
});

export const bookingController = router;
```

**Status Transition Rules:**
```
pending → accepted (provider only)
pending → cancelled (both)
accepted → in_progress (provider only)
accepted → cancelled (both)
in_progress → completed (provider only)
in_progress → cancelled (both)
```

#### Frontend Implementation

**File:** `client/src/pages/booking-form.tsx` (CREATE)
```typescript
// Booking request form (shown on service detail page)
interface BookingFormProps {
  serviceId: string;
  providerId: string;
  service: Service;
}

export function BookingForm({ serviceId, providerId, service }: BookingFormProps) {
  // Form fields:
  // - Date picker (scheduledDate)
  // - Time picker
  // - Notes textarea
  // - Price display (from service or custom)
  // - Submit button

  // On submit:
  // - Validate date is in future
  // - Call POST /api/bookings
  // - Show success message
  // - Redirect to /bookings or /messages
}
```

**File:** `client/src/pages/dashboard/bookings.tsx` (CREATE)
```typescript
// Provider bookings management page
export function BookingsPage() {
  // Tabs: Pending, Accepted, In Progress, Completed, Cancelled
  // Calendar view option
  // List view option

  // For each booking card:
  // - Customer name & photo
  // - Service title
  // - Date & time
  // - Status badge
  // - Action buttons (Accept/Reject/Complete/Cancel/Message)

  // Filters:
  // - Date range
  // - Service
  // - Status
}
```

**File:** `client/src/pages/my-bookings.tsx` (CREATE)
```typescript
// Customer bookings page
export function MyBookingsPage() {
  // Similar to provider bookings but customer perspective
  // Tabs: Upcoming, Completed, Cancelled

  // For each booking:
  // - Service title & photo
  // - Provider name & rating
  // - Date & time
  // - Status
  // - Actions (Message provider, Cancel, Leave review)
}
```

**File:** `client/src/components/booking-status-badge.tsx` (CREATE)
```typescript
// Visual status indicator
export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const colors = {
    pending: 'yellow',
    accepted: 'blue',
    in_progress: 'purple',
    completed: 'green',
    cancelled: 'red'
  };
  return <Badge color={colors[status]}>{status}</Badge>;
}
```

**Routes to Add:**
```typescript
// In App.tsx
<Route path="/bookings" component={MyBookingsPage} />
<Route path="/dashboard/bookings" component={BookingsPage} />
<Route path="/booking/:id" component={BookingDetailPage} />
```

**Notifications to Implement:**
- Email/in-app notification when booking created
- Email/in-app notification on status change
- Reminder 24h before scheduled date

**Testing Checklist:**
- [ ] Customer can create booking
- [ ] Provider receives notification
- [ ] Provider can accept/reject
- [ ] Customer receives status update
- [ ] Booking can be cancelled by both parties
- [ ] Completed bookings allow review
- [ ] Calendar view shows all bookings
- [ ] Filters work correctly

---

### 2.2 Service Detail Page

**Priority:** 🔴 CRITICAL
**Effort:** 12-16 hours
**Dependencies:** Image upload (for gallery), Map integration, Booking form

**Description:**
Full-featured service detail page showing all service information, provider details, and booking capability.

**Implementation Spec:**

**File:** `client/src/pages/service-detail.tsx` (CREATE)

```typescript
export function ServiceDetailPage() {
  const { id } = useParams();
  const { data: service, isLoading } = useQuery({
    queryKey: [`/api/services/${id}`]
  });

  if (isLoading) return <ServiceDetailSkeleton />;
  if (!service) return <NotFound />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Service Info */}
        <div className="lg:col-span-2">

          {/* Image Gallery */}
          <ImageGallery images={service.images} />

          {/* Title & Category */}
          <div className="mt-6">
            <Breadcrumb>
              <BreadcrumbItem href="/">Home</BreadcrumbItem>
              <BreadcrumbItem href="/browse">Browse</BreadcrumbItem>
              <BreadcrumbItem href={`/browse?category=${service.category.slug}`}>
                {service.category.nameEn}
              </BreadcrumbItem>
              <BreadcrumbItem>{service.titleEn}</BreadcrumbItem>
            </Breadcrumb>

            <h1 className="text-4xl font-bold mt-4">{service.titleEn}</h1>

            {service.isFeatured && (
              <Badge variant="secondary" className="mt-2">
                <Star className="w-4 h-4 mr-1" />
                Featured
              </Badge>
            )}

            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {service.viewCount} views
              </span>
              <span className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                {service.contactCount} contacts
              </span>
            </div>
          </div>

          {/* Description */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>About This Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{service.descriptionEn}</p>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {service.pricingType === 'fixed' && (
                <div className="text-3xl font-bold">
                  {service.priceMin} {service.currency}
                </div>
              )}
              {service.pricingType === 'hourly' && (
                <div className="text-3xl font-bold">
                  {service.priceMin}-{service.priceMax} {service.currency}/hr
                </div>
              )}
              {service.pricingType === 'custom' && (
                <div className="text-xl">
                  Custom pricing - Contact for quote
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Service Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p>{service.location.area}, {service.location.city}</p>
                  <p className="text-sm text-muted-foreground">
                    {service.location.emirate}, UAE
                  </p>
                </div>
              </div>
              {/* Map component here */}
              <div className="mt-4 h-[300px] rounded-lg bg-muted">
                <ServiceLocationMap
                  latitude={service.location.latitude}
                  longitude={service.location.longitude}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {service.tags?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {service.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Provider Reviews</h2>
            <ReviewsList providerId={service.providerId} />
          </div>

        </div>

        {/* Right Column - Provider Card & Booking */}
        <div className="lg:col-span-1">

          {/* Provider Card (Sticky) */}
          <div className="sticky top-4">
            <ProviderCard provider={service.provider} />

            {/* Booking Form */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Book This Service</CardTitle>
              </CardHeader>
              <CardContent>
                <BookingForm
                  serviceId={service.id}
                  providerId={service.providerId}
                  service={service}
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full">
                <Heart className="w-4 h-4 mr-2" />
                Save to Favorites
              </Button>
              <Button variant="outline" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share Service
              </Button>
              <Button variant="outline" className="w-full">
                <Flag className="w-4 h-4 mr-2" />
                Report
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
```

**Components to Create:**

1. **ImageGallery.tsx**
```typescript
// Main image with thumbnails below
// Click thumbnail to change main image
// Lightbox on main image click
// Supports 0 images (show placeholder)
```

2. **ServiceLocationMap.tsx**
```typescript
// Leaflet/Google Maps integration
// Center on service location
// Show marker
// Show service radius if applicable
```

3. **ProviderCard.tsx**
```typescript
// Provider photo & name
// Rating stars & review count
// Verification badge
// Response time
// Completed jobs
// Member since
// View Profile button
// Message Provider button
```

4. **ReviewsList.tsx**
```typescript
// Fetch reviews for provider
// Show rating distribution graph
// List reviews with:
//   - Customer name (anonymous option)
//   - Rating stars
//   - Date
//   - Comment
//   - Provider response (if any)
//   - Verified badge
// Pagination
```

**Route:**
```typescript
<Route path="/service/:id" component={ServiceDetailPage} />
```

**Updates Needed:**
- Browse page: Make service cards link to `/service/:id`
- Landing page: Make featured provider services link to detail page

**Analytics:**
- Track page views (already increments viewCount)
- Track contact button clicks (increment contactCount)
- Track booking requests

---

### 2.3 Provider Profile Page

**Priority:** 🔴 CRITICAL
**Effort:** 10-14 hours
**Dependencies:** Service cards, Reviews list

**Description:**
Public-facing provider profile showing portfolio, reviews, and contact options.

**Implementation Spec:**

**File:** `client/src/pages/provider-profile.tsx` (CREATE)

```typescript
export function ProviderProfilePage() {
  const { id } = useParams();
  const { data: provider, isLoading } = useQuery({
    queryKey: [`/api/providers/${id}`]
  });
  const { data: services } = useQuery({
    queryKey: [`/api/services?providerId=${id}`]
  });
  const { data: reviews } = useQuery({
    queryKey: [`/api/reviews/provider/${id}`]
  });

  if (isLoading) return <ProfileSkeleton />;
  if (!provider) return <NotFound message="Provider not found" />;

  return (
    <div className="min-h-screen bg-muted/30">

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start gap-8">

            {/* Profile Photo */}
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={provider.user.profileImageUrl} />
              <AvatarFallback>
                {provider.user.firstName?.[0]}{provider.user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold">
                  {provider.companyName || `${provider.user.firstName} ${provider.user.lastName}`}
                </h1>

                {/* Verification Badge */}
                {provider.verificationStatus === 'verified' && (
                  <Badge className="bg-success">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </Badge>
                )}

                {/* Premium Badge */}
                {provider.isPremium && (
                  <Badge variant="secondary">
                    <Crown className="w-4 h-4 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>

              {/* Provider Type */}
              <p className="text-lg text-muted-foreground mt-1">
                {provider.providerType === 'licensed_professional'
                  ? 'Licensed Professional'
                  : 'Casual Tasker'}
              </p>

              {/* Rating & Stats */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <Star
                        key={star}
                        className={cn(
                          "w-5 h-5",
                          star <= Math.floor(parseFloat(provider.rating || '0'))
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-bold">{provider.rating}</span>
                  <span className="text-muted-foreground">
                    ({provider.totalReviews} reviews)
                  </span>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="text-center">
                  <p className="text-2xl font-bold">{provider.completedJobs}</p>
                  <p className="text-sm text-muted-foreground">Jobs Completed</p>
                </div>

                {provider.responseTime && (
                  <>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="text-center">
                      <p className="text-2xl font-bold">{provider.responseTime}h</p>
                      <p className="text-sm text-muted-foreground">Avg Response</p>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message Provider
                </Button>
                <Button size="lg" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* About Section */}
            {provider.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{provider.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Services Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Services Offered</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services?.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
              {services?.length === 0 && (
                <EmptyState message="No services listed yet" />
              )}
            </div>

            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Reviews</h2>
              <ReviewsList providerId={id} reviews={reviews} />
            </div>

          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Languages */}
                {provider.languages?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Languages className="w-4 h-4 mr-2" />
                      Languages
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {provider.languages.map(lang => (
                        <Badge key={lang} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Service Areas */}
                {provider.serviceAreas && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Service Areas
                    </h4>
                    <div className="space-y-1 text-sm">
                      {provider.serviceAreas.emirates?.map(emirate => (
                        <p key={emirate}>{emirate}</p>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Within {provider.serviceRadius} km
                    </p>
                  </div>
                )}

                {/* Member Since */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Member Since
                  </h4>
                  <p className="text-sm">
                    {new Date(provider.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {/* Subscription Tier */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    Membership
                  </h4>
                  <Badge>
                    {provider.subscriptionTier.charAt(0).toUpperCase() +
                     provider.subscriptionTier.slice(1)}
                  </Badge>
                </div>

              </CardContent>
            </Card>

            {/* Report Button */}
            <Button variant="ghost" className="w-full mt-4" size="sm">
              <Flag className="w-4 h-4 mr-2" />
              Report Provider
            </Button>

          </div>
        </div>
      </div>

    </div>
  );
}
```

**Route:**
```typescript
<Route path="/provider/:id" component={ProviderProfilePage} />
```

**Updates Needed:**
- Landing page: Link featured provider cards to profile
- Service detail page: Link provider card to profile
- Browse results: Link provider names to profile

---

### 2.4 Image Upload System

**Priority:** 🔴 CRITICAL
**Effort:** 10-12 hours
**Dependencies:** Replit Object Storage or S3

**Description:**
Complete file upload system for service images and message attachments.

**Implementation Spec:**

**Backend:**

**File:** `server/storage/upload.ts` (CREATE)

```typescript
import multer from 'multer';
import { Client } from '@replit/object-storage';

const storage = new Client();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// Upload to Replit Object Storage
export async function uploadFile(
  file: Express.Multer.File,
  folder: 'services' | 'messages' | 'profiles'
): Promise<string> {
  const filename = `${folder}/${Date.now()}-${file.originalname}`;

  await storage.uploadFromBytes(filename, file.buffer, {
    contentType: file.mimetype,
  });

  // Return public URL
  return storage.downloadUrl(filename);
}

export const uploadMiddleware = upload;
```

**File:** `server/controllers/upload.controller.ts` (CREATE)

```typescript
const router = Router();

// Upload single image
router.post("/image", isAuthenticated, uploadMiddleware.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const url = await uploadFile(req.file, 'services');
    res.json({ url });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Upload multiple images
router.post("/images", isAuthenticated, uploadMiddleware.array('images', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const urls = await Promise.all(
      req.files.map(file => uploadFile(file, 'services'))
    );

    res.json({ urls });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export const uploadController = router;
```

**Frontend:**

**File:** `client/src/components/image-upload.tsx` (CREATE)

```typescript
export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 5
}: {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData,
      });

      const { urls } = await response.json();
      onChange([...value, ...urls]);
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Image preview grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {value.map((url, index) => (
          <div key={url} className="relative aspect-square">
            <img src={url} className="w-full h-full object-cover rounded-lg" />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Upload button */}
      {value.length < maxFiles && (
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary">
            {uploading ? (
              <Spinner />
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p>Click to upload images</p>
                <p className="text-sm text-muted-foreground">
                  {maxFiles - value.length} remaining
                </p>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  );
}
```

**Integration:**
- Update service creation form to use ImageUpload
- Update profile edit to upload profile photo
- Update messages to support file attachments

---

### 2.5 Browse Page Filters Integration

**Priority:** 🔴 CRITICAL
**Effort:** 6-8 hours
**Dependencies:** Backend filter support

**Description:**
Connect existing filter UI to API and implement missing backend filters.

**Implementation Spec:**

**Backend Updates:**

**File:** `server/controllers/service.controller.ts`

```typescript
// Update GET /api/services endpoint
router.get("/", async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      minRating,      // NEW
      verified,       // NEW
      latitude,       // NEW
      longitude,      // NEW
      radius,         // NEW
      limit = 20,
      offset = 0
    } = req.query;

    // Build query with new filters
    let query = db.select().from(services);

    // Category filter
    if (category) {
      query = query.where(eq(services.categoryId, category));
    }

    // Search filter
    if (search) {
      query = query.where(
        or(
          like(services.titleEn, `%${search}%`),
          like(services.descriptionEn, `%${search}%`)
        )
      );
    }

    // Price range
    if (minPrice) {
      query = query.where(gte(services.priceMin, parseFloat(minPrice)));
    }
    if (maxPrice) {
      query = query.where(lte(services.priceMax, parseFloat(maxPrice)));
    }

    // Rating filter (join with providers)
    if (minRating) {
      query = query
        .leftJoin(providerProfiles, eq(services.providerId, providerProfiles.id))
        .where(gte(providerProfiles.rating, parseFloat(minRating)));
    }

    // Verification filter
    if (verified === 'true') {
      query = query
        .leftJoin(providerProfiles, eq(services.providerId, providerProfiles.id))
        .where(eq(providerProfiles.verificationStatus, 'verified'));
    }

    // Distance filter (calculate distance from lat/lng)
    if (latitude && longitude && radius) {
      // Use PostGIS or implement Haversine formula
      // Filter services within radius
    }

    // Only active services
    query = query.where(eq(services.status, 'active'));

    // Pagination
    query = query.limit(limit).offset(offset);

    const results = await query;
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
```

**Frontend Updates:**

**File:** `client/src/pages/browse.tsx`

```typescript
// Add filter state
const [filters, setFilters] = useState({
  categories: [] as string[],
  minPrice: 0,
  maxPrice: 2000,
  minRating: 0,
  verified: false,
  radius: 25,
  location: null as { lat: number; lng: number } | null
});

// Build query params
const queryParams = new URLSearchParams({
  ...(searchQuery && { search: searchQuery }),
  ...(filters.categories.length > 0 && { category: filters.categories.join(',') }),
  ...(filters.minPrice > 0 && { minPrice: filters.minPrice.toString() }),
  ...(filters.maxPrice < 2000 && { maxPrice: filters.maxPrice.toString() }),
  ...(filters.minRating > 0 && { minRating: filters.minRating.toString() }),
  ...(filters.verified && { verified: 'true' }),
  ...(filters.location && {
    latitude: filters.location.lat.toString(),
    longitude: filters.location.lng.toString(),
    radius: filters.radius.toString()
  })
});

// Update query
const { data: services } = useQuery({
  queryKey: ['/api/services', queryParams.toString()],
  queryFn: () => fetch(`/api/services?${queryParams}`).then(r => r.json())
});

// Connect filter inputs
<Checkbox
  checked={filters.categories.includes(cat.id)}
  onCheckedChange={(checked) => {
    setFilters(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, cat.id]
        : prev.categories.filter(id => id !== cat.id)
    }));
  }}
/>

<Slider
  min={0}
  max={2000}
  step={50}
  value={[filters.minPrice, filters.maxPrice]}
  onValueChange={([min, max]) => {
    setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }));
  }}
/>

// Add clear filters button
<Button
  variant="outline"
  onClick={() => setFilters(initialFilters)}
>
  Clear Filters
</Button>
```

---

## 3. High Priority Features

### 3.1 Messaging UI (Chat Interface)

**Priority:** 🟠 HIGH
**Effort:** 16-20 hours

**Implementation:** Create complete chat UI with conversation list, message threads, real-time updates via WebSocket, file attachments support, typing indicators, read receipts.

---

### 3.2 Profile & Settings Pages

**Priority:** 🟠 HIGH
**Effort:** 12-16 hours

**Implementation:** Customer profile page, provider settings page, profile photo upload, personal info editing, provider-specific fields (bio, company, languages, service areas), verification document upload.

---

### 3.3 Dashboard Sub-Pages

**Priority:** 🟠 HIGH
**Effort:** 24-32 hours

**Implementation:**
- Listings management page (create/edit/pause/delete services)
- Messages page (inbox with conversations)
- Bookings calendar page
- Analytics dashboard (charts, graphs, statistics)
- Settings page (account & business settings)

---

### 3.4 Map Integration

**Priority:** 🟠 HIGH
**Effort:** 10-14 hours

**Implementation:** Integrate Leaflet or Google Maps, service location markers, provider service area visualization, distance calculation, radius-based search filtering, geocoding for address input.

---

### 3.5 Email Notifications

**Priority:** 🟠 HIGH
**Effort:** 8-10 hours

**Implementation:** Email service integration (SendGrid/Mailgun), transactional email templates, booking notifications, message notifications, status change alerts, daily/weekly digest emails.

---

### 3.6 Form Validation

**Priority:** 🟠 HIGH
**Effort:** 6-8 hours

**Implementation:** React Hook Form integration, Zod validation schemas, field-level error messages, real-time validation, server-side validation enforcement.

---

### 3.7 Admin Verification Panel

**Priority:** 🟠 HIGH
**Effort:** 12-16 hours

**Implementation:** Admin role & authentication, provider verification queue, document viewer, approve/reject workflow, admin dashboard, verification status notifications.

---

### 3.8 Error Handling & Loading States

**Priority:** 🟠 HIGH
**Effort:** 8-10 hours

**Implementation:** React error boundaries, loading skeletons, empty state components, error toast notifications, retry mechanisms, graceful degradation.

---

### 3.9 Pagination

**Priority:** 🟠 HIGH
**Effort:** 4-6 hours

**Implementation:** Pagination component, page numbers, next/prev buttons, infinite scroll option, "Load more" button, total count display.

---

### 3.10 Security Hardening

**Priority:** 🟠 HIGH
**Effort:** 8-10 hours

**Implementation:** Input sanitization (DOMPurify), rate limiting (express-rate-limit), CSRF protection, helmet middleware, SQL injection prevention audit, XSS prevention, secure session configuration.

---

## 4. Medium Priority Features

### 4.1 Bilingual UI (English/Arabic)

**Priority:** 🟡 MEDIUM
**Effort:** 12-16 hours

**Implementation:** react-i18next integration, translation files (EN/AR), language switcher component, RTL layout support, Arabic fonts (Tajawal/Cairo), locale-specific formatting.

---

### 4.2 Favorites/Bookmarks

**Priority:** 🟡 MEDIUM
**Effort:** 6-8 hours

**Implementation:** Favorites table in database, favorite button on service cards, favorites page/section, remove from favorites, favorite count badge.

---

### 4.3 Notifications System

**Priority:** 🟡 MEDIUM
**Effort:** 12-16 hours

**Implementation:** Notifications table, notification bell icon, notification dropdown, mark as read, notification types (booking, message, review), real-time notifications via WebSocket.

---

### 4.4 Search History

**Priority:** 🟡 MEDIUM
**Effort:** 2-3 hours

**Implementation:** Save searches to localStorage, recent searches dropdown, clear history, search suggestions.

---

### 4.5 Service Tags

**Priority:** 🟡 MEDIUM
**Effort:** 3-4 hours

**Implementation:** Tag input in service form, tag badges on service cards, filter by tags, popular tags display.

---

### 4.6 Analytics Integration

**Priority:** 🟡 MEDIUM
**Effort:** 3-4 hours

**Implementation:** Google Analytics 4 integration, event tracking (searches, bookings, messages), conversion tracking, user behavior analysis.

---

### 4.7 SEO Optimization

**Priority:** 🟡 MEDIUM
**Effort:** 6-8 hours

**Implementation:** React Helmet for meta tags, JSON-LD structured data, sitemap generation, robots.txt, Open Graph tags, Twitter cards.

---

### 4.8 Image Optimization

**Priority:** 🟡 MEDIUM
**Effort:** 4-6 hours

**Implementation:** Image lazy loading, responsive images (srcset), image compression, WebP format, blur placeholder.

---

### 4.9 Code Splitting

**Priority:** 🟡 MEDIUM
**Effort:** 2-3 hours

**Implementation:** React.lazy for route-based splitting, Suspense boundaries, dynamic imports, bundle analysis, chunk optimization.

---

### 4.10 Review Moderation

**Priority:** 🟡 MEDIUM
**Effort:** 6-8 hours

**Implementation:** Review moderation queue, flag inappropriate reviews, spam detection, admin approval workflow.

---

## 5. Low Priority Features (Nice to Have)

### 5.1 Service Comparison

**Priority:** 🟢 LOW
**Effort:** 6-8 hours

**Implementation:** Compare checkbox on service cards, comparison page, side-by-side feature comparison, up to 4 services.

---

### 5.2 Export Features

**Priority:** 🟢 LOW
**Effort:** 4-6 hours

**Implementation:** Export bookings to CSV, export messages, download service list, PDF reports.

---

### 5.3 Keyboard Shortcuts

**Priority:** 🟢 LOW
**Effort:** 4-6 hours

**Implementation:** Command palette (Ctrl+K), search shortcut (/), close modal (Esc), navigation shortcuts, help modal (?) showing shortcuts.

---

### 5.4 Dark Mode Persistence

**Priority:** 🟢 LOW
**Effort:** 1 hour

**Implementation:** Save theme preference to localStorage, load on app init.

---

### 5.5 Print Styles

**Priority:** 🟢 LOW
**Effort:** 2-3 hours

**Implementation:** Print-friendly CSS, hide navigation/footer, optimize layouts for print.

---

### 5.6 Provider Response Rate

**Priority:** 🟢 LOW
**Effort:** 3-4 hours

**Implementation:** Calculate average response time from messages, display on profile, update on replies.

---

### 5.7 Service Views Analytics

**Priority:** 🟢 LOW
**Effort:** 4-6 hours

**Implementation:** Daily view count tracking, views over time graph, analytics dashboard.

---

### 5.8 Advanced Search

**Priority:** 🟢 LOW
**Effort:** 6-8 hours

**Implementation:** Saved search filters, complex query builder, search presets, advanced filter combinations.

---

### 5.9 Service Draft Mode UI

**Priority:** 🟢 LOW
**Effort:** 3-4 hours

**Implementation:** "Save as Draft" button, draft services section in dashboard, publish draft button.

---

## 6. Future Enhancements

### 6.1 Mobile Apps (React Native)

**Effort:** 200-300 hours

Native iOS and Android apps for better mobile experience.

---

### 6.2 Video Integration

**Effort:** 12-16 hours

Service video uploads, provider intro videos, video chat for consultations.

---

### 6.3 Calendar Sync

**Effort:** 8-10 hours

Sync bookings with Google Calendar, iCal export, calendar widget.

---

### 6.4 SMS Notifications

**Effort:** 4-6 hours

Twilio integration for SMS booking reminders and confirmations.

---

### 6.5 Payment Integration

**Effort:** 20-30 hours

Note: Not in original scope (platform is for listings only), but could add escrow payments, Stripe integration, invoice generation.

---

### 6.6 AI Features

**Effort:** 40-60 hours

Smart service matching, AI-powered search, chatbot support, spam detection.

---

### 6.7 Loyalty Program

**Effort:** 12-16 hours

Points system, rewards, provider badges, achievement levels.

---

### 6.8 Referral System

**Effort:** 8-10 hours

Referral codes, referral bonuses, tracking, analytics.

---

### 6.9 Multi-Currency Support

**Effort:** 6-8 hours

Support multiple currencies (AED, SAR, KWD, etc.), exchange rates, currency switcher.

---

### 6.10 Advanced Analytics

**Effort:** 16-20 hours

Provider performance metrics, customer insights, market trends, competitive analysis.

---

## 7. Implementation Sprints

### Sprint 1: Critical Foundation (2 weeks)
- Booking system (complete)
- Service detail page
- Provider profile page
- Image upload
- Browse filters integration

**Deliverable:** Core user flows functional

---

### Sprint 2: Core Features (2 weeks)
- Messaging UI
- Profile/settings pages
- Dashboard sub-pages (listings, messages)
- Form validation
- Error handling & loading states

**Deliverable:** Provider dashboard complete

---

### Sprint 3: Essential Features (2 weeks)
- Map integration
- Email notifications
- Pagination
- Admin verification panel
- Security hardening

**Deliverable:** Trust & safety features live

---

### Sprint 4: Polish & Enhancement (2 weeks)
- Bilingual UI
- Favorites/bookmarks
- Notifications system
- Analytics integration
- SEO optimization

**Deliverable:** Production-ready MVP

---

### Sprint 5+: Optimization & Growth
- Performance optimization
- Advanced features
- Mobile apps
- AI features
- Payment integration (if needed)

---

## Success Metrics

### User Engagement
- Daily active users
- Average session duration
- Bookings per user
- Messages sent
- Reviews written

### Provider Success
- Services listed
- Bookings completed
- Response rate
- Customer satisfaction
- Revenue per provider

### Platform Health
- Search success rate
- Conversion rate (view → contact → booking)
- User retention rate
- Provider retention rate
- Platform GMV (if payments added)

---

**Document End**
