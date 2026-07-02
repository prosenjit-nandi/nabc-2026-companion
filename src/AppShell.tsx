import { useEffect, useMemo, useState } from 'react'
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import { FaHome, FaListUl, FaCalendarCheck, FaSearch, FaCog } from 'react-icons/fa'
import { ScheduleProvider, useScheduleContext } from './context/ScheduleContext'
import { Home } from './pages/Home'
import { Schedule } from './pages/Schedule'
import { MySchedule } from './pages/MySchedule'
import { Search } from './pages/Search'
import { Settings } from './pages/Settings'

const TABS = [
  { path: '/', label: 'Home', icon: <FaHome /> },
  { path: '/schedule', label: 'Schedule', icon: <FaListUl /> },
  { path: '/my-schedule', label: 'My Schedule', icon: <FaCalendarCheck /> },
  { path: '/search', label: 'Search', icon: <FaSearch /> },
  { path: '/settings', label: 'Settings', icon: <FaCog /> },
]

function useLiveClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function formatRelative(date: Date | null): string {
  if (!date) return 'never'
  const seconds = Math.round((Date.now() - date.getTime()) / 1000)
  if (seconds < 45) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  return `${hours}h ago`
}

function TopBar() {
  const now = useLiveClock()
  const { lastUpdated } = useScheduleContext()
  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
            NABC 2026
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Synced {formatRelative(lastUpdated)}
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentIndex = useMemo(() => {
    const idx = TABS.findIndex((t) => t.path === location.pathname)
    return idx === -1 ? 0 : idx
  }, [location.pathname])

  return (
    <Paper elevation={8} sx={{ position: 'sticky', bottom: 0, left: 0, right: 0 }}>
      <BottomNavigation
        showLabels
        value={currentIndex}
        onChange={(_, newValue) => navigate(TABS[newValue].path)}
        sx={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          height: 'calc(56px + env(safe-area-inset-bottom))',
        }}
      >
        {TABS.map((tab) => (
          <BottomNavigationAction key={tab.path} label={tab.label} icon={tab.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  )
}

function Shell() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar />
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 2 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/my-schedule" element={<MySchedule />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
      <BottomNav />
    </Box>
  )
}

export function AppShell() {
  return (
    <ScheduleProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </ScheduleProvider>
  )
}
