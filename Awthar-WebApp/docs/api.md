# API Reference - Awthar Marketplace

All API endpoints served by the backend Next.js app (`Awthar-WebApp/backend/`).

**Base URL:** `NEXT_PUBLIC_BACKEND_URL` (e.g. `http://localhost:3001` or Vercel URL)

**Auth:** Bearer token in `Authorization` header. Token is a Supabase JWT obtained via `@supabase/ssr`.

---

## Authentication

### GET /api/auth/user
Get the currently authenticated user.
- **Auth:** Required
- **Response:** `{ id, email, firstName, lastName, profileImageUrl, role, authProvider, emailVerified }`

### PATCH /api/auth/user
Update current user profile.
- **Auth:** Required
- **Body:** `{ firstName?, lastName?, profileImageUrl?, role? }`
- **Response:** Updated user object

### POST /api/auth/complete-profile
Complete profile after signup.
- **Auth:** Required
- **Body:** `{ firstName, lastName, role? }`

### POST /api/auth/providers
Create a provider profile.
- **Auth:** Required
- **Body:** `{ businessName (2-200), bio (10-1000), phoneNumber (10-20), location (2-200), profileImageUrl?, coverImageUrl?, latitude?, longitude? }`

### GET /api/auth/providers/me/profile
Get current user's provider profile.
- **Auth:** Required

### GET /api/auth/providers/:id
Get a provider profile by ID.
- **Auth:** None

---

## Services

### GET /api/services
Search and list services.
- **Auth:** Optional (if `role=provider`, shows user's own services)
- **Query:** `category`, `search`, `minPrice`, `maxPrice`, `latitude`, `longitude`, `radius`, `sortBy` (price_asc, price_desc, rating, newest), `paymentMethod`, `limit` (max 100, default 20), `offset`
- **Response:** `{ services: [...], total: number }`

### GET /api/services/:id
Get service detail. Increments view count.
- **Auth:** None

### POST /api/services
Create a new service.
- **Auth:** Required (provider only)
- **Body:** `{ title (3-100), description (10-2000), categoryId, price, images (1-10 URLs), minNoticeHours?, workingHours? }`

### PATCH /api/services/:id
Update a service.
- **Auth:** Required (owner only)
- **Body:** Same as POST (partial)

### DELETE /api/services/:id
Delete a service.
- **Auth:** Required (owner only)

---

## Categories

### GET /api/categories
List all active categories with service counts.
- **Auth:** None

### GET /api/categories/:slug
Get a category by slug.
- **Auth:** None

---

## Locations

### GET /api/locations
List locations with optional filters.
- **Auth:** None
- **Query:** `search`, `emirate`, `popular` (boolean), `limit` (max 100)

### GET /api/locations/popular
Get popular UAE locations.
- **Auth:** None

### GET /api/locations/emirates
Get unique list of emirates.
- **Auth:** None

### GET /api/locations/search/:query
Search locations by name.
- **Auth:** None
- **Query:** `limit`

---

## Bookings

### POST /api/bookings
Create a booking.
- **Auth:** Required
- **Rate Limit:** 10/hour
- **Body:** `{ serviceId, scheduledDate (ISO, future, 8AM-8PM, min 2hr notice), notes? (max 500), agreedPrice? }`
- **Validation:** Conflict detection (no double-bookings)

### GET /api/bookings
List user's bookings.
- **Auth:** Required
- **Query:** `role` (customer/provider), `status`, `limit` (max 100), `offset`

### GET /api/bookings/:id
Get booking details.
- **Auth:** Required (participant only)

### PATCH /api/bookings/:id/status
Update booking status.
- **Auth:** Required
- **Body:** `{ status }`
- **Status flow:** pending -> accepted/cancelled -> in_progress -> completed

### DELETE /api/bookings/:id
Cancel a booking.
- **Auth:** Required (participant only)

---

## Reviews

### GET /api/reviews/provider/:providerId
Get all reviews for a provider.
- **Auth:** None
- **Response:** Array of reviews (max 50, newest first)

### POST /api/reviews
Create a review for a completed booking.
- **Auth:** Required
- **Rate Limit:** 5/hour
- **Body:** `{ bookingId, providerId, rating (1-5), comment? (10-1000) }`
- **Validation:** Booking must be completed, one review per booking

---

## Conversations & Messages

### GET /api/conversations
List user's conversations.
- **Auth:** Required
- **Query:** `role` (customer/provider)

### POST /api/conversations
Create a new conversation.
- **Auth:** Required
- **Rate Limit:** 20/15min
- **Body:** `{ providerId, serviceId?, initialMessage? (1-1000) }`

### GET /api/messages/:conversationId
Get messages in a conversation.
- **Auth:** Required (participant only)

### POST /api/messages
Send a message (REST fallback — primary delivery is via Supabase Realtime).
- **Auth:** Required
- **Rate Limit:** 30/min
- **Body:** `{ conversationId, content (1-1000), attachments? }`

---

## Favorites

### GET /api/favorites
List user's favorite services.
- **Auth:** Required

### GET /api/favorites/check/:serviceId
Check if a service is favorited.
- **Auth:** Required
- **Response:** `{ isFavorited: boolean }`

### POST /api/favorites
Add a service to favorites.
- **Auth:** Required
- **Body:** `{ serviceId }`

### DELETE /api/favorites/:serviceId
Remove a service from favorites.
- **Auth:** Required

---

## Upload

### POST /api/upload/image
Upload a single image.
- **Auth:** Required
- **Rate Limit:** 10/15min
- **Body:** FormData with `image` field
- **Max size:** 2MB
- **Accepted:** JPEG, PNG, WebP
- **Response:** `{ url: "direct Supabase Storage URL" }`

### POST /api/upload/images
Upload multiple images (max 10).
- **Auth:** Required
- **Rate Limit:** 10/15min
- **Body:** FormData with `images` field (array)
- **Response:** `{ urls: ["..."] }`

### GET /api/upload/file/:key
Get/proxy a file from storage.
- **Auth:** None

---

## Reports

### POST /api/reports
Report a service or provider.
- **Auth:** Required
- **Body:** `{ serviceId? OR providerId?, type (spam/inappropriate/fraud/other), reason (10-1000) }`
- **Validation:** Must provide either serviceId or providerId

### GET /api/reports/my-reports
Get user's submitted reports.
- **Auth:** Required

---

## Analytics

### GET /api/analytics/dashboard
Get provider dashboard quick stats.
- **Auth:** Required
- **Response:** `{ profileViews, contactRequests, activeListings, totalListings, averageRating, reviewCount }`

### GET /api/analytics/provider
Get detailed provider analytics.
- **Auth:** Required
- **Response:** `{ stats: { totalRevenue, totalBookings, totalViews, conversionRate }, charts: { revenue: [...], services: [...] } }`

---

## Rate Limits

| Endpoint Group | Limit | Window |
|---------------|-------|--------|
| Write operations | 20 requests | 15 minutes |
| File uploads | 10 uploads | 15 minutes |
| Reviews | 5 reviews | 1 hour |
| Bookings | 10 bookings | 1 hour |
| Messages | 30 messages | 1 minute |

---

## Error Responses

All errors return JSON:
```json
{
  "message": "Error description",
  "status": 400
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (not owner/participant) |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |

---

*Last updated: February 9, 2026*
