import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import GlowBorder from '../components/GlowBorder'
import { handleSpotlightMove } from '../lib/spotlight'
import { DISCIPLINES, COLORS } from '../lib/theme'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

function DisciplineCard({ discipline, isSelected, onSelect, index = 0 }) {
  const [hovered, setHovered] = useState(false)
  // slide-top's fill-mode holds its ending `transform: translateY(0)`
  // indefinitely, which would otherwise fight the hover/selected transform
  // below — stop applying the class (via state, not a direct DOM mutation,
  // so it stays gone across re-renders like selecting the card) once the
  // entrance finishes.
  const [entering, setEntering] = useState(true)
  const [line1, line2] = discipline.name.split(' & ')

  return (
    <div
      onClick={() => onSelect(discipline.name)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleSpotlightMove}
      onAnimationEnd={() => setEntering(false)}
      className={`spotlight-card${entering ? ' slide-top' : ''}${isSelected ? ' picker-card-glow-wrap picker-card-selected' : ''}`}
      style={{
        flex: 1,
        minHeight: '340px',
        background: discipline.color,
        border: 'none',
        borderRadius: '20px',
        boxSizing: 'border-box',
        cursor: 'pointer',
        transform: isSelected ? undefined : hovered ? 'scale(1.01)' : 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '18px 16px',
        userSelect: 'none',
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div style={{
        fontFamily: HN, fontSize: '13px', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.02em',
        color: discipline.accentColor || discipline.textColor, lineHeight: 1.4,
      }}>
        {line1}{line2 ? <> & {line2}</> : ''}
      </div>
      <div>
        {discipline.items.map((item) => (
          <div key={item} style={{
            fontFamily: HN, fontSize: '10px', color: discipline.textColor,
            opacity: 0.85, lineHeight: 1.7,
          }}>
            . {item}
          </div>
        ))}
      </div>
      {isSelected && <GlowBorder radius={20} />}
    </div>
  )
}

export default function FolderSelect() {
  const location = useLocation()
  const { industry, timeline } = location.state || {}
  const [selected, setSelected] = useState(location.state?.folderName || null)
  const [shaking, setShaking] = useState(false)
  const navigate = useNavigate()
  const btnRef = useRef(null)

  const handleSelect = (name) => setSelected((prev) => (prev === name ? null : name))

  const handleBack = () => navigate('/')

  const handleGo = () => {
    if (!selected) {
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
      return
    }
    const discipline = DISCIPLINES.find((d) => d.name === selected)
    navigate('/new/industry', { state: { folderName: discipline.name, folderColor: discipline.color, industry, timeline } })
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
          <span>01 -</span>
          <span>Select your discipline</span>
          <span>/3</span>
        </div>

        <div className="picker-cards-row" style={{ display: 'flex', gap: '24px' }}>
          {DISCIPLINES.map((d, i) => (
            <DisciplineCard
              key={d.name}
              discipline={d}
              index={i}
              isSelected={selected === d.name}
              onSelect={handleSelect}
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
