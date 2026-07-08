// Single source of truth for the event this deployment is configured for.
// To repoint the app at a different event: update the fields below, drop a
// matching logo at public/<logo>, and add a fetch adapter under
// scripts/sources/ (see scripts/sources/index.mjs).
export const EVENT = {
  // Used to namespace localStorage/IndexedDB keys and generated filenames, so
  // switching events doesn't leak stale data/favorites from a prior one.
  slug: 'nabc-2026',
  name: 'NABC 2026',
  fullName: 'NABC 2026 Companion',
  shortName: 'NABC Companion',
  description: 'Live schedule companion for NABC 2026 — now playing, up next, and your personal agenda.',
  logo: 'event-logo.png',
  source: {
    id: 'nabcapp',
    label: 'nabcapp.com',
    attributionUrl: 'https://nabcapp.com/custom/event-schedule.php',
  },
} as const
