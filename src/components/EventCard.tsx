import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import { FaStar, FaRegStar } from 'react-icons/fa'
import type { ScheduleEvent } from '../types/schedule'

interface EventCardProps {
  event: ScheduleEvent
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  emphasis?: 'now' | 'next' | 'none'
}

export function EventCard({ event, isFavorite, onToggleFavorite, emphasis = 'none' }: EventCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: emphasis === 'now' ? 'warning.main' : undefined,
        borderWidth: emphasis === 'now' ? 2 : 1,
      }}
    >
      <CardContent sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', '&:last-child': { pb: 2 } }}>
        <Stack sx={{ minWidth: 68, alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {event.startTime}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {event.endTime}
          </Typography>
        </Stack>
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
            {emphasis === 'now' && <Chip size="small" color="warning" label="NOW" />}
            {emphasis === 'next' && <Chip size="small" variant="outlined" label="NEXT" />}
            <Chip size="small" variant="outlined" label={event.hall} />
          </Stack>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
            {event.title}
          </Typography>
          {event.details && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {event.details}
            </Typography>
          )}
        </Stack>
        <IconButton
          size="small"
          aria-label={isFavorite ? 'Remove from My Schedule' : 'Add to My Schedule'}
          onClick={() => onToggleFavorite(event.id)}
        >
          {isFavorite ? <FaStar color="#f3c15f" /> : <FaRegStar />}
        </IconButton>
      </CardContent>
    </Card>
  )
}
