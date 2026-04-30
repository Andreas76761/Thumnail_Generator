import { useState, useEffect, useRef } from 'react'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { generateResponse } from '../../services/llmService'
import ChatMessage from './ChatMessage'

const LLM_MODELS = [
  { id: 'claude', name: 'Claude (Anthropic)', icon: '🤖' },
  { id: 'gpt4', name: 'GPT-4 (OpenAI)', icon: '🟢' },
  { id: 'gemini', name: 'Gemini (Google)', icon: '✨' },
  { id: 'llama', name: 'Llama (Meta)', icon: '🦙' }
]

export default function VoiceChatTab({ presentations = [], onCreateSlide, chatHistory = [], setChatHistory = () => {} }) {
  const [messages, setMessages] = useState([])
  const [selectedModel, setSelectedModel] = useState('claude')
  const [isProcessing, setIsProcessing] = useState(false)
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef(null)

  const currentPresentation = presentations.length > 0 ? presentations[0] : null

  const {
    isListening,
    transcript,
    interimTranscript,
    isSpeaking,
    isSupported,
    startListening,
    stopListening,
    speak,
    clearTranscript
  } = useSpeechRecognition()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const createSlideFromVoice = async (text) => {
    if (!currentPresentation) return

    const createSlidePrompt = `Extract slide information from this voice command: "${text}"
Return a JSON object with this format:
{
  "title": "slide title",
  "texts": ["point 1", "point 2", "point 3"],
  "tags": ["tag1", "tag2"]
}
Only return valid JSON, no other text.`

    try {
      const response = await generateResponse(createSlidePrompt, selectedModel)
      const slideData = JSON.parse(response)

      const newSlide = {
        id: Date.now(),
        title: slideData.title || 'Neue Folie',
        texts: slideData.texts || [],
        tags: slideData.tags || ['Neu'],
        category: null,
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22%3E%3Crect fill=%22%234f46e5%22 width=%22800%22 height=%22600%22/%3E%3Ctext x=%22400%22 y=%22300%22 font-size=%2248%22 fill=%22white%22 text-anchor=%22middle%22%3E' + slideData.title + '%3C/text%3E%3C/svg%3E'
      }

      const updatedPresentation = {
        ...currentPresentation,
        slides: [...currentPresentation.slides, newSlide]
      }

      onCreateSlide(updatedPresentation)

      return `✅ Neue Folie erstellt: "${slideData.title}"`
    } catch (error) {
      console.error('Error creating slide:', error)
      return `❌ Fehler beim Erstellen der Folie: ${error.message}`
    }
  }

  const handleSendMessage = async (text) => {
    if (!text.trim()) return

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsProcessing(true)

    try {
      const shouldCreateSlide = /create|erstelle|neue folie|new slide/i.test(text)

      let assistantContent = ''

      if (shouldCreateSlide && currentPresentation) {
        assistantContent = await createSlideFromVoice(text)
      } else {
        const systemPrompt = currentPresentation
          ? `Du bist ein Präsentations-Assistent. Der Benutzer arbeitet mit dieser Präsentation: ${currentPresentation.fileName}. Die Präsentation hat ${currentPresentation.slides.length} Folien. Antworte kurz und hilfreich. Der Benutzer kann dich auch bitten, neue Folien zu erstellen.`
          : 'Du bist ein hilfreicher KI-Assistent. Antworte kurz und prägnant.'

        assistantContent = await generateResponse(
          `${systemPrompt}\n\nBenutzerfrage: ${text}`,
          selectedModel
        )
      }

      const assistantMessage = {
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])

      if (!isSpeaking) {
        speak(assistantContent)
      }
    } catch (error) {
      console.error('Error generating response:', error)
      const errorMessage = {
        role: 'assistant',
        content: `Fehler: ${error.message}`,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStopListening = () => {
    stopListening()
    if (transcript || interimTranscript) {
      const fullText = transcript + interimTranscript
      handleSendMessage(fullText)
      clearTranscript()
    }
  }

  if (!isSupported) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            Spracherkennungsfunktion wird von Ihrem Browser nicht unterstützt.
            Bitte verwenden Sie Chrome, Edge oder Safari.
          </p>
        </div>
      </div>
    )
  }

  if (!currentPresentation) {
    return (
      <div className="max-w-4xl mx-auto p-6 pt-12 min-h-screen flex items-center justify-center">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200 p-12 text-center max-w-md">
          <p className="text-5xl mb-4">🎤</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Voice Chat nicht verfügbar</h3>
          <p className="text-gray-600 mb-6">Laden Sie zunächst eine PowerPoint-Datei hoch, um mit Voice Chat zu starten.</p>
          <p className="text-sm text-gray-500">💡 Mit Voice Chat können Sie Ihre Präsentation mit KI-Modellen besprechen</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fadeIn">
      {/* Model Selector */}
      <div className="mb-8 flex gap-3 flex-wrap">
        {LLM_MODELS.map(model => (
          <button
            key={model.id}
            onClick={() => setSelectedModel(model.id)}
            className={`px-5 py-3 rounded-lg transition-all font-medium text-sm border ${
              selectedModel === model.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            {model.icon} {model.name}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 h-96 overflow-y-auto mb-5">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl mb-3">💬</p>
              <p className="text-gray-600 font-medium mb-2">
                Starten Sie eine Konversation mit
              </p>
              <p className="text-blue-600 font-semibold mb-4">
                {LLM_MODELS.find(m => m.id === selectedModel)?.name}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 text-left">
                <p className="font-semibold mb-2">💡 Beispiele:</p>
                <ul className="space-y-1">
                  <li>• 🎤 "Erkläre die erste Folie"</li>
                  <li>• 🎤 "Erstelle eine neue Folie über KI-Trends"</li>
                  <li>• 🎤 "Was sind die Hauptpunkte dieser Präsentation?"</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Transcription Display */}
      {(transcript || interimTranscript) && (
        <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-gray-700 font-medium">
            <span className="font-semibold text-blue-700">🎙️ Transkription:</span>
            <span className="text-gray-900 ml-2">{transcript}</span>
            {interimTranscript && <span className="italic text-gray-600 ml-1">{interimTranscript}</span>}
          </p>
        </div>
      )}

      {/* Voice Controls */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-5 rounded-xl border border-gray-100 mb-5">
        <div className="flex gap-3 mb-4">
          <button
            onClick={isListening ? handleStopListening : startListening}
            disabled={isProcessing}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-white border-0 shadow-md ${
              isListening
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <>
                <span className="animate-pulse">🎤</span> Aufnahme wird beendet
              </>
            ) : (
              <>
                🎤 Aufnahme starten
              </>
            )}
          </button>
          {isSpeaking && (
            <button
              onClick={() => window.speechSynthesis.cancel()}
              className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all font-medium shadow-md"
            >
              ⏹️ Stopp
            </button>
          )}
        </div>

        {/* Text Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(inputText)
              }
            }}
            placeholder="Oder geben Sie eine Nachricht ein..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
          />
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={isProcessing || !inputText.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            📤 Senden
          </button>
        </div>
      </div>

      {/* Status Info */}
      <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          {isProcessing && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">⏳ Antwort wird generiert...</span>}
          {isSpeaking && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">🔊 Audio wird wiedergegeben...</span>}
          <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium">💬 {messages.length} Nachricht{messages.length !== 1 ? 'en' : ''}</span>
          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">🤖 {LLM_MODELS.find(m => m.id === selectedModel)?.name}</span>
        </div>
      </div>
    </div>
  )
}
