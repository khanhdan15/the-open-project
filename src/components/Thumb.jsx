import { thumbUrl } from '../lib/images'

// Marks an image as loaded so it fades/un-blurs in (see .img-reveal in
// index.css). Done directly on the element rather than via React state, so
// it works for images that were already cached and finished before render.
function markLoaded(img) {
  img.classList.add('is-loaded')
}

// An image that stays hidden until it has fully downloaded, then fades in
// from a blur — instead of painting in jagged strips top-to-bottom while it
// loads. If `fallbackSrc` is given and `src` fails (e.g. a thumbnail that
// doesn't exist yet), it swaps to the fallback.
export function RevealImg({ src, fallbackSrc, alt = '', className = '', ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      decoding="async"
      className={`img-reveal${className ? ` ${className}` : ''}`}
      ref={(img) => { if (img && img.complete && img.naturalWidth) markLoaded(img) }}
      onLoad={(e) => markLoaded(e.currentTarget)}
      onError={(e) => {
        const img = e.currentTarget
        if (fallbackSrc && fallbackSrc !== src && img.dataset.fallback !== '1') {
          img.dataset.fallback = '1'
          img.src = fallbackSrc
        } else {
          markLoaded(img) // give up gracefully rather than staying invisible
        }
      }}
      {...props}
    />
  )
}

// Grid image: loads the small "_thumb.webp" version when one exists, falling
// back to the full image if it doesn't (older uploads, external URLs).
// Lazy-loaded so off-screen cards don't download until scrolled to.
export default function Thumb({ src, ...props }) {
  return <RevealImg src={thumbUrl(src)} fallbackSrc={src} loading="lazy" {...props} />
}
