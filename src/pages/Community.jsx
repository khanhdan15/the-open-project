import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'
const SERIF = '"BIZ UDMincho", serif'

const COMMUNITY_CARDS = [
  { color: '#E84AC8', title: 'Brand Refresh', designer: 'Sara K.' },
  { color: '#D4E84A', title: 'Type System', designer: 'James L.' },
  { color: '#60DDE6', title: 'Digital Archive', designer: 'Mia T.' },
  { color: '#FF6B6B', title: 'Motion Piece', designer: 'Alex R.' },
]

export default function Community() {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState(null)

  return (
    <div className="page-enter" style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* SECTION 1 — Awwwards-style winner highlight */}
      <div style={{ padding: '60px 50px 0 50px' }}>

        {/* Top label */}
        <div style={{ fontFamily: HN, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#999', textAlign: 'center', marginBottom: '16px' }}>
          Weekly Challenge Winner
        </div>

        {/* Big project title */}
        <div style={{
          fontFamily: SERIF,
          fontSize: 'clamp(56px, 8vw, 112px)',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: '#0A0A0A',
          textAlign: 'center',
          lineHeight: 1.0,
          marginBottom: '24px',
        }}>
          The Challenge Title
        </div>

        {/* Creator row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#D8D8D8', flexShrink: 0 }} />
            <span style={{ fontFamily: HN, fontSize: '13px', fontWeight: 500, color: '#0A0A0A' }}>Creator Name</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#D8D8D8', flexShrink: 0 }} />
            <span style={{ fontFamily: HN, fontSize: '13px', fontWeight: 500, color: '#0A0A0A' }}>Second Creator</span>
          </div>
        </div>

        {/* Cover image box — green frame, image inside */}
        <div style={{
          marginTop: '32px',
          width: '100%',
          background: '#D4E84A',
          borderRadius: '16px 16px 0 0',
          padding: '24px 24px 0 24px',
        }}>
          {/* Image */}
          <div style={{
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: '12px 12px 0 0',
            background: 'rgba(255,255,255,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: HN, fontSize: '11px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.3)' }}>
              Winner Submission
            </span>
          </div>

          {/* Bottom info bar inside green box */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 16px 0' }}>
            <span style={{ fontFamily: HN, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(0,0,0,0.5)' }}>
              300 Submissions
            </span>
            <button
              onClick={() => navigate('/weekly-challenge')}
              style={{ background: 'none', border: 'none', padding: 0, fontFamily: HN, fontSize: '10px', textTransform: 'uppercase', color: '#0A0A0A', textDecoration: 'underline', cursor: 'pointer' }}
            >
              View Details →
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2 — Weekly Challenge Card (conic-gradient rotating border) */}
      <div style={{ marginTop: '24px', padding: '0 40px 24px' }}>
        <div
          className="gradient-border-wrap"
          style={{ borderRadius: '10px', cursor: 'pointer' }}
          onClick={() => navigate('/weekly-challenge')}
        >
          <div className="gradient-border-inner" style={{ borderRadius: '8px', padding: '24px 32px' }}>
            <div style={{ fontFamily: HN, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#999', textAlign: 'center', marginBottom: '12px' }}>
              Join this week's challenge now
            </div>
            <div style={{
              fontFamily: SERIF, fontSize: '28px', fontWeight: 700,
              color: '#0A0A0A', textTransform: 'uppercase', lineHeight: 1.1,
              whiteSpace: 'nowrap', overflow: 'hidden',
              WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 100%)',
              maskImage: 'linear-gradient(to right, black 60%, transparent 100%)',
            }}>
              Visual Identity for an Independent Fashion Archive...
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3 — Community Highlight (Awwwards gallery style) */}
      <div style={{ padding: '48px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px', padding: '0 50px' }}>
          <div style={{ fontFamily: HN, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0A0A0A' }}>
            Community Highlight
          </div>
          <div style={{ fontFamily: HN, fontSize: '10px', color: '#999' }}>Refreshes daily</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', padding: '0 50px' }}>
          {COMMUNITY_CARDS.map((card, i) => {
            const isHovered = hoveredCard === i
            return (
              <div
                key={i}
                onClick={() => console.log('open community project', i)}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Card image area */}
                <div style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}>
                  {/* Image placeholder */}
                  <div style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    background: '#D8D8D8',
                    display: 'block',
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    transition: 'transform 0.4s ease',
                  }} />

                  {/* Hover overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.35)',
                    borderRadius: '12px',
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                  }}>
                    {/* Arrow icon */}
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      color: '#0A0A0A',
                    }}>
                      ↗
                    </div>
                  </div>
                </div>

                {/* Meta below card */}
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px', height: '8px',
                      borderRadius: '50%',
                      background: card.color,
                      marginRight: '6px',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontFamily: HN, fontSize: '14px', fontWeight: 500, color: '#0A0A0A' }}>{card.title}</span>
                  </div>
                  <span style={{ fontFamily: HN, fontSize: '12px', color: '#999' }}>by {card.designer}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SECTION 4 — Design Quote */}
      <div style={{ padding: '48px 40px', borderTop: '1px solid rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <p style={{
          fontFamily: SERIF, fontSize: '22px', fontStyle: 'italic',
          color: '#0A0A0A', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6,
        }}>
          "Design is not just what it looks like and feels like. Design is how it works."
        </p>
        <div style={{ fontFamily: HN, fontSize: '11px', color: '#999', marginTop: '12px' }}>
          — Steve Jobs
        </div>
        <div style={{ fontFamily: HN, fontSize: '9px', color: '#bbb', marginTop: '8px' }}>
          Quote refreshes daily
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #0A0A0A', marginTop: 'auto' }} />
    </div>
  )
}
