import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const HN = '-apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'
const SERIF = '"BIZ UDMincho", serif'

const FOLDERS = [
  {
    id: 1,
    name: 'Brand & Identity',
    color: '#D4E84A',
    disciplines: ['Branding', 'Visual Identity', 'Packaging'],
  },
  {
    id: 2,
    name: 'Print & Type',
    color: '#E84AC8',
    disciplines: ['Editorial', 'Publication', 'Typeface', 'Lettering'],
  },
  {
    id: 3,
    name: 'Digital & Screen',
    color: '#60DDE6',
    disciplines: ['UI/UX', 'Web Design', 'Digital Product'],
  },
  {
    id: 4,
    name: 'Image & Direction',
    color: '#4AE87A',
    disciplines: ['Art Direction', 'Campaign', 'Photography', 'Motion'],
  },
]

function FolderCard({ folder, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => onSelect(folder.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '160px',
        minHeight: '320px',
        background: folder.color,
        border: isSelected ? '1.5px solid #0A0A0A' : 'none',
        borderRadius: 0,
        cursor: 'pointer',
        transform: isSelected ? 'rotate(-2deg) scale(1.02)' : hovered ? 'scale(1.02)' : 'none',
        transition: 'transform 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      {/* Category name */}
      <div style={{
        padding: '20px 12px 12px',
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: HN,
          fontSize: '18px',
          fontWeight: 400,
          textTransform: 'uppercase',
          color: '#0A0A0A',
          textAlign: 'center',
          lineHeight: 1.3,
        }}>
          {folder.name}
        </div>
      </div>

      {/* Disciplines */}
      <div style={{ padding: '12px 14px 20px' }}>
        {folder.disciplines.map((d) => (
          <div key={d} style={{
            fontFamily: HN,
            fontSize: '10px',
            color: 'rgba(0,0,0,0.6)',
            lineHeight: 1.9,
          }}>
            · {d}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function FolderSelect() {
  const [selected, setSelected] = useState(null)
  const [shaking, setShaking] = useState(false)
  const [arrowHovered, setArrowHovered] = useState(false)
  const navigate = useNavigate()
  const btnRef = useRef(null)

  const handleSelect = (id) => setSelected((prev) => (prev === id ? null : id))

  const handleGo = () => {
    if (!selected) {
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
      return
    }
    const folder = FOLDERS.find((f) => f.id === selected)
    navigate('/brief', { state: { folderName: folder.name, folderColor: folder.color } })
  }

  return (
    <div className="page-enter" style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Subtitle */}
      <div style={{
        textAlign: 'center',
        padding: '36px 24px 44px',
        fontFamily: HN,
        fontSize: '16px',
        fontWeight: 400,
        color: '#0A0A0A',
      }}>
        Choose Your Discipline for your design brief
      </div>

      {/* Cards */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        padding: '0 32px',
        flex: 1,
      }}>
        {FOLDERS.map((folder) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            isSelected={selected === folder.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Circle arrow */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '52px 24px 48px' }}>
        <button
          ref={btnRef}
          onClick={handleGo}
          onMouseEnter={() => setArrowHovered(true)}
          onMouseLeave={() => setArrowHovered(false)}
          className={shaking ? 'shake' : ''}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: '1.5px solid #0A0A0A',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: '#0A0A0A',
          }}
        >
          →
        </button>
        <div style={{
          marginTop: '10px',
          fontFamily: HN,
          fontSize: '11px',
          color: '#0A0A0A',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          opacity: arrowHovered ? 0.5 : 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none',
        }}>
          Generate Brief
        </div>
      </div>

      {/* Footer rule */}
      <div style={{ width: '100%', borderTop: '1px solid #0A0A0A', marginTop: 'auto' }} />
    </div>
  )
}
