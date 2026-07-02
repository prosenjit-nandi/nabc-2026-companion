import type { ScheduleEvent } from '../types/schedule'

function toMillis(iso: string | null): number | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  return Number.isNaN(t) ? null : t
}

export function sortByStart(events: ScheduleEvent[]): ScheduleEvent[] {
  return [...events].sort(
    (a, b) => a.sortDay - b.sortDay || a.sortTime - b.sortTime || a.sortHall - b.sortHall,
  )
}

export function getNowPlaying(events: ScheduleEvent[], now: Date): ScheduleEvent[] {
  const nowMs = now.getTime()
  return sortByStart(
    events.filter((e) => {
      const start = toMillis(e.startDateTime)
      const end = toMillis(e.endDateTime)
      if (start === null || end === null) return false
      return start <= nowMs && nowMs < end
    }),
  )
}

export function getUpNext(events: ScheduleEvent[], now: Date, limit = 5): ScheduleEvent[] {
  const nowMs = now.getTime()
  return sortByStart(
    events.filter((e) => {
      const start = toMillis(e.startDateTime)
      return start !== null && start > nowMs
    }),
  ).slice(0, limit)
}

export function groupByDay(events: ScheduleEvent[]): Map<string, ScheduleEvent[]> {
  const sorted = sortByStart(events)
  const map = new Map<string, ScheduleEvent[]>()
  for (const event of sorted) {
    const list = map.get(event.day)
    if (list) list.push(event)
    else map.set(event.day, [event])
  }
  return map
}

export function uniqueDays(events: ScheduleEvent[]): { day: string; date: string; sortDay: number }[] {
  const seen = new Map<string, { day: string; date: string; sortDay: number }>()
  for (const e of events) {
    if (!seen.has(e.day)) seen.set(e.day, { day: e.day, date: e.date, sortDay: e.sortDay })
  }
  return [...seen.values()].sort((a, b) => a.sortDay - b.sortDay)
}

export function uniqueHalls(events: ScheduleEvent[]): string[] {
  const seen = new Map<string, number>()
  for (const e of events) {
    if (!seen.has(e.hall)) seen.set(e.hall, e.sortHall)
  }
  return [...seen.entries()].sort((a, b) => a[1] - b[1]).map(([hall]) => hall)
}

export function currentOrFirstDay(events: ScheduleEvent[], now: Date): string | null {
  const days = uniqueDays(events)
  if (days.length === 0) return null
  const nowMs = now.getTime()
  const todayMatch = events.find((e) => {
    const start = toMillis(e.startDateTime)
    if (start === null) return false
    const startDate = new Date(start)
    return (
      startDate.getFullYear() === now.getFullYear() &&
      startDate.getMonth() === now.getMonth() &&
      startDate.getDate() === now.getDate()
    )
  })
  if (todayMatch) return todayMatch.day
  // before the event starts -> first day; after it ends -> last day
  const first = days[0]
  const last = days[days.length - 1]
  const firstStart = events.find((e) => e.day === first.day && e.startDateTime)?.startDateTime
  if (firstStart && nowMs < new Date(firstStart).getTime()) return first.day
  return last.day
}
