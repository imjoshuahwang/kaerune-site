# Kaerune Site

Minimal single-page Kaerune landing site.

## Run

```bash
npm install
npm run dev
```

## Waitlist

The email form posts to `/api/waitlist`.

In production, set these environment variables:

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Then run `supabase/waitlist.sql` once in the Supabase SQL editor.

Without those variables, local development falls back to `data/waitlist.csv`.

Each submission stores:

```text
created_at,email,ip,user_agent
```

## Deploy

Use GitHub for the code and Vercel for hosting. Add the Supabase variables in Vercel project settings before the production deploy.
