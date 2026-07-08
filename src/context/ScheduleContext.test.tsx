import { render, renderHook, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ScheduleProvider, useScheduleContext } from './ScheduleContext'

vi.mock('../data/useSchedule', () => ({
  useSchedule: () => ({
    events: ['event-a'],
    lastUpdated: null,
    loading: false,
    error: null,
    refresh: vi.fn(),
  }),
}))

vi.mock('../data/useFavorites', () => ({
  useFavorites: () => ({
    favoriteIds: new Set(['fav-1']),
    loaded: true,
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn(),
    clearAll: vi.fn(),
  }),
}))

function Consumer() {
  const ctx = useScheduleContext()
  return (
    <div>
      <span data-testid="events">{ctx.events.join(',')}</span>
      <span data-testid="favorites">{[...ctx.favoriteIds].join(',')}</span>
      <span data-testid="loaded">{String(ctx.loaded)}</span>
    </div>
  )
}

describe('ScheduleProvider', () => {
  it('merges schedule and favorites state into one context value', () => {
    render(
      <ScheduleProvider>
        <Consumer />
      </ScheduleProvider>,
    )
    expect(screen.getByTestId('events')).toHaveTextContent('event-a')
    expect(screen.getByTestId('favorites')).toHaveTextContent('fav-1')
    expect(screen.getByTestId('loaded')).toHaveTextContent('true')
  })
})

describe('useScheduleContext', () => {
  it('throws when used outside of a ScheduleProvider', () => {
    const { result } = renderHook(() => {
      try {
        return useScheduleContext()
      } catch (err) {
        return err
      }
    })
    expect(result.current).toBeInstanceOf(Error)
    expect((result.current as Error).message).toBe('useScheduleContext must be used within ScheduleProvider')
  })
})
