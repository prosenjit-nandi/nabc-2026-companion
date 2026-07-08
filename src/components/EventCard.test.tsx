import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EventCard } from './EventCard'
import { makeEvent } from '../test/fixtures'

describe('EventCard', () => {
  it('renders event fields and details', () => {
    const event = makeEvent({ title: 'Opening Ceremony', hall: 'Main Hall', details: 'Welcome remarks' })
    render(<EventCard event={event} isFavorite={false} onToggleFavorite={vi.fn()} />)
    expect(screen.getByText('Opening Ceremony')).toBeInTheDocument()
    expect(screen.getByText('Main Hall')).toBeInTheDocument()
    expect(screen.getByText('Welcome remarks')).toBeInTheDocument()
    expect(screen.getByText(event.startTime)).toBeInTheDocument()
    expect(screen.getByText(event.endTime)).toBeInTheDocument()
  })

  it('omits the details paragraph when details is empty', () => {
    const event = makeEvent({ details: '' })
    render(<EventCard event={event} isFavorite={false} onToggleFavorite={vi.fn()} />)
    expect(screen.queryByText('Some details')).not.toBeInTheDocument()
  })

  it('shows a NOW chip when emphasis is now', () => {
    const event = makeEvent()
    render(<EventCard event={event} isFavorite={false} onToggleFavorite={vi.fn()} emphasis="now" />)
    expect(screen.getByText('NOW')).toBeInTheDocument()
    expect(screen.queryByText('NEXT')).not.toBeInTheDocument()
  })

  it('shows a NEXT chip when emphasis is next', () => {
    const event = makeEvent()
    render(<EventCard event={event} isFavorite={false} onToggleFavorite={vi.fn()} emphasis="next" />)
    expect(screen.getByText('NEXT')).toBeInTheDocument()
    expect(screen.queryByText('NOW')).not.toBeInTheDocument()
  })

  it('shows neither chip when emphasis is none (the default)', () => {
    const event = makeEvent()
    render(<EventCard event={event} isFavorite={false} onToggleFavorite={vi.fn()} />)
    expect(screen.queryByText('NOW')).not.toBeInTheDocument()
    expect(screen.queryByText('NEXT')).not.toBeInTheDocument()
  })

  it('shows a filled star and remove label when favorited', () => {
    const event = makeEvent()
    render(<EventCard event={event} isFavorite={true} onToggleFavorite={vi.fn()} />)
    expect(screen.getByLabelText('Remove from My Schedule')).toBeInTheDocument()
  })

  it('shows an empty star and add label when not favorited', () => {
    const event = makeEvent()
    render(<EventCard event={event} isFavorite={false} onToggleFavorite={vi.fn()} />)
    expect(screen.getByLabelText('Add to My Schedule')).toBeInTheDocument()
  })

  it('calls onToggleFavorite with the event id when the star is clicked', async () => {
    const event = makeEvent({ id: 'evt-42' })
    const onToggleFavorite = vi.fn()
    const user = userEvent.setup()
    render(<EventCard event={event} isFavorite={false} onToggleFavorite={onToggleFavorite} />)
    await user.click(screen.getByLabelText('Add to My Schedule'))
    expect(onToggleFavorite).toHaveBeenCalledWith('evt-42')
  })
})
