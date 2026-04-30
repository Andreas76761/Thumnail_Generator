// Generate Table of Contents Slide
export const generateTOCSlide = (slides) => {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600

  const ctx = canvas.getContext('2d')

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 800, 600)
  gradient.addColorStop(0, '#2563EB')
  gradient.addColorStop(1, '#1E40AF')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 800, 600)

  // Title
  ctx.fillStyle = 'white'
  ctx.font = 'bold 48px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('Inhaltsverzeichnis', 400, 60)

  // Table of contents items
  ctx.font = '20px Arial'
  ctx.textAlign = 'left'
  const maxItems = Math.min(10, slides.length - 1)
  const itemHeight = 40
  const startY = 120

  for (let i = 0; i < maxItems; i++) {
    const text = `${i + 1}. ${slides[i + 1]?.title?.substring(0, 50) || `Slide ${i + 1}`}`
    ctx.fillText(text, 60, startY + (i * itemHeight))
  }

  if (slides.length > maxItems + 1) {
    ctx.font = '18px Arial'
    ctx.fillText(`... und ${slides.length - maxItems - 1} weitere`, 60, startY + (maxItems * itemHeight))
  }

  return {
    id: 'toc-slide',
    title: 'Inhaltsverzeichnis',
    texts: ['Table of Contents'],
    tags: ['TOC', 'Auto-generated'],
    category: null,
    thumbnail: canvas.toDataURL('image/png'),
    designApplied: 'toc'
  }
}

// Generate Management Summary Slide
export const generateSummarySummarySide = (summary, slides) => {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600

  const ctx = canvas.getContext('2d')

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 800, 600)
  gradient.addColorStop(0, '#8B5CF6')
  gradient.addColorStop(1, '#6D28D9')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 800, 600)

  // Title
  ctx.fillStyle = 'white'
  ctx.font = 'bold 40px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('Management Summary', 400, 60)

  // Summary content
  ctx.font = '18px Arial'
  ctx.textAlign = 'left'

  // Key points
  if (summary?.keyPoints) {
    const keyPointsText = summary.keyPoints.slice(0, 4).map(kp => `• ${kp.point.substring(0, 60)}`).join('\n')
    const lines = keyPointsText.split('\n')
    let y = 140
    lines.forEach((line) => {
      ctx.fillText(line, 50, y)
      y += 35
    })
  }

  // Footer
  ctx.font = '14px Arial'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.textAlign = 'right'
  ctx.fillText(`${slides.length} Slides`, 750, 570)

  return {
    id: 'summary-slide',
    title: 'Management Summary',
    texts: [summary?.title || 'Presentation Summary'],
    tags: ['Summary', 'Auto-generated'],
    category: null,
    thumbnail: canvas.toDataURL('image/png'),
    designApplied: 'summary'
  }
}

// Insert slides at specific positions
export const insertSlideAtIndex = (slides, newSlide, index) => {
  const updatedSlides = [...slides]
  updatedSlides.splice(index, 0, newSlide)
  // Reassign IDs to maintain continuity
  return updatedSlides.map((slide, idx) => ({
    ...slide,
    id: slide.id === 'toc-slide' || slide.id === 'summary-slide' ? slide.id : idx + 1
  }))
}

// Auto-generate and insert special slides
export const enhancePresentation = (presentation, summary) => {
  let enhanced = { ...presentation }

  // Add summary slide at position 0 (beginning)
  if (summary) {
    const summarySlide = generateSummarySummarySide(summary, presentation.slides)
    enhanced.slides = insertSlideAtIndex(enhanced.slides, summarySlide, 0)
  }

  // Add TOC slide at position 1 (after summary)
  const tocSlide = generateTOCSlide(enhanced.slides)
  enhanced.slides = insertSlideAtIndex(enhanced.slides, tocSlide, 1)

  return enhanced
}
