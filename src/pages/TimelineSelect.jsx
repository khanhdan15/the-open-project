import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import GlowBorder from '../components/GlowBorder'
import { handleSpotlightMove } from '../lib/spotlight'
import { TIMELINES, COLORS } from '../lib/theme'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

function TimelineCard({ timeline, isSelected, onSelect, index = 0 }) {
  const [hovered, setHovered] = useState(false)
  // See DisciplineCard for why this is state instead of a direct DOM
  // classList mutation — needs to survive a re-render (e.g. selecting).
  const [entering, setEntering] = useState(true)
  return (
    <div
      onClick={() => onSelect(timeline.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleSpotlightMove}
      onAnimationEnd={() => setEntering(false)}
      className={`spotlight-card${entering ? ' slide-top' : ''}${isSelected ? ' picker-card-glow-wrap picker-card-selected' : ''}`}
      style={{
        flex: 1,
        minHeight: '340px',
        background: timeline.color,
        border: 'none',
        boxSizing: 'border-box',
        borderRadius: '20px',
        cursor: 'pointer',
        transform: isSelected ? undefined : hovered ? 'scale(1.01)' : 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '6px',
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div style={{ fontFamily: HN, fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', color: timeline.accentColor || timeline.textColor }}>
        {timeline.name}
      </div>
      <div style={{ fontFamily: HN, fontSize: '11px', lineHeight: 1.5, textAlign: 'center', maxWidth: '220px', color: timeline.textColor }}>
        {timeline.description}
      </div>
      {isSelected && <GlowBorder radius={20} />}
    </div>
  )
}

export default function TimelineSelect() {
  const location = useLocation()
  const navigate = useNavigate()
  const { folderName = 'Digital & Screen', folderColor = '#82DFFD', industry } = location.state || {}
  const [selected, setSelected] = useState(location.state?.timeline || null)
  const [shaking, setShaking] = useState(false)
  const btnRef = useRef(null)

  const handleBack = () => navigate('/new/industry', { state: { folderName, folderColor, industry, timeline: selected } })

  const handleGo = () => {
    if (!selected) {
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
      return
    }
    navigate('/brief', { state: { folderName, folderColor, industry, timeline: selected } })
  }

  return (
    <div className="page-enter grid-paper-dark" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header dark />

      <div style={{ width: '100%', maxWidth: '1160px', margin: '0 auto', padding: '48px 40px 40px', flex: 1, boxSizing: 'border-box' }}>
        <div style={{
          fontFamily: HN, fontSize: '32px', fontWeight: 400,
          textTransform: 'uppercase', color: COLORS.darkText, textAlign: 'center',
          marginBottom: '56px',
        }}>
          Your Next Design Brief
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: HN, fontSize: '10px', letterSpacing: '0.08em', color: COLORS.accentPink,
          marginBottom: '20px', textTransform: 'uppercase',
        }}>
          <span>03 -</span>
          <span>Select your timeline</span>
          <span>/3</span>
        </div>

        <div className="picker-cards-row" style={{ display: 'flex', gap: '24px' }}>
          {TIMELINES.map((t, i) => (
            <TimelineCard
              key={t.id}
              timeline={t}
              index={i}
              isSelected={selected === t.id}
              onSelect={setSelected}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '48px' }}>
          <button
            onClick={handleBack}
            style={{
              width: '64px', height: '30px', borderRadius: '999px',
              border: `1.5px solid ${COLORS.darkText}`, background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', color: COLORS.darkText, cursor: 'pointer',
            }}
          >
            ←
          </button>
          <button
            ref={btnRef}
            onClick={handleGo}
            className={shaking ? 'shake' : ''}
            style={{
              width: '64px', height: '30px', borderRadius: '999px',
              border: `1.5px solid ${COLORS.darkText}`, background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', color: COLORS.darkText, cursor: 'pointer',
            }}
          >
            →
          </button>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${COLORS.darkBorder}` }} />
    </div>
  )
}
