import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'

async function freshStore() {
  vi.resetModules()
  return import('./favoritesStore')
}

beforeEach(() => {
  // Each test gets a brand-new in-memory IndexedDB so favorites don't leak across tests.
  vi.stubGlobal('indexedDB', new IDBFactory())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('favoritesStore', () => {
  it('starts with no favorites', async () => {
    const store = await freshStore()
    expect(await store.loadFavoriteIds()).toEqual([])
  })

  it('adds and loads a favorite', async () => {
    const store = await freshStore()
    await store.addFavorite('event-1')
    expect(await store.loadFavoriteIds()).toEqual(['event-1'])
  })

  it('reuses the same open database connection across calls', async () => {
    const store = await freshStore()
    await store.addFavorite('event-1')
    await store.addFavorite('event-2')
    expect(await store.loadFavoriteIds()).toEqual(expect.arrayContaining(['event-1', 'event-2']))
  })

  it('removes a favorite', async () => {
    const store = await freshStore()
    await store.addFavorite('event-1')
    await store.addFavorite('event-2')
    await store.removeFavorite('event-1')
    expect(await store.loadFavoriteIds()).toEqual(['event-2'])
  })

  it('clears all favorites', async () => {
    const store = await freshStore()
    await store.addFavorite('event-1')
    await store.addFavorite('event-2')
    await store.clearFavorites()
    expect(await store.loadFavoriteIds()).toEqual([])
  })
})
