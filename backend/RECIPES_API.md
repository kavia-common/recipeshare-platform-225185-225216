# Recipes API

All endpoints are under the Express backend.

Auth: Provide Authorization: Bearer <jwt> header (NextAuth JWT compatible; signed with NEXTAUTH_SECRET).

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

- GET /api/recipes/search?q=&skip=&take=
  - Search by title/description. Returns items with favoritesCount and author basic info.

Environment:
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_FOLDER (optional)
- NEXTAUTH_SECRET
