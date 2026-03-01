# Demo bootstrap seed

Seed runs **only when `public.services` is empty** (no duplicates). It creates demo data so the **customer dashboard is immediately usable** without changing RLS, auth, or business logic.

## What gets seeded

| Entity   | Count | Details |
|----------|-------|--------|
| Vendors  | 3     | In `auth.users`; trigger creates `profiles` and `user_roles` (role = vendor) |
| Customer | 1     | One demo customer with bookings |
| Services | 10    | `is_available = true`, linked to the 3 vendors; Indian names & prices |
| Bookings | 8     | 5 completed + 3 pending (all for the demo customer) |
| Payments | 5     | One per completed booking (`success`) |
| Reviews  | 5     | One per completed booking (rating 3–5) |

## Demo logins (password for all: `Password123!`)

| Role     | Email                   |
|----------|-------------------------|
| Customer | `demo.customer@example.com` |
| Vendor 1 | `demo.vendor1@example.com`  |
| Vendor 2 | `demo.vendor2@example.com`  |
| Vendor 3 | `demo.vendor3@example.com`  |

- **Customer:** Log in to see 10 available services and 8 bookings (5 completed, 3 pending).
- **Vendors:** See their own services and related bookings.
- **RLS:** Unchanged; customers see available services, vendors see their own, admin sees all.

## How to run (once per environment)

### Option A: Local – reset DB and apply seed

```bash
npx supabase db reset
```

Applies migrations and runs `supabase/seed.sql`. Use when you want a clean DB with demo data.

### Option B: Hosted project – run seed in SQL Editor

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **SQL Editor**.
3. Paste the full contents of `supabase/seed.sql`.
4. Run. (If `services` already has rows, the script does nothing.)

### Option C: CLI (seed only, no reset)

```bash
npx supabase db execute --file supabase/seed.sql
```

Ensure the CLI is linked to the project you want to seed.

## Guards (no duplicates)

- **First block:** `IF EXISTS (SELECT 1 FROM public.services LIMIT 1) THEN RETURN;`  
  → Skips users, identities, profiles, and services if any service exists.
- **Second block:** `IF (SELECT COUNT(*) FROM public.bookings) > 0 THEN RETURN;`  
  → Skips bookings, payments, and reviews if any booking exists.

## After seeding

1. Log in as **Customer:** `demo.customer@example.com` / `Password123!`
2. You should see 10 services and 8 bookings (5 completed, 3 pending).
3. Vendors can log in with `demo.vendor1@example.com` (or 2/3) and see their services/bookings.

No frontend or client-side seeding; no `service_role` in the app.
