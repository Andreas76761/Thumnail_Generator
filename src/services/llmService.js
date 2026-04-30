const cache = new Map()

export const generateResponse = async (prompt, model = 'claude') => {
  const cacheKey = `${prompt}-${model}`
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  try {
    let response
    switch (model) {
      case 'claude':
        response = await generateClaude(prompt)
        break
      case 'gpt4':
        response = await generateGPT4(prompt)
        break
      case 'gemini':
        response = await generateGemini(prompt)
        break
      case 'llama':
        response = await generateLlama(prompt)
        break
      default:
        response = await generateClaude(prompt)
    }

    cache.set(cacheKey, response)
    return response
  } catch (error) {
    console.error(`LLM error (${model}):`, error)
    throw new Error(`Failed to generate response from ${model}: ${error.message}`)
  }
}

const generateClaude = async (prompt) => {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY
  if (!apiKey) {
    return 'Claude API not configured. Check your API key in .env.local'
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error?.message || 'Claude API error')

  return data.content[0].text
}

const generateGPT4 = async (prompt) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    return 'GPT-4 API not configured. Check your API key in .env.local'
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024
    })
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error?.message || 'GPT-4 error')

  return data.choices[0].message.content
}

const generateGemini = async (prompt) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    return 'Gemini API not configured. Check your API key in .env.local'
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  )

  const data = await response.json()
  if (!response.ok) throw new Error(data.error?.message || 'Gemini error')

  return data.candidates[0].content.parts[0].text
}

const generateLlama = async (prompt) => {
  // Placeholder for Llama integration
  return `Llama response (not yet implemented): "${prompt.substring(0, 50)}..."`
}

// Generate Summary
export const generateSummary = async (slides, model = 'claude') => {
  const slideTitles = slides.map(s => s.title).join(', ')
  const prompt = `Erstelle eine kurze 2-Punkt Zusammenfassung dieser Präsentation:
Slides: ${slideTitles}

Format:
## Überblick
[1-2 Sätze]

## Hauptpunkte
- Punkt 1
- Punkt 2
- Punkt 3
- Punkt 4
- Punkt 5`

  return generateResponse(prompt, model)
}

// Generate Detailed Summary with Key Points
export const generateDetailedSummary = async (slides, fileName, model = 'claude') => {
  const slideContent = slides.slice(0, 10).map(s => `${s.title}: ${s.texts.slice(0, 3).join('. ')}`).join('\n')

  const prompt = `Analysiere diese Präsentation und erstelle eine detaillierte Zusammenfassung im JSON Format.

Dateiname: ${fileName}
Folien (erste 10):
${slideContent}

Antworte nur mit JSON (keine zusätzlichen Erklärungen):
{
  "title": "Präsentationstitel (max 60 Zeichen)",
  "keyPoints": [
    {"point": "Hauptpunkt 1"},
    {"point": "Hauptpunkt 2"},
    {"point": "Hauptpunkt 3"},
    {"point": "Hauptpunkt 4"},
    {"point": "Hauptpunkt 5"}
  ]
}`

  try {
    const response = await generateResponse(prompt, model)
    return JSON.parse(response)
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      title: fileName.replace('.pptx', '').substring(0, 60),
      keyPoints: [
        { point: 'Präsentation mit ' + slides.length + ' Folien' },
        { point: 'Automatisch analysiert' }
      ]
    }
  }
}

// Generate Tags
export const generateTags = async (text, model = 'claude') => {
  const prompt = `Generiere 5 prägnante Tags für diese Slide:
"${text.substring(0, 200)}"

Format: comma-separated list`

  const response = await generateResponse(prompt, model)
  return response.split(',').map(t => t.trim()).slice(0, 5)
}

// Design Description
export const generateDesignDescription = async (slide, designType, model = 'claude') => {
  const prompt = `Beschreibe kurz wie diese Slide mit "${designType}" Design aussieht:
Titel: ${slide.title}
Inhalte: ${slide.texts.join(', ')}`

  return generateResponse(prompt, model)
}

// Clear cache
export const clearCache = () => {
  cache.clear()
}

// Get cache size
export const getCacheSize = () => {
  return cache.size
}
