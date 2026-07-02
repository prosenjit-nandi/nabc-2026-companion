import { useMemo } from 'react'
import { saveAs } from 'file-saver'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { FaFileDownload } from 'react-icons/fa'
import { EventCard } from '../components/EventCard'
import { useScheduleContext } from '../context/ScheduleContext'
import { groupByDay, getNowPlaying } from '../data/scheduleSelectors'
import { buildIcs } from '../data/ics'

export function MySchedule() {
  const { events, favoriteIds, isFavorite, toggleFavorite, loaded } = useScheduleContext()

  const myEvents = useMemo(() => events.filter((e) => favoriteIds.has(e.id)), [events, favoriteIds])
  const grouped = useMemo(() => groupByDay(myEvents), [myEvents])
  const nowPlayingIds = new Set(getNowPlaying(myEvents, new Date()).map((e) => e.id))

  function exportToCalendar() {
    const ics = buildIcs(myEvents)
    saveAs(new Blob([ics], { type: 'text/calendar;charset=utf-8' }), 'nabc-2026-my-schedule.ics')
  }

  if (!loaded) return null

  if (myEvents.length === 0) {
    return (
      <Stack spacing={1} sx={{ py: 4, alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h6">Your schedule is empty</Typography>
        <Typography variant="body2" color="text.secondary">
          Tap the star on any program in Schedule or Search to add it here.
        </Typography>
      </Stack>
    )
  }

  return (
    <Stack spacing={3} sx={{ pb: 2 }}>
      <Button startIcon={<FaFileDownload />} variant="outlined" onClick={exportToCalendar} sx={{ alignSelf: 'flex-start' }}>
        Export to Calendar
      </Button>

      {[...grouped.entries()].map(([day, dayEvents]) => (
        <Stack spacing={1.25} key={day}>
          <Typography variant="h6">{day}</Typography>
          <Divider />
          {dayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              emphasis={nowPlayingIds.has(event.id) ? 'now' : 'none'}
              isFavorite={isFavorite(event.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  )
}
