import { useState, useRef } from 'react'
import { useUser } from '../context/UserContext'

const HN = '-apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

const FOLDER_OPTIONS = [
  { name: 'Brand & Identity', color: '#D4E84A' },
  { name: 'Print & Type',     color: '#E84AC8' },
  { name: 'Digital & Screen', color: '#60DDE6' },
  { name: 'Image & Direction',color: '#4AE87A' },
  { name: 'Art & Space',      color: '#E8804A' },
]

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

function Field({ label, error, children, compact }) {
  return (
    <div style={{ marginBottom: compact ? 0 : '20px' }}>
      <div style={{
        fontFamily: HN, fontSize: '9px', textTransform: 'uppercase',
        letterSpacing: '0.1em', color: error ? '#E84AC8' : '#999', marginBottom: '6px',
      }}>
        {label}{error ? ` — ${error}` : ''}
      </div>
      {children}
    </div>
  )
}

function SectionSep({ label, optional }) {
  return (
    <div style={{ margin: '28px 0 20px' }}>
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', marginBottom: '14px' }} />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <div style={{ fontFamily: HN, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999' }}>
          {label}
        </div>
        {optional && (
          <span style={{ fontFamily: HN, fontSize: '9px', fontStyle: 'italic', color: '#bbb' }}>(optional)</span>
        )}
      </div>
    </div>
  )
}

function readAsBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}

export default function AddProjectModal({ onClose, onAdded }) {
  const { addSubmittedProject } = useUser()

  const [form, setForm] = useState({
    title: '', discipline: '', client: '', tools: '',
    brief: '', targetAudience: '', constraints: '',
    description: '', role: '', collaborators: '', projectLink: '', year: '2025',
  })
  const [coverPreview, setCoverPreview] = useState(null)
  const [coverBase64, setCoverBase64] = useState(null)
  const [extraThumbs, setExtraThumbs] = useState([])
  const [extraBase64, setExtraBase64] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const coverRef = useRef(null)
  const imagesRef = useRef(null)

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleCover = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCoverPreview(URL.createObjectURL(file))
    setCoverBase64(await readAsBase64(file))
    setErrors((prev) => ({ ...prev, coverImage: undefined }))
  }

  const handleImages = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const thumbs = files
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => URL.createObjectURL(f))
    setExtraThumbs(thumbs)
    setExtraBase64(await Promise.all(files.map(readAsBase64)))
  }

  const handleSubmit = async () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Required'
    if (!form.discipline) newErrors.discipline = 'Required'
    if (!coverBase64) newErrors.coverImage = 'Required'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    const folder = FOLDER_OPTIONS.find((f) => f.name === form.discipline)

    setSubmitting(true)
    setSubmitError(null)

    const result = await addSubmittedProject({
      title: form.title,
      discipline: form.discipline,
      folderColor: folder?.color || '#60DDE6',
      coverImage: coverBase64,
      images: extraBase64,
      image: coverBase64,
      note: form.description,
      isManual: true,
      brief: {
        brief_id: null,
        title: form.title,
        folder: form.discipline,
        folder_color: folder?.color || '#60DDE6',
        summary: form.brief,
        ask: form.brief,
        constraints: form.constraints
          ? form.constraints.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
        deliverables: [],
        target_audience: form.targetAudience,
        brand_tone: '',
        art_direction: form.description,
        image_prompt: '',
      },
      meta: {
        client: form.client,
        tools: form.tools,
        role: form.role,
        collaborators: form.collaborators,
        projectLink: form.projectLink,
        year: form.year,
      },
    })

    setSubmitting(false)

    if (!result || result.error) {
      setSubmitError(result?.error?.message || 'Failed to save project. Please try again.')
      return
    }

    onAdded()
    onClose()
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div style={{
        background: '#FFFFFF',
        maxWidth: '640px',
        width: '90%',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '40px',
        borderRadius: '5px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: HN, fontSize: '24px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0A0A0A' }}>
            Add Project
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#0A0A0A', lineHeight: 1, padding: 0 }}>
            ×
          </button>
        </div>

        {/* Title + Discipline — full width */}
        <Field label="Project Title" error={errors.title}>
          <input style={inputStyle} placeholder="Project name" value={form.title} onChange={set('title')}
            onFocus={() => setErrors((p) => ({ ...p, title: undefined }))} />
        </Field>

        <Field label="Discipline / Category" error={errors.discipline}>
          <select
            style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
            value={form.discipline} onChange={set('discipline')}
            onFocus={() => setErrors((p) => ({ ...p, discipline: undefined }))}
          >
            <option value="">Select discipline...</option>
            {FOLDER_OPTIONS.map((f) => (
              <option key={f.name} value={f.name}>{f.name}</option>
            ))}
          </select>
        </Field>

        {/* Grid row 1: Client | Tools */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <Field label="Client or Project Type" compact>
            <input style={inputStyle} placeholder="e.g. Personal project, Client name" value={form.client} onChange={set('client')} />
          </Field>
          <Field label="Tools Used" compact>
            <input style={inputStyle} placeholder="e.g. Figma, Illustrator, After Effects" value={form.tools} onChange={set('tools')} />
          </Field>
        </div>

        {/* The Brief (optional) */}
        <SectionSep label="The Brief" optional />

        <Field label="Project Brief">
          <textarea
            style={{ ...inputStyle, resize: 'none', height: '88px', paddingTop: '8px', lineHeight: 1.6 }}
            placeholder="What was the brief or challenge? Describe the problem you were solving."
            value={form.brief} onChange={set('brief')}
          />
        </Field>

        {/* Constraints — full width, optional */}
        <Field label="Constraints (optional)">
          <input style={inputStyle} placeholder="Any limitations or specific requirements? (comma-separated)" value={form.constraints} onChange={set('constraints')} />
        </Field>

        {/* Your Work */}
        <SectionSep label="Your Work" />

        <Field label="Project Description">
          <textarea
            style={{ ...inputStyle, resize: 'none', height: '110px', paddingTop: '8px', lineHeight: 1.6 }}
            placeholder="Describe your approach, process, and intention behind the design decisions."
            value={form.description} onChange={set('description')}
          />
        </Field>

        <Field label="Cover Image" error={errors.coverImage}>
          <div
            onClick={() => coverRef.current?.click()}
            style={{
              border: '1.5px dashed rgba(0,0,0,0.2)', borderRadius: '4px',
              padding: coverPreview ? '8px' : '28px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.02)', overflow: 'hidden', minHeight: '80px',
            }}
          >
            {coverPreview ? (
              <img src={coverPreview} alt="Cover" style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', display: 'block', borderRadius: '2px' }} />
            ) : (
              <span style={{ fontFamily: HN, fontSize: '12px', color: '#999' }}>Click to select cover image</span>
            )}
          </div>
          <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCover} />
        </Field>

        <Field label="Project Images / PDF">
          <div
            onClick={() => imagesRef.current?.click()}
            style={{
              border: '1.5px dashed rgba(0,0,0,0.2)', borderRadius: '4px',
              padding: '16px', cursor: 'pointer',
              background: 'rgba(0,0,0,0.02)', minHeight: '56px',
            }}
          >
            {extraThumbs.length > 0 ? (
              <div>
                <div style={{ fontFamily: HN, fontSize: '11px', color: '#0A0A0A', marginBottom: '8px' }}>
                  {extraBase64.length} {extraBase64.length === 1 ? 'file' : 'files'} selected
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {extraThumbs.map((t, i) => (
                    <img key={i} src={t} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '3px', border: '1px solid rgba(0,0,0,0.1)' }} />
                  ))}
                </div>
              </div>
            ) : (
              <span style={{ fontFamily: HN, fontSize: '12px', color: '#999' }}>Click to select project images or PDF</span>
            )}
          </div>
          <input ref={imagesRef} type="file" accept="image/*,.pdf" multiple style={{ display: 'none' }} onChange={handleImages} />
        </Field>

        {/* Grid rows 2-4: Target Audience | Your Role, Collaborators | Year, Project Link */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <Field label="Target Audience" compact>
            <input style={inputStyle} placeholder="Who was this designed for?" value={form.targetAudience} onChange={set('targetAudience')} />
          </Field>
          <Field label="Your Role" compact>
            <input style={inputStyle} placeholder="e.g. Solo designer, Art Director, UX Lead" value={form.role} onChange={set('role')} />
          </Field>
          <Field label="Collaborators" compact>
            <input style={inputStyle} placeholder="Anyone else involved? (optional)" value={form.collaborators} onChange={set('collaborators')} />
          </Field>
          <Field label="Year" compact>
            <input style={inputStyle} placeholder="2025" value={form.year} onChange={set('year')} />
          </Field>
          <div style={{ gridColumn: 'span 2' }}>
            <Field label="Project Link" compact>
              <input style={inputStyle} placeholder="Live URL or case study link (optional)" value={form.projectLink} onChange={set('projectLink')} />
            </Field>
          </div>
        </div>

        {submitError && (
          <div style={{ fontFamily: HN, fontSize: '11px', color: '#E84A4A', marginBottom: '10px' }}>
            {submitError}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%', marginTop: '8px',
            background: '#D4E84A', color: '#0A0A0A',
            fontFamily: HN, fontSize: '11px', textTransform: 'uppercase',
            letterSpacing: '0.1em', padding: '14px',
            border: 'none', borderRadius: 0, cursor: submitting ? 'default' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Saving…' : 'Add to Portfolio →'}
        </button>
      </div>
    </div>
  )
}
