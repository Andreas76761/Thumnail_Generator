self.onmessage = async (event) => {
  const { action, data } = event.data

  try {
    if (action === 'parsePPTX') {
      const results = await parsePPTX(data)
      self.postMessage({
        success: true,
        action: 'parseComplete',
        results
      })
    }
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message
    })
  }
}

async function parsePPTX(file) {
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(file)

  // Extract metadata
  const coreXml = await zip.file('docProps/core.xml')?.async('text')
  let creator = 'Unknown'
  let created = new Date().toISOString()

  if (coreXml) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(coreXml, 'text/xml')
    creator = doc.querySelector('creator')?.textContent || 'Unknown'
    created = doc.querySelector('created')?.textContent || new Date().toISOString()
  }

  // Extract slides
  const slidesFolder = zip.folder('ppt/slides')
  const slides = []
  let slideIndex = 1

  if (slidesFolder) {
    for (const fileName in slidesFolder.files) {
      if (fileName.includes('slide') && fileName.endsWith('.xml')) {
        const xmlContent = await slidesFolder.file(fileName).async('text')
        const parser = new DOMParser()
        const slideDoc = parser.parseFromString(xmlContent, 'text/xml')

        const textElements = slideDoc.querySelectorAll('a\:t')
        const texts = Array.from(textElements)
          .map(el => el.textContent)
          .filter(text => text.trim().length > 0)

        slides.push({
          id: slideIndex,
          title: (texts[0] || `Slide ${slideIndex}`).substring(0, 50),
          texts: texts.slice(0, 5)
        })

        slideIndex++
      }
    }
  }

  return {
    creator,
    createdDate: created,
    slides
  }
}
