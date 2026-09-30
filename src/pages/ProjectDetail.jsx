import { useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import AddProjectModal from '../components/AddProjectModal'
import ImageViewer from '../components/ImageViewer'
import { useUser } from '../context/UserContext'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'
const SERIF = '"BIZ UDMincho", serif'
const MONO = 'ui-monospace, "SF Mono", Consolas, monospace'

function BriefGrid({ brief, color }) {
  const cellStyle = { background: color, padding: '12px 14px' }
  const labelStyle = {
    fontFamily: HN, fontSize: '8px', textTransform: 'uppercase',
    letterSpacing: '0.1em', color: 'rgba(0,0,0,0.5)', marginBottom: '6px',
  }
  const valueStyle = { fontFamily: HN, fontSize: '12px', color: '#0A0A0A', lineHeight: 1.6, margin: 0 }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(0,0,0,0.15)', borderRadius: '6px', overflow: 'hidden' }}>
      <div style={cellStyle}>
        <div style={labelStyle}>The Ask</div>
        <p style={valueStyle}>{brief.ask}</p>
      </div>
      <div style={cellStyle}>
        <div style={labelStyle}>Constraints</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {brief.constraints?.map((c) => (
            <span key={c} style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: '2px', fontFamily: HN, fontSize: '9px', color: '#0A0A0A' }}>{c}</span>
          ))}
        </div>
      </div>
      <div style={cellStyle}>
        <div style={labelStyle}>Deliverables</div>
        {brief.deliverables?.map((d, i) => (
          <div key={i} style={{ fontFamily: HN, fontSize: '12px', color: '#0A0A0A', lineHeight: 1.8 }}>{d}</div>
        ))}
      </div>
      <div style={cellStyle}>
        <div style={labelStyle}>Target Audience</div>
        <p style={valueStyle}>{brief.target_audience}</p>
      </div>
      <div style={cellStyle}>
        <div style={labelStyle}>Brand Tone</div>
        <p style={valueStyle}>{brief.brand_tone}</p>
      </div>
      <div style={cellStyle}>
        <div style={labelStyle}>Art Direction</div>
        <p style={{ ...valueStyle, fontStyle: 'italic', marginBottom: '10px' }}>{brief.art_direction}</p>
        <div style={{ background: 'rgba(0,0,0,0.1)', padding: '7px 9px', borderRadius: '3px' }}>
          <div style={{ fontFamily: HN, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.5)', marginBottom: '4px' }}>
            Midjourney / Firefly Prompt
          </div>
          <div style={{ fontFamily: MONO, fontSize: '9px', color: '#0A0A0A', lineHeight: 1.6 }}>
            {brief.image_prompt}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProjectDetail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { removeSubmittedProject, setProjectHighlight } = useUser()
  const [briefExpanded, setBriefExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [togglingHighlight, setTogglingHighlight] = useState(false)
  const [editing, setEditing] = useState(false)
  // Index of the image open in the full-screen viewer, or null when closed.
  const [viewerIndex, setViewerIndex] = useState(null)
  const closeViewer = useCallback(() => setViewerIndex(null), [])

  const [project, setProject] = useState(() => location.state?.project || null)
  const [isHighlight, setIsHighlight] = useState(project?.isHighlight || false)
  // Public-profile visitors always get a view-only page — only the account
  // holder viewing their own portfolio (Portfolio.jsx, which never sets
  // this flag) sees the edit/pin/delete controls.
  const readOnly = location.state?.readOnly === true
  const profileSlug = location.state?.profileSlug
  const backPath = readOnly && profileSlug ? `/u/${profileSlug}` : '/portfolio'
  const backLabel = readOnly && profileSlug ? '← Back to profile' : '← Back to portfolio'

  // The creator byline — Home.jsx's search/browse results attach a full
  // `owner` object (name + slug) to each project; PublicProfile.jsx already
  // knows the slug from the URL and passes the display name separately via
  // location.state.ownerName. Either source is enough to link back to that
  // person's profile; Portfolio.jsx (viewing your own work) has neither, so
  // no byline shows there.
  const creatorSlug = project?.owner?.slug || profileSlug
  const creatorName = project?.owner?.name || location.state?.ownerName

  const handleDelete = async () => {
    if (!project?.id) return
    const confirmed = window.confirm('Delete this project from your portfolio? This can\'t be undone.')
    if (!confirmed) return
    setDeleting(true)
    const { error } = await removeSubmittedProject(project.id) || {}
    setDeleting(false)
    if (error) {
      alert('Failed to delete project. Please try again.')
      return
    }
    navigate('/portfolio')
  }

  const handleToggleHighlight = async () => {
    if (!project?.id) return
    setTogglingHighlight(true)
    const { error } = await setProjectHighlight(project.id, !isHighlight) || {}
    setTogglingHighlight(false)
    if (error) {
      alert('Failed to update highlight. Please try again.')
      return
    }
    setIsHighlight((prev) => !prev)
  }

  if (!project) {
    return (
      <div className="page-enter" style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ padding: '48px', fontFamily: HN, fontSize: '13px', color: '#999' }}>
          No project data found.{' '}
          <button onClick={() => navigate('/portfolio')} style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: HN, fontSize: '13px', color: '#0A0A0A' }}>
            Back to portfolio
          </button>
        </div>
      </div>
    )
  }

  const { brief, title, images, image, note, folderColor } = project
  const categoryColor = folderColor || brief?.folder_color || '#60DDE6'
  const allImages = images?.length ? images : image ? [image] : []
  const displayTitle = title || brief?.title || 'Untitled Project'

  return (
    <div className="page-enter" style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Back button + delete */}
      <div className="responsive-page-padding" style={{ padding: '12px 48px 0', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate(backPath)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: HN, fontSize: '11px', color: '#999', padding: 0,
          }}
        >
          {backLabel}
        </button>

        {project?.id && !readOnly && (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <button
              onClick={() => setEditing(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: HN, fontSize: '11px', color: '#999', padding: 0,
              }}
            >
              Edit project
            </button>
            <button
              onClick={handleToggleHighlight}
              disabled={togglingHighlight}
              style={{
                background: 'none', border: 'none', cursor: togglingHighlight ? 'default' : 'pointer',
                fontFamily: HN, fontSize: '11px', color: isHighlight ? '#0A0A0A' : '#999', padding: 0,
                opacity: togglingHighlight ? 0.5 : 1,
              }}
            >
              {togglingHighlight ? 'Updating…' : isHighlight ? '★ Unpin' : 'Pin to top'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                background: 'none', border: 'none', cursor: deleting ? 'default' : 'pointer',
                fontFamily: HN, fontSize: '11px', color: '#E84A4A', padding: 0,
                opacity: deleting ? 0.5 : 1,
              }}
            >
              {deleting ? 'Deleting…' : 'Delete project'}
            </button>
          </div>
        )}
      </div>

      {/* Zone 1: Metadata bar */}
      <div className="responsive-page-padding" style={{
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        padding: '16px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: '12px',
      }}>
        <div>
          <div style={{ fontFamily: SERIF, fontSize: '24px', fontWeight: 600, color: '#0A0A0A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {displayTitle}
          </div>
          <div style={{ fontFamily: HN, fontSize: '11px', color: '#999', marginTop: '3px' }}>
            {brief?.folder || '—'}
          </div>
          {creatorSlug && (
            <button
              onClick={() => navigate(`/u/${creatorSlug}`)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontFamily: HN, fontSize: '11px', color: '#0A0A0A',
                marginTop: '6px', textDecoration: 'underline',
              }}
            >
              by {creatorName || creatorSlug}
            </button>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: HN, fontSize: '10px', color: '#999', marginBottom: '2px' }}>test no.</div>
          <div style={{ fontFamily: SERIF, fontSize: '28px', fontWeight: 400, color: '#0A0A0A', lineHeight: 1 }}>
            {brief?.brief_id || '01'}
          </div>
        </div>
      </div>

      {/* Zone 2: Main content grid */}
      <div className="responsive-grid" style={{
        padding: '48px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '48px',
        alignItems: 'start',
        flex: 1,
      }}>

        {/* LEFT COLUMN */}
        <div>
          {/* Notes */}
          <div style={{ fontFamily: HN, fontSize: '11px', color: '#999', fontStyle: 'italic', marginBottom: '8px' }}>
            notes:
          </div>
          <div style={{ fontFamily: SERIF, fontSize: '16px', lineHeight: 1.8, color: '#0A0A0A' }}>
            {note || '—'}
          </div>

          {/* Rule */}
          <div style={{ margin: '24px 0', borderTop: '1px solid rgba(0,0,0,0.1)' }} />

          {/* Brief summary */}
          <div style={{ fontFamily: HN, fontSize: '11px', color: '#999', fontStyle: 'italic', marginBottom: '8px' }}>
            brief summary:
          </div>
          <div style={{ fontFamily: HN, fontSize: '13px', lineHeight: 1.7, color: '#0A0A0A' }}>
            {brief?.summary}
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setBriefExpanded((prev) => !prev)}
            style={{
              marginTop: '20px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: HN,
              fontSize: '11px',
              color: '#0A0A0A',
              textDecoration: 'underline',
              padding: 0,
              display: 'block',
            }}
          >
            {briefExpanded ? 'Hide detailed brief ↑' : 'View detailed brief →'}
          </button>

          {/* Expandable detailed brief */}
          <div style={{
            maxHeight: briefExpanded ? '1200px' : '0',
            opacity: briefExpanded ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.3s ease, opacity 0.25s ease',
          }}>
            <div style={{
              background: categoryColor,
              borderRadius: '8px',
              padding: '20px',
              marginTop: '12px',
            }}>
              <BriefGrid brief={brief} color={categoryColor} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — image gallery */}
        <div className="responsive-grid-images-first">
          {allImages.length === 0 ? (
            <div style={{
              border: '1.5px dashed rgba(0,0,0,0.2)',
              borderRadius: '4px',
              padding: '64px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontFamily: HN, fontSize: '12px', color: '#999' }}>No images uploaded</span>
            </div>
          ) : (
            <div>
              {/* Primary image */}
              <img
                src={allImages[0]}
                alt={displayTitle}
                decoding="async"
                onClick={() => setViewerIndex(0)}
                style={{
                  cursor: 'zoom-in',
                  width: '100%',
                  display: 'block',
                  borderRadius: '4px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  objectFit: 'cover',
                  marginBottom: allImages.length > 1 ? '8px' : '0',
                }}
              />
              {/* Additional images grid */}
              {allImages.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {allImages.slice(1).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${displayTitle} ${i + 2}`}
                      loading="lazy"
                      decoding="async"
                      onClick={() => setViewerIndex(i + 1)}
                      style={{
                        cursor: 'zoom-in',
                        width: '100%',
                        aspectRatio: '1 / 1',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: '4px',
                        border: '1px solid rgba(0,0,0,0.08)',
                      }}
                    />
                  ))}
                </div>
              )}
              {viewerIndex !== null && (
                <ImageViewer
                  images={allImages}
                  startIndex={viewerIndex}
                  title={displayTitle}
                  onClose={closeViewer}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <AddProjectModal
          existingProject={project}
          onClose={() => setEditing(false)}
          onAdded={(updated) => {
            if (updated) {
              setProject(updated)
              setIsHighlight(updated.isHighlight || false)
            }
          }}
        />
      )}
    </div>
  )
}
