import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { TIMELINES } from '../lib/theme'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

function TimelineCard({ timeline, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={() => onSelect(timeline.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        minHeight: '340px',
        background: timeline.color,
        border: isSelected ? '2px solid #0A0A0A' : 'none',
        boxSizing: 'border-box',
        borderRadius: '20px',
        cursor: 'pointer',
        transform: isSelected ? 'scale(1.02)' : hovered ? 'scale(1.01)' : 'none',
        transition: 'transform 0.15s ease',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '6px',
      }}
    >
      <div style={{ fontFamily: HN, fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', color: '#0A0A0A' }}>
        {timeline.name}
      </div>
      <div style={{ fontFamily: HN, fontSize: '9px', letterSpacing: '0.06em', color: 'rgba(0,0,0,0.6)' }}>
        ({timeline.duration})
      </div>
    </div>
  )
}

export default function TimelineSelect() {
  const location = useLocation()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [shaking, setShaking] = useState(false)
  const btnRef = useRef(null)

  const { folderName = 'Digital & Screen', folderColor = '#82DFFD', industry } = location.state || {}

  const handleGo = () => {
    if (!selected) {
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
      return
    }
    navigate('/brief', { state: { folderName, folderColor, industry, timeline: selected } })
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
          <span>03 -</span>
          <span>Select your timeline</span>
          <span>/3</span>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          {TIMELINES.map((t) => (
            <TimelineCard
              key={t.id}
              timeline={t}
              isSelected={selected === t.id}
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
