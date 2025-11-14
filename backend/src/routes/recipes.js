'use strict';

const express = require('express');
const multer = require('multer');
const { z } = require('zod');
const prismaTs = require('../lib/prisma.ts'); // TypeScript default export transpiles to JS module default
const { uploadImageBuffer } = require('../lib/cloudinary');
const { authenticate, requireOwnership } = require('../middleware/auth');
const { supabaseAuthenticate } = require('../middleware/supabaseAuth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Prisma client from TS default export (lazy, no network at import)
const prisma = prismaTs && prismaTs.default ? prismaTs.default : prismaTs;

// Decide auth chain for protected routes.
// supabaseAuthenticate will no-op if SUPABASE_URL/SUPABASE_SERVICE_KEY are not set,
// allowing fallback authenticate to handle dev/NextAuth tokens.
const protectedAuth = [supabaseAuthenticate, authenticate];

// Schemas
const difficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD']);

const ingredientsSchema = z.array(z.object({
  name: z.string().min(1),
  amount: z.string().min(1),
}));

const instructionsSchema = z.array(z.object({
  step: z.number().int().min(1),
  text: z.string().min(1),
}));

const createRecipeSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  ingredients: ingredientsSchema,
  instructions: instructionsSchema,
  prepTime: z.coerce.number().int().min(0).max(1440),
  cookTime: z.coerce.number().int().min(0).max(1440),
  servings: z.coerce.number().int().min(1).max(100),
  difficulty: difficultyEnum,
});

const patchRecipeSchema = createRecipeSchema.partial();

/**
 * Helper to parse JSON fields that arrive as strings in multipart form-data.
 */
function parseMaybeJson(value) {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
}

/**
 * Load recipe by ID param and attach to req.recipe
 */
async function loadRecipe(req, res, next) {
  try {
    const { id } = req.params;
    const recipe = await prisma.recipe.findUnique({ where: { id } });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    req.recipe = recipe;
    return next();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load recipe' });
  }
}

/**
 * PUBLIC_INTERFACE
 * GET /api/recipes
 * Public list endpoint for quick verification. Returns recent recipes with minimal fields.
 */
router.get('/api/recipes', async (req, res) => {
  try {
    const take = Math.min(parseInt(String(req.query.take || '20'), 10), 50);
    const items = await prisma.recipe.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
      },
    });
    return res.status(200).json({ items, take });
  } catch (_e) {
    return res.status(500).json({ error: 'Failed to load recipes' });
  }
});

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Create a recipe with image upload
 *     tags: [Recipes]
 */
router.post(
  '/api/recipes',
  ...protectedAuth,
  upload.single('image'),
  async (req, res) => {
    try {
      // Merge body with parsed JSON fields for multipart
      const raw = {
        ...req.body,
        ingredients: parseMaybeJson(req.body.ingredients),
        instructions: parseMaybeJson(req.body.instructions),
      };
      const parsed = createRecipeSchema.safeParse(raw);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation error', issues: parsed.error.issues.map(i => i.message) });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'Image is required' });
      }
      const imageUrl = await uploadImageBuffer(req.file.buffer, req.file.originalname || 'recipe.jpg');

      const data = parsed.data;
      const created = await prisma.recipe.create({
        data: {
          title: data.title,
          description: data.description,
          ingredients: data.ingredients,
          instructions: data.instructions,
          prepTime: data.prepTime,
          cookTime: data.cookTime,
          servings: data.servings,
          difficulty: data.difficulty,
          imageUrl,
          authorId: req.user.id,
        },
      });

      return res.status(201).json({ recipe: created });
    } catch (err) {
      // Avoid leaking internal errors
      return res.status(500).json({ error: 'Failed to create recipe' });
    }
  }
);

/**
 * @swagger
 * /api/recipes/{id}:
 *   patch:
 *     summary: Update a recipe (author only). Image optional in multipart.
 *     tags: [Recipes]
 */
router.patch(
  '/api/recipes/:id',
  ...protectedAuth,
  loadRecipe,
  requireOwnership,
  upload.single('image'),
  async (req, res) => {
    try {
      const patchRaw = {
        ...req.body,
        ingredients: req.body.ingredients ? parseMaybeJson(req.body.ingredients) : undefined,
        instructions: req.body.instructions ? parseMaybeJson(req.body.instructions) : undefined,
      };
      const parsed = patchRecipeSchema.safeParse(patchRaw);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation error', issues: parsed.error.issues.map(i => i.message) });
      }

      let imageUrl;
      if (req.file) {
        imageUrl = await uploadImageBuffer(req.file.buffer, req.file.originalname || 'recipe.jpg');
      }

      const data = parsed.data;
      const updated = await prisma.recipe.update({
        where: { id: req.params.id },
        data: {
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.ingredients !== undefined ? { ingredients: data.ingredients } : {}),
          ...(data.instructions !== undefined ? { instructions: data.instructions } : {}),
          ...(data.prepTime !== undefined ? { prepTime: data.prepTime } : {}),
          ...(data.cookTime !== undefined ? { cookTime: data.cookTime } : {}),
          ...(data.servings !== undefined ? { servings: data.servings } : {}),
          ...(data.difficulty !== undefined ? { difficulty: data.difficulty } : {}),
          ...(imageUrl ? { imageUrl } : {}),
        },
      });

      return res.status(200).json({ recipe: updated });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update recipe' });
    }
  }
);

/**
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     summary: Delete a recipe (author only)
 *     tags: [Recipes]
 */
router.delete(
  '/api/recipes/:id',
  ...protectedAuth,
  loadRecipe,
  requireOwnership,
  async (req, res) => {
    try {
      await prisma.favorite.deleteMany({ where: { recipeId: req.params.id } });
      await prisma.recipe.delete({ where: { id: req.params.id } });
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete recipe' });
    }
  }
);

/**
 * @swagger
 * /api/recipes/{id}/favorite:
 *   post:
 *     summary: Mark recipe as favorite for current user
 *     tags: [Favorites]
 */
router.post('/api/recipes/:id/favorite', ...protectedAuth, async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id } });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const fav = await prisma.favorite.upsert({
      where: { userId_recipeId: { userId: req.user.id, recipeId: req.params.id } },
      update: {},
      create: { userId: req.user.id, recipeId: req.params.id },
    });

    return res.status(200).json({ favorite: fav });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to favorite recipe' });
  }
});

/**
 * @swagger
 * /api/recipes/{id}/unfavorite:
 *   post:
 *     summary: Remove recipe from favorites for current user
 *     tags: [Favorites]
 */
router.post('/api/recipes/:id/unfavorite', ...protectedAuth, async (req, res) => {
  try {
    await prisma.favorite.delete({
      where: { userId_recipeId: { userId: req.user.id, recipeId: req.params.id } },
    }).catch(() => null);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to unfavorite recipe' });
  }
});

/**
 * @swagger
 * /api/recipes/search:
 *   get:
 *     summary: Search recipes
 *     tags: [Recipes]
 */
router.get('/api/recipes/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const take = Math.min(parseInt(String(req.query.take || '20'), 10), 50);
    const skip = Math.max(parseInt(String(req.query.skip || '0'), 10), 0);

    const where = q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: {
          author: { select: { id: true, name: true } },
          favoritedBy: true,
        },
      }),
      prisma.recipe.count({ where }),
    ]);

    return res.status(200).json({
      items: items.map(r => ({
        ...r,
        favoritedBy: undefined,
        favoritesCount: r.favoritedBy.length,
      })),
      total,
      take,
      skip,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
