# Auth, Prisma & Supabase Setup

This backend includes:
- Prisma schema (prisma/schema.prisma)
- NextAuth-like configuration under src/lib/auth.ts (for Next.js App Router style)
- Optional Supabase Auth middleware under src/middleware/supabaseAuth.js
- Signup API scaffold: app/api/auth/signup/route.ts
- NextAuth route scaffold: app/api/auth/[...nextauth]/route.ts
- Shared Prisma client: src/lib/prisma.ts

Environment variables required:
- DATABASE_URL (point this to your Supabase Postgres; include sslmode=require)
- NEXTAUTH_SECRET
- NEXTAUTH_URL (and SITE_URL for client redirects)
- Optional: SUPABASE_URL, SUPABASE_SERVICE_KEY (enables Supabase Auth protection on recipes routes)
- Optional: CLOUDINARY_* for image upload

Scripts:
- npm run prisma:generate
- npm run prisma:push
- npm run test:supabase

Notes:
- The Express app keeps minimal health routes (/, /health) to ensure port readiness.
- Recipes router uses Prisma and Cloudinary. Protected routes are guarded by Supabase Auth when configured, otherwise fallback auth applies.
- The NextAuth route handlers are scaffolded for future Next.js integration and won't be served by Express directly.
- The signup route is implemented using Next.js App Router style for parity; integrate with your Next.js app or port into Express routes if keeping pure Express.
