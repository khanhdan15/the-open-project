import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import ScrollCue from '../components/ScrollCue'
import { supabase } from '../lib/supabase'
import { handleSpotlightMove } from '../lib/spotlight'
import { disciplineColor } from '../lib/theme'
import Thumb from '../components/Thumb'
import Masonry from '../components/Masonry'
import { snapCardToImage } from '../lib/images'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

const socialLinkStyle = {
  width: '28px', height: '28px', borderRadius: '50%',
  border: '1px solid #0A0A0A',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  textDecoration: 'none', color: '#0A0A0A',
  fontFamily: HN, fontSize: '10px', fontWeight: 600,
  flexShrink: 0,
}

function rowToProject(row) {
  return {
    id: row.id,
    title: row.title,
    discipline: row.discipline,
    note: row.description,
    coverImage: row.image_url,
    image: row.image_url,
    images: row.images || [],
    brief: row.brief_data,
    meta: row.meta,
    folderColor: row.folder_color,
    isHighlight: row.is_highlight,
  }
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
          <Thumb src={thumbnail} alt={displayTitle} onLoaded={snapCardToImage} style={{ display: 'block' }} />
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

export default function PublicProfile() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [tab, setTab] = useState('projects')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setNotFound(false)

      const { data: profileRow } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (!profileRow) {
        if (!cancelled) { setNotFound(true); setLoading(false) }
        return
      }

      const { data: projectRows } = await supabase
        .from('submitted_projects')
        .select('*')
        .eq('user_id', profileRow.id)
        .eq('is_public', true)
        .order('submitted_at', { ascending: false })

      if (!cancelled) {
        setProfile(profileRow)
        // Pinned project always leads the grid; stable sort keeps the rest
        // in their existing submitted_at-desc order.
        const mapped = (projectRows || []).map(rowToProject)
        mapped.sort((a, b) => (b.isHighlight ? 1 : 0) - (a.isHighlight ? 1 : 0))
        setProjects(mapped)
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [slug])

  if (loading) {
    return (
      <div className="page-enter" style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HN, fontSize: '12px', color: '#bbb' }}>
          Loading…
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="page-enter" style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{ fontFamily: HN, fontSize: '14px', color: '#0A0A0A' }}>No profile found at this link.</div>
          <button
            onClick={() => navigate('/')}
            style={{ fontFamily: HN, fontSize: '11px', color: '#999', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Go to Open Ruler
          </button>
        </div>
      </div>
    )
  }

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
            {profile.name || 'Untitled Portfolio'}
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
            {profile.cv_url && (
              <a href={profile.cv_url} target="_blank" rel="noreferrer" style={socialLinkStyle}>CV</a>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => setTab('projects')} style={tabStyle(tab === 'projects')}>Projects</button>
          <button onClick={() => setTab('about')} style={tabStyle(tab === 'about')}>About</button>
        </div>
      </div>

      {tab === 'about' ? (
        /* ─── About tab ────────────────────────────────────────────── */
        <div style={{ padding: '40px 40px 60px', maxWidth: '720px' }}>
          <div style={{
            width: '110px', height: '110px', borderRadius: '50%',
            background: '#D4D4D4', marginBottom: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} loading="lazy" decoding="async" alt={profile.name || 'Avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <span style={{ fontFamily: HN, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999' }}>
                avatar
              </span>
            )}
          </div>
          <div style={{ fontFamily: HN, fontSize: '13px', lineHeight: 1.8, color: '#0A0A0A', whiteSpace: 'pre-wrap' }}>
            {profile.bio || 'This designer hasn’t written a bio yet.'}
          </div>
          {profile.work_experience && (
            <div style={{ marginTop: '32px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '24px' }}>
              <div style={{ fontFamily: HN, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: '10px' }}>
                Work Experience
              </div>
              <div style={{ fontFamily: HN, fontSize: '13px', lineHeight: 1.8, color: '#0A0A0A', whiteSpace: 'pre-wrap' }}>
                {profile.work_experience}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ─── Projects tab ─────────────────────────────────────────── */
        <div style={{ padding: '32px 40px 60px' }}>
          {projects.length === 0 ? (
            <div style={{ fontFamily: HN, fontSize: '12px', color: '#bbb' }}>No public projects yet.</div>
          ) : (
            <Masonry columns={4} mobileColumns={2}>
              {projects.map((project, i) => (
                <ProjectCard
                  key={i}
                  project={project}
                  index={i}
                  onClick={() => navigate(`/project/${i}`, { state: { project, readOnly: true, profileSlug: slug, ownerName: profile?.name } })}
                />
              ))}
            </Masonry>
          )}
        </div>
      )}

      <ScrollCue itemCount={projects.length} active={tab === 'projects'} desktopColumns={4} />
    </div>
  )
}
