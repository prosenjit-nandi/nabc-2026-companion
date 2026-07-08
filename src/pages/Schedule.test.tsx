import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Schedule } from './Schedule'
import { useScheduleContext } from '../context/ScheduleContext'
import { makeEvent } from '../test/fixtures'

vi.mock('../context/ScheduleContext', () => ({
  useScheduleContext: vi.fn(),
}))

const mockedUseScheduleContext = vi.mocked(useScheduleContext)

function baseContext(overrides: Partial<ReturnType<typeof useScheduleContext>> = {}) {
  return {
    events: [],
    lastUpdated: null,
    loading: false,
    error: null,
    refresh: vi.fn(),
    favoriteIds: new Set<string>(),
    loaded: true,
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
    clearAll: vi.fn(),
    ...overrides,
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-07-03T14:30:00'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Schedule', () => {
  it('shows a spinner while loading with no events yet', () => {
    mockedUseScheduleContext.mockReturnValue(baseContext({ loading: true, events: [] }))
    render(<Schedule />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('shows an error alert when loading failed with no events', () => {
    mockedUseScheduleContext.mockReturnValue(baseContext({ error: 'Network down', events: [] }))
    render(<Schedule />)
    expect(screen.getByText('Network down')).toBeInTheDocument()
  })

  it('renders content even while loading if events are already cached', () => {
    const event = makeEvent()
    mockedUseScheduleContext.mockReturnValue(baseContext({ loading: true, events: [event] }))
    render(<Schedule />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('renders content even with a stale error if events are already cached', () => {
    const event = makeEvent()
    mockedUseScheduleContext.mockReturnValue(baseContext({ error: 'stale', events: [event] }))
    render(<Schedule />)
    expect(screen.queryByText('stale')).not.toBeInTheDocument()
  })

  it('shows the empty-filter message and only the All Theaters chip when there are no events', () => {
    mockedUseScheduleContext.mockReturnValue(baseContext({ events: [] }))
    render(<Schedule />)
    expect(screen.getByText('No programs for this filter.')).toBeInTheDocument()
    expect(screen.getByText('All Theaters')).toBeInTheDocument()
  })

  it('defaults to the current day, lists halls, and marks now-playing events', () => {
    const nowEvent = makeEvent({
      id: 'now-1',
      title: 'Now Event',
      day: 'Friday',
      hall: 'Main Hall',
      sortDay: 1,
      sortHall: 1,
      startDateTime: '2026-07-03T14:00:00',
      endDateTime: '2026-07-03T15:00:00',
    })
    const laterEvent = makeEvent({
      id: 'later-1',
      title: 'Later Event',
      day: 'Friday',
      hall: 'Second Hall',
      sortDay: 1,
      sortHall: 2,
      startDateTime: '2026-07-03T18:00:00',
      endDateTime: '2026-07-03T19:00:00',
    })
    const otherDayEvent = makeEvent({
      id: 'sat-1',
      title: 'Saturday Event',
      day: 'Saturday',
      hall: 'Third Hall',
      sortDay: 2,
      sortHall: 3,
      startDateTime: '2026-07-04T14:00:00',
      endDateTime: '2026-07-04T15:00:00',
    })
    mockedUseScheduleContext.mockReturnValue(
      baseContext({ events: [nowEvent, laterEvent, otherDayEvent] }),
    )
    render(<Schedule />)

    expect(screen.getByText('Now Event')).toBeInTheDocument()
    expect(screen.getByText('Later Event')).toBeInTheDocument()
    expect(screen.queryByText('Saturday Event')).not.toBeInTheDocument()
    expect(screen.getByText('NOW')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Saturday' }))
    expect(screen.getByText('Saturday Event')).toBeInTheDocument()
    expect(screen.queryByText('Now Event')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Friday' }))
    expect(screen.getByText('Now Event')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Second Hall' }))
    expect(screen.getByText('Later Event')).toBeInTheDocument()
    expect(screen.queryByText('Now Event')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Third Hall' }))
    expect(screen.getByText('No programs for this filter.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'All Theaters' }))
    expect(screen.getByText('Now Event')).toBeInTheDocument()
    expect(screen.getByText('Later Event')).toBeInTheDocument()
  })

  it('toggles favorites from within the filtered list', () => {
    const event = makeEvent({ id: 'evt-1', day: 'Friday', sortDay: 1 })
    const toggleFavorite = vi.fn()
    mockedUseScheduleContext.mockReturnValue(baseContext({ events: [event], toggleFavorite }))
    render(<Schedule />)
    fireEvent.click(screen.getByLabelText('Add to My Schedule'))
    expect(toggleFavorite).toHaveBeenCalledWith('evt-1')
  })
})
