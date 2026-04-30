import { useState } from 'react'
import { generateDesignDescription } from '../../services/llmService'
import DesignPreview from './DesignPreview'

const DESIGN_TYPES = [
  { id: 'minimal', name: 'Minimal', description: 'Sauberes, modernes Design' },
  { id: 'colorful', name: 'Bunt', description: 'Lebendige Farben und Grafiken' },
  { id: 'professional', name: 'Professionell', description: 'Corporate und formell' }
]

export default function DesignDialog({ slide, onClose, onApply }) {
  const [selectedDesign, setSelectedDesign] = useState(null)
  const [descriptions, setDescriptions] = useState({})
  const [loading, setLoading] = useState({})

  const generateDescription = async (designType) => {
    if (descriptions[designType]) return

    setLoading(prev => ({ ...prev, [designType]: true }))
    try {
      const description = await generateDesignDescription(slide, designType, 'claude')
      setDescriptions(prev => ({ ...prev, [designType]: description }))
    } catch (error) {
      console.error('Error generating description:', error)
    } finally {
      setLoading(prev => ({ ...prev, [designType]: false }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-96 overflow-y-auto border border-gray-100">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">🎨 Design-Generator</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors"
            >
              ✕
            </button>
          </div>

          <p className="text-gray-600 mb-8 text-lg">
            Wählen Sie einen Design-Stil für Folie: <span className="font-semibold text-blue-700">{slide.title}</span>
          </p>

          {/* Design Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DESIGN_TYPES.map(design => (
              <div key={design.id} className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                selectedDesign === design.id
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
                   onClick={() => {
                     setSelectedDesign(design.id)
                     generateDescription(design.id)
                   }}>
                <div className="mb-5">
                  <DesignPreview designType={design.id} slide={slide} />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{design.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{design.description}</p>

                {loading[design.id] && (
                  <p className="text-sm text-gray-500 mb-4">⏳ Wird generiert...</p>
                )}
                {descriptions[design.id] && (
                  <p className="text-sm text-gray-700 mb-4 italic bg-white p-3 rounded-lg border border-gray-100">
                    {descriptions[design.id].substring(0, 100)}...
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      generateDescription(design.id)
                    }}
                    disabled={loading[design.id]}
                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all text-sm font-medium disabled:opacity-50"
                  >
                    Vorschau
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onApply) onApply(design.id)
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-sm"
                  >
                    ✓ Anwenden
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
