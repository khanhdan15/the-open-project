import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import Logo from './Logo'
import briefIcon from '../assets/brief-icon.png'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

export default function Header() {
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

  const cellStyle = {
    display: 'flex', alignItems: 'center',
    borderRight: '1px solid rgba(0,0,0,0.15)',
    boxSizing: 'border-box',
  }

  return (
    <header className="app-header" style={{
      display: 'flex', width: '100%', height: '56px',
      borderBottom: '1px solid rgba(0,0,0,0.15)',
      background: '#FFFFFF', boxSizing: 'border-box',
    }}>

      {/* Logo cell */}
      <div
        onClick={() => navigate('/')}
        className="app-header-left"
        style={{ ...cellStyle, width: '90px', flexShrink: 0, padding: '0 10px', cursor: 'pointer' }}
      >
        <Logo size={26} />
      </div>

      {/* Nav cell — kept mostly open, per the identity mockups. Community
          is hidden for now while the visual pass is in progress. */}
      <div className="app-header-center" style={{ ...cellStyle, flex: 1, padding: '0 24px', gap: '16px' }}>
        {user && (
          <button
            onClick={handleSignOut}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: HN, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#999', marginLeft: 'auto',
            }}
          >
            Sign out
          </button>
        )}
      </div>

      {/* Brief generator icon cell */}
      <div className="app-header-right" style={{ ...cellStyle, width: '110px', flexShrink: 0, justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/new')}
          title="Start a new brief"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <img src={briefIcon} alt="Start a new brief" style={{ height: '30px', width: 'auto', display: 'block' }} />
        </button>
      </div>

      {/* Account cell */}
      <div
        onClick={handleAccountClick}
        style={{
          width: '190px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <span style={{
          fontFamily: HN, fontSize: '20px', letterSpacing: '0.02em', textTransform: 'lowercase',
          color: '#0A0A0A',
          padding: '2px 16px', borderRadius: '999px',
          background: isAccount ? '#83C7F9' : 'transparent',
        }}>
          account
        </span>
      </div>

    </header>
  )
}
