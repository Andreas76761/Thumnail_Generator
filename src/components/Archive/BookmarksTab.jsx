import { useState, useMemo } from 'react'
import SlideCard from './SlideCard'

const PREDEFINED_CATEGORIES = [
  { id: 'wichtig', name: 'Wichtig', icon: '⭐', color: 'bg-yellow-100' },
  { id: 'review', name: 'Überarbeiten', icon: '🔄', color: 'bg-orange-100' },
  { id: 'archive', name: 'Archiv', icon: '📦', color: 'bg-blue-100' }
]

export default function BookmarksTab({
  presentations,
  bookmarkedSlides,
  slideCategories,
  onToggleBookmark,
  onUpdateCategory,
  customCategories = [],
  onAddCategory
}) {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')

  const allBookmarkedSlides = useMemo(() => {
    const bookmarked = []
    presentations.forEach(pres => {
      pres.slides.forEach(slide => {
        if (bookmarkedSlides.has(`${pres.id}-${slide.id}`)) {
          bookmarked.push({
            ...slide,
            presentationId: pres.id,
            presentationName: pres.fileName
          })
        }
      })
    })
    return bookmarked
  }, [presentations, bookmarkedSlides])

  const groupedByCategory = useMemo(() => {
    const grouped = {}
    allBookmarkedSlides.forEach(slide => {
      const key = `${slide.presentationId}-${slide.id}`
      const category = slideCategories[key] || 'Nicht kategorisiert'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(slide)
    })
    return grouped
  }, [allBookmarkedSlides, slideCategories])

  const addNewCategory = () => {
    if (newCategoryName.trim() && !customCategories.includes(newCategoryName.trim())) {
      onAddCategory(newCategoryName.trim())
      setNewCategoryName('')
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
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
          <p className="text-2xl mb-2">🔖</p>
          <p className="text-xs font-semibold">Alle</p>
          <p className="text-xs text-gray-500 mt-1">{allBookmarkedSlides.length}</p>
        </button>

        {[...PREDEFINED_CATEGORIES, ...customCategories.map(cat => ({
          id: cat.toLowerCase(),
          name: cat,
          icon: '📁',
          color: 'bg-gray-100'
        }))].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`p-4 rounded-xl text-center transition-all font-medium border ${
              selectedCategory === cat.name
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : `${cat.color} text-gray-800 border-transparent hover:border-blue-300 hover:shadow-sm`
            }`}
          >
            <p className="text-2xl mb-2">{cat.icon}</p>
            <p className="text-xs font-semibold">{cat.name}</p>
            <p className={`text-xs mt-1 ${selectedCategory === cat.name ? 'text-blue-100' : 'text-gray-600'}`}>
              {Object.keys(groupedByCategory).includes(cat.name) ? groupedByCategory[cat.name].length : 0}
            </p>
          </button>
        ))}
      </div>

      {/* Add Category Section */}
      <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Neue Kategorie..."
            className="flex-1 px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') addNewCategory()
            }}
          />
          <button
            onClick={addNewCategory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
          >
            ➕ Hinzufügen
          </button>
        </div>
      </div>

      {/* Display Bookmarks */}
      {allBookmarkedSlides.length === 0 ? (
        <div className="text-center py-20 px-6">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-dashed border-yellow-200 p-12 max-w-md mx-auto">
            <p className="text-5xl mb-4">🔖</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Keine Lesezeichen vorhanden</h3>
            <p className="text-gray-600 mb-6">Markieren Sie Ihre wichtigen Folien mit einem Lesezeichen, um sie hier zu sehen.</p>
            <p className="text-sm text-gray-500">💡 Tipp: Klicken Sie auf das 🔖-Symbol in einer Slide zum Markieren</p>
          </div>
        </div>
      ) : (
        <div>
          {selectedCategory === null ? (
            Object.entries(groupedByCategory).map(([category, slides]) => (
              <div key={category} className="mb-10">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {category === 'Nicht kategorisiert' ? '📁 ' : ''}
                  {category} ({slides.length})
                </h3>
                <div className="grid gap-5 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                  {slides.map(slide => (
                    <SlideCard
                      key={`${slide.presentationId}-${slide.id}`}
                      slide={slide}
                      presentationId={slide.presentationId}
                      viewMode="gallery"
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {selectedCategory} ({groupedByCategory[selectedCategory]?.length || 0})
              </h3>
              <div className="grid gap-5 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                {(groupedByCategory[selectedCategory] || []).map(slide => (
                  <SlideCard
                    key={`${slide.presentationId}-${slide.id}`}
                    slide={slide}
                    presentationId={slide.presentationId}
                    viewMode="gallery"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
