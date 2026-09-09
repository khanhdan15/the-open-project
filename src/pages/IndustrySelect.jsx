import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import GlowBorder from '../components/GlowBorder'
import { handleSpotlightMove } from '../lib/spotlight'
import { INDUSTRIES, COLORS } from '../lib/theme'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

function IndustryCard({ industry, isSelected, onSelect, index = 0 }) {
  const [hovered, setHovered] = useState(false)
  // See DisciplineCard for why this is state instead of a direct DOM
  // classList mutation — needs to survive a re-render (e.g. selecting).
  const [entering, setEntering] = useState(true)

  return (
    <div
      onClick={() => onSelect(industry.name)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleSpotlightMove}
      onAnimationEnd={() => setEntering(false)}
      className={`spotlight-card${entering ? ' slide-top' : ''}${isSelected ? ' picker-card-glow-wrap picker-card-selected' : ''}`}
      style={{
        flex: '1 1 220px',
        minHeight: '160px',
        background: industry.color,
        border: 'none',
        borderRadius: '20px',
        boxSizing: 'border-box',
        cursor: 'pointer',
        transform: isSelected ? undefined : hovered ? 'scale(1.01)' : 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 18px',
        userSelect: 'none',
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div style={{
        fontFamily: HN, fontSize: '13px', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.02em',
        color: industry.accentColor || industry.textColor, lineHeight: 1.4,
      }}>
        {industry.name}
      </div>
      <div>
        {industry.items.map((item) => (
          <div key={item} style={{
            fontFamily: HN, fontSize: '10px', color: industry.textColor,
            opacity: 0.85, lineHeight: 1.6,
          }}>
            . {item}
          </div>
        ))}
      </div>
      {isSelected && <GlowBorder radius={20} />}
    </div>
  )
}

export default function IndustrySelect() {
  const location = useLocation()
  const navigate = useNavigate()
  const { folderName = 'Digital & Screen', folderColor = '#82DFFD', timeline } = location.state || {}
  const [selected, setSelected] = useState(location.state?.industry || null)
  const [shaking, setShaking] = useState(false)
  const btnRef = useRef(null)

  const handleBack = () => navigate('/new', { state: { folderName, folderColor, industry: selected, timeline } })

  const handleGo = () => {
    if (!selected) {
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
      return
    }
    navigate('/new/timeline', { state: { folderName, folderColor, industry: selected, timeline } })
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
          <span>02 -</span>
          <span>Select your industry</span>
          <span>/3</span>
        </div>

        <div className="picker-cards-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {INDUSTRIES.map((ind, i) => (
            <IndustryCard
              key={ind.name}
              industry={ind}
              index={i}
              isSelected={selected === ind.name}
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
