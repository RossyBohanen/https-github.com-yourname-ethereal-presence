# Ethereal Presence

Ethereal Presence is a TypeScript + React app with server-side components that use Upstash QStash for background jobs.

## Quick start (local)

1. Copy example env:
   ```
   cp .env.example .env.local
   ```
2. Install:
   ```
   npm ci
   ```
3. Run dev:
   ```
   npm run dev
   ```
4. Build:
   ```
   npm run build
   ```
5. Test:
   ```
   npm run test
   ```
6. Preview:
   ```
   npm run preview
   ```

## Environment

See `.env.example` for required environment variables. Important items:
- `QSTASH_TOKEN` — server-only Upstash QStash token (do not commit)
- `QSTASH_BASE_URL` — public base URL used to build webhook target URLs

## QStash

Server code that publishes jobs is located at `lib/queue/qstash.ts`. Code is defensive:
- Publishing functions return a structured result `{ ok, id?, error? }`.
- If `QSTASH_TOKEN` is not set, publish operations return a clear failure and do not attempt to contact Upstash.

## Contributing

Please see CONTRIBUTING.md for contribution guidelines, branch naming, and PR checklist.

## Security

If you discover a security issue, follow SECURITY.md to report it responsibly.

## Deployment

This project is typically deployed on Vercel or Netlify. If you have a previously misconfigured homepage or deployment URL, update the "Homepage" / site URL in the repository settings and update environment variables accordingly.