# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Curious Toddlers is a web application to help parents find activities, organization tools, and community connection for their child's physical, mental, and emotional development.

## Tech Stack

- **Frontend**: React + Vite (deployed on Vercel)
- **Backend**: JavaScript + Express.js (deployed on DigitalOcean)
- **Database**: MySQL
- **CSS**: Tailwind CSS v4
- **CI/CD**: Git + GitHub

## Development

### Setup
```bash
npm run install:all        # Install frontend + backend dependencies
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

### Running Dev Servers
```bash
npm run dev:frontend       # Vite dev server on http://localhost:5173
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

### Other Commands
```bash
npm run build:frontend     # Production build (outputs to frontend/dist/)
npm run start:backend      # Start backend without nodemon
```

### Project Structure
- `frontend/` — React + Vite app (separate npm project)
- `backend/` — Express API (separate npm project)
- `backend/routes/` — Express route modules, mounted at `/api`
- `backend/routes/auth.js` — Auth routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`)
- `backend/middleware/auth.js` — JWT verification middleware (use `authenticate` to protect routes)
- `backend/db/pool.js` — MySQL connection pool (mysql2/promise)
- `backend/db/migrate.js` — Custom migration runner CLI
- `backend/db/migrations/` — Numbered `.up.sql` / `.down.sql` migration files
- `frontend/src/utils/api.js` — Fetch wrapper (prepends `VITE_API_URL`, includes credentials, throws on error)
- `frontend/src/context/AuthContext.jsx` — Auth state provider (`AuthProvider`, `useAuth` hook)
- `frontend/src/components/ProtectedRoute.jsx` — Route guard (redirects to `/login` if not authenticated)
- Root `package.json` has convenience scripts only, no dependencies

## Architecture

Three-tier architecture: React SPA (Vercel) → Express REST API (DigitalOcean) → MySQL database (DigitalOcean). See `curious_toddlers_system_design.svg` for the full diagram and `curious-toddlers-erd.jpg` for the database ERD.

## Project Status

This project is in early development. Initial project setup (React+Vite frontend, Express backend) is complete. Feature development is in progress.

## Planned Features

1. User account flow (registration, login, profiles)
2. Home page and About page
3. Activity Repository — searchable database of child activities
4. Activity Calendar — schedule and plan activities
5. Learning about Montessori — educational content
6. **Bonus**: Parent-to-Parent Forum, Child Development Journal, Donations page
