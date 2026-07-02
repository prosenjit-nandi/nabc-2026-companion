import { createTheme } from '@mui/material/styles'
import type { PaletteMode } from '@mui/material'

// Palette lifted from nabcapp.com's own schedule page for visual continuity.
const NAVY = '#071a3d'
const BLUE = '#124c8b'
const GOLD = '#f3c15f'
const CREAM = '#fff7e8'

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark'
  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? GOLD : NAVY, contrastText: isDark ? NAVY : '#fff' },
      secondary: { main: BLUE },
      background: {
        default: isDark ? '#0b1120' : CREAM,
        paper: isDark ? '#111a2e' : '#ffffff',
      },
      warning: { main: GOLD },
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h6: { fontWeight: 700 },
    },
    components: {
      MuiAppBar: {
        defaultProps: { color: 'default' },
        styleOverrides: {
          root: { backgroundColor: isDark ? '#111a2e' : NAVY, color: '#fff' },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
    },
  })
}
