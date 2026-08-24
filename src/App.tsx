import { useEffect } from 'react'
import MainPage from './pages/mainPage.tsx'
import DownloadsPage from './pages/downloadsPage.tsx'
import CompetencesPage from './pages/competencesPage.tsx'
import CentreInteret from './pages/loisirs.tsx'
import RocketDemo from './pages/rocketDemo.tsx'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'

/* Browsers keep the scroll offset across client-side navigations, so following
   a link from halfway down one page lands you halfway down the next. Reset it,
   except where the destination scrolls itself (a #hash, an openSection target,
   or the contact anchor). */
function ScrollToTop() {
  const { pathname, hash, state } = useLocation()

  useEffect(() => {
    const handledByPage =
      hash ||
      (state as { openSection?: string; scrollToContact?: boolean } | null)?.openSection ||
      (state as { scrollToContact?: boolean } | null)?.scrollToContact
    if (handledByPage) return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash, state])

  return null
}

function App() {

  return (
    <Router basename="/ali-portfolio">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        {/* <Route path='/educationExperience' element={<EducationExperience />} /> */}
        <Route path="/home" element={<MainPage />} />
        <Route path='/downloadsPage' element={<DownloadsPage />} />
        <Route path='/competencesPage' element={<CompetencesPage />} />
        <Route path='/loisirs' element={<CentreInteret />} />
        <Route path='/rocketDemo' element={<RocketDemo />} />
      </Routes>
    </Router>
  )
}

export default App
