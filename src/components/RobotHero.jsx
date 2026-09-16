import { Component, lazy, Suspense, useEffect, useId, useRef, useState } from 'react'
import { FiPause, FiPlay, FiZap } from 'react-icons/fi'
import { useVex } from './vex-context'
import { FiMessageCircle } from 'react-icons/fi'
import RingButton from './GlowRing'

const Scene = lazy(() => import('./canvas/Scene'))
class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}
function RobotFallback() {
  const id = useId().replace(/:/g, '')
  return <svg className="vx-robot-fallback" viewBox="0 0 400 460" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-metal`} x2="1" y2="1"><stop stopColor="#e0edf3" /><stop offset=".42" stopColor="#96afc1" /><stop offset="1" stopColor="#304658" /></linearGradient>
      <linearGradient id={`${id}-visor`} x2="0" y2="1"><stop stopColor="#243e50" /><stop offset="1" stopColor="#030a12" /></linearGradient>
    </defs>
    <g className="vx-fallback-body" stroke="#324f61" strokeWidth="2">
      <path d="M200 54V34" stroke="#70e7f3" strokeWidth="5" /><circle cx="200" cy="27" r="8" fill="#75f4ff" />
      <rect x="91" y="94" width="23" height="49" rx="10" fill="#28cddd" /><rect x="286" y="94" width="23" height="49" rx="10" fill="#28cddd" />
      <rect x="109" y="55" width="182" height="134" rx="36" fill={`url(#${id}-metal)`} />
      <rect x="127" y="85" width="146" height="78" rx="25" fill={`url(#${id}-visor)`} />
      <g className="vx-fallback-eyes" fill="#67f4ff" stroke="none"><rect x="151" y="109" width="27" height="17" rx="7" /><rect x="222" y="109" width="27" height="17" rx="7" /></g>
      <path d="M184 143H216" stroke="#36c5da" strokeWidth="3" />
      <rect x="180" y="190" width="40" height="24" rx="8" fill="#1c3544" />
      <rect x="133" y="208" width="134" height="114" rx="27" fill={`url(#${id}-metal)`} />
      <rect x="153" y="228" width="94" height="75" rx="20" fill={`url(#${id}-visor)`} />
      <circle cx="200" cy="262" r="22" fill="none" stroke="#67f4ff" strokeWidth="4" strokeDasharray="108 30" />
      <path d="M200 248L213 262 200 276 187 262Z" fill="#67f4ff" />
      <g fill={`url(#${id}-metal)`}><rect x="89" y="219" width="32" height="86" rx="15" transform="rotate(12 105 219)" /><g className="vx-fallback-arm"><rect x="279" y="219" width="32" height="86" rx="15" /><circle cx="295" cy="312" r="16" fill="#234859" /></g><rect x="149" y="324" width="39" height="56" rx="15" /><rect x="213" y="324" width="39" height="56" rx="15" /></g>
      <path d="M158 387H181M221 387H244" stroke="#67f4ff" strokeWidth="6" strokeLinecap="round" />
    </g>
  </svg>
}
export default function RobotHero() {
  const vex = useVex()
  const holder = useRef(null)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [siteReduced, setSiteReduced] = useState(() => document.documentElement.dataset.motion === 'reduced')
  const [paused, setPaused] = useState(false)
  const [active, setActive] = useState(true)
  const [wave, setWave] = useState(0)
  const [supported, setSupported] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const motionQuery = matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = (event) => setReduced(event.matches)
    motionQuery.addEventListener('change', updateMotion)
    const preferences = new MutationObserver(() => setSiteReduced(document.documentElement.dataset.motion === 'reduced'))
    preferences.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] })
    const probe = document.createElement('canvas')
    try {
      const gl = probe.getContext('webgl2')
      setSupported(Boolean(gl))
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch { setSupported(false) }
    let visible = true
    const update = () => setActive(visible && !document.hidden)
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update() }, { threshold: 0.05 })
    observer.observe(holder.current)
    document.addEventListener('visibilitychange', update)
    return () => { motionQuery.removeEventListener('change', updateMotion); preferences.disconnect(); observer.disconnect(); document.removeEventListener('visibilitychange', update) }
  }, [])
  const still = Boolean(reduced || siteReduced || paused)
  return <div className={`vx-robot-stage ${still || !active ? 'is-still' : ''}`} ref={holder} data-renderer={ready && !failed ? 'webgl' : 'svg'}>
    <div className="vx-stage-top"><span><i /> MEET VEX</span><span>{vex?.loading ? "THINKING…" : vex?.speaking ? "SPEAKING…" : "YOUR DIGITAL CO-PILOT"}</span></div>
    <div className="vx-robot-scene" role="img" aria-label="Vex, Virexo's silver robot mascot with glowing cyan eyes and an animated greeting">
      <div className="vx-orbit vx-orbit-one" aria-hidden="true" /><div className="vx-orbit vx-orbit-two" aria-hidden="true" />
      <div className="vx-robot-floor" aria-hidden="true" />
      {(!ready || failed) && <RobotFallback key={wave} />}
      {supported && !failed && <SceneBoundary onFailure={() => setFailed(true)}><Suspense fallback={null}>
        <Scene reducedMotion={still} active={active} wave={wave} thinking={vex?.loading} speaking={vex?.speaking} onReady={() => setReady(true)} onFailure={() => setFailed(true)} />
      </Suspense></SceneBoundary>}
      <div className="vx-scene-label vx-scene-label-left" aria-hidden="true">DESIGNED TO<br /><strong>CONNECT.</strong></div>
      <div className="vx-scene-label vx-scene-label-right" aria-hidden="true"><span>✧</span><br />HUMAN IDEAS.<br />INTELLIGENT SYSTEMS.</div>
    </div>
    <div className="vx-stage-bottom">
      <div><strong>A little personality.<br />A world of possibilities.</strong><span>Ask about your next project.</span></div>
      <div className="vx-robot-controls">
        <RingButton icon={FiMessageCircle} onClick={() => { setWave(v => v + 1); vex?.openAssistant() }} aria-label="Talk to Vex AI">Talk to Vex</RingButton><button className="vx-motion-toggle" type="button" onClick={() => { setPaused(false); setWave(v => v + 1) }} disabled={Boolean(reduced || siteReduced)} aria-label="Make Vex wave"><FiZap /></button>
        <button className="vx-motion-toggle" type="button" onClick={() => setPaused(v => !v)} disabled={Boolean(reduced || siteReduced)} aria-label={paused ? 'Play robot animation' : 'Pause robot animation'} aria-pressed={paused}>{paused ? <FiPlay /> : <FiPause />}</button>
      </div>
    </div>
  </div>
}
