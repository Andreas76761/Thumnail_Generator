import JSZip from 'jszip'

export const parsePPTX = async (file) => {
  try {
    const zip = await JSZip.loadAsync(file)

    // Extract metadata
    const metadata = await extractMetadata(zip)

    // Extract slides
    const slides = await extractSlides(zip)

    return {
      id: Date.now().toString(),
      fileName: file.name,
      fileSize: file.size,
      ...metadata,
      slides
    }
  } catch (error) {
    console.error('PPTX parsing error:', error)
    throw new Error(`Failed to parse PPTX: ${error.message}`)
  }
}

const extractMetadata = async (zip) => {
  try {
    const coreXml = await zip.file('docProps/core.xml')?.async('text')
    if (!coreXml) {
      return {
        creator: 'Unknown',
        createdDate: new Date().toISOString()
      }
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(coreXml, 'text/xml')

    const creator = doc.querySelector('creator')?.textContent || 'Unknown'
    const created = doc.querySelector('created')?.textContent || new Date().toISOString()

    return {
      creator,
      createdDate: created
    }
  } catch (error) {
    console.warn('Metadata extraction failed:', error)
    return {
      creator: 'Unknown',
      createdDate: new Date().toISOString()
    }
  }
}

const extractSlides = async (zip) => {
  const slidesFolder = zip.folder('ppt/slides')
  if (!slidesFolder) return []

  const slides = []
  let slideIndex = 1

  for (const fileName in slidesFolder.files) {
    if (fileName.includes('slide') && fileName.endsWith('.xml')) {
      try {
        const xmlContent = await slidesFolder.file(fileName).async('text')
        const slideData = parseSlideXml(xmlContent, slideIndex)
        slides.push(slideData)
        slideIndex++
      } catch (error) {
        console.error(`Error parsing ${fileName}:`, error)
      }
    }
  }

  return slides
}

const parseSlideXml = (xml, index) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'text/xml')

  // Extract text from all text elements
  const textElements = doc.querySelectorAll('a\\:t')
  const texts = Array.from(textElements)
    .map(el => el.textContent)
    .filter(text => text.trim().length > 0)

  // Generate thumbnail
  const title = texts[0] || `Slide ${index}`

  return {
    id: index,
    title: title.substring(0, 50),
    texts: texts.slice(0, 5),
    tags: generateTags(texts),
    category: null,
    isBookmarked: false,
    thumbnail: generateCanvasThumbnail(title, index),
    designApplied: null
  }
}

const generateTags = (texts) => {
  const PREDEFINED_TAGS = [
    'Umsatz', 'Strategie', 'Finanzen', 'Marketing', 'Produkt',
    'Team', 'Kunden', 'Analyse', 'Wachstum', 'Agenda'
  ]

  const fullText = texts.join(' ').toLowerCase()
  const foundTags = PREDEFINED_TAGS.filter(tag =>
    fullText.includes(tag.toLowerCase())
  )

  return foundTags.length > 0 ? foundTags.slice(0, 5) : ['Sonstiges']
}

const generateCanvasThumbnail = (title, slideNum) => {
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

  // Title
  ctx.fillStyle = 'white'
  ctx.font = 'bold 48px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(title.substring(0, 30), 400, 250)

  // Slide number (watermark)
  ctx.font = 'bold 200px Arial'
  ctx.globalAlpha = 0.1
  ctx.fillText(slideNum, 250, 400)
  ctx.globalAlpha = 1.0

  return canvas.toDataURL('image/png')
}
