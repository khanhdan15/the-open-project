import { Routes, Route } from 'react-router-dom'
import FolderSelect from './pages/FolderSelect'
import Brief from './pages/Brief'
import Signup from './pages/Signup'
import Portfolio from './pages/Portfolio'
import ProjectDetail from './pages/ProjectDetail'
import Community from './pages/Community'
import WeeklyChallenge from './pages/WeeklyChallenge'
import Settings from './pages/Settings'

export default function App() {
  return (
    <div className="page-wrap">
    <Routes>
      <Route path="/" element={<FolderSelect />} />
      <Route path="/brief" element={<Brief />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/project/:id" element={<ProjectDetail />} />
      <Route path="/community" element={<Community />} />
      <Route path="/weekly-challenge" element={<WeeklyChallenge />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
    </div>
  )
}
