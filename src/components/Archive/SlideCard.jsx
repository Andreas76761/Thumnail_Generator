import React, { useState } from 'react'
import { useOCR } from '../../hooks/useOCR'
import TagEditorDialog from '../Tags/TagEditorDialog'

function SlideCard({
  slide,
  presentationId,
  presentation,
  viewMode,
  onUpdate,
  onToggleBookmark,
  isBookmarked,
  onDesignClick,
  appliedDesign,
  onSlideDoubleClick
}) {
  const [showOCR, setShowOCR] = useState(false)
  const [showTagEditor, setShowTagEditor] = useState(false)
  const { extractText, ocrTexts, extracting, error } = useOCR()

  const handleOCRClick = async () => {
    if (!ocrTexts[slide.id]) {
      try {
        await extractText(slide.id, slide.thumbnail)
      } catch (err) {
        console.error('OCR failed:', err)
      }
    }
    setShowOCR(!showOCR)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all p-4 group relative">
      {/* Bookmark Button */}
      {onToggleBookmark && (
        <button
          onClick={() => onToggleBookmark(presentationId, slide.id)}
          className={`absolute top-3 right-3 text-xl transition-all z-10 ${
            isBookmarked
              ? 'text-yellow-400 drop-shadow-sm'
              : 'text-gray-300 hover:text-yellow-400'
          }`}
          title={isBookmarked ? 'Lesezeichen entfernen' : 'Lesezeichen hinzufügen'}
          aria-label={isBookmarked ? 'Lesezeichen entfernen' : 'Lesezeichen hinzufügen'}
          aria-pressed={isBookmarked}
        >
          <span aria-hidden="true">🔖</span>
        </button>
      )}

      {/* Design Button */}
      {onDesignClick && (
        <button
          onClick={() => onDesignClick(slide)}
          className={`absolute top-12 right-3 text-xl transition-all z-10 ${
            appliedDesign
              ? 'text-purple-600 drop-shadow-sm'
              : 'text-gray-400 hover:text-purple-500'
          }`}
          title={appliedDesign ? `Design: ${appliedDesign}` : 'Design anwenden'}
          aria-label={appliedDesign ? `Angewendetes Design: ${appliedDesign}` : 'Design anwenden'}
        >
          <span aria-hidden="true">🎨</span>
        </button>
      )}

      {/* Tag Editor Button */}
      {onUpdate && (
        <button
          onClick={() => setShowTagEditor(true)}
          className="absolute top-3 left-3 text-lg transition-all z-10 text-gray-400 hover:text-yellow-500"
          title="Tags bearbeiten"
          aria-label="Tags bearbeiten"
        >
          <span aria-hidden="true">🏷️</span>
        </button>
      )}

      {/* OCR Button */}
      <button
        onClick={handleOCRClick}
        className={`absolute top-12 left-3 text-lg transition-all z-10 ${
          showOCR
            ? 'text-blue-600 drop-shadow-sm'
            : 'text-gray-400 hover:text-blue-500'
        } ${extracting ? 'opacity-50 cursor-wait' : ''}`}
        title={extracting ? 'Extrahieren...' : 'OCR Text extrahieren'}
        aria-label={extracting ? 'Extrahiere Text...' : 'Extrahiere Text mit OCR'}
        aria-pressed={showOCR}
        disabled={extracting}
      >
        <span aria-hidden="true">{extracting ? '⏳' : '📄'}</span>
      </button>

      <div
        className="relative w-full h-40 bg-gray-100 rounded-lg mb-3 overflow-hidden group-hover:brightness-105 transition-all cursor-pointer hover:brightness-110"
        onDoubleClick={() => onSlideDoubleClick && onSlideDoubleClick(slide, presentation)}
        title="Doppelklick zum Vergrößern"
      >
        <img
          src={slide.thumbnail_url || slide.thumbnail}
          alt={slide.title}
          className="w-full h-full object-cover select-none"
          loading="lazy"
          onError={(e) => {
            // Fallback to standard thumbnail if high-quality fails
            e.target.src = slide.thumbnail
          }}
        />
        {slide.thumbnail_data && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent text-white text-xs p-2">
            <div className="flex gap-2 text-xs">
              {slide.thumbnail_data.images_count > 0 && (
                <span>🖼️ {slide.thumbnail_data.images_count}</span>
              )}
              {slide.thumbnail_data.shapes_count > 0 && (
                <span>📦 {slide.thumbnail_data.shapes_count}</span>
              )}
            </div>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 truncate text-sm group-hover:text-blue-600 transition-colors">{slide.title}</h3>
      <p className="text-xs text-gray-500 mt-1">Slide {slide.id}</p>
      <div className="flex gap-2 mt-3 flex-wrap">
        {slide.tags && slide.tags.length > 0 && slide.tags.map(tag => (
          <span key={tag} className="badge badge-primary text-xs bg-blue-100 text-blue-700">
            {tag}
          </span>
        ))}
      </div>

      {/* OCR Text Display */}
      {showOCR && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg max-h-40 overflow-y-auto">
          {error ? (
            <p className="text-xs text-red-600 font-medium">Fehler: {error}</p>
          ) : ocrTexts[slide.id] ? (
            <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
              {ocrTexts[slide.id].substring(0, 300)}
              {ocrTexts[slide.id].length > 300 && '...'}
            </p>
          ) : (
            <p className="text-xs text-gray-500 italic">Kein Text erkannt</p>
          )}
        </div>
      )}

      {/* Tag Editor Dialog */}
      {showTagEditor && (
        <TagEditorDialog
          slide={slide}
          onUpdateSlide={onUpdate}
          isOpen={showTagEditor}
          onClose={() => setShowTagEditor(false)}
        />
      )}
    </div>
  )
}

export default React.memo(SlideCard)
