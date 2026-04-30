import Tesseract from 'tesseract.js'

let ocrWorker = null

const initializeWorker = async () => {
  if (!ocrWorker) {
    ocrWorker = await Tesseract.createWorker({
      logger: m => console.log('OCR:', m.status, Math.round(m.progress * 100) + '%')
    })
    await ocrWorker.loadLanguage('deu')
    await ocrWorker.initialize('deu')
  }
  return ocrWorker
}

export const extractTextFromImage = async (imageData, onProgress) => {
  try {
    const worker = await initializeWorker()
    const result = await worker.recognize(imageData)
    return result.data.text
  } catch (error) {
    console.error('OCR error:', error)
    throw new Error('Failed to extract text from image')
  }
}

export const extractTextsFromSlides = async (slides, onProgress) => {
  const results = {}

  for (const slide of slides) {
    if (slide.thumbnail) {
      try {
        const text = await extractTextFromImage(slide.thumbnail)
        results[slide.id] = text
        if (onProgress) {
          onProgress(slides.indexOf(slide) / slides.length)
        }
      } catch (error) {
        console.error(`OCR error for slide ${slide.id}:`, error)
        results[slide.id] = ''
      }
    }
  }

  return results
}

export const terminateOCR = async () => {
  if (ocrWorker) {
    await ocrWorker.terminate()
    ocrWorker = null
  }
}

export const getCacheSize = () => {
  return ocrWorker ? ocrWorker.cacheSize : 0
}
