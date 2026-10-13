# Bloom Booking — Backend (Phase 1 Foundation)

NestJS + Prisma + PostgreSQL + Redis backend for the Bloom Booking
responsive web platform.

## Status

This is the **project foundation** — auth module is functional end-to-end
(register, login, OTP verification, password recovery). All other feature
modules (`customers`, `providers`, `specialists`, `services`, `bookings`,
`reviews`, `favourites`, `notifications`, `admin`) are stubs, to be built
out per the sprint plan.

## Setup

```bash
npm install
cp .env.example .env   # then fill in real values
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

Requires a running PostgreSQL instance and Redis instance (for the
slot-locking logic added in Sprint 2) — update `DATABASE_URL` and
`REDIS_URL` in `.env` accordingly.

## Implementation decisions flagged for confirmation

These were added to make the system functional end-to-end, but are **not**
specified in the original Bloom documentation or mobile mockup — per
project principle #5, flagging rather than silently assuming:

1. **OTP delivery mechanism** — no SMS provider is specified anywhere in
   the source docs. `AuthService.issueAndStoreOtp()` currently generates
   and stores the code but only logs it to the console in development.
   **Needs client confirmation**: which SMS provider (e.g. AfroMessage,
   Geez SMS, Twilio) should send the actual OTP text message.
2. **Self-registration role** — public registration always creates a
   `CUSTOMER`. Provider-admin, specialist, and super-admin accounts are
   assumed to be provisioned by an existing admin, not self-registered.
   **Needs confirmation** this matches the intended provider onboarding
   flow (e.g. does a salon owner sign up publicly and get upgraded, or
   are they created directly by a super-admin?).
3. **User schema fields** (`otpCode`, `otpExpiresAt`, `phoneVerified`,
   `passwordResetToken`, `passwordResetExpiresAt`) were added to
   `prisma/schema.prisma` to support OTP/password-reset — not present in
   the original data model discussion, but required for those flows to
   function.

## Project structure

```
src/
├── auth/            # Functional: register, login, OTP, password recovery
├── prisma/           # Global PrismaService (injectable in any module)
├── common/
│   ├── decorators/   # @Roles(), @CurrentUser()
│   └── guards/       # JwtAuthGuard, RolesGuard
├── users/            # Stub — Sprint 1
├── customers/        # Stub — Sprint 1
├── providers/        # Stub — Sprint 1
├── specialists/      # Stub — Sprint 1
├── services/         # Stub — Sprint 1
├── bookings/         # Stub — Sprint 2 (booking core, Redis slot-locking)
├── reviews/          # Stub — Sprint 3
├── favourites/       # Stub — Sprint 1/2
├── notifications/    # Stub — Sprint 3
└── admin/            # Stub — Sprint 3
```

See the project's architecture document and Phase 1 Development Plan for
the full sprint breakdown and booking status state machine.
