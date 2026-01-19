# Deployment Instructions for Netlify

## Required Environment Variables

Your Netlify site requires the following environment variables to function properly:

1. **VITE_SUPABASE_URL**
   - Value: `https://sxizpbdjjyzfgeufrhte.supabase.co`

2. **VITE_SUPABASE_ANON_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4aXpwYmRqanl6ZmdldWZyaHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjExNzEsImV4cCI6MjA3NjczNzE3MX0.BouEiUOZm_6LtJu6lR_erA1PZGNmrPw22k7TrYnyjwU`

## How to Set Environment Variables in Netlify

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your site: **whimsical-fox-396af8**
3. Go to **Site settings**
4. Navigate to **Environment variables** (in the left sidebar)
5. Click **Add a variable**
6. Add each variable:
   - Key: `VITE_SUPABASE_URL`
   - Value: (paste the URL above)
   - Click **Create variable**

   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: (paste the key above)
   - Click **Create variable**

7. **Trigger a new deploy** after adding the variables:
   - Go to **Deploys** tab
   - Click **Trigger deploy** > **Clear cache and deploy site**

## Troubleshooting

If the site shows a blank page after deployment:

1. **Check the deploy log** for any build errors
2. **Verify environment variables** are set correctly (no extra spaces or quotes)
3. **Clear browser cache** and do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check browser console** for errors (F12 > Console tab)

## Build Settings

The correct build settings are already in `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18

These should be automatically detected by Netlify.
