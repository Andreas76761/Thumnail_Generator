export default function KeyboardShortcutsDialog({ isOpen, onClose }) {
  if (!isOpen) return null

  const shortcuts = [
    {
      key: 'Space / →',
      description: 'Nächste Slide',
      context: 'Überall'
    },
    {
      key: '←',
      description: 'Vorherige Slide',
      context: 'Slideshow Mode'
    },
    {
      key: 'S',
      description: 'Suche öffnen',
      context: 'Überall'
    },
    {
      key: 'B',
      description: 'Bookmark-Status toggen',
      context: 'Archive View'
    },
    {
      key: 'F',
      description: 'Fullscreen-Modus toggeln',
      context: 'Archive/Search'
    },
    {
      key: '?',
      description: 'Diese Übersicht anzeigen',
      context: 'Überall'
    },
    {
      key: 'ESC',
      description: 'Dialog schließen / Slideshow beenden',
      context: 'Überall'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">⌨️ Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-2">💡 Tipp</p>
            <p className="text-sm text-blue-800">
              Keyboard Shortcuts funktionieren nicht bei aktiven Eingabefeldern (Suche, Tag-Editor).
              Drücke ESC um Dialogs zu schließen.
            </p>
          </div>

          {/* Shortcuts Table */}
          <div className="space-y-3">
            {shortcuts.map((shortcut, idx) => (
              <div key={idx} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0">
                  <kbd className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm font-mono font-medium text-sm text-gray-900">
                    {shortcut.key}
                  </kbd>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{shortcut.description}</p>
                  <p className="text-xs text-gray-600 mt-1">{shortcut.context}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tips Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">📌 Tips & Tricks</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Nutze <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">F</kbd> um in Fullscreen/Slideshow-Modus zu gehen</li>
              <li>✓ Nutze <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">S</kbd> um schnell Slides zu suchen</li>
              <li>✓ Nutze <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">B</kbd> um Slides zu bookmarken</li>
              <li>✓ Drücke <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">?</kbd> jederzeit um diese Übersicht zu öffnen</li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-8 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  )
}
