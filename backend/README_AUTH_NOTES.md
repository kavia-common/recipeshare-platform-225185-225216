# Auth & Prisma Setup

This backend now includes:
- Prisma schema (prisma/schema.prisma)
- NextAuth-like configuration under src/lib/auth.ts (for Next.js App Router style)
- Signup API scaffold: app/api/auth/signup/route.ts
- NextAuth route scaffold: app/api/auth/[...nextauth]/route.ts
- Shared Prisma client: src/lib/prisma.ts

Environment variables required:
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL (and SITE_URL for client redirects)

Scripts:
- npm run prisma:generate

Notes:
- This repository is Express-based. The NextAuth route handlers are scaffolded for future Next.js integration and won't be served by Express directly.
- The signup route is implemented using Next.js App Router style for parity; integrate with your Next.js app or port into Express routes if keeping pure Express.
