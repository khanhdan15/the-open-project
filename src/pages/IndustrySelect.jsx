import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { INDUSTRIES } from '../lib/theme'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

function IndustryCard({ industry, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => onSelect(industry.name)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: '1 1 220px',
        minHeight: '160px',
        background: industry.color,
        border: isSelected ? '2px solid #0A0A0A' : 'none',
        borderRadius: '20px',
        boxSizing: 'border-box',
        cursor: 'pointer',
        transform: isSelected ? 'scale(1.02)' : hovered ? 'scale(1.01)' : 'none',
        transition: 'transform 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 18px',
        userSelect: 'none',
      }}
    >
      <div style={{
        fontFamily: HN, fontSize: '13px', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.02em',
        color: '#0A0A0A', lineHeight: 1.4,
      }}>
        {industry.name}
      </div>
      <div>
        {industry.items.map((item) => (
          <div key={item} style={{
            fontFamily: HN, fontSize: '10px', color: '#0A0A0A',
            opacity: 0.7, lineHeight: 1.6,
          }}>
            . {item}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function IndustrySelect() {
  const location = useLocation()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [shaking, setShaking] = useState(false)
  const btnRef = useRef(null)

  const { folderName = 'Digital & Screen', folderColor = '#82DFFD' } = location.state || {}

  const handleGo = () => {
    if (!selected) {
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
      return
    }
    navigate('/new/timeline', { state: { folderName, folderColor, industry: selected } })
  }

  return (
    <div className="page-enter" style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ width: '100%', maxWidth: '1160px', margin: '0 auto', padding: '48px 40px 40px', flex: 1, boxSizing: 'border-box' }}>
        <div style={{
          fontFamily: HN, fontSize: '32px', fontWeight: 400,
          textTransform: 'uppercase', color: '#0A0A0A', textAlign: 'center',
          marginBottom: '56px',
        }}>
          Your Next Design Brief
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: HN, fontSize: '10px', letterSpacing: '0.08em', color: '#0A0A0A',
          marginBottom: '20px', textTransform: 'uppercase',
        }}>
          <span>02 -</span>
          <span>Select your industry</span>
          <span>/3</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {INDUSTRIES.map((ind) => (
            <IndustryCard
              key={ind.name}
              industry={ind}
              isSelected={selected === ind.name}
              onSelect={setSelected}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '48px' }}>
          <button
            ref={btnRef}
            onClick={handleGo}
            className={shaking ? 'shake' : ''}
            style={{
              width: '64px', height: '30px', borderRadius: '999px',
              border: '1.5px solid #0A0A0A', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', color: '#0A0A0A', cursor: 'pointer',
            }}
          >
            →
          </button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(0,0,0,0.15)' }} />
    </div>
  )
}
