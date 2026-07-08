import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { useScheduleContext } from './context/ScheduleContext'

vi.mock('./context/ScheduleContext', () => ({
  ScheduleProvider: ({ children }: { children: React.ReactNode }) => children,
  useScheduleContext: vi.fn(() => ({
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
  })),
}))

describe('App', () => {
  it('renders the themed shell', () => {
    vi.mocked(useScheduleContext)
    render(<App />)
    expect(screen.getByText('NABC 2026')).toBeInTheDocument()
    expect(screen.getByText('Now Playing')).toBeInTheDocument()
  })
})
