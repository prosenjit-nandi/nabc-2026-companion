import { useCallback, useEffect, useRef, useState } from 'react'
import type { ScheduleEvent } from '../types/schedule'

interface ScheduleState {
  events: ScheduleEvent[]
  lastUpdated: Date | null
  loading: boolean
  error: string | null
}

const DATA_URL = `${import.meta.env.BASE_URL}data/schedule.json`

export function useSchedule() {
  const [state, setState] = useState<ScheduleState>({
    events: [],
    lastUpdated: null,
    loading: true,
    error: null,
  })
  const loadedOnce = useRef(false)

  const load = useCallback(async (opts?: { bypassCache?: boolean }) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch(DATA_URL, opts?.bypassCache ? { cache: 'reload' } : undefined)
      if (!res.ok) throw new Error(`Schedule fetch failed (${res.status})`)
      const data = await res.json()
      setState({
        events: data.events ?? [],
        lastUpdated: new Date(),
        loading: false,
        error: null,
      })
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load schedule',
      }))
    }
  }, [])

  useEffect(() => {
    if (loadedOnce.current) return
    loadedOnce.current = true
    load()
  }, [load])

  const refresh = useCallback(() => load({ bypassCache: true }), [load])

  return { ...state, refresh }
}
