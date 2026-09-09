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

        <button
          onClick={() => navigate('/community')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: HN, fontSize: '11px', color: '#999', padding: 0, marginBottom: '16px',
          }}
        >
          ← Back to community
        </button>

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
            {/* Card with animated gradient border */}
            <div className="gradient-border-wrap" style={{ borderRadius: '8px', marginTop: 0 }}>
              <div className="gradient-border-inner" style={{ borderRadius: '7px', position: 'relative' }}>

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
