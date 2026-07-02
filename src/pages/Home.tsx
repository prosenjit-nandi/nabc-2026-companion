import { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { EventCard } from '../components/EventCard'
import { useScheduleContext } from '../context/ScheduleContext'
import { getNowPlaying, getUpNext, currentOrFirstDay } from '../data/scheduleSelectors'

function useTicker(intervalMs: number) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

export function Home() {
  const { events, loading, error, isFavorite, toggleFavorite } = useScheduleContext()
  const now = useTicker(30_000)

  if (loading && events.length === 0) {
    return (
      <Stack sx={{ alignItems: 'center', py: 6 }}>
        <CircularProgress size={28} />
      </Stack>
    )
  }

  if (error && events.length === 0) {
    return <Alert severity="error">{error}</Alert>
  }

  const nowPlaying = getNowPlaying(events, now)
  const upNext = getUpNext(events, now, 5)
  const day = currentOrFirstDay(events, now)

  return (
    <Stack spacing={3} sx={{ pb: 2 }}>
      {day && (
        <Box>
          <Chip label={day} color="primary" sx={{ fontWeight: 700 }} />
        </Box>
      )}

      <Stack spacing={1.25}>
        <Typography variant="h6">Now Playing</Typography>
        {nowPlaying.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nothing is on right now. Check Up Next below.
          </Typography>
        ) : (
          nowPlaying.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              emphasis="now"
              isFavorite={isFavorite(event.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}
      </Stack>

      <Stack spacing={1.25}>
        <Typography variant="h6">Up Next</Typography>
        {upNext.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No more programs scheduled.
          </Typography>
        ) : (
          upNext.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              emphasis="next"
              isFavorite={isFavorite(event.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}
      </Stack>
    </Stack>
  )
}
