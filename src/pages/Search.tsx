import { useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import { FaSearch } from 'react-icons/fa'
import { EventCard } from '../components/EventCard'
import { useScheduleContext } from '../context/ScheduleContext'
import { sortByStart, getNowPlaying } from '../data/scheduleSelectors'

export function Search() {
  const { events, isFavorite, toggleFavorite } = useScheduleContext()
  const [query, setQuery] = useState('')

  const fuse = useMemo(
    () =>
      new Fuse(events, {
        keys: ['title', 'details', 'hall', 'day'],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [events],
  )

  const results = query.trim() ? fuse.search(query.trim()).map((r) => r.item) : sortByStart(events)
  const nowPlayingIds = new Set(getNowPlaying(events, new Date()).map((e) => e.id))

  return (
    <Stack spacing={2} sx={{ pb: 2 }}>
      <TextField
        autoFocus
        fullWidth
        placeholder="Search programs, halls, performers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <FaSearch />
              </InputAdornment>
            ),
          },
        }}
      />

      <Stack spacing={1.25}>
        {results.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No matches.
          </Typography>
        ) : (
          results.map((event) => (
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
