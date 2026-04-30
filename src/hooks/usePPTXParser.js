import { useState, useCallback } from 'react'
import { parsePPTX } from '../services/pptxService'

export const usePPTXParser = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const parse = useCallback(async (file) => {
    setIsLoading(true)
    setError(null)
    setProgress(0)

    try {
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + Math.random() * 20, 95))
      }, 100)

      const presentation = await parsePPTX(file)

      clearInterval(progressInterval)
      setProgress(100)

      return presentation
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setIsLoading(false)
    setProgress(0)
    setError(null)
  }, [])

  return {
    parse,
    isLoading,
    progress,
    error,
    reset
  }
}
