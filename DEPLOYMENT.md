# Netlify Deployment Guide

## Build Settings
Use these settings for this repository:
- Build command: `npm run build`
- Publish directory: `dist`
- Base directory: (leave blank)
- Node: 18+

## Required Environment Variables
Set these in Netlify for your site:

1. `VITE_SUPABASE_URL`
   - Example: `https://<your-project-ref>.supabase.co`
2. `VITE_SUPABASE_ANON_KEY`
   - Use your Supabase anon/public key

Notes:
- Do not commit real keys to git.
- `VITE_*` variables are exposed to the client bundle by design.

## Connect Existing Site to GitHub
1. Open Netlify site settings.
2. Go to **Build & deploy**.
3. Under **Continuous Deployment**, link the GitHub repository.
4. Use branch `main` for production deploys.

## Apply Env Var Changes
After adding or updating environment variables:
1. Go to **Deploys**.
2. Click **Trigger deploy**.
3. Choose **Clear cache and deploy site**.

## Supabase Checklist
Before testing auth/data flows:
1. Ensure Supabase project is active (not paused).
2. Run migrations in order:
   - `supabase/migrations/20251022212436_initial_schema.sql`
   - `supabase/migrations/20251027194201_fix_security_and_performance_issues.sql`
   - `supabase/migrations/20260305193000_create_tax_documents_storage.sql`
3. Configure **Authentication → URL Configuration**:
   - Site URL: your Netlify production URL
   - Redirect URLs: production URL and local dev URL (`http://localhost:5173`)

## Storage
The upload flow now uses a private Supabase Storage bucket named `tax-documents`.

If you do not apply the storage migration, document uploads will fail because the bucket and policies will be missing.

## Verification
After deployment, verify:
1. Signup creates an account.
2. Email confirmation link redirects to valid app URL.
3. Sign-in succeeds and dashboard data loads.
4. Browser console shows no `placeholder.supabase.co` usage.

## Common Issues
- App returns to home after signup:
  - User likely not confirmed yet; confirm email first.
- Confirmation link opens `localhost` in production:
  - Update Supabase Auth URL configuration.
- Live app still uses placeholder Supabase:
  - Netlify env var names are wrong or missing (`VITE_SUPABASE_*`).
