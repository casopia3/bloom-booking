# Bloom Booking — Web Frontend (Phase 1)

Next.js + Tailwind responsive web frontend for Bloom Booking. Adapted
from the original mobile mockup per the project's design requirement:
same brand identity (colors, typography, rounded card/button language),
responsive layout adapted for desktop rather than a stretched mobile
port.

## Status

**Sprint 1 (partial) — Auth flow complete:**
- Sign up, OTP verification, Sign in, Forgot/Reset password
- All wired to the real backend API (see `lib/api.ts`)
- Token storage via `lib/auth.ts` (see the flagged decision inside —
  localStorage for now, worth revisiting before production)

**Not yet built:** location selection, provider/salon browse & search,
service list/details, specialist list/profile, and everything in
Sprints 2–3 (booking flow, dashboards).

## Setup

```bash
npm install
cp .env.example .env.local   # update NEXT_PUBLIC_API_URL if your backend
                              # isn't running on localhost:3000
npm run dev
```

Requires the backend (`bloom-booking-backend/api`) running and
reachable at the URL in `NEXT_PUBLIC_API_URL`.

## Design tokens

Defined in `tailwind.config.ts` — extracted from the original mobile
mockup, not invented:
- **Colors:** `bloom-500` (#6B4E9E, primary purple), `bloom-100`
  (#E9E1F2, lavender header/hero backgrounds), `gold-400` (#F5C518,
  ratings)
- **Fonts:** Baloo 2 (`font-display`) for headings/branding — matches
  the "bloom app" wordmark's rounded style; Inter (`font-sans`) for
  body text and UI labels
- **Shape:** `rounded-card` (20px) for cards, `rounded-button`
  (fully pill-shaped) for buttons — matching the mockup's soft,
  approachable visual language

## Project structure

```
app/
├── (auth)/
│   ├── sign-up/
│   ├── verify-otp/
│   ├── sign-in/
│   ├── forgot-password/
│   └── reset-password/
├── layout.tsx       # root layout, font loading
└── page.tsx         # placeholder home (redirects to sign-in if not authenticated)

components/
└── ui/
    ├── Button.tsx
    ├── Input.tsx
    └── OtpInput.tsx  # segmented digit input for OTP screens

lib/
├── api.ts   # backend API client
└── auth.ts  # token storage helper
```

## Next steps

Per the dev plan's Sprint 1 frontend scope, still to build:
1. Location selection (current location, manual address, map)
2. Provider/salon browse, search, filters
3. Provider profile (Info/Services/Specialists/Reviews tabs)
4. Service list/details
5. Specialist list/profile

Then Sprint 2 (booking flow) and Sprint 3 (dashboards) per the same plan.
