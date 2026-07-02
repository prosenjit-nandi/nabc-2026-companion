import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useSchedule } from '../data/useSchedule'
import { useFavorites } from '../data/useFavorites'

type ScheduleContextValue = ReturnType<typeof useSchedule> & ReturnType<typeof useFavorites>

const ScheduleContext = createContext<ScheduleContextValue | null>(null)

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const schedule = useSchedule()
  const favorites = useFavorites()
  const value: ScheduleContextValue = { ...schedule, ...favorites }
  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>
}

export function useScheduleContext() {
  const ctx = useContext(ScheduleContext)
  if (!ctx) throw new Error('useScheduleContext must be used within ScheduleProvider')
  return ctx
}
