# Phase 2: Implementation Plan - Advanced Architecture & UI Redesign

## 1. Overview
This phase focuses on elevating the platform from a basic functional prototype to a sophisticated, role-based application with a premium "watery" glassmorphism UI. The core architectural shift is the introduction of "User Mode" vs. "Provider Mode," creating distinct experiences for buyers and sellers.

## 2. Core Architectural Changes

### 2.1 Global App Mode Context (`AppModeContext`)
**Objective:** Manage the global state of the user's current interface mode (`'customer' | 'provider'`).

*   **State:** `mode`: `'customer' | 'provider'`
*   **Persistence:** Persist preference in `localStorage` (`awthar-app-mode`).
*   **Logic:**
    *   Default to `'customer'`.
    *   If user is not authenticated or not a provider, force `'customer'`.
    *   If user switches to `'provider'`, redirect to Dashboard.
    *   If user switches to `'customer'`, redirect to Home.

### 2.2 Role-Based Routing & redirection
**Objective:** Ensure users only see pages relevant to their active mode.

*   **Provider Mode Active:**
    *   Root `/` redirects to `/dashboard`.
    *   Browse/Search pages might be hidden or redirect to dashboard (optional, but recommended for strict separation).
*   **Customer Mode Active:**
    *   `/dashboard/*` routes redirect to `/` or prompt to switch modes.

---

## 3. UI/UX Redesign: The "Watery" Navbar

### 3.1 Visual Style
*   **Glassmorphism:** `backdrop-filter: blur(12px)` with `bg-background/60`.
*   **Height:** Compact `h-16` (64px).
*   **Borders:** Subtle bottom border `border-b border-border/40`.

### 3.2 Desktop View Layout
*   **Left:** Logo + "Awthar" (Link behavior depends on Mode).
*   **Center:**
    *   *Customer Mode:* Wide, glassy Search Input.
    *   *Provider Mode:* Dashboard quick links (e.g., "Listings", "Jobs", "Analytics").
*   **Right:** Profile Avatar (Trigger for Dropdown).

### 3.3 Mobile View Layout
*   **Left:** Logo Icon.
*   **Center (Dynamic Title):**
    *   Displays current page context (e.g., "Home", "Messages", "Dashboard").
    *   **Interaction:** Click to open **Navigation Dropdown**.
*   **Right:**
    *   *Customer Mode:* Search Icon (Links to `/browse`).
    *   *Provider Mode:* Notification Icon (optional) or empty space.
*   **Far Right:** Profile Avatar (Trigger for Dropdown).

### 3.4 Profile Dropdown (The Control Center)
*   **Header:** User Name & Email.
*   **Mode Switcher (Critical):**
    *   *If Provider:* "Switch to Buying" (User Mode) <-> "Switch to Hosting" (Provider Mode).
    *   *If Not Provider:* "Become a Provider" (Link to `/become-provider` or onboarding).
*   **Common Actions:**
    *   Profile
    *   Settings (Context-aware: User Profile or Provider Settings)
    *   Appearance (Dark/Light Mode Toggle)
*   **Footer:** Logout.

---

## 4. Component Breakdown & Tasks

### 4.1 Context Setup
- [ ] Create `client/src/context/app-mode-context.tsx`.
- [ ] Wrap `App.tsx` with `AppModeProvider`.

### 4.2 Navigation Components
- [ ] Create `client/src/components/layout/mobile-nav-title.tsx`.
    - Handles route detection.
    - Renders the dropdown menu based on `AppMode`.
- [ ] Refactor `client/src/components/header.tsx`.
    - Implement glass styles.
    - Consume `AppModeContext`.
    - Conditionally render Search Bar vs. Dashboard Links.

### 4.3 Page Updates
- [ ] **Dashboard:** Ensure it serves as the "Home" for Provider Mode.
- [ ] **Messages:** Update message filtering logic if necessary (though mostly shared, the context changes).

---

## 5. User Flows

### 5.1 Mode Switching Flow
1.  User (Provider) clicks Profile Avatar.
2.  User clicks "Switch to Provider Mode".
3.  `AppModeContext` updates state to `'provider'`.
4.  App redirects user to `/dashboard`.
5.  Navbar updates to show Dashboard links.
6.  Mobile Title Dropdown updates to show "Dashboard", "Listings", etc.

### 5.2 Becoming a Provider Flow
1.  User (Customer) clicks Profile Avatar.
2.  User clicks "Become a Provider".
3.  Redirects to `/become-provider` (or `/dashboard/listings/new` if simplified).
4.  Upon successful creation, `user.role` updates.
5.  Mode automatically switches to `'provider'`.

---

## 6. Future Considerations (Post-Phase 2)
*   **Strict Route Guarding:** Middleware to prevent accessing `/dashboard` via URL manipulation while in Customer Mode.
*   **Notification Splitting:** Separate notification streams for Buyer vs. Seller activities.
