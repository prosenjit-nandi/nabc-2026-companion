# Event Companion

A live-schedule companion PWA: what's playing now, what's up next, the full day-by-day
schedule, a personal "My Schedule" agenda, and search — installable on iPhone via Safari's
"Add to Home Screen".

This instance is currently configured for **NABC 2026** (July 3–5, 2026). See
[Configuring for a different event](#configuring-for-a-different-event) to repoint it.

Live app: https://prosenjit-nandi.github.io/event-companion/

## How it works

Schedule data comes from a build-time fetch adapter (see `scripts/sources/`). The active
adapter's source often doesn't send CORS headers, so the browser can't fetch it directly from
GitHub Pages. Instead, a GitHub Actions workflow (`.github/workflows/deploy.yml`) fetches it
server-side, writes `public/data/schedule.json`, builds the app, and deploys to Pages — on every
push, on a 10-minute schedule, and on manual dispatch. The deployed app reads that same-origin
JSON file and a service worker caches it for offline use.

Event times are parsed as local wall-clock datetimes (no timezone conversion), which is correct
since the app is meant to be used on a phone physically at the venue.

## Configuring for a different event

1. Edit `src/config/event.ts` — name, description, logo filename, and the `slug` used to
   namespace localStorage/IndexedDB keys and generated filenames (so a new event doesn't inherit
   stale data/favorites from a previous one).
2. Drop the new event's logo/icons into `public/` (matching the filenames referenced in
   `src/config/event.ts` and `vite.config.ts`).
3. Add a fetch adapter under `scripts/sources/` exporting an async `fetchSchedule()` that resolves
   to `{ events, sourceGeneratedAt, sourceLastChanged }`, with each event shaped like
   `ScheduleEvent` in `src/types/schedule.ts`. Register it in `scripts/sources/index.mjs`, then
   point `activeSource` (or the `EVENT_SOURCE` env var) at it.
4. If the deploy target (repo name / Pages path) changes, update `base`, `start_url`, and `scope`
   in `vite.config.ts` (and `vitest.config.ts`'s `base`) to match.

## Local development

```bash
npm install
npm run fetch-schedule   # populates public/data/schedule.json
npm run dev
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run fetch-schedule` — pull the latest schedule JSON via the active adapter in `scripts/sources/`
- `npm run build` — typecheck + production build
- `npm run lint` — oxlint
