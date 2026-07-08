import { fetchSchedule as nabcapp } from './nabcapp.mjs'

// Each entry is an async fetchSchedule() that resolves to
// { events, sourceGeneratedAt, sourceLastChanged }, with events shaped like
// src/types/schedule.ts's ScheduleEvent. Add a new adapter file here to pull
// from a different event source, then reference it below.
export const sources = { nabcapp }

// Set EVENT_SOURCE to switch which adapter scripts/fetch-schedule.mjs runs,
// e.g. `EVENT_SOURCE=myevent npm run fetch-schedule`.
export const activeSource = process.env.EVENT_SOURCE || 'nabcapp'
