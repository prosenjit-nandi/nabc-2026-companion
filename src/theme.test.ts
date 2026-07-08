import { describe, expect, it } from 'vitest'
import { createAppTheme } from './theme'

describe('createAppTheme', () => {
  it('builds a light theme palette', () => {
    const theme = createAppTheme('light')
    expect(theme.palette.mode).toBe('light')
    expect(theme.palette.primary.main).toBe('#116466')
    expect(theme.palette.primary.contrastText).toBe('#fff')
    expect(theme.palette.background.default).toBe('#fff7e8')
    expect(theme.palette.background.paper).toBe('#ffffff')
  })

  it('builds a dark theme palette', () => {
    const theme = createAppTheme('dark')
    expect(theme.palette.mode).toBe('dark')
    expect(theme.palette.primary.main).toBe('#ffcb9a')
    expect(theme.palette.primary.contrastText).toBe('#0a4547')
    expect(theme.palette.background.default).toBe('#0b1615')
    expect(theme.palette.background.paper).toBe('#12201f')
  })

  it('sets shared shape, typography and component overrides', () => {
    const theme = createAppTheme('light')
    expect(theme.shape.borderRadius).toBe(14)
    expect(theme.typography.h1.fontWeight).toBe(800)
    expect(theme.components?.MuiAppBar?.defaultProps).toEqual({ color: 'default' })
  })
})
