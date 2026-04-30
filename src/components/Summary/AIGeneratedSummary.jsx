import { useState } from 'react'
import toast from 'react-hot-toast'
import { generateDetailedSummary } from '../../services/llmService'

export default function AIGeneratedSummary({ presentations, summary, onNavigateToSlide }) {
  if (!summary) return null

  const [onePageSummary, setOnePageSummary] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const allSlides = presentations.flatMap(p => p.slides)
  const totalSlides = allSlides.length
  const currentPresentation = presentations[presentations.length - 1]

  // Generate one-page summary (max 400-500 words)
  const generateOnePageSummary = async () => {
    try {
      setIsGenerating(true)
      toast.loading('📄 Generiere 1-Seiten Zusammenfassung...')

      const prompt = `Erstelle eine SEHR KURZE und KONZISE Zusammenfassung (maximal 400 Wörter - eine DIN A4 Seite) der folgenden Präsentation:

Titel: ${summary.title}
Datei: ${currentPresentation?.fileName}

Hauptpunkte:
${summary.keyPoints?.slice(0, 5).map(p => `- ${p.point}`).join('\n')}

WICHTIG:
- Maximal 400 Wörter
- Nur die WICHTIGSTEN Informationen
- Kurz, knapp und prägnant
- Perfekt für eine A4-Seite
- Keine unnötigen Details

Schreibe die Zusammenfassung:"`

      const summaryText = await generateDetailedSummary(
        allSlides,
        currentPresentation?.fileName,
        'claude',
        prompt
      )

      setOnePageSummary(summaryText)
      toast.success('✅ 1-Seiten Zusammenfassung erstellt!')
    } catch (error) {
      console.error('Error generating one-page summary:', error)
      toast.error('❌ Fehler beim Generieren der Zusammenfassung')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border-2 border-purple-200 dark:border-purple-700 rounded-xl shadow-sm">
      <div className="flex items-start gap-4">
        <span className="text-3xl flex-shrink-0">✨</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">KI-Zusammenfassung</h2>
            <span className="text-xs bg-purple-600 dark:bg-purple-500 text-white px-3 py-1 rounded-full font-semibold">
              Automatisch generiert
            </span>
            <button
              onClick={generateOnePageSummary}
              disabled={isGenerating}
              className="ml-auto px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
              title="Generiere eine 1-Seiten Zusammenfassung"
            >
              <span>{isGenerating ? '⏳' : '📄'}</span>
              <span>{isGenerating ? 'Wird erstellt...' : '1-Seiten Summary'}</span>
            </button>
          </div>

          <div className="bg-white rounded-lg p-5 mb-4">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{summary.title || 'Präsentation'}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  📄 <span className="font-medium">{currentPresentation?.fileName}</span>
                </p>
              </div>
              {onNavigateToSlide && (
                <button
                  onClick={() => onNavigateToSlide('toc-slide')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium whitespace-nowrap"
                  title="Zum Inhaltsverzeichnis springen"
                >
                  📑 Zum Verzeichnis
                </button>
              )}
            </div>

            <div className="space-y-3 mb-4">
              <p className="text-gray-700 font-medium">
                📊 Übersicht: <span className="text-blue-700">{totalSlides} Slides</span> in dieser Präsentation
              </p>
              {summary.keyPoints && summary.keyPoints.length > 0 && (
                <div>
                  <p className="text-gray-700 font-medium mb-2">🎯 Hauptpunkte:</p>
                  <ul className="space-y-2 ml-4">
                    {summary.keyPoints.slice(0, 5).map((point, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-blue-600 font-bold">{idx + 1}.</span>
                        <span className="text-gray-700">{point.point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>💡 Hinweis:</strong> Diese Zusammenfassung wurde von Claude AI generiert und analysiert die Inhalte aller Slides.
              </p>
            </div>

            {/* 1-Seiten Zusammenfassung Display */}
            {onePageSummary && (
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📄</span>
                  <h3 className="text-lg font-bold text-green-800 dark:text-green-300">1-Seiten Zusammenfassung</h3>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-green-100 dark:border-green-800">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-sm">
                    {onePageSummary}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    ✓ Optimiert für eine DIN A4 Seite • Circa {Math.ceil(onePageSummary.split(/\s+/).length)} Wörter
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(onePageSummary)
                    toast.success('✅ In Zwischenablage kopiert!')
                  }}
                  className="mt-4 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all text-sm font-medium"
                >
                  📋 In Zwischenablage kopieren
                </button>
              </div>
            )}
          </div>

          {/* Inhaltsverzeichnis mit Links */}
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">📑 Inhaltsverzeichnis (First 8):</p>
            <div className="space-y-2 text-sm">
              {allSlides.slice(0, 8).map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateToSlide && onNavigateToSlide(slide.id)}
                  className="w-full flex items-center gap-2 text-gray-600 hover:bg-blue-50 p-2 rounded-lg transition-colors text-left"
                  title={`Zu ${slide.title} navigieren`}
                >
                  <span className="font-semibold text-gray-400 w-6">{idx + 1}.</span>
                  <span className="flex-1 truncate hover:text-blue-600">{slide.title || slide.texts[0] || `Slide ${idx + 1}`}</span>
                  <span className="text-gray-400">→</span>
                </button>
              ))}
              {allSlides.length > 8 && (
                <div className="text-gray-500 italic p-2">... und {allSlides.length - 8} weitere</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
