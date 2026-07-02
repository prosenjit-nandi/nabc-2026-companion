import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import { FaSyncAlt, FaTrashAlt } from 'react-icons/fa'
import { useScheduleContext } from '../context/ScheduleContext'
import { useThemeMode } from '../context/ThemeModeContext'

export function Settings() {
  const { lastUpdated, refresh, loading, clearAll, favoriteIds } = useScheduleContext()
  const { preference, setPreference } = useThemeMode()
  const [cleared, setCleared] = useState(false)

  return (
    <Stack spacing={3} sx={{ pb: 2 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Schedule Data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last synced: {lastUpdated ? lastUpdated.toLocaleString() : 'never'}
          </Typography>
          <Button
            startIcon={<FaSyncAlt />}
            variant="outlined"
            onClick={refresh}
            disabled={loading}
            sx={{ alignSelf: 'flex-start' }}
          >
            {loading ? 'Refreshing…' : 'Refresh now'}
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Appearance
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={preference}
            onChange={(_, value) => value && setPreference(value)}
            size="small"
          >
            <ToggleButton value="light">Light</ToggleButton>
            <ToggleButton value="dark">Dark</ToggleButton>
            <ToggleButton value="system">System</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Install on iPhone
          </Typography>
          <Typography variant="body2" color="text.secondary">
            In Safari, tap the Share icon, then "Add to Home Screen". The app will keep working
            offline with the last downloaded schedule if wifi drops.
          </Typography>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            My Schedule
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {favoriteIds.size} program{favoriteIds.size === 1 ? '' : 's'} saved.
          </Typography>
          {cleared && <Alert severity="success">My Schedule cleared.</Alert>}
          <Button
            color="error"
            startIcon={<FaTrashAlt />}
            variant="outlined"
            disabled={favoriteIds.size === 0}
            onClick={() => {
              clearAll()
              setCleared(true)
            }}
            sx={{ alignSelf: 'flex-start' }}
          >
            Clear My Schedule
          </Button>
        </Stack>
      </Paper>

      <Divider />
      <Typography variant="caption" color="text.secondary">
        Schedule data sourced from{' '}
        <Link href="https://nabcapp.com/custom/event-schedule.php" target="_blank" rel="noreferrer">
          nabcapp.com
        </Link>
        .
      </Typography>
    </Stack>
  )
}
