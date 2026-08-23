import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import AddProjectModal from '../components/AddProjectModal'
import { useUser } from '../context/UserContext'
import { disciplineColor } from '../lib/theme'

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
  const { brief, folderColor, coverImage, images, image, title, discipline } = project
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
      <div style={{
        background: thumbnail ? '#EDEDED' : color,
        aspectRatio: '3 / 4', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {thumbnail && (
          <img src={thumbnail} alt={displayTitle} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
      </div>
    </div>
  )
}

function OngoingCard({ savedBrief, onClick }) {
  if (savedBrief.isChallenge === true) {
    return (
      <div
        onClick={onClick}
        style={{
          padding: '2px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #1a1a2e, #4a9aba, #b8e8f0, #ffffff, #4a9aba, #1a1a2e)',
          backgroundSize: '300% 300%',
          animation: 'gbMove 8s linear infinite',
          boxShadow: '0 0 12px rgba(74,154,186,0.15)',
          marginBottom: '8px',
          cursor: 'pointer',
        }}
      >
        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '12px' }}>
          <span style={{ fontFamily: HN, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4a9aba', marginBottom: '4px', display: 'block' }}>
            Challenge
          </span>
          <div style={{ fontFamily: HN, fontSize: '14px', fontWeight: 600, color: '#0A0A0A', lineHeight: 1.3, marginBottom: '4px' }}>
            Challenge 001
          </div>
          {savedBrief.brief?.title && (
            <div style={{ fontFamily: HN, fontSize: '10px', color: '#666', lineHeight: 1.3 }}>
              {savedBrief.brief.title}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div onClick={onClick} style={{
      background: savedBrief.categoryColor || '#60DDE6',
      borderRadius: '12px', padding: '12px', marginBottom: '8px',
      width: '100%', cursor: 'pointer', boxSizing: 'border-box',
    }}>
      <div style={{ fontFamily: HN, fontSize: '16px', fontWeight: 400, color: '#0A0A0A', lineHeight: 1.3 }}>
        {savedBrief.title || 'Untitled Brief'}
      </div>
    </div>
  )
}

export default function Portfolio() {
  const navigate = useNavigate()
  const { user, submittedProjects, savedBriefs, loading, updateAvatar } = useUser()
  const profile = user?.user_metadata || {}
  const displayName = profile.name || profile.username || ''
  const [toast, setToast] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [addedToast, setAddedToast] = useState(false)
  const [tab, setTab] = useState('projects')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef(null)

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

  const handleProjectAdded = () => {
    setAddedToast(true)
    setTimeout(() => setAddedToast(false), 2000)
  }

  useEffect(() => {
    if (!loading && !user) navigate('/signup', { replace: true })
  }, [user, loading, navigate])

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

  const ongoing = savedBriefs.filter((b) => b.status === 'ongoing' || !b.status)
  const [onGoing, ...restSaved] = ongoing

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
              <img src={profile.avatarUrl} alt={displayName || 'Avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
          <div style={{ marginTop: '32px' }}>
            {profile.cvUrl ? (
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
            ) : (
              <div style={{ fontFamily: HN, fontSize: '11px', color: '#999' }}>
                Add a CV link in Settings to let people download it.
              </div>
            )}
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
            {submittedProjects.length === 0 ? (
              <PlaceholderGrid />
            ) : (
              <div className="responsive-project-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px 16px' }}>
                {submittedProjects.map((project, i) => (
                  <ProjectCard
                    key={i}
                    project={project}
                    index={i}
                    onClick={() => navigate(`/project/${i}`, { state: { project } })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: gray sidebar panel, flush to the page edge */}
          <div style={{ width: '340px', flexShrink: 0, background: '#D4D4D4', padding: '32px', boxSizing: 'border-box' }}>

            {/* On-going project */}
            <div style={{
              fontFamily: HN, fontSize: '15px', fontWeight: 400, color: '#0A0A0A',
              textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '16px', lineHeight: 1.3,
            }}>
              On-going project
            </div>
            {onGoing ? (
              <div
                onClick={() => onGoing.isChallenge
                  ? navigate('/weekly-challenge', { state: { savedChallenge: onGoing } })
                  : navigate('/brief', { state: { folderName: onGoing.discipline, categoryColor: onGoing.categoryColor, savedBrief: onGoing } })
                }
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
                  onClick={() => brief.isChallenge
                    ? navigate('/weekly-challenge', { state: { savedChallenge: brief } })
                    : navigate('/brief', { state: { folderName: brief.discipline, categoryColor: brief.categoryColor, savedBrief: brief } })
                  }
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
                onClick={() => setModalOpen(true)}
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
          </div>
        </div>
      )}

      {modalOpen && (
        <AddProjectModal
          onClose={() => setModalOpen(false)}
          onAdded={handleProjectAdded}
        />
      )}
    </div>
  )
}
