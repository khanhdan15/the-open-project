import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

// Full-screen, Behance-style project viewer: every image stacked vertically
// at full width on a dark backdrop, scrolled straight to whichever one was
// clicked. Reads like flipping through a PDF of the project rather than a
// one-image-at-a-time lightbox. Portaled to <body> so `position: fixed`
// covers the real viewport (the page wrapper animates with a transform,
// which would otherwise trap it — same reason as the Brief action bar).
export default function ImageViewer({ images, startIndex = 0, title, onClose }) {
  const imageRefs = useRef([])

  useEffect(() => {
    // Jump to the clicked image, lock the page behind from scrolling, and
    // let Escape close the viewer.
    imageRefs.current[startIndex]?.scrollIntoView({ block: 'start' })
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [startIndex, onClose])

  return createPortal(
    <div
      className="image-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} images` : 'Project images'}
      onClick={onClose}
    >
      <button
        className="image-viewer-close"
        onClick={(e) => { e.stopPropagation(); onClose() }}
        aria-label="Close"
      >
        ×
      </button>

      <div className="image-viewer-stack">
        {title && <div className="image-viewer-title" style={{ fontFamily: HN }}>{title}</div>}
        {images.map((src, i) => (
          <img
            key={i}
            ref={(el) => { imageRefs.current[i] = el }}
            src={src}
            alt={title ? `${title} ${i + 1}` : `Image ${i + 1}`}
            decoding="async"
            onClick={(e) => e.stopPropagation()}
          />
        ))}
        <div className="image-viewer-count" style={{ fontFamily: HN }}>
          {images.length} {images.length === 1 ? 'image' : 'images'} · press Esc or click outside to close
        </div>
      </div>
    </div>,
    document.body
  )
}
