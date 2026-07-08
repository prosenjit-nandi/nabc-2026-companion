import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppShell } from './AppShell'
import { useScheduleContext } from './context/ScheduleContext'
import { ThemeModeProvider } from './context/ThemeModeContext'
import { makeEvent } from './test/fixtures'

vi.mock('./context/ScheduleContext', () => ({
  ScheduleProvider: ({ children }: { children: React.ReactNode }) => children,
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

function renderShell() {
  return render(
    <ThemeModeProvider>
      <AppShell />
    </ThemeModeProvider>,
  )
}

beforeEach(() => {
  window.location.hash = ''
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-07-03T14:30:00'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('AppShell', () => {
  it('renders the top bar branding and clock', () => {
    mockedUseScheduleContext.mockReturnValue(baseContext())
    renderShell()
    expect(screen.getByText('NABC 2026')).toBeInTheDocument()
    expect(screen.getByText(/\d{1,2}:\d{2}\s?[AP]M/i)).toBeInTheDocument()
  })

  it('shows "never" when the schedule has not synced', () => {
    mockedUseScheduleContext.mockReturnValue(baseContext({ lastUpdated: null }))
    renderShell()
    expect(screen.getByText('Synced never')).toBeInTheDocument()
  })

  it('shows "just now" for a very recent sync', () => {
    mockedUseScheduleContext.mockReturnValue(
      baseContext({ lastUpdated: new Date(Date.now() - 10_000) }),
    )
    renderShell()
    expect(screen.getByText('Synced just now')).toBeInTheDocument()
  })

  it('shows minutes ago for a sync a few minutes old', () => {
    mockedUseScheduleContext.mockReturnValue(
      baseContext({ lastUpdated: new Date(Date.now() - 5 * 60_000) }),
    )
    renderShell()
    expect(screen.getByText('Synced 5m ago')).toBeInTheDocument()
  })

  it('shows hours ago for an older sync', () => {
    mockedUseScheduleContext.mockReturnValue(
      baseContext({ lastUpdated: new Date(Date.now() - 3 * 3_600_000) }),
    )
    renderShell()
    expect(screen.getByText('Synced 3h ago')).toBeInTheDocument()
  })

  it('ticks the displayed clock every second and cleans up on unmount', () => {
    mockedUseScheduleContext.mockReturnValue(baseContext())
    const { unmount } = renderShell()
    vi.advanceTimersByTime(1000)
    unmount()
  })

  it('navigates between tabs via the bottom navigation', () => {
    mockedUseScheduleContext.mockReturnValue(baseContext({ events: [] }))
    renderShell()

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(screen.getByPlaceholderText('Search programs, halls, performers...')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Schedule' }))
    expect(screen.getByText('All Theaters')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'My Schedule' }))
    expect(screen.getByText('Your schedule is empty')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(screen.getByText('Schedule Data')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Home' }))
    expect(screen.getByText('Now Playing')).toBeInTheDocument()
  })

  it('falls back to the Home tab when the current route matches no tab', () => {
    window.location.hash = '#/does-not-exist'
    mockedUseScheduleContext.mockReturnValue(baseContext())
    renderShell()
    const homeTab = screen.getByRole('button', { name: 'Home' })
    expect(homeTab).toHaveClass('Mui-selected')
  })

  it('renders now-playing events from a real event fixture', () => {
    const event = makeEvent({ startDateTime: '2026-07-03T14:00:00', endDateTime: '2026-07-03T15:00:00' })
    mockedUseScheduleContext.mockReturnValue(baseContext({ events: [event] }))
    renderShell()
    expect(screen.getByText(event.title)).toBeInTheDocument()
  })
})
