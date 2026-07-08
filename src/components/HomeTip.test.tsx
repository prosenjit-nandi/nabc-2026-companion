import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { HomeTip } from './HomeTip'
import { EVENT } from '../config/event'

const STORAGE_KEY = `${EVENT.slug}-home-tip-dismissed`
const TIP_TEXT = 'Tap the star to save a program to My Schedule'

describe('HomeTip', () => {
  it('shows the dismissible tip box when not previously dismissed', () => {
    render(<HomeTip />)
    expect(screen.getByText(TIP_TEXT)).toBeInTheDocument()
    expect(screen.getByLabelText('Dismiss tip')).toBeInTheDocument()
  })

  it('dismisses the tip, persists the choice, and shows the compact caption', async () => {
    const user = userEvent.setup()
    render(<HomeTip />)
    await user.click(screen.getByLabelText('Dismiss tip'))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1')
    expect(screen.queryByLabelText('Dismiss tip')).not.toBeInTheDocument()
    expect(screen.getByText(TIP_TEXT)).toBeInTheDocument()
  })

  it('renders the compact caption directly when already dismissed', () => {
    localStorage.setItem(STORAGE_KEY, '1')
    render(<HomeTip />)
    expect(screen.queryByLabelText('Dismiss tip')).not.toBeInTheDocument()
    expect(screen.getByText(TIP_TEXT)).toBeInTheDocument()
  })
})
