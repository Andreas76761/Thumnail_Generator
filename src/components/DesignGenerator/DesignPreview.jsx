import { useEffect, useRef } from 'react'

export default function DesignPreview({ designType, slide }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    if (designType === 'minimal') {
      // Minimal design: clean white background with accent color
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, width, 120)

      ctx.fillStyle = '#4f46e5'
      ctx.fillRect(0, 0, width, 8)

      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(slide.title.substring(0, 20), 20, 60)

      ctx.fillStyle = '#6b7280'
      ctx.font = '14px Arial'
      ctx.fillText('Minimalistisches Design', 20, 95)
    } else if (designType === 'colorful') {
      // Colorful design: gradient background with vibrant colors
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#ff6b6b')
      gradient.addColorStop(0.5, '#4ecdc4')
      gradient.addColorStop(1, '#ffe66d')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(slide.title.substring(0, 20), width / 2, height / 2 - 20)

      ctx.font = '14px Arial'
      ctx.fillText('Farbenfrohe Gestaltung', width / 2, height / 2 + 20)
    } else if (designType === 'professional') {
      // Professional design: dark background with clean typography
      ctx.fillStyle = '#1f2937'
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(slide.title.substring(0, 20), 20, 60)

      ctx.fillStyle = '#d1d5db'
      ctx.font = '12px Arial'
      const maxWidth = width - 40
      const words = 'Professionelles Geschäftsdesign'.split(' ')
      let line = ''
      let y = 100

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' '
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth) {
          ctx.fillText(line, 20, y)
          line = words[i] + ' '
          y += 20
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, 20, y)

      // Accent line
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(20, 140)
      ctx.lineTo(120, 140)
      ctx.stroke()
    }
  }, [designType, slide])

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={200}
      className="w-full border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    />
  )
}
