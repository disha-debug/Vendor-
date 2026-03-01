# Supabase backend setup (reference)

## Stack

- **Frontend:** Vite + React + TypeScript
- **Database:** PostgreSQL via Supabase
- **Auth:** Email/password (Supabase Auth); roles: `admin`, `customer`, `vendor` (Admin + User semantics: admin = admin, User = customer/vendor)
- **RLS:** Enabled on all tables; users see own data, admins can see all where defined

## File structure

```
src/
  config/
    env.ts                 # Env validation (fail fast if VITE_* missing)
  integrations/supabase/
    client.ts              # Browser Supabase client (anon key only)
    types.ts               # Generated DB types
  lib/
    auth.ts                # signIn, signUp, signOut, getSession, getUserRole
  hooks/
    useAuth.tsx            # Auth context: user, role, profile, loading
  components/
    ProtectedRoute.tsx     # Guards routes; optional allowedRoles (e.g. admin)
  services/
    errors.ts              # ServiceResult, ok(), err(), getErrorMessage()
    profile.service.ts     # getProfile, updateProfile
    bookings.service.ts    # getBookingsByCustomer, getBookingsByVendor, createBooking, etc.
    index.ts               # Re-exports
supabase/
  migrations/
    20260228170349_*.sql   # Schema: profiles, user_roles, services, bookings, payments, reviews + RLS
    20260228180000_example_projects_table.sql  # Optional example table + RLS
.env.example
docs/
  DEPLOYMENT.md
  SUPABASE_SETUP.md        # This file
```

## Authentication

- **Login / signup / logout:** `signIn`, `signUp`, `signOut` from `@/lib/auth`.
- **Session:** Persisted in `localStorage`; auto-refresh and `detectSessionInUrl` enabled in client.
- **Protected routes:** Wrap route element with `<ProtectedRoute>...</ProtectedRoute>`. Admin-only: `<ProtectedRoute allowedRoles={["admin"]}>...</ProtectedRoute>`.

## Database schema (existing migration)

- **profiles:** id (→ auth.users), full_name, email, phone, address, avatar_url, timestamps. Trigger creates row on signup.
- **user_roles:** user_id, role (admin | customer | vendor). Same trigger assigns default role from signup metadata.
- **services, bookings, payments, reviews:** As in `types.ts`; FKs and indexes in migration.
- **RLS:** All tables have RLS; `has_role(auth.uid(), 'admin')` used where admin sees all.

## Using the service layer

```ts
import { getProfile, getBookingsByCustomer, getErrorMessage } from "@/services";

// In component or hook (e.g. with React Query)
const result = await getProfile(userId);
if (result.error) {
  toast.error(getErrorMessage(result.error));
  return;
}
setProfile(result.data);

const bookings = await getBookingsByCustomer(userId);
if (bookings.error) {
  toast.error(getErrorMessage(bookings.error));
  return;
}
```

## Environment

- **Required:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key only).
- **Never in frontend:** `SUPABASE_SERVICE_ROLE_KEY`.
- See `.env.example` and `docs/DEPLOYMENT.md`.
