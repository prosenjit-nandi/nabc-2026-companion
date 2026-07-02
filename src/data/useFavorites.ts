import { useCallback, useEffect, useState } from 'react'
import { addFavorite, clearFavorites, loadFavoriteIds, removeFavorite } from './favoritesStore'

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    loadFavoriteIds().then((ids) => {
      setFavoriteIds(new Set(ids))
      setLoaded(true)
    })
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        removeFavorite(id)
      } else {
        next.add(id)
        addFavorite(id)
      }
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setFavoriteIds(new Set())
    clearFavorites()
  }, [])

  const isFavorite = useCallback((id: string) => favoriteIds.has(id), [favoriteIds])

  return { favoriteIds, loaded, toggleFavorite, isFavorite, clearAll }
}
