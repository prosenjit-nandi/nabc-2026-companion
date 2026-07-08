import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useFavorites } from './useFavorites'
import * as favoritesStore from './favoritesStore'

vi.mock('./favoritesStore', () => ({
  loadFavoriteIds: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  clearFavorites: vi.fn(),
}))

const mocked = vi.mocked(favoritesStore)

beforeEach(() => {
  mocked.loadFavoriteIds.mockResolvedValue(['existing-1'])
  mocked.addFavorite.mockResolvedValue(undefined)
  mocked.removeFavorite.mockResolvedValue(undefined)
  mocked.clearFavorites.mockResolvedValue(undefined)
})

describe('useFavorites', () => {
  it('loads persisted favorite ids on mount', async () => {
    const { result } = renderHook(() => useFavorites())
    expect(result.current.loaded).toBe(false)
    await waitFor(() => expect(result.current.loaded).toBe(true))
    expect(result.current.favoriteIds).toEqual(new Set(['existing-1']))
    expect(result.current.isFavorite('existing-1')).toBe(true)
    expect(result.current.isFavorite('missing')).toBe(false)
  })

  it('adds a new favorite via toggleFavorite', async () => {
    const { result } = renderHook(() => useFavorites())
    await waitFor(() => expect(result.current.loaded).toBe(true))

    act(() => {
      result.current.toggleFavorite('new-id')
    })

    expect(result.current.favoriteIds.has('new-id')).toBe(true)
    expect(mocked.addFavorite).toHaveBeenCalledWith('new-id')
  })

  it('removes an existing favorite via toggleFavorite', async () => {
    const { result } = renderHook(() => useFavorites())
    await waitFor(() => expect(result.current.loaded).toBe(true))

    act(() => {
      result.current.toggleFavorite('existing-1')
    })

    expect(result.current.favoriteIds.has('existing-1')).toBe(false)
    expect(mocked.removeFavorite).toHaveBeenCalledWith('existing-1')
  })

  it('clears all favorites via clearAll', async () => {
    const { result } = renderHook(() => useFavorites())
    await waitFor(() => expect(result.current.loaded).toBe(true))

    act(() => {
      result.current.clearAll()
    })

    expect(result.current.favoriteIds).toEqual(new Set())
    expect(mocked.clearFavorites).toHaveBeenCalled()
  })
})
