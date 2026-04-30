import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { MAX_FILE_SIZE } from '../utils/constants'
import { parsePPTXFile } from '../services/pptxParser'
import { convertPPTXToThumbnails } from '../services/thumbnailConverterService'

export default function UploadArea({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [useHighQualityThumbnails, setUseHighQualityThumbnails] = useState(true)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileSelect = async (files) => {
    const file = files[0]
    if (!file) return

    // Validate file
    if (!file.name.endsWith('.pptx')) {
      setError('Nur .pptx Dateien werden unterstützt')
      toast.error('Nur .pptx Dateien werden unterstützt')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = `Datei zu groß. Max: ${(MAX_FILE_SIZE / 1000000).toFixed(0)}MB`
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    setError(null)
    setIsLoading(true)
    setProgress(0)

    try {
      // Try high-quality thumbnail conversion first
      let presentation = null
      let thumbnails = null

      if (useHighQualityThumbnails) {
        try {
          toast.loading('Konvertiere zu hochqualitativen Thumbnails...')
          setProgress(30)

          const conversionResult = await convertPPTXToThumbnails(file)
          thumbnails = conversionResult.thumbnails
          setProgress(70)

          // Parse PPTX metadata
          presentation = await parsePPTXFile(file)

          // Merge thumbnail data with presentation
          if (presentation.slides && thumbnails) {
            presentation.slides = presentation.slides.map((slide, idx) => ({
              ...slide,
              thumbnail_url: thumbnails[idx]?.thumbnail_url || slide.thumbnail,
              thumbnail_data: thumbnails[idx]
            }))
          }

          toast.dismiss()
          toast.success(`${thumbnails.length} Folien konvertiert!`)
        } catch (err) {
          console.warn('High-quality thumbnail conversion failed, using fallback:', err.message)
          toast.dismiss()
          toast.loading('Erstelle Standard-Thumbnails...')
          setUseHighQualityThumbnails(false)
          // Fallback to regular parsing
          presentation = await parsePPTXFile(file)
        }
      } else {
        // Use standard thumbnail generation
        presentation = await parsePPTXFile(file)
      }

      setProgress(100)

      // Call parent callback with complete presentation data
      onUpload(presentation)

      // Reset state
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 500)
    } catch (err) {
      const errorMsg = `Fehler: ${err.message}`
      setError(errorMsg)
      toast.error(errorMsg)
      setIsLoading(false)
      console.error('Upload error:', err)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 flex items-center justify-center p-4 pt-24">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-4xl">📊</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Presentation Designer</h1>
          <p className="text-lg text-gray-600">
            Verwalten Sie Ihre Präsentationen mit künstlicher Intelligenz
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-gradient-to-b from-blue-50 to-indigo-50 shadow-lg'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-md'
          }`}
        >
          {isLoading ? (
            <div>
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600 mb-2">Verarbeite Datei...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">{Math.round(progress)}%</p>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-4">📁</div>
              <p className="text-gray-900 font-semibold mb-2">
                Datei hier hinziehen oder klicken
              </p>
              <p className="text-gray-500 text-sm mb-4">
                PowerPoint-Dateien (.pptx) bis 50MB
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                PowerPoint hochladen
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pptx"
                onChange={handleInputChange}
                className="hidden"
              />
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-14 grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200/50">
            <div className="text-3xl mb-3">🔍</div>
            <p className="text-sm font-medium text-gray-700">Intelligente Suche</p>
            <p className="text-xs text-gray-500 mt-1">Schnelle Inhaltssuche</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/50">
            <div className="text-3xl mb-3">🎨</div>
            <p className="text-sm font-medium text-gray-700">Design-Generator</p>
            <p className="text-xs text-gray-500 mt-1">3 Design-Varianten</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200/50">
            <div className="text-3xl mb-3">🎤</div>
            <p className="text-sm font-medium text-gray-700">Voice Chat</p>
            <p className="text-xs text-gray-500 mt-1">Mit 4 KI-Modellen</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200/50">
            <div className="text-3xl mb-3">☁️</div>
            <p className="text-sm font-medium text-gray-700">Cloud-Sync</p>
            <p className="text-xs text-gray-500 mt-1">Offline-First Design</p>
          </div>
        </div>
      </div>
    </div>
  )
}


// Generate Thumbnail with Canvas
function generateThumbnail(text) {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600

  const ctx = canvas.getContext('2d')

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 800, 600)
  gradient.addColorStop(0, '#4F46E5')
  gradient.addColorStop(1, '#9333EA')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 800, 600)

  // Text
  ctx.fillStyle = 'white'
  ctx.font = 'bold 48px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(text, 400, 300)

  return canvas.toDataURL('image/png')
}
