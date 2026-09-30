import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import ScrollCue from '../components/ScrollCue'
import { supabase } from '../lib/supabase'
import { handleSpotlightMove } from '../lib/spotlight'
import { disciplineColor } from '../lib/theme'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

function rowToProject(row) {
  return {
    id: row.id,
    title: row.title,
    discipline: row.discipline,
    coverImage: row.image_url,
    image: row.image_url,
    images: row.images || [],
    brief: row.brief_data,
    folderColor: row.folder_color,
    isHighlight: row.is_highlight,
  }
}

// Fetches the public profile rows for a batch of project owners in one
// round trip, so search/dashboard results can show a "by <name>" byline
// and link back to /u/:slug.
async function attachOwners(rows) {
  const ownerIds = [...new Set(rows.map((r) => r.user_id))]
  if (ownerIds.length === 0) return rows.map((r) => ({ ...rowToProject(r), owner: null }))
  const { data: owners } = await supabase.from('profiles').select('id,name,slug,avatar_url').in('id', ownerIds)
  const ownerMap = Object.fromEntries((owners || []).map((o) => [o.id, o]))
  return rows.map((r) => ({ ...rowToProject(r), owner: ownerMap[r.user_id] || null }))
}

function ProjectResultCard({ project, onClick }) {
  const { brief, folderColor, coverImage, images, image, title, discipline, owner } = project
  const folderName = discipline || brief?.folder || 'design'
  const color = folderColor || brief?.folder_color || disciplineColor(folderName)
  const thumbnail = coverImage || images?.[0] || image
  const displayTitle = title || brief?.title || 'Untitled'

  return (
    <div className="card-pop" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div
        className="spotlight-card"
        onMouseMove={handleSpotlightMove}
        style={{
          position: 'relative',
          background: thumbnail ? '#EDEDED' : color,
          aspectRatio: '3 / 4', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {thumbnail && (
          <img src={thumbnail} alt={displayTitle} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
        {project.isHighlight && (
          <span style={{
            position: 'absolute', top: '8px', left: '8px',
            width: '20px', height: '20px', borderRadius: '50%', background: '#0A0A0A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', color: '#D4E84A', lineHeight: 1,
          }}>
            ★
          </span>
        )}
      </div>
      <div style={{ fontFamily: HN, fontSize: '12px', color: '#0A0A0A', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
        {displayTitle}
      </div>
      {owner && (
        <div style={{ fontFamily: HN, fontSize: '10px', color: '#999', marginTop: '2px' }}>
          by {owner.name || owner.slug}
        </div>
      )}
    </div>
  )
}

function PersonResultCard({ person, onClick }) {
  return (
    <div
      className="card-pop"
      onClick={onClick}
      style={{
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px',
        padding: '14px', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '12px',
      }}
    >
      <div style={{
        width: '46px', height: '46px', borderRadius: '50%', background: '#D4D4D4',
        overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {person.avatar_url ? (
          <img src={person.avatar_url} loading="lazy" decoding="async" alt={person.name || person.slug} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <span style={{ fontFamily: HN, fontSize: '8px', textTransform: 'uppercase', color: '#999' }}>photo</span>
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: HN, fontSize: '13px', fontWeight: 600, color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {person.name || person.slug}
        </div>
        {person.title && (
          <div style={{ fontFamily: HN, fontSize: '11px', color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {person.title}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [people, setPeople] = useState([])
  const [projects, setProjects] = useState([])
  const [recentProjects, setRecentProjects] = useState([])
  const debounceRef = useRef(null)

  // Default dashboard state — the most recent public community work, so the
  // landing page always has something to browse even before anyone searches.
  useEffect(() => {
    let cancelled = false
    async function loadRecent() {
      const { data: rows } = await supabase
        .from('submitted_projects')
        .select('*')
        .eq('is_public', true)
        .order('submitted_at', { ascending: false })
        .limit(24)
      if (cancelled) return
      setRecentProjects(await attachOwners(rows || []))
    }
    loadRecent()
    return () => { cancelled = true }
  }, [])

  // Live search, debounced — queries public profiles (people) and public
  // projects (by title) as the person types. Every setState call happens
  // inside the (async) timeout callback, never synchronously in the effect
  // body itself, so clearing the input doesn't trigger a cascading render.
  useEffect(() => {
    const trimmed = query.trim()
    if (debounceRef.current) clearTimeout(debounceRef.current)

    let cancelled = false
    debounceRef.current = setTimeout(async () => {
      if (!trimmed) {
        if (!cancelled) {
          setPeople([])
          setProjects([])
          setSearching(false)
        }
        return
      }

      setSearching(true)
      const like = `%${trimmed}%`
      const [{ data: profileRows }, { data: projectRows }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id,name,slug,title,avatar_url')
          .not('slug', 'is', null)
          .or(`name.ilike.${like},slug.ilike.${like},title.ilike.${like}`)
          .limit(8),
        supabase
          .from('submitted_projects')
          .select('*')
          .eq('is_public', true)
          .ilike('title', like)
          .order('submitted_at', { ascending: false })
          .limit(8),
      ])
      const withOwners = await attachOwners(projectRows || [])
      if (cancelled) return
      setPeople(profileRows || [])
      setProjects(withOwners)
      setSearching(false)
    }, trimmed ? 300 : 0)

    return () => {
      cancelled = true
      clearTimeout(debounceRef.current)
    }
  }, [query])

  const hasQuery = query.trim().length > 0
  const noResults = hasQuery && !searching && people.length === 0 && projects.length === 0

  // "Recent community work" stays a fixed 2-row block instead of growing
  // taller and needing a scroll — as more gets submitted, it adds columns
  // (shrinking every tile a bit) rather than adding rows. 4 columns is the
  // baseline look for up to 8 projects; beyond that it widens to keep
  // everything at 2 rows.
  const recentColumns = Math.max(4, Math.ceil(recentProjects.length / 2))

  const goToProject = (project) =>
    navigate(`/project/${project.id}`, { state: { project, readOnly: true, profileSlug: project.owner?.slug } })
  const goToProfile = (person) => navigate(`/u/${person.slug}`)

  const sectionLabelStyle = {
    fontFamily: HN, fontSize: '11px', textTransform: 'uppercase',
    letterSpacing: '0.08em', color: '#999', marginBottom: '16px',
  }

  return (
    <div className="page-enter" style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left gutter */}
        <div style={{ width: '90px', flexShrink: 0, borderRight: '1px solid rgba(0,0,0,0.15)', boxSizing: 'border-box' }} />

        {/* Main content */}
        <div style={{ flex: 1, padding: '48px 40px 60px', boxSizing: 'border-box', minWidth: 0 }}>
          {/* Hero + search — centered */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: HN, fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 400,
              textTransform: 'uppercase', color: '#0A0A0A', lineHeight: 1.1,
            }}>
              Brief Generator and Design Community
            </div>
            <div style={{ borderTop: '1px dashed rgba(0,0,0,0.3)', margin: '24px 0 32px', maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }} />

            {/* Search bar — rounded pill input + separate circular search button */}
            <form
              onSubmit={(e) => e.preventDefault()}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '560px', margin: '0 auto 48px' }}
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                style={{
                  flex: 1, minWidth: 0, boxSizing: 'border-box',
                  fontFamily: HN, fontSize: '14px', color: '#0A0A0A',
                  background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '999px',
                  padding: '8px 22px', outline: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              />
              <button
                type="submit"
                aria-label="Search"
                style={{
                  width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                  background: '#0A0A0A', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="#FFFFFF" strokeWidth="2.5" />
                  <path d="M20 20L16.5 16.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </form>
          </div>

          <div style={{ borderTop: '1px dashed rgba(0,0,0,0.3)', margin: '0 0 32px' }} />

          {hasQuery ? (
            <div>
              {searching && (
                <div style={{ fontFamily: HN, fontSize: '12px', color: '#999' }}>Searching…</div>
              )}
              {!searching && noResults && (
                <div style={{ fontFamily: HN, fontSize: '12px', color: '#999' }}>
                  No people or projects match “{query.trim()}”.
                </div>
              )}
              {people.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                  <div style={sectionLabelStyle}>People</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                    {people.map((p) => (
                      <PersonResultCard key={p.id} person={p} onClick={() => goToProfile(p)} />
                    ))}
                  </div>
                </div>
              )}
              {projects.length > 0 && (
                <div>
                  <div style={sectionLabelStyle}>Projects</div>
                  <div className="responsive-project-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px 16px' }}>
                    {projects.map((project) => (
                      <ProjectResultCard key={project.id} project={project} onClick={() => goToProject(project)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={sectionLabelStyle}>Recent community work</div>
              {recentProjects.length === 0 ? (
                <div style={{ fontFamily: HN, fontSize: '12px', color: '#bbb' }}>
                  Nothing shared publicly yet — be the first.
                </div>
              ) : (
                <div className="responsive-project-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${recentColumns}, 1fr)`, gap: '20px 16px' }}>
                  {recentProjects.map((project) => (
                    <ProjectResultCard key={project.id} project={project} onClick={() => goToProject(project)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Aligned with the left gutter's border, which sits directly under
          the header's logo cell — same vertical line, continuing down. */}
      <ScrollCue itemCount={hasQuery ? projects.length : recentProjects.length} desktopColumns={4} left="90px" />
    </div>
  )
}
