import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import GlowBorder from '../components/GlowBorder'
import { DISCIPLINES, INDUSTRIES, TIMELINES } from '../lib/theme'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

const labelStyle = {
  fontFamily: HN, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em',
  color: 'rgba(255,255,255,0.6)', marginBottom: '18px',
}

// One shared pill style for every step — unselected is a plain outline;
// selected fills with a very soft blue-into-white gradient and gets the
// same traveling-light glow border used on the old picker cards. Each pill
// eases in on load (slide-top), staggered by `index`.
function Pill({ label, selected, onClick, wide = false, index = 0 }) {
  const [hovered, setHovered] = useState(false)
  const [entering, setEntering] = useState(true)

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onAnimationEnd={() => setEntering(false)}
      className={`${entering ? 'slide-top' : ''}${selected ? ' picker-card-glow-wrap picker-card-selected' : ''}`}
      style={{
        position: 'relative',
        fontFamily: HN,
        fontSize: wide ? '13px' : '12px',
        fontWeight: 500,
        textTransform: wide ? 'none' : 'uppercase',
        letterSpacing: '0.03em',
        color: selected ? '#0A0A0A' : '#FFFFFF',
        background: selected ? 'linear-gradient(135deg, #FFFFFF 0%, #BFE3FF 100%)' : 'transparent',
        borderColor: selected ? 'transparent' : hovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderRadius: '999px',
        padding: wide ? '14px 28px' : '9px 22px',
        cursor: 'pointer',
        transition: 'background 0.3s ease-in, border-color 0.2s ease-in',
        flex: wide ? '1 1 260px' : '0 0 auto',
        textAlign: wide ? 'left' : 'center',
        animationDelay: `${index * 60}ms`,
      }}
    >
      {label}
      {selected && <GlowBorder radius={999} />}
    </button>
  )
}

// The whole discipline → industry → project-scope flow, combined onto one
// screen instead of three separate pages — pick everything, then hit the
// arrow once to generate the brief.
export default function NewBrief() {
  const location = useLocation()
  const navigate = useNavigate()
  const [discipline, setDiscipline] = useState(location.state?.folderName || null)
  const [industry, setIndustry] = useState(location.state?.industry || null)
  const [scope, setScope] = useState(location.state?.timeline || null)
  const [shaking, setShaking] = useState(false)
  const btnRef = useRef(null)

  // Mobile-only "step focus": the three sections stay stacked in one
  // scroll, but only the one currently in view reads at full opacity (see
  // .brief-step / .brief-step-active in index.css, gated to the mobile
  // media query so desktop is unaffected). An IntersectionObserver over a
  // thin band near vertical-center tracks which section is "active" as the
  // user scrolls, in either direction.
  const [activeStep, setActiveStep] = useState(0)
  const disciplineStepRef = useRef(null)
  const industryStepRef = useRef(null)
  const scopeStepRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveStep(Number(entry.target.dataset.step))
          }
        })
      },
      // A wide band covering the top ~70% of the viewport — a section only
      // needs to reach that upper area (scrolling either direction) to
      // count as "in focus", instead of a thin center-line easy to skip
      // past on short/compact sections like Industry, especially when
      // scrolling upward.
      { rootMargin: '0px 0px -30% 0px', threshold: 0 }
    )
    ;[disciplineStepRef, industryStepRef, scopeStepRef].forEach(
      (ref) => ref.current && observer.observe(ref.current)
    )
    return () => observer.disconnect()
  }, [])

  // Safety net for the first and last steps: reaching the very top of the
  // page always means discipline is at full opacity, and — since "Project
  // scope" has a big margin below it that can scroll it past the
  // IntersectionObserver's detection band before the page runs out of room
  // to scroll — reaching the true bottom always means scope is.
  useEffect(() => {
    const handleScroll = () => {
      const atTop = window.scrollY <= 2
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (atTop) setActiveStep(0)
      else if (atBottom) setActiveStep(2)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const allSelected = Boolean(discipline && industry && scope)

  const toggle = (setter) => (value) => setter((prev) => (prev === value ? null : value))

  const handleGo = () => {
    if (!discipline || !industry || !scope) {
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
      return
    }
    const d = DISCIPLINES.find((x) => x.name === discipline)
    navigate('/brief', { state: { folderName: d.name, folderColor: d.color, industry, timeline: scope } })
  }

  return (
    <div className="page-enter brief-gradient-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header dark />
      <div className="ruler-edge ruler-edge-left" aria-hidden="true" />
      <div className="ruler-edge ruler-edge-right" aria-hidden="true" />

      <div className="brief-page-content" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '64px 40px 80px', flex: 1, boxSizing: 'border-box' }}>
        <div className="brief-title" style={{
          fontFamily: HN, fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400,
          textTransform: 'uppercase', color: '#FFFFFF', textAlign: 'center',
          marginBottom: '110px',
        }}>
          Create Your Next <span style={{ fontStyle: 'italic' }}>Design</span> Brief
        </div>

        <div
          ref={disciplineStepRef}
          data-step={0}
          className={`brief-step${activeStep === 0 ? ' brief-step-active' : ''}`}
          style={{ marginBottom: '90px' }}
        >
          <div className="brief-step-label" style={labelStyle}>Please choose your discipline</div>
          <div className="brief-discipline-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
            {DISCIPLINES.map((d, i) => (
              <Pill
                key={d.name}
                label={d.name}
                index={i}
                selected={discipline === d.name}
                onClick={() => toggle(setDiscipline)(d.name)}
              />
            ))}
          </div>
        </div>

        <div
          ref={industryStepRef}
          data-step={1}
          className={`brief-step${activeStep === 1 ? ' brief-step-active' : ''}`}
          style={{ marginBottom: '90px' }}
        >
          <div className="brief-step-label" style={labelStyle}>Industry</div>
          <div className="brief-step-options" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
            {INDUSTRIES.map((ind, i) => (
              <Pill
                key={ind.name}
                label={ind.name}
                index={i}
                selected={industry === ind.name}
                onClick={() => toggle(setIndustry)(ind.name)}
              />
            ))}
          </div>
        </div>

        <div
          ref={scopeStepRef}
          data-step={2}
          className={`brief-step${activeStep === 2 ? ' brief-step-active' : ''}`}
          style={{ marginBottom: '100px' }}
        >
          <div className="brief-step-label" style={labelStyle}>Timeline</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
            {TIMELINES.map((t, i) => (
              <Pill
                key={t.id}
                label={t.name}
                index={i}
                selected={scope === t.id}
                onClick={() => toggle(setScope)(t.id)}
                wide
              />
            ))}
          </div>
        </div>

        <div className={`brief-submit-row${allSelected ? ' brief-submit-ready' : ''}`} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            ref={btnRef}
            onClick={handleGo}
            className={shaking ? 'shake' : ''}
            style={{
              position: 'relative',
              width: '56px', height: '56px', borderRadius: '50%',
              border: 'none',
              background: allSelected
                ? 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 20%, #4FA8E8 100%)'
                : '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', color: '#0A0A0A', cursor: 'pointer',
            }}
          >
            →
            {allSelected && <GlowBorder radius={999} />}
          </button>
        </div>
      </div>
    </div>
  )
}
