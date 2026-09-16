import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import RobotHero from '../components/RobotHero'
import RingButton, { GlowIcon } from '../components/GlowRing'
import { FiArrowUpRight, FiCheck, FiZap } from 'react-icons/fi'
import ServiceCard from '../components/ServiceCard'
import CtaSection from '../components/CtaSection'
import EstimateTool from '../components/EstimateTool'
import FAQAccordion from '../components/FAQAccordion'
import CircularCardSlider from '../components/CircularCardSlider'
import { prefersReducedMotion } from '../utils/motion'
import { faqs, projects, reviews, services, technologyGroups } from '../data'
import { soundEngine } from '../utils/audio'
import { leadStore } from '../utils/leadStore'


const processSteps = [
  ['01', 'Understand the business problem', 'We align on context, constraints, users, and the outcome that matters.'],
  ['02', 'Plan the right digital solution', 'We map the journey and make the riskiest decisions visible early.'],
  ['03', 'Design, develop, and test', 'We build in useful increments with clear feedback and technical foundations.'],
  ['04', 'Launch and support', 'We stay close after launch so evidence can guide the next improvement.'],
]

export default function Home() {
  const heroRef = useRef(null)
  const submitCv = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const file = values.get('resume')
    const status = form.querySelector('[data-cv-status]')
    if (!file?.name) { status.textContent = 'Please choose a CV file.'; return }
    if (file.size > 5 * 1024 * 1024) { status.textContent = 'CV must be smaller than 5MB.'; return }
    leadStore.add('CV Application', { name: values.get('name'), email: values.get('email'), specialization: values.get('specialization'), experience: values.get('experience'), fileName: file.name })
    status.textContent = 'Application received and added to the Portal.'
    form.reset()
    soundEngine.playSuccess()
  }

  useEffect(() => {
    const hero = heroRef.current
    if (!hero || prefersReducedMotion()) return undefined
    const onMouseMove = (event) => {
      const bounds = hero.getBoundingClientRect()
      hero.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`)
      hero.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`)
    }
    hero.addEventListener('mousemove', onMouseMove)
    return () => hero.removeEventListener('mousemove', onMouseMove)
  }, [])

  return (
    <div className="home-page-container">
      <section className="vx-hero" ref={heroRef} aria-labelledby="vx-hero-title">
        <div className="vx-hero-copy">
          <span className="vx-kicker"><i /> DIGITAL THINKING. REAL-WORLD IMPACT.</span>
          <h1 id="vx-hero-title">We build<br />what’s <em>next.</em></h1>
          <p>Beautiful digital experiences. Intelligent automation. Technology that moves your business forward.</p>
          <div className="vx-hero-actions">
            <RingButton to="/contact" icon={FiArrowUpRight}>Start your project</RingButton>
            <Link className="vx-text-link" to="/services">Explore services <FiArrowUpRight /></Link>
          </div>
          <div className="vx-hero-disciplines"><span>01 / DEVELOPMENT</span><span>02 / DESIGN</span><span>03 / AI & AUTOMATION</span></div>
        </div>
        <RobotHero />
        <a href="#capabilities" className="vx-scroll-cue"><span>↓</span> SCROLL TO EXPLORE</a>
      </section>

      {/* 3D Circular Cylinder Carousel Slider (From circular-slider-v1.mp4) */}
      <CircularCardSlider />

      <section className="intro-strip">
        <span>Independent digital partner</span>
        <p>Virexo works where business ambition meets the messy, exciting work of making something real.</p>
        <Link to="/about" onClick={() => soundEngine.playClick()}>
          Why Virexo <FiArrowUpRight />
        </Link>
      </section>

      <section className="home-section approach-preview">
        <div className="section-heading">
          <span className="eyebrow">How we work</span>
          <h2>
            A calm path through <em>complexity.</em>
          </h2>
          <p>
            From the first conversation to post-launch support, we keep the work clear, collaborative, and connected to
            the business result.
          </p>
        </div>
        <div className="process-preview-grid">
          {processSteps.map(([number, title, text]) => (
            <article key={number} className="vx-ring-surface">
              <GlowIcon icon={FiZap} /><span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section cv-drop-section" id="careers">
        <div className="section-heading">
          <span className="eyebrow">Work with Virexo</span>
          <h2>
            Bring your perspective to the <em>next idea.</em>
          </h2>
          <p>Drop your CV and tell us where you can make useful work happen. We review every application with care.</p>
        </div>
        <form className="cv-drop-form vx-ring-surface" data-cv-form onSubmit={submitCv}>
          <div className="cv-drop-fields">
            <label>
              Full name
              <input name="name" type="text" required placeholder="Your full name" />
            </label>
            <label>
              Email
              <input name="email" type="email" required placeholder="you@company.com" />
            </label>
            <label>
              Specialization
              <input name="specialization" type="text" required placeholder="e.g. Product design, AI" />
            </label>
            <label>
              Experience
              <select name="experience" required>
                <option value="">Select experience</option>
                <option>0-2 years</option>
                <option>3-5 years</option>
                <option>6+ years</option>
              </select>
            </label>
          </div>
          <label className="cv-dropzone" data-cv-dropzone>
            <input
              name="resume"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              required
            />
            <span className="cv-drop-icon">↑</span>
            <strong>Drop your CV here or browse</strong>
            <small>PDF, DOC, or DOCX up to 5MB</small>
            <span className="cv-file-name" data-cv-file>
              Nothing selected yet
            </span>
          </label>
          <div className="cv-drop-actions">
            <button
              className="button-primary"
              type="submit"
              onClick={() => soundEngine.playClick()}
            >
              Send my CV <FiArrowUpRight />
            </button>
            <p className="cv-status" data-cv-status aria-live="polite"></p>
          </div>
        </form>
      </section>

      <section className="home-section services-preview" id="capabilities">
        <div className="section-heading">
          <span className="eyebrow">01 / Capabilities</span>
          <h2>
            Three ways to create <em>forward motion.</em>
          </h2>
          <p>Focused expertise, brought together around the outcome your business needs next.</p>
        </div>
        <div className="service-preview-grid">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
        <Link className="inline-link" to="/services" onClick={() => soundEngine.playClick()}>
          See all service detail <FiArrowUpRight />
        </Link>
        <EstimateTool />
      </section>

      <section className="stats-band">
        <div>
          <span>01</span>
          <strong data-stat-value="4">0</strong>
          <p>Product disciplines</p>
        </div>
        <div>
          <span>02</span>
          <strong data-stat-value="12">0</strong>
          <p>Technology layers</p>
        </div>
        <div>
          <span>03</span>
          <strong data-stat-value="1">0</strong>
          <p>Clear working rhythm</p>
        </div>
        <div>
          <span>04</span>
          <strong>∞</strong>
          <p>Room to evolve</p>
          
        </div>
      </section>

      <section className="home-section project-preview">
        <div className="section-heading split-heading">
          <div>
            <span className="eyebrow">02 / Selected work</span>
            <h2>
              Useful things, <em>made visible.</em>
            </h2>
          </div>
          <Link className="inline-link" to="/projects" onClick={() => soundEngine.playClick()}>
            View portfolio <FiArrowUpRight />
          </Link>
        </div>
        <div className="featured-project">
          <div className="project-visual project-visual-large">
            VX / 01 <span>Virexo / digital home</span>
          </div>
          <div>
            <span className="eyebrow-number">Web Development / Product Systems</span>
            <h3>Virexo Innovations Business Website</h3>
            <p>
              A new digital home designed to make a technology company’s thinking, capability, and next steps easier to
              understand.
            </p>
            <ul>
              {['Responsive experience', 'Live operational signals', 'Built for future pages'].map((item) => (
                <li key={item}>
                  <FiCheck />
                  {item}
                </li>
              ))}
            </ul>
            <Link className="inline-link" to="/projects" onClick={() => soundEngine.playClick()}>
              Read the case study <FiArrowUpRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section product-experience">
        <div className="section-heading">
          <span className="eyebrow">Product experience</span>
          <h2>
            Designed for the screen, the workflow, and the <em>real world.</em>
          </h2>
          <p>Explore the kinds of interfaces and systems Virexo builds across desktop, mobile, operations, and analytics.</p>
        </div>
        <div className="experience-grid">
          {projects.slice(0, 4).map((project) => (
            <Link
              className="experience-frame"
              to={`/projects/${project.id}`}
              key={project.id}
              onClick={() => soundEngine.playClick()}
            >
              <div className="experience-screen">
                <span>{project.image}</span>
                <small>{project.category}</small>
              </div>
              <strong>{project.title}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section why-preview">
        <div className="section-heading">
          <span className="eyebrow">Why Virexo</span>
          <h2>
            Technology should feel <em>useful.</em>
          </h2>
        </div>
        <div className="why-editorial">
          <p>
            We combine responsive development, reusable code, business context, clear communication, modern technology, and
            post-launch support so the work stays valuable after it ships.
          </p>
          <div className="why-points">
            <span>Responsive and accessible development</span>
            <span>Maintainable, reusable code</span>
            <span>Business-focused solutions</span>
            <span>Clear communication from start to support</span>
          </div>
        </div>
      </section>

      <section className="home-section review-preview">
        <div className="section-heading">
          <span className="eyebrow">03 / Sample voices</span>
          <h2>
            Good work should feel <em>clear.</em>
          </h2>
        </div>
        <div className="review-preview-grid">
          {reviews.slice(0, 3).map((review) => (
            <blockquote key={review.id}>
              <div className="stars">{'★'.repeat(review.rating)}</div>
              <p>“{review.text.replace('Sample review: ', '')}”</p>
              <footer>
                <strong>{review.name}</strong>
                <span>{review.role}</span>
              </footer>
            </blockquote>
          ))}
        </div>
        <p className="sample-label">Sample content for demonstration purposes.</p>
      </section>

      <section className="home-section faq-preview">
        <div className="section-heading split-heading">
          <div>
            <span className="eyebrow">04 / FAQ</span>
            <h2>
              Keep the unknowns <em>small.</em>
            </h2>
          </div>
          <Link className="inline-link" to="/faq" onClick={() => soundEngine.playClick()}>
            View all questions <FiArrowUpRight />
          </Link>
        </div>
        <FAQAccordion items={faqs.slice(0, 4)} />
      </section>

      <section className="tech-band">
        <div>
          <span className="eyebrow">04 / Technology stack</span>
          <h2>
            The right tools are the ones that make the work <em>better.</em>
          </h2>
        </div>
        <div className="tech-marquee">
          {technologyGroups
            .flatMap((group) => group.items)
            .map((technology) => (
              <span key={technology.name}>{technology.name}</span>
            ))}
        </div>
      </section>

        <CtaSection title="Have a useful problem? Let's give it shape." />
      </div>)}









