import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'

const HN    = '-apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'
const SERIF = '"BIZ UDMincho", serif'

export default function Header({ showRegenerate = false, onRegenerate }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, signOut } = useUser()

  const isBriefGen  = pathname === '/' || pathname === '/brief'
  const isCommunity = pathname === '/community' || pathname === '/weekly-challenge'
  const isAccount   = ['/portfolio', '/settings'].includes(pathname)

  const handleAccountClick = () => {
    if (user) navigate('/portfolio')
    else navigate('/signup')
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const btnBase = {
    fontFamily: HN,
    fontSize: '11px',
    fontWeight: '500',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    border: '1px solid #0A0A0A',
    borderRadius: '4px',
    padding: '6px 14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  }

  const btnActive   = { ...btnBase, background: '#0A0A0A', color: '#FFFFFF' }
  const btnInactive = { ...btnBase, background: 'transparent', color: '#0A0A0A' }

  return (
    <header style={{
      position: 'relative', display: 'flex', alignItems: 'center',
      justifyContent: 'flex-end',
      width: '100%', padding: '12px 20px', borderBottom: '1px solid #0A0A0A',
      background: '#FFFFFF', boxSizing: 'border-box',
    }}>

      {/* Left: Brief Generator + Community */}
      <div style={{ position: 'absolute', left: '20px', display: 'flex', gap: '6px' }}>
        <button onClick={() => navigate('/')}
          style={isBriefGen ? btnActive : btnInactive}>
          Brief Generator
        </button>
        <button onClick={() => navigate('/community')}
          style={isCommunity ? btnActive : btnInactive}>
          Community
        </button>
      </div>

      {/* Center: THE (OPEN) PROJECT */}
      <div style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        textAlign: 'center', fontFamily: SERIF, lineHeight: 1.1,
      }}>
        <div style={{ fontSize: '14px', letterSpacing: '0.05em' }}>
          THE <span style={{ fontStyle: 'italic' }}>(OPEN)</span>
        </div>
        <div style={{ fontSize: '14px', letterSpacing: '0.05em' }}>PROJECT</div>
      </div>

      {/* Right: Account or Sign out */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {user && (
          <button onClick={handleSignOut} style={btnInactive}>
            Sign out
          </button>
        )}
        <button onClick={handleAccountClick}
          style={isAccount ? btnActive : btnInactive}>
          {user ? 'Account' : 'Sign in'}
        </button>
      </div>

    </header>
  )
}
