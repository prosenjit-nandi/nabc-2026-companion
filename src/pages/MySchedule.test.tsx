import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { saveAs } from 'file-saver'
import { MySchedule } from './MySchedule'
import { useScheduleContext } from '../context/ScheduleContext'
import { makeEvent } from '../test/fixtures'

vi.mock('../context/ScheduleContext', () => ({
  useScheduleContext: vi.fn(),
}))

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}))

const mockedUseScheduleContext = vi.mocked(useScheduleContext)
const mockedSaveAs = vi.mocked(saveAs)

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
    isFavorite: vi.fn(() => true),
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

describe('MySchedule', () => {
  it('renders nothing until favorites have loaded', () => {
    mockedUseScheduleContext.mockReturnValue(baseContext({ loaded: false }))
    const { container } = render(<MySchedule />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows an empty-state message when no events are favorited', () => {
    const event = makeEvent({ id: 'evt-1' })
    mockedUseScheduleContext.mockReturnValue(
      baseContext({ events: [event], favoriteIds: new Set() }),
    )
    render(<MySchedule />)
    expect(screen.getByText('Your schedule is empty')).toBeInTheDocument()
  })

  it('groups favorited events by day, flags now-playing, and exports to an ICS file', () => {
    const nowEvent = makeEvent({
      id: 'now-1',
      title: 'Now Event',
      day: 'Friday',
      sortDay: 1,
      startDateTime: '2026-07-03T14:00:00',
      endDateTime: '2026-07-03T15:00:00',
    })
    const laterEvent = makeEvent({
      id: 'later-1',
      title: 'Later Event',
      day: 'Saturday',
      sortDay: 2,
      startDateTime: '2026-07-04T14:00:00',
      endDateTime: '2026-07-04T15:00:00',
    })
    const notFavorited = makeEvent({ id: 'skip-1', title: 'Skip Event' })
    mockedUseScheduleContext.mockReturnValue(
      baseContext({
        events: [nowEvent, laterEvent, notFavorited],
        favoriteIds: new Set(['now-1', 'later-1']),
      }),
    )
    render(<MySchedule />)

    expect(screen.getByText('Friday')).toBeInTheDocument()
    expect(screen.getByText('Saturday')).toBeInTheDocument()
    expect(screen.getByText('Now Event')).toBeInTheDocument()
    expect(screen.getByText('Later Event')).toBeInTheDocument()
    expect(screen.queryByText('Skip Event')).not.toBeInTheDocument()
    expect(screen.getByText('NOW')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Export to Calendar'))
    expect(mockedSaveAs).toHaveBeenCalledTimes(1)
    const [blob, filename] = mockedSaveAs.mock.calls[0]
    expect(blob).toBeInstanceOf(Blob)
    expect(filename).toBe('nabc-2026-my-schedule.ics')
  })

  it('toggles a favorite off from within My Schedule', () => {
    const event = makeEvent({ id: 'evt-1' })
    const toggleFavorite = vi.fn()
    mockedUseScheduleContext.mockReturnValue(
      baseContext({ events: [event], favoriteIds: new Set(['evt-1']), toggleFavorite }),
    )
    render(<MySchedule />)
    fireEvent.click(screen.getByLabelText('Remove from My Schedule'))
    expect(toggleFavorite).toHaveBeenCalledWith('evt-1')
  })
})
