# Awthar Service Marketplace - Design Guidelines

## Design Approach

**Strategy**: Hybrid Reference + System Approach

**Primary References**:
- **Airbnb**: Service discovery, trust signals, location-based design patterns
- **LinkedIn**: Professional aesthetic, corporate credibility
- **Upwork**: Provider profiles, rating systems, service showcases
- **Material Design**: For structured data displays and filtering systems

**Core Principle**: Corporate-grade professionalism with approachable usability. The design must convey trust, efficiency, and regional authenticity while supporting complex filtering and dual-interface workflows.

## Color Palette

### Light Mode
- **Primary Brand**: 210 85% 35% (Deep professional blue - trust and stability)
- **Primary Hover**: 210 85% 30%
- **Secondary**: 160 60% 45% (Teal accent - verified actions)
- **Background Base**: 0 0% 100%
- **Background Secondary**: 210 20% 98%
- **Text Primary**: 210 15% 15%
- **Text Secondary**: 210 10% 45%
- **Border**: 210 15% 88%
- **Success** (verified badges): 145 65% 42%
- **Warning** (pending status): 38 92% 50%

### Dark Mode
- **Primary Brand**: 210 75% 55%
- **Primary Hover**: 210 75% 60%
- **Secondary**: 160 50% 50%
- **Background Base**: 210 20% 8%
- **Background Secondary**: 210 20% 12%
- **Text Primary**: 210 10% 95%
- **Text Secondary**: 210 8% 70%
- **Border**: 210 15% 20%
- **Success**: 145 60% 48%
- **Warning**: 38 85% 55%

## Typography

**Font Stack**:
- **Primary**: Inter (via Google Fonts) - exceptional multilingual support including Arabic
- **Arabic Optimization**: Use Tajawal or Cairo for Arabic text
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

**Type Scale**:
- **Hero Heading**: text-5xl md:text-6xl font-bold
- **Section Heading**: text-3xl md:text-4xl font-semibold
- **Card Title**: text-xl font-semibold
- **Body Large**: text-base md:text-lg
- **Body**: text-sm md:text-base
- **Caption**: text-xs md:text-sm

**RTL Support**: Implement full RTL layout switching for Arabic with `dir="rtl"` attribute.

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 20, 24** for consistent rhythm.

**Container Strategy**:
- **Max Width**: max-w-7xl for main content areas
- **Page Padding**: px-4 md:px-6 lg:px-8
- **Section Spacing**: py-12 md:py-16 lg:py-24
- **Card Spacing**: p-4 md:p-6
- **Grid Gaps**: gap-4 md:gap-6 lg:gap-8

**Responsive Breakpoints**:
- Mobile-first approach
- Key breaks at md (768px) and lg (1024px)

## Component Library

### End User Interface Components

**1. Navigation Header**
- Sticky header with logo, location selector, search bar, login/signup
- Height: h-16 md:h-20
- Bilingual toggle switch (EN/AR)
- Background: backdrop-blur with semi-transparent bg

**2. Hero Section with Search**
- **Height**: h-[500px] md:h-[600px]
- **Background**: Gradient overlay (primary to primary/80) over hero image
- **Hero Image**: High-quality image of service professionals at work in GCC setting
- **Search Component**: Prominent centered search with autocomplete, category dropdown, location input
- **Call-to-Action**: "Find Services" primary button, "List Your Services" secondary button

**3. Service Category Cards**
- Grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Cards: Rounded (rounded-xl), with category icon, name, service count
- Hover: Scale and shadow transition (hover:scale-105)
- Icons: Heroicons for consistency

**4. Featured Services Container**
- Horizontal scroll on mobile, grid on desktop
- Each service card includes: Provider avatar, service title, rating (stars + count), price range, location badge, verification badge
- Card design: White/dark background, rounded-lg, shadow-sm hover:shadow-md

**5. Provider Profile Cards**
- Avatar with verification badge overlay
- Provider name, specialty, rating
- Quick stats: Jobs completed, response time, languages
- "Contact" button (initiates chat)
- Badge system: Verified, Licensed Professional, Top Rated

**6. Advanced Filter Sidebar**
- Sticky sidebar: sticky top-20
- Collapsible filter groups: Category, Price Range, Location (radius slider), Rating, Verification Status, Availability
- Apply/Clear buttons
- Mobile: Slide-over panel

**7. Map Integration Section**
- Split view: Map (60%) + Provider list (40%) on desktop
- Map markers: Color-coded by service category
- Cluster markers for dense areas
- Provider cards appear on marker click

**8. Service Detail Page**
- Image gallery (carousel or grid)
- Provider info section with trust signals
- Service description with rich formatting
- Pricing breakdown
- Reviews section with filter/sort
- Sticky "Contact Provider" CTA button

### Provider Dashboard Components

**1. Dashboard Navigation**
- Vertical sidebar navigation
- Sections: Overview, My Listings, Messages, Schedule, Analytics, Settings
- Active state highlighting
- Collapsible on mobile

**2. Stats Dashboard**
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Stat cards: Profile views, Contact requests, Active listings, Rating
- Trend indicators (up/down arrows with percentages)
- Charts: Simple line/bar charts for engagement over time

**3. Listing Management**
- Table view with service name, status, views, actions
- Quick actions: Edit, Pause, Delete, Boost (premium)
- Create new listing: Prominent primary button
- Filters: Active, Paused, Drafts

**4. Service Listing Form**
- Multi-step form with progress indicator
- Steps: Basic Info, Pricing & Availability, Service Area (map picker), Media Upload, Preview
- Rich text editor for description
- Image upload with drag-and-drop
- Service area: Interactive map with radius/zone selection

**5. Messaging Center**
- Split view: Conversation list (30%) + Active chat (70%)
- Real-time message indicators
- File attachment support
- Quick reply templates
- Mark as resolved/closed option

**6. Premium Features Section**
- Subscription tier comparison table
- Feature highlights with icons
- "Upgrade" CTAs with benefits
- Payment method setup (note: for subscription only, not service payments)

### Shared UI Patterns

**Buttons**:
- Primary: Solid bg-primary text-white rounded-lg px-6 py-3
- Secondary: Outline border-2 border-primary text-primary rounded-lg px-6 py-3
- Ghost: Transparent hover:bg-primary/10
- On images: backdrop-blur-sm bg-white/20 border border-white/40

**Forms**:
- Input fields: rounded-lg border-2 focus:border-primary focus:ring-2 focus:ring-primary/20
- Labels: font-medium mb-2
- Helper text: text-sm text-secondary
- Validation: Red border + error message below

**Cards**:
- Standard: rounded-xl border shadow-sm hover:shadow-md transition-shadow
- Featured: border-2 border-primary with subtle gradient background

**Badges**:
- Verification: bg-success text-white rounded-full px-3 py-1 text-xs font-medium
- Status: Color-coded (pending: yellow, active: green, paused: gray)
- Category: bg-secondary/10 text-secondary rounded-md px-2 py-1

**Rating Display**:
- Star icons (filled/empty) with numerical rating
- Review count in secondary text
- Hover shows rating breakdown

## Images

**Hero Image**: Professional service provider in GCC setting (construction worker, home service professional, or consultant). High quality, bright, approachable. Positioned as full-width background with gradient overlay.

**Category Icons**: Use Heroicons for all service categories (wrench, home, briefcase, etc.)

**Provider Avatars**: Circular, consistent sizing (w-12 h-12 for cards, w-24 h-24 for profiles)

**Service Photos**: Aspect ratio 16:9 or 4:3, professional quality showcasing work/services

**Trust Signals**: Badge icons for verification, licensing, insurance

## Animations

**Use Sparingly**:
- Card hover: Subtle scale and shadow (transition-all duration-200)
- Loading states: Skeleton screens with shimmer effect
- Page transitions: Fade in content
- NO complex animations, scrolljacking, or parallax effects