import { useState } from 'react'

export default function TagEditorDialog({ slide, onUpdateSlide, isOpen, onClose }) {
  const [tags, setTags] = useState(slide?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen || !slide) return null

  const handleAddTag = () => {
    const trimmedTag = newTag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      onUpdateSlide(slide.id, { tags })
      setTimeout(() => {
        setIsSaving(false)
        onClose()
      }, 300)
    } catch (error) {
      console.error('Error saving tags:', error)
      setIsSaving(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">🏷️ Tags bearbeiten</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Slide Info */}
          <p className="text-sm text-gray-600 mb-4 p-2 bg-gray-50 rounded-lg">
            <span className="font-semibold text-gray-900">{slide.title}</span>
          </p>

          {/* Current Tags */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Aktuelle Tags</label>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <div
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-900 font-bold transition-colors"
                      title="Löschen"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Keine Tags</p>
            )}
          </div>

          {/* Add New Tag */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Neuer Tag</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="z.B. 'Wichtig'"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              💡 Tipps: Erstelle Tags für Kategorisierung und bessere Filterung. Nutze konsistente Namen.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isSaving ? '⏳ Speichert...' : '💾 Speichern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
