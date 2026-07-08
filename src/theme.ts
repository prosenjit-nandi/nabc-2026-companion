import { createTheme } from '@mui/material/styles'
import type { PaletteMode } from '@mui/material'

// Palette sampled directly from the configured event's logo (see src/config/event.ts).
const TEAL = '#116466'
const TEAL_DARK = '#0a4547'
const PEACH = '#ffcb9a'
const CREAM = '#fff7e8'

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark'
  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? PEACH : TEAL, contrastText: isDark ? TEAL_DARK : '#fff' },
      secondary: { main: TEAL_DARK },
      background: {
        default: isDark ? '#0b1615' : CREAM,
        paper: isDark ? '#12201f' : '#ffffff',
      },
      warning: { main: PEACH },
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
          root: { backgroundColor: isDark ? '#12201f' : TEAL, color: '#fff' },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
    },
  })
}
