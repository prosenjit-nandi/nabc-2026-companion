# NABC 2026 Companion

A live-schedule companion PWA for NABC 2026 (July 3–5, 2026). Shows what's playing now,
what's up next, the full day-by-day schedule, a personal "My Schedule" agenda, and search —
installable on iPhone via Safari's "Add to Home Screen".

Live app: https://prosenjit-nandi.github.io/nabc-2026-companion/

## How it works

Schedule data comes from `https://nabcapp.com/custom/event-schedule.php?json=1`. That endpoint
doesn't send CORS headers, so the browser can't fetch it directly from GitHub Pages. Instead, a
GitHub Actions workflow (`.github/workflows/deploy.yml`) fetches it server-side, writes
`public/data/schedule.json`, builds the app, and deploys to Pages — on every push, on a 10-minute
schedule, and on manual dispatch. The deployed app reads that same-origin JSON file and a service
worker caches it for offline use.

Event times are parsed as local wall-clock datetimes (no timezone conversion), which is correct
since the app is meant to be used on a phone physically at the venue.

## Local development

```bash
npm install
npm run fetch-schedule   # populates public/data/schedule.json
npm run dev
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run fetch-schedule` — pull the latest schedule JSON from nabcapp.com
- `npm run build` — typecheck + production build
- `npm run lint` — oxlint
