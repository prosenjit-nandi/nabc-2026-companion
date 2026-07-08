import { waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { registerSW } from './test/virtualPwaRegisterMock'

vi.mock('./App.tsx', () => ({ default: () => <div>Mocked App</div> }))

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>'
  registerSW.mockClear()
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('main entry point', () => {
  it('registers the service worker and mounts App into #root', async () => {
    await import('./main.tsx')
    expect(registerSW).toHaveBeenCalledWith({ immediate: true })
    await waitFor(() => expect(document.getElementById('root')?.textContent).toBe('Mocked App'))
  })
})
