export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const totalHeight = items.length * itemHeight

  return {
    visibleCount,
    totalHeight,
    getVisibleItems: (scrollTop) => {
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1)
      const endIndex = Math.min(items.length, startIndex + visibleCount + 2)
      const offset = startIndex * itemHeight

      return {
        items: items.slice(startIndex, endIndex),
        offset,
        startIndex,
        endIndex
      }
    }
  }
}

export const getScrollPosition = (element) => {
  return element?.scrollTop || 0
}

export const scrollToItem = (element, index, itemHeight) => {
  if (element) {
    element.scrollTop = index * itemHeight
  }
}
