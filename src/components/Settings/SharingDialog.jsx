import { useState } from 'react'

export default function SharingDialog({ databaseConfig, presentations, onClose, onBackToSettings }) {
  const [copySuccess, setCopySuccess] = useState(false)

  const notionDbUrl = databaseConfig?.notionDatabaseId
    ? `https://notion.so/${databaseConfig.notionDatabaseId.replace(/-/g, '')}`
    : null

  const handleCopyLink = () => {
    if (notionDbUrl) {
      navigator.clipboard.writeText(notionDbUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const totalSlides = presentations.reduce((sum, p) => sum + p.slides.length, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-gray-100">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">👥 Team-Sharing</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors"
            >
              ✕
            </button>
          </div>

          {!databaseConfig?.notionDatabaseId ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
              <p className="text-yellow-800 font-medium">
                ⚠️ Notion Database nicht konfiguriert
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Richte zuerst Notion in den Einstellungen ein um Team-Sharing zu aktivieren.
              </p>
            </div>
          ) : (
            <>
              {/* Info Box */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-3">💡 So funktioniert Team-Sharing:</p>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>✅ Deine Präsentationen werden in Notion synchronisiert</li>
                  <li>✅ Team-Members können die gemeinsame Database öffnen</li>
                  <li>✅ Alle Änderungen werden automatisch synchronisiert</li>
                  <li>✅ Offline-Änderungen synchen automatisch bei Verbindung</li>
                </ul>
              </div>

              {/* Share Link Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Notion Database Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={notionDbUrl}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-700 overflow-x-auto"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                      copySuccess
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copySuccess ? '✅ Kopiert' : '📋 Kopieren'}
                  </button>
                </div>
              </div>

              {/* Share Instructions */}
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-3">📤 Zum Teilen:</p>
                <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                  <li>Klick "Kopieren" um den Link zu kopieren</li>
                  <li>Teile den Link mit deinem Team</li>
                  <li>Team-Members öffnen den Link in Notion</li>
                  <li>Sie können die Slides sehen und Zugriff anfordern</li>
                </ol>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{presentations.length}</p>
                  <p className="text-xs text-gray-600 font-medium">Präsentationen</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{totalSlides}</p>
                  <p className="text-xs text-gray-600 font-medium">Folien gesamt</p>
                </div>
              </div>

              {/* Notion Permissions Info */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-6">
                <p className="text-sm font-semibold text-purple-900 mb-2">🔒 Berechtigungen in Notion:</p>
                <p className="text-xs text-purple-800">
                  Gehe in deiner Notion Database auf "Share" → "Invite" um Team-Members hinzuzufügen.
                  Du kannst granulare Berechtigungen vergeben (Viewer, Commenter, Editor).
                </p>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onBackToSettings && (
              <button
                onClick={onBackToSettings}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
              >
                ← Zurück
              </button>
            )}
            <button
              onClick={onClose}
              className={`${onBackToSettings ? 'flex-1' : 'w-full'} px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium`}
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
