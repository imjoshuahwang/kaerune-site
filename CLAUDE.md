# Kaerune Site

Minimal single-page landing site for Kaerune, built to collect waitlist signups. Next.js
(app router, Webpack not Turbopack — see `package.json`), Tailwind, TypeScript, deployed on
Vercel with a Supabase backend for the waitlist.

- The email form posts to `/api/waitlist`. Without `SUPABASE_URL` /
  `SUPABASE_SERVICE_ROLE_KEY` set, it falls back to writing `data/waitlist.csv` locally — that
  fallback is intentional for local dev, not a bug.
- Production Supabase table is created by running `supabase/waitlist.sql` once in the Supabase
  SQL editor; env vars go in Vercel project settings.
- This is a small, single-page site — resist adding pages, state management, or abstractions
  it doesn't need yet.

## Definition of done

Josh doesn't read code. Before reporting anything finished: run it (`npm run dev`, use the Run
button) and show what actually happens — a screenshot or a description of clicking through it —
not just "the build passed."
