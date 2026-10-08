import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { compressImage, MAX_IMAGE_DIM, THUMB_DIM, storagePathFromUrl, isThumbPath, thumbUrl } from '../lib/images'

const UserContext = createContext(null)

const BUCKET = 'portfolio-images'
// Every upload gets a fresh UUID path and is never overwritten, so browsers
// and the CDN can safely cache it for a year instead of re-fetching hourly
// (Supabase's default).
const CACHE_ONE_YEAR = '31536000'

async function putObject(path, blob) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: blob.type, cacheControl: CACHE_ONE_YEAR })
  if (error) throw error
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

// Uploads an image for a user: a compressed full-size version (shown on the
// project page) plus a small "<id>_thumb.webp" next to it for grids — see
// thumbUrl() in lib/images.js. Non-compressible files (GIFs, PDFs) are
// uploaded as-is with no thumbnail. Returns the full-size URL.
async function uploadImageBlob(userId, original) {
  const full = await compressImage(original, MAX_IMAGE_DIM)
  const ext = (full.type.split('/')[1] || 'png').split('+')[0]
  const id = crypto.randomUUID()
  const url = await putObject(`${userId}/${id}.${ext}`, full)
  if (full.type === 'image/webp') {
    try {
      const thumb = await compressImage(original, THUMB_DIM)
      if (thumb.type === 'image/webp') await putObject(`${userId}/${id}_thumb.webp`, thumb)
    } catch (e) {
      // Not fatal — grids fall back to the full image when a thumb is missing.
      console.warn('Thumbnail upload failed:', e)
    }
  }
  return url
}

// ─── One-time cleanup of older, full-size uploads ──────────────────────────
// Images uploaded before compression existed are still multi-MB originals,
// and the WebP ones uploaded since have no grid thumbnail yet. When an owner
// is signed in, this quietly re-encodes their own old images in the
// background (compressed copy + thumbnail) and points the project at the new
// files. Original files are left in storage untouched — nothing is deleted.

const optimizedUsers = new Set()

async function optimizeStoredImage(userId, url) {
  const path = storagePathFromUrl(url)
  // Only touch files in this user's own storage folder.
  if (!path || !path.startsWith(`${userId}/`) || isThumbPath(path)) return url

  if (/\.webp$/i.test(path)) {
    // Already compressed — just make sure its thumbnail exists.
    const head = await fetch(thumbUrl(url), { method: 'HEAD' })
    if (head.ok) return url
    const res = await fetch(url)
    if (!res.ok) return url
    const small = await compressImage(await res.blob(), THUMB_DIM)
    if (small.type === 'image/webp') await putObject(path.replace(/\.webp$/i, '_thumb.webp'), small)
    return url
  }

  const res = await fetch(url)
  if (!res.ok) return url
  const blob = await res.blob()
  const full = await compressImage(blob, MAX_IMAGE_DIM)
  if (full === blob) return url // GIF, PDF, or already as small as it gets
  return uploadImageBlob(userId, blob)
}

async function optimizeProjectImages(userId, rows, onUpdated) {
  if (optimizedUsers.has(userId)) return
  optimizedUsers.add(userId)
  // Let the page's own images load first instead of competing with them.
  await new Promise((resolve) => setTimeout(resolve, 4000))

  const done = new Map()
  const fix = async (url) => {
    if (!url) return url
    if (!done.has(url)) done.set(url, await optimizeStoredImage(userId, url).catch(() => url))
    return done.get(url)
  }

  for (const row of rows) {
    try {
      const oldImages = row.images || []
      const newCover = await fix(row.image_url)
      const newImages = []
      for (const url of oldImages) newImages.push(await fix(url))
      const changed = newCover !== row.image_url || newImages.some((u, i) => u !== oldImages[i])
      if (!changed) continue

      // Skip if the project was edited while this was running, so we never
      // overwrite newer changes with an older image list.
      const { data: current } = await supabase
        .from('submitted_projects').select('image_url,images').eq('id', row.id).single()
      if (!current || current.image_url !== row.image_url
        || JSON.stringify(current.images || []) !== JSON.stringify(oldImages)) continue

      const { data, error } = await supabase
        .from('submitted_projects')
        .update({ image_url: newCover, images: newImages })
        .eq('id', row.id)
        .select()
        .single()
      if (!error && data) onUpdated(data)
    } catch (e) {
      console.warn('Skipped optimizing images for project', row.id, e)
    }
  }
}

export function UserProvider({ children }) {
  const [user, setUser]                       = useState(null)
  const [savedBriefs, setSavedBriefs]         = useState([])
  const [submittedProjects, setSubmittedProjects] = useState([])
  const [loading, setLoading]                 = useState(true)

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchSavedBriefs(session.user.id)
        fetchSubmittedProjects(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchSavedBriefs(session.user.id)
        fetchSubmittedProjects(session.user.id)
      } else {
        setSavedBriefs([])
        setSubmittedProjects([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ─── Shape helpers ──────────────────────────────────────────────────────
  // The UI (Portfolio/Brief/ProjectDetail) works with flat objects like
  // { title, brief_id, isChallenge, ... } for briefs and
  // { title, brief, meta, coverImage, images, folderColor, note } for
  // projects. Supabase rows nest that data under brief_data/meta/image_url
  // columns, so we flatten on the way out and re-nest on the way in.

  function rowToBrief(row) {
    return { ...row.brief_data, id: row.id, saved_at: row.saved_at }
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
      isChallenge: row.is_challenge,
      isPublic: row.is_public,
      isHighlight: row.is_highlight,
      submitted_at: row.submitted_at,
    }
  }

  // Reads a base64 data URL (or passes through an existing URL) and uploads
  // it to the portfolio-images storage bucket under the user's own folder.
  // Photos are resized/re-encoded first (see compressImage) so a 5MB phone
  // shot lands as a few hundred KB instead of being served full-size in
  // every grid.
  async function uploadImage(source) {
    if (!source || !user) return null
    if (!source.startsWith('data:')) return source // already a URL

    try {
      const res = await fetch(source)
      return await uploadImageBlob(user.id, await res.blob())
    } catch (e) {
      console.error('Image upload failed:', e)
      return null
    }
  }

  // Uploads a project's images. The cover is normally the same file as
  // images[0], so it's uploaded once and reused instead of stored twice —
  // which also lets the browser reuse the cached file between pages.
  async function uploadProjectImages(project) {
    const sources = project.images || []
    const extraUrls = await Promise.all(sources.map(uploadImage))
    const coverSource = project.coverImage || project.image
    const coverIndex = sources.indexOf(coverSource)
    const coverUrl = coverIndex >= 0 ? extraUrls[coverIndex] : await uploadImage(coverSource)
    return { coverUrl, extraUrls }
  }

  // Fetch from Supabase
  async function fetchSavedBriefs(userId) {
    const { data } = await supabase
      .from('saved_briefs')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })
    if (data) setSavedBriefs(data.map(rowToBrief))
  }

  async function fetchSubmittedProjects(userId) {
    const { data } = await supabase
      .from('submitted_projects')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
    if (data) {
      setSubmittedProjects(data.map(rowToProject))
      // Fire-and-forget: shrink this owner's older full-size uploads.
      optimizeProjectImages(userId, data, (row) => {
        setSubmittedProjects((prev) => prev.map((p) => (p.id === row.id ? rowToProject(row) : p)))
      })
    }
  }

  // Auth actions
  async function signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    return { data, error }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  // Profile — persisted on the Supabase auth user's metadata (name, title,
  // bio, workExperience, instagram, linkedin, behance, cvUrl) AND mirrored
  // into the public "profiles" table so other, logged-out visitors can look
  // it up by slug (auth.users itself is never queryable by other users).
  async function updateProfile(fields) {
    if (!user) return

    const base = (fields.name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const slug = base ? `${base}-${user.id.slice(0, 4)}` : user.id.slice(0, 8)

    const { data, error } = await supabase.auth.updateUser({ data: { ...fields, slug } })
    if (data?.user) setUser(data.user)
    if (error) return { data, error }

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      slug,
      name: fields.name || '',
      title: fields.title || '',
      bio: fields.bio || '',
      work_experience: fields.workExperience || '',
      instagram: fields.instagram || '',
      linkedin: fields.linkedin || '',
      behance: fields.behance || '',
      cv_url: fields.cvUrl || '',
      avatar_url: fields.avatarUrl || '',
      updated_at: new Date().toISOString(),
    })

    return { data, error: profileError }
  }

  // Uploads a new avatar image and saves it onto the existing profile —
  // merges with whatever's already in user_metadata so other fields aren't
  // wiped out by the upsert in updateProfile.
  async function updateAvatar(base64) {
    if (!user) return
    const url = await uploadImage(base64)
    if (!url) return { error: new Error('Avatar upload failed. Please try again.') }
    const p = user.user_metadata || {}
    return updateProfile({
      name: p.name,
      title: p.title,
      bio: p.bio,
      workExperience: p.workExperience,
      instagram: p.instagram,
      linkedin: p.linkedin,
      behance: p.behance,
      cvUrl: p.cvUrl,
      avatarUrl: url,
    })
  }

  // Uploads a new CV file (any type — PDF, DOC, etc.) to the same
  // per-user storage folder as portfolio images, then saves the resulting
  // URL onto the profile. Same merge-with-existing pattern as updateAvatar
  // so this doesn't wipe out unrelated fields.
  async function updateCV(base64) {
    if (!user) return
    const url = await uploadImage(base64)
    if (!url) return { error: new Error('CV upload failed. Please try again.') }
    const p = user.user_metadata || {}
    return updateProfile({
      name: p.name,
      title: p.title,
      bio: p.bio,
      workExperience: p.workExperience,
      instagram: p.instagram,
      linkedin: p.linkedin,
      behance: p.behance,
      avatarUrl: p.avatarUrl,
      cvUrl: url,
    })
  }

  // Briefs
  async function addSavedBrief(brief) {
    if (!user) return
    const { data, error } = await supabase
      .from('saved_briefs')
      .insert({ user_id: user.id, discipline: brief.discipline, brief_data: brief })
      .select()
      .single()
    if (data) setSavedBriefs((prev) => [rowToBrief(data), ...prev])
    return { data, error }
  }

  async function removeSavedBrief(briefId) {
    if (!briefId) return
    await supabase.from('saved_briefs').delete().eq('id', briefId)
    setSavedBriefs((prev) => prev.filter((b) => b.id !== briefId))
  }

  async function removeSubmittedProject(projectId) {
    if (!projectId) return
    const { error } = await supabase.from('submitted_projects').delete().eq('id', projectId)
    if (!error) setSubmittedProjects((prev) => prev.filter((p) => p.id !== projectId))
    return { error }
  }

  async function setProjectHighlight(projectId, isHighlight) {
    if (!projectId) return
    const { error } = await supabase
      .from('submitted_projects')
      .update({ is_highlight: isHighlight })
      .eq('id', projectId)
    if (!error) {
      setSubmittedProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, isHighlight } : p))
      )
    }
    return { error }
  }

  // Projects
  async function addSubmittedProject(project) {
    if (!user) return

    const { coverUrl, extraUrls } = await uploadProjectImages(project)

    const { data, error } = await supabase
      .from('submitted_projects')
      .insert({
        user_id: user.id,
        title: project.title,
        discipline: project.discipline || project.brief?.discipline || project.brief?.folder || null,
        description: project.note ?? project.description ?? '',
        image_url: coverUrl,
        images: extraUrls.filter(Boolean),
        brief_data: project.brief || null,
        meta: project.meta || null,
        folder_color: project.folderColor || null,
        is_challenge: project.isChallenge ?? project.is_challenge ?? project.brief?.isChallenge ?? false,
        is_public: project.is_public ?? true,
      })
      .select()
      .single()
    if (data) setSubmittedProjects((prev) => [rowToProject(data), ...prev])
    return { data, error }
  }

  // Updates an existing project. project.images may already be a mix of
  // real storage URLs (kept as-is) and new base64 selections (uploaded) —
  // uploadImage() passes real URLs straight through.
  async function updateSubmittedProject(projectId, project) {
    if (!user || !projectId) return

    const { coverUrl, extraUrls } = await uploadProjectImages(project)

    const { data, error } = await supabase
      .from('submitted_projects')
      .update({
        title: project.title,
        discipline: project.discipline || project.brief?.discipline || project.brief?.folder || null,
        description: project.note ?? project.description ?? '',
        image_url: coverUrl,
        images: extraUrls.filter(Boolean),
        brief_data: project.brief || null,
        meta: project.meta || null,
        folder_color: project.folderColor || null,
      })
      .eq('id', projectId)
      .select()
      .single()

    if (data) {
      const mapped = rowToProject(data)
      setSubmittedProjects((prev) => prev.map((p) => (p.id === projectId ? mapped : p)))
      return { data: mapped, error }
    }
    return { data: null, error }
  }

  return (
    <UserContext.Provider value={{
      user, savedBriefs, submittedProjects, loading,
      signUp, signIn, signOut, updateProfile, updateAvatar, updateCV,
      addSavedBrief, removeSavedBrief, addSubmittedProject, removeSubmittedProject,
      updateSubmittedProject, setProjectHighlight,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
