import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Search } from './Search'
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

describe('Search', () => {
  it('shows all events sorted by start time when the query is empty', () => {
    const first = makeEvent({ id: 'a', title: 'Zebra Talk', sortTime: 2 })
    const second = makeEvent({ id: 'b', title: 'Alpha Talk', sortTime: 1 })
    mockedUseScheduleContext.mockReturnValue(baseContext({ events: [first, second] }))
    render(<Search />)
    const titles = screen.getAllByText(/Talk$/).map((el) => el.textContent)
    expect(titles).toEqual(['Alpha Talk', 'Zebra Talk'])
  })

  it('filters results by fuzzy query and marks now-playing matches', () => {
    const nowEvent = makeEvent({
      id: 'now-1',
      title: 'Jazz Ensemble',
      startDateTime: '2026-07-03T14:00:00',
      endDateTime: '2026-07-03T15:00:00',
    })
    const otherEvent = makeEvent({ id: 'other-1', title: 'Poetry Reading' })
    mockedUseScheduleContext.mockReturnValue(baseContext({ events: [nowEvent, otherEvent] }))
    render(<Search />)

    fireEvent.change(screen.getByPlaceholderText('Search programs, halls, performers...'), {
      target: { value: 'Jazz' },
    })

    expect(screen.getByText('Jazz Ensemble')).toBeInTheDocument()
    expect(screen.queryByText('Poetry Reading')).not.toBeInTheDocument()
    expect(screen.getByText('NOW')).toBeInTheDocument()
  })

  it('does not mark an event outside the now-playing window', () => {
    const pastEvent = makeEvent({
      id: 'past-1',
      title: 'Past Talk',
      startDateTime: '2026-07-03T10:00:00',
      endDateTime: '2026-07-03T11:00:00',
    })
    mockedUseScheduleContext.mockReturnValue(baseContext({ events: [pastEvent] }))
    render(<Search />)
    expect(screen.getByText('Past Talk')).toBeInTheDocument()
    expect(screen.queryByText('NOW')).not.toBeInTheDocument()
  })

  it('shows a no-matches message for an unmatched query', () => {
    const event = makeEvent({ title: 'Jazz Ensemble' })
    mockedUseScheduleContext.mockReturnValue(baseContext({ events: [event] }))
    render(<Search />)

    fireEvent.change(screen.getByPlaceholderText('Search programs, halls, performers...'), {
      target: { value: 'zzzzxyxyxy' },
    })

    expect(screen.getByText('No matches.')).toBeInTheDocument()
  })

  it('toggles favorites from search results', () => {
    const event = makeEvent({ id: 'evt-1' })
    const toggleFavorite = vi.fn()
    mockedUseScheduleContext.mockReturnValue(baseContext({ events: [event], toggleFavorite }))
    render(<Search />)
    fireEvent.click(screen.getByLabelText('Add to My Schedule'))
    expect(toggleFavorite).toHaveBeenCalledWith('evt-1')
  })
})
