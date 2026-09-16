import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import './App.scss'

const services = [
  { number: '01', title: 'Web Development', shortTitle: 'Web', tag: 'Build / Scale', problem: 'Slow, fragmented digital experiences make it difficult to earn trust and convert interest.', solution: 'We design and engineer fast, responsive websites and platforms around your customers, content, and operational needs.', benefit: 'A dependable digital foundation that performs beautifully and grows with the business.', accent: 'cyan' },
  { number: '02', title: 'AI & Automation', shortTitle: 'AI', tag: 'Connect / Automate', problem: 'Repetitive work and disconnected data keep teams busy instead of moving the business forward.', solution: 'We connect intelligent workflows, practical AI, and automation to remove friction from the work that matters most.', benefit: 'Faster decisions, less manual effort, and more capacity for high-value work.', accent: 'green' },
  { number: '03', title: 'UI/UX Design', shortTitle: 'Design', tag: 'Clarify / Delight', problem: 'When products feel confusing, valuable ideas are lost before users reach the outcome.', solution: 'We turn complex journeys into clear, accessible interfaces through research, prototyping, and purposeful visual systems.', benefit: 'Confident users, stronger adoption, and experiences people remember for the right reasons.', accent: 'blue' },
]

const brandLetters = 'Virexo'.split('')

const careerTracks = [
  'Frontend Development', 'Backend Development', 'Full-Stack Development',
  'Mobile Development', 'UI/UX Design', 'Product Management',
  'AI / Machine Learning', 'Data Analysis', 'Data Engineering',
  'Cloud / DevOps', 'Cybersecurity', 'QA / Automation', 'IT Support',
]

function ChatAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi, I am the Virexo assistant. How can we help with your project?' }])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const content = input.trim()
    if (!content || loading) return
    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: nextMessages }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to reach the assistant.')
      setMessages((currentMessages) => [...currentMessages, { role: 'assistant', content: data.message }])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return <><button className="chat-launcher" type="button" onClick={() => setOpen((isOpen) => !isOpen)} aria-label={open ? 'Close AI assistant' : 'Open AI assistant'} aria-expanded={open}>AI</button>{open && <aside className="chat-panel" aria-label="Virexo AI assistant"><div className="chat-header"><div><strong>Virexo AI</strong><span>Project assistant</span></div><button type="button" onClick={() => setOpen(false)} aria-label="Close AI assistant">×</button></div><div className="chat-messages" aria-live="polite">{messages.map((message, index) => <p className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>{message.content}</p>)}{loading && <p className="chat-message assistant">Thinking...</p>}</div>{error && <p className="chat-error" role="alert">{error}</p>}<form className="chat-form" onSubmit={handleSubmit}><label className="sr-only" htmlFor="chat-message">Ask Virexo AI</label><input id="chat-message" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about your project" maxLength="1000" disabled={loading} /><button type="submit" disabled={loading || !input.trim()} aria-label="Send message">↑</button></form></aside>}</>
}

function ServiceShowcase() {
  const [activeService, setActiveService] = useState(services[0].number)
  const selectedService = services.find((service) => service.number === activeService) || services[0]

  return <section className="services-section service-showcase reveal" id="services" aria-labelledby="services-title">
    <div className="section-heading"><p className="section-index">02 / Our services</p><h2 id="services-title">Digital work with<br /><em>a clear outcome.</em></h2><p className="section-lede">Three focused capabilities for turning ambitious ideas into useful, measurable digital experiences.</p></div>
    <div className="service-tabs-shell">
      <div className="service-tabs" role="tablist" aria-label="Virexo services">{services.map((service) => <button className={`service-tab${activeService === service.number ? ' is-active' : ''}`} key={service.number} type="button" role="tab" aria-selected={activeService === service.number} aria-controls={`service-panel-${service.number}`} id={`service-tab-${service.number}`} tabIndex={activeService === service.number ? 0 : -1} onClick={() => setActiveService(service.number)} onKeyDown={(event) => { const index = services.findIndex((item) => item.number === activeService); const nextIndex = event.key === 'ArrowRight' ? (index + 1) % services.length : event.key === 'ArrowLeft' ? (index - 1 + services.length) % services.length : index; if (nextIndex !== index) { event.preventDefault(); setActiveService(services[nextIndex].number); document.getElementById(`service-tab-${services[nextIndex].number}`)?.focus() } }}>{service.number}<span>{service.shortTitle}</span></button>)}</div>
      <article className={`service-detail service-detail-${selectedService.accent}`} role="tabpanel" id={`service-panel-${selectedService.number}`} aria-labelledby={`service-tab-${selectedService.number}`} key={selectedService.number}>
        <div className="service-detail-header"><span className="service-kicker">{selectedService.tag}</span><span className="service-detail-index">{selectedService.number} / 03</span></div>
        <h3>{selectedService.title}</h3>
        <div className="service-detail-grid"><div><span>Problem</span><p>{selectedService.problem}</p></div><div><span>Solution</span><p>{selectedService.solution}</p></div><div><span>Benefit</span><p>{selectedService.benefit}</p></div></div>
        <a className="service-detail-link" href="#contact">Discuss this service <span aria-hidden="true">&#8599;</span></a>
      </article>
    </div>
  </section>
}

function EnquiryForm() {
  const initialValues = { name: '', email: '', service: '', message: '' }
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const validateField = (name, value) => {
    if (!value.trim()) return `${name === 'service' ? 'Please choose a service.' : `${name[0].toUpperCase()}${name.slice(1)} is required.`}`
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.'
    return ''
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: validateField(name, value) }))
    setSubmitted(false)
  }

  const submit = (event) => {
    event.preventDefault()
    const nextErrors = Object.fromEntries(Object.entries(values).map(([name, value]) => [name, validateField(name, value)]))
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    setSubmitted(true)
    setValues(initialValues)
  }

  if (submitted) return <div className="contact-form form-success" role="status" aria-live="polite"><span className="success-icon" aria-hidden="true">&#10003;</span><h3>Thanks, we have your enquiry.</h3><p>We will review your project details and reply within one business day.</p><button className="text-link" type="button" onClick={() => setSubmitted(false)}>Send another enquiry <span aria-hidden="true">&#8599;</span></button></div>

  return <form className="contact-form enquiry-form" onSubmit={submit} noValidate>
    <div className="enquiry-form-grid"><div className="field-group"><label htmlFor="enquiry-name">Full name</label><input id="enquiry-name" name="name" value={values.name} onChange={updateField} autoComplete="name" placeholder="Your full name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'enquiry-name-error' : undefined} />{errors.name && <small id="enquiry-name-error" className="field-error" role="alert">{errors.name}</small>}</div><div className="field-group"><label htmlFor="enquiry-email">Email address</label><input id="enquiry-email" name="email" type="email" value={values.email} onChange={updateField} autoComplete="email" placeholder="you@company.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'enquiry-email-error' : undefined} />{errors.email && <small id="enquiry-email-error" className="field-error" role="alert">{errors.email}</small>}</div></div>
    <div className="field-group"><label htmlFor="enquiry-service">Service of interest</label><select id="enquiry-service" name="service" value={values.service} onChange={updateField} aria-invalid={Boolean(errors.service)} aria-describedby={errors.service ? 'enquiry-service-error' : undefined}><option value="">Select a service</option>{services.map((service) => <option key={service.number} value={service.title}>{service.title}</option>)}</select>{errors.service && <small id="enquiry-service-error" className="field-error" role="alert">{errors.service}</small>}</div>
    <div className="field-group"><label htmlFor="enquiry-message">Message</label><textarea id="enquiry-message" name="message" value={values.message} onChange={updateField} placeholder="Tell us what you are building..." rows="5" aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'enquiry-message-error' : undefined} />{errors.message && <small id="enquiry-message-error" className="field-error" role="alert">{errors.message}</small>}</div>
    <button className="contact-button" type="submit">Request information <span aria-hidden="true">&#8599;</span></button>
  </form>
}

function AnalyticsDashboard() {
    const [analytics, setAnalytics] = useState(null)

    useEffect(() => {
      let sessionId = window.sessionStorage.getItem('virexo-analytics-session')
      if (!sessionId) {
        sessionId = crypto.randomUUID()
        window.sessionStorage.setItem('virexo-analytics-session', sessionId)
      }
      const updateAnalytics = () => fetch('/api/analytics', { cache: 'no-store' })
        .then((response) => response.ok ? response.json() : null)
        .then((data) => data && setAnalytics(data))
        .catch(() => {})
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, page: window.location.pathname }),
      }).finally(updateAnalytics)
      const interval = window.setInterval(updateAnalytics, 10_000)
      return () => window.clearInterval(interval)
    }, [])

    const pageName = (page) => page === '/' ? 'Home' : page.replace(/^\//, '').replace(/\b\w/g, (letter) => letter.toUpperCase())

    const activity = analytics?.activity ?? Array.from({ length: 12 }, () => ({ value: 0 }))
    const maximumActivity = Math.max(...activity.map((item) => item.value), 1)
    const conversionRate = analytics?.pageViews ? Math.min(100, Math.round((analytics.totalVisits / analytics.pageViews) * 100)) : 0

    return <section className="analytics-panel" id="analytics" aria-label="Live website analytics"><div className="analytics-content"><div className="analytics-heading"><div><span>03 / VIREXO ANALYTICS</span><strong>Traffic overview</strong></div><div className="analytics-controls"><span><i /> Live</span></div></div><div className="analytics-stats"><div><span>Active visitors</span><strong>{analytics?.activeVisitors ?? '...'}</strong><small>Visitors online now</small></div><div><span>Total visits</span><strong>{analytics?.totalVisits ?? '...'}</strong><small>Anonymous sessions</small></div><div><span>Page views</span><strong>{analytics?.pageViews ?? '...'}</strong><small>All tracked views</small></div><div><span>Visit depth</span><strong>{conversionRate}%</strong><small>Views per visit signal</small></div></div><div className="analytics-grid"><section className="analytics-chart"><div className="analytics-section-title"><div><span>TRAFFIC ACTIVITY</span><strong>Last 12 minutes</strong></div><small>Live events</small></div><div className="bar-chart" aria-label="Page views in the last 12 minutes">{activity.map((item, index) => <div className="chart-column" key={`${item.label}-${index}`}><i style={{ height: `${Math.max(6, (item.value / maximumActivity) * 100)}%` }} title={`${item.value} page views`} /><small>{index % 3 === 2 ? item.label : ''}</small></div>)}</div></section><section className="analytics-pages"><div className="analytics-section-title"><div><span>TOP CONTENT</span><strong>Page performance</strong></div></div>{analytics?.pages?.length ? analytics.pages.map(([page, count]) => <p key={page}><span>{pageName(page)}</span><i><b style={{ width: `${Math.max(10, (count / Math.max(analytics.pageViews, 1)) * 100)}%` }} /></i><strong>{count}</strong></p>) : <p><span>Loading live data</span><i><b /></i><strong>...</strong></p>}</section></div><div className="analytics-footer"><span>Anonymous aggregate data only</span><span>Updated {analytics ? 'just now' : 'when connected'}</span></div></div></section>
  }
function CinematicWorld() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x101548, 0.055)
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 7.4, 12.5)
    camera.lookAt(0, 0, 0)
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const world = new THREE.Group()
    world.rotation.x = -0.12
    scene.add(world)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), new THREE.MeshStandardMaterial({ color: 0x20245d, roughness: 0.82 }))
    ground.rotation.x = -Math.PI / 2
    world.add(ground)

    const road = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 35), new THREE.MeshStandardMaterial({ color: 0x111438, roughness: 0.58, metalness: 0.18 }))
    road.rotation.x = -Math.PI / 2
    road.position.set(0, 0.018, 0)
    world.add(road)
    const roadLineMaterial = new THREE.MeshBasicMaterial({ color: 0x65edff })
    for (let position = -15; position < 16; position += 2.1) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.9), roadLineMaterial)
      line.rotation.x = -Math.PI / 2
      line.position.set(0, 0.035, position)
      world.add(line)
    }

    const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2872, roughness: 0.55, metalness: 0.28 })
    const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xffbd58 })
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
    for (let index = 0; index < 28; index += 1) {
      const side = index % 2 ? -1 : 1
      const depth = -12 + (index * 1.7) % 25
      const height = 1.1 + (index % 5) * 0.46
      const building = new THREE.Mesh(boxGeometry, buildingMaterial)
      building.scale.set(1.2 + (index % 3) * 0.38, height, 1.1)
      building.position.set(side * (3.8 + (index % 4) * 1.35), height / 2, depth)
      world.add(building)
      const window = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.12), windowMaterial)
      window.position.set(building.position.x - side * (building.scale.x / 2 + 0.012), height * 0.62, depth)
      window.rotation.y = side * Math.PI / 2
      world.add(window)
    }

    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x263c5c, roughness: 0.9 })
    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x284e60, emissive: 0x071d3a, roughness: 0.75 })
    const trunkGeometry = new THREE.CylinderGeometry(0.055, 0.09, 0.65, 6)
    const leafGeometry = new THREE.ConeGeometry(0.48, 1.45, 7)
    for (let index = 0; index < 45; index += 1) {
      const side = index % 2 ? -1 : 1
      const depth = -14 + (index * 1.13) % 28
      const tree = new THREE.Group()
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
      trunk.position.y = 0.33
      const leaves = new THREE.Mesh(leafGeometry, leafMaterial)
      leaves.position.y = 1.1
      tree.add(trunk, leaves)
      tree.position.set(side * (2.8 + (index % 3) * 0.7), 0, depth)
      tree.scale.setScalar(0.7 + (index % 4) * 0.1)
      world.add(tree)
    }

    const lampMaterial = new THREE.MeshBasicMaterial({ color: 0xffd06b })
    for (let position = -12; position < 13; position += 4) {
      for (const side of [-1, 1]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.8, 6), new THREE.MeshStandardMaterial({ color: 0x39436c }))
        pole.position.set(side * 2.35, 0.9, position)
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.25, 0.32), lampMaterial)
        lamp.position.set(side * 2.35, 1.84, position)
        world.add(pole, lamp)
      }
    }

    scene.add(new THREE.HemisphereLight(0x9cacff, 0x171339, 2.5))
    const keyLight = new THREE.PointLight(0x667cff, 90, 25, 2)
    keyLight.position.set(-3, 8, 3)
    scene.add(keyLight)
    const warmLight = new THREE.PointLight(0xff5685, 55, 18, 2)
    warmLight.position.set(4, 4, -5)
    scene.add(warmLight)

    const stars = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0x9eeeff, size: 0.045, transparent: true, opacity: 0.8 }))
    const starPositions = new Float32Array(300)
    for (let index = 0; index < starPositions.length; index += 3) {
      starPositions[index] = (Math.random() - 0.5) * 24
      starPositions[index + 1] = Math.random() * 8 + 1
      starPositions[index + 2] = (Math.random() - 0.5) * 25
    }
    stars.geometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    scene.add(stars)

    let animationFrame
    let mouseX = 0
    let mouseY = 0
    const resize = () => {
      const { width, height } = canvas.parentElement.getBoundingClientRect()
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const moveCamera = (event) => {
      const bounds = canvas.getBoundingClientRect()
      mouseX = (event.clientX - bounds.left) / bounds.width - 0.5
      mouseY = (event.clientY - bounds.top) / bounds.height - 0.5
    }
    const render = (time) => {
      world.rotation.y += (mouseX * 0.18 - world.rotation.y) * 0.025
      world.rotation.x += (-0.12 + mouseY * 0.08 - world.rotation.x) * 0.025
      stars.rotation.y = time * 0.000025
      renderer.render(scene, camera)
      animationFrame = requestAnimationFrame(render)
    }
    resize()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', moveCamera)
    animationFrame = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', moveCamera)
      renderer.dispose()
      boxGeometry.dispose()
      trunkGeometry.dispose()
      leafGeometry.dispose()
    }
  }, [])

  return <div className="cinematic-world" aria-hidden="true"><canvas ref={canvasRef} /><div className="motion-hud"><span>LIVE SYSTEMS</span><span>01:42:08</span></div><div className="signal-track signal-track-one" /><div className="signal-track signal-track-two" /><div className="motion-card"><span>VX / 01</span><strong>Ideas in motion</strong><i /></div><div className="world-title"><span>VIREXO</span><small>INNOVATIONS</small></div><p className="world-coordinate">DIGITAL TERRITORY / 2026</p></div>
}

function Careers() {
  const [resumeName, setResumeName] = useState('')
  const [submissionState, setSubmissionState] = useState('idle')
  const [submissionError, setSubmissionError] = useState('')

  const selectResume = (file) => {
    if (!file) return
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      setSubmissionError('Upload a PDF, DOC, or DOCX file up to 5 MB.')
      return
    }
    setResumeName(file.name)
    setSubmissionError('')
  }

  const submitApplication = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!resumeName) {
      setSubmissionError('Please attach your resume before submitting.')
      return
    }
    setSubmissionState('submitting')
    setSubmissionError('')
    try {
      const payload = new FormData(form)
      const response = await fetch('/api/applications', {
        method: 'POST',
        body: payload,
      })
      if (!response.ok) throw new Error('We could not submit your application. Please try again.')
      setSubmissionState('success')
      form.reset()
      setResumeName('')
    } catch (requestError) {
      setSubmissionError(requestError.message)
      setSubmissionState('idle')
    }
  }

  return <section className="careers-section reveal" id="careers">
    <div className="careers-copy">
      <p className="section-index">03 / Join Virexo</p>
      <h2>Bring your craft.<br /><em>Build what matters.</em></h2>
      <p>We are always keen to meet people who can make digital work more useful, thoughtful, and ambitious.</p>
      <div className="career-track-list" aria-label="Open technical career tracks">{careerTracks.map((track) => <span key={track}>{track}</span>)}</div>
    </div>
    {submissionState === 'success' ? <div className="application-success" role="status"><span aria-hidden="true">✓</span><h3>Application received.</h3><p>Your profile is now in our talent pool. We will contact you when there is a relevant opportunity.</p><button type="button" onClick={() => setSubmissionState('idle')}>Submit another application</button></div> : <form className="application-form" onSubmit={submitApplication}>
      <div className="application-fields"><label>Full name<input name="name" type="text" autoComplete="name" placeholder="Your full name" required /></label><label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label></div>
      <label>Specialization<select name="specialization" defaultValue="" required><option value="" disabled>Select your field</option>{careerTracks.map((track) => <option key={track}>{track}</option>)}</select></label>
      <label>Years of experience<select name="experience" defaultValue="" required><option value="" disabled>Select experience</option><option>Student / Entry level</option><option>1-3 years</option><option>4-6 years</option><option>7+ years</option></select></label>
      <label className={`resume-dropzone${resumeName ? ' has-file' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); selectResume(event.dataTransfer.files[0]) }}><input name="resume" type="file" accept=".pdf,.doc,.docx" onChange={(event) => selectResume(event.target.files[0])} required /><span className="drop-icon" aria-hidden="true">↥</span><strong>{resumeName || 'Drop your resume here'}</strong><small>{resumeName ? 'File attached. Choose another file to replace it.' : 'PDF, DOC, or DOCX - maximum file size 5 MB'}</small></label>
      {submissionError && <p className="application-error" role="alert">{submissionError}</p>}
      <button className="application-button" type="submit" disabled={submissionState === 'submitting'}>{submissionState === 'submitting' ? 'Submitting...' : 'Submit application'} <span aria-hidden="true">↗</span></button>
    </form>}
  </section>
}

const capabilityCards = [
  ['01', 'Digital Infrastructure', 'Build secure foundations for scalable web, cloud, and customer platforms.'],
  ['02', 'Intelligent Operations', 'Connect data, workflows, and automation to make daily decisions faster.'],
  ['03', 'Experience Systems', 'Design focused digital journeys that earn customer confidence.'],
  ['04', 'Data Enablement', 'Turn fragmented information into clear reporting and practical insight.'],
  ['05', 'Platform Integration', 'Bring the tools your teams use into one dependable operating system.'],
  ['06', 'Growth Advisory', 'Prioritize the digital investments that move your business forward.'],
]

function CountUp({ value, suffix = '' }) {
  const numberRef = useRef(null)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const element = numberRef.current
    if (!element) return undefined
    let animationFrame
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        cancelAnimationFrame(animationFrame)
        setDisplayValue(0)
        return
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setDisplayValue(value)
        return
      }
      const duration = 650
      const startedAt = performance.now()
      const update = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1)
        setDisplayValue(Math.round(value * (1 - (1 - progress) ** 3)))
        if (progress < 1) animationFrame = requestAnimationFrame(update)
      }
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(update)
    }, { threshold: 0.45 })
    observer.observe(element)
    return () => {
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
    }
  }, [value])

  return <strong ref={numberRef}>{displayValue}<span>{suffix}</span></strong>
}

function EnterpriseCapabilities() {
  return <section className="enterprise-section" id="capabilities"><div className="enterprise-heading"><p className="section-index">03 / Enterprise capabilities</p><h2>Systems made for<br /><em>what comes next.</em></h2><p>Virexo brings strategy, technology, and experience design together into a single operating advantage.</p></div><div className="capability-grid">{capabilityCards.map(([number, title, description]) => <article className="capability-card" key={number}><span>{number}</span><i aria-hidden="true">✦</i><h3>{title}</h3><p>{description}</p><b>Explore <small>↗</small></b></article>)}</div><div className="impact-strip" aria-label="Virexo business impact"><div><span>Enterprise clients</span><CountUp value={150} suffix="+" /></div><div><span>Markets supported</span><CountUp value={12} /></div><div><span>Client retention</span><CountUp value={98} suffix="%" /></div><div><span>Years combined craft</span><CountUp value={25} suffix="+" /></div></div></section>
}

function App() {
  const heroArtRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem('virexo-theme') === 'dark')
  const [activeSection, setActiveSection] = useState('top')

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
    window.localStorage.setItem('virexo-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.14 })

    revealItems.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const sections = ['top', 'about', 'services', 'careers', 'contact'].map((id) => document.getElementById(id)).filter(Boolean)
    const observer = new IntersectionObserver((entries) => {
      const visibleSection = entries.filter((entry) => entry.isIntersecting).sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio)[0]
      if (visibleSection) setActiveSection(visibleSection.target.id)
    }, { rootMargin: '-18% 0px -62% 0px', threshold: [0.15, 0.4, 0.7] })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const hero = document.querySelector('.hero-section')
    const heroArt = heroArtRef.current
    if (!hero || !heroArt) return undefined

    const handlePointerMove = (event) => {
      const bounds = hero.getBoundingClientRect()
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
      heroArt.style.setProperty('--tilt-x', `${x * 7}deg`)
      heroArt.style.setProperty('--tilt-y', `${y * -7}deg`)
      heroArt.style.setProperty('--shift-x', `${x * 8}px`)
      heroArt.style.setProperty('--shift-y', `${y * 8}px`)
    }
    const resetPointer = () => {
      heroArt.style.setProperty('--tilt-x', '0deg')
      heroArt.style.setProperty('--tilt-y', '0deg')
      heroArt.style.setProperty('--shift-x', '0px')
      heroArt.style.setProperty('--shift-y', '0px')
    }

    hero.addEventListener('pointermove', handlePointerMove)
    hero.addEventListener('pointerleave', resetPointer)
    return () => {
      hero.removeEventListener('pointermove', handlePointerMove)
      hero.removeEventListener('pointerleave', resetPointer)
    }
  }, [])

  return (
    <>
    <div className="site-shell">
      <header className={`nav-wrap${menuOpen ? ' menu-open' : ''}`}>
        <a className="brand" href="#top" aria-label="Virexo Innovations - Business Website"><span className="brand-mark">V</span><span className="brand-name">{brandLetters.map((letter, index) => <span key={`${letter}-${index}`}>{letter}</span>)}</span><span className="brand-label">Innovations</span></a>
        <nav className="section-nav" aria-label="Main navigation"><a className={activeSection === 'top' ? 'is-active' : ''} href="#top" aria-current={activeSection === 'top' ? 'page' : undefined} onClick={() => setMenuOpen(false)}>Home</a><a className={activeSection === 'services' ? 'is-active' : ''} href="#services" aria-current={activeSection === 'services' ? 'page' : undefined} onClick={() => setMenuOpen(false)}>Services</a><a className={activeSection === 'about' ? 'is-active' : ''} href="#about" aria-current={activeSection === 'about' ? 'page' : undefined} onClick={() => setMenuOpen(false)}>About</a><a className={activeSection === 'careers' ? 'is-active' : ''} href="#careers" aria-current={activeSection === 'careers' ? 'page' : undefined} onClick={() => setMenuOpen(false)}>Careers</a><a className={activeSection === 'contact' ? 'is-active' : ''} href="#contact" aria-current={activeSection === 'contact' ? 'page' : undefined} onClick={() => setMenuOpen(false)}>Contact</a></nav>
        <div className="nav-actions"><a className="nav-cta" href="#contact">Start a project <span aria-hidden="true">-&gt;</span></a><a className="client-login-link" href="/login.html">Client login</a><button className="theme-toggle" type="button" aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={darkMode} onClick={() => setDarkMode((mode) => !mode)}><span aria-hidden="true">{darkMode ? '☀' : '☾'}</span></button></div>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button>
      </header>
      <main id="top">
        <section className="hero-section"><CinematicWorld /><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> Digital transformation partner / 2026</p><h1>Your vision,<br /><em>Our innovation.</em><br />Exceptional results.</h1><p className="hero-intro">Virexo Innovations transforms ambitious business ideas into powerful digital solutions. We combine strategic thinking, cutting-edge technology, and creative excellence to deliver results that matter.</p><a className="primary-button" href="#services">Explore Our Services <span aria-hidden="true">&#8599;</span></a><div className="hero-metrics"><div><strong>150+</strong><span>Clients Served</span></div><div><strong>25+</strong><span>Years Combined Experience</span></div><div><strong>98%</strong><span>Client Retention</span></div></div></div><div className="scroll-note"><span /> Scroll to explore</div></section>
        <section className="trust-strip reveal" aria-label="Virexo capabilities"><span>Strategy-led</span><i /> <span>Technology-enabled</span><i /> <span>Results-focused</span><i /> <span>Built to scale</span></section>
        <section className="statement-section reveal" id="about"><p className="section-index">01 / About Virexo Innovations</p><div><h2>Digital Excellence<br /><span>Built for Growth.</span></h2><p className="statement-copy">At Virexo Innovations, we're passionate about helping businesses succeed in the digital age. Our team of experienced strategists, designers, and technologists work collaboratively to understand your unique challenges and deliver solutions that drive measurable impact. We don't just build digital products—we build lasting partnerships.</p><a className="text-link" href="#contact">Start Your Transformation <span aria-hidden="true">&#8599;</span></a></div></section>
        <ServiceShowcase />
        <EnterpriseCapabilities />
        <AnalyticsDashboard />
        <Careers />
        <section className="final-cta reveal" aria-labelledby="final-cta-title"><div><p className="section-index">05 / Make the next move</p><h2 id="final-cta-title">Ready to Transform<br /><em>Your Idea?</em></h2></div><a className="primary-button" href="#contact">Request Information <span aria-hidden="true">&#8599;</span></a></section>
        <section className="contact-section reveal" id="contact"><div className="contact-content"><p className="section-index">04 / Start a project</p><h2>Ready to transform<br />your idea into <em>impact?</em></h2><p className="contact-intro">Tell us what you are building and a member of the Virexo Innovations team will reply within one business day with a clear next step.</p><div className="contact-details"><a href="mailto:virexoinnovations@gmail.com"><span>Email</span><strong>virexoinnovations@gmail.com</strong></a><a href="https://virexo.odoo.com" target="_blank" rel="noreferrer"><span>Official website</span><strong>virexo.odoo.com</strong></a><div><span>Studio hours</span><strong>Mon-Fri, 9am-6pm</strong></div></div></div><EnquiryForm /></section>
      </main>
      <footer><a className="brand" href="#top"><span className="brand-mark">V</span><span className="brand-name">{brandLetters.map((letter, index) => <span key={`${letter}-${index}`}>{letter}</span>)}</span></a><p>Digital Innovation for Ambitious Businesses</p><p>© 2026 Virexo Innovations. All rights reserved.</p><div className="social-links" aria-label="Virexo Innovations social links"><a href="https://github.com/ahmadecom6/virexo" target="_blank" rel="noreferrer" aria-label="Virexo Innovations GitHub repository" title="GitHub"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" d="M12 2.5a9.5 9.5 0 0 0-3 18.51c.48.09.66-.21.66-.46v-1.68c-2.69.59-3.26-1.15-3.26-1.15-.44-1.12-1.07-1.42-1.07-1.42-.88-.61.07-.6.07-.6.97.07 1.48 1 1.48 1 .86 1.47 2.27 1.05 2.82.8.09-.62.34-1.05.62-1.29-2.15-.24-4.41-1.08-4.41-4.79 0-1.06.38-1.92 1-2.6-.1-.24-.43-1.23.1-2.56 0 0 .81-.26 2.63 1a9.1 9.1 0 0 1 4.8 0c1.82-1.26 2.63-1 2.63-1 .53 1.33.2 2.32.1 2.56.62.68 1 1.54 1 2.6 0 3.72-2.27 4.55-4.43 4.78.35.3.66.9.66 1.82v2.7c0 .25.18.55.67.46A9.5 9.5 0 0 0 12 2.5Z" clipRule="evenodd" /></svg></a><a href="https://www.linkedin.com/company/virexo/" target="_blank" rel="noreferrer" aria-label="Virexo LinkedIn company page" title="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5.2 7.2A1.7 1.7 0 1 1 5.2 3.8a1.7 1.7 0 0 1 0 3.4ZM3.8 20.2h2.8V9.1H3.8v11.1ZM8.5 9.1h2.7v1.5h.04c.38-.72 1.3-1.86 3.26-1.86 3.49 0 4.13 2.3 4.13 5.28v6.17h-2.8v-5.47c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.91v5.56H8.5V9.1Z" /></svg></a></div></footer>
    </div>
    <ChatAssistant />
    </>
  )
}

export default App
