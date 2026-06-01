import { useNavigate, useLocation } from 'react-router-dom'

const HN = '-apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'
const SERIF = '"BIZ UDMincho", serif'

export default function Header({ showRegenerate = false, onRegenerate }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isBriefGen  = pathname === '/' || pathname === '/brief'
  const isCommunity = pathname === '/community' || pathname === '/weekly-challenge'
  const isAccount   = ['/portfolio', '/settings'].includes(pathname)

  return (
    <header style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: '12px 20px',
      borderBottom: '1px solid #0A0A0A',
      background: '#FFFFFF',
      boxSizing: 'border-box',
    }}>
      {/* Left: Brief Generator + Community — absolute left */}
      <div style={{ position: 'absolute', left: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: isBriefGen ? '#0A0A0A' : 'transparent',
            color: isBriefGen ? '#FFFFFF' : '#0A0A0A',
            fontFamily: HN, fontSize: '13px', fontWeight: 400,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '8px 14px', border: 'none', borderRadius: '4px',
          }}
        >
          Brief Generator
        </button>
        <button
          onClick={() => navigate('/community')}
          style={{
            background: isCommunity ? '#0A0A0A' : 'transparent',
            color: isCommunity ? '#FFFFFF' : '#0A0A0A',
            fontFamily: HN, fontSize: '13px', fontWeight: 400,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '8px 14px', border: 'none', borderRadius: '4px',
          }}
        >
          Community
        </button>
      </div>

      {/* Center: THE (OPEN) / PROJECT — perfectly centered in viewport */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', lineHeight: 1.05, textAlign: 'left' }}>
        <div style={{ whiteSpace: 'nowrap' }}>
          <span style={{ fontFamily: HN, fontWeight: 400, fontSize: '22px', letterSpacing: '0.05em', color: '#0A0A0A', textTransform: 'uppercase' }}>THE </span>
          <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '22px', color: '#0A0A0A' }}>(OPEN)</span>
        </div>
        <div style={{ fontFamily: HN, fontWeight: 400, fontSize: '22px', letterSpacing: '0.05em', color: '#0A0A0A', textTransform: 'uppercase' }}>
          PROJECT
        </div>
      </div>

      {/* Right: Regenerate + Account — absolute right */}
      <div style={{ position: 'absolute', right: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {showRegenerate && (
          <button
            onClick={onRegenerate}
            title="Regenerate brief"
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              border: '1.5px solid #0A0A0A', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', color: '#0A0A0A',
            }}
          >
            ↻
          </button>
        )}
        <button
          onClick={() => navigate('/portfolio')}
          style={{
            fontFamily: HN, fontSize: '13px', fontWeight: 400,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            color: isAccount ? '#FFFFFF' : '#0A0A0A',
            background: isAccount ? '#0A0A0A' : 'transparent',
            border: 'none', borderRadius: '4px', padding: '8px 14px',
          }}
        >
          Account
        </button>
      </div>

      {/* Spacer so header has intrinsic height from logo */}
      <div style={{ visibility: 'hidden', lineHeight: 1.05 }}>
        <div style={{ fontSize: '22px' }}>THE (OPEN)</div>
        <div style={{ fontSize: '22px' }}>PROJECT</div>
      </div>
    </header>
  )
}
