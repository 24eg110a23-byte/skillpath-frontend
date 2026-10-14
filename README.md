# Skillpath frontend deployment

## Deploy to Vercel

1. Import the `skillpath-frontend` GitHub repository into Vercel. Use the repository root as the project root; it contains `package.json`.
2. Keep the build command as `npm run build` and the output directory as `dist`.
3. Add the `VITE_API_URL` environment variable for each Vercel environment, with the Railway API URL ending in `/api`, for example `https://your-api.up.railway.app/api`.
4. Deploy or redeploy the frontend, then set `SKILLPATH_CORS_ALLOWED_ORIGINS` in Railway to the Vercel site's origin (scheme and host only).

The included `vercel.json` serves the SPA entry point for client-side routes.
