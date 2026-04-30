import { useState } from 'react'
import { syncQueue } from '../../services/databaseService'

export default function NotionSettingsDialog({ databaseConfig, onConfigUpdate, syncStatus = 'idle', onClose, onOpenSharing }) {
  const [apiKey, setApiKey] = useState(databaseConfig?.notionToken || '')
  const [databaseId, setDatabaseId] = useState(databaseConfig?.notionDatabaseId || '')
  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [showApiKey, setShowApiKey] = useState(false)

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return databaseConfig?.notionToken ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return '🟡 Synchronisiert...'
      case 'success':
        return '🟢 Verbunden'
      case 'error':
        return '🔴 Fehler'
      default:
        return databaseConfig?.notionToken ? '🟢 Verbunden' : '⚠️ Nicht konfiguriert'
    }
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)
    setTestResult(null)

    try {
      const response = await fetch(
        `https://api.notion.com/v1/databases/${databaseId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Notion-Version': '2022-06-28'
          }
        }
      )

      if (response.ok) {
        setTestResult({ success: true, message: '✅ Verbindung erfolgreich!' })
      } else {
        const error = await response.json()
        setTestResult({ success: false, message: `❌ Fehler: ${error.message || 'Unbekannter Fehler'}` })
      }
    } catch (error) {
      setTestResult({ success: false, message: `❌ Fehler: ${error.message}` })
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSaveAndSync = async () => {
    const newConfig = {
      type: 'notion',
      notionToken: apiKey,
      notionDatabaseId: databaseId
    }

    onConfigUpdate(newConfig)

    // Trigger sync
    syncQueue.add({
      type: 'sync',
      data: { apiKey, databaseId }
    })

    await syncQueue.process()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🗄️ Notion Integration</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Status Badge */}
          <div className={`mb-6 p-3 border rounded-lg text-sm font-medium text-center ${getStatusColor()}`}>
            {getStatusText()}
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
              testResult.success
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {testResult.message}
            </div>
          )}

          {/* API Key Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Notion API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="secret_..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-mono text-sm"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-3 text-gray-600 hover:text-gray-900 text-lg"
                title={showApiKey ? 'Hide' : 'Show'}
              >
                {showApiKey ? '👁️' : '🙈'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Hol es unter: <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">notion.so/my-integrations</a>
            </p>
          </div>

          {/* Database ID Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Notion Database ID</label>
            <input
              type="text"
              value={databaseId}
              onChange={(e) => setDatabaseId(e.target.value)}
              placeholder="12345678901234567890123456789012"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Kopiere die ID aus der Notion Database URL: notion.so/...?v=<span className="bg-gray-100 px-1">database-id</span>
            </p>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-2">💡 Info</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Slides werden automatisch mit Notion synchronisiert</li>
              <li>• Offline-Änderungen werden bei Verbindung synchronisiert</li>
              <li>• Team-Members können Zugriff auf die gemeinsame Database haben</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleTestConnection}
              disabled={!apiKey || !databaseId || testingConnection}
              className="flex-1 min-w-max px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testingConnection ? '⏳ Testet...' : '🔗 Test'}
            </button>
            <button
              onClick={handleSaveAndSync}
              disabled={!apiKey || !databaseId || syncStatus === 'syncing'}
              className="flex-1 min-w-max px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {syncStatus === 'syncing' ? '⏳ Sync...' : '💾 Speichern & Sync'}
            </button>
          </div>

          {/* Team Sharing Button */}
          {databaseConfig?.notionToken && databaseConfig?.notionDatabaseId && (
            <button
              onClick={onOpenSharing}
              className="w-full mt-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all font-medium"
            >
              👥 Team-Sharing konfigurieren
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  )
}
