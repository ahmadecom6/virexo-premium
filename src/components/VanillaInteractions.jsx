import { useEffect } from 'react'

function setupLiveClock() {
  const badges = document.querySelectorAll('[data-live-systems]')
  if (!badges.length) return () => {}
  const update = () => {
    const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date())
    badges.forEach((badge) => {
      const clock = badge.querySelector('[data-live-clock]')
      if (clock) clock.textContent = time
    })
  }
  update()
  const interval = window.setInterval(update, 1000)
  return () => window.clearInterval(interval)
}

function setupScrollProgress() {
  const bar = document.createElement('div')
  bar.className = 'scroll-progress'
  bar.setAttribute('aria-hidden', 'true')
  document.body.prepend(bar)
  let frame = 0
  const update = () => {
    frame = 0
    const scrollable = document.documentElement.scrollHeight - window.innerHeight
    bar.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`
  }
  const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update) }
  window.addEventListener('scroll', onScroll, { passive: true })
  update()
  return () => { window.removeEventListener('scroll', onScroll); if (frame) window.cancelAnimationFrame(frame); bar.remove() }
}

function setupCounters() {
  const counters = document.querySelectorAll('[data-stat-value]')
  if (!counters.length || !('IntersectionObserver' in window)) return () => {}
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.counted) return
      const element = entry.target
      element.dataset.counted = 'true'
      const target = Number(element.dataset.statValue)
      const suffix = element.dataset.statSuffix || ''
      const started = performance.now()
      const duration = 900
      if (document.documentElement.dataset.motion === 'reduced' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        element.textContent = `${target}${suffix}`
        observer.unobserve(element)
        return
      }
      const tick = (now) => {
        const progress = Math.min((now - started) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        element.textContent = `${Math.round(target * eased)}${suffix}`
        if (progress < 1) window.requestAnimationFrame(tick)
      }
      window.requestAnimationFrame(tick)
      observer.unobserve(element)
    })
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' })
  counters.forEach((counter) => observer.observe(counter))
  return () => observer.disconnect()
}

function setupMagneticButtons() {
  const buttons = document.querySelectorAll('.button-primary, .nav-consult')
  const cleanups = []
  buttons.forEach((button) => {
    button.classList.add('magnetic-cta')
    const move = (event) => {
      const bounds = button.getBoundingClientRect()
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 16
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 16
      button.style.setProperty('--magnetic-x', `${Math.max(-8, Math.min(8, x))}px`)
      button.style.setProperty('--magnetic-y', `${Math.max(-8, Math.min(8, y))}px`)
      button.style.setProperty('--glow-x', `${event.clientX - bounds.left}px`)
      button.style.setProperty('--glow-y', `${event.clientY - bounds.top}px`)
    }
    const leave = () => { button.style.setProperty('--magnetic-x', '0px'); button.style.setProperty('--magnetic-y', '0px') }
    button.addEventListener('mousemove', move)
    button.addEventListener('mouseleave', leave)
    cleanups.push(() => { button.removeEventListener('mousemove', move); button.removeEventListener('mouseleave', leave) })
  })
  return () => cleanups.forEach((cleanup) => cleanup())
}

function setupCardTilt() {
  const cards = document.querySelectorAll('.service-card')
  const cleanups = []
  cards.forEach((card) => {
    const move = (event) => {
      const bounds = card.getBoundingClientRect()
      const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10
      const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -10
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
    }
    const leave = () => { card.style.transform = '' }
    card.addEventListener('mousemove', move)
    card.addEventListener('mouseleave', leave)
    cleanups.push(() => { card.removeEventListener('mousemove', move); card.removeEventListener('mouseleave', leave) })
  })
  return () => cleanups.forEach((cleanup) => cleanup())
}

function setupHeroCanvas() {
  const hero = document.querySelector('.hero-page')
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  const canvas = document.createElement('canvas')
  canvas.className = 'hero-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  hero.prepend(canvas)
  const context = canvas.getContext('2d')
  let animationFrame = 0
  let start = performance.now()
  const resize = () => { canvas.width = hero.clientWidth * devicePixelRatio; canvas.height = hero.clientHeight * devicePixelRatio; canvas.style.width = `${hero.clientWidth}px`; canvas.style.height = `${hero.clientHeight}px`; context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0) }
  const render = (now) => {
    const elapsed = (now - start) / 1000
    const width = hero.clientWidth
    const height = hero.clientHeight
    context.clearRect(0, 0, width, height)
    const blobs = [[width * 0.78 + Math.sin(elapsed * 0.18) * 32, height * 0.34 + Math.cos(elapsed * 0.2) * 24, '#2ECC8F'], [width * 0.16 + Math.cos(elapsed * 0.14) * 34, height * 0.22 + Math.sin(elapsed * 0.16) * 28, '#3B82F6']]
    blobs.forEach(([x, y, color]) => { const gradient = context.createRadialGradient(x, y, 0, x, y, 230); gradient.addColorStop(0, `${color}22`); gradient.addColorStop(1, `${color}00`); context.fillStyle = gradient; context.fillRect(x - 230, y - 230, 460, 460) })
    animationFrame = window.requestAnimationFrame(render)
  }
  window.addEventListener('resize', resize)
  resize()
  animationFrame = window.requestAnimationFrame(render)
  return () => { window.removeEventListener('resize', resize); window.cancelAnimationFrame(animationFrame); canvas.remove() }
}

function setupScrollReveal() {
  const targets = document.querySelectorAll('main section, .service-card, .contact-form-shell')
  if (!targets.length || !('IntersectionObserver' in window)) return () => {}
  targets.forEach((target, index) => { target.classList.add('js-reveal'); if (target.classList.contains('service-card')) target.style.setProperty('--reveal-delay', `${(index % 6) * 70}ms`) })
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) } }), { threshold: 0.12 })
  targets.forEach((target) => observer.observe(target))
  return () => observer.disconnect()
}

function setupPersonalizedGreeting() {
  const heroCopy = document.querySelector('.hero-copy')
  if (!heroCopy || heroCopy.querySelector('.personalized-greeting')) return () => {}
  const hour = new Date().getHours()
  const greeting = hour >= 23 || hour < 5 ? 'Working Late?' : hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
  const line = document.createElement('p')
  line.className = 'personalized-greeting'
  line.textContent = `${greeting} — let’s build something great.`
  heroCopy.prepend(line)
  return () => line.remove()
}

function setupEstimateTool() {
  const section = document.querySelector('.services-preview')
  if (!section || section.querySelector('.estimate-tool')) return () => {}
  const widget = document.createElement('aside')
  widget.className = 'estimate-tool'
  widget.innerHTML = '<div class="estimate-tool-head"><div><span class="eyebrow">Quick estimate</span><h3>Shape the next step</h3></div><span class="estimate-progress" aria-live="polite">Step 1 of 3</span></div><div class="estimate-question" data-estimate-question></div><div class="estimate-options" data-estimate-options></div><div class="estimate-result" data-estimate-result hidden></div>'
  section.appendChild(widget)
  const questions = [
    { label: 'What do you need?', options: [['New Website', 'Scalable Digital Product Engineering'], ['App Development', 'Scalable Digital Product Engineering'], ['Digital Strategy', 'AI-Powered Workflow & Process Automation']] },
    { label: 'What is your timeline?', options: [['ASAP', ''], ['1-3 Months', ''], ['Flexible', '']] },
    { label: 'What is your budget range?', options: [['Starter', ''], ['Growth', ''], ['Enterprise', '']] }
  ]
  const answers = []
  let step = 0
  const question = widget.querySelector('[data-estimate-question]')
  const options = widget.querySelector('[data-estimate-options]')
  const progress = widget.querySelector('.estimate-progress')
  const result = widget.querySelector('[data-estimate-result]')
  const render = () => {
    const current = questions[step]
    progress.textContent = `Step ${step + 1} of ${questions.length}`
    question.textContent = current.label
    options.innerHTML = current.options.map(([label]) => `<button type="button" data-estimate-option="${label}">${label}</button>`).join('')
    options.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => { answers[step] = button.dataset.estimateOption; step += 1; if (step < questions.length) render(); else showResult() }))
  }
  const showResult = () => {
    const selected = questions[0].options.find(([label]) => label === answers[0])?.[1] || 'Scalable Digital Product Engineering'
    const timeframe = answers[1] === 'ASAP' ? 'A focused first milestone in 2-4 weeks' : answers[1] === '1-3 Months' ? 'A structured launch plan in 1-3 months' : 'A flexible roadmap shaped around your priorities'
    result.hidden = false
    question.hidden = true
    options.hidden = true
    progress.textContent = 'Your starting point'
    result.innerHTML = `<span class="eyebrow">Recommended direction</span><strong>${selected}</strong><p>${timeframe}. We can shape the scope around a ${answers[2].toLowerCase()} investment level.</p><a class="button-primary" href="/contact">Start an enquiry <span>→</span></a>`
    result.querySelector('a').addEventListener('click', () => { window.setTimeout(() => { const field = document.querySelector('select[name="service"]'); if (field) { field.value = selected; field.dispatchEvent(new Event('change', { bubbles: true })) } }, 200) })
  }
  render()
  return () => widget.remove()
}

function setupTitleVisibility() {
  const original = document.title
  const onVisibility = () => { document.title = document.hidden ? '👋 Come back! | Virexo Innovations' : original }
  document.addEventListener('visibilitychange', onVisibility)
  return () => document.removeEventListener('visibilitychange', onVisibility)
}

function setupDraftAutosave() {
  const form = document.querySelector('.contact-page form')
  if (!form) return () => {}
  const key = 'virexo-contact-draft'
  const fields = [...form.querySelectorAll('input[name], select[name], textarea[name]')]
  const saved = JSON.parse(window.localStorage.getItem(key) || 'null')
  if (saved) {
    fields.forEach((field) => { if (saved[field.name] !== undefined) { field.value = saved[field.name]; field.checked = Boolean(saved[field.name]) } })
    const note = document.createElement('small')
    note.className = 'draft-restored'
    note.textContent = 'Draft restored'
    form.prepend(note)
  }
  let timeout
  const save = () => { window.clearTimeout(timeout); timeout = window.setTimeout(() => { const draft = {}; fields.forEach((field) => { draft[field.name] = field.type === 'checkbox' ? field.checked : field.value }); window.localStorage.setItem(key, JSON.stringify(draft)) }, 500) }
  fields.forEach((field) => field.addEventListener('input', save))
  fields.forEach((field) => field.addEventListener('change', save))
  const observer = new MutationObserver(() => { if (form.closest('.contact-form-shell')?.querySelector('.form-success')) window.localStorage.removeItem(key) })
  observer.observe(form.parentElement, { childList: true, subtree: true })
  return () => { window.clearTimeout(timeout); fields.forEach((field) => { field.removeEventListener('input', save); field.removeEventListener('change', save) }); observer.disconnect() }
}

function setupConfetti() {
  const shell = document.querySelector('.contact-form-shell')
  if (!shell || shell.dataset.confettiReady) return () => {}
  shell.dataset.confettiReady = 'true'
  const observer = new MutationObserver(() => {
    if (shell.querySelector('.form-success') && !shell.dataset.confettiShown) { shell.dataset.confettiShown = 'true'; burst(shell) }
  })
  observer.observe(shell, { childList: true, subtree: true })
  return () => observer.disconnect()
}

function burst(container) {
  const canvas = document.createElement('canvas')
  canvas.className = 'confetti-canvas'
  container.appendChild(canvas)
  const bounds = container.getBoundingClientRect()
  canvas.width = bounds.width * devicePixelRatio
  canvas.height = bounds.height * devicePixelRatio
  canvas.style.width = `${bounds.width}px`
  canvas.style.height = `${bounds.height}px`
  const context = canvas.getContext('2d')
  const particles = Array.from({ length: 44 }, (_, index) => ({ x: bounds.width / 2, y: 100, vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 8 - 3, size: Math.random() * 5 + 3, life: 1, color: index % 2 ? '#2ECC8F' : '#3B82F6' }))
  let frame
  const draw = () => { context.clearRect(0, 0, bounds.width, bounds.height); particles.forEach((particle) => { particle.x += particle.vx; particle.vy += 0.22; particle.y += particle.vy; particle.life -= 0.018; context.globalAlpha = Math.max(0, particle.life); context.fillStyle = particle.color; context.fillRect(particle.x, particle.y, particle.size, particle.size); }); if (particles.some((particle) => particle.life > 0)) frame = requestAnimationFrame(draw); else canvas.remove() }
  frame = requestAnimationFrame(draw)
  window.setTimeout(() => { cancelAnimationFrame(frame); canvas.remove() }, 2200)
}

function setupCustomCursor() {
  if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  const dot = document.createElement('span')
  const ring = document.createElement('span')
  dot.className = 'custom-cursor-dot'
  ring.className = 'custom-cursor-ring'
  document.body.append(dot, ring)
  let x = -20; let y = -20; let ringX = x; let ringY = y; let frame
  const move = (event) => { x = event.clientX; y = event.clientY; dot.style.transform = `translate3d(${x}px, ${y}px, 0)` }
  const animate = () => { ringX += (x - ringX) * 0.16; ringY += (y - ringY) * 0.16; ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`; frame = requestAnimationFrame(animate) }
  const hover = (event) => { if (event.target.closest('a, button, input, textarea, select, .service-card')) ring.classList.add('is-hovering'); else ring.classList.remove('is-hovering') }
  window.addEventListener('mousemove', move, { passive: true }); window.addEventListener('mouseover', hover, { passive: true }); frame = requestAnimationFrame(animate)
  return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseover', hover); cancelAnimationFrame(frame); dot.remove(); ring.remove() }
}

function setupAccessibilityPanel() {
  const button = document.createElement('button')
  button.className = 'accessibility-trigger icon-button'
  button.type = 'button'
  button.setAttribute('aria-label', 'Open accessibility settings')
  button.textContent = '♿'
  const panel = document.createElement('aside')
  panel.className = 'accessibility-panel'
  panel.hidden = true
  panel.setAttribute('aria-label', 'Accessibility settings')
  panel.innerHTML = '<strong>Accessibility</strong><button type="button" data-a11y="text">Increase text size</button><button type="button" data-a11y="contrast">High contrast mode</button><button type="button" data-a11y="motion">Reduce motion</button>'
  document.body.append(button, panel)
  const saved = JSON.parse(window.localStorage.getItem('virexo-a11y') || '{}')
  const root = document.documentElement
  let textLevel = Number(saved.textLevel || 0)
  const apply = () => { root.dataset.textSize = textLevel ? String(textLevel) : ''; root.dataset.contrast = saved.contrast ? 'high' : ''; root.dataset.motion = saved.motion ? 'reduced' : ''; panel.querySelector('[data-a11y="text"]').textContent = `Increase text size (${textLevel === 2 ? '130%' : textLevel === 1 ? '115%' : '100%'})`; panel.querySelector('[data-a11y="contrast"]').setAttribute('aria-pressed', String(Boolean(saved.contrast))); panel.querySelector('[data-a11y="motion"]').setAttribute('aria-pressed', String(Boolean(saved.motion))) }
  const persist = () => window.localStorage.setItem('virexo-a11y', JSON.stringify({ textLevel, contrast: Boolean(saved.contrast), motion: Boolean(saved.motion) }))
  const togglePanel = () => { panel.hidden = !panel.hidden; button.setAttribute('aria-expanded', String(!panel.hidden)) }
  const onText = () => { textLevel = (textLevel + 1) % 3; apply(); persist() }
  const onContrast = () => { saved.contrast = !saved.contrast; apply(); persist() }
  const onMotion = () => { saved.motion = !saved.motion; apply(); persist() }
  button.addEventListener('click', togglePanel); panel.querySelector('[data-a11y="text"]').addEventListener('click', onText); panel.querySelector('[data-a11y="contrast"]').addEventListener('click', onContrast); panel.querySelector('[data-a11y="motion"]').addEventListener('click', onMotion); apply()
  return () => { button.remove(); panel.remove() }
}

function setupPreloader() {
  const loader = document.createElement('div')
  loader.className = 'brand-preloader'
  loader.innerHTML = '<div><span>V</span><strong>Virexo Innovations</strong><small>Building useful systems</small></div>'
  document.body.prepend(loader)
  const startedAt = performance.now()
  let fadeTimer
  let removeTimer
  const hide = () => {
    const remaining = Math.max(0, 2000 - (performance.now() - startedAt))
    fadeTimer = window.setTimeout(() => loader.classList.add('is-ready'), remaining)
    removeTimer = window.setTimeout(() => loader.remove(), remaining + 750)
  }
  hide()
  return () => { window.removeEventListener('load', hide); window.clearTimeout(fadeTimer); window.clearTimeout(removeTimer); loader.remove() }
}

function setupProofTicker() {
  const target = document.querySelector('.intro-strip')
  if (!target || target.querySelector('.proof-ticker')) return () => {}
  const ticker = document.createElement('span')
  ticker.className = 'proof-ticker'
  ticker.setAttribute('aria-live', 'polite')
  target.appendChild(ticker)
  const messages = ['🟢 12 consultations booked this month', '⭐ 98% client retention rate', '🚀 150+ projects delivered']
  let index = 0
  const update = () => { ticker.classList.remove('is-changing'); window.setTimeout(() => { ticker.textContent = messages[index]; ticker.classList.add('is-changing'); index = (index + 1) % messages.length }, 20) }
  update()
  const interval = window.setInterval(update, 4500)
  return () => { window.clearInterval(interval); ticker.remove() }
}

function setupCaseStudyModal() {
  const cards = document.querySelectorAll('.service-card')
  if (!cards.length) return () => {}
  let activeTrigger
  const modal = document.createElement('div')
  modal.className = 'case-modal'
  modal.hidden = true
  modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true')
  document.body.appendChild(modal)
  const close = () => { modal.hidden = true; document.body.classList.remove('modal-open'); activeTrigger?.focus() }
  const onKey = (event) => { if (event.key === 'Escape') close(); if (event.key === 'Tab') { const focusable = [...modal.querySelectorAll('button, a')]; if (focusable.length && (event.shiftKey && document.activeElement === focusable[0] || !event.shiftKey && document.activeElement === focusable.at(-1))) { event.preventDefault(); focusable[event.shiftKey ? focusable.length - 1 : 0].focus() } } }
  cards.forEach((card) => { const trigger = document.createElement('button'); trigger.className = 'case-study-trigger'; trigger.type = 'button'; trigger.textContent = 'See it in action'; card.appendChild(trigger); trigger.addEventListener('click', () => { activeTrigger = trigger; const title = card.querySelector('h3')?.textContent || 'Virexo service'; modal.innerHTML = `<div class="case-modal-backdrop" data-close-modal></div><div class="case-modal-dialog"><button class="case-modal-close" type="button" aria-label="Close case study">×</button><div class="case-modal-visual">VX / CASE STUDY</div><span class="eyebrow">Problem → Solution → Result</span><h2>${title}</h2><p><strong>The problem:</strong> Teams need clearer digital systems that reduce friction and support confident decisions.</p><p><strong>Our approach:</strong> Virexo combines strategy, design, engineering, and practical automation around the real workflow.</p><p><strong>The result:</strong> A more useful experience with a foundation ready for the next stage of growth.</p><a class="button-primary" href="/contact">Discuss a similar challenge</a></div>`; modal.hidden = false; document.body.classList.add('modal-open'); modal.querySelector('.case-modal-close').focus(); modal.querySelector('[data-close-modal]').addEventListener('click', close); modal.querySelector('.case-modal-close').addEventListener('click', close) }) })
  document.addEventListener('keydown', onKey)
  return () => { document.removeEventListener('keydown', onKey); modal.remove() }
}

function setupTestimonialsCarousel() {
  const group = document.querySelector('.review-preview-grid')
  if (!group) return () => {}
  const cards = [...group.querySelectorAll('blockquote')]
  if (cards.length < 2) return () => {}
  const dots = document.createElement('div'); dots.className = 'testimonial-dots'; group.after(dots)
  let index = 0; let interval; let startX = 0
  dots.innerHTML = cards.map((_card, item) => `<button type="button" aria-label="Show testimonial ${item + 1}" data-testimonial-dot="${item}"></button>`).join('')
  const render = () => { cards.forEach((card, item) => { card.hidden = item !== index }); dots.querySelectorAll('button').forEach((dot, item) => dot.classList.toggle('is-active', item === index)) }
  const advance = () => { index = (index + 1) % cards.length; render() }
  const start = () => { window.clearInterval(interval); interval = window.setInterval(advance, 5500) }
  const stop = () => window.clearInterval(interval)
  dots.addEventListener('click', (event) => { const dot = event.target.closest('[data-testimonial-dot]'); if (dot) { index = Number(dot.dataset.testimonialDot); render(); start() } })
  group.addEventListener('mouseenter', stop); group.addEventListener('mouseleave', start); group.addEventListener('focusin', stop); group.addEventListener('focusout', start)
  group.addEventListener('touchstart', (event) => { startX = event.touches[0].clientX }, { passive: true }); group.addEventListener('touchend', (event) => { const delta = event.changedTouches[0].clientX - startX; if (Math.abs(delta) > 40) { index = (index + (delta < 0 ? 1 : -1) + cards.length) % cards.length; render() }; start() }, { passive: true })
  render(); start()
  return () => { stop(); dots.remove() }
}

function setupBackToTopRing() {
  const button = document.createElement('button'); button.className = 'progress-top-button'; button.type = 'button'; button.setAttribute('aria-label', 'Back to top'); button.innerHTML = '<svg viewBox="0 0 44 44" aria-hidden="true"><circle class="progress-ring-track" cx="22" cy="22" r="19" /><circle class="progress-ring-value" cx="22" cy="22" r="19" /></svg><span>↑</span>'; document.body.appendChild(button)
  const ring = button.querySelector('.progress-ring-value'); const circumference = 2 * Math.PI * 19
  const update = () => { const max = document.documentElement.scrollHeight - window.innerHeight; ring.style.strokeDasharray = circumference; ring.style.strokeDashoffset = circumference * (1 - (max > 0 ? window.scrollY / max : 0)); button.classList.toggle('is-visible', window.scrollY > 400) }
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' })); window.addEventListener('scroll', update, { passive: true }); update()
  return () => { window.removeEventListener('scroll', update); button.remove() }
}

function setupPdfSummary() {
  const result = document.querySelector('[data-estimate-result]')
  if (!result) return () => {}
  const loadPdf = () => new Promise((resolve, reject) => { if (window.jspdf) return resolve(window.jspdf); const script = document.createElement('script'); script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; script.onload = () => resolve(window.jspdf); script.onerror = reject; document.head.appendChild(script) })
  const observer = new MutationObserver(() => { if (!result.hidden && !result.querySelector('[data-pdf-summary]')) { const button = document.createElement('button'); button.className = 'button-ghost pdf-summary-button'; button.type = 'button'; button.dataset.pdfSummary = 'true'; button.textContent = 'Download summary as PDF'; result.appendChild(button); button.addEventListener('click', async () => { try { const api = await loadPdf(); const doc = new api.jsPDF(); doc.setTextColor(13, 27, 42); doc.setFontSize(22); doc.text('Virexo Innovations', 20, 25); doc.setFontSize(12); doc.text('Project estimate summary', 20, 35); doc.text(result.innerText.replace(/\n+/g, '\n'), 20, 52, { maxWidth: 170 }); doc.save('virexo-project-summary.pdf') } catch { button.textContent = 'PDF unavailable' } }) } })
  observer.observe(result, { childList: true, subtree: true, attributes: true })
  return () => observer.disconnect()
}

function setupCvDropzone() {
  const form = document.querySelector('[data-cv-form]'); if (!form) return () => {}
  const input = form.querySelector('input[type="file"]'); const zone = form.querySelector('[data-cv-dropzone]'); const fileName = form.querySelector('[data-cv-file]'); const status = form.querySelector('[data-cv-status]')
  const showFile = () => { fileName.textContent = input.files[0]?.name || 'Nothing selected yet' }
  const prevent = (event) => { event.preventDefault(); zone.classList.add('is-dragging') }
  const leave = (event) => { event.preventDefault(); zone.classList.remove('is-dragging') }
  const drop = (event) => { leave(event); if (event.dataTransfer.files.length) { input.files = event.dataTransfer.files; showFile() } }
  input.addEventListener('change', showFile); zone.addEventListener('dragover', prevent); zone.addEventListener('dragleave', leave); zone.addEventListener('drop', drop)
  const submit = async (event) => { event.preventDefault(); if (!input.files[0]) return; const data = new FormData(form); status.textContent = 'Sending your CV…'; try { const response = await fetch('/api/applications', { method: 'POST', body: data }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error); status.textContent = payload.message || 'CV received. Thank you.'; form.reset(); fileName.textContent = 'Nothing selected yet' } catch (error) { status.textContent = error.message || 'Upload failed. Please try again.' } }
  form.addEventListener('submit', submit)
  return () => { input.removeEventListener('change', showFile); zone.removeEventListener('dragover', prevent); zone.removeEventListener('dragleave', leave); zone.removeEventListener('drop', drop); form.removeEventListener('submit', submit) }
}

function setupSeoMetadata() {
  document.title = 'Virexo Innovations | Digital Transformation & Technology'
  const tags = { description: 'Virexo Innovations builds useful digital products, intelligent workflows, and scalable technology systems for ambitious businesses.', 'og:title': 'Virexo Innovations | Digital Transformation & Technology', 'og:description': 'Digital products, automation, and technology systems built for useful momentum.', 'og:type': 'website' }
  Object.entries(tags).forEach(([name, content]) => { let tag = document.head.querySelector(`meta[name="${name}"], meta[property="${name}"]`); if (!tag) { tag = document.createElement('meta'); tag.setAttribute(name.startsWith('og:') ? 'property' : 'name', name); document.head.appendChild(tag) }; tag.content = content })
  if (!document.head.querySelector('script[data-virexo-schema]')) { const schema = document.createElement('script'); schema.type = 'application/ld+json'; schema.dataset.virexoSchema = 'true'; schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'Virexo Innovations', description: tags.description, url: window.location.origin }); document.head.appendChild(schema) }
  return () => {}
}

function setupAiAssistant() {
  if (document.querySelector('.ai-assistant')) return () => {}
  const trigger = document.createElement('button')
  trigger.className = 'ai-assistant__trigger'
  trigger.type = 'button'
  trigger.setAttribute('aria-label', 'Open Virexo AI Assistant')
  trigger.setAttribute('aria-expanded', 'false')
  trigger.innerHTML = '<span class="ai-assistant__pulse"></span><strong>VEX</strong>'
  trigger.classList.add('aether-ai-trigger')
  const panel = document.createElement('section')
  panel.className = 'ai-assistant__panel'
  panel.hidden = true
  panel.setAttribute('role', 'dialog')
  panel.setAttribute('aria-modal', 'false')
  panel.setAttribute('aria-label', 'Virexo Assistant')
    panel.innerHTML = `
      <header class="aether-ai-header">
        <div>
          <h3>VEX v1.0 — VIREXO COPILOT // ONLINE</h3>
          <p>Indexed: services, projects, tech stack. How can I help?</p>
        </div>
        <button type="button" class="ai-assistant__close" aria-label="Close VEX" style="color:#00E5FF; background:transparent; border:none; font-size:1.5rem; cursor:pointer">×</button>
      </header>
      <div class="ai-assistant__messages" aria-live="polite" style="padding:16px; overflow-y:auto; flex:1"></div>
      <div class="aether-ai-suggestions ai-assistant__replies" style="padding:0 16px 16px 16px"></div>
      <div class="aether-ai-input" style="display:flex; padding: 12px; gap: 8px; border-top: 1px solid rgba(255,255,255,0.08);">
        <input type="text" placeholder="Ask VEX anything about Virexo..." style="flex: 1; padding: 8px 12px; border: none; outline: none; width: 100%;" />
        <button type="button" style="padding: 8px 12px; border: none; font-weight: bold; cursor: pointer;">SEND</button>
      </div>
    `
  document.body.append(trigger, panel)
  const messages = panel.querySelector('.ai-assistant__messages')
  const replies = panel.querySelector('.ai-assistant__replies')
  const closeButton = panel.querySelector('.ai-assistant__close')
  let lastFocus = trigger
  let typingTimer
  const menu = [
    ['SERVICES', 'services'],
    ['TECH STACK', 'automation'],
    ['PROJECTS', 'engineering'],
    ['CONTACT', 'quote']
  ]
  const answers = {
    services: { text: 'We build full-stack web products, automate useful business workflows, and design clear product experiences. We also help with e-commerce, APIs, and ongoing website care.', followUps: [['Full-Stack Web Development', 'engineering'], ['AI and Business Automation', 'automation'], ['UI/UX and Product Design', 'design'], ['Main menu', 'menu']] },
    timeline: { text: 'A focused prototype can take 2-4 weeks. Larger product builds are planned in milestones, with the first useful release shaped around your scope and priorities.', followUps: [['I want to get a quote', 'quote'], ['What services do you offer?', 'services'], ['Main menu', 'menu']] },
    pricing: { text: 'Pricing depends on scope, complexity, and the level of support needed. We review the brief first, then provide a realistic proposal before work begins.', followUps: [['I want to get a quote', 'quote'], ['How long does a typical project take?', 'timeline'], ['Main menu', 'menu']] },
    engineering: { text: 'Our engineering work connects UX, frontend, backend, and data into a product foundation that is easier to grow.', followUps: [['I want to get a quote', 'quote'], ['Main menu', 'menu']] },
    automation: { text: 'We map repetitive work, connect the right tools, and apply practical AI where it creates measurable leverage.', followUps: [['I want to get a quote', 'quote'], ['Main menu', 'menu']] },
    design: { text: 'We turn complex workflows into calm, clear interfaces that customers and teams can understand quickly.', followUps: [['I want to get a quote', 'quote'], ['Main menu', 'menu']] }
  }
  const addMessage = (text, type = 'bot') => { const message = document.createElement('p'); message.className = `ai-assistant__message aether-ai-bubble ${type}`; message.style.padding = '8px 12px'; message.style.marginBottom = '8px'; message.style.fontSize = '0.8rem'; message.textContent = text; messages.appendChild(message); messages.scrollTop = messages.scrollHeight }
  const showTyping = (callback) => { const typing = document.createElement('div'); typing.className = 'ai-assistant__typing'; typing.innerHTML = '<i></i><i></i><i></i>'; messages.appendChild(typing); messages.scrollTop = messages.scrollHeight; window.clearTimeout(typingTimer); typingTimer = window.setTimeout(() => { typing.remove(); callback() }, 800) }
  const renderReplies = (items) => { replies.innerHTML = items.map(([label, action]) => `<button type="button" data-ai-action="${action}">${label}</button>`).join(''); replies.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => handle(button.textContent, button.dataset.aiAction))) }
  const handle = (label, action) => {
    addMessage(label, 'user')
    if (action === 'menu') { showTyping(() => { addMessage("What would you like to know?", 'bot'); renderReplies(menu) }); return }
    if (action === 'quote') { showTyping(() => { addMessage('Absolutely. Tell us what you are building and we will help shape the most useful next step.'); renderReplies([['Open enquiry form', 'open-quote'], ['Main menu', 'menu']]) }); return }
    const response = answers[action] || answers.services
    showTyping(() => { addMessage(response.text); renderReplies(response.followUps) })
  }
  const open = () => { lastFocus = document.activeElement; panel.hidden = false; trigger.setAttribute('aria-expanded', 'true'); panel.classList.add('is-open'); messages.innerHTML = ''; replies.innerHTML = ''; showTyping(() => { addMessage("Greetings, human. I am VEX, Virexo's autonomous AI copilot. I've indexed the entire portfolio, tech stack, and services into my knowledge base. How can I assist you?", 'bot'); renderReplies(menu) }); closeButton.focus() }
  const close = () => { panel.classList.remove('is-open'); window.setTimeout(() => { panel.hidden = true }, 240); trigger.setAttribute('aria-expanded', 'false'); lastFocus?.focus() }
  const keydown = (event) => { if (!panel.hidden && event.key === 'Escape') close() }
  trigger.addEventListener('click', open); closeButton.addEventListener('click', close); document.addEventListener('keydown', keydown)
  panel.addEventListener('click', (event) => { if (event.target.dataset.aiAction === 'open-quote') { close(); document.querySelector('.contact-page')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); window.setTimeout(() => document.querySelector('.contact-page')?.classList.add('ai-highlight'), 500); window.setTimeout(() => document.querySelector('.contact-page')?.classList.remove('ai-highlight'), 2200) } })
  return () => { window.clearTimeout(typingTimer); trigger.remove(); panel.remove(); document.removeEventListener('keydown', keydown) }
}

function setupVexAssistant() {
  if (document.querySelector('.vex-assistant')) return () => {}
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const root = document.createElement('div')
  root.className = 'vex-assistant'
  root.innerHTML = '<button class="vex-assistant__trigger" type="button" aria-label="Open Vex, your virtual guide" aria-expanded="false"><svg viewBox="0 0 80 80" role="img" aria-label="Vex virtual guide"><defs><linearGradient id="vex-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2ECC8F"/><stop offset="1" stop-color="#3B82F6"/></linearGradient></defs><rect class="vex-assistant__body" x="8" y="8" width="64" height="64" rx="25" fill="url(#vex-gradient)"/><ellipse class="vex-assistant__eye vex-assistant__eye--left" cx="31" cy="35" rx="4" ry="5" fill="#071b18"/><ellipse class="vex-assistant__eye vex-assistant__eye--right" cx="49" cy="35" rx="4" ry="5" fill="#071b18"/><path class="vex-assistant__mouth" d="M31 48 Q40 55 49 48" fill="none" stroke="#071b18" stroke-width="3" stroke-linecap="round"/></svg><span class="vex-assistant__status" aria-hidden="true"></span></button><div class="vex-assistant__bubble" hidden><button class="vex-assistant__close" type="button" aria-label="Dismiss Vex message">×</button><div class="vex-assistant__speech" aria-live="polite"></div><div class="vex-assistant__actions"></div><button class="vex-assistant__mute" type="button" aria-pressed="false">🔊 Voice on</button></div>'
  document.body.appendChild(root)
  const trigger = root.querySelector('.vex-assistant__trigger')
  const bubble = root.querySelector('.vex-assistant__bubble')
  const speech = root.querySelector('.vex-assistant__speech')
  const actions = root.querySelector('.vex-assistant__actions')
  const mute = root.querySelector('.vex-assistant__mute')
  const close = root.querySelector('.vex-assistant__close')
  let muted = window.localStorage.getItem('virexo-vex-muted') === 'true'
  let speaking = false
  const message = "Hi! I'm Vex, your virtual guide. Need help exploring our services?"
  const updateMute = () => { mute.setAttribute('aria-pressed', String(muted)); mute.textContent = muted ? '🔇 Voice off' : '🔊 Voice on' }
  const stopSpeech = () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); speaking = false; root.classList.remove('is-speaking') }
  const speak = (text) => { if (muted || !('speechSynthesis' in window)) return; stopSpeech(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'en-US'; utterance.rate = 1; speaking = true; root.classList.add('is-speaking'); utterance.onend = () => { speaking = false; root.classList.remove('is-speaking') }; window.speechSynthesis.speak(utterance) }
  const showActions = () => { actions.innerHTML = '<button type="button" data-vex-action="services">Show me services</button><button type="button" data-vex-action="quote">How do I get a quote?</button><button type="button" data-vex-action="looking">Just looking, thanks!</button>'; actions.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => { const action = button.dataset.vexAction; const text = action === 'services' ? 'You can explore development, design, automation, e-commerce, API, and maintenance services.' : action === 'quote' ? 'You can request a consultation through the enquiry form. I will take you there now.' : 'No problem. I will be here whenever you need a useful next step.'; speech.textContent = text; speak(text); if (action === 'services') window.setTimeout(() => document.querySelector('.services-preview')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }), 250); if (action === 'quote') window.setTimeout(() => document.querySelector('.contact-page')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }), 250) })) }
  const open = () => { if (speaking) { stopSpeech(); return } bubble.hidden = false; trigger.setAttribute('aria-expanded', 'true'); root.classList.add('is-open'); speech.textContent = message; showActions(); speak(message); close.focus() }
  const dismiss = () => { stopSpeech(); root.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false'); window.setTimeout(() => { bubble.hidden = true }, reducedMotion ? 0 : 220); trigger.focus() }
  const keydown = (event) => { if (!bubble.hidden && event.key === 'Escape') dismiss() }
  trigger.addEventListener('click', open); close.addEventListener('click', dismiss); document.addEventListener('keydown', keydown); mute.addEventListener('click', () => { muted = !muted; window.localStorage.setItem('virexo-vex-muted', String(muted)); updateMute(); if (muted) stopSpeech() })
  updateMute()
  return () => { stopSpeech(); trigger.removeEventListener('click', open); close.removeEventListener('click', dismiss); document.removeEventListener('keydown', keydown); root.remove() }
}

export default function VanillaInteractions() {
  useEffect(() => {
    const cleanups = [setupLiveClock(), setupScrollProgress(), setupCounters(), setupMagneticButtons(), setupCardTilt(), setupHeroCanvas(), setupScrollReveal(), setupPersonalizedGreeting(), setupEstimateTool(), setupTitleVisibility(), setupDraftAutosave(), setupConfetti(), setupCustomCursor(), setupAccessibilityPanel(), setupProofTicker(), setupCaseStudyModal(), setupTestimonialsCarousel(), setupBackToTopRing(), setupPdfSummary(), setupCvDropzone(), setupSeoMetadata()]
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [])
  return null
}

