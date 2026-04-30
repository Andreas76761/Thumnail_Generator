import { VIEW_MODES } from '../utils/constants'
import { useTheme } from '../context/ThemeContext'

export default function Navigation({
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  isFullscreen,
  setIsFullscreen,
  onExport,
  onUpload,
  onSettings,
  onShowKeyboardShortcuts,
  presentations = [],
  syncStatus = 'idle',
  onDeletePresentation
}) {
  const { isDark, toggleTheme } = useTheme()

  const tabs = [
    { id: 'archive', name: 'Archiv', icon: '📚' },
    { id: 'search', name: 'Suche', icon: '🔎' },
    { id: 'bookmarks', name: 'Favoriten', icon: '⭐' },
    { id: 'categories', name: 'Kategorien', icon: '🗂️' },
    { id: 'voice', name: 'Voice Chat', icon: '🎙️' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 shadow-sm z-50 transition-all duration-300" role="navigation" aria-label="Hauptnavigation">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow" role="img" aria-label="Presentation Designer Logo">
              <span className="text-white font-bold text-lg">✨</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Presentation Designer</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Professional Suite</p>
            </div>
          </div>

          {/* Main Tabs */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex gap-2 bg-gray-100 dark:bg-slate-700 p-1 rounded-xl border border-gray-200 dark:border-slate-600" role="tablist">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md border border-blue-300 dark:border-blue-500'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-600'
                  }`}
                  title={tab.name}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-label={tab.name}
                >
                  <span className="hidden sm:inline">{tab.icon} {tab.name}</span>
                  <span className="sm:hidden text-lg" aria-hidden="true">{tab.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* View Modes & Fullscreen */}
            {['archive', 'search'].includes(activeTab) && (
              <>
                {/* View Mode Selector */}
                <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1 hidden sm:flex border border-gray-200 dark:border-slate-600">
                  {VIEW_MODES.map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id)}
                      className={`p-2 rounded transition-all text-lg font-semibold ${
                        viewMode === mode.id
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-300 dark:border-blue-500'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-slate-600'
                      }`}
                      title={mode.name}
                    >
                      {mode.icon}
                    </button>
                  ))}
                </div>

                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className={`p-2 rounded-lg text-lg transition-all font-semibold ${
                    isFullscreen
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border border-blue-300 dark:border-blue-500 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  title={isFullscreen ? 'Beenden' : 'Vollbild'}
                  aria-label={isFullscreen ? 'Vollbild-Modus beenden' : 'Vollbild-Modus aktivieren'}
                  aria-pressed={isFullscreen}
                >
                  <span aria-hidden="true">{isFullscreen ? '🪟' : '⛶'}</span>
                </button>
              </>
            )}

            {/* Notion Sync Status */}
            <button
              onClick={onSettings}
              className={`p-2 rounded-lg text-lg transition-all font-semibold hidden sm:block ${
                syncStatus === 'syncing'
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-500 shadow-sm animate-pulse'
                  : syncStatus === 'success'
                  ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 border border-green-300 dark:border-green-500 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
              title={`Sync: ${syncStatus}`}
              aria-label={`Synchronisationsstatus: ${syncStatus}`}
            >
              <span aria-hidden="true">{syncStatus === 'syncing' ? '⏳' : syncStatus === 'success' ? '✓' : '⚙️'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-lg transition-all font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              title={isDark ? 'Hell' : 'Dunkel'}
              aria-label={isDark ? 'Zum Light Mode wechseln' : 'Zum Dark Mode wechseln'}
              aria-pressed={isDark}
            >
              <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
            </button>

            {/* Upload Button */}
            {onUpload && (
              <button
                onClick={onUpload}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 active:scale-95 hidden sm:inline-flex items-center gap-2"
                title="Hochladen"
              >
                <span>⬆️</span>
                <span>Hochladen</span>
              </button>
            )}

            {/* Delete Presentation Button */}
            {presentations.length > 0 && (
              <button
                onClick={() => {
                  const currentPresentation = presentations[0]
                  if (window.confirm(`Löschen? "${currentPresentation.fileName}" wird unwiederbringlich gelöscht.`)) {
                    onDeletePresentation(currentPresentation.id)
                  }
                }}
                className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-300 rounded-lg transition-all text-lg font-semibold"
                title="Löschen"
                aria-label="Präsentation löschen"
              >
                <span aria-hidden="true">🗑️</span>
              </button>
            )}

            {/* Export Button */}
            {presentations.length > 0 && (
              <button
                onClick={onExport}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-300 rounded-lg transition-all text-lg font-semibold"
                title="Exportieren"
                aria-label="Exportieren"
              >
                <span aria-hidden="true">⬇️</span>
              </button>
            )}

            {/* Keyboard Shortcuts */}
            {onShowKeyboardShortcuts && (
              <button
                onClick={onShowKeyboardShortcuts}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all text-lg font-semibold"
                title="Hilfe"
                aria-label="Tastaturkürzel"
              >
                <span aria-hidden="true">⌨️</span>
              </button>
            )}

            {/* Settings */}
            {onSettings && (
              <button
                onClick={onSettings}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all text-lg font-semibold"
                title="Einstellungen"
                aria-label="Einstellungen öffnen"
              >
                <span aria-hidden="true">⚙️</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
