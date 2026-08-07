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

const FOLDER_COLORS = {
  'Brand & Identity': '#D4E84A',
  'Print & Type': '#E84AC8',
  'Digital & Screen': '#60DDE6',
  'Image & Direction': '#4AE87A',
  'Art & Space': '#E8804A',
}

function CategoryFolder({ discipline, projects, onClick }) {
  const color = FOLDER_COLORS[discipline] || '#D9D9D9'
  const count = projects.length
  const thumbs = projects
    .map((p) => p.coverImage || p.images?.[0] || p.image)
    .filter(Boolean)
    .slice(0, 3)

  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '10px', textAlign: 'center', width: '170px',
      }}
    >
      <div style={{ position: 'relative', width: '170px', height: '130px' }}>
        {/* Photo peeks — mostly tucked behind the folder, just a sliver showing */}
        <div style={{
          position: 'absolute', top: '28px', left: 0, right: 0, height: '50px',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1,
        }}>
          {thumbs.map((src, i) => {
            const n = thumbs.length
            const angle = (i - (n - 1) / 2) * 11
            const offsetX = (i - (n - 1) / 2) * 42
            return (
              <img
                key={i}
                src={src}
                alt=""
                style={{
                  position: 'absolute',
                  width: '42px', height: '42px', objectFit: 'cover',
                  borderRadius: '5px', border: '2px solid #FFFFFF',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  transform: `translateX(${offsetX}px) rotate(${angle}deg)`,
                }}
              />
            )
          })}
        </div>

        {/* Folder tab */}
        <div style={{
          position: 'absolute', top: '46px', left: '10px',
          width: '66px', height: '18px', background: color,
          borderRadius: '8px 8px 0 0', zIndex: 2,
        }} />
        {/* Folder body */}
        <div style={{
          position: 'absolute', top: '60px', left: 0, right: 0, height: '70px',
          background: color, borderRadius: '10px',
          border: '1px solid rgba(0,0,0,0.12)', boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          zIndex: 2,
        }} />
      </div>
      <div style={{ fontFamily: HN, fontSize: '13px', color: '#0A0A0A', lineHeight: 1.3 }}>
        {discipline}
      </div>
      <div style={{ fontFamily: HN, fontSize: '10px', color: '#999' }}>
        {count} project{count === 1 ? '' : 's'}
      </div>
    </div>
  )
}

function HighlightStack({ projects, onSelect }) {
  if (projects.length === 0) return null
  return (
    <div className="highlight-stack">
      {projects.map((project) => {
        const thumbnail = project.coverImage || project.images?.[0] || project.image
        if (!thumbnail) return null
        return (
          <div
            key={project.id}
            className="highlight-stack-item"
            onClick={() => onSelect(project)}
          >
            <img src={thumbnail} alt={project.title || 'Highlighted project'} />
          </div>
        )
      })}
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
  const profile = user?.user_metadata || {}
  const displayName = profile.name || profile.username || ''
  const [toast, setToast] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [addedToast, setAddedToast] = useState(false)
  const [openFolder, setOpenFolder] = useState(null)

  // Once someone has more than 5 projects, group them into folders by
  // category instead of one long flat grid.
  const highlightProjects = submittedProjects.filter((p) => p.isHighlight)
  const shouldGroup = submittedProjects.length > 5
  const groupedProjects = shouldGroup
    ? submittedProjects.reduce((groups, project) => {
        const key = project.discipline || project.brief?.folder || 'Other'
        if (!groups[key]) groups[key] = []
        groups[key].push(project)
        return groups
      }, {})
    : null

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
            {profile.bio && (
              <div style={{ fontFamily: HN, fontSize: '13px', fontWeight: 400, color: '#0A0A0A', lineHeight: 1.6, maxWidth: '480px', marginBottom: '10px' }}>
                {profile.bio}
              </div>
            )}
            <button
              onClick={() => navigate('/settings')}
              style={{
                fontFamily: HN, fontSize: '11px', color: '#999',
                background: 'none', border: 'none', textDecoration: 'underline',
                cursor: 'pointer', padding: 0,
              }}
            >
              Edit profile
            </button>
          </div>

          {/* Project grid */}
          {submittedProjects.length === 0 ? (
            <PlaceholderGrid />
          ) : shouldGroup && !openFolder ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '32px 16px' }}>
              {Object.entries(groupedProjects).map(([discipline, projects]) => (
                <CategoryFolder
                  key={discipline}
                  discipline={discipline}
                  projects={projects}
                  onClick={() => setOpenFolder(discipline)}
                />
              ))}
            </div>
          ) : (
            <div>
              {shouldGroup && (
                <button
                  onClick={() => setOpenFolder(null)}
                  style={{
                    fontFamily: HN, fontSize: '11px', color: '#999',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0, marginBottom: '16px', display: 'block',
                  }}
                >
                  ‹ All categories
                </button>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {(shouldGroup ? groupedProjects[openFolder] || [] : submittedProjects).map((project, i) => (
                  <ProjectCard
                    key={i}
                    project={project}
                    onClick={() => navigate(`/project/${i}`, { state: { project } })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Highlight work */}
          {highlightProjects.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <div style={{
                fontFamily: HN, fontSize: '11px', fontWeight: 400, color: '#0A0A0A',
                borderBottom: '1px solid #0A0A0A',
                paddingBottom: '4px', marginBottom: '16px',
                display: 'inline-block',
              }}>
                highlight work
              </div>
              <HighlightStack
                projects={highlightProjects}
                onSelect={(project) => {
                  const i = submittedProjects.indexOf(project)
                  navigate(`/project/${i}`, { state: { project } })
                }}
              />
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
            {toast === 'save-first' && (
              <div style={{ fontFamily: HN, fontSize: '12px', color: '#E84A4A', marginTop: '8px' }}>
                Save your profile in Settings first to get a share link.
              </div>
            )}
            {toast === true && (
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
            {profile.title && (
              <div style={{ fontFamily: HN, fontSize: '13px', fontWeight: 400, color: '#0A0A0A', marginBottom: '12px' }}>
                {profile.title}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
