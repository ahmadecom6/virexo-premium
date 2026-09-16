import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight, FiCheckCircle, FiCompass, FiCpu, FiShield } from 'react-icons/fi'
import { soundEngine } from '../utils/audio'

export default function WelcomeSplash({ user, onEnterPortal, onEnterWebsite }) {
  const [progress, setProgress] = useState(15)
  const [step, setStep] = useState('Verifying digital signature...')
  const [ready, setReady] = useState(false)
  const [countdown, setCountdown] = useState(4)

  const firstName = user?.name ? user.name.split(' ')[0] : 'Innovator'
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'VX'

  useEffect(() => {
    soundEngine.playSuccess()

    const t1 = setTimeout(() => {
      setProgress(45)
      setStep('Synchronizing Talent Pipeline & Best Performers...')
    }, 600)

    const t2 = setTimeout(() => {
      setProgress(85)
      setStep('Connecting Live Telemetry & AI Screener...')
    }, 1200)

    const t3 = setTimeout(() => {
      setProgress(100)
      setStep('Workspace Initialized. Welcome aboard!')
      setReady(true)
    }, 1800)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  useEffect(() => {
    if (!ready) return undefined
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onEnterPortal()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [ready, onEnterPortal])

  return (
    <div className="welcome-splash-gate" role="status" aria-live="polite">
      <div className="welcome-splash-backdrop" />
      <motion.div
        className="welcome-splash-card"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="welcome-splash-glow" />

        <div className="welcome-avatar-wrapper">
          <div className="welcome-avatar-ring" />
          <div className="welcome-avatar-core">{initials}</div>
          <span className="welcome-avatar-badge">
            <FiShield />
          </span>
        </div>

        <div className="welcome-splash-head">
          <span className="welcome-kicker">
            <FiCpu className="spin-slow" /> VIREXO OS / SECURE CLEARANCE
          </span>
          <h2>
            Welcome back, <em>{firstName}</em>.
          </h2>
          <p className="welcome-sub">
            Your high-performance workspace is synchronized. Signed in as <strong>{user?.email}</strong>
          </p>
        </div>

        <div className="welcome-init-box">
          <div className="welcome-init-meta">
            <span className="welcome-init-label">
              {ready ? <FiCheckCircle className="text-emerald" /> : <span className="init-dot" />}
              {step}
            </span>
            <span className="welcome-init-pct">{progress}%</span>
          </div>
          <div className="welcome-progress-bar">
            <motion.div
              className="welcome-progress-fill"
              initial={{ width: '15%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <div className="welcome-actions">
          <button
            type="button"
            className="welcome-btn-primary"
            onClick={() => {
              soundEngine.playClick()
              onEnterPortal()
            }}
          >
            <span>Launch Portal Dashboard</span>
            <FiArrowRight />
          </button>
          <button
            type="button"
            className="welcome-btn-ghost"
            onClick={() => {
              soundEngine.playClick()
              onEnterWebsite()
            }}
          >
            <FiCompass />
            <span>Explore Public Website</span>
          </button>
        </div>

        <div className="welcome-footer-note">
          Auto-launching in <strong className="text-cyan">{countdown}s</strong> or select your destination
        </div>
      </motion.div>
    </div>
  )
}
