// UI Constants
export const THUMBNAIL_WIDTH = parseInt(import.meta.env.VITE_THUMBNAIL_WIDTH || 800)
export const THUMBNAIL_HEIGHT = parseInt(import.meta.env.VITE_THUMBNAIL_HEIGHT || 600)

export const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE || 50000000)
export const MAX_FILES_AT_ONCE = parseInt(import.meta.env.VITE_MAX_FILES_AT_ONCE || 5)

// Tags
export const PREDEFINED_TAGS = [
  'Umsatz', 'Strategie', 'Finanzen', 'Marketing', 'Produkt',
  'Team', 'Kunden', 'Analyse', 'Wachstum', 'Agenda',
  'Überblick', 'Risiko', 'Planung', 'Qualität', 'Innovation',
  'Technologie', 'Markt', 'Ziele', 'Methode', 'Ergebnis'
]

// Categories
export const DEFAULT_CATEGORIES = [
  { id: 'important', name: 'Wichtig', color: 'red' },
  { id: 'review', name: 'Überarbeiten', color: 'yellow' },
  { id: 'archive', name: 'Archiv', color: 'green' }
]

// LLM Models
export const LLM_MODELS = [
  { id: 'claude', name: 'Claude', icon: '🤖', color: 'indigo' },
  { id: 'gpt4', name: 'GPT-4', icon: '🧠', color: 'green' },
  { id: 'gemini', name: 'Gemini', icon: '✨', color: 'blue' },
  { id: 'llama', name: 'Llama', icon: '🔮', color: 'purple' }
]

// View Modes
export const VIEW_MODES = [
  { id: 'gallery', name: 'Gallery', icon: '📊' },
  { id: 'carousel', name: 'Carousel', icon: '🎠' },
  { id: 'list', name: 'List', icon: '📋' }
]

// Design Variants
export const DESIGN_VARIANTS = [
  {
    id: 'modern',
    name: 'Modern & Minimalistisch',
    description: 'Sauberes, modernes Design mit Weißraum',
    colors: { bg: '#FFFFFF', accent: '#2563EB' }
  },
  {
    id: 'professional',
    name: 'Professionell & Business',
    description: 'Strukturiertes, seriöses Business-Design',
    colors: { bg: '#F3F4F6', accent: '#1E40AF' }
  },
  {
    id: 'creative',
    name: 'Kreativ & Dynamisch',
    description: 'Lebendiges Design mit Farbverlauf',
    colors: { bg: '#FFB3E6', accent: '#6366F1' }
  }
]

// Voice Chat
export const SPEECH_LANG = import.meta.env.VITE_SPEECH_LANG || 'de-DE'
export const TTS_LANG = import.meta.env.VITE_TTS_LANG || 'de-DE'

// Storage
export const STORAGE_KEYS = {
  PRESENTATIONS: 'pd_presentations',
  CHAT_HISTORY: 'pd_chat_history',
  VIEW_MODE: 'pd_view_mode',
  DATABASE_CONFIG: 'pd_database_config',
  DESIGN_HISTORY: 'pd_design_history'
}

// API Config
export const API_RETRY_ATTEMPTS = 3
export const API_RETRY_DELAY = 1000
export const NOTION_SYNC_INTERVAL = parseInt(import.meta.env.VITE_NOTION_SYNC_INTERVAL || 5000)
export const NOTION_BATCH_SIZE = parseInt(import.meta.env.VITE_NOTION_BATCH_SIZE || 10)

// OCR Config
export const OCR_LANGUAGE = import.meta.env.VITE_OCR_LANGUAGE || 'deu'
export const ENABLE_OCR = import.meta.env.VITE_ENABLE_OCR !== 'false'

// Logging
export const LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL || 'info'

export const log = {
  debug: (...args) => LOG_LEVEL === 'debug' && console.log('[DEBUG]', ...args),
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args)
}
