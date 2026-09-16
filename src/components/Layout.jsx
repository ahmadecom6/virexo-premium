import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  FiArrowUp,
  FiAward,
  FiChevronRight,
  FiCpu,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSun,
  FiUsers,
  FiX,
  FiZap,
} from 'react-icons/fi'
import { GlowIcon } from './GlowRing'
import { FiHome, FiGrid, FiBriefcase, FiInfo, FiHelpCircle, FiArrowUpRight } from 'react-icons/fi'
import PageTransition from './PageTransition'
import { useToast } from './useToast'
import { ToastProvider } from './ToastContext'
import { useAuth } from './useAuth'
import { useTheme, COLOR_THEMES } from './useTheme'
import VanillaInteractions from './VanillaInteractions'
import ExperienceLayer from './ExperienceLayer'
import { soundEngine } from '../utils/audio'

const primaryNav = [
  { path: '/', label: 'Home', icon: FiHome },
  { path: '/services', label: 'Services', icon: FiCpu },
  { path: '/marketplace', label: 'Nexus', icon: FiGrid, badge: 'NEW' },
  { path: '/projects', label: 'Projects', icon: FiBriefcase },
  { path: '/about', label: 'About', icon: FiInfo },
  { path: '/faq', label: 'FAQ', icon: FiHelpCircle },
  { path: '/portal', label: 'Portal', icon: FiZap },
]

function AuthNav() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [, , colorTheme, setColorTheme] = useTheme()

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!event.target.closest('.nav-auth')) setOpen(false)
    }
    document.addEventListener('click', closeOnOutsideClick)
    return () => document.removeEventListener('click', closeOnOutsideClick)
  }, [])

  if (!user) {
    return (
      <Link
        className="vx-ring-button vx-nav-cta"
        to="/login"
        onClick={() => soundEngine.playClick()}
      >
        <GlowIcon icon={FiUsers} /><span className="vx-ring-label">Sign In</span>
      </Link>
    )
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'VX'

  return (
    <div className="nav-auth">
      <button
        className="nav-auth-trigger"
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => {
          soundEngine.playClick()
          setOpen(!open)
        }}
      >
        <span className="nav-auth-avatar">{initials}</span>
        <span className="nav-auth-name">{user.name.split(' ')[0]}</span>
      </button>

      {open && (
        <div className="nav-auth-menu">
          <div className="nav-auth-menu-header">
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
          <div className="portal-color-theme-row">
            <span className="portal-color-theme-label">Theme colour</span>
            <div className="portal-color-swatches">
              {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  type="button"
                  className={`portal-color-swatch ${colorTheme === key ? 'is-active' : ''}`}
                  style={{ background: theme.accentGradient }}
                  aria-label={`Set ${theme.label} theme`}
                  title={theme.label}
                  onClick={() => {
                    soundEngine.playClick()
                    setColorTheme(key)
                  }}
                />
              ))}
            </div>
          </div>
          <Link
            to="/portal"
            onClick={() => {
              soundEngine.playClick()
              setOpen(false)
            }}
          >
            <FiCpu /> Portal Dashboard
          </Link>
          <Link
            to="/portal"
            onClick={() => {
              soundEngine.playClick()
              setOpen(false)
            }}
          >
            <FiUsers /> Talent Pipeline
          </Link>
          <Link
            to="/portal"
            onClick={() => {
              soundEngine.playClick()
              setOpen(false)
            }}
          >
            <FiAward /> Best Performers
          </Link>
          <button
            type="button"
            className="nav-signout-btn"
            onClick={() => {
              soundEngine.playClick()
              logout()
              setOpen(false)
            }}
          >
            <FiLogOut /> Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useTheme()

  return (
    <>
      <div className="hud-grid-background" aria-hidden="true" />
      <header className="site-nav">
      <div className="site-nav-container">
        {/* Left: Brand Logo */}
        <Link
          className="logo"
          to="/"
          onClick={() => {
            soundEngine.playClick()
            setMenuOpen(false)
          }}
        >
          <span>V</span>
          <strong>Virexo</strong>
          <small>Innovations</small>
        </Link>
          <div className="hud-system-online"><span className="dot"></span> LET’S BUILD</div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="nav-menu-button icon-button"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => {
            soundEngine.playClick()
            setMenuOpen(!menuOpen)
          }}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Center: Navigation Links */}
        <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
          {primaryNav.map(({ path, label, badge, icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className="nav-link-item vx-ring-button vx-nav-pill"
              onClick={() => {
                soundEngine.playClick()
                setMenuOpen(false)
              }}
            >
              <GlowIcon icon={icon} /><span className="vx-ring-label">{label}</span>
              {badge && <span className="nav-item-badge">{badge}</span>}
            </NavLink>
          ))}
          <Link
            className="mobile-portal-cta"
            to="/portal"
            onClick={() => {
              soundEngine.playClick()
              setMenuOpen(false)
            }}
          >
            <FiZap /> ⚡ Portal Dashboard
          </Link>
        </nav>

        {/* Right: Actions */}
                <div className="nav-actions">
          {/* Start Project Button */}
          <Link
            to="/contact"
            className="vx-ring-button vx-nav-cta"
            onClick={() => soundEngine.playClick()}
          >
            <GlowIcon icon={FiArrowUpRight} /><span className="vx-ring-label">Start Project</span>
          </Link>

          

          {/* Theme Switcher */}
          <button
            className="theme-button icon-button"
            type="button"
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-pressed={dark}
            onClick={() => {
              soundEngine.playClick()
              setDark((value) => !value)
            }}
            title="Toggle theme"
          >
            {dark ? <FiSun /> : <FiMoon />}
          </button>

          {/* User Auth or Sign In */}
          <AuthNav />
        </div>
      </div>
    </header>
    </>
  )
}

function CookieBanner() {
  const [visible, setVisible] = useState(() => !window.localStorage.getItem('virexo-cookie-choice'))
  if (!visible) return null
  return (
    <aside className="cookie-banner" role="dialog" aria-label="Cookie preferences">
      <div>
        <strong>Privacy, by design.</strong>
        <p>We use essential local storage to remember your preferences and session. No tracking cookies.</p>
      </div>
      <div className="cookie-actions">
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem('virexo-cookie-choice', 'essential')
            setVisible(false)
          }}
        >
          Essential only
        </button>
        <button
          className="button-small"
          type="button"
          onClick={() => {
            window.localStorage.setItem('virexo-cookie-choice', 'accepted')
            setVisible(false)
          }}
        >
          Accept
        </button>
      </div>
    </aside>
  )
}

function Newsletter() {
  const [email, setEmail] = useState('')
  const notify = useToast()
  const submit = (event) => {
    event.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notify('Please enter a valid email address.')
      return
    }
    setEmail('')
    notify('You are subscribed to the Virexo technology signal.')
  }
  return (
    <form className="newsletter" onSubmit={submit}>
      <label htmlFor="newsletter-email">Curated Digital Architecture Signals</label>
      <div>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          aria-label="Email for newsletter"
        />
        <button type="submit" aria-label="Subscribe">
          <FiChevronRight />
        </button>
      </div>
    </form>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Link className="logo" to="/">
            <span>V</span>
            <strong>Virexo</strong>
            <small>Innovations</small>
          </Link>
          <div className="hud-system-online"><span className="dot"></span> LET’S BUILD</div>
          <p>Digital products, autonomous workflows, and systems for businesses ready to move with intention.</p>
        </div>
        <Newsletter />
      </div>
      <div className="footer-bottom">
        <span>© 2026 Virexo Innovations. All rights reserved.</span>
        <div>
          <Link to="/services">Services</Link>
          <Link to="/marketplace">Virexo Nexus</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/portal">Portal Dashboard</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  )
}

function Breadcrumbs() {
  const location = useLocation()
  const path = location.pathname.split('/').filter(Boolean)
  if (path.length === 0) return null

  const labels = {
    services: 'Services',
    marketplace: 'Virexo Nexus',
    projects: 'Projects',
    about: 'About',
    technologies: 'Technologies',
    reviews: 'Reviews',
    faq: 'FAQ',
    contact: 'Contact',
    'privacy-policy': 'Privacy Policy',
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <div className="breadcrumbs-container">
        <Link to="/">Home</Link>
        {path.map((segment, index) => {
          const currentPath = `/${path.slice(0, index + 1).join('/')}`
          const label = labels[segment] || segment.replace(/-/g, ' ')
          const isLast = index === path.length - 1

          return (
            <span key={currentPath}>
              <span className="crumb-separator">/</span>
              {isLast ? <span aria-current="page">{label}</span> : <Link to={currentPath}>{label}</Link>}
            </span>
          )
        })}
      </div>
    </nav>
  )
}

function GlobalTools() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    if (location.hash) {
      const timer=setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }),450)
      return () => clearTimeout(timer)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname, location.hash])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>

      {showTop && (
        <button
          className="scroll-top icon-button"
          type="button"
          onClick={() => {
            soundEngine.playClick()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          aria-label="Scroll to top"
        >
          <FiArrowUp />
        </button>
      )}
      <CookieBanner />
    </>
  )
}

function RoutedContent() {
  const location = useLocation()
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* Top Banner */}
      <div className="digital-top-banner" role="status">
        <span className="digital-top-banner__live">
          <i /> LIVE
        </span>
        <div className="digital-top-banner__track">
          <span>◈ VIREXO DIGITAL SYSTEMS</span>
          <span>BUILDING USEFUL TECHNOLOGY</span>
          <span>ENTERPRISE TALENT & PLATFORMS</span>
          <span>◈ VIREXO DIGITAL SYSTEMS</span>
          <span>BUILDING USEFUL TECHNOLOGY</span>
          <span>ENTERPRISE TALENT & PLATFORMS</span>
        </div>
      </div>

      <Navbar />
      <Breadcrumbs />      <main id="main-content" tabIndex="-1">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname + location.search}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <GlobalTools />
      <ExperienceLayer />
    </>
  )
}

export default function Layout() {
  return (
    <ToastProvider>
      <RoutedContent />
    </ToastProvider>
  )
}




