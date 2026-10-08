import { Children, useSyncExternalStore } from 'react'

const MOBILE_QUERY = '(max-width: 768px)'

function subscribe(callback) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}
const getIsMobile = () => window.matchMedia(MOBILE_QUERY).matches

// Masonry project grid: each card keeps its image's natural shape (tall
// posters stay tall, wide web work stays wide) instead of being cropped to a
// fixed ratio. Cards are dealt into columns left-to-right (1, 2, 3 across the
// top, then 4, 5, 6...) so numbering still reads across like a normal grid,
// rather than straight down each column the way CSS `columns` would.
export default function Masonry({ columns = 3, mobileColumns = 2, gap = 16, rowGap = 20, children }) {
  const isMobile = useSyncExternalStore(subscribe, getIsMobile, () => false)
  const count = Math.max(1, isMobile ? mobileColumns : columns)

  const items = Children.toArray(children)
  const cols = Array.from({ length: count }, () => [])
  items.forEach((child, i) => cols[i % count].push(child))

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: `${gap}px` }}>
      {cols.map((col, c) => (
        <div key={c} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: `${rowGap}px` }}>
          {col}
        </div>
      ))}
    </div>
  )
}
