import { StrictMode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSchedule } from './useSchedule'
import { makeEvent } from '../test/fixtures'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useSchedule', () => {
  it('starts in a loading state and populates events on success', async () => {
    const event = makeEvent()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ events: [event] }),
    } as Response)

    const { result } = renderHook(() => useSchedule())
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.events).toEqual([event])
    expect(result.current.error).toBeNull()
    expect(result.current.lastUpdated).toBeInstanceOf(Date)
  })

  it('defaults events to an empty array when the payload has none', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.events).toEqual([])
  })

  it('sets an error message when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Schedule fetch failed (500)')
    expect(result.current.events).toEqual([])
  })

  it('sets the error message from a thrown Error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network down'))

    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('network down')
  })

  it('falls back to a generic message for a non-Error rejection', async () => {
    vi.mocked(fetch).mockRejectedValue('boom')

    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Failed to load schedule')
  })

  it('only fetches once on mount even if the hook re-renders', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ events: [] }),
    } as Response)

    const { result, rerender } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    rerender()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('guards against StrictMode double-invoking the initial load effect', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ events: [] }),
    } as Response)

    const { result } = renderHook(() => useSchedule(), { wrapper: StrictMode })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('refresh() bypasses the cache and re-fetches', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ events: [] }),
    } as Response)

    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.refresh()
    })

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(vi.mocked(fetch).mock.calls[1][1]).toEqual({ cache: 'reload' })
  })
})
