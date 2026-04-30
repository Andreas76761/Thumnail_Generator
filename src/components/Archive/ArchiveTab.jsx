import { useState } from 'react'
import SlideCard from './SlideCard'
import AIGeneratedSummary from '../Summary/AIGeneratedSummary'
import DesignDialog from '../DesignGenerator/DesignDialog'

export default function ArchiveTab({
  presentations,
  viewMode,
  onUpdateSlide,
  onDelete,
  bookmarkedSlides,
  onToggleBookmark,
  aiSummary,
  onApplyDesign,
  appliedDesigns,
  onSlideDoubleClick
}) {
  const [showDesignDialog, setShowDesignDialog] = useState(false)
  const [selectedSlideForDesign, setSelectedSlideForDesign] = useState(null)

  if (!presentations.length) {
    return (
      <div className="max-w-7xl mx-auto p-4 text-center">
        <p className="text-gray-500">Keine Präsentationen vorhanden</p>
      </div>
    )
  }

  const presentation = presentations[0]

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fadeIn">
      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Dateiname</p>
          <p className="font-semibold text-gray-900 truncate mt-2 text-sm">
            {presentation.fileName}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Ersteller</p>
          <p className="font-semibold text-gray-900 mt-2 text-sm">{presentation.creator}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Datum</p>
          <p className="font-semibold text-gray-900 mt-2 text-sm">
            {new Date(presentation.createdDate).toLocaleDateString('de-DE')}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Größe</p>
          <p className="font-semibold text-gray-900 mt-2 text-sm">
            {(presentation.fileSize / 1000000).toFixed(1)}MB
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl shadow-sm border border-blue-200/50">
          <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Folien</p>
          <p className="font-bold text-blue-600 mt-2 text-lg">{presentation.slides.length}</p>
        </div>
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <AIGeneratedSummary
          presentations={presentations}
          summary={aiSummary}
          onNavigateToSlide={(slideId) => {
            const element = document.getElementById(`slide-${slideId}`)
            element?.scrollIntoView({ behavior: 'smooth' })
          }}
        />
      )}

      {/* Design Dialog */}
      {showDesignDialog && selectedSlideForDesign && (
        <DesignDialog
          slide={selectedSlideForDesign}
          onClose={() => setShowDesignDialog(false)}
          onApply={(designType) => {
            onApplyDesign(selectedSlideForDesign, designType)
            setShowDesignDialog(false)
          }}
        />
      )}

      {/* Slides Grid */}
      <div className={`grid gap-4 ${
        viewMode === 'gallery' ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4' :
        viewMode === 'carousel' ? 'grid-cols-1' :
        'grid-cols-1'
      }`}>
        {presentation.slides.map((slide, idx) => {
          const designKey = `${presentation.id}-${slide.id}`
          return (
            <div key={slide.id} id={`slide-${slide.id}`}>
              <SlideCard
                slide={slide}
                presentation={presentation}
                presentationId={presentation.id}
                viewMode={viewMode}
                onUpdate={onUpdateSlide}
                onToggleBookmark={onToggleBookmark}
                isBookmarked={bookmarkedSlides && bookmarkedSlides.has(designKey)}
                onDesignClick={(s) => {
                  setSelectedSlideForDesign(s)
                  setShowDesignDialog(true)
                }}
                appliedDesign={appliedDesigns?.[designKey]}
                onSlideDoubleClick={onSlideDoubleClick}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
