import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { PaletteMode } from '@mui/material'
import { EVENT } from '../config/event'

export type ThemeModePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = `${EVENT.slug}-theme-mode`

function readStoredPreference(): ThemeModePreference {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
}

interface ThemeModeContextValue {
  preference: ThemeModePreference
  resolvedMode: PaletteMode
  setPreference: (pref: ThemeModePreference) => void
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null)

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemeModePreference>(readStoredPreference)
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches)
    mql.addEventListener('change', listener)
    return () => mql.removeEventListener('change', listener)
  }, [])

  function setPreference(pref: ThemeModePreference) {
    localStorage.setItem(STORAGE_KEY, pref)
    setPreferenceState(pref)
  }

  const resolvedMode: PaletteMode = useMemo(() => {
    if (preference === 'system') return systemPrefersDark ? 'dark' : 'light'
    return preference
  }, [preference, systemPrefersDark])

  return (
    <ThemeModeContext.Provider value={{ preference, resolvedMode, setPreference }}>
      {children}
    </ThemeModeContext.Provider>
  )
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext)
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider')
  return ctx
}
