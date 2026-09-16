import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiShield, FiUser, FiZap } from 'react-icons/fi'
import AuthWaveCanvas from '../components/AuthWaveCanvas'
import WelcomeSplash from '../components/WelcomeSplash'
import { useAuth } from '../components/useAuth'
import { soundEngine } from '../utils/audio'

const initialValues = { name: '', role: 'Executive Partner', email: '', password: '', confirm: '' }

export default function Login() {
  const [mode, setMode] = useState('sign-in')
  const [values, setValues] = useState(initialValues)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [sessionUser, setSessionUser] = useState(null)
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const intendedRedirect = location.state?.from?.pathname

  const update = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const fillExecutiveDemo = () => {
    soundEngine.playClick()
    setValues((current) => ({ ...current, email: 'demo@virexo.com', password: 'virexo123' }))
    setErrors({})
  }

  const fillTalentDemo = () => {
    soundEngine.playClick()
    setValues((current) => ({ ...current, email: 'hr@virexo.com', password: 'virexo123' }))
    setErrors({})
  }

  // Password strength calculation for registration
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'Empty', color: '#64748b' }
    let score = 0
    if (pass.length >= 6) score += 1
    if (pass.length >= 10) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1

    if (score <= 1) return { score: 25, text: 'Weak', color: '#ef4444' }
    if (score === 2) return { score: 50, text: 'Fair', color: '#f59e0b' }
    if (score === 3) return { score: 75, text: 'Good', color: '#38bdf8' }
    return { score: 100, text: 'Strong', color: '#10b981' }
  }

  const passStrength = getPasswordStrength(values.password)

  const submit = (event) => {
    event.preventDefault()
    soundEngine.playClick()
    const next = {}
    if (mode === 'register' && values.name.trim().length < 2) next.name = 'Please enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Please enter a valid email address.'
    if (values.password.length < 6) next.password = 'Password must be at least 6 characters.'
    if (mode === 'register' && values.confirm !== values.password) next.confirm = 'Passwords do not match.'
    setErrors(next)
    if (Object.keys(next).length) return

    const result =
      mode === 'register'
        ? register(values.name, values.email, values.password)
        : login(values.email, values.password)

    if (!result.ok) {
      setErrors({ form: result.error })
      return
    }

    setSessionUser(result.session)
  }

  const handleEnterPortal = () => {
    navigate(intendedRedirect && intendedRedirect !== '/login' ? intendedRedirect : '/portal', { replace: true })
  }

  const handleEnterWebsite = () => {
    navigate('/', { replace: true })
  }

  return (
    <div className="auth-gate-wrapper">
      <div className="auth-gate-visual">
        <AuthWaveCanvas />
        <div className="auth-gate-visual-overlay" />

        <div className="auth-gate-brand">
          <div className="auth-brand-badge">
            <span>V</span>
            <div className="brand-dot-pulse" />
          </div>
          <h1>Virexo OS</h1>
          <p className="auth-brand-tagline">
            Enterprise Digital Systems, Talent Architecture & Project Delivery.
          </p>

          <div className="vx-login-features">
            <div className="vx-login-feature">
              <span className="vx-login-feature-icon">✦</span>
              <div>
                <strong>Curated Talent Pipeline</strong>
                <span>Shortlist & deploy vetted high-performance engineers</span>
              </div>
            </div>
            <div className="vx-login-feature">
              <span className="vx-login-feature-icon">★</span>
              <div>
                <strong>Best Performers Leaderboard</strong>
                <span>Recognizing high-impact delivery & client satisfaction</span>
              </div>
            </div>
            <div className="vx-login-feature">
              <span className="vx-login-feature-icon">⚡</span>
              <div>
                <strong>AI Screening & Matching</strong>
                <span>Automated suitability scoring & radar diagnostics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-gate-form-area">
        <motion.div
          className="auth-form-card vx-ring-surface"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="auth-card-header">
            <div className="auth-card-top-row">
              <span className="auth-env-badge">
                <i className="pulse-dot" /> LIVE SYSTEM
              </span>
              <Link to="/" className="auth-back-link">
                View Public Site ↗
              </Link>
            </div>
            <h2>{mode === 'sign-in' ? 'Sign in to workspace' : 'Create executive access'}</h2>
            <p className="auth-card-desc">
              {mode === 'sign-in'
                ? 'Enter your credentials or choose 1-click demo access below.'
                : 'Join Virexo Innovations to unlock talent pipelines and projects.'}
            </p>
          </div>

          <div className="auth-toggle-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'sign-in'}
              className={`auth-tab-btn ${mode === 'sign-in' ? 'is-active' : ''}`}
              onClick={() => {
                soundEngine.playClick()
                setMode('sign-in')
                setErrors({})
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`auth-tab-btn ${mode === 'register' ? 'is-active' : ''}`}
              onClick={() => {
                soundEngine.playClick()
                setMode('register')
                setErrors({})
              }}
            >
              Create Account
            </button>
          </div>

          {errors.form && (
            <div className="auth-error-banner" role="alert">
              <span>⚠</span> {errors.form}
            </div>
          )}

          <form onSubmit={submit} noValidate className="auth-interactive-form">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="auth-extra-fields"
                >
                  <div className="auth-input-group">
                    <label htmlFor="reg-name">Full name</label>
                    <div className="auth-input-shell">
                      <FiUser className="auth-input-icon" />
                      <input
                        id="reg-name"
                        name="name"
                        type="text"
                        value={values.name}
                        onChange={update}
                        placeholder="e.g. Sarah Jenkins"
                        autoComplete="name"
                        required
                      />
                    </div>
                    {errors.name && <small className="auth-field-error">{errors.name}</small>}
                  </div>

                  <div className="auth-input-group">
                    <label htmlFor="reg-role">Role / Designation</label>
                    <div className="auth-input-shell">
                      <FiShield className="auth-input-icon" />
                      <select id="reg-role" name="role" value={values.role} onChange={update}>
                        <option value="Executive Partner">Executive Partner</option>
                        <option value="Head of Talent">Head of Talent</option>
                        <option value="Senior Tech Lead">Senior Tech Lead</option>
                        <option value="Client Stakeholder">Client Stakeholder</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="auth-input-group">
              <label htmlFor="auth-email">Work Email address</label>
              <div className="auth-input-shell">
                <FiMail className="auth-input-icon" />
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={update}
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                />
              </div>
              {errors.email && <small className="auth-field-error">{errors.email}</small>}
            </div>

            <div className="auth-input-group">
              <div className="auth-label-row">
                <label htmlFor="auth-password">Password</label>
                {mode === 'register' && values.password && (
                  <span className="auth-strength-text" style={{ color: passStrength.color }}>
                    Strength: {passStrength.text}
                  </span>
                )}
              </div>
              <div className="auth-input-shell">
                <FiLock className="auth-input-icon" />
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={update}
                  placeholder="Enter 6+ characters"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {mode === 'register' && values.password && (
                <div className="auth-strength-meter">
                  <div
                    className="auth-strength-meter-bar"
                    style={{ width: `${passStrength.score}%`, backgroundColor: passStrength.color }}
                  />
                </div>
              )}
              {errors.password && <small className="auth-field-error">{errors.password}</small>}
            </div>

            {mode === 'register' && (
              <div className="auth-input-group">
                <label htmlFor="auth-confirm">Confirm Password</label>
                <div className="auth-input-shell">
                  <FiLock className="auth-input-icon" />
                  <input
                    id="auth-confirm"
                    name="confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={values.confirm}
                    onChange={update}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                {errors.confirm && <small className="auth-field-error">{errors.confirm}</small>}
              </div>
            )}

            <button type="submit" className="auth-submit-btn">
              <span>{mode === 'register' ? 'Create Account & Initialize' : 'Sign In to Portal'}</span>
              <FiArrowRight />
            </button>
          </form>

          {mode === 'sign-in' && (
            <div className="auth-demo-section">
              <div className="auth-demo-header">
                <span>1-Click Instant Demo Access</span>
              </div>
              <div className="auth-demo-buttons">
                <button type="button" className="auth-demo-btn" onClick={fillExecutiveDemo}>
                  <FiZap className="demo-btn-icon text-gold" />
                  <div>
                    <strong>Executive Demo</strong>
                    <small>demo@virexo.com</small>
                  </div>
                </button>
                <button type="button" className="auth-demo-btn" onClick={fillTalentDemo}>
                  <FiZap className="demo-btn-icon text-cyan" />
                  <div>
                    <strong>Talent Lead Demo</strong>
                    <small>hr@virexo.com</small>
                  </div>
                </button>
              </div>
            </div>
          )}

          <div className="auth-card-footer">
            <span>Virexo Innovations Encrypted Portal v2.4</span>
          </div>
        </motion.div>
      </div>

      {/* Futuristic Animated Welcome Celebration Splash */}
      {sessionUser && (
        <WelcomeSplash
          user={sessionUser}
          onEnterPortal={handleEnterPortal}
          onEnterWebsite={handleEnterWebsite}
        />
      )}
    </div>
  )
}
