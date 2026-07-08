import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import { EVENT } from '../config/event'

interface FavoritesDB extends DBSchema {
  favorites: {
    key: string
    value: { id: string; addedAt: number }
  }
}

let dbPromise: Promise<IDBPDatabase<FavoritesDB>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<FavoritesDB>(`${EVENT.slug}-favorites`, 1, {
      upgrade(db) {
        db.createObjectStore('favorites', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export async function loadFavoriteIds(): Promise<string[]> {
  const db = await getDb()
  const all = await db.getAll('favorites')
  return all.map((f) => f.id)
}

export async function addFavorite(id: string): Promise<void> {
  const db = await getDb()
  await db.put('favorites', { id, addedAt: Date.now() })
}

export async function removeFavorite(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('favorites', id)
}

export async function clearFavorites(): Promise<void> {
  const db = await getDb()
  await db.clear('favorites')
}
