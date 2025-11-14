# FlavorFolio Backend (Express + Prisma)

This backend powers FlavorFolio with an Express API, Prisma (PostgreSQL/Supabase), optional Supabase Auth protection, and optional Cloudinary image uploads.

- Health endpoints exposed at '/', '/health', '/api/health', '/readyz', and '/livez'
- Recipes API with protected create/update/delete actions
- Prisma models for User, Recipe, Favorite
- Optional auth via Supabase; default JWT auth compatible with NextAuth using NEXTAUTH_SECRET

## Quickstart

1) Clone and install
- cd recipeshare-platform-225185-225216/backend
- npm install

2) Copy env example and configure
- cp .env.example .env
- Fill out at minimum:
  - DATABASE_URL (point to Supabase Postgres; ensure sslmode=require)
  - NEXTAUTH_SECRET (random strong string)
  - FRONTEND_URL (defaults to http://localhost:3000)

Optional:
- SUPABASE_URL and SUPABASE_SERVICE_KEY to enable Supabase Auth middleware
- CLOUDINARY_* variables to enable image uploads
- NEXTAUTH_URL and SITE_URL for NextAuth/redirect flows if integrating directly with Next.js

3) Generate Prisma client and push schema
- npm run prisma:generate
- npm run prisma:push

4) Start the API
- npm run dev   # hot-reload with nodemon
- or
- npm start     # production-style run

Server binds on 0.0.0.0:3001 by default (override with PORT).

Docs: Visit /docs (Swagger UI) if enabled in your environment, and /openapi.json for raw spec.

Health: curl http://localhost:3001/health

## Environment Variables

Required
- DATABASE_URL: PostgreSQL connection string (Supabase) with sslmode=require
  Example:
  postgres://postgres:YOUR_PASSWORD@YOUR_PROJECT_HOST:5432/postgres?sslmode=require
- NEXTAUTH_SECRET: Secret for signing/verifying JWTs (used by fallback JWT auth compatible with NextAuth)
- FRONTEND_URL: The frontend origin for CORS; defaults to http://localhost:3000 if unset

Recommended (for NextAuth/redirects)
- NEXTAUTH_URL: Base URL of the Next.js app (if integrating NextAuth routes directly)
- SITE_URL: Used by clients for redirect URLs (e.g., email links or auth redirects)

Optional - Supabase Auth (enables supabaseAuth middleware on protected routes)
- SUPABASE_URL: Your Supabase project URL
- SUPABASE_SERVICE_KEY: Your Supabase service role key (server-side only; do not expose to clients)

Optional - Cloudinary (enable image uploads; otherwise provide imageUrl in requests)
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- CLOUDINARY_FOLDER (optional; default: flavorfolio)

CORS
- The backend uses CORS with:
  origin = FRONTEND_URL || REACT_APP_FRONTEND_URL || 'http://localhost:3000'
- Ensure FRONTEND_URL is set to http://localhost:3000 for local development or the exact domain of your deployed frontend.

## Prisma

- Schema file: prisma/schema.prisma
- Commands:
  - npm run prisma:generate  # Generate Prisma client
  - npm run prisma:push      # Push the schema to the database

Make sure DATABASE_URL is set before running these commands.

## Auth Modes

- Default JWT auth: expects Authorization: Bearer <jwt> with token signed using NEXTAUTH_SECRET. In development, if NEXTAUTH_SECRET is not set, a permissive dev user is injected.
- Supabase Auth (optional): When SUPABASE_URL and SUPABASE_SERVICE_KEY are set, protected endpoints validate Supabase access tokens and attach req.user from Supabase.

## Recipes API Overview

Public
- GET /api/recipes               # List recent recipes
- GET /api/recipes/search        # Search recipes

Protected (Bearer token required; NextAuth JWT or Supabase token)
- POST   /api/recipes            # Create recipe (multipart with 'image' when Cloudinary enabled; otherwise include 'imageUrl')
- PATCH  /api/recipes/:id        # Update recipe (author only)
- DELETE /api/recipes/:id        # Delete recipe (author only)
- POST   /api/recipes/:id/favorite
- POST   /api/recipes/:id/unfavorite

See backend/RECIPES_API.md for more details.

## Development Notes

- Health endpoints are synchronous and registered before any middleware, ensuring readiness even if other services are not configured yet.
- Centralized error handling avoids leaking internal details.
- Avoid committing any real secrets; use environment variables.
- For image uploads, when Cloudinary is not configured, pass a valid imageUrl in the request body instead of a file.

## Troubleshooting

- Prisma errors about connection:
  - Verify DATABASE_URL includes sslmode=require
  - Check that your IP access and DB credentials are correct for Supabase
- CORS errors in browser:
  - Ensure FRONTEND_URL matches your frontend origin (http://localhost:3000 for local dev)
- Supabase auth returns Unauthorized:
  - Confirm you’re sending Authorization: Bearer <access_token> from Supabase client
  - Check SUPABASE_URL and SUPABASE_SERVICE_KEY in backend .env
- Cloudinary upload errors:
  - Ensure CLOUDINARY_* envs are set; otherwise send imageUrl instead of file

## Scripts

- npm run dev              # Start with nodemon
- npm start                # Start server
- npm run prisma:generate  # Prisma client generate
- npm run prisma:push      # Prisma schema push
- npm run test:supabase    # Connectivity smoketest with Prisma

## License

Proprietary – for FlavorFolio project use.
