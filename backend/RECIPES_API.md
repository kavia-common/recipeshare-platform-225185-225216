# Recipes API

All endpoints are under the Express backend.

Auth:
- By default, the API accepts Authorization: Bearer <jwt> compatible with NextAuth-style JWTs signed with NEXTAUTH_SECRET.
- When SUPABASE_URL and SUPABASE_SERVICE_KEY are set, protected routes are additionally guarded by Supabase Auth:
  - Send Authorization: Bearer <supabase_access_token> from Supabase client.
  - The middleware verifies the token with Supabase and sets req.user from the Supabase user.
- If Supabase env is not present, the middleware no-ops and the existing auth continues to work. This avoids startup failures.

Protected routes (require Bearer token):
- POST /api/recipes
  - Multipart form-data fields: title, description, ingredients (JSON), instructions (JSON), prepTime, cookTime, servings, difficulty, image (file)
  - Returns 201 with created recipe.

- PATCH /api/recipes/:id
  - Multipart form-data with any fields above; image optional.
  - Author-only.

- DELETE /api/recipes/:id
  - Author-only. Returns 204.

- POST /api/recipes/:id/favorite
  - Marks recipe as favorite for current user.

- POST /api/recipes/:id/unfavorite
  - Removes favorite mark.

Public:
- GET /api/recipes/search?q=&skip=&take=
  - Search by title/description. Returns items with favoritesCount and author basic info.

Environment:
- DATABASE_URL (Supabase Postgres, with sslmode=require)
- SUPABASE_URL, SUPABASE_SERVICE_KEY (optional, enables Supabase Auth on protected routes)
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_FOLDER (optional)
- NEXTAUTH_SECRET
