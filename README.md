# Pixel Perfect

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d08c5a15-ae28-440c-a1ad-c96ecdd6269a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Image Assets & Distribution (`dist`) Structure

When working locally, uploading to GitHub, or deploying:

- **Source Images**: Located in `src/assets/` and `public/images/` / `public/assets/`. All 60+ store product photos, banners, and logos are tracked here.
- **Production Build (`dist/`)**: Running `npm run build` generates the complete production bundle in `dist/`:
  - `dist/assets/`: Bundled and hashed client JavaScript, CSS, and optimized image assets.
  - `dist/images/`: Verbatim public static product and banner images.
  - `dist/_redirects` & `dist/_headers`: Netlify serverless and CDN configuration files.
- **Cloudinary CDN**: Product media and uploaded assets are also integrated with Cloudinary via `src/lib/cloudinary.server.ts`.

## Environment Variables (`.env`)

The project uses `.env` for credentials so you can update them anytime:

```env
# Supabase
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_PROJECT_ID=...

# Cloudinary (Media upload & management)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Deployment on Netlify

1. Connect the repository to Netlify (or drag & drop the `dist/` folder).
2. Set build command: `npm run build` (or `npm run build:netlify`).
3. Set publish directory: `dist`.
4. Add the environment variables from `.env` in your Netlify site settings.

