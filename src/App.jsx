import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import FolderSelect from './pages/FolderSelect'
import IndustrySelect from './pages/IndustrySelect'
import TimelineSelect from './pages/TimelineSelect'
import Brief from './pages/Brief'
import Signup from './pages/Signup'
import Portfolio from './pages/Portfolio'
import ProjectDetail from './pages/ProjectDetail'
import Community from './pages/Community'
import WeeklyChallenge from './pages/WeeklyChallenge'
import Settings from './pages/Settings'
import PublicProfile from './pages/PublicProfile'
import LoadingScreen from './components/LoadingScreen'
import { useUser } from './context/UserContext'

export default function App() {
  const { loading } = useUser()

  if (loading) return <LoadingScreen />

  return (
    <div className="page-wrap">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/new" element={<FolderSelect />} />
      <Route path="/new/industry" element={<IndustrySelect />} />
      <Route path="/new/timeline" element={<TimelineSelect />} />
      <Route path="/brief" element={<Brief />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/project/:id" element={<ProjectDetail />} />
      <Route path="/community" element={<Community />} />
      <Route path="/weekly-challenge" element={<WeeklyChallenge />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/u/:slug" element={<PublicProfile />} />
    </Routes>
    </div>
  )
}
