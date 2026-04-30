import { useState, useCallback, useEffect } from 'react'

const BOOKMARKS_KEY = 'pd_bookmarks'

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY)
      return new Set(stored ? JSON.parse(stored) : [])
    } catch {
      return new Set()
    }
  })

  useEffect(() => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(Array.from(bookmarks)))
  }, [bookmarks])

  const toggle = useCallback((id) => {
    setBookmarks(prev => {
      const updated = new Set(prev)
      if (updated.has(id)) {
        updated.delete(id)
      } else {
        updated.add(id)
      }
      return updated
    })
  }, [])

  const isBookmarked = useCallback((id) => {
    return bookmarks.has(id)
  }, [bookmarks])

  const clear = useCallback(() => {
    setBookmarks(new Set())
  }, [])

  return {
    bookmarks,
    toggle,
    isBookmarked,
    clear,
    count: bookmarks.size
  }
}
