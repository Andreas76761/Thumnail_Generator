import { useState, useEffect, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import Navigation from './components/Navigation'
import UploadArea from './components/UploadArea'
import ArchiveTab from './components/Archive/ArchiveTab'
import SearchTab from './components/Archive/SearchTab'
import CategoriesTab from './components/Archive/CategoriesTab'
import BookmarksTab from './components/Archive/BookmarksTab'
import VoiceChatTab from './components/VoiceChat/VoiceChatTab'
import ExportDialog from './components/ExportDialog'
import AIGeneratedSummary from './components/Summary/AIGeneratedSummary'
import SlideshowMode from './components/SlideShowMode/SlideshowMode'
import NotionSettingsDialog from './components/Settings/NotionSettingsDialog'
import SharingDialog from './components/Settings/SharingDialog'
import KeyboardShortcutsDialog from './components/Help/KeyboardShortcutsDialog'
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay'
import SlideDetailModal from './components/SlideDetailModal/SlideDetailModal'
import { generateDetailedSummary } from './services/llmService'
import { enhancePresentation } from './services/slideGenerator'
import { syncQueue } from './services/databaseService'
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts'

export default function App() {
  const [presentations, setPresentations] = useState([])
  const [activeTab, setActiveTab] = useState('archive')
  const [viewMode, setViewMode] = useState('gallery')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [bookmarkedSlides, setBookmarkedSlides] = useState(new Set())
  const [slideCategories, setSlideCategories] = useState({})
  const [customCategories, setCustomCategories] = useState(['Wichtig', 'Überarbeiten', 'Archiv'])
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedSlide, setSelectedSlide] = useState(null)
  const [ocrTexts, setOcrTexts] = useState({})
  const [aiSummary, setAiSummary] = useState(null)
  const [showDesignDialog, setShowDesignDialog] = useState(false)
  const [selectedDesignSlide, setSelectedDesignSlide] = useState(null)
  const [generatedDesigns, setGeneratedDesigns] = useState({})
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [recognition, setRecognition] = useState(null)
  const [selectedLLM, setSelectedLLM] = useState('claude')
  const [databaseConfig, setDatabaseConfig] = useState({
    type: 'localstorage',
    notionToken: null,
    notionDatabaseId: null
  })
  const [appliedDesigns, setAppliedDesigns] = useState({})
  const [designHistory, setDesignHistory] = useState({})
  const [settingsPanel, setSettingsPanel] = useState(null) // 'notion' | 'sharing' | null
  const [syncStatus, setSyncStatus] = useState('idle')
  const [customTags, setCustomTags] = useState([])
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [detailSlide, setDetailSlide] = useState(null) // For detail modal
  const [detailPresentation, setDetailPresentation] = useState(null) // For detail modal

  const fileInputRef = useRef(null)

  // Handle slide double-click to show detail view
  const handleSlideDoubleClick = (slide, presentation) => {
    setDetailSlide(slide)
    setDetailPresentation(presentation)
  }

  // Load data asynchronously after render (non-blocking)
  useEffect(() => {
    // Use requestIdleCallback if available, otherwise use setTimeout
    const loadDataAsync = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          loadPresentationsFromStorage()
          loadBookmarksFromStorage()
          loadCategoriesFromStorage()
          loadDesignsFromStorage()
          loadCustomTagsFromStorage()
        }, { timeout: 2000 })
      } else {
        setTimeout(() => {
          loadPresentationsFromStorage()
          loadBookmarksFromStorage()
          loadCategoriesFromStorage()
          loadDesignsFromStorage()
          loadCustomTagsFromStorage()
        }, 100)
      }
    }

    loadDataAsync()
  }, [])

  const loadCustomTagsFromStorage = () => {
    try {
      const stored = localStorage.getItem('pd_customTags')
      if (stored) {
        setCustomTags(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Error loading custom tags:', err)
    }
  }

  const saveCustomTagsToStorage = (tags) => {
    localStorage.setItem('pd_customTags', JSON.stringify(tags))
    setCustomTags(tags)
  }

  const handleAddCustomTag = (tagName) => {
    if (tagName && !customTags.includes(tagName)) {
      const updated = [...customTags, tagName]
      saveCustomTagsToStorage(updated)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (syncQueue.isProcessing) {
        setSyncStatus('syncing')
      } else if (syncQueue.queue.length > 0) {
        setSyncStatus('success')
      } else {
        setSyncStatus('idle')
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // Initialize keyboard shortcuts directly (must be called at top level)
  useGlobalKeyboardShortcuts({
    onNext: () => {
      if (isFullscreen) {
        // Handled by SlideshowMode component
      }
    },
    onPrev: () => {
      if (isFullscreen) {
        // Handled by SlideshowMode component
      }
    },
    onSearch: () => setActiveTab('search'),
    onFullscreen: () => setIsFullscreen(!isFullscreen),
    onHelp: () => setShowShortcutsDialog(true),
    onEscape: () => {
      if (showShortcutsDialog) {
        setShowShortcutsDialog(false)
      } else if (settingsPanel) {
        setSettingsPanel(null)
      } else if (isFullscreen) {
        setIsFullscreen(false)
      }
    }
  })

  const loadDesignsFromStorage = () => {
    try {
      const stored = localStorage.getItem('pd_appliedDesigns')
      if (stored) {
        setAppliedDesigns(JSON.parse(stored))
      }
      const history = localStorage.getItem('pd_designHistory')
      if (history) {
        setDesignHistory(JSON.parse(history))
      }
    } catch (err) {
      console.error('Error loading designs:', err)
    }
  }

  const saveDesignToStorage = (presentationId, slideId, designType) => {
    const key = `${presentationId}-${slideId}`
    const newDesigns = { ...appliedDesigns, [key]: designType }
    const newHistory = {
      ...designHistory,
      [key]: (designHistory[key] || []).concat({
        design: designType,
        appliedAt: new Date().toISOString()
      })
    }
    setAppliedDesigns(newDesigns)
    setDesignHistory(newHistory)
    localStorage.setItem('pd_appliedDesigns', JSON.stringify(newDesigns))
    localStorage.setItem('pd_designHistory', JSON.stringify(newHistory))
  }

  const loadPresentationsFromStorage = () => {
    const stored = localStorage.getItem('pd_presentations')
    if (stored) {
      try {
        setPresentations(JSON.parse(stored))
      } catch (err) {
        console.error('Error loading presentations:', err)
      }
    }
  }

  const loadBookmarksFromStorage = () => {
    const stored = localStorage.getItem('pd_bookmarks')
    if (stored) {
      try {
        setBookmarkedSlides(new Set(JSON.parse(stored)))
      } catch (err) {
        console.error('Error loading bookmarks:', err)
      }
    }
  }

  const loadCategoriesFromStorage = () => {
    const stored = localStorage.getItem('pd_slideCategories')
    if (stored) {
      try {
        setSlideCategories(JSON.parse(stored))
      } catch (err) {
        console.error('Error loading categories:', err)
      }
    }

    const customStored = localStorage.getItem('pd_customCategories')
    if (customStored) {
      try {
        setCustomCategories(JSON.parse(customStored))
      } catch (err) {
        console.error('Error loading custom categories:', err)
      }
    }
  }

  const savePresentationsToStorage = (data) => {
    localStorage.setItem('pd_presentations', JSON.stringify(data))
    setPresentations(data)
  }

  const handleUpload = async (newPresentation) => {
    let enhancedPresentation = newPresentation
    toast.loading('📤 Präsentation wird hochgeladen...')

    // Generate summary for the new presentation
    try {
      setIsGeneratingSummary(true)
      setLoadingMessage('Erstelle Zusammenfassung... 📝')

      const summary = await generateDetailedSummary(
        newPresentation.slides,
        newPresentation.fileName,
        selectedLLM
      )
      setAiSummary(summary)

      // Enhance presentation with TOC and Summary slides
      enhancedPresentation = enhancePresentation(newPresentation, summary)
      toast.success(`✅ Präsentation "${newPresentation.fileName}" erfolgreich hochgeladen!`)
    } catch (error) {
      console.error('Error generating summary:', error)
      // Still enhance with TOC even if summary generation fails
      enhancedPresentation = enhancePresentation(newPresentation, null)
      toast.error(`⚠️ Zusammenfassung konnte nicht generiert werden, aber Präsentation wurde hochgeladen`)
    } finally {
      setIsGeneratingSummary(false)
      setLoadingMessage('')
    }

    const updated = [...presentations, enhancedPresentation]
    savePresentationsToStorage(updated)

    // Switch to Archive tab to show the uploaded presentation
    setActiveTab('archive')

    // Trigger Notion sync
    triggerSync({ action: 'upload', presentationId: enhancedPresentation.id })
  }

  const handleDeletePresentation = (id) => {
    const updated = presentations.filter(p => p.id !== id)
    savePresentationsToStorage(updated)
  }

  const handleUpdateSlide = (presentationId, slideId, updates) => {
    const updated = presentations.map(p => {
      if (p.id === presentationId) {
        return {
          ...p,
          slides: p.slides.map(s =>
            s.id === slideId ? { ...s, ...updates } : s
          )
        }
      }
      return p
    })
    savePresentationsToStorage(updated)
  }

  const handleToggleBookmark = (presentationId, slideId) => {
    const key = `${presentationId}-${slideId}`
    const newBookmarks = new Set(bookmarkedSlides)
    if (newBookmarks.has(key)) {
      newBookmarks.delete(key)
      toast.success('🔖 Lesezeichen entfernt')
    } else {
      newBookmarks.add(key)
      toast.success('🔖 Lesezeichen hinzugefügt')
    }
    setBookmarkedSlides(newBookmarks)
    localStorage.setItem('pd_bookmarks', JSON.stringify(Array.from(newBookmarks)))
    triggerSync({ action: 'bookmark', slideKey: key })
  }

  const handleUpdateCategory = (presentationId, slideId, category) => {
    const key = `${presentationId}-${slideId}`
    const newCategories = { ...slideCategories }
    if (category) {
      newCategories[key] = category
    } else {
      delete newCategories[key]
    }
    setSlideCategories(newCategories)
    localStorage.setItem('pd_slideCategories', JSON.stringify(newCategories))
  }

  const handleAddCategory = (categoryName) => {
    const newCategories = [...customCategories, categoryName]
    setCustomCategories(newCategories)
    localStorage.setItem('pd_customCategories', JSON.stringify(newCategories))
    toast.success(`📂 Kategorie "${categoryName}" hinzugefügt`)
  }

  const handleApplyDesign = (slide, designType) => {
    // Find the presentation containing this slide
    const presentation = presentations.find(p => p.slides.some(s => s.id === slide.id))
    if (presentation) {
      saveDesignToStorage(presentation.id, slide.id, designType)
      toast.success(`🎨 Design "${designType}" angewendet`)
    }
  }

  const handleNotionConfigUpdate = (newConfig) => {
    setDatabaseConfig(newConfig)
    localStorage.setItem('pd_databaseConfig', JSON.stringify(newConfig))
  }

  const triggerSync = (data = {}) => {
    if (databaseConfig.notionToken && databaseConfig.notionDatabaseId) {
      syncQueue.add({
        type: 'sync',
        data: { presentations, ...data }
      })
      syncQueue.process()
    }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }
        }}
      />

      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        onExport={() => setIsExportDialogOpen(true)}
        onUpload={() => fileInputRef.current?.click()}
        onSettings={() => setSettingsPanel('notion')}
        onShowKeyboardShortcuts={() => setShowShortcutsDialog(true)}
        presentations={presentations}
        syncStatus={syncStatus}
        onDeletePresentation={handleDeletePresentation}
      />

      {/* Main Content */}
      <main className="transition-all duration-300 pt-20 min-h-screen">
        {isFullscreen && presentations.length > 0 ? (
          <SlideshowMode
            presentations={presentations}
            onClose={() => setIsFullscreen(false)}
          />
        ) : presentations.length === 0 ? (
          <UploadArea onUpload={handleUpload} />
        ) : (
          <>
            {activeTab === 'archive' && (
              <ArchiveTab
                presentations={presentations}
                viewMode={viewMode}
                onUpdateSlide={handleUpdateSlide}
                onDelete={handleDeletePresentation}
                bookmarkedSlides={bookmarkedSlides}
                onToggleBookmark={handleToggleBookmark}
                aiSummary={aiSummary}
                onApplyDesign={handleApplyDesign}
                appliedDesigns={appliedDesigns}
                onSlideDoubleClick={handleSlideDoubleClick}
              />
            )}
            {activeTab === 'search' && (
              <SearchTab
                presentations={presentations}
                viewMode={viewMode}
                onUpdateSlide={handleUpdateSlide}
                bookmarkedSlides={bookmarkedSlides}
                onToggleBookmark={handleToggleBookmark}
                customTags={customTags}
              />
            )}
            {activeTab === 'categories' && (
              <CategoriesTab
                presentations={presentations}
                viewMode={viewMode}
                onUpdateSlide={handleUpdateSlide}
                bookmarkedSlides={bookmarkedSlides}
                onToggleBookmark={handleToggleBookmark}
              />
            )}
            {activeTab === 'voice' && (
              <VoiceChatTab
                presentations={presentations}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
                onCreateSlide={handleUpload}
              />
            )}
            {activeTab === 'bookmarks' && (
              <BookmarksTab
                presentations={presentations}
                bookmarkedSlides={bookmarkedSlides}
                slideCategories={slideCategories}
                onToggleBookmark={handleToggleBookmark}
                onUpdateCategory={handleUpdateCategory}
                customCategories={customCategories}
                onAddCategory={handleAddCategory}
              />
            )}
          </>
        )}
      </main>

      {/* Export Dialog */}
      {isExportDialogOpen && presentations.length > 0 && (
        <ExportDialog
          presentations={presentations}
          onClose={() => setIsExportDialogOpen(false)}
          appliedDesigns={appliedDesigns}
          designHistory={designHistory}
        />
      )}

      {/* Notion Settings Dialog */}
      {settingsPanel === 'notion' && (
        <NotionSettingsDialog
          databaseConfig={databaseConfig}
          onConfigUpdate={handleNotionConfigUpdate}
          syncStatus={syncStatus}
          onClose={() => setSettingsPanel(null)}
          onOpenSharing={() => setSettingsPanel('sharing')}
        />
      )}

      {/* Sharing Dialog */}
      {settingsPanel === 'sharing' && (
        <SharingDialog
          databaseConfig={databaseConfig}
          presentations={presentations}
          onClose={() => setSettingsPanel(null)}
          onBackToSettings={() => setSettingsPanel('notion')}
        />
      )}

      {/* Keyboard Shortcuts Dialog */}
      {showShortcutsDialog && (
        <KeyboardShortcutsDialog
          isOpen={showShortcutsDialog}
          onClose={() => setShowShortcutsDialog(false)}
        />
      )}

      {/* Global Loading Overlay */}
      <GlobalLoadingOverlay
        isLoading={isGeneratingSummary || isGeneratingDesign}
        message={loadingMessage || 'Wird verarbeitet...'}
      />

      {/* Slide Detail Modal */}
      {detailSlide && detailPresentation && (
        <SlideDetailModal
          slide={detailSlide}
          presentation={detailPresentation}
          onClose={() => {
            setDetailSlide(null)
            setDetailPresentation(null)
          }}
        />
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pptx"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            // Simple placeholder - would need actual PPTX parsing
            const newPresentation = {
              id: Date.now().toString(),
              fileName: file.name,
              creator: 'Unknown',
              createdDate: new Date().toISOString(),
              fileSize: file.size,
              slides: [
                {
                  id: 1,
                  title: 'Sample Slide',
                  texts: ['Content'],
                  tags: ['New'],
                  category: null,
                  thumbnail: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22%3E%3Crect fill=%22%233b82f6%22 width=%22800%22 height=%22600%22/%3E%3Ctext x=%22400%22 y=%22300%22 font-size=%2248%22 fill=%22white%22 text-anchor=%22middle%22%3ENew Slide%3C/text%3E%3C/svg%3E'
                }
              ]
            }
            handleUpload(newPresentation)
            // Reset input
            e.target.value = ''
          }
        }}
        className="hidden"
      />
    </div>
    </ThemeProvider>
  )
}
