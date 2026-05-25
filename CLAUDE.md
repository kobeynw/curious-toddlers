# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Curious Toddlers is a web application to help parents find activities, organization tools, and community connection for their child's physical, mental, and emotional development.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 (deployed on Vercel)
- **Backend**: JavaScript + Express.js (deployed on DigitalOcean)
- **Database**: MySQL
- **CSS**: Tailwind CSS v4
- **CI/CD**: Git + GitHub

## Development

### Setup
```bash
npm run install:all        # Install frontend + backend dependencies
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > frontend/.env.local
cp backend/.env.example backend/.env
```

### Running Dev Servers
```bash
npm run dev:frontend       # Next.js dev server on http://localhost:5173
npm run dev:backend        # Express server on http://localhost:3000 (nodemon)
```

### Database
Local MySQL must be running. Create the database:
```sql
CREATE DATABASE curious_toddlers;
```

Configure credentials:
```bash
cp backend/.env.example backend/.env  # then edit DB_USER, DB_PASSWORD
```

Run migrations:
```bash
npm run migrate            # Apply all pending migrations
npm run migrate:down       # Revert the last migration
```

Migration files live in `backend/db/migrations/` using the naming convention `NNN_description.up.sql` and `NNN_description.down.sql`.

### Testing
```bash
npm run test --prefix backend    # Jest unit tests
npm run test --prefix frontend   # Vitest unit tests
```

### Other Commands
```bash
npm run build:frontend     # Next.js production build (outputs to frontend/.next/)
npm run start:backend      # Start backend without nodemon
```

### Project Structure
- `frontend/` — Next.js 16 App Router app (separate npm project). JavaScript only (`.js`/`.jsx`)
- `frontend-legacy/` — the retired Vite SPA, kept temporarily as a rollback reference; to be deleted after the Next.js cutover is stable
- `backend/` — Express API (separate npm project)
- `backend/routes/` — Express route modules, mounted at `/api`
- `backend/middleware/auth.js` — JWT verification middleware (use `authenticate` to protect routes)
- `backend/middleware/authorizeAdmin.js` — Admin authorization middleware (use after `authenticate` to protect admin-only routes)
- `backend/routes/admin.js` — Admin activity routes (`POST`, `PUT`, `DELETE /api/admin/activities`)
- `backend/db/pool.js` — MySQL connection pool (mysql2/promise)
- `backend/db/migrate.js` — Custom migration runner CLI
- `backend/db/migrations/` — Numbered `.up.sql` / `.down.sql` migration files
- `frontend/app/` — App Router routes; each page is `app/<route>/page.jsx`. Interactive pages split into a server `page.jsx` (exports `metadata`) + a client `*Content.jsx`
- `frontend/app/layout.jsx` — root layout (`metadata`, `metadataBase`, `<Providers>` + `<Layout>` shell)
- `frontend/app/{sitemap.js,robots.js}` — SEO route handlers; `app/not-found.jsx` is the 404
- `frontend/lib/api.js` — Fetch wrapper (prepends `NEXT_PUBLIC_API_URL`, includes credentials, throws on error)
- `frontend/lib/format.js` — Shared formatting helpers (`formatDuration`, `formatAge`)
- `frontend/context/AuthContext.jsx` — Auth state provider (`'use client'`; `AuthProvider`, `useAuth` hook)
- `frontend/components/ProtectedRoute.jsx` — Client route guard (`useEffect` + `router.replace('/login')` when unauthenticated)
- `frontend/components/AdminRoute.jsx` — Client admin route guard (redirects non-admin users to `/`)
- `frontend/components/Modal.jsx` — Reusable modal overlay component (portal-based, Escape to close)
- Auth/private pages (`/login`, `/register`, `/verify-email`, `/calendar`, `/admin`) carry `robots: noindex`; public pages (`/`, `/about`, `/learn`, `/activities`) have canonical URLs and are in the sitemap
- Env var: `NEXT_PUBLIC_API_URL` (set in `frontend/.env.local` for dev, in the Vercel project for prod)
- Root `package.json` has convenience scripts only, no dependencies

## Architecture

Three-tier architecture: Next.js App Router app (Vercel) → Express REST API (DigitalOcean) → MySQL database (DigitalOcean). See `curious_toddlers_system_design.svg` for the full diagram and `curious-toddlers-erd.jpg` for the database ERD.

## Planned Features

1. User account flow (registration, login, profiles)
2. Home page and About page
3. Activity Repository — searchable database of child activities
4. Activity Calendar — schedule and plan activities
5. Learning about Montessori — educational content
6. **Bonus**: Parent-to-Parent Forum, Child Development Journal, Donations page
