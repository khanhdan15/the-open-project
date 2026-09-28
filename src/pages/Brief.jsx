import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import LoadingScreen from '../components/LoadingScreen'
import { useUser } from '../context/UserContext'
import { generateBrief } from '../lib/generateBrief'
import { COLORS, TIMELINES } from '../lib/theme'
import exportIcon from '../assets/export-icon.png'
import downloadIcon from '../assets/download-icon.png'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

// Local preview only — visit /brief?mock=1 to see the result page's layout
// without hitting the real API (which needs a Netlify Function and won't
// respond to a plain `npm run dev`). Matches the exact shape generateBrief()
// returns, so it exercises the real rendering code, not a separate mock UI.
const MOCK_BRIEF = {
  brief_id: 'brief-mock',
  title: 'Streetwear Capsule Drop',
  client: 'Rewind Studio',
  industry: 'Fashion & Apparel',
  format: 'Capsule drop identity',
  summary: 'We are relaunching after a two year hiatus and need an identity that feels collectible, not seasonal.',
  details: {
    Background: [
      'The client is relaunching after a 2-year hiatus and is targeting a younger, resale-savvy audience.',
      'The look should feel collectible, not seasonal.',
    ],
    Goals: [
      'Build hype ahead of the drop without revealing the full collection.',
      'Give the brand a distinct visual identity separate from its earlier run.',
    ],
    'Target Audience': [
      'Ages 18 to 24, active in sneaker and streetwear resale communities.',
      'Follows drop culture, where scarcity and story matter more than price.',
    ],
    Deliverables: [
      'Capsule logo lockup.',
      'Three product tags plus a packaging insert.',
      'One launch teaser graphic.',
    ],
    'Brand Tone': [
      'Raw, confident, and a little irreverent, avoiding the usual polished streetwear look.',
    ],
    Constraints: [
      'Tight turnaround: launch assets due within the week.',
      'One consolidated round of feedback before final files.',
    ],
  },
  discipline: 'Brand & Identity',
  isChallenge: false,
  status: 'ongoing',
}

// A single info block in the flex layout — plain white by default, or the
// pale-yellow overview card. Four corner dots plus an optional row of extra
// "side dots" evenly spaced down its sides (only used on the tall overview
// column, computed from its rendered height).
function Block({ label, children, overview = false, className = '', style, innerRef }) {
  return (
    <div
      ref={innerRef}
      className={`brief-block${overview ? ' brief-block-overview' : ''}${className ? ` ${className}` : ''}`}
      style={style}
    >
      <span className="brief-block-dot" style={{ top: 10, left: 10 }} />
      <span className="brief-block-dot" style={{ top: 10, right: 10 }} />
      <span className="brief-block-dot" style={{ bottom: 10, left: 10 }} />
      <span className="brief-block-dot" style={{ bottom: 10, right: 10 }} />
      <div className="brief-block-label brief-focus-in">{label}</div>
      {children}
    </div>
  )
}

function Bullets({ items, prefix = '· ' }) {
  const list = Array.isArray(items) ? items : items ? [items] : []
  if (!list.length) return null
  return list.map((item, i) => (
    <p key={i} className="brief-block-line brief-focus-in">
      {prefix}{item}
    </p>
  ))
}

// Renders a black-on-transparent PNG as a mask so it inherits the button's
// current text color — stays black by default, turns off-white on hover
// along with the button text, without needing separate light/dark assets.
function Icon({ src, width, height }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width, height,
        flexShrink: 0,
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  )
}

function ActionBar({ onExport, onSave, onRemove, isSaved, onSubmit, onRegenerate, showRegenerate }) {
  const [spinning, setSpinning] = useState(false)
  const handleRegenerate = () => {
    setSpinning(true)
    setTimeout(() => setSpinning(false), 600)
    onRegenerate?.()
  }
  return (
    <div className="brief-action-bar">
      {showRegenerate && (
        <button
          className={`brief-action-btn brief-action-btn-icon${spinning ? ' spinning' : ''}`}
          onClick={handleRegenerate}
          title="Regenerate brief"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <polyline points="21 3 21 9 15 9" />
          </svg>
        </button>
      )}
      <button className="brief-action-btn" onClick={onExport}>
        Export <Icon src={exportIcon} width={18} height={10} />
      </button>
      {isSaved ? (
        <button className="brief-action-btn" onClick={onRemove}>remove</button>
      ) : (
        <button className="brief-action-btn" onClick={onSave}>
          save to workplace <Icon src={downloadIcon} width={5} height={15} />
        </button>
      )}
      <button className="brief-action-btn" onClick={onSubmit}>submit</button>
    </div>
  )
}

export default function Brief() {
  const location = useLocation()
  const navigate = useNavigate()
  const { addSavedBrief, removeSavedBrief, addSubmittedProject } = useUser()

  const [brief, setBrief] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitMode, setSubmitMode] = useState(false)
  const [hasFiles, setHasFiles] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [imagesBase64, setImagesBase64] = useState([])
  const fileInputRef = useRef(null)
  const overviewRef = useRef(null)
  const [sideDots, setSideDots] = useState([])
  const [loadingMessage, setLoadingMessage] = useState('')

  // The API call can take anywhere from a couple seconds to ~30s (see
  // REQUEST_TIMEOUT_MS in generateBrief.js). Without any feedback, a wait
  // past a few seconds reads as a frozen page rather than "still working" —
  // this escalates a reassuring message the longer it runs.
  useEffect(() => {
    // Deferred via setTimeout(...,0) rather than calling setLoadingMessage
    // directly in the effect body, per this project's
    // react-hooks/set-state-in-effect convention.
    const t0 = setTimeout(() => setLoadingMessage(''), 0)
    if (!loading) return () => clearTimeout(t0)
    const t1 = setTimeout(() => setLoadingMessage('Writing your brief...'), 6000)
    const t2 = setTimeout(() => setLoadingMessage('Still working, this can take up to 30 seconds...'), 15000)
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2) }
  }, [loading])

  const { folderName = 'Digital & Screen', folderColor = '#82DFFD', industry, timeline, savedBrief } = location.state || {}
  const categoryColor = savedBrief?.categoryColor || folderColor
  const timelineName = TIMELINES.find((t) => t.id === timeline)?.name

  // Extra tick-dots spaced evenly down the tall Overview column's sides,
  // between the corner dots — recalculated whenever the brief content (and
  // therefore the column's height) changes, and on window resize.
  useEffect(() => {
    function layout() {
      const h = overviewRef.current?.offsetHeight || 0
      const count = Math.max(0, Math.floor(h / 140) - 1)
      const dots = []
      for (let i = 1; i <= count; i++) dots.push((h / (count + 1)) * i)
      setSideDots(dots)
    }
    layout()
    window.addEventListener('resize', layout)
    return () => window.removeEventListener('resize', layout)
  }, [brief, submitMode])

  const isMock = new URLSearchParams(location.search).get('mock') === '1'

  // Load brief — mock (local preview) > savedBrief > real API call
  useEffect(() => {
    if (isMock) {
      setBrief({
        ...MOCK_BRIEF,
        issued: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      })
      setLoading(false)
      return
    }
    if (savedBrief) {
      setBrief(savedBrief)
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const result = await generateBrief(folderName, { industry, timeline })
        if (!cancelled) {
          setBrief({
            ...result,
            issued: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          })
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to generate brief. Check your API key and try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [folderName, industry, timeline, isMock])

  // File helpers
  const readAllBase64 = (files) => {
    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (evt) => resolve(evt.target.result)
            reader.readAsDataURL(file)
          })
      )
    ).then((results) => setImagesBase64(results))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'))
    if (!files.length) return
    setHasFiles(true)
    setPreviewUrl(URL.createObjectURL(files[0]))
    readAllBase64(files)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (!files.length) return
    setHasFiles(true)
    setPreviewUrl(URL.createObjectURL(files[0]))
    readAllBase64(files)
  }

  const handleSave = async () => {
    if (!brief) return
    const { data } = await addSavedBrief({ ...brief, categoryColor, isChallenge: false, status: 'ongoing' })
    if (data) setBrief((prev) => ({ ...prev, id: data.id }))
  }

  const handleRemove = () => {
    if (!brief?.id) return
    removeSavedBrief(brief.id)
    navigate(-1)
  }

  const handleSubmitProject = () => {
    if (!submitMode) { setSubmitMode(true); return }
    if (imagesBase64.length > 0) {
      if (brief.id) removeSavedBrief(brief.id)
      addSubmittedProject({
        brief,
        title: brief.title,
        images: imagesBase64,
        image: imagesBase64[0],
        note: '',
        folderColor: categoryColor,
      })
      navigate('/portfolio')
    }
  }

  async function handleRegenerate() {
    setBrief(null)
    setLoading(true)
    setError(null)
    try {
      const result = await generateBrief(folderName, { industry, timeline })
      setBrief({
        ...result,
        issued: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      })
    } catch (e) {
      setError(e.message || 'Failed to regenerate. Check your API key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <div className="page-enter brief-result-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header dark />
      <div className="ruler-edge ruler-edge-left" aria-hidden="true" />
      <div className="ruler-edge ruler-edge-right" aria-hidden="true" />

      {loading && <LoadingScreen fixed={false} message={loadingMessage} />}

      {!loading && error && (
        <div style={{ textAlign: 'center', marginTop: '20vh' }}>
          <p style={{ color: COLORS.darkMuted, fontFamily: HN, fontSize: '13px', margin: '0 0 16px' }}>
            {error}
          </p>
          <button
            onClick={handleRegenerate}
            style={{
              fontFamily: HN, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em',
              background: 'none', color: COLORS.accentPink, border: `1px solid ${COLORS.accentPink}`,
              padding: '10px 24px', borderRadius: '999px', cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && brief && (
        <div style={{ flex: 1, maxWidth: '1080px', width: '100%', margin: '0 auto', padding: '40px 60px 100px', boxSizing: 'border-box' }}>

          {/* Title + date — the regenerate control now lives in the
              floating action bar itself (first, before Export) instead of
              up here. */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className="brief-result-title brief-focus-in" style={{
              fontSize: 'clamp(36px, 6vw, 56px)', margin: '0 0 8px', color: COLORS.darkText,
            }}>
              {brief.title}
            </h1>
            <p style={{ fontFamily: HN, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.accentPink, margin: 0 }}>
              Created on {brief.issued || 'Date'}
            </p>
          </div>

          {!submitMode ? (
            <>
              {/* Flex block layout — a tall pale-yellow Overview column on
                  the left, then a right column that just stacks blocks as
                  needed (Target Audience + Timeline & Reviews side by side,
                  Deliverables full width below). */}
              <div className="brief-layout">
                <Block overview innerRef={overviewRef} style={{ animationDelay: '0ms' }} label="Project Overview">
                  <div className="brief-pill-row">
                    <span className="brief-pill brief-focus-in">Client: {brief.client}</span>
                    <span className="brief-pill brief-focus-in">Industry: {brief.industry}</span>
                    <span className="brief-pill brief-focus-in">Format: {brief.format}</span>
                  </div>
                  <Bullets items={brief.details?.Background} />
                  <Bullets items={brief.details?.['Brand Tone']} prefix="Voice: " />
                  {sideDots.map((y, i) => (
                    <span key={`l${i}`} className="brief-block-dot" style={{ top: y, left: 10 }} />
                  ))}
                  {sideDots.map((y, i) => (
                    <span key={`r${i}`} className="brief-block-dot" style={{ top: y, right: 10 }} />
                  ))}
                </Block>

                <div className="brief-col-right">
                  <div className="brief-row">
                    <Block label="Target Audience">
                      <Bullets items={brief.details?.['Target Audience']} />
                    </Block>
                    <Block label="Timeline & Reviews">
                      {timelineName && <p className="brief-block-line brief-focus-in">{timelineName}</p>}
                      <Bullets items={brief.details?.Constraints} />
                    </Block>
                  </div>

                  <Block label="Deliverables">
                    <Bullets items={brief.details?.Deliverables} />
                    <Bullets items={brief.details?.Goals} />
                  </Block>
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                style={{
                  border: `1.5px dashed ${COLORS.darkBorder}`,
                  minHeight: '200px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  background: previewUrl ? 'transparent' : 'rgba(255,255,255,0.05)',
                  overflow: 'hidden',
                }}
              >
                {hasFiles ? (
                  <img src={imagesBase64[0] || previewUrl} alt="Project preview" style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain', display: 'block' }} />
                ) : (
                  <>
                    <div style={{ fontFamily: HN, fontSize: '12px', color: COLORS.darkMuted, marginBottom: '8px' }}>Drop your project file here or click to upload</div>
                    <div style={{ fontFamily: HN, fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Accepts image files</div>
                  </>
                )}
              </div>
              {imagesBase64.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
                  <button onClick={handleSubmitProject} style={{ fontFamily: HN, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', background: COLORS.darkText, color: '#0A0A0A', border: 'none', padding: '12px 32px', borderRadius: '999px' }}>
                    Confirm Submission →
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
            </>
          )}
        </div>
      )}
      </div>
    </div>

    {/* Action bar — portaled straight to <body>. Both the page-enter and
        page-wrap ancestors animate with a CSS transform, and any
        transformed ancestor becomes the containing block for
        `position: fixed` descendants, so nesting the bar anywhere inside
        them pins it to that box instead of the real viewport. A portal
        sidesteps the whole hierarchy — always bottom-right, no scrolling. */}
    {!loading && !error && brief && createPortal(
      <div className="brief-action-bar-wrap" style={{ position: 'fixed', bottom: '24px', right: '40px', zIndex: 999 }}>
        <ActionBar
          onExport={() => window.print()}
          onSave={handleSave}
          onRemove={handleRemove}
          isSaved={!!brief.id}
          onSubmit={handleSubmitProject}
          onRegenerate={handleRegenerate}
          showRegenerate={!savedBrief}
        />
      </div>,
      document.body
    )}
    </>
  )
}
