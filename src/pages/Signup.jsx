import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useUser } from '../context/UserContext'

const HN = '-apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'
const SERIF = '"BIZ UDMincho", serif'

const inputStyle = {
  width: '100%',
  fontFamily: HN,
  fontSize: '14px',
  fontWeight: 400,
  color: '#0A0A0A',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #0A0A0A',
  borderRadius: 0,
  padding: '8px 0',
  outline: 'none',
  boxSizing: 'border-box',
  display: 'block',
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        fontFamily: HN, fontSize: '10px', fontWeight: 400,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        color: '#999', marginBottom: '6px',
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const { saveUser } = useUser()

  const [form, setForm] = useState({
    displayName: '',
    title: '',
    bio: '',
    instagram: '',
    behance: '',
    linkedin: '',
  })
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.displayName.trim()) {
      setError('Display name is required.')
      return
    }
    saveUser({ ...form })
    navigate('/portfolio')
  }

  return (
    <div className="page-enter" style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto', padding: '80px 24px 60px', flex: 1 }}>

        <div style={{ margin: '0 auto 32px', lineHeight: 1.05, textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 400, color: '#1B3A5C', textTransform: 'uppercase' }}>
            <span style={{ fontFamily: HN }}>Create</span>
            <span style={{ fontFamily: SERIF }}> Your</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 400, color: '#1B3A5C', textTransform: 'uppercase' }}>
            <span style={{ fontFamily: SERIF }}>Top</span>
            <span style={{ fontFamily: HN }}> Portfolio</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <Field label="Your Name">
            <input
              style={inputStyle}
              placeholder="Display name"
              value={form.displayName}
              onChange={set('displayName')}
              autoFocus
            />
          </Field>

          <Field label="Your Title">
            <input
              style={inputStyle}
              placeholder="e.g. Brand Designer, UX Designer"
              value={form.title}
              onChange={set('title')}
            />
          </Field>

          <Field label={`Short Bio — ${form.bio.length}/160`}>
            <textarea
              style={{ ...inputStyle, resize: 'none', height: '72px', paddingTop: '8px', lineHeight: 1.6 }}
              placeholder="Two sentences about you"
              maxLength={160}
              value={form.bio}
              onChange={set('bio')}
            />
          </Field>

          <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', margin: '8px 0 16px' }} />

          <Field label="Instagram">
            <input
              style={inputStyle}
              placeholder="@username"
              value={form.instagram}
              onChange={set('instagram')}
            />
          </Field>

          <Field label="Behance">
            <input
              style={inputStyle}
              placeholder="behance.net/username"
              value={form.behance}
              onChange={set('behance')}
            />
          </Field>

          <Field label="LinkedIn">
            <input
              style={inputStyle}
              placeholder="linkedin.com/in/username"
              value={form.linkedin}
              onChange={set('linkedin')}
            />
          </Field>

          {error && (
            <div style={{ fontFamily: HN, fontSize: '12px', color: '#E84AC8', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: '32px',
              width: '100%',
              background: '#0A0A0A',
              color: '#FFFFFF',
              fontFamily: HN,
              fontSize: '13px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '14px',
              border: 'none',
              borderRadius: 0,
              cursor: 'pointer',
            }}
          >
            Create my portfolio →
          </button>
        </form>
      </div>
    </div>
  )
}
