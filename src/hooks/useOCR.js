import { useState, useCallback } from 'react'
import { extractTextFromImage } from '../services/ocrService'

export const useOCR = () => {
  const [extracting, setExtracting] = useState(false)
  const [ocrTexts, setOcrTexts] = useState({})
  const [error, setError] = useState(null)

  const extractText = useCallback(async (slideId, imageData) => {
    if (ocrTexts[slideId]) {
      return ocrTexts[slideId]
    }

    setExtracting(true)
    setError(null)

    try {
      const text = await extractTextFromImage(imageData)
      setOcrTexts(prev => ({
        ...prev,
        [slideId]: text
      }))
      return text
    } catch (err) {
      setError(err.message)
      console.error('OCR extraction error:', err)
      throw err
    } finally {
      setExtracting(false)
    }
  }, [ocrTexts])

  const extractTextsForSlides = useCallback(async (slides) => {
    setExtracting(true)
    setError(null)
    const results = { ...ocrTexts }

    try {
      for (const slide of slides) {
        if (!results[slide.id] && slide.thumbnail) {
          const text = await extractTextFromImage(slide.thumbnail)
          results[slide.id] = text
        }
      }
      setOcrTexts(results)
      return results
    } catch (err) {
      setError(err.message)
      console.error('OCR batch extraction error:', err)
      throw err
    } finally {
      setExtracting(false)
    }
  }, [ocrTexts])

  const clearOCRText = useCallback((slideId) => {
    setOcrTexts(prev => {
      const updated = { ...prev }
      delete updated[slideId]
      return updated
    })
  }, [])

  const clearAllOCR = useCallback(() => {
    setOcrTexts({})
  }, [])

  return {
    extractText,
    extractTextsForSlides,
    clearOCRText,
    clearAllOCR,
    ocrTexts,
    extracting,
    error
  }
}
