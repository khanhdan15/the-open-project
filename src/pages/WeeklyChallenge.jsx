import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { useUser } from '../context/UserContext'
import { generateChallengeBrief } from '../lib/generateBrief'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'
const SERIF = '"BIZ UDMincho", serif'

// Change this each week to set the discipline for the live challenge
const WEEKLY_DISCIPLINE = 'Brand & Identity'

const CHALLENGE_COLOR = '#4a9aba'

const ISSUED = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

function ChallengeTab({ onClose }) {
  const W = 264
  const H = 54
  const sw = 1.5
  const o = sw / 2
  const d = [
    `M ${o},${H}`,
    `L ${o},${o}`,
    `L 194,${o}`,
    `C 236,${o} ${W - o},17 ${W - o},${H}`,
    `Z`,
  ].join(' ')

  return (
    <div style={{ position: 'relative', width: `${W}px`, height: `${H}px`, flexShrink: 0, zIndex: 1, marginBottom: '-1.5px' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" style={{ position: 'absolute', top: 0, left: 0, display: 'block' }}>
        <path d={d} fill="#FFFFFF" stroke={CHALLENGE_COLOR} strokeWidth={sw} strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', padding: '0 46px 0 10px' }}>
        <div>
          <div style={{ fontFamily: HN, fontSize: '14px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0A0A0A', lineHeight: 1.0 }}>
            Challenge 001
          </div>
          <div style={{ fontFamily: HN, fontSize: '10px', fontWeight: 400, textTransform: 'uppercase', color: '#0A0A0A', lineHeight: 1.0, marginTop: '3px' }}>
            {ISSUED}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,0,0,0.07)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, fontSize: '14px', lineHeight: 1, color: '#0A0A0A' }}
        >
          ×
        </button>
      </div>
    </div>
  )
}

function MetaCol({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: HN, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: '5px' }}>{label}</div>
      <div style={{ fontFamily: HN, fontSize: '14px', color: '#0A0A0A' }}>{value}</div>
    </div>
  )
}

export default function WeeklyChallenge() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addSavedBrief } = useUser()

  const { savedChallenge } = location.state || {}

  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joined, setJoined] = useState(!!savedChallenge)
  const [saved, setSaved] = useState(false)

  const categoryColor = CHALLENGE_COLOR

  useEffect(() => {
    async function load() {
      if (savedChallenge) {
        setChallenge(savedChallenge)
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const result = await generateChallengeBrief(WEEKLY_DISCIPLINE)
        setChallenge(result)
      } catch (e) {
        console.error(e)
        setError("Failed to load this week's challenge.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = () => {
    if (!challenge) return
    addSavedBrief({ ...challenge, categoryColor, isChallenge: true, status: 'ongoing' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleJoinChallenge = () => {
    if (joined || !challenge) return
    addSavedBrief({
      ...challenge,
      isChallenge: true,
      status: 'ongoing',
      categoryColor: CHALLENGE_COLOR,
    })
    setJoined(true)
  }

  return (
    <div className="page-enter" style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ width: '80vw', margin: '20px auto 40px' }}>

        {/* Loading state */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
            <div className="brief-loading-bar">
              <div className="brief-loading-fill" style={{ background: CHALLENGE_COLOR }} />
            </div>
            <p style={{ fontFamily: 'Helvetica Neue', fontSize: '12px', color: '#999', letterSpacing: '0.08em', margin: 0 }}>
              LOADING THIS WEEK'S CHALLENGE
            </p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <p style={{ textAlign: 'center', color: '#999', marginTop: '20vh', fontFamily: HN, fontSize: '13px' }}>
            {error}
          </p>
        )}

        {/* Challenge content */}
        {!loading && !error && challenge && (
          <>
            {/* CHALLENGE 001 tab */}
            <ChallengeTab onClose={() => navigate('/community')} />

            {/* Card with animated gradient border */}
            <div className="gradient-border-wrap" style={{ borderRadius: '0 8px 8px 8px', marginTop: 0, paddingTop: '2px' }}>
              <div className="gradient-border-inner" style={{ borderRadius: '0 7px 7px 7px', position: 'relative' }}>

                {/* Colored rule */}
                <div style={{ borderTop: `1px solid ${categoryColor}`, width: '80%', margin: '20px auto 0', padding: 0 }} />

                {/* Top section */}
                <div style={{ padding: '48px 48px 48px', textAlign: 'center' }}>
                  <h1 style={{ fontFamily: SERIF, fontSize: '56px', fontWeight: 700, color: '#0A0A0A', lineHeight: 1.1, margin: '0 0 32px' }}>
                    {challenge.title}
                  </h1>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '24px' }}>
                    <MetaCol label="Client" value={challenge.client} />
                    <MetaCol label="Industry" value={challenge.industry} />
                    <MetaCol label="Format" value={challenge.format} />
                  </div>
                  <p style={{ fontFamily: HN, fontSize: '14px', lineHeight: 1.8, textAlign: 'justify', width: '50%', margin: '0 auto', paddingTop: '20px', color: '#0A0A0A' }}>
                    {challenge.summary}
                  </p>
                </div>

                {/* Details section */}
                <div style={{ background: categoryColor, margin: '0 24px 0', borderRadius: '4px 4px 0 0' }}>
                  <div style={{ fontFamily: HN, fontSize: '11px', color: 'rgba(0,0,0,0.55)', padding: '12px 20px' }}>Details brief</div>
                  <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(0,0,0,0.15)' }}>
                      {Object.entries(challenge.details || {}).map(([key, value]) => (
                        <div key={key} style={{ background: categoryColor, padding: '14px 16px' }}>
                          <div style={{ fontFamily: HN, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.5)', marginBottom: '8px' }}>{key}</div>
                          <p style={{ fontFamily: HN, fontSize: '14px', color: '#0A0A0A', lineHeight: 1.8, margin: 0 }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '16px 24px', borderTop: '1px solid rgba(0,0,0,0.1)', background: '#FFFFFF', margin: '0 24px', borderRadius: '0 0 4px 4px' }}>
                  <button style={{ fontFamily: HN, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid rgba(0,0,0,0.2)', background: 'transparent', color: '#0A0A0A', padding: '10px 22px', borderRadius: '2px' }}>
                    Export Brief
                  </button>
                  <button onClick={handleSave} style={{ fontFamily: HN, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid rgba(0,0,0,0.15)', background: categoryColor, color: '#0A0A0A', padding: '10px 22px', borderRadius: '2px' }}>
                    {saved ? 'Saved ✓' : 'Save Brief'}
                  </button>
                  {joined ? (
                    <div style={{ fontFamily: HN, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: CHALLENGE_COLOR, padding: '10px 22px' }}>
                      Challenge Joined ✓
                    </div>
                  ) : (
                    <button onClick={handleJoinChallenge} style={{ fontFamily: HN, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', background: '#0A0A0A', color: '#FFFFFF', padding: '10px 22px', borderRadius: '2px' }}>
                      Join Challenge →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ borderTop: '1px solid #0A0A0A', marginTop: 'auto' }} />
    </div>
  )
}
