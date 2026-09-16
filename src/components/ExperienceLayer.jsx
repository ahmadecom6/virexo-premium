import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FiDownload, FiEye, FiMinus, FiPlus, FiWifiOff, FiZap } from 'react-icons/fi'
import { applyA11yPrefs, readA11yPrefs, saveA11yPrefs } from '../utils/accessibility'

const seo = {
  '/': ['Virexo Innovations — Digital Products & AI', 'Digital products, automation and talent systems built for measurable business impact.'],
  '/services': ['Services — Virexo Innovations', 'Compare Virexo development, design, automation and growth services.'],
  '/projects': ['Project Case Studies — Virexo Innovations', 'Explore interactive Virexo project demos, technologies and outcomes.'],
  '/marketplace': ['Talent Marketplace — Virexo Innovations', 'Discover and shortlist verified digital talent.'],
  '/contact': ['Start a Project — Virexo Innovations', 'Tell Virexo about your next digital product, automation or design project.'],
}

export default function ExperienceLayer() {
  const location = useLocation()
  const [offline, setOffline] = useState(!navigator.onLine)
  const [installEvent, setInstallEvent] = useState(null)
  const [a11yOpen, setA11yOpen] = useState(false)
  const [prefs, setPrefs] = useState(readA11yPrefs)

  useEffect(() => {
    const [title, description] = seo[location.pathname] || [`${location.pathname.split('/').filter(Boolean).join(' — ') || 'Virexo'} — Virexo Innovations`, 'Virexo Innovations digital experience.']
    document.title = title
    const setMeta = (selector, attr, value) => { let node = document.querySelector(selector); if (!node) { node = document.createElement('meta'); if (selector.includes('property=')) node.setAttribute('property', selector.match(/"(.+)"/)[1]); else node.name = selector.match(/"(.+)"/)[1]; document.head.appendChild(node) } node.setAttribute(attr, value) }
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[property="og:description"]', 'content', description)
    let canonical = document.querySelector('link[rel="canonical"]'); if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }; canonical.href = location.pathname === '/' ? location.origin : `${location.origin}${location.pathname}`
  }, [location])

  useEffect(() => {
    applyA11yPrefs(prefs); saveA11yPrefs(prefs)
  }, [prefs])

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine)
    const captureInstall = (event) => { event.preventDefault(); setInstallEvent(event) }
    window.addEventListener('online', update); window.addEventListener('offline', update); window.addEventListener('beforeinstallprompt', captureInstall)
    const fine = matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches
    let dot
    const move = (event) => { if (!dot) { dot = document.createElement('i'); dot.className = 'vx-cursor-glow'; document.body.appendChild(dot) }; dot.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)` }
    if (fine) window.addEventListener('pointermove', move)
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.target.classList.toggle('is-visible', entry.isIntersecting)), { threshold: .08 })
    document.querySelectorAll('main section, main article').forEach((node) => { node.classList.add('vx-reveal'); observer.observe(node) })
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); window.removeEventListener('beforeinstallprompt', captureInstall); window.removeEventListener('pointermove', move); observer.disconnect(); dot?.remove() }
  }, [location.pathname])

  const change = (key) => setPrefs((current) => key === 'textLevel' ? { ...current, textLevel: (current.textLevel + 1) % 3 } : { ...current, [key]: !current[key] })
  return <>
    {offline && <div className="vx-offline" role="status"><FiWifiOff /> Offline mode — saved pages remain available</div>}
    <div className="vx-experience-tools">
      {installEvent && <button type="button" onClick={async () => { await installEvent.prompt(); setInstallEvent(null) }}><FiDownload /><span>Install app</span></button>}
      <button type="button" aria-expanded={a11yOpen} onClick={() => setA11yOpen(!a11yOpen)}><FiEye /><span>Accessibility</span></button>
      {a11yOpen && <div className="vx-a11y-panel" role="dialog" aria-label="Accessibility settings">
        <strong>Reading controls</strong>
        <button type="button" onClick={() => change('textLevel')}>{prefs.textLevel ? <FiMinus /> : <FiPlus />} Text size</button>
        <button type="button" aria-pressed={prefs.contrast} onClick={() => change('contrast')}><FiEye /> High contrast</button>
        <button type="button" aria-pressed={prefs.motion} onClick={() => change('motion')}><FiZap /> Reduced motion</button>
      </div>}
    </div>
  </>
}
