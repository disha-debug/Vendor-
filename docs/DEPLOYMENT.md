# Deployment checklist (Supabase + Vite/React)

## Environment

- [ ] Copy `.env.example` to `.env` and set:
  - `VITE_SUPABASE_URL` — project URL from Supabase Dashboard → Settings → API
  - `VITE_SUPABASE_PUBLISHABLE_KEY` — **anon** public key (never use `service_role` in frontend)
- [ ] In production (Vercel/Netlify/etc.), set the same variables in the project’s environment (no `.env` file in repo).

## Security

- [ ] **Never** expose `SUPABASE_SERVICE_ROLE_KEY` in the browser or in frontend env. Use it only in a backend/Edge function if needed.
- [ ] RLS is enabled on all tables; policies enforce “users see own data, admins see all” where applicable.
- [ ] Auth uses email/password; session is stored in `localStorage` and refreshed automatically.

## Database

- [ ] Run migrations: `supabase db push` (or apply SQL in Supabase SQL Editor).
- [ ] Optional: run `supabase/migrations/20260228180000_example_projects_table.sql` only if you use the example `projects` table.
- [ ] In Supabase Dashboard → Authentication → Providers: enable Email and configure redirect URLs for production domain.

## Build & run

- [ ] `npm ci && npm run build` — build must succeed; env validation runs at startup.
- [ ] `npm run preview` — smoke-test production build locally.

## Post-deploy

- [ ] Add production site URL to Supabase Auth → URL configuration (Redirect URLs).
- [ ] Test login, signup, and a protected route; confirm RLS by checking that users only see their own data.
