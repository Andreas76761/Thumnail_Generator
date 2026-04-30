export const exportToJSON = (presentations, fileName = 'presentations.json') => {
  const dataStr = JSON.stringify(presentations, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  downloadFile(dataBlob, fileName)
}

export const exportToCSV = (presentations, fileName = 'slides.csv') => {
  const slides = presentations.flatMap(pres =>
    pres.slides.map(slide => ({
      Presentation: pres.fileName,
      SlideID: slide.id,
      Title: slide.title,
      Content: slide.texts.join(' | '),
      Tags: slide.tags.join(', '),
      Category: slide.category || 'Uncategorized',
      Bookmarked: slide.isBookmarked ? 'Yes' : 'No',
      DateCreated: pres.createdDate
    }))
  )

  const headers = Object.keys(slides[0])
  const csvContent = [
    headers.join(','),
    ...slides.map(row =>
      headers.map(header =>
        `"${String(row[header]).replace(/"/g, '""')}"`
      ).join(',')
    )
  ].join('\n')

  const dataBlob = new Blob([csvContent], { type: 'text/csv' })
  downloadFile(dataBlob, fileName)
}

export const exportAsHTML = (presentations, fileName = 'presentations.html') => {
  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentation Designer Export</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
    .presentation { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .presentation h1 { color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
    .metadata { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0; font-size: 14px; color: #666; }
    .slide { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #4f46e5; }
    .slide-title { font-weight: bold; color: #333; margin-bottom: 8px; }
    .slide-content { color: #555; margin: 8px 0; }
    .tags { margin-top: 10px; }
    .tag { display: inline-block; background: #e5e7eb; padding: 4px 8px; margin: 2px; border-radius: 4px; font-size: 12px; }
  </style>
</head>
<body>
  <h1>📊 Presentation Designer Export</h1>
  ${presentations.map(pres => `
    <div class="presentation">
      <h1>${pres.fileName}</h1>
      <div class="metadata">
        <div><strong>Ersteller:</strong> ${pres.creator}</div>
        <div><strong>Datum:</strong> ${new Date(pres.createdDate).toLocaleDateString('de-DE')}</div>
        <div><strong>Größe:</strong> ${(pres.fileSize / 1000000).toFixed(1)}MB</div>
        <div><strong>Anzahl Folien:</strong> ${pres.slides.length}</div>
      </div>
      <div>
        ${pres.slides.map(slide => `
          <div class="slide">
            <div class="slide-title">Folie ${slide.id}: ${slide.title}</div>
            ${slide.texts.length > 0 ? `
              <div class="slide-content">
                <strong>Inhalte:</strong>
                <ul>
                  ${slide.texts.map(text => `<li>${text}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            ${slide.tags.length > 0 ? `
              <div class="tags">
                ${slide.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('')}
</body>
</html>
  `.trim()

  const dataBlob = new Blob([html], { type: 'text/html' })
  downloadFile(dataBlob, fileName)
}

export const downloadFile = (blob, fileName) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    console.log('Copied to clipboard')
  }).catch(err => {
    console.error('Failed to copy:', err)
  })
}

// Export designs metadata
export const exportDesignMetadata = (presentations, appliedDesigns, designHistory, fileName = 'designs.json') => {
  const designData = {
    exportedAt: new Date().toISOString(),
    presentations: presentations.map(p => ({
      id: p.id,
      fileName: p.fileName,
      slides: p.slides.map(s => {
        const key = `${p.id}-${s.id}`
        return {
          slideId: s.id,
          title: s.title,
          appliedDesign: appliedDesigns?.[key] || null,
          designHistory: designHistory?.[key] || []
        }
      })
    }))
  }

  const dataStr = JSON.stringify(designData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  downloadFile(dataBlob, fileName)
}

// Export designs as visual preview (HTML)
export const exportDesignsAsHTML = (presentations, appliedDesigns, fileName = 'designs.html') => {
  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design Export</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
    .presentation { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .presentation h1 { color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
    .slide-design { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
    .slide-card { background: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
    .slide-title { font-weight: bold; color: #333; margin-bottom: 8px; }
    .design-badge { display: inline-block; background: #4f46e5; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .design-history { margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
    .history-item { margin: 5px 0; }
  </style>
</head>
<body>
  <h1>📊 Design Export</h1>
  <p>Exportiert am: ${new Date().toLocaleDateString('de-DE')}</p>

  ${presentations.map(pres => `
    <div class="presentation">
      <h1>${pres.fileName}</h1>
      <div class="slide-design">
        ${pres.slides.map(slide => {
          const designKey = `${pres.id}-${slide.id}`
          const design = appliedDesigns?.[designKey]
          return `
            <div class="slide-card">
              <div class="slide-title">Folie ${slide.id}: ${slide.title}</div>
              ${design ? `<span class="design-badge">🎨 ${design}</span>` : '<span style="color: #999;">Kein Design</span>'}
              ${slide.texts.length > 0 ? `<p><strong>Inhalte:</strong> ${slide.texts.slice(0, 2).join(', ')}</p>` : ''}
            </div>
          `
        }).join('')}
      </div>
    </div>
  `).join('')}
</body>
</html>
  `.trim()

  const dataBlob = new Blob([html], { type: 'text/html' })
  downloadFile(dataBlob, fileName)
}
