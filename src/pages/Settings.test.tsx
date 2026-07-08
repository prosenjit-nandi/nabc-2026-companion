import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Settings } from './Settings'
import { useScheduleContext } from '../context/ScheduleContext'
import { useThemeMode } from '../context/ThemeModeContext'

vi.mock('../context/ScheduleContext', () => ({
  useScheduleContext: vi.fn(),
}))

vi.mock('../context/ThemeModeContext', () => ({
  useThemeMode: vi.fn(),
}))

const mockedUseScheduleContext = vi.mocked(useScheduleContext)
const mockedUseThemeMode = vi.mocked(useThemeMode)

function baseScheduleContext(overrides: Partial<ReturnType<typeof useScheduleContext>> = {}) {
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

function baseThemeMode(overrides: Partial<ReturnType<typeof useThemeMode>> = {}) {
  return {
    preference: 'system' as const,
    resolvedMode: 'light' as const,
    setPreference: vi.fn(),
    ...overrides,
  }
}

describe('Settings', () => {
  it('shows "never" when the schedule has not synced yet', () => {
    mockedUseScheduleContext.mockReturnValue(baseScheduleContext({ lastUpdated: null }))
    mockedUseThemeMode.mockReturnValue(baseThemeMode())
    render(<Settings />)
    expect(screen.getByText('Last synced: never')).toBeInTheDocument()
  })

  it('shows the sync time when available and calls refresh', () => {
    const refresh = vi.fn()
    const lastUpdated = new Date('2026-07-03T14:00:00')
    mockedUseScheduleContext.mockReturnValue(baseScheduleContext({ lastUpdated, refresh }))
    mockedUseThemeMode.mockReturnValue(baseThemeMode())
    render(<Settings />)
    expect(screen.getByText(`Last synced: ${lastUpdated.toLocaleString()}`)).toBeInTheDocument()

    fireEvent.click(screen.getByText('Refresh now'))
    expect(refresh).toHaveBeenCalled()
  })

  it('disables the refresh button and shows a refreshing label while loading', () => {
    mockedUseScheduleContext.mockReturnValue(baseScheduleContext({ loading: true }))
    mockedUseThemeMode.mockReturnValue(baseThemeMode())
    render(<Settings />)
    const button = screen.getByText('Refreshing…').closest('button')
    expect(button).toBeDisabled()
  })

  it('calls setPreference when an appearance option is picked', () => {
    const setPreference = vi.fn()
    mockedUseScheduleContext.mockReturnValue(baseScheduleContext())
    mockedUseThemeMode.mockReturnValue(baseThemeMode({ preference: 'light', setPreference }))
    render(<Settings />)
    fireEvent.click(screen.getByText('Dark'))
    expect(setPreference).toHaveBeenCalledWith('dark')
  })

  it('does not call setPreference when re-clicking the already-selected option', () => {
    const setPreference = vi.fn()
    mockedUseScheduleContext.mockReturnValue(baseScheduleContext())
    mockedUseThemeMode.mockReturnValue(baseThemeMode({ preference: 'light', setPreference }))
    render(<Settings />)
    fireEvent.click(screen.getByText('Light'))
    expect(setPreference).not.toHaveBeenCalled()
  })

  it('shows singular phrasing for exactly one saved program', () => {
    mockedUseScheduleContext.mockReturnValue(baseScheduleContext({ favoriteIds: new Set(['a']) }))
    mockedUseThemeMode.mockReturnValue(baseThemeMode())
    render(<Settings />)
    expect(screen.getByText('1 program saved.')).toBeInTheDocument()
  })

  it('shows plural phrasing and disables clear when there are zero saved programs', () => {
    mockedUseScheduleContext.mockReturnValue(baseScheduleContext({ favoriteIds: new Set() }))
    mockedUseThemeMode.mockReturnValue(baseThemeMode())
    render(<Settings />)
    expect(screen.getByText('0 programs saved.')).toBeInTheDocument()
    expect(screen.getByText('Clear My Schedule').closest('button')).toBeDisabled()
  })

  it('clears favorites and shows a confirmation alert', () => {
    const clearAll = vi.fn()
    mockedUseScheduleContext.mockReturnValue(
      baseScheduleContext({ favoriteIds: new Set(['a', 'b']), clearAll }),
    )
    mockedUseThemeMode.mockReturnValue(baseThemeMode())
    render(<Settings />)
    expect(screen.getByText('2 programs saved.')).toBeInTheDocument()
    expect(screen.queryByText('My Schedule cleared.')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Clear My Schedule'))
    expect(clearAll).toHaveBeenCalled()
    expect(screen.getByText('My Schedule cleared.')).toBeInTheDocument()
  })

  it('renders the data source link', () => {
    mockedUseScheduleContext.mockReturnValue(baseScheduleContext())
    mockedUseThemeMode.mockReturnValue(baseThemeMode())
    render(<Settings />)
    const link = screen.getByText('nabcapp.com')
    expect(link).toHaveAttribute('href', 'https://nabcapp.com/custom/event-schedule.php')
  })
})
