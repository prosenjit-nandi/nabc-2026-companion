import { describe, expect, it } from 'vitest'
import {
  currentOrFirstDay,
  getNowPlaying,
  getUpNext,
  groupByDay,
  sortByStart,
  uniqueDays,
  uniqueHalls,
} from './scheduleSelectors'
import { makeEvent } from '../test/fixtures'

describe('sortByStart', () => {
  it('sorts by day, then time, then hall', () => {
    const a = makeEvent({ id: 'a', sortDay: 2, sortTime: 1, sortHall: 1 })
    const b = makeEvent({ id: 'b', sortDay: 1, sortTime: 2, sortHall: 1 })
    const c = makeEvent({ id: 'c', sortDay: 1, sortTime: 1, sortHall: 2 })
    const d = makeEvent({ id: 'd', sortDay: 1, sortTime: 1, sortHall: 1 })
    const result = sortByStart([a, b, c, d])
    expect(result.map((e) => e.id)).toEqual(['d', 'c', 'b', 'a'])
  })

  it('does not mutate the input array', () => {
    const a = makeEvent({ id: 'a', sortDay: 2 })
    const b = makeEvent({ id: 'b', sortDay: 1 })
    const input = [a, b]
    sortByStart(input)
    expect(input).toEqual([a, b])
  })
})

describe('getNowPlaying', () => {
  it('returns events whose window contains now', () => {
    const inWindow = makeEvent({
      id: 'in',
      startDateTime: '2026-07-03T14:00:00',
      endDateTime: '2026-07-03T15:00:00',
    })
    const before = makeEvent({
      id: 'before',
      startDateTime: '2026-07-03T10:00:00',
      endDateTime: '2026-07-03T11:00:00',
    })
    const after = makeEvent({
      id: 'after',
      startDateTime: '2026-07-03T16:00:00',
      endDateTime: '2026-07-03T17:00:00',
    })
    const now = new Date('2026-07-03T14:30:00')
    expect(getNowPlaying([inWindow, before, after], now).map((e) => e.id)).toEqual(['in'])
  })

  it('excludes events with null start or end datetime', () => {
    const noStart = makeEvent({ id: 'no-start', startDateTime: null })
    const noEnd = makeEvent({ id: 'no-end', endDateTime: null })
    const now = new Date('2026-07-03T14:30:00')
    expect(getNowPlaying([noStart, noEnd], now)).toEqual([])
  })

  it('treats an unparsable datetime string as absent', () => {
    const event = makeEvent({ startDateTime: 'not-a-date', endDateTime: '2026-07-03T15:00:00' })
    const now = new Date('2026-07-03T14:30:00')
    expect(getNowPlaying([event], now)).toEqual([])
  })

  it('treats the end instant as exclusive', () => {
    const event = makeEvent({
      startDateTime: '2026-07-03T14:00:00',
      endDateTime: '2026-07-03T15:00:00',
    })
    const now = new Date('2026-07-03T15:00:00')
    expect(getNowPlaying([event], now)).toEqual([])
  })
})

describe('getUpNext', () => {
  it('returns only future events sorted and limited', () => {
    const events = [
      makeEvent({ id: '1', sortDay: 1, sortTime: 1, startDateTime: '2026-07-03T16:00:00' }),
      makeEvent({ id: '2', sortDay: 1, sortTime: 2, startDateTime: '2026-07-03T17:00:00' }),
      makeEvent({ id: '3', sortDay: 1, sortTime: 3, startDateTime: '2026-07-03T18:00:00' }),
      makeEvent({ id: 'past', sortDay: 1, sortTime: 0, startDateTime: '2026-07-03T10:00:00' }),
    ]
    const now = new Date('2026-07-03T12:00:00')
    const result = getUpNext(events, now, 2)
    expect(result.map((e) => e.id)).toEqual(['1', '2'])
  })

  it('excludes events with a null startDateTime', () => {
    const event = makeEvent({ startDateTime: null })
    const now = new Date('2026-07-03T12:00:00')
    expect(getUpNext([event], now)).toEqual([])
  })

  it('defaults the limit to 5', () => {
    const events = Array.from({ length: 7 }, (_, i) =>
      makeEvent({ id: `e${i}`, sortTime: i, startDateTime: `2026-07-03T${14 + i}:00:00` }),
    )
    const now = new Date('2026-07-03T10:00:00')
    expect(getUpNext(events, now)).toHaveLength(5)
  })
})

describe('groupByDay', () => {
  it('groups sorted events by day, preserving first-seen day order', () => {
    const fri1 = makeEvent({ id: 'fri1', day: 'Friday', sortDay: 1, sortTime: 2 })
    const fri2 = makeEvent({ id: 'fri2', day: 'Friday', sortDay: 1, sortTime: 1 })
    const sat1 = makeEvent({ id: 'sat1', day: 'Saturday', sortDay: 2, sortTime: 1 })
    const grouped = groupByDay([fri1, sat1, fri2])
    expect([...grouped.keys()]).toEqual(['Friday', 'Saturday'])
    expect(grouped.get('Friday')?.map((e) => e.id)).toEqual(['fri2', 'fri1'])
    expect(grouped.get('Saturday')?.map((e) => e.id)).toEqual(['sat1'])
  })

  it('returns an empty map for no events', () => {
    expect(groupByDay([]).size).toBe(0)
  })
})

describe('uniqueDays', () => {
  it('returns unique days sorted by sortDay', () => {
    const events = [
      makeEvent({ day: 'Saturday', date: 'July 4, 2026', sortDay: 2 }),
      makeEvent({ day: 'Friday', date: 'July 3, 2026', sortDay: 1 }),
      makeEvent({ day: 'Friday', date: 'July 3, 2026', sortDay: 1 }),
    ]
    expect(uniqueDays(events)).toEqual([
      { day: 'Friday', date: 'July 3, 2026', sortDay: 1 },
      { day: 'Saturday', date: 'July 4, 2026', sortDay: 2 },
    ])
  })

  it('returns an empty array for no events', () => {
    expect(uniqueDays([])).toEqual([])
  })
})

describe('uniqueHalls', () => {
  it('returns unique halls sorted by sortHall', () => {
    const events = [
      makeEvent({ hall: 'Second Hall', sortHall: 2 }),
      makeEvent({ hall: 'Main Hall', sortHall: 1 }),
      makeEvent({ hall: 'Main Hall', sortHall: 1 }),
    ]
    expect(uniqueHalls(events)).toEqual(['Main Hall', 'Second Hall'])
  })
})

describe('currentOrFirstDay', () => {
  it('returns null when there are no events', () => {
    expect(currentOrFirstDay([], new Date('2026-07-03T12:00:00'))).toBeNull()
  })

  it("returns today's day when an event starts today", () => {
    const events = [
      makeEvent({ day: 'Friday', sortDay: 1, startDateTime: '2026-07-03T14:00:00' }),
      makeEvent({ day: 'Saturday', sortDay: 2, startDateTime: '2026-07-04T14:00:00' }),
    ]
    const now = new Date('2026-07-03T09:00:00')
    expect(currentOrFirstDay(events, now)).toBe('Friday')
  })

  it('ignores events with a null startDateTime when matching today', () => {
    const events = [makeEvent({ day: 'Friday', startDateTime: null })]
    const now = new Date('2026-07-03T09:00:00')
    expect(currentOrFirstDay(events, now)).toBe('Friday')
  })

  it('returns the first day before the event begins', () => {
    const events = [
      makeEvent({ day: 'Friday', sortDay: 1, startDateTime: '2026-07-03T14:00:00' }),
      makeEvent({ day: 'Saturday', sortDay: 2, startDateTime: '2026-07-04T14:00:00' }),
    ]
    const now = new Date('2026-07-01T09:00:00')
    expect(currentOrFirstDay(events, now)).toBe('Friday')
  })

  it('returns the last day after the event has ended', () => {
    const events = [
      makeEvent({ day: 'Friday', sortDay: 1, startDateTime: '2026-07-03T14:00:00' }),
      makeEvent({ day: 'Saturday', sortDay: 2, startDateTime: '2026-07-04T14:00:00' }),
    ]
    const now = new Date('2026-07-10T09:00:00')
    expect(currentOrFirstDay(events, now)).toBe('Saturday')
  })

  it('falls back to the last day when the first day has no startDateTime', () => {
    const events = [
      makeEvent({ day: 'Friday', sortDay: 1, startDateTime: null }),
      makeEvent({ day: 'Saturday', sortDay: 2, startDateTime: '2026-07-04T14:00:00' }),
    ]
    const now = new Date('2026-07-01T09:00:00')
    expect(currentOrFirstDay(events, now)).toBe('Saturday')
  })
})
