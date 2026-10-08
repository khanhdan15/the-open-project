import { useCallback, useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import NewBrief from './pages/NewBrief'
import Brief from './pages/Brief'
import Signup from './pages/Signup'
import ResetPassword from './pages/ResetPassword'
import Portfolio from './pages/Portfolio'
import ProjectDetail from './pages/ProjectDetail'
import Community from './pages/Community'
import WeeklyChallenge from './pages/WeeklyChallenge'
import Settings from './pages/Settings'
import PublicProfile from './pages/PublicProfile'
import LoadingScreen from './components/LoadingScreen'
import { useUser } from './context/UserContext'
import { supabase } from './lib/supabase'

// Design-only preview: simulates a short auth check so the full
// 0→95%-ease, then-100%-snap-and-fade sequence can be watched on demand at
// /loading-preview, without needing to actually sign in/out to trigger it.
function LoadingPreview() {
  const [authLoading, setAuthLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setAuthLoading(false), 1000)
    return () => clearTimeout(t)
  }, [])
  return <LoadingScreen fixed={false} authLoading={authLoading} />
}

export default function App() {
  const { loading } = useUser()
  const [showLoading, setShowLoading] = useState(true)
  const handleDone = useCallback(() => setShowLoading(false), [])
  const navigate = useNavigate()

  // Opening a password-reset email link signs the person in with a recovery
  // session. Wherever that link lands, send them to the form to choose a
  // new password instead of leaving them on the homepage.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') navigate('/reset-password')
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  if (showLoading) {
    return <LoadingScreen authLoading={loading} onDone={handleDone} />
  }

  return (
    <div className="page-wrap">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/new" element={<NewBrief />} />
      <Route path="/brief" element={<Brief />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/project/:id" element={<ProjectDetail />} />
      <Route path="/community" element={<Community />} />
      <Route path="/weekly-challenge" element={<WeeklyChallenge />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/u/:slug" element={<PublicProfile />} />
      <Route path="/loading-preview" element={<LoadingPreview />} />
    </Routes>
    </div>
  )
}
