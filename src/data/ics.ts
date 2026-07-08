import type { ScheduleEvent } from '../types/schedule'
import { EVENT } from '../config/event'

function toIcsDate(iso: string | null): string | null {
  if (!iso) return null
  // "2026-07-03T14:00:00" -> "20260703T140000" (floating local time, no timezone conversion)
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(iso)
  if (!match) return null
  const [, y, mo, d, h, mi, s] = match
  return `${y}${mo}${d}T${h}${mi}${s}`
}

function escapeText(value: string): string {
  return value.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n')
}

export function buildIcs(events: ScheduleEvent[]): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${EVENT.fullName}//EN`, 'CALSCALE:GREGORIAN']
  for (const event of events) {
    const start = toIcsDate(event.startDateTime)
    const end = toIcsDate(event.endDateTime)
    if (!start || !end) continue
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@${EVENT.slug}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeText(event.title)}`,
      `LOCATION:${escapeText(event.hall)}`,
      `DESCRIPTION:${escapeText(event.details)}`,
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}
