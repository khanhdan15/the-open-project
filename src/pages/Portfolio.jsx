import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import AddProjectModal from '../components/AddProjectModal'
import { useUser } from '../context/UserContext'

const HN = '-apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

function ProjectCard({ project, onClick }) {
  const { brief, folderColor, coverImage, images, image, title } = project
  const folderName = brief?.folder || 'design'
  const color = folderColor || brief?.folder_color || '#60DDE6'
  const thumbnail = coverImage || images?.[0] || image

  return (
    <div onClick={onClick} style={{
      background: color,
      borderRadius: '12px', padding: '16px', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: '12px',
    }}>
      <div style={{ fontFamily: HN, fontSize: '18px', fontWeight: 400, color: '#0A0A0A', lineHeight: 1.2 }}>
        {title || brief?.title || 'Untitled Project'}
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.4)', borderRadius: '8px',
        width: '100%', aspectRatio: '4/3', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {thumbnail ? (
          <img src={thumbnail} alt={brief?.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <span style={{ fontFamily: HN, fontSize: '12px', color: 'rgba(0,0,0,0.4)' }}>your submission</span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: HN, fontSize: '12px', color: 'rgba(0,0,0,0.6)' }}>
          .{folderName.toLowerCase()}
        </span>
        <span style={{ fontFamily: HN, fontSize: '18px', color: '#0A0A0A' }}>→</span>
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
  const { user, submittedProjects, savedBriefs, loading } = useUser()
  const displayName = user?.user_metadata?.username || ''
  const [toast, setToast] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [addedToast, setAddedToast] = useState(false)

  const handleProjectAdded = () => {
    setAddedToast(true)
    setTimeout(() => setAddedToast(false), 2000)
  }

  useEffect(() => {
    if (!loading && !user) navigate('/signup', { replace: true })
  }, [user, loading, navigate])

  const handleShare = () => {
    const slug = displayName.toLowerCase().replace(/\s+/g, '') || 'portfolio'
    navigator.clipboard.writeText(`theopenproject.com/${slug}`)
    setToast(true)
    setTimeout(() => setToast(false), 2000)
  }

  return (
    <div className="page-enter" style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ display: 'flex', gap: '40px', padding: '40px', flex: 1 }}>

        {/* LEFT COLUMN */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Profile header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              fontFamily: HN, fontSize: '48px', fontWeight: 700,
              color: '#0A0A0A', textTransform: 'uppercase',
              lineHeight: 1.0, marginBottom: '4px',
            }}>
              {displayName || 'Your Name'}
            </div>
            {user?.bio && (
              <div style={{ fontFamily: HN, fontSize: '13px', fontWeight: 400, color: '#0A0A0A', lineHeight: 1.6, maxWidth: '480px' }}>
                {user.bio}
              </div>
            )}
          </div>

          {/* Project grid */}
          {submittedProjects.length === 0 ? (
            <PlaceholderGrid />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {submittedProjects.map((project, i) => (
                <ProjectCard
                  key={i}
                  project={project}
                  onClick={() => navigate(`/project/${i}`, { state: { project } })}
                />
              ))}
            </div>
          )}

          {/* Share portfolio */}
          <div style={{ marginTop: '48px' }}>
            <button
              onClick={handleShare}
              style={{
                fontFamily: HN, fontSize: '13px', color: '#0A0A0A',
                background: 'transparent', border: '1px solid #0A0A0A',
                padding: '12px 32px', width: 'fit-content',
                cursor: 'pointer', borderRadius: 0,
              }}
            >
              Share your portfolio
            </button>
            {toast && (
              <div style={{ fontFamily: HN, fontSize: '12px', color: '#0A0A0A', opacity: 0.6, marginTop: '8px' }}>
                Link copied!
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ width: '220px', flexShrink: 0 }}>

          {/* Designer title + social icons */}
          <div style={{ marginBottom: '32px' }}>
            {user?.title && (
              <div style={{ fontFamily: HN, fontSize: '13px', fontWeight: 400, color: '#0A0A0A', marginBottom: '12px' }}>
                {user.title}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              {user?.instagram && (
                <a href={`https://instagram.com/${user.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={socialLinkStyle}>Ig</a>
              )}
              {user?.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noreferrer" style={socialLinkStyle}>Li</a>
              )}
              {user?.behance && (
                <a href={user.behance} target="_blank" rel="noreferrer" style={socialLinkStyle}>Be</a>
              )}
            </div>
          </div>

          {/* Ongoing projects */}
          <div>
            <div style={{
              fontFamily: HN, fontSize: '11px', fontWeight: 400, color: '#0A0A0A',
              borderBottom: '1px solid #0A0A0A',
              paddingBottom: '4px', marginBottom: '12px',
              display: 'inline-block',
            }}>
              on-going project
            </div>

            {(() => {
              const ongoing = savedBriefs.filter(b => b.status === 'ongoing' || !b.status)
              if (ongoing.length === 0) {
                return (
                  <div style={{ background: '#60DDE6', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ fontFamily: HN, fontSize: '16px', fontWeight: 400, color: 'rgba(0,0,0,0.35)' }}>
                      project title
                    </div>
                  </div>
                )
              }
              return ongoing.map((brief, i) => (
                <OngoingCard
                  key={i}
                  savedBrief={brief}
                  onClick={() => brief.isChallenge
                    ? navigate('/weekly-challenge', { state: { savedChallenge: brief } })
                    : navigate('/brief', { state: { folderName: brief.discipline, categoryColor: brief.categoryColor, savedBrief: brief } })
                  }
                />
              ))
            })()}
          </div>

          {/* Add project manually */}
          {addedToast && (
            <div style={{ fontFamily: HN, fontSize: '11px', color: '#0A0A0A', opacity: 0.6, marginBottom: '8px', textAlign: 'center' }}>
              Project added to portfolio
            </div>
          )}
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              onClick={() => setModalOpen(true)}
              style={{
                width: '64px', height: '64px', borderRadius: '50%',
                border: '1.5px solid rgba(0,0,0,0.3)',
                background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 0,
              }}
            >
              <span style={{ fontFamily: HN, fontSize: '24px', fontWeight: 200, color: 'rgba(0,0,0,0.5)', lineHeight: 1 }}>+</span>
            </button>
            <div style={{ fontFamily: HN, fontSize: '11px', color: '#0A0A0A', textAlign: 'center', marginTop: '6px' }}>
              add project manually
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <AddProjectModal
          onClose={() => setModalOpen(false)}
          onAdded={handleProjectAdded}
        />
      )}
    </div>
  )
}
