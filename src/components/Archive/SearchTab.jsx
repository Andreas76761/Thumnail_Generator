import { useState, useMemo } from 'react'
import SlideCard from './SlideCard'

const PREDEFINED_TAGS = [
  'Umsatz', 'Strategie', 'Finanzen', 'Marketing', 'Produkt',
  'Team', 'Kunden', 'Analyse', 'Wachstum', 'Agenda',
  'Überblick', 'Risiko', 'Planung', 'Qualität', 'Innovation',
  'Technologie', 'Markt', 'Ziele', 'Methode', 'Ergebnis'
]

export default function SearchTab({ presentations, viewMode, bookmarkedSlides, onToggleBookmark, customTags = [] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('all') // all, title, content, tags
  const [selectedTags, setSelectedTags] = useState([])

  const allSlides = useMemo(() => {
    return presentations.flatMap(pres =>
      pres.slides.map(slide => ({
        ...slide,
        presentationId: pres.id,
        presentationName: pres.fileName
      }))
    )
  }, [presentations])

  // Collect all tags from slides for filter sidebar
  const allAvailableTags = useMemo(() => {
    const tagsSet = new Set()
    allSlides.forEach(slide => {
      slide.tags?.forEach(tag => tagsSet.add(tag))
    })
    return Array.from(tagsSet)
  }, [allSlides])

  // Categorize tags
  const categorizedTags = useMemo(() => {
    const predefined = allAvailableTags.filter(tag => PREDEFINED_TAGS.includes(tag))
    const custom = customTags.filter(tag => allAvailableTags.includes(tag))
    const aiGenerated = allAvailableTags.filter(
      tag => !PREDEFINED_TAGS.includes(tag) && !customTags.includes(tag)
    )
    return { predefined, custom, aiGenerated }
  }, [allAvailableTags, customTags])

  const filteredSlides = useMemo(() => {
    let results = allSlides

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(slide => {
        switch (searchType) {
          case 'title':
            return slide.title.toLowerCase().includes(query)
          case 'content':
            return slide.texts.some(text => text.toLowerCase().includes(query))
          case 'tags':
            return slide.tags.some(tag => tag.toLowerCase().includes(query))
          default: // all
            return (
              slide.title.toLowerCase().includes(query) ||
              slide.texts.some(text => text.toLowerCase().includes(query)) ||
              slide.tags.some(tag => tag.toLowerCase().includes(query))
            )
        }
      })
    }

    // Apply tag filter (OR-Logic: slide must have at least one selected tag)
    if (selectedTags.length > 0) {
      results = results.filter(slide =>
        slide.tags?.some(tag => selectedTags.includes(tag))
      )
    }

    return results
  }, [searchQuery, searchType, allSlides, selectedTags])

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleClearAllFilters = () => {
    setSearchQuery('')
    setSelectedTags([])
  }

  const highlightText = (text) => {
    if (!searchQuery.trim()) return text
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'))
    return parts.map((part, idx) =>
      part.toLowerCase() === searchQuery.toLowerCase()
        ? <span key={idx} className="bg-yellow-200 font-semibold">{part}</span>
        : part
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fadeIn">
      <div className="flex gap-6">
        {/* Tag Filter Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-xl border border-gray-100 shadow-sm p-4 max-h-[calc(100vh-150px)] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 text-sm">🏷️ Tags</h3>
              {selectedTags.length > 0 && (
                <button
                  onClick={handleClearAllFilters}
                  className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-all font-medium"
                  title="Alle Filter löschen"
                >
                  ✕ Löschen
                </button>
              )}
            </div>

            {/* Predefined Tags */}
            {categorizedTags.predefined.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 px-2">Vordefiniert</p>
                <div className="space-y-2">
                  {categorizedTags.predefined.map(tag => (
                    <label key={tag} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{tag}</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {allSlides.filter(s => s.tags?.includes(tag)).length}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Tags */}
            {categorizedTags.custom.length > 0 && (
              <div className="mb-5 pb-4 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 px-2">Benutzerdefiniert</p>
                <div className="space-y-2">
                  {categorizedTags.custom.map(tag => (
                    <label key={tag} className="flex items-center gap-2 px-2 py-1 hover:bg-blue-50 rounded cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-blue-700 group-hover:text-blue-900 font-medium">{tag}</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {allSlides.filter(s => s.tags?.includes(tag)).length}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* AI-Generated Tags */}
            {categorizedTags.aiGenerated.length > 0 && (
              <div className="pb-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 px-2">KI-Generiert</p>
                <div className="space-y-2">
                  {categorizedTags.aiGenerated.map(tag => (
                    <label key={tag} className="flex items-center gap-2 px-2 py-1 hover:bg-green-50 rounded cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-sm text-green-700 group-hover:text-green-900">{tag}</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {allSlides.filter(s => s.tags?.includes(tag)).length}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {allAvailableTags.length === 0 && (
              <p className="text-xs text-gray-500 italic text-center py-4">Keine Tags vorhanden</p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search Bar */}
          <div className="mb-10">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Durchsuchen Sie alle Folien..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          />
          <button
            onClick={() => setSearchQuery('')}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium text-sm"
          >
            Löschen
          </button>
        </div>

        {/* Search Type Filter */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'Alle' },
            { id: 'title', label: 'Titel' },
            { id: 'content', label: 'Inhalt' },
            { id: 'tags', label: 'Tags' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setSearchType(type.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                searchType === type.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

          {/* Results Summary */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-gray-700 font-medium">
              {searchQuery.trim() || selectedTags.length > 0 ? (
                <>
                  <span className="font-semibold text-blue-700">{filteredSlides.length}</span> {filteredSlides.length === 1 ? 'Ergebnis' : 'Ergebnisse'}
                  {searchQuery.trim() && <> für "<span className="text-blue-700">{searchQuery}</span>"</>}
                  {selectedTags.length > 0 && <> mit {selectedTags.length} Tag{selectedTags.length !== 1 ? 's' : ''}</>}
                </>
              ) : (
                <>
                  Insgesamt <span className="font-semibold text-blue-700">{allSlides.length}</span> Folien
                </>
              )}
            </p>
          </div>

          {/* Results Grid */}
          {filteredSlides.length === 0 ? (
            <div className="text-center py-20 px-6">
              {searchQuery.trim() || selectedTags.length > 0 ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200 p-12">
                  <p className="text-5xl mb-4">🔍</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Keine Folien gefunden</h3>
                  <p className="text-gray-600 mb-8">
                    {searchQuery.trim() && `Deine Suche nach "${searchQuery}" hat keine Ergebnisse gebracht.`}
                    {selectedTags.length > 0 && ` Mit ${selectedTags.length} Tag${selectedTags.length !== 1 ? 's' : ''} konnten keine Folien gefunden werden.`}
                  </p>
                  <button
                    onClick={handleClearAllFilters}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold shadow-md"
                  >
                    ↺ Alle Filter zurücksetzen
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-200 p-12">
                  <p className="text-5xl mb-4">📭</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Keine Folien vorhanden</h3>
                  <p className="text-gray-600">Laden Sie eine PowerPoint-Datei hoch, um mit der Suche zu beginnen.</p>
                </div>
              )}
            </div>
          ) : (
            <div className={`grid gap-5 ${
              viewMode === 'gallery' ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4' :
              viewMode === 'carousel' ? 'grid-cols-1' :
              'grid-cols-1'
            }`}>
              {filteredSlides.map((slide) => (
                <div key={`${slide.presentationId}-${slide.id}`} className="group">
                  <SlideCard
                    slide={{
                      ...slide,
                      title: highlightText(slide.title)
                    }}
                    presentationId={slide.presentationId}
                    viewMode={viewMode}
                    onToggleBookmark={onToggleBookmark}
                    isBookmarked={bookmarkedSlides && bookmarkedSlides.has(`${slide.presentationId}-${slide.id}`)}
                  />
                  <p className="text-xs text-gray-600 mt-3 group-hover:text-gray-900 transition-colors">
                    📄 {slide.presentationName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
