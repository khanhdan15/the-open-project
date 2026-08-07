import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useUser } from '../context/UserContext'

const HN = '-apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

const inputStyle = {
  width: '100%',
  fontFamily: HN,
  fontSize: '13px',
  color: '#0A0A0A',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(0,0,0,0.18)',
  borderRadius: 0,
  padding: '8px 0',
  outline: 'none',
  boxSizing: 'border-box',
  display: 'block',
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        fontFamily: HN, fontSize: '9px', textTransform: 'uppercase',
        letterSpacing: '0.1em', color: '#999', marginBottom: '6px',
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function SectionSep({ label }) {
  return (
    <div style={{ margin: '28px 0 20px' }}>
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', marginBottom: '14px' }} />
      <div style={{ fontFamily: HN, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999' }}>
        {label}
      </div>
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { user, loading, updateProfile } = useUser()

  const [form, setForm] = useState({
    name: '', title: '', bio: '', workExperience: '',
    instagram: '', linkedin: '', behance: '', cvUrl: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!loading && !user) navigate('/signup', { replace: true })
  }, [user, loading, navigate])

  // Pre-fill from the current profile once it's loaded
  useEffect(() => {
    if (!user) return
    const p = user.user_metadata || {}
    setForm({
      name: p.name || '',
      title: p.title || '',
      bio: p.bio || '',
      workExperience: p.workExperience || '',
      instagram: p.instagram || '',
      linkedin: p.linkedin || '',
      behance: p.behance || '',
      cvUrl: p.cvUrl || '',
    })
  }, [user])

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError(null)
    setSaved(false)
    const { error: saveError } = await updateProfile(form) || {}
    setSaving(false)
    if (saveError) {
      setError(saveError.message || 'Failed to save. Please try again.')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page-enter" style={{ background: '#F8F7F4', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ width: '100%', maxWidth: '560px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontFamily: HN, fontSize: '24px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0A0A0A' }}>
            Edit Profile
          </div>
          <button
            onClick={() => navigate('/portfolio')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: HN, fontSize: '11px', color: '#999', padding: 0 }}
          >
            ← Back to portfolio
          </button>
        </div>
        <div style={{ fontFamily: HN, fontSize: '12px', color: '#999', marginBottom: '28px' }}>
          This is what shows on your public portfolio.
        </div>

        <Field label="Name">
          <input style={inputStyle} placeholder="Your name" value={form.name} onChange={set('name')} />
        </Field>

        <Field label="Title / Role">
          <input style={inputStyle} placeholder="e.g. Graphic Designer, Art Director" value={form.title} onChange={set('title')} />
        </Field>

        <Field label="Bio">
          <textarea
            style={{ ...inputStyle, resize: 'none', height: '80px', paddingTop: '8px', lineHeight: 1.6 }}
            placeholder="A short description about you"
            value={form.bio}
            onChange={set('bio')}
          />
        </Field>

        <SectionSep label="Work Experience" />

        <Field label="Experience">
          <textarea
            style={{ ...inputStyle, resize: 'none', height: '120px', paddingTop: '8px', lineHeight: 1.6 }}
            placeholder={'Studio Name — Role (2023–Present)\nAnother Studio — Role (2021–2023)'}
            value={form.workExperience}
            onChange={set('workExperience')}
          />
        </Field>

        <SectionSep label="Links" />

        <div className="responsive-grid-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Instagram">
            <input style={inputStyle} placeholder="@yourhandle" value={form.instagram} onChange={set('instagram')} />
          </Field>
          <Field label="LinkedIn">
            <input style={inputStyle} placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={set('linkedin')} />
          </Field>
          <Field label="Behance">
            <input style={inputStyle} placeholder="https://behance.net/..." value={form.behance} onChange={set('behance')} />
          </Field>
          <Field label="CV Link">
            <input style={inputStyle} placeholder="Link to your CV (Drive, PDF, etc.)" value={form.cvUrl} onChange={set('cvUrl')} />
          </Field>
        </div>

        {error && (
          <div style={{ fontFamily: HN, fontSize: '11px', color: '#E84A4A', marginTop: '4px', marginBottom: '10px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', marginTop: '16px',
            background: '#D4E84A', color: '#0A0A0A',
            fontFamily: HN, fontSize: '11px', textTransform: 'uppercase',
            letterSpacing: '0.1em', padding: '14px',
            border: 'none', borderRadius: 0, cursor: saving ? 'default' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
