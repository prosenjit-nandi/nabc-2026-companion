import { useEffect, useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { EventCard } from '../components/EventCard'
import { useScheduleContext } from '../context/ScheduleContext'
import { uniqueDays, uniqueHalls, sortByStart, currentOrFirstDay, getNowPlaying } from '../data/scheduleSelectors'

export function Schedule() {
  const { events, loading, error, isFavorite, toggleFavorite } = useScheduleContext()
  const days = useMemo(() => uniqueDays(events), [events])
  const halls = useMemo(() => uniqueHalls(events), [events])
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedHall, setSelectedHall] = useState<string | null>(null)

  useEffect(() => {
    if (selectedDay || events.length === 0) return
    setSelectedDay(currentOrFirstDay(events, new Date()))
  }, [events, selectedDay])

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

  const dayEvents = sortByStart(events.filter((e) => e.day === selectedDay))
  const filtered = selectedHall ? dayEvents.filter((e) => e.hall === selectedHall) : dayEvents
  const nowPlayingIds = new Set(getNowPlaying(events, new Date()).map((e) => e.id))

  return (
    <Stack spacing={2} sx={{ pb: 2 }}>
      <Tabs
        value={selectedDay ?? false}
        onChange={(_, value) => setSelectedDay(value)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {days.map((d) => (
          <Tab key={d.day} value={d.day} label={d.day} />
        ))}
      </Tabs>

      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
        <Chip
          label="All Theaters"
          color={selectedHall === null ? 'primary' : undefined}
          variant={selectedHall === null ? 'filled' : 'outlined'}
          onClick={() => setSelectedHall(null)}
        />
        {halls.map((hall) => (
          <Chip
            key={hall}
            label={hall}
            color={selectedHall === hall ? 'primary' : undefined}
            variant={selectedHall === hall ? 'filled' : 'outlined'}
            onClick={() => setSelectedHall(hall)}
            sx={{ flexShrink: 0 }}
          />
        ))}
      </Stack>

      <Stack spacing={1.25}>
        {filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No programs for this filter.
          </Typography>
        ) : (
          filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              emphasis={nowPlayingIds.has(event.id) ? 'now' : 'none'}
              isFavorite={isFavorite(event.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}
      </Stack>
    </Stack>
  )
}
