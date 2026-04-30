// Generate design preview images for slides

export const generateDesignVariant = (slide, designType, index = 1) => {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600

  const ctx = canvas.getContext('2d')
  const colors = getDesignColors(designType)

  // Background
  const bgGradient = ctx.createLinearGradient(0, 0, 800, 600)
  bgGradient.addColorStop(0, colors.primary)
  bgGradient.addColorStop(1, colors.secondary)
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, 800, 600)

  // Design-specific styling
  applyDesignStyle(ctx, designType, colors, slide)

  // Title
  ctx.fillStyle = colors.text
  ctx.font = `bold ${getDesignFontSize(designType)}px Arial`
  ctx.textAlign = 'center'
  wrapText(ctx, slide.title, 400, 250, 750, 60, colors.text)

  // Design variant indicator
  ctx.font = '14px Arial'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.textAlign = 'right'
  ctx.fillText(`Design: ${designType} (v${index})`, 750, 580)

  return canvas.toDataURL('image/png')
}

const getDesignColors = (designType) => {
  const designs = {
    minimal: {
      primary: '#f3f4f6',
      secondary: '#e5e7eb',
      accent: '#1f2937',
      text: '#1f2937',
      highlight: '#2563eb'
    },
    colorful: {
      primary: '#fbbf24',
      secondary: '#ec4899',
      accent: '#8b5cf6',
      text: '#ffffff',
      highlight: '#10b981'
    },
    professional: {
      primary: '#1e40af',
      secondary: '#1e3a8a',
      accent: '#ffffff',
      text: '#ffffff',
      highlight: '#fbbf24'
    }
  }
  return designs[designType] || designs.minimal
}

const getDesignFontSize = (designType) => {
  switch (designType) {
    case 'minimal':
      return 32
    case 'colorful':
      return 36
    case 'professional':
      return 40
    default:
      return 32
  }
}

const applyDesignStyle = (ctx, designType, colors, slide) => {
  switch (designType) {
    case 'minimal':
      // Add subtle line decoration
      ctx.strokeStyle = colors.accent
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(50, 200)
      ctx.lineTo(750, 200)
      ctx.stroke()
      break

    case 'colorful':
      // Add decorative circles
      ctx.fillStyle = colors.highlight
      ctx.globalAlpha = 0.1
      ctx.arc(100, 100, 150, 0, Math.PI * 2)
      ctx.fill()
      ctx.arc(700, 500, 200, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1.0
      break

    case 'professional':
      // Add corner elements
      ctx.fillStyle = colors.highlight
      ctx.globalAlpha = 0.2
      ctx.fillRect(0, 0, 800, 10)
      ctx.fillRect(0, 590, 800, 10)
      ctx.globalAlpha = 1.0
      break
  }
}

const wrapText = (ctx, text, x, y, maxWidth, lineHeight, fillStyle) => {
  ctx.fillStyle = fillStyle
  const words = text.split(' ')
  let line = ''

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, y)
      line = words[i] + ' '
      y += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, y)
}

export const generateMultipleDesigns = (slide) => {
  return {
    minimal: generateDesignVariant(slide, 'minimal', 1),
    colorful: generateDesignVariant(slide, 'colorful', 1),
    professional: generateDesignVariant(slide, 'professional', 1)
  }
}

export const applyDesignToSlide = (slide, designType) => {
  return {
    ...slide,
    designApplied: designType,
    designPreview: generateDesignVariant(slide, designType),
    designAppliedDate: new Date().toISOString()
  }
}
