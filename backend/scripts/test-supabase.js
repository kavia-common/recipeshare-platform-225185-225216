'use strict';

/**
 * PUBLIC_INTERFACE
 * Script: test-supabase
 * Verifies Prisma connectivity to the Supabase Postgres and performs basic CRUD
 * aligned with the current schema (User, Recipe, Favorite).
 *
 * Usage:
 *   node scripts/test-supabase.js
 *
 * Requirements:
 *   - DATABASE_URL set to your Supabase Postgres connection (sslmode=require)
 */

const { randomUUID } = require('crypto');

async function main() {
  // Lazy-load TS prisma proxy which exposes methods via getter
  const prisma = require('../src/lib/prisma.ts').default || require('../src/lib/prisma.ts');

  console.log('[test] Checking database connection with prisma.$queryRaw...');
  const now = await prisma.$queryRaw`SELECT NOW() as now`;
  console.log('[test] DB time:', now?.[0]?.now || now);

  const uniqueEmail = `tester_${Date.now()}@example.com`;
  console.log('[test] Creating user', uniqueEmail);
  const user = await prisma.user.create({
    data: {
      email: uniqueEmail,
      password: 'hashed-placeholder', // in app flows, use proper hash
      name: 'Test User',
    },
  });
  console.log('[test] Created user:', { id: user.id, email: user.email });

  console.log('[test] Creating recipe for user...');
  const recipe = await prisma.recipe.create({
    data: {
      title: 'Supabase Connectivity Smoketest',
      description: 'Ensuring Prisma can write/read via Supabase.',
      ingredients: [{ name: 'Water', amount: '1 cup' }],
      instructions: [{ step: 1, text: 'Boil water' }],
      prepTime: 1,
      cookTime: 1,
      servings: 1,
      difficulty: 'EASY',
      imageUrl: 'https://example.com/test.jpg',
      authorId: user.id,
    },
  });
  console.log('[test] Created recipe:', { id: recipe.id, title: recipe.title });

  console.log('[test] Marking recipe as favorite...');
  await prisma.favorite.create({
    data: { userId: user.id, recipeId: recipe.id },
  });

  console.log('[test] Querying back recipe with relations...');
  const loaded = await prisma.recipe.findUnique({
    where: { id: recipe.id },
    include: {
      author: { select: { id: true, email: true } },
      favoritedBy: true,
    },
  });
  console.log('[test] Loaded recipe summary:', {
    id: loaded?.id,
    author: loaded?.author,
    favoritesCount: loaded?.favoritedBy?.length || 0,
  });

  console.log('[test] Cleaning up favorite and recipe...');
  await prisma.favorite.deleteMany({ where: { recipeId: recipe.id } });
  await prisma.recipe.delete({ where: { id: recipe.id } });
  console.log('[test] Cleanup done. Leaving user record to validate unique constraints.');

  console.log('[test] OK');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[test] Failed:', err?.message || err);
    process.exit(1);
  });
