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
  }
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

      <div style={{ display: 'flex', gap: '40px', padding: '40px', flex: 1 }}>
        {/* LEFT COLUMN */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{
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
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {projects.map((project, i) => (
                <ProjectCard
                  key={i}
                  project={project}
                  onClick={() => navigate(`/project/${i}`, { state: { project } })}
                />
              ))}
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
