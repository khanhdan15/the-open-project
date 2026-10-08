import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import AddProjectModal from '../components/AddProjectModal'
import ScrollCue from '../components/ScrollCue'
import { useUser } from '../context/UserContext'
import { handleSpotlightMove } from '../lib/spotlight'
import { disciplineColor } from '../lib/theme'
import Thumb from '../components/Thumb'
import Masonry from '../components/Masonry'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

const socialLinkStyle = {
  width: '28px', height: '28px', borderRadius: '50%',
  border: '1px solid #0A0A0A',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  textDecoration: 'none', color: '#0A0A0A',
  fontFamily: HN, fontSize: '10px', fontWeight: 600,
  flexShrink: 0,
}

function PlaceholderGrid() {
  return (
    <div className="responsive-project-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{
          background: 'rgba(0,0,0,0.08)', borderRadius: '12px', padding: '16px',
          aspectRatio: '1', display: 'flex', alignItems: 'flex-end',
        }}>
          <span style={{ fontFamily: HN, fontSize: '12px', color: 'rgba(0,0,0,0.3)' }}>
            add a project
          </span>
        </div>
      ))}
    </div>
  )
}

function ProjectCard({ project, index, onClick }) {
  const { brief, folderColor, coverImage, images, image, title, discipline, isHighlight } = project
  const folderName = discipline || brief?.folder || 'design'
  const color = folderColor || brief?.folder_color || disciplineColor(folderName)
  const thumbnail = coverImage || images?.[0] || image
  const displayTitle = title || brief?.title || 'Untitled'

  return (
    <div
      className="card-pop"
      onClick={onClick}
      style={{ cursor: 'pointer', animationDelay: `${Math.min(index, 14) * 90}ms` }}
    >
      <div style={{
        fontFamily: HN, fontSize: '12px', color: '#0A0A0A',
        textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.02em',
      }}>
        No {index + 1} - {displayTitle}
      </div>
      <div
        className={`spotlight-card${thumbnail ? ' img-placeholder masonry-media' : ''}`}
        onMouseMove={handleSpotlightMove}
        style={{
          position: 'relative',
          background: thumbnail ? undefined : color,
          // Natural image shape (masonry) — see .masonry-media in index.css.
          // Cards with no image keep a 3:4 colour block.
          aspectRatio: thumbnail ? undefined : '3 / 4', overflow: 'hidden',
        }}
      >
        {thumbnail && (
          <Thumb src={thumbnail} alt={displayTitle} style={{ display: 'block' }} />
        )}
        {isHighlight && (
          <span
            title="Pinned"
            style={{
              position: 'absolute', top: '8px', left: '8px',
              width: '22px', height: '22px', borderRadius: '50%',
              background: '#0A0A0A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', color: '#D4E84A', lineHeight: 1,
            }}
          >
            ★
          </span>
        )}
      </div>
    </div>
  )
}

function OngoingCard({ savedBrief, onClick, index = 0 }) {
  return (
    <div onClick={onClick} className="slide-top" style={{
      background: savedBrief.categoryColor || '#60DDE6',
      borderRadius: '12px', padding: '12px', marginBottom: '8px',
      width: '100%', cursor: 'pointer', boxSizing: 'border-box',
      animationDelay: `${80 + index * 70}ms`,
    }}>
      <div style={{ fontFamily: HN, fontSize: '16px', fontWeight: 400, color: '#0A0A0A', lineHeight: 1.3 }}>
        {savedBrief.title || 'Untitled Brief'}
      </div>
    </div>
  )
}

export default function Portfolio() {
  const navigate = useNavigate()
  const { user, submittedProjects, savedBriefs, loading, updateAvatar, updateCV, removeSavedBrief } = useUser()
  const profile = user?.user_metadata || {}
  const displayName = profile.name || profile.username || ''
  const [toast, setToast] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [addedToast, setAddedToast] = useState(false)
  const [tab, setTab] = useState('projects')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [cvUploading, setCvUploading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const avatarInputRef = useRef(null)
  const cvInputRef = useRef(null)

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (evt) => resolve(evt.target.result)
      reader.readAsDataURL(file)
    })
    setAvatarUploading(true)
    await updateAvatar(base64)
    setAvatarUploading(false)
    e.target.value = ''
  }

  const handleCVChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (evt) => resolve(evt.target.result)
      reader.readAsDataURL(file)
    })
    setCvUploading(true)
    await updateCV(base64)
    setCvUploading(false)
    e.target.value = ''
  }

  const handleProjectAdded = () => {
    setAddedToast(true)
    setTimeout(() => setAddedToast(false), 2000)
  }

  useEffect(() => {
    if (!loading && !user) navigate('/signup', { replace: true })
  }, [user, loading, navigate])

  // One-time cleanup — the weekly challenge feature has been retired, but
  // people who joined a past challenge still have that saved brief lingering
  // in their sidebar. Purge it outright instead of just hiding it.
  useEffect(() => {
    savedBriefs.filter((b) => b.isChallenge).forEach((b) => removeSavedBrief(b.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedBriefs])

  const handleShare = () => {
    if (!profile.slug) {
      setToast('save-first')
      setTimeout(() => setToast(false), 2500)
      return
    }
    navigator.clipboard.writeText(`${window.location.origin}/u/${profile.slug}`)
    setToast(true)
    setTimeout(() => setToast(false), 2000)
  }

  const ongoing = savedBriefs.filter((b) => (b.status === 'ongoing' || !b.status) && !b.isChallenge)
  const [onGoing, ...restSaved] = ongoing

  // Pinned project always leads the grid; stable sort keeps the rest in
  // their existing submitted_at-desc order.
  const sortedProjects = [...submittedProjects].sort(
    (a, b) => (b.isHighlight ? 1 : 0) - (a.isHighlight ? 1 : 0)
  )

  // Shared between the desktop in-flow sidebar and the mobile portaled
  // floating panel — same data, same markup, just rendered in two places.
  const sidebarInner = (
    <>
      {/* On-going project */}
      <div style={{
        fontFamily: HN, fontSize: '15px', fontWeight: 400, color: '#0A0A0A',
        textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '16px', lineHeight: 1.3,
      }}>
        On-going project
      </div>
      {onGoing ? (
        <div
          onClick={() => navigate('/brief', { state: { folderName: onGoing.discipline, categoryColor: onGoing.categoryColor, savedBrief: onGoing } })}
          className="slide-top"
          style={{ background: '#FFEFEF', borderRadius: '16px', padding: '16px', minHeight: '130px', cursor: 'pointer', display: 'flex', alignItems: 'flex-end' }}
        >
          <span style={{ fontFamily: HN, fontSize: '13px', color: '#0A0A0A' }}>{onGoing.title || 'Untitled Brief'}</span>
        </div>
      ) : (
        <div style={{ background: '#FFEFEF', borderRadius: '16px', padding: '16px', minHeight: '130px' }}>
          <span style={{ fontFamily: HN, fontSize: '12px', color: 'rgba(0,0,0,0.35)' }}>project title</span>
        </div>
      )}

      {/* Saved projects */}
      <div style={{
        fontFamily: HN, fontSize: '15px', fontWeight: 400, color: '#0A0A0A',
        textTransform: 'uppercase', letterSpacing: '0.02em', margin: '32px 0 16px', lineHeight: 1.3,
      }}>
        Saved projects
      </div>
      {restSaved.length === 0 ? (
        <div style={{ background: '#FFEFEF', borderRadius: '16px', padding: '16px' }}>
          <span style={{ fontFamily: HN, fontSize: '11px', color: 'rgba(0,0,0,0.35)' }}>nothing saved yet</span>
        </div>
      ) : (
        restSaved.map((brief, i) => (
          <OngoingCard
            key={i}
            savedBrief={brief}
            index={i}
            onClick={() => navigate('/brief', { state: { folderName: brief.discipline, categoryColor: brief.categoryColor, savedBrief: brief } })}
          />
        ))
      )}

      {/* Add project manually */}
      {addedToast && (
        <div style={{ fontFamily: HN, fontSize: '11px', color: '#0A0A0A', opacity: 0.6, margin: '16px 0 4px', textAlign: 'center' }}>
          Project added to portfolio
        </div>
      )}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button
          onClick={(e) => { e.stopPropagation(); setModalOpen(true) }}
          style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: '1.5px solid rgba(0,0,0,0.3)',
            background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 0,
          }}
        >
          <span style={{ fontFamily: HN, fontSize: '20px', fontWeight: 200, color: 'rgba(0,0,0,0.5)', lineHeight: 1 }}>+</span>
        </button>
        <div style={{ fontFamily: HN, fontSize: '10px', color: '#0A0A0A', textAlign: 'center', marginTop: '6px' }}>
          add project manually
        </div>
      </div>
    </>
  )

  const tabStyle = (active) => ({
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
    fontFamily: HN, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em',
    color: '#0A0A0A',
    borderBottom: active ? '1px solid #0A0A0A' : '1px solid transparent',
    paddingBottom: '3px',
  })

  return (
    <div className="page-enter" style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Name / title / social + tab nav */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: '16px', padding: '40px 40px 0',
      }}>
        <div>
          <div className="responsive-hero-name" style={{
            fontFamily: HN, fontSize: '44px', fontWeight: 700,
            color: '#0A0A0A', textTransform: 'uppercase', lineHeight: 1.0, marginBottom: '6px',
          }}>
            {displayName || 'Your Name'}
          </div>
          {profile.title && (
            <div style={{ fontFamily: HN, fontSize: '11px', textTransform: 'uppercase', color: '#0A0A0A', marginBottom: '2px' }}>
              {profile.title}
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            {profile.instagram && (
              <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={socialLinkStyle}>Ig</a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer" style={socialLinkStyle}>Li</a>
            )}
            {profile.behance && (
              <a href={profile.behance} target="_blank" rel="noreferrer" style={socialLinkStyle}>Be</a>
            )}
            {profile.cvUrl && (
              <a href={profile.cvUrl} target="_blank" rel="noreferrer" style={socialLinkStyle}>CV</a>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button onClick={() => setTab('projects')} style={tabStyle(tab === 'projects')}>Projects</button>
            <button onClick={() => setTab('about')} style={tabStyle(tab === 'about')}>About</button>
          </div>
          <div>
            <button
              onClick={handleShare}
              style={{
                fontFamily: HN, fontSize: '11px', color: '#0A0A0A',
                background: 'transparent', border: '1px solid #0A0A0A',
                padding: '8px 20px', cursor: 'pointer', borderRadius: '999px',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}
            >
              Share profile
            </button>
            {toast === 'save-first' && (
              <div style={{ fontFamily: HN, fontSize: '11px', color: '#E84A4A', marginTop: '8px', textAlign: 'right' }}>
                Save your profile in Settings first to get a share link.
              </div>
            )}
            {toast === true && (
              <div style={{ fontFamily: HN, fontSize: '11px', color: '#0A0A0A', opacity: 0.6, marginTop: '8px', textAlign: 'right' }}>
                Link copied!
              </div>
            )}
          </div>
        </div>
      </div>

      {tab === 'about' ? (
        /* ─── About tab ────────────────────────────────────────────── */
        <div style={{ padding: '40px 40px 60px', maxWidth: '720px' }}>
          <div
            onClick={() => avatarInputRef.current?.click()}
            title="Click to upload a photo"
            style={{
              width: '110px', height: '110px', borderRadius: '50%',
              background: '#D4D4D4', marginBottom: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden', position: 'relative',
            }}
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} loading="lazy" decoding="async" alt={displayName || 'Avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <span style={{ fontFamily: HN, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999' }}>
                {avatarUploading ? 'uploading…' : 'avatar'}
              </span>
            )}
            {avatarUploading && profile.avatarUrl && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: HN, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0A0A0A',
              }}>
                uploading…
              </div>
            )}
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          <div style={{ fontFamily: HN, fontSize: '13px', lineHeight: 1.8, color: '#0A0A0A', whiteSpace: 'pre-wrap' }}>
            {profile.bio || 'Add a bio in Settings to introduce yourself.'}
          </div>
          {profile.workExperience && (
            <div style={{ marginTop: '32px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '24px' }}>
              <div style={{ fontFamily: HN, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: '10px' }}>
                Work Experience
              </div>
              <div style={{ fontFamily: HN, fontSize: '13px', lineHeight: 1.8, color: '#0A0A0A', whiteSpace: 'pre-wrap' }}>
                {profile.workExperience}
              </div>
            </div>
          )}
          <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {profile.cvUrl && (
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-block',
                  fontFamily: HN, fontSize: '11px', color: '#0A0A0A',
                  background: 'transparent', border: '1px solid #0A0A0A',
                  padding: '10px 24px', cursor: 'pointer', borderRadius: '999px',
                  textTransform: 'uppercase', letterSpacing: '0.04em', textDecoration: 'none',
                }}
              >
                Download CV
              </a>
            )}
            <button
              onClick={() => cvInputRef.current?.click()}
              disabled={cvUploading}
              style={{
                fontFamily: HN, fontSize: '11px', color: '#0A0A0A',
                background: profile.cvUrl ? 'none' : 'transparent',
                border: profile.cvUrl ? 'none' : '1px dashed rgba(0,0,0,0.4)',
                padding: profile.cvUrl ? 0 : '10px 24px',
                borderRadius: profile.cvUrl ? 0 : '999px',
                cursor: cvUploading ? 'default' : 'pointer',
                textDecoration: profile.cvUrl ? 'underline' : 'none',
                textTransform: profile.cvUrl ? 'none' : 'uppercase',
                letterSpacing: profile.cvUrl ? 'normal' : '0.04em',
                opacity: cvUploading ? 0.6 : 1,
              }}
            >
              {cvUploading ? 'Uploading…' : profile.cvUrl ? 'Replace CV' : 'Upload CV'}
            </button>
            <input
              ref={cvInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              style={{ display: 'none' }}
              onChange={handleCVChange}
            />
          </div>

          <button
            onClick={() => navigate('/settings')}
            style={{
              fontFamily: HN, fontSize: '11px', color: '#999', marginTop: '24px',
              background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', padding: 0,
            }}
          >
            Edit profile
          </button>
        </div>
      ) : (
        /* ─── Projects tab ─────────────────────────────────────────── */
        <div className="responsive-columns" style={{ display: 'flex', flex: 1 }}>

          {/* LEFT: project grid */}
          <div style={{ flex: 1, minWidth: 0, padding: '32px 40px 40px' }}>
            {sortedProjects.length === 0 ? (
              <PlaceholderGrid />
            ) : (
              <Masonry columns={3} mobileColumns={2}>
                {sortedProjects.map((project, i) => (
                  <ProjectCard
                    key={i}
                    project={project}
                    index={i}
                    onClick={() => navigate(`/project/${i}`, { state: { project } })}
                  />
                ))}
              </Masonry>
            )}
          </div>

          {/* RIGHT: gray sidebar panel, flush to the page edge on desktop.
              On mobile this in-flow copy is hidden entirely and a second
              copy is portaled onto document.body instead (see render below)
              so it can be a true fixed round button bottom-right of the
              viewport, unaffected by the page's transform-animated wrapper. */}
          <div
            className="portfolio-sidebar"
            style={{ width: '340px', flexShrink: 0, background: '#D4D4D4', padding: '32px', boxSizing: 'border-box' }}
          >
            <div className="portfolio-sidebar-content">{sidebarInner}</div>
          </div>

          {/* Mobile-only floating trigger — portaled to document.body so
              `position: fixed` is relative to the real viewport, not to any
              ancestor with a CSS transform (the .page-enter page-load
              animation is exactly such an ancestor). Hidden on desktop via
              CSS; see .portfolio-sidebar-mobile in index.css. */}
          {typeof document !== 'undefined' && createPortal(
            <div
              className={`portfolio-sidebar-mobile${sidebarOpen ? ' expanded' : ''}`}
              onClick={() => { if (!sidebarOpen) setSidebarOpen(true) }}
            >
              {/* Collapsed mobile state — just a compact icon, tap to expand */}
              <span className="portfolio-sidebar-collapsed-label" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="8" height="8" rx="2" stroke="#0A0A0A" strokeWidth="1.6" />
                  <rect x="13" y="3" width="8" height="8" rx="2" stroke="#0A0A0A" strokeWidth="1.6" />
                  <rect x="3" y="13" width="8" height="8" rx="2" stroke="#0A0A0A" strokeWidth="1.6" />
                  <rect x="13" y="13" width="8" height="8" rx="2" stroke="#0A0A0A" strokeWidth="1.6" />
                </svg>
              </span>

              {/* Close button — mobile expanded state only */}
              <button
                className="portfolio-sidebar-close"
                onClick={(e) => { e.stopPropagation(); setSidebarOpen(false) }}
                style={{
                  position: 'absolute', top: '12px', right: '12px',
                  width: '28px', height: '28px', borderRadius: '50%',
                  border: 'none', background: 'rgba(0,0,0,0.08)',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', color: '#0A0A0A', cursor: 'pointer', padding: 0,
                }}
              >
                ×
              </button>

              <div className="portfolio-sidebar-content">{sidebarInner}</div>
            </div>,
            document.body
          )}
        </div>
      )}

      <ScrollCue itemCount={sortedProjects.length} active={tab === 'projects'} />

      {modalOpen && (
        <AddProjectModal
          onClose={() => setModalOpen(false)}
          onAdded={handleProjectAdded}
        />
      )}
    </div>
  )
}
