import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const UserContext = createContext(null)

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
      submitted_at: row.submitted_at,
    }
  }

  // Reads a base64 data URL (or passes through an existing URL) and uploads
  // it to the portfolio-images storage bucket under the user's own folder.
  async function uploadImage(source) {
    if (!source || !user) return null
    if (!source.startsWith('data:')) return source // already a URL

    try {
      const res = await fetch(source)
      const blob = await res.blob()
      const ext = (blob.type.split('/')[1] || 'png').split('+')[0]
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(path, blob, { contentType: blob.type })
      if (uploadError) {
        console.error('Image upload failed:', uploadError)
        return null
      }
      const { data } = supabase.storage.from('portfolio-images').getPublicUrl(path)
      return data.publicUrl
    } catch (e) {
      console.error('Image upload failed:', e)
      return null
    }
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
    if (data) setSubmittedProjects(data.map(rowToProject))
  }

  // Auth actions
  async function signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
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

  // Projects
  async function addSubmittedProject(project) {
    if (!user) return

    const [coverUrl, extraUrls] = await Promise.all([
      uploadImage(project.coverImage || project.image),
      Promise.all((project.images || []).map(uploadImage)),
    ])

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

  return (
    <UserContext.Provider value={{
      user, savedBriefs, submittedProjects, loading,
      signUp, signIn, signOut,
      addSavedBrief, removeSavedBrief, addSubmittedProject, removeSubmittedProject,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
