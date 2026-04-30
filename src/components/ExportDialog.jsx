import { useState } from 'react'
import toast from 'react-hot-toast'
import { exportToJSON, exportToCSV, exportAsHTML, exportDesignMetadata, exportDesignsAsHTML } from '../services/exportService'

const EXPORT_FORMATS = [
  {
    id: 'json',
    name: 'JSON',
    description: 'Vollständige Datenstruktur mit allen Metadaten',
    icon: '📋',
    export: exportToJSON
  },
  {
    id: 'csv',
    name: 'CSV',
    description: 'Tabellenformat für Excel/Google Sheets',
    icon: '📊',
    export: exportToCSV
  },
  {
    id: 'html',
    name: 'HTML',
    description: 'Webseite mit allen Folien und Inhalten',
    icon: '🌐',
    export: exportAsHTML
  },
  {
    id: 'designs',
    name: 'Designs',
    description: 'Angewendete Designs als HTML Übersicht',
    icon: '🎨',
    export: null // Custom handler
  }
]

export default function ExportDialog({ presentations, onClose, appliedDesigns, designHistory }) {
  const [selectedFormat, setSelectedFormat] = useState('json')
  const [fileName, setFileName] = useState('presentations')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const format = EXPORT_FORMATS.find(f => f.id === selectedFormat)
      const formatName = format?.name || 'Unknown'

      if (selectedFormat === 'designs') {
        // Custom handler for designs
        exportDesignsAsHTML(presentations, appliedDesigns, fileName + '.html')
        toast.success(`📥 ${formatName}-Datei erfolgreich exportiert!`)
      } else {
        const extension = selectedFormat === 'csv' ? '.csv' : selectedFormat === 'html' ? '.html' : '.json'
        format.export(presentations, fileName + extension)
        toast.success(`📥 ${formatName}-Datei erfolgreich exportiert!`)
      }
      onClose()
    } catch (error) {
      console.error('Export error:', error)
      toast.error(`❌ Exportfehler: ${error.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-gray-100">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">📥 Präsentation exportieren</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Format Selection */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Exportformat wählen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EXPORT_FORMATS.map(format => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${
                    selectedFormat === format.id
                      ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <p className="text-3xl mb-3">{format.icon}</p>
                  <p className={`font-semibold ${selectedFormat === format.id ? 'text-blue-700' : 'text-gray-900'}`}>{format.name}</p>
                  <p className="text-sm text-gray-600 mt-2">{format.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* File Name */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Dateiname</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="presentations"
                className="flex-1 px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
              <span className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600 text-sm font-medium border border-gray-200">
                .{selectedFormat === 'csv' ? 'csv' : selectedFormat === 'html' ? 'html' : 'json'}
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-gray-700 font-medium">
              <span className="font-semibold text-blue-700">{presentations.length}</span> {presentations.length === 1 ? 'Präsentation' : 'Präsentationen'} mit insgesamt <span className="font-semibold text-blue-700">{presentations.reduce((sum, p) => sum + p.slides.length, 0)}</span> Folien
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
            >
              Abbrechen
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {isExporting ? '⏳ Wird exportiert...' : '📥 Exportieren'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
