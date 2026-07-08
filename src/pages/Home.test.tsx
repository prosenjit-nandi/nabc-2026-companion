import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Home } from './Home'
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

describe('Home', () => {
  it('shows a spinner while loading with no events yet', () => {
    mockedUseScheduleContext.mockReturnValue(baseContext({ loading: true, events: [] }))
    render(<Home />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('shows an error alert when loading failed with no events', () => {
    mockedUseScheduleContext.mockReturnValue(baseContext({ error: 'Network down', events: [] }))
    render(<Home />)
    expect(screen.getByText('Network down')).toBeInTheDocument()
  })

  it('renders content even while loading if events are already cached', () => {
    const event = makeEvent()
    mockedUseScheduleContext.mockReturnValue(baseContext({ loading: true, events: [event] }))
    render(<Home />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('renders content even with a stale error if events are already cached', () => {
    const event = makeEvent()
    mockedUseScheduleContext.mockReturnValue(baseContext({ error: 'stale', events: [event] }))
    render(<Home />)
    expect(screen.queryByText('stale')).not.toBeInTheDocument()
  })

  it('shows empty-state copy and no day chip when there are no events', () => {
    mockedUseScheduleContext.mockReturnValue(baseContext({ events: [] }))
    render(<Home />)
    expect(screen.getByText('Nothing is on right now. Check Up Next below.')).toBeInTheDocument()
    expect(screen.getByText('No more programs scheduled.')).toBeInTheDocument()
  })

  it('renders now playing and up next lists with the day chip, wired to favorites', () => {
    const nowEvent = makeEvent({
      id: 'now-1',
      title: 'Now Event',
      day: 'Friday',
      sortDay: 1,
      startDateTime: '2026-07-03T14:00:00',
      endDateTime: '2026-07-03T15:00:00',
    })
    const nextEvent = makeEvent({
      id: 'next-1',
      title: 'Next Event',
      day: 'Friday',
      sortDay: 1,
      startDateTime: '2026-07-03T16:00:00',
      endDateTime: '2026-07-03T17:00:00',
    })
    const toggleFavorite = vi.fn()
    mockedUseScheduleContext.mockReturnValue(
      baseContext({ events: [nowEvent, nextEvent], toggleFavorite, isFavorite: vi.fn(() => false) }),
    )
    render(<Home />)

    expect(screen.getByText('Friday')).toBeInTheDocument()
    expect(screen.getByText('Now Event')).toBeInTheDocument()
    expect(screen.getByText('Next Event')).toBeInTheDocument()
    expect(screen.getByText('NOW')).toBeInTheDocument()
    expect(screen.getByText('NEXT')).toBeInTheDocument()

    const [firstStar] = screen.getAllByLabelText('Add to My Schedule')
    fireEvent.click(firstStar)
    expect(toggleFavorite).toHaveBeenCalledWith('now-1')
  })

  it('ticks the clock on an interval and cleans up on unmount', () => {
    mockedUseScheduleContext.mockReturnValue(baseContext({ events: [] }))
    const { unmount } = render(<Home />)
    vi.advanceTimersByTime(30_000)
    unmount()
  })
})
