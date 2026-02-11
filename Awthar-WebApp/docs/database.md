# Database Schema - Awthar Marketplace

**Database:** PostgreSQL (hosted on Supabase)
**ORM:** Drizzle ORM 0.39+
**Schema file:** `backend/src/shared/schema.ts`
**Migrations:** `backend/migrations/`

---

## Tables Overview

| Table | Purpose | Key Foreign Keys |
|-------|---------|-----------------|
| `users` | User accounts (synced with Supabase Auth) | - |
| `provider_profiles` | Provider business info | users.id |
| `categories` | Service categories (hierarchical) | self-referencing (parentId) |
| `locations` | UAE locations for filtering | - |
| `services` | Service listings | provider_profiles.id, categories.id |
| `bookings` | Service bookings | services.id, users.id, provider_profiles.id |
| `reviews` | Service reviews | bookings.id, provider_profiles.id, users.id |
| `conversations` | Chat conversations | services.id, users.id, provider_profiles.id |
| `messages` | Chat messages | conversations.id, users.id |
| `favorites` | Saved services | users.id, services.id |
| `reports` | Abuse/fraud reports | users.id, services.id, provider_profiles.id |

---

## Enums

| Enum | Values |
|------|--------|
| `user_role` | customer, provider, both |
| `provider_type` | casual_tasker, licensed_professional |
| `verification_status` | unverified, pending, verified, rejected |
| `pricing_type` | fixed, hourly, custom |
| `subscription_tier` | free, pro, premium |
| `service_status` | draft, active, paused, deleted |
| `booking_status` | pending, accepted, in_progress, completed, cancelled |
| `message_status` | sent, delivered, read |
| `auth_provider` | email, google, apple, github |
| `report_status` | pending, reviewed, resolved, dismissed |
| `report_type` | spam, inappropriate, fraud, other |

---

## Table Details

### users
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR (UUID) | PK, auto-generated |
| supabase_id | VARCHAR | Unique, links to Supabase auth.users.id |
| email | VARCHAR | Unique |
| password | VARCHAR | Legacy only (migration) |
| email_verified | BOOLEAN | Default: false |
| first_name | VARCHAR | |
| last_name | VARCHAR | |
| profile_image_url | VARCHAR | |
| role | user_role | Default: customer |
| auth_provider | auth_provider | Default: email |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### provider_profiles
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR (UUID) | PK |
| user_id | VARCHAR | FK -> users.id (CASCADE) |
| provider_type | provider_type | Default: casual_tasker |
| company_name | VARCHAR | |
| bio | TEXT | |
| phone | VARCHAR | |
| verification_status | verification_status | Default: unverified |
| verification_documents | TEXT[] | Array |
| subscription_tier | subscription_tier | Default: free |
| rating | DECIMAL(3,2) | Default: 0 |
| rating_sum | INTEGER | For O(1) avg calculation |
| total_reviews | INTEGER | |
| completed_jobs | INTEGER | |
| response_time | INTEGER | Minutes |
| languages | TEXT[] | Array |
| service_radius | INTEGER | Default: 25 (km) |
| service_areas | JSONB | `{ emirates?, cities?, districts? }` |
| is_premium | BOOLEAN | Default: false |
| created_at, updated_at | TIMESTAMP | |

### categories
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR (UUID) | PK |
| name_en | VARCHAR | Required |
| name_ar | VARCHAR | Required |
| slug | VARCHAR | Unique |
| description_en | TEXT | |
| description_ar | TEXT | |
| parent_id | VARCHAR | Self-reference (hierarchy) |
| icon_name | VARCHAR | Lucide icon name |
| display_order | INTEGER | Default: 0 |
| is_active | BOOLEAN | Default: true |
| created_at | TIMESTAMP | |

### locations
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR (UUID) | PK |
| name | VARCHAR(255) | |
| name_ar | VARCHAR(255) | |
| emirate | VARCHAR(100) | Indexed |
| lat | DECIMAL(10,7) | |
| lng | DECIMAL(10,7) | |
| popular | BOOLEAN | Indexed, default: false |
| created_at | TIMESTAMP | |

### services
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR (UUID) | PK |
| provider_id | VARCHAR | FK -> provider_profiles.id (CASCADE), indexed |
| category_id | VARCHAR | FK -> categories.id, indexed |
| title_en | VARCHAR | Required |
| title_ar | VARCHAR | |
| description_en | TEXT | Required |
| description_ar | TEXT | |
| pricing_type | pricing_type | Default: fixed |
| price_min | DECIMAL(10,2) | |
| price_max | DECIMAL(10,2) | |
| currency | VARCHAR | Default: AED |
| images | TEXT[] | Array of URLs |
| status | service_status | Default: active, indexed |
| location | JSONB | `{ emirate?, city?, area?, building?, poBox?, landmarks?, latitude?, longitude? }` |
| latitude | DECIMAL(10,7) | For geo queries |
| longitude | DECIMAL(10,7) | For geo queries |
| tags | TEXT[] | |
| payment_methods | TEXT[] | cash, card, bank_transfer, online |
| view_count | INTEGER | Default: 0 |
| contact_count | INTEGER | Default: 0 |
| is_featured | BOOLEAN | Default: false |
| created_at, updated_at | TIMESTAMP | |

### bookings
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR (UUID) | PK |
| service_id | VARCHAR | FK -> services.id, indexed |
| customer_id | VARCHAR | FK -> users.id, indexed |
| provider_id | VARCHAR | FK -> provider_profiles.id, indexed |
| status | booking_status | Default: pending |
| scheduled_date | TIMESTAMP | |
| completed_date | TIMESTAMP | |
| notes | TEXT | |
| agreed_price | DECIMAL(10,2) | |
| created_at, updated_at | TIMESTAMP | |

### reviews
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR (UUID) | PK |
| booking_id | VARCHAR | FK -> bookings.id |
| provider_id | VARCHAR | FK -> provider_profiles.id, indexed |
| customer_id | VARCHAR | FK -> users.id, indexed |
| rating | INTEGER | 1-5 |
| comment | TEXT | |
| response | TEXT | Provider can respond |
| is_verified | BOOLEAN | Default: true |
| created_at | TIMESTAMP | |

### conversations
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR (UUID) | PK |
| service_id | VARCHAR | FK -> services.id (nullable) |
| customer_id | VARCHAR | FK -> users.id, indexed |
| provider_id | VARCHAR | FK -> provider_profiles.id, indexed |
| last_message_at | TIMESTAMP | |
| is_active | BOOLEAN | Default: true |
| created_at | TIMESTAMP | |

### messages
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR (UUID) | PK |
| conversation_id | VARCHAR | FK -> conversations.id (CASCADE), indexed |
| sender_id | VARCHAR | FK -> users.id |
| content | TEXT | Required |
| attachments | TEXT[] | Array of URLs |
| status | message_status | Default: sent |
| created_at | TIMESTAMP | Indexed |

**Supabase Realtime enabled on this table for live chat.**

### favorites
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR (UUID) | PK |
| user_id | VARCHAR | FK -> users.id (CASCADE), indexed |
| service_id | VARCHAR | FK -> services.id (CASCADE), indexed |
| created_at | TIMESTAMP | |

### reports
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR (UUID) | PK |
| reporter_id | VARCHAR | FK -> users.id, indexed |
| service_id | VARCHAR | FK -> services.id (nullable), indexed |
| provider_id | VARCHAR | FK -> provider_profiles.id (nullable) |
| type | report_type | Required |
| reason | TEXT | Required |
| status | report_status | Default: pending, indexed |
| reviewed_by | VARCHAR | FK -> users.id |
| review_notes | TEXT | |
| created_at, updated_at | TIMESTAMP | |

---

## Database Commands

```bash
cd backend/
npm run db:generate    # Generate migration from schema changes
npm run db:migrate     # Apply pending migrations
npm run db:studio      # Open Drizzle Studio (visual DB browser)
```

---

*Last updated: February 9, 2026*
