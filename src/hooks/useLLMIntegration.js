import { useState, useCallback } from 'react'
import { generateResponse, generateSummary, generateTags } from '../services/llmService'

export const useLLMIntegration = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastResponse, setLastResponse] = useState(null)

  const generateText = useCallback(async (prompt, model = 'claude') => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await generateResponse(prompt, model)
      setLastResponse(response)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generatePresentationSummary = useCallback(async (slides, model = 'claude') => {
    setIsLoading(true)
    setError(null)
    try {
      const summary = await generateSummary(slides, model)
      setLastResponse(summary)
      return summary
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateSlideTags = useCallback(async (text, model = 'claude') => {
    setIsLoading(true)
    setError(null)
    try {
      const tags = await generateTags(text, model)
      return tags
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    lastResponse,
    generateText,
    generatePresentationSummary,
    generateSlideTags
  }
}
