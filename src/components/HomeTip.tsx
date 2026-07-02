import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { FaRegStar, FaTimes } from 'react-icons/fa'

const STORAGE_KEY = 'nabc-home-tip-dismissed'
const TIP_TEXT = 'Tap the star to save a program to My Schedule'

export function HomeTip() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === '1')

  if (dismissed) {
    return (
      <Typography
        variant="caption"
        sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: 'text.secondary' }}
      >
        <FaRegStar size={11} style={{ flexShrink: 0 }} />
        {TIP_TEXT}
      </Typography>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: '#fff2df',
        border: '1px solid #f0d8ae',
        borderRadius: 2,
        pl: 1.25,
        pr: 0.5,
        py: 0.75,
      }}
    >
      <FaRegStar style={{ flexShrink: 0, color: '#8a6a2f' }} />
      <Typography variant="body2" sx={{ flex: 1, fontWeight: 600, color: '#4a3a1f' }}>
        {TIP_TEXT}
      </Typography>
      <IconButton
        size="small"
        aria-label="Dismiss tip"
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, '1')
          setDismissed(true)
        }}
        sx={{ color: '#8a7350' }}
      >
        <FaTimes size={12} />
      </IconButton>
    </Box>
  )
}
