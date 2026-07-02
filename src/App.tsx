import { useMemo } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AppShell } from './AppShell'
import { ThemeModeProvider, useThemeMode } from './context/ThemeModeContext'
import { createAppTheme } from './theme'

function ThemedApp() {
  const { resolvedMode } = useThemeMode()
  const theme = useMemo(() => createAppTheme(resolvedMode), [resolvedMode])
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppShell />
    </ThemeProvider>
  )
}

function App() {
  return (
    <ThemeModeProvider>
      <ThemedApp />
    </ThemeModeProvider>
  )
}

export default App
