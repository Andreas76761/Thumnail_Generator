import { useEffect } from 'react'

export const useGlobalKeyboardShortcuts = (callbacks = {}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if typing in input/textarea
      const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName)
      if (isTyping && !['Escape', 'Esc'].includes(e.key)) {
        return
      }

      // Skip if modifier keys are pressed (allow browser shortcuts)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'arrowright':
          if (callbacks.onNext) {
            e.preventDefault()
            callbacks.onNext()
          }
          break
        case 'arrowleft':
          if (callbacks.onPrev) {
            e.preventDefault()
            callbacks.onPrev()
          }
          break
        case 's':
          if (callbacks.onSearch) {
            e.preventDefault()
            callbacks.onSearch()
          }
          break
        case 'b':
          if (callbacks.onBookmark) {
            e.preventDefault()
            callbacks.onBookmark()
          }
          break
        case 'f':
          if (callbacks.onFullscreen) {
            e.preventDefault()
            callbacks.onFullscreen()
          }
          break
        case '?':
          if (callbacks.onHelp) {
            e.preventDefault()
            callbacks.onHelp()
          }
          break
        case 'escape':
        case 'esc':
          if (callbacks.onEscape) {
            e.preventDefault()
            callbacks.onEscape()
          }
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [callbacks])
}
