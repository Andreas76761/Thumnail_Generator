const STORAGE_KEY = 'presentations_data'
const NOTION_API_KEY = import.meta.env.VITE_NOTION_API_KEY
const NOTION_DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID

// LocalStorage Functions
export const saveToLocalStorage = (presentations) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presentations))
  } catch (error) {
    console.error('LocalStorage save error:', error)
  }
}

export const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('LocalStorage load error:', error)
    return []
  }
}

export const clearLocalStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('LocalStorage clear error:', error)
  }
}

// Notion Integration Functions
export const syncToNotion = async (presentations) => {
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    console.warn('Notion integration not configured')
    return
  }

  try {
    const pages = presentations.flatMap(pres =>
      pres.slides.map(slide => ({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: {
          'Title': {
            title: [{ text: { content: slide.title } }]
          },
          'Presentation': {
            rich_text: [{ text: { content: pres.fileName } }]
          },
          'Tags': {
            multi_select: slide.tags.map(tag => ({ name: tag }))
          },
          'Category': {
            select: slide.category ? { name: slide.category } : null
          },
          'Bookmarked': {
            checkbox: slide.isBookmarked
          }
        }
      }))
    )

    for (const page of pages) {
      if (page.properties.Category.select) {
        await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(page)
        })
      }
    }
  } catch (error) {
    console.error('Notion sync error:', error)
  }
}

export const loadFromNotion = async () => {
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    console.warn('Notion integration not configured')
    return []
  }

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          page_size: 100
        })
      }
    )

    if (!response.ok) {
      throw new Error('Notion API error')
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Notion load error:', error)
    return []
  }
}

// Offline-First Sync Queue
class SyncQueue {
  constructor() {
    this.queue = []
    this.isProcessing = false
  }

  add(operation) {
    this.queue.push({
      ...operation,
      timestamp: new Date().toISOString()
    })
    this.save()
  }

  async process() {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true
    try {
      while (this.queue.length > 0) {
        const operation = this.queue[0]
        const success = await this.executeOperation(operation)
        if (success) {
          this.queue.shift()
          this.save()
        } else {
          break
        }
      }
    } finally {
      this.isProcessing = false
    }
  }

  async executeOperation(operation) {
    try {
      if (operation.type === 'sync') {
        await syncToNotion(operation.data)
      }
      return true
    } catch (error) {
      console.error('Operation failed:', error)
      return false
    }
  }

  save() {
    localStorage.setItem('sync_queue', JSON.stringify(this.queue))
  }

  load() {
    try {
      const data = localStorage.getItem('sync_queue')
      this.queue = data ? JSON.parse(data) : []
    } catch (error) {
      this.queue = []
    }
  }

  clear() {
    this.queue = []
    localStorage.removeItem('sync_queue')
  }
}

export const syncQueue = new SyncQueue()
syncQueue.load()

// Periodic sync when connection is restored
window.addEventListener('online', () => {
  console.log('Connection restored, syncing...')
  syncQueue.process()
})
