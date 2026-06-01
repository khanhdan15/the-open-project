import { createContext, useContext, useState } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [savedBriefs, setSavedBriefs] = useState([])
  const [submittedProjects, setSubmittedProjects] = useState([])

  const saveUser = (data) => setUser(data)

  const addSavedBrief = (brief) =>
    setSavedBriefs((prev) => {
      if (prev.some((b) => b.id === brief.id)) return prev
      return [...prev, { ...brief, id: Date.now(), savedAt: new Date().toISOString() }]
    })

  const removeSavedBrief = (briefId) =>
    setSavedBriefs((prev) => prev.filter((b) => b.brief_id !== briefId))

  const addSubmittedProject = (project) =>
    setSubmittedProjects((prev) => [
      ...prev,
      { ...project, id: Date.now(), submittedAt: new Date().toISOString() },
    ])

  return (
    <UserContext.Provider value={{
      user, savedBriefs, submittedProjects,
      saveUser, addSavedBrief, removeSavedBrief, addSubmittedProject,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
