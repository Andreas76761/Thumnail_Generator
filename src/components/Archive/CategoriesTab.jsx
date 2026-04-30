import { useState, useMemo } from 'react'
import SlideCard from './SlideCard'

const PREDEFINED_CATEGORIES = [
  { id: 'strategy', name: 'Strategie', icon: '📊', color: 'bg-blue-100' },
  { id: 'sales', name: 'Verkauf', icon: '💰', color: 'bg-green-100' },
  { id: 'product', name: 'Produkt', icon: '🚀', color: 'bg-purple-100' },
  { id: 'marketing', name: 'Marketing', icon: '📢', color: 'bg-pink-100' },
  { id: 'finance', name: 'Finanzen', icon: '💹', color: 'bg-yellow-100' },
  { id: 'team', name: 'Team', icon: '👥', color: 'bg-red-100' },
  { id: 'other', name: 'Sonstiges', icon: '📁', color: 'bg-gray-100' }
]

export default function CategoriesTab({ presentations, viewMode, onUpdateSlide, bookmarkedSlides, onToggleBookmark }) {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [editingSlideId, setEditingSlideId] = useState(null)

  const allSlides = useMemo(() => {
    return presentations.flatMap(pres =>
      pres.slides.map(slide => ({
        ...slide,
        presentationId: pres.id,
        presentationName: pres.fileName
      }))
    )
  }, [presentations])

  const categorizedSlides = useMemo(() => {
    const grouped = {}
    PREDEFINED_CATEGORIES.forEach(cat => {
      grouped[cat.id] = allSlides.filter(s => s.category === cat.id || (cat.id === 'other' && !s.category))
    })
    return grouped
  }, [allSlides])

  const selectedSlides = selectedCategory
    ? categorizedSlides[selectedCategory] || []
    : allSlides

  const handleUpdateCategory = (slideId, presentationId, newCategory) => {
    if (onUpdateSlide) {
      onUpdateSlide(presentationId, slideId, { category: newCategory })
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fadeIn">
      {/* Category Selector */}
      <div className="mb-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`p-4 rounded-xl text-center transition-all font-medium border ${
            selectedCategory === null
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          <p className="text-2xl mb-2">📁</p>
          <p className="text-xs font-semibold">Alle</p>
          <p className="text-xs text-gray-500 mt-1">{Object.values(categorizedSlides).reduce((sum, arr) => sum + arr.length, 0)}</p>
        </button>
        {PREDEFINED_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`p-4 rounded-xl text-center transition-all font-medium border ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : `${cat.color} text-gray-800 border-transparent hover:border-blue-300 hover:shadow-sm`
            }`}
          >
            <p className="text-2xl mb-2">{cat.icon}</p>
            <p className="text-xs font-semibold">{cat.name}</p>
            <p className={`text-xs mt-1 ${selectedCategory === cat.id ? 'text-blue-100' : 'text-gray-600'}`}>{categorizedSlides[cat.id]?.length || 0}</p>
          </button>
        ))}
      </div>

      {/* Results Summary */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-gray-700 font-medium">
          {selectedCategory ? (
            <>
              <span className="font-semibold text-blue-700">{selectedSlides.length}</span> {selectedSlides.length === 1 ? 'Folie' : 'Folien'} in Kategorie <span className="text-blue-700">{PREDEFINED_CATEGORIES.find(c => c.id === selectedCategory)?.name}</span>
            </>
          ) : (
            <>
              Insgesamt <span className="font-semibold text-blue-700">{allSlides.length}</span> Folien
            </>
          )}
        </p>
      </div>

      {/* Slides Grid */}
      <div className={`grid gap-5 ${
        viewMode === 'gallery' ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4' :
        viewMode === 'carousel' ? 'grid-cols-1' :
        'grid-cols-1'
      }`}>
        {selectedSlides.map((slide) => (
          <div key={`${slide.presentationId}-${slide.id}`} className="relative">
            <SlideCard
              slide={slide}
              presentationId={slide.presentationId}
              viewMode={viewMode}
              onToggleBookmark={onToggleBookmark}
              isBookmarked={bookmarkedSlides && bookmarkedSlides.has(`${slide.presentationId}-${slide.id}`)}
            />
            <div className="mt-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-600 mb-3 font-medium">📄 {slide.presentationName}</p>
              {editingSlideId === `${slide.presentationId}-${slide.id}` ? (
                <div className="flex gap-2 flex-wrap">
                  {PREDEFINED_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        handleUpdateCategory(slide.id, slide.presentationId, cat.id)
                        setEditingSlideId(null)
                      }}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                        slide.category === cat.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => setEditingSlideId(`${slide.presentationId}-${slide.id}`)}
                  className="w-full px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg text-xs hover:from-blue-100 hover:to-indigo-100 transition-all font-medium border border-blue-200"
                >
                  {slide.category
                    ? `📍 ${PREDEFINED_CATEGORIES.find(c => c.id === slide.category)?.name}`
                    : '➕ Kategorie hinzufügen'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedSlides.length === 0 && (
        <div className="text-center py-20 px-6">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 max-w-md mx-auto">
            <p className="text-5xl mb-4">📂</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Keine Folien in dieser Kategorie</h3>
            <p className="text-gray-600">Wählen Sie "Alle" um alle verfügbaren Folien zu sehen oder ordnen Sie Folien dieser Kategorie zu.</p>
          </div>
        </div>
      )}
    </div>
  )
}
