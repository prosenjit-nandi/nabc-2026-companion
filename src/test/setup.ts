import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

if (!('matchMedia' in window)) {
  Object.defineProperty(window, 'matchMedia', { writable: true, value: () => ({}) })
}

window.matchMedia =
  window.matchMedia ||
  (() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }))

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!('ResizeObserver' in window)) {
  // @ts-expect-error -- jsdom has no native ResizeObserver, MUI Tabs needs one present
  window.ResizeObserver = ResizeObserverStub
}
