import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeModeProvider, useThemeMode } from './ThemeModeContext'
import { EVENT } from '../config/event'

const STORAGE_KEY = `${EVENT.slug}-theme-mode`

function makeMatchMediaMock(initialMatches: boolean) {
  let changeListener: ((e: MediaQueryListEvent) => void) | null = null
  const mql = {
    matches: initialMatches,
    media: '(prefers-color-scheme: dark)',
    addEventListener: vi.fn((_event: string, cb: (e: MediaQueryListEvent) => void) => {
      changeListener = cb
    }),
    removeEventListener: vi.fn(),
  }
  return {
    mql,
    fireChange(matches: boolean) {
      act(() => {
        changeListener?.({ matches } as MediaQueryListEvent)
      })
    },
  }
}

function Consumer() {
  const { preference, resolvedMode, setPreference } = useThemeMode()
  return (
    <div>
      <span data-testid="preference">{preference}</span>
      <span data-testid="resolved">{resolvedMode}</span>
      <button onClick={() => setPreference('light')}>light</button>
      <button onClick={() => setPreference('dark')}>dark</button>
      <button onClick={() => setPreference('system')}>system</button>
    </div>
  )
}

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('ThemeModeProvider', () => {
  it('defaults to system preference when nothing is stored', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue(makeMatchMediaMock(false).mql as unknown as MediaQueryList)
    render(
      <ThemeModeProvider>
        <Consumer />
      </ThemeModeProvider>,
    )
    expect(screen.getByTestId('preference')).toHaveTextContent('system')
    expect(screen.getByTestId('resolved')).toHaveTextContent('light')
  })

  it('falls back to system for an invalid stored value', () => {
    localStorage.setItem(STORAGE_KEY, 'purple')
    vi.spyOn(window, 'matchMedia').mockReturnValue(makeMatchMediaMock(false).mql as unknown as MediaQueryList)
    render(
      <ThemeModeProvider>
        <Consumer />
      </ThemeModeProvider>,
    )
    expect(screen.getByTestId('preference')).toHaveTextContent('system')
  })

  it('reads a valid stored preference', () => {
    localStorage.setItem(STORAGE_KEY, 'dark')
    vi.spyOn(window, 'matchMedia').mockReturnValue(makeMatchMediaMock(false).mql as unknown as MediaQueryList)
    render(
      <ThemeModeProvider>
        <Consumer />
      </ThemeModeProvider>,
    )
    expect(screen.getByTestId('preference')).toHaveTextContent('dark')
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark')
  })

  it('resolves system preference to dark when the OS prefers dark', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue(makeMatchMediaMock(true).mql as unknown as MediaQueryList)
    render(
      <ThemeModeProvider>
        <Consumer />
      </ThemeModeProvider>,
    )
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark')
  })

  it('updates resolvedMode when the OS preference changes while on system', () => {
    const { fireChange, mql } = makeMatchMediaMock(false)
    vi.spyOn(window, 'matchMedia').mockReturnValue(mql as unknown as MediaQueryList)
    render(
      <ThemeModeProvider>
        <Consumer />
      </ThemeModeProvider>,
    )
    expect(screen.getByTestId('resolved')).toHaveTextContent('light')
    fireChange(true)
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark')
  })

  it('removes the media query listener on unmount', () => {
    const { mql } = makeMatchMediaMock(false)
    vi.spyOn(window, 'matchMedia').mockReturnValue(mql as unknown as MediaQueryList)
    const { unmount } = render(
      <ThemeModeProvider>
        <Consumer />
      </ThemeModeProvider>,
    )
    unmount()
    expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('persists preference changes to localStorage and updates state', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue(makeMatchMediaMock(false).mql as unknown as MediaQueryList)
    const user = userEvent.setup()
    render(
      <ThemeModeProvider>
        <Consumer />
      </ThemeModeProvider>,
    )

    await user.click(screen.getByText('dark'))
    expect(screen.getByTestId('preference')).toHaveTextContent('dark')
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')

    await user.click(screen.getByText('light'))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light')
    expect(screen.getByTestId('resolved')).toHaveTextContent('light')

    await user.click(screen.getByText('system'))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('system')
  })
})

describe('useThemeMode', () => {
  it('throws when used outside of a ThemeModeProvider', () => {
    const { result } = renderHook(() => {
      try {
        return useThemeMode()
      } catch (err) {
        return err
      }
    })
    expect(result.current).toBeInstanceOf(Error)
    expect((result.current as Error).message).toBe('useThemeMode must be used within ThemeModeProvider')
  })
})
