import { useEffect } from 'react'

// Per-page title, description and canonical URL (Google reads these after
// the app runs). `noindex` keeps private pages (settings, drafts) out of
// search results. Link previews on social apps use the defaults in
// index.html, since those apps don't run JavaScript.
const SITE = 'https://openruler.design'
const DEFAULT_TITLE = 'Open Ruler · Free design brief generator for designers'
const DEFAULT_DESC = 'Generate realistic design briefs in seconds, build your portfolio from the work, and share it with a community of designers. Free to use.'

function setMeta(selector, attr, key, value) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement(attr === 'rel' ? 'link' : 'meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute(attr === 'rel' ? 'href' : 'content', value)
}

export default function usePageMeta({ title, description, path, noindex = false } = {}) {
  useEffect(() => {
    document.title = title ? `${title} · Open Ruler` : DEFAULT_TITLE
    setMeta('meta[name="description"]', 'name', 'description', description || DEFAULT_DESC)
    setMeta('link[rel="canonical"]', 'rel', 'canonical', `${SITE}${path ?? window.location.pathname}`)
    setMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
  }, [title, description, path, noindex])
}
