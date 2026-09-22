import { useEffect, useState } from 'react'
import logoMark from '../assets/logobnw_main.png'

// How long the whole screen fades out once auth resolves, before onDone
// fires and the real page takes over.
const FADE_MS = 350
// The logotype reveal itself (see .loading-logo-* in index.css) finishes
// playing at ~1080ms — ring+line+R scale in over 780ms, then "PEN"/"ULER"
// fade in starting at 640/700ms and finish at ~1020/1080ms. This floor
// guarantees authLoading resolving early (supabase.auth.getSession() often
// takes only a handful of ms) never cuts that reveal short. Combined with
// FADE_MS below, the whole screen reads as ~1.5s total, slow enough for the
// movement to feel smooth rather than snappy.
const MIN_VISIBLE_MS = 1150

// Custom "Open Ruler" logotype reveal: the real mark (ring + line + R,
// supplied as src/assets/logobnw_main.png) scales in, then "PEN" and "ULER"
// fade in around it to spell the full wordmark. The mark itself is the
// user's actual artwork rather than a rebuilt approximation; only the two
// words are overlaid as real text (see .loading-logo-pen/-uler in
// index.css), positioned from the PNG's own measured geometry.
export default function LoadingScreen({ fixed = true, authLoading = true, onDone }) {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), MIN_VISIBLE_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (authLoading || !minTimeElapsed || exiting) return
    // Deferred via setTimeout(...,0) rather than calling setExiting directly
    // in the effect body, per this project's react-hooks/set-state-in-effect
    // convention.
    const t = setTimeout(() => setExiting(true), 0)
    return () => clearTimeout(t)
  }, [authLoading, minTimeElapsed, exiting])

  useEffect(() => {
    if (!exiting) return
    const t = setTimeout(() => { if (onDone) onDone() }, FADE_MS)
    return () => clearTimeout(t)
  }, [exiting, onDone])

  return (
    <div
      style={{
        position: fixed ? 'fixed' : 'relative',
        inset: fixed ? 0 : undefined,
        minHeight: fixed ? undefined : '100vh',
        width: '100%',
        background: '#FFFFFF',
        overflow: 'hidden',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: exiting ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      <svg className="loading-grid" preserveAspectRatio="none" aria-hidden="true">
        <line x1="20%" y1="0" x2="20%" y2="100%" />
        <line x1="40%" y1="0" x2="40%" y2="100%" />
        <line x1="60%" y1="0" x2="60%" y2="100%" />
        <line x1="80%" y1="0" x2="80%" y2="100%" />
        <line x1="0" y1="30%" x2="100%" y2="30%" />
        <line x1="0" y1="50%" x2="100%" y2="50%" />
        <line x1="0" y1="70%" x2="100%" y2="70%" />
      </svg>

      <div className="loading-logo">
        <div className="loading-logo-mark">
          <img src={logoMark} alt="" className="loading-logo-icon" />
        </div>
        <div className="loading-logo-pen">PEN</div>
        <div className="loading-logo-uler">ULER</div>
      </div>
    </div>
  )
}
