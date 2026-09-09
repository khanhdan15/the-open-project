import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

// Left-edge scroll-progress cue — a small dot + track fixed to the
// viewport, shown once a grid of `itemCount` cards spills past one row
// (using the site's standard desktop/mobile column counts, matching
// .responsive-project-grid). Portaled to document.body: pages wrap their
// content in `.page-enter`, which animates with a CSS transform, and any
// transformed ancestor becomes the containing block for `position: fixed`
// descendants — left un-portaled, the cue would silently stop tracking the
// real viewport (same issue solved for the sticky brief action bar).
export default function ScrollCue({ itemCount, active = true, desktopColumns = 3, mobileColumns = 2, left = '20px' }) {
  const [columns, setColumns] = useState(window.innerWidth <= 768 ? mobileColumns : desktopColumns)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateColumns = () => setColumns(window.innerWidth <= 768 ? mobileColumns : desktopColumns)
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [desktopColumns, mobileColumns])

  const visible = active && itemCount > columns

  // setScrollProgress only ever runs inside the scroll/resize callbacks
  // below, never synchronously in the effect body.
  useEffect(() => {
    if (!visible) return
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0)
    }
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [visible])

  if (!visible || typeof document === 'undefined') return null

  return createPortal(
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', left, top: '50%', transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 50,
      }}
    >
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0A0A0A', marginBottom: '8px', flexShrink: 0 }} />
      <div style={{ position: 'relative', width: '2px', height: '110px', background: 'rgba(0,0,0,0.15)', borderRadius: '1px' }}>
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          top: `${scrollProgress * 102}px`,
          width: '8px', height: '8px', borderRadius: '50%', background: '#0A0A0A',
        }} />
      </div>
    </div>,
    document.body
  )
}
