import { useEffect, useState } from 'react'
import logo from '../assets/logo.png'

// The real logo file rotated into place around the O's center (measured at
// ~30%/69% of the artwork), settling from a steeper angle into its natural
// drawn pose.
export default function LoadingScreen({ fixed = true, label = 'LOADING' }) {
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 150)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="grid-paper"
      style={{
        position: fixed ? 'fixed' : 'relative',
        inset: fixed ? 0 : undefined,
        minHeight: fixed ? undefined : '60vh',
        width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '20px',
        zIndex: 300,
      }}
    >
      <img
        src={logo}
        alt="Open Ruler"
        style={{
          height: '160px', width: 'auto',
          transformOrigin: '30% 69%',
          transform: settled ? 'rotate(0deg)' : 'rotate(-55deg)',
          transition: 'transform 1s cubic-bezier(0.65, 0, 0.35, 1)',
        }}
      />

      {label && (
        <div style={{
          fontFamily: '-apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: '11px', letterSpacing: '0.15em', color: '#999',
        }}>
          {label}
        </div>
      )}
    </div>
  )
}
