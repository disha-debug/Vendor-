# Vercel Deployment Guide

This document covers deployment to Vercel without changing business logic, Supabase, or routing.

---

## 1. Environment Variables

The app uses **only** these public env vars (no secrets in frontend):

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Project Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon (public) key | Same as above |

- **Local:** Copy `.env.example` to `.env` and fill in values.
- **Vercel:** Project Settings → Environment Variables → add both for **Production**, **Preview**, and **Development**.
- Do **not** use `SUPABASE_SERVICE_ROLE_KEY` in the frontend or in Vercel env.

---

## 2. Supabase Auth Redirect URLs

After deployment, add your Vercel URL in Supabase so auth works:

1. Supabase Dashboard → **Authentication** → **URL Configuration**.
2. Under **Redirect URLs**, add:
   - `https://<your-vercel-app>.vercel.app`
   - `https://<your-vercel-app>.vercel.app/**`
   - `http://localhost:5173` (local dev)
   - `http://localhost:8080` (if you use the default port in this project)

Save. Without these, login/signup redirects may be blocked.

---

## 3. Build

- **Command:** `npm run build` (Vite builds to `dist/`).
- **Output directory:** `dist` (Vercel auto-detects for Vite).
- No Node-only APIs in frontend code; only `import.meta.env` is used (no `process.env`).
- Production build strips `console` and `debugger` via Vite config.

---

## 4. SPA Routing (Vercel)

`vercel.json` is configured so all routes serve `index.html` and React Router handles the path:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Do not remove this; otherwise refreshing on e.g. `/dashboard` will 404.

---

## 5. Deployment Checklist

- [ ] Supabase project created and RLS/migrations applied.
- [ ] `.env` (local) or Vercel env vars set: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
- [ ] Supabase **Redirect URLs** include your Vercel URL and localhost.
- [ ] Run `npm run build` locally and fix any errors.
- [ ] Connect repo to Vercel; ensure build command is `npm run build` and output is `dist` (default for Vite).
- [ ] Deploy and test login/signup and protected routes.
- [ ] (Optional) Add custom domain in Vercel and add that domain to Supabase Redirect URLs.

---

## 6. New/Modified Files for Deployment

| File | Purpose |
|------|---------|
| `vercel.json` | SPA rewrites so React Router works on refresh. |
| `.env.example` | Env var template + Vercel and redirect URL notes. |
| `vite.config.ts` | Production build: strip console/debugger, explicit outDir. |
| `DEPLOYMENT.md` | This checklist and documentation. |

No changes were made to the service layer, Supabase client, RLS, React Query, or routing logic.
