import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import './SlideDetailModal.css'

export default function SlideDetailModal({ slide, presentation, onClose }) {
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [isResizing, setIsResizing] = useState(false)
  const modalRef = useRef(null)
  const resizeHandleRef = useRef(null)

  // Handle resize
  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e) => {
      const modal = modalRef.current
      if (!modal) return

      const rect = modal.getBoundingClientRect()
      const newWidth = Math.max(400, e.clientX - rect.left)
      const newHeight = Math.max(300, e.clientY - rect.top)

      setWidth(newWidth)
      setHeight(newHeight)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  // Export as PNG
  const handleExportPNG = async () => {
    try {
      toast.loading('📥 Exportiere als PNG...')

      const thumbnail = modalRef.current?.querySelector('.slide-thumbnail')
      if (!thumbnail) {
        toast.error('Fehler: Thumbnail nicht gefunden')
        return
      }

      // Use html2canvas if available, otherwise use canvas API
      const canvas = await html2canvas(thumbnail, {
        scale: 2,
        backgroundColor: '#ffffff'
      }).catch(async () => {
        // Fallback: Use the existing thumbnail image
        const img = thumbnail.querySelector('img')
        if (!img) throw new Error('Kein Bild gefunden')

        const imgCanvas = document.createElement('canvas')
        imgCanvas.width = width
        imgCanvas.height = height
        const ctx = imgCanvas.getContext('2d')

        return new Promise((resolve) => {
          const image = new Image()
          image.onload = () => {
            ctx.drawImage(image, 0, 0, width, height)
            resolve(imgCanvas)
          }
          image.crossOrigin = 'anonymous'
          image.src = img.src
        })
      })

      // Download
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `${presentation.fileName}-slide-${slide.id}.png`
      link.click()

      toast.success('✅ PNG exportiert!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('❌ Fehler beim Export: ' + error.message)
    }
  }

  // Export as JPEG
  const handleExportJPEG = async () => {
    try {
      toast.loading('📥 Exportiere als JPEG...')

      const thumbnail = modalRef.current?.querySelector('.slide-thumbnail')
      if (!thumbnail) {
        toast.error('Fehler: Thumbnail nicht gefunden')
        return
      }

      const img = thumbnail.querySelector('img')
      if (!img) throw new Error('Kein Bild gefunden')

      const imgCanvas = document.createElement('canvas')
      imgCanvas.width = width
      imgCanvas.height = height
      const ctx = imgCanvas.getContext('2d')

      await new Promise((resolve) => {
        const image = new Image()
        image.onload = () => {
          ctx.drawImage(image, 0, 0, width, height)
          resolve()
        }
        image.crossOrigin = 'anonymous'
        image.src = img.src
      })

      // Download JPEG
      const link = document.createElement('a')
      link.href = imgCanvas.toDataURL('image/jpeg', 0.95)
      link.download = `${presentation.fileName}-slide-${slide.id}.jpg`
      link.click()

      toast.success('✅ JPEG exportiert!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('❌ Fehler beim Export: ' + error.message)
    }
  }

  // Copy to clipboard
  const handleCopyToClipboard = async () => {
    try {
      toast.loading('📋 Kopiere in Zwischenablage...')

      const thumbnail = modalRef.current?.querySelector('img')
      if (!thumbnail) {
        toast.error('Fehler: Bild nicht gefunden')
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      await new Promise((resolve) => {
        const image = new Image()
        image.onload = () => {
          ctx.drawImage(image, 0, 0, width, height)
          resolve()
        }
        image.crossOrigin = 'anonymous'
        image.src = thumbnail.src
      })

      canvas.toBlob((blob) => {
        navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]).then(() => {
          toast.success('✅ In Zwischenablage kopiert!')
        }).catch(() => {
          toast.error('Fehler beim Kopieren')
        })
      })
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('❌ Fehler: ' + error.message)
    }
  }

  return (
    <div className="slide-detail-overlay" onClick={onClose}>
      <div
        className="slide-detail-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: `${width}px`,
          height: `${height}px`
        }}
      >
        {/* Header */}
        <div className="slide-detail-header">
          <div className="slide-detail-title">
            <span className="slide-number">Slide {slide.id}</span>
            <span className="slide-dimensions">{Math.round(width)} × {Math.round(height)}px</span>
          </div>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="slide-detail-content">
          <div className="slide-thumbnail">
            <img src={slide.thumbnail_url} alt={`Slide ${slide.id}`} />
          </div>
        </div>

        {/* Footer with export options */}
        <div className="slide-detail-footer">
          <div className="export-buttons">
            <button
              className="export-btn png-btn"
              onClick={handleExportPNG}
              title="Als PNG exportieren"
            >
              📥 PNG
            </button>
            <button
              className="export-btn jpeg-btn"
              onClick={handleExportJPEG}
              title="Als JPEG exportieren"
            >
              📥 JPEG
            </button>
            <button
              className="export-btn clipboard-btn"
              onClick={handleCopyToClipboard}
              title="In Zwischenablage kopieren"
            >
              📋 Copy
            </button>
          </div>
          <div className="resize-hint">
            Drag unten rechts zum Vergrößern/Verkleinern
          </div>
        </div>

        {/* Resize handle */}
        <div
          ref={resizeHandleRef}
          className="resize-handle"
          onMouseDown={() => setIsResizing(true)}
          title="Zum Vergrößern/Verkleinern ziehen"
        />
      </div>
    </div>
  )
}
