import JSZip from 'jszip'

// Extract text from PPTX slide XML
const extractTextFromSlideXML = (xmlString) => {
  const texts = []
  // Simple regex to extract text from XML
  const textMatch = xmlString.match(/<a:t>([^<]+)<\/a:t>/g)
  if (textMatch) {
    textMatch.forEach(match => {
      const text = match.replace(/<\/?a:t>/g, '')
      if (text.trim()) texts.push(text.trim())
    })
  }
  return texts
}

// Get slide title from texts
const getSlideTitle = (texts) => {
  if (texts.length === 0) return 'Untitled Slide'
  return texts[0].substring(0, 50)
}

// Extract images from PPTX
const extractImages = async (zip) => {
  const images = {}
  const mediaFolder = zip.folder('ppt/media')

  if (mediaFolder) {
    const imagePromises = []

    mediaFolder.forEach((relativePath, file) => {
      if (!file.dir && /\.(jpg|jpeg|png|gif)$/i.test(relativePath)) {
        imagePromises.push(
          file.async('arraybuffer').then(data => {
            const blob = new Blob([data])
            const url = URL.createObjectURL(blob)
            images[relativePath] = url
          }).catch(err => console.warn('Image extraction error:', err))
        )
      }
    })

    await Promise.all(imagePromises)
  }

  return Object.values(images)
}

// Generate thumbnail from image or canvas
const createThumbnail = async (imageUrl) => {
  if (!imageUrl) {
    // Fallback: create canvas thumbnail
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createLinearGradient(0, 0, 800, 600)
    gradient.addColorStop(0, '#3b82f6')
    gradient.addColorStop(1, '#1e40af')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 800, 600)

    ctx.fillStyle = 'white'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Slide', 400, 300)

    return canvas.toDataURL('image/png')
  }

  return imageUrl
}

// Main PPTX parsing function
export const parsePPTXFile = async (file) => {
  try {
    const zip = new JSZip()
    const pptxData = await zip.loadAsync(file)

    // Extract images
    const images = await extractImages(pptxData)

    // Extract slides
    const slidesFolder = pptxData.folder('ppt/slides')
    const slides = []
    let slideIndex = 0

    if (slidesFolder) {
      const slideFiles = Object.keys(pptxData.files)
        .filter(f => f.match(/ppt\/slides\/slide\d+\.xml$/))
        .sort()

      for (const slideFile of slideFiles) {
        try {
          const xmlContent = await pptxData.file(slideFile).async('string')
          const texts = extractTextFromSlideXML(xmlContent)
          const title = getSlideTitle(texts)

          const thumbnail = await createThumbnail(images[slideIndex] || null)

          slides.push({
            id: slideIndex + 1,
            title,
            texts: texts.length > 0 ? texts : ['Inhalt'],
            tags: slideIndex === 0 ? ['Titelfolie'] : ['Inhalt'],
            category: null,
            isBookmarked: false,
            thumbnail,
            designApplied: null
          })

          slideIndex++
        } catch (err) {
          console.warn(`Error parsing slide ${slideIndex}:`, err)
        }
      }
    }

    // Fallback if no slides extracted
    if (slides.length === 0) {
      slides.push({
        id: 1,
        title: 'Slide 1',
        texts: ['Title Slide'],
        tags: ['Titelfolie'],
        category: null,
        isBookmarked: false,
        thumbnail: await createThumbnail(images[0] || null),
        designApplied: null
      })
    }

    return {
      id: Date.now().toString(),
      fileName: file.name,
      creator: 'Unknown',
      createdDate: new Date().toISOString(),
      fileSize: file.size,
      slides
    }
  } catch (error) {
    console.error('PPTX parsing error:', error)

    // Minimal fallback
    return {
      id: Date.now().toString(),
      fileName: file.name,
      creator: 'Unknown',
      createdDate: new Date().toISOString(),
      fileSize: file.size,
      slides: [
        {
          id: 1,
          title: 'Slide 1',
          texts: ['Title Slide'],
          tags: ['Titelfolie'],
          category: null,
          isBookmarked: false,
          thumbnail: await createCanvasThumbnail('Slide 1'),
          designApplied: null
        }
      ]
    }
  }
}

// Helper: Create canvas thumbnail
const createCanvasThumbnail = async (text) => {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600

  const ctx = canvas.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, 800, 600)
  gradient.addColorStop(0, '#3b82f6')
  gradient.addColorStop(1, '#1e40af')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 800, 600)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 48px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(text, 400, 300)

  return canvas.toDataURL('image/png')
}
