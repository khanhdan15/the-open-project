import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { supabase } from '../lib/supabase'

const HN = '-apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

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
    <div className="highlight-stack-wrap">
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
              <div className="highlight-stack-item-media">
                <img src={thumbnail} alt={project.title || 'Highlighted project'} />
              </div>
              <div className="highlight-stack-item-caption">
                {project.title || 'Untitled'}
              </div>
            </div>
          )
        })}
      </div>
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
          <span style={{ fontFamily: HN, fontSize: '12px', color: 'rgba(0,0,0,0.4)' }}>project</span>
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

export default function PublicProfile() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [openFolder, setOpenFolder] = useState(null)

  const highlightProjects = projects.filter((p) => p.isHighlight)
  const shouldGroup = projects.length > 5
  const groupedProjects = shouldGroup
    ? projects.reduce((groups, project) => {
        const key = project.discipline || project.brief?.folder || 'Other'
        if (!groups[key]) groups[key] = []
        groups[key].push(project)
        return groups
      }, {})
    : null

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
        setProjects((projectRows || []).map(rowToProject))
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

  return (
    <div className="page-enter" style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div className="responsive-columns" style={{ display: 'flex', gap: '40px', padding: '40px', flex: 1 }}>
        {/* LEFT COLUMN */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: '32px' }}>
            <div className="responsive-hero-name" style={{
              fontFamily: HN, fontSize: '48px', fontWeight: 700,
              color: '#0A0A0A', textTransform: 'uppercase',
              lineHeight: 1.0, marginBottom: '4px',
            }}>
              {profile.name || 'Untitled Portfolio'}
            </div>
            {profile.bio && (
              <div style={{ fontFamily: HN, fontSize: '13px', fontWeight: 400, color: '#0A0A0A', lineHeight: 1.6, maxWidth: '480px' }}>
                {profile.bio}
              </div>
            )}
          </div>

          {projects.length === 0 ? (
            <div style={{ fontFamily: HN, fontSize: '12px', color: '#bbb' }}>No public projects yet.</div>
          ) : shouldGroup && !openFolder ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '32px 16px' }}>
              {Object.entries(groupedProjects).map(([discipline, catProjects]) => (
                <CategoryFolder
                  key={discipline}
                  discipline={discipline}
                  projects={catProjects}
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
              <div className="responsive-project-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {(shouldGroup ? groupedProjects[openFolder] || [] : projects).map((project, i) => (
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
                  const i = projects.indexOf(project)
                  navigate(`/project/${i}`, { state: { project } })
                }}
              />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ width: '220px', flexShrink: 0 }}>
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
              {profile.cv_url && (
                <a href={profile.cv_url} target="_blank" rel="noreferrer" style={socialLinkStyle}>CV</a>
              )}
            </div>
          </div>

          {profile.work_experience && (
            <div>
              <div style={{
                fontFamily: HN, fontSize: '11px', fontWeight: 400, color: '#0A0A0A',
                borderBottom: '1px solid #0A0A0A',
                paddingBottom: '4px', marginBottom: '12px',
                display: 'inline-block',
              }}>
                experience
              </div>
              <div style={{ fontFamily: HN, fontSize: '12px', color: '#0A0A0A', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {profile.work_experience}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
