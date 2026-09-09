import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import Logo from './Logo'
import { COLORS } from '../lib/theme'
import briefIcon from '../assets/brief-icon.png'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

// `dark` flips the header to the brief-generator dark theme — used only on
// the discipline/industry/timeline pickers and the brief result page.
// Every other page renders the normal light header.
export default function Header({ dark = false }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, signOut } = useUser()

  const isAccount = ['/portfolio', '/settings'].includes(pathname)

  const handleAccountClick = () => {
    if (user) navigate('/portfolio')
    else navigate('/signup')
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const textColor = dark ? COLORS.darkText : '#0A0A0A'
  const borderColor = dark ? COLORS.darkBorder : 'rgba(0,0,0,0.15)'
  const mutedColor = dark ? COLORS.darkMuted : '#999'
  // brief-icon.png keeps its original blue in both themes — it doesn't
  // invert/recolor for dark mode like the rest of the header.
  const briefIconFilter = 'none'

  const cellStyle = {
    display: 'flex', alignItems: 'center',
    borderRight: `1px solid ${borderColor}`,
    boxSizing: 'border-box',
  }

  return (
    <header className="app-header" style={{
      display: 'flex', width: '100%', height: '56px',
      borderBottom: `1px solid ${borderColor}`,
      background: dark ? COLORS.darkCard : '#FFFFFF', boxSizing: 'border-box',
    }}>

      {/* Logo cell */}
      <div
        onClick={() => navigate('/')}
        className="app-header-left app-header-logo"
        style={{ ...cellStyle, width: '90px', flexShrink: 0, padding: '0 10px', cursor: 'pointer' }}
      >
        <Logo size={29} invert={dark} />
      </div>

      {/* Nav cell — kept mostly open, per the identity mockups. Community
          is hidden for now while the visual pass is in progress. */}
      <div className="app-header-center app-header-nav" style={{ ...cellStyle, flex: 1, padding: '0 24px', gap: '16px' }}>
        {user && (
          <button
            onClick={handleSignOut}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: HN, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
              color: mutedColor, marginLeft: 'auto',
            }}
          >
            Sign out
          </button>
        )}
      </div>

      {/* Brief generator icon cell */}
      <div className="app-header-right app-header-icon" style={{ ...cellStyle, width: '110px', flexShrink: 0, justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/new')}
          title="Start a new brief"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <img src={briefIcon} alt="Start a new brief" style={{ height: '30px', width: 'auto', display: 'block', filter: briefIconFilter }} />
        </button>
      </div>

      {/* Account cell — text label on desktop, a classic person/account
          glyph on mobile (toggled purely via CSS, see .account-label-*
          rules) so the right-hand corner stays compact on small screens. */}
      <div
        onClick={handleAccountClick}
        className="app-header-account"
        style={{
          width: '190px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <span
          className="account-pill"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2px 16px', borderRadius: '999px', color: textColor,
            background: isAccount ? '#83C7F9' : 'transparent',
          }}
        >
          <span className="account-label-text" style={{
            fontFamily: HN, fontSize: '20px', letterSpacing: '0.02em', textTransform: 'lowercase',
            color: 'inherit',
          }}>
            account
          </span>
          <svg className="account-label-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </div>

    </header>
  )
}
