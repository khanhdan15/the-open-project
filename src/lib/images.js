// Shared image helpers — browser-side compression before upload, plus the
// naming convention for the small grid thumbnails stored next to each image.

// Longest side, in px, for the full-size image shown on a project page.
// Plenty for a full-width retina view, far smaller than a raw phone photo.
export const MAX_IMAGE_DIM = 2000
// Longest side for grid thumbnails (portfolio, profile, home cards, small
// squares on a project page). Cards display at ~300-450px, so 800px stays
// sharp on retina screens at a fraction of the full image's weight.
export const THUMB_DIM = 800
const WEBP_QUALITY = 0.82

// Only still raster photos get re-encoded. GIFs are skipped so animations
// keep playing, SVGs stay vector, and non-images (e.g. CV PDFs, which also
// go through uploadImage) pass through untouched.
const COMPRESSIBLE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const BUCKET_MARKER = '/storage/v1/object/public/portfolio-images/'

// Resizes and re-encodes an image blob as WebP in the browser. Falls back to
// the original blob whenever compression isn't possible (unsupported format,
// decode failure) or wouldn't actually make it smaller.
export async function compressImage(blob, maxDim = MAX_IMAGE_DIM) {
  if (!COMPRESSIBLE_TYPES.includes(blob.type)) return blob
  try {
    const bitmap = await createImageBitmap(blob)
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    const out = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY))
    // Some browsers silently fall back to PNG when WebP encoding isn't
    // supported, which can end up larger — keep whichever is smaller.
    if (!out || out.size >= blob.size) return blob
    return out
  } catch {
    return blob
  }
}

// Storage path (inside the portfolio-images bucket) for one of our own
// public image URLs, or null for anything else (external links, data URLs).
export function storagePathFromUrl(url) {
  if (typeof url !== 'string') return null
  const i = url.indexOf(BUCKET_MARKER)
  if (i === -1) return null
  return decodeURIComponent(url.slice(i + BUCKET_MARKER.length).split('?')[0])
}

export function isThumbPath(path) {
  return /_thumb\.webp$/i.test(path)
}

// Thumbnails live next to their full image: "<id>.webp" → "<id>_thumb.webp".
// Only WebP images we compressed ourselves have one; everything else (older
// uploads, external URLs) just returns the original URL.
export function thumbUrl(url) {
  const path = storagePathFromUrl(url)
  if (!path || !/\.webp$/i.test(path) || isThumbPath(path)) return url
  return url.replace(/\.webp(\?.*)?$/i, '_thumb.webp$1')
}
