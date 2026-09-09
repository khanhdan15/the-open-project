import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import LoadingScreen from '../components/LoadingScreen'
import { useUser } from '../context/UserContext'
import { generateBrief } from '../lib/generateBrief'
import { COLORS } from '../lib/theme'
import exportIcon from '../assets/export-icon.png'
import downloadIcon from '../assets/download-icon.png'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

// A single white rounded-corner info block — the brief result page is a
// grid of these ("client information", "background", "audience",
// "goals + deliverables", "tone"), matching the mockup exactly.
function Block({ label, children, bg = '#FFFFFF', color = '#0A0A0A', style, className = '' }) {
  return (
    <div
      className={className}
      style={{
        background: bg,
        borderRadius: '16px',
        padding: '24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        ...style,
      }}
    >
      <div style={{ fontFamily: HN, fontSize: '15px', fontWeight: 700, color, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {children}
      </div>
    </div>
  )
}

function Bullets({ items, color = '#0A0A0A' }) {
  const list = Array.isArray(items) ? items : items ? [items] : []
  if (!list.length) return null
  return list.map((item, i) => (
    <p key={i} style={{ fontFamily: HN, fontSize: '12px', lineHeight: 1.6, color, margin: 0 }}>
      · {item}
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

function ActionBar({ onExport, onSave, onRemove, isSaved, onSubmit }) {
  return (
    <div className="brief-action-bar">
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

  const { folderName = 'Digital & Screen', folderColor = '#82DFFD', industry, timeline, savedBrief } = location.state || {}
  const categoryColor = savedBrief?.categoryColor || folderColor

  // Load brief — use savedBrief directly if available, otherwise call API
  useEffect(() => {
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
  }, [folderName, industry, timeline])

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
    <div className="page-enter" style={{ background: COLORS.darkBg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header dark />

      {loading && <LoadingScreen fixed={false} label="Generating brief" />}

      {!loading && error && (
        <p style={{ textAlign: 'center', color: COLORS.darkMuted, marginTop: '20vh', fontFamily: HN, fontSize: '13px' }}>
          {error}
        </p>
      )}

      {!loading && !error && brief && (
        <div className="grid-paper-dark" style={{ flex: 1, padding: '28px 40px 120px' }}>

          {/* Date / brief no. / regenerate, plus title + short summary —
              one shared translucent dark veil sits behind all of it so the
              grid fades to half-strength and the text reads cleanly. */}
          <div style={{ position: 'relative', marginBottom: '48px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', padding: '24px 24px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontFamily: HN, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: COLORS.accentPink }}>
                  {brief.issued || 'Date'}
                </span>
                <span style={{ fontFamily: HN, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: COLORS.accentPink }}>
                  Brief {brief.brief_id?.replace('brief-', '') || '01'}{timeline ? ` · ${timeline}` : ''}
                </span>
                {!savedBrief ? (
                  <button
                    onClick={handleRegenerate}
                    title="Regenerate brief"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '16px', color: COLORS.accentPink }}
                  >
                    ↻
                  </button>
                ) : <span style={{ width: '16px' }} />}
              </div>

              <div style={{ textAlign: 'center' }}>
                <h1 style={{
                  fontFamily: HN, fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 400,
                  textTransform: 'uppercase', color: COLORS.darkText, lineHeight: 1.1, margin: '0 0 14px',
                }}>
                  {brief.title}
                </h1>
                {!submitMode && brief.summary && (
                  <p style={{ fontFamily: HN, fontSize: '15px', fontWeight: 700, color: COLORS.darkText, margin: 0 }}>
                    {brief.summary}
                  </p>
                )}
              </div>
            </div>
          </div>

          {!submitMode ? (
            <>
              {/* Info blocks — client info / background / audience (row 1),
                  goals + deliverables / tone (row 2) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '40px 24px',
                alignItems: 'start',
                marginBottom: '32px',
              }}>
                <Block
                  label="client information"
                  bg={COLORS.blockDark}
                  color={COLORS.blockDarkText}
                  className="slide-top"
                  style={{ gridColumn: '1', gridRow: '1', minHeight: '140px', animationDelay: '0ms' }}
                >
                  <p style={{ fontFamily: HN, fontSize: '12px', lineHeight: 1.8, color: COLORS.blockDarkText, margin: 0 }}>client: {brief.client}</p>
                  <p style={{ fontFamily: HN, fontSize: '12px', lineHeight: 1.8, color: COLORS.blockDarkText, margin: 0 }}>industry: {brief.industry}</p>
                  <p style={{ fontFamily: HN, fontSize: '12px', lineHeight: 1.8, color: COLORS.blockDarkText, margin: 0 }}>format: {brief.format}</p>
                </Block>

                <Block
                  label="background"
                  bg={COLORS.blockPurple}
                  color={COLORS.blockLightText}
                  className="slide-top"
                  style={{ gridColumn: '2', gridRow: '1', minHeight: '260px', animationDelay: '80ms' }}
                >
                  <Bullets items={brief.details?.Background} color={COLORS.blockLightText} />
                </Block>

                <Block
                  label="audience"
                  bg={COLORS.blockBlue}
                  color={COLORS.blockLightText}
                  className="slide-top"
                  style={{ gridColumn: '3', gridRow: '1', minHeight: '260px', animationDelay: '160ms' }}
                >
                  <Bullets items={brief.details?.['Target Audience']} color={COLORS.blockLightText} />
                </Block>

                <Block
                  label="goals + deliverables"
                  bg={COLORS.blockBlue}
                  color={COLORS.blockLightText}
                  className="slide-top"
                  style={{ gridColumn: '1 / 3', gridRow: '2', minHeight: '260px', animationDelay: '240ms' }}
                >
                  <Bullets items={brief.details?.Goals} color={COLORS.blockLightText} />
                  <Bullets items={brief.details?.Deliverables} color={COLORS.blockLightText} />
                  <Bullets items={brief.details?.Constraints} color={COLORS.blockLightText} />
                </Block>

                <Block
                  label="tone"
                  bg={COLORS.blockDark}
                  color={COLORS.blockDarkText}
                  className="slide-top"
                  style={{ gridColumn: '3', gridRow: '2', minHeight: '140px', animationDelay: '320ms' }}
                >
                  <Bullets items={brief.details?.['Brand Tone']} color={COLORS.blockDarkText} />
                </Block>
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

    {/* Action bar — portaled straight to <body>. Both the page-enter and
        page-wrap ancestors animate with a CSS transform, and any
        transformed ancestor becomes the containing block for
        `position: fixed` descendants, so nesting the bar anywhere inside
        them pins it to that box instead of the real viewport. A portal
        sidesteps the whole hierarchy — always bottom-right, no scrolling. */}
    {!loading && !error && brief && createPortal(
      <div style={{ position: 'fixed', bottom: '24px', right: '40px', zIndex: 999 }}>
        <ActionBar onExport={() => window.print()} onSave={handleSave} onRemove={handleRemove} isSaved={!!brief.id} onSubmit={handleSubmitProject} />
      </div>,
      document.body
    )}
    </>
  )
}
