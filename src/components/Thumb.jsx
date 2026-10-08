import { thumbUrl } from '../lib/images'

// Grid image that loads the small "_thumb.webp" version when one exists,
// falling back to the full image if it doesn't (older uploads, external
// URLs). Lazy-loaded so off-screen cards don't download until scrolled to.
export default function Thumb({ src, alt = '', ...props }) {
  const thumb = thumbUrl(src)
  return (
    <img
      src={thumb}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const img = e.currentTarget
        if (thumb !== src && img.dataset.fallback !== '1') {
          img.dataset.fallback = '1'
          img.src = src
        }
      }}
      {...props}
    />
  )
}
