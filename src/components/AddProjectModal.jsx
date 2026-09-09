import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useUser } from '../context/UserContext'
import { DISCIPLINES as FOLDER_OPTIONS } from '../lib/theme'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

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

const MAX_IMAGES = 5

function readAsBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}

export default function AddProjectModal({ onClose, onAdded, existingProject }) {
  const { addSubmittedProject, updateSubmittedProject } = useUser()
  const isEditing = !!existingProject

  const [form, setForm] = useState(() => {
    if (!existingProject) {
      return {
        title: '', discipline: '', client: '', tools: '',
        brief: '', targetAudience: '', constraints: '',
        description: '', role: '', collaborators: '', projectLink: '', year: '2025',
      }
    }
    const b = existingProject.brief || {}
    const m = existingProject.meta || {}
    return {
      title: existingProject.title || '',
      discipline: existingProject.discipline || b.folder || '',
      client: m.client || '',
      tools: m.tools || '',
      brief: b.summary || b.ask || '',
      targetAudience: b.target_audience || '',
      constraints: Array.isArray(b.constraints) ? b.constraints.join(', ') : '',
      description: existingProject.note || '',
      role: m.role || '',
      collaborators: m.collaborators || '',
      projectLink: m.projectLink || '',
      year: m.year || '2025',
    }
  })
  // Existing images are already-uploaded URLs; uploadImage() passes URLs
  // straight through on save, so we can keep both real URLs and new base64
  // selections in the same array.
  const initialImages = existingProject
    ? (existingProject.images?.length ? existingProject.images : existingProject.image ? [existingProject.image] : [])
    : []
  const [imageThumbs, setImageThumbs] = useState(initialImages)
  const [imagesBase64, setImagesBase64] = useState(initialImages)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const imagesRef = useRef(null)

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleImages = async (e) => {
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'))
    if (!files.length) return

    const remaining = MAX_IMAGES - imagesBase64.length
    const accepted = files.slice(0, Math.max(remaining, 0))

    if (accepted.length < files.length) {
      setErrors((prev) => ({ ...prev, images: `Max ${MAX_IMAGES} images — only added ${accepted.length} of ${files.length}` }))
    } else {
      setErrors((prev) => ({ ...prev, images: undefined }))
    }

    if (!accepted.length) return

    const newThumbs = accepted.map((f) => URL.createObjectURL(f))
    const newBase64 = await Promise.all(accepted.map(readAsBase64))
    setImageThumbs((prev) => [...prev, ...newThumbs])
    setImagesBase64((prev) => [...prev, ...newBase64])
    e.target.value = ''
  }

  const handleRemoveImage = (index) => {
    setImageThumbs((prev) => prev.filter((_, i) => i !== index))
    setImagesBase64((prev) => prev.filter((_, i) => i !== index))
    setErrors((prev) => ({ ...prev, images: undefined }))
  }

  const handleSubmit = async () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Required'
    if (!form.discipline) newErrors.discipline = 'Required'
    if (imagesBase64.length === 0) newErrors.images = 'Add at least one image'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    const folder = FOLDER_OPTIONS.find((f) => f.name === form.discipline)

    setSubmitting(true)
    setSubmitError(null)

    const payload = {
      title: form.title,
      discipline: form.discipline,
      folderColor: folder?.color || '#60DDE6',
      coverImage: imagesBase64[0],
      images: imagesBase64,
      image: imagesBase64[0],
      note: form.description,
      isManual: true,
      brief: {
        brief_id: existingProject?.brief?.brief_id || null,
        title: form.title,
        folder: form.discipline,
        folder_color: folder?.color || '#60DDE6',
        summary: form.brief,
        ask: form.brief,
        constraints: form.constraints
          ? form.constraints.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
        deliverables: existingProject?.brief?.deliverables || [],
        target_audience: form.targetAudience,
        brand_tone: existingProject?.brief?.brand_tone || '',
        art_direction: form.description,
        image_prompt: existingProject?.brief?.image_prompt || '',
      },
      meta: {
        client: form.client,
        tools: form.tools,
        role: form.role,
        collaborators: form.collaborators,
        projectLink: form.projectLink,
        year: form.year,
      },
    }

    const result = isEditing
      ? await updateSubmittedProject(existingProject.id, payload)
      : await addSubmittedProject(payload)

    setSubmitting(false)

    if (!result || result.error) {
      setSubmitError(result?.error?.message || 'Failed to save project. Please try again.')
      return
    }

    onAdded(result.data)
    onClose()
  }

  // Portaled straight onto <body> — the page wrappers this modal opens from
  // (Portfolio.jsx / ProjectDetail.jsx) use a `.page-enter` CSS-transform
  // load animation, and any transformed ancestor becomes the containing
  // block for `position: fixed` descendants. Left un-portaled, "fixed"
  // ends up relative to that animated wrapper instead of the real
  // viewport, which is why the modal rendered low/off-center on mobile.
  return createPortal(
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div className="responsive-page-padding" style={{
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
            {isEditing ? 'Edit Project' : 'Add Project'}
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
        <div className="responsive-grid-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
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

        <Field label="Project Images" error={errors.images}>
          <div
            style={{
              border: '1.5px dashed rgba(0,0,0,0.2)', borderRadius: '4px',
              padding: imageThumbs.length > 0 ? '12px' : '28px',
              background: 'rgba(0,0,0,0.02)', minHeight: '80px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {imageThumbs.length > 0 ? (
              <div style={{ width: '100%' }}>
                <div style={{ fontFamily: HN, fontSize: '11px', color: '#0A0A0A', marginBottom: '8px' }}>
                  {imageThumbs.length} of {MAX_IMAGES} image{imageThumbs.length === 1 ? '' : 's'} — first one is used as the cover
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {imageThumbs.map((t, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img
                        src={t}
                        alt=""
                        style={{
                          width: '64px', height: '64px', objectFit: 'cover', borderRadius: '3px',
                          border: i === 0 ? '2px solid #0A0A0A' : '1px solid rgba(0,0,0,0.1)',
                          display: 'block',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        style={{
                          position: 'absolute', top: '-6px', right: '-6px',
                          width: '18px', height: '18px', borderRadius: '50%',
                          background: '#0A0A0A', color: '#FFFFFF', border: '1.5px solid #FFFFFF',
                          fontSize: '11px', lineHeight: 1, cursor: 'pointer', padding: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {imageThumbs.length < MAX_IMAGES && (
                    <div
                      onClick={() => imagesRef.current?.click()}
                      style={{
                        width: '64px', height: '64px', borderRadius: '3px',
                        border: '1.5px dashed rgba(0,0,0,0.25)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: HN, fontSize: '20px', color: '#999',
                      }}
                    >
                      +
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <span
                onClick={() => imagesRef.current?.click()}
                style={{ fontFamily: HN, fontSize: '12px', color: '#999', cursor: 'pointer' }}
              >
                Click to select one or more images
              </span>
            )}
          </div>
          <input ref={imagesRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImages} />
        </Field>

        {/* Grid rows 2-4: Target Audience | Your Role, Collaborators | Year, Project Link */}
        <div className="responsive-grid-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
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
          {submitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Add to Portfolio →'}
        </button>
      </div>
    </div>,
    document.body
  )
}
