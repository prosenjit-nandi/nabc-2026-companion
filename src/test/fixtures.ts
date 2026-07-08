import type { ScheduleEvent } from '../types/schedule'

let counter = 0

export function makeEvent(overrides: Partial<ScheduleEvent> = {}): ScheduleEvent {
  counter += 1
  return {
    id: `event-${counter}`,
    day: 'Friday',
    date: 'July 3, 2026',
    hall: 'Main Hall',
    title: `Event ${counter}`,
    details: 'Some details',
    startTime: '2:00 PM',
    endTime: '3:00 PM',
    startDateTime: '2026-07-03T14:00:00',
    endDateTime: '2026-07-03T15:00:00',
    status: 'confirmed',
    sortDay: 1,
    sortTime: 1,
    sortHall: 1,
    ...overrides,
  }
}

export function resetFixtureCounter() {
  counter = 0
}
