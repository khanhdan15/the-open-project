import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useUser } from '../context/UserContext'
import { generateBrief } from '../lib/generateBrief'

const HN = '-apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'
const SERIF = '"BIZ UDMincho", serif'

// Archival folder tab — custom SVG path shape
function BriefTab({ brief, onClose, color }) {
  const W = 264
  const H = 54
  const sw = 1.5
  const o = sw / 2

  const d = [
    `M ${o},${H}`,
    `L ${o},${o}`,
    `L 194,${o}`,
    `C 236,${o} ${W - o},17 ${W - o},${H}`,
    `Z`,
  ].join(' ')

  return (
    <div style={{ position: 'relative', width: `${W}px`, height: `${H}px`, flexShrink: 0, zIndex: 1, marginBottom: '-1.5px' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" style={{ position: 'absolute', top: 0, left: 0, display: 'block' }}>
        <path d={d} fill="#FFFFFF" stroke={color} strokeWidth={sw} strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', padding: '0 46px 0 10px' }}>
        <div>
          <div style={{ fontFamily: HN, fontSize: '14px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0A0A0A', lineHeight: 1.0 }}>
            Brief {brief?.brief_id?.replace('brief-', '') || '001'}
          </div>
          <div style={{ fontFamily: HN, fontSize: '10px', fontWeight: 400, textTransform: 'uppercase', color: '#0A0A0A', lineHeight: 1.0, marginTop: '3px' }}>
            {brief?.issued}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,0,0,0.07)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, fontSize: '14px', lineHeight: 1, color: '#0A0A0A' }}
        >
          ×
        </button>
      </div>
    </div>
  )
}

function MetaCol({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: HN, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: '5px' }}>
        {label}
      </div>
      <div style={{ fontFamily: HN, fontSize: '14px', color: '#0A0A0A' }}>
        {value}
      </div>
    </div>
  )
}

export default function Brief() {
  const location = useLocation()
  const navigate = useNavigate()
  const { addSavedBrief, removeSavedBrief, addSubmittedProject } = useUser()

  const [step, setStep] = useState(0)
  const [brief, setBrief] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitMode, setSubmitMode] = useState(false)
  const [hasFiles, setHasFiles] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [saved, setSaved] = useState(false)
  const [imagesBase64, setImagesBase64] = useState([])
  const fileInputRef = useRef(null)

  const { folderName = 'Digital & Screen', folderColor = '#60DDE6', savedBrief } = location.state || {}
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
        const result = await generateBrief(folderName)
        if (!cancelled) {
          setBrief({
            ...result,
            issued: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          })
        }
      } catch (e) {
        if (!cancelled) setError('Failed to generate brief. Check your API key and try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [folderName])

  // Stagger section reveal — fires only once brief is loaded
  useEffect(() => {
    if (!brief) return
    const timings = [100, 400, 750, 1100, 1500, 1950]
    timings.forEach((delay, i) => {
      setTimeout(() => setStep(i + 1), delay)
    })
  }, [brief])

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

  const handleSave = () => {
    if (!brief) return
    addSavedBrief({ ...brief, categoryColor, isChallenge: false, status: 'ongoing' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
    setStep(0)
    setBrief(null)
    setLoading(true)
    setError(null)
    try {
      const result = await generateBrief(folderName)
      setBrief({
        ...result,
        issued: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      })
    } catch (e) {
      setError('Failed to regenerate. Check your API key.')
    } finally {
      setLoading(false)
    }
  }

  const ActionButtons = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '12px',
      padding: '16px 24px',
      borderTop: '1px solid rgba(0,0,0,0.1)',
      background: '#FFFFFF',
    }}>
      <button style={{
        fontFamily: HN, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em',
        border: '1px solid rgba(0,0,0,0.2)', background: 'transparent', color: '#0A0A0A',
        padding: '10px 22px', borderRadius: '2px',
      }}>
        Export Brief
      </button>
      <button onClick={handleSave} style={{
        fontFamily: HN, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em',
        border: '1px solid rgba(0,0,0,0.15)', background: categoryColor, color: '#0A0A0A',
        padding: '10px 22px', borderRadius: '2px',
      }}>
        {saved ? 'Saved ✓' : 'Save to Workspace'}
      </button>
      <button onClick={handleSubmitProject} style={{
        fontFamily: HN, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em',
        border: 'none', background: '#0A0A0A', color: '#FFFFFF',
        padding: '10px 22px', borderRadius: '2px',
      }}>
        Submit Project
      </button>
    </div>
  )

  return (
    <div className="page-enter" style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ width: '80vw', margin: '20px auto 40px' }}>

        {/* Loading state */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
            <div className="brief-loading-bar">
              <div className="brief-loading-fill" style={{ background: categoryColor }} />
            </div>
            <p style={{ fontFamily: 'Helvetica Neue', fontSize: '12px', color: '#999', letterSpacing: '0.08em', margin: 0 }}>
              GENERATING BRIEF
            </p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <p style={{ textAlign: 'center', color: '#999', marginTop: '20vh', fontFamily: HN, fontSize: '13px' }}>
            {error}
          </p>
        )}

        {/* Brief content — only shown when loaded */}
        {!loading && !error && brief && (
          <>
            {/* N=1: Tab */}
            <div className={step >= 1 ? 'section-reveal' : 'section-hidden'}>
              <BriefTab brief={brief} onClose={() => navigate('/')} color={categoryColor} />
            </div>

            {/* Card body */}
            <div
              className="brief-border-pulse"
              style={{
                '--brief-pulse-color': categoryColor + '66',
                border: `1.5px solid ${categoryColor}`,
                borderRadius: '0 8px 8px 8px',
                background: '#FFFFFF',
                position: 'relative',
              }}
            >
              {/* Regenerate button — hidden when viewing a saved brief */}
              {!savedBrief && (
                <button
                  onClick={handleRegenerate}
                  title="Regenerate brief"
                  style={{
                    position: 'absolute', top: '16px', right: '16px',
                    width: '48px', height: '48px', borderRadius: '50%',
                    border: '1px solid #0A0A0A', background: 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 0, margin: 0, lineHeight: 1, color: '#0A0A0A',
                  }}
                >
                  <span style={{ fontSize: '26px', fontWeight: 200, lineHeight: 1, display: 'block', paddingBottom: '2px', color: '#0A0A0A' }}>↻</span>
                </button>
              )}

              {/* Colored rule */}
              <div style={{ borderTop: `1px solid ${categoryColor}`, width: '80%', margin: '20px auto 0', padding: 0 }} />

              {/* Top section */}
              <div style={{ padding: '48px 48px 48px', textAlign: 'center' }}>

                {/* N=2: Title */}
                <div className={step >= 2 ? 'section-reveal' : 'section-hidden'}>
                  <h1 style={{ fontFamily: SERIF, fontSize: '56px', fontWeight: 700, color: '#0A0A0A', lineHeight: 1.1, margin: '0 0 32px' }}>
                    {brief.title}
                  </h1>
                </div>

                {/* N=3: Metadata row */}
                <div className={step >= 3 ? 'section-reveal' : 'section-hidden'}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '24px' }}>
                    <MetaCol label="Client" value={brief.client} />
                    <MetaCol label="Industry" value={brief.industry} />
                    <MetaCol label="Format" value={brief.format} />
                  </div>
                </div>

                {/* N=4: Summary */}
                {!submitMode && (
                  <div className={step >= 4 ? 'section-reveal' : 'section-hidden'}>
                    <p style={{
                      fontFamily: HN, fontSize: '14px', lineHeight: 1.8,
                      textAlign: 'justify', width: '50%', margin: '0 auto',
                      paddingTop: '20px', paddingBottom: '0', color: '#0A0A0A',
                    }}>
                      {brief.summary}
                    </p>
                  </div>
                )}
              </div>

              {!submitMode ? (
                <>
                  {/* N=5: Details section */}
                  <div className={step >= 5 ? 'section-reveal' : 'section-hidden'}>
                    <div style={{ background: categoryColor, margin: '0 24px 24px', borderRadius: '4px' }}>
                      <div style={{ fontFamily: HN, fontSize: '11px', color: 'rgba(0,0,0,0.55)', padding: '12px 20px' }}>
                        Details brief
                      </div>
                      <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(0,0,0,0.15)' }}>
                          {Object.entries(brief.details || {}).map(([key, value]) => (
                            <div key={key} style={{ background: categoryColor, padding: '14px 16px' }}>
                              <div style={{ fontFamily: HN, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.5)', marginBottom: '8px' }}>
                                {key}
                              </div>
                              <p style={{ fontFamily: HN, fontSize: '14px', color: '#0A0A0A', lineHeight: 1.8, margin: 0 }}>
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* N=6: Action buttons */}
                  <div className={step >= 6 ? 'section-reveal' : 'section-hidden'}>
                    <ActionButtons />
                  </div>
                </>
              ) : (
                <>
                  <ActionButtons />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                      margin: '0 32px 32px',
                      border: '1.5px dashed rgba(0,0,0,0.3)',
                      minHeight: '200px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      background: previewUrl ? 'transparent' : 'rgba(0,0,0,0.02)',
                      overflow: 'hidden',
                    }}
                  >
                    {hasFiles ? (
                      <img src={imagesBase64[0] || previewUrl} alt="Project preview" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }} />
                    ) : (
                      <>
                        <div style={{ fontFamily: HN, fontSize: '12px', color: '#999', marginBottom: '8px' }}>Drop your project file here or click to upload</div>
                        <div style={{ fontFamily: HN, fontSize: '10px', color: '#bbb' }}>Accepts image files</div>
                      </>
                    )}
                  </div>
                  {imagesBase64.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '0 32px 28px' }}>
                      <button onClick={handleSubmitProject} style={{ fontFamily: HN, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#0A0A0A', color: '#FFFFFF', border: 'none', padding: '12px 32px', borderRadius: '2px', width: '100%' }}>
                        Confirm Submission →
                      </button>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
                </>
              )}
            </div>
          </>
        )}
      </div>

      <div style={{ borderTop: '1px solid #0A0A0A', marginTop: 'auto' }} />
    </div>
  )
}
