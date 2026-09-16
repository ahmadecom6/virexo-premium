import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './components/AuthContext'
import { ToastProvider } from './components/ToastContext'
import Layout from './components/Layout'
import VexProvider from './components/VexAssistant'
import RequireAuth from './components/RequireAuth'
const Home = lazy(() => import('./pages/Home')); const Services = lazy(() => import('./pages/Services')); const Marketplace = lazy(() => import('./pages/Marketplace')); const Login = lazy(() => import('./pages/Login')); const Portal = lazy(() => import('./pages/Dashboard')); const Projects = lazy(() => import('./pages/Projects')); const ProjectDetails = lazy(() => import('./pages/ProjectDetails')); const About = lazy(() => import('./pages/About')); const Technologies = lazy(() => import('./pages/Technologies')); const Reviews = lazy(() => import('./pages/Reviews')); const Faq = lazy(() => import('./pages/Faq')); const Contact = lazy(() => import('./pages/Contact')); const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy')); const NotFound = lazy(() => import('./pages/NotFound'))
import './styles/site.scss'
import './styles/glow-ring.scss'
import './styles/virexo-polish.scss'
import './styles/virexo-experience.scss'
import './styles/premium-upgrades.scss'
import './styles/case-study-upgrades.scss'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <VexProvider>
          <Suspense fallback={<div className="route-loading" role="status"><span>V</span><p>Loading experience…</p></div>}><Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth />}>
              <Route path="/portal" element={<Portal />} />
              <Route path="/dashboard" element={<Navigate to="/portal" replace />} />
            </Route>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:projectId" element={<ProjectDetails />} />
                <Route path="/about" element={<About />} />
                <Route path="/technologies" element={<Technologies />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="*" element={<NotFound />} />
              </Route>
          </Routes></Suspense>
          </VexProvider>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
