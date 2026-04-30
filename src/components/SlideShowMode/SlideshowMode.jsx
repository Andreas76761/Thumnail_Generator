import { useState, useEffect } from 'react'

export default function SlideshowMode({ presentations, onClose }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [showPresenterNotes, setShowPresenterNotes] = useState(false)

  // Flatten all slides
  const allSlides = presentations.flatMap(p => p.slides)

  const currentSlide = allSlides[currentSlideIndex]

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          nextSlide()
          break
        case 'ArrowLeft':
        case 'p':
          e.preventDefault()
          prevSlide()
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case 'n':
          e.preventDefault()
          setShowPresenterNotes(!showPresenterNotes)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlideIndex, showPresenterNotes])

  const nextSlide = () => {
    if (currentSlideIndex < allSlides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  const goToSlide = (index) => {
    setCurrentSlideIndex(Math.max(0, Math.min(index, allSlides.length - 1)))
  }

  if (!currentSlide) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Main Slideshow Area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 to-black p-4">
        <div className="max-w-6xl w-full aspect-video bg-white rounded-lg shadow-2xl flex flex-col">
          {/* Slide Content */}
          <div className="flex-1 p-12 flex flex-col justify-center bg-gradient-to-br from-white to-gray-50 rounded-t-lg overflow-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-8">{currentSlide.title}</h1>
            <div className="space-y-4 text-xl text-gray-700">
              {currentSlide.texts.slice(0, 5).map((text, idx) => (
                <p key={idx} className="leading-relaxed">• {text}</p>
              ))}
            </div>
          </div>

          {/* Slide Footer */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-6 rounded-b-lg flex items-center justify-between">
            <div className="flex gap-4 items-center">
              {currentSlide.tags && currentSlide.tags.length > 0 && (
                <div className="flex gap-2">
                  {currentSlide.tags.map(tag => (
                    <span key={tag} className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="font-bold text-lg">
              {currentSlideIndex + 1} / {allSlides.length}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-all"
            title="Vorherige (Pfeil ←)"
          >
            ◀ Zurück
          </button>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max={allSlides.length - 1}
              value={currentSlideIndex}
              onChange={(e) => goToSlide(parseInt(e.target.value))}
              className="w-48"
            />
            <span className="text-sm text-gray-400 w-16">{currentSlideIndex + 1}</span>
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlideIndex === allSlides.length - 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-all"
            title="Nächste (Pfeil →)"
          >
            Weiter ▶
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowPresenterNotes(!showPresenterNotes)}
            className={`px-4 py-2 rounded-lg transition-all ${
              showPresenterNotes
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Presenter Notes (N)"
          >
            📝 Notizen
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all"
            title="Beenden (ESC)"
          >
            ✕ Beenden
          </button>
        </div>
      </div>

      {/* Presenter Notes */}
      {showPresenterNotes && (
        <div className="bg-gray-800 text-white border-t border-gray-700 p-4 max-h-32 overflow-y-auto">
          <p className="text-sm font-semibold mb-2">📝 Presenter Notes</p>
          <p className="text-gray-300 text-sm">
            {currentSlide.presenterNotes || 'Keine Notizen verfügbar. Hier könnten Presenter Notes angezeigt werden.'}
          </p>
        </div>
      )}

      {/* Keyboard Shortcuts Info */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-xs px-3 py-2 rounded-lg max-w-xs">
        <p className="font-semibold mb-1">⌨ Shortcuts:</p>
        <p>→/Space: Nächste | ←: Zurück | ESC: Beenden | N: Notizen</p>
      </div>
    </div>
  )
}
