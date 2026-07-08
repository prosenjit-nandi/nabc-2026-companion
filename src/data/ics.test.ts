import { describe, expect, it } from 'vitest'
import { buildIcs } from './ics'
import { makeEvent } from '../test/fixtures'
import { EVENT } from '../config/event'

describe('buildIcs', () => {
  it('produces a wrapper with no VEVENT blocks for an empty list', () => {
    const ics = buildIcs([])
    expect(ics).toBe(
      [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        `PRODID:-//${EVENT.fullName}//EN`,
        'CALSCALE:GREGORIAN',
        'END:VCALENDAR',
      ].join('\r\n'),
    )
  })

  it('builds a VEVENT block for a valid event', () => {
    const event = makeEvent({
      id: 'abc',
      title: 'Keynote',
      hall: 'Main Hall',
      details: 'Opening remarks',
      startDateTime: '2026-07-03T14:00:00',
      endDateTime: '2026-07-03T15:30:00',
    })
    const ics = buildIcs([event])
    expect(ics).toContain(`UID:abc@${EVENT.slug}`)
    expect(ics).toContain('DTSTART:20260703T140000')
    expect(ics).toContain('DTEND:20260703T153000')
    expect(ics).toContain('SUMMARY:Keynote')
    expect(ics).toContain('LOCATION:Main Hall')
    expect(ics).toContain('DESCRIPTION:Opening remarks')
  })

  it('skips events with a null startDateTime', () => {
    const event = makeEvent({ startDateTime: null })
    expect(buildIcs([event])).not.toContain('BEGIN:VEVENT')
  })

  it('skips events with a null endDateTime', () => {
    const event = makeEvent({ endDateTime: null })
    expect(buildIcs([event])).not.toContain('BEGIN:VEVENT')
  })

  it('skips events whose datetime does not match the expected format', () => {
    const event = makeEvent({ startDateTime: 'garbage', endDateTime: 'garbage' })
    expect(buildIcs([event])).not.toContain('BEGIN:VEVENT')
  })

  it('escapes commas, semicolons, backslashes, and newlines in text fields', () => {
    const event = makeEvent({
      title: 'Comma, semicolon; backslash\\',
      hall: 'Hall\nwith newline',
      details: 'Line one\nLine two',
    })
    const ics = buildIcs([event])
    expect(ics).toContain('SUMMARY:Comma\\, semicolon\\; backslash\\\\')
    expect(ics).toContain('LOCATION:Hall\\nwith newline')
    expect(ics).toContain('DESCRIPTION:Line one\\nLine two')
  })

  it('builds multiple VEVENT blocks for multiple events', () => {
    const a = makeEvent({ id: 'a' })
    const b = makeEvent({ id: 'b' })
    const ics = buildIcs([a, b])
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
  })
})
