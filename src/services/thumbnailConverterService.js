/**
 * Thumbnail Converter Service
 * Canvas-based PPTX thumbnail generation (fast, in-browser)
 */

/**
 * Generate Canvas-based thumbnails from PPTX metadata
 * Creates simple but visually appealing slide previews
 */
export const generateCanvasThumbnails = (presentation) => {
  return {
    status: 'success',
    total_slides: presentation.slides?.length || 0,
    thumbnails: (presentation.slides || []).map((slide, index) => {
      // Generate canvas thumbnail
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 600

      const ctx = canvas.getContext('2d')

      // Background gradient (blue to purple)
      const gradient = ctx.createLinearGradient(0, 0, 800, 600)
      gradient.addColorStop(0, '#5B5FFF')
      gradient.addColorStop(1, '#9333EA')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 800, 600)

      // Title text
      ctx.fillStyle = 'white'
      ctx.font = 'bold 48px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(slide.title || `Slide ${index + 1}`, 400, 250)

      // Subtitle (text preview)
      ctx.font = '24px Arial'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      const preview = slide.text ? slide.text.substring(0, 60) : ''
      if (preview) {
        ctx.fillText(preview + (preview.length === 60 ? '...' : ''), 400, 350)
      }

      // Bottom info bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(0, 520, 800, 80)

      // Metadata indicators
      ctx.fillStyle = 'white'
      ctx.font = '18px Arial'
      ctx.textAlign = 'left'
      let infoX = 30
      if (slide.images_count > 0) {
        ctx.fillText(`🖼️ ${slide.images_count}`, infoX, 550)
        infoX += 120
      }
      if (slide.shapes_count > 0) {
        ctx.fillText(`📦 ${slide.shapes_count}`, infoX, 550)
      }
      ctx.fillText(`Slide ${index + 1}`, 650, 550)

      // Convert to data URL
      const thumbnail_url = canvas.toDataURL('image/png')

      return {
        slide_id: slide.id,
        text_preview: slide.text ? slide.text.substring(0, 100) : '',
        images_count: slide.images_count || 0,
        shapes_count: slide.shapes_count || 0,
        thumbnail_url
      }
    }),
    timestamp: new Date().toISOString()
  }
}

/**
 * Legacy: Call backend (Render.com) if available
 * Falls back to canvas if backend unavailable
 */
export const convertPPTXToThumbnails = async (pptxFile, presentation) => {
  try {
    // Validate file
    if (!pptxFile) {
      throw new Error('No file provided')
    }

    if (!pptxFile.name.toLowerCase().endsWith('.pptx')) {
      throw new Error('Only .pptx files are supported')
    }

    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (pptxFile.size > MAX_SIZE) {
      throw new Error(`File too large (max ${MAX_SIZE / 1024 / 1024}MB)`)
    }

    // Try backend first (if available)
    const backendUrl = import.meta.env.VITE_THUMBNAIL_BACKEND_URL
    if (backendUrl) {
      try {
        const formData = new FormData()
        formData.append('file', pptxFile)

        const response = await fetch(`${backendUrl}/convert`, {
          method: 'POST',
          body: formData,
          timeout: 30000
        })

        if (response.ok) {
          const result = await response.json()
          return {
            status: 'success',
            total_slides: result.total_slides,
            thumbnails: result.thumbnails,
            timestamp: result.timestamp,
            source: 'backend' // For debugging
          }
        }
      } catch (error) {
        console.warn('Backend conversion failed, falling back to Canvas:', error)
      }
    }

    // Fallback: Use Canvas-based generation
    console.log('Using Canvas-based thumbnail generation')
    return generateCanvasThumbnails(presentation)
  } catch (error) {
    console.error('Thumbnail conversion error:', error)
    // Final fallback: generate basic thumbnails
    return generateCanvasThumbnails(presentation)
  }
}

export const getThumbnailImage = (slideId) => {
  // Returns URL to fetch specific thumbnail
  return `/api/thumbnail/${slideId}`
}

/**
 * Alternative: Call Python backend directly (for local development)
 * Configure THUMBNAIL_BACKEND_URL in .env
 */
export const convertPPTXToThumbnailsLocal = async (pptxFile) => {
  try {
    const backendUrl = import.meta.env.VITE_THUMBNAIL_BACKEND_URL || 'http://localhost:5000'

    const formData = new FormData()
    formData.append('file', pptxFile)

    const response = await fetch(`${backendUrl}/convert`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Conversion failed')
    }

    const result = await response.json()

    return {
      status: 'success',
      total_slides: result.total_slides,
      thumbnails: result.thumbnails,
      timestamp: result.timestamp
    }
  } catch (error) {
    console.error('Local thumbnail conversion error:', error)
    throw error
  }
}
