import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiArrowUpRight, FiCheck, FiColumns, FiX } from 'react-icons/fi'
import { services } from '../data'

const categories = ['All Services', 'Development', 'Design', 'Automation', 'Growth', 'Support']
const categoryFor = (service) => {
  if (service.id.includes('design')) return 'Design'
  if (service.id.includes('automation')) return 'Automation'
  if (service.id.includes('ecommerce')) return 'Growth'
  if (service.id.includes('maintenance')) return 'Support'
  return 'Development'
}

export default function Services() {
  const [params, setParams] = useSearchParams()
  const [category, setCategory] = useState('All Services')
  const [compare, setCompare] = useState([])
  const filtered = category === 'All Services' ? services : services.filter((service) => categoryFor(service) === category)
  const activeId = filtered.some((service) => service.id === params.get('service')) ? params.get('service') : filtered[0].id
  const active = services.find((service) => service.id === activeId)
  const select = (id) => setParams({ service: id })
  const toggleCompare = (id) => setCompare((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current)
  const compared = compare.map((id) => services.find((service) => service.id === id)).filter(Boolean)

  return (
    <div className="halcyon-page">
      {/* Aurora */}
      <div className="halcyon-aurora" aria-hidden="true">
        <div className="aurora-blob aurora-blue" />
        <div className="aurora-blob aurora-indigo" />
      </div>

      {/* Page hero */}
      <section className="halcyon-page-hero">
        <div className="halcyon-page-hero-inner">
          <span className="halcyon-eyebrow">Capabilities / 01</span>
          <h1 className="halcyon-display">
            Services for the <em>next version</em><br />of your business.
          </h1>
          <p className="halcyon-lead">
            We stay deliberately focused: fewer services, deeper thinking, and a stronger line
            from the customer problem to the business result.
          </p>
        </div>
      </section>

      {/* Services workspace */}
      <section className="halcyon-section">
        <div className="halcyon-section-inner">
          {/* Category filter */}
          <div className="halcyon-category-filter" role="tablist" aria-label="Service categories">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                className={`halcyon-filter-btn${category === item ? ' is-active' : ''}`}
                onClick={() => {
                  setCategory(item)
                  setParams({
                    service: (item === 'All Services'
                      ? services
                      : services.filter((s) => categoryFor(s) === item))[0].id,
                  })
                }}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Workspace */}
          <div className="halcyon-services-workspace">
            {/* Left — service list */}
            <div className="halcyon-service-list" role="tablist" aria-label="Service detail tabs">
              {filtered.map((service) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeId === service.id}
                  className={`halcyon-service-tab${activeId === service.id ? ' is-active' : ''}`}
                  key={service.id}
                  onClick={() => select(service.id)}
                >
                  <span className="service-tab-cat">{categoryFor(service)}</span>
                  {service.title}
                  <span className="service-compare-check" onClick={(event) => { event.stopPropagation(); toggleCompare(service.id) }} role="checkbox" aria-checked={compare.includes(service.id)}>{compare.includes(service.id) ? '✓ Comparing' : '+ Compare'}</span>
                </button>
              ))}
            </div>

            {/* Right — service detail panel */}
            <article className="halcyon-service-panel" role="tabpanel">
              <div className="service-panel-top">
                <span className="halcyon-eyebrow">{active.id.replaceAll('-', ' / ')}</span>
                <span className="service-tech-row">{active.technologies.join(' · ')}</span>
              </div>
              <h2>{active.title}</h2>
              <p className="service-lead">{active.short}</p>

              <div className="halcyon-service-breakdown">
                <div>
                  <span className="breakdown-label">Customer problem</span>
                  <p>{active.problem}</p>
                </div>
                <div>
                  <span className="breakdown-label">Virexo solution</span>
                  <p>{active.solution}</p>
                </div>
                <div>
                  <span className="breakdown-label">Business benefit</span>
                  <p>{active.benefit}</p>
                </div>
              </div>

              <div className="halcyon-workspace-cols">
                <div>
                  <span className="halcyon-eyebrow">Technologies</span>
                  <ul className="halcyon-pill-list">
                    {active.technologies.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="halcyon-eyebrow">Deliverables</span>
                  <ul className="halcyon-check-list">
                    {active.deliverables.map((item) => (
                      <li key={item}><FiCheck />{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                className="button-primary btn-glow-ring"
                to={`/contact?service=${active.id}`}
              >
                Request this service <FiArrowUpRight />
              </Link>
            </article>
          </div>
          <div className="service-compare-bar" aria-live="polite"><FiColumns /><span>{compare.length ? `${compare.length} selected (maximum 3)` : 'Select 2–3 services to compare'}</span>{compare.length > 0 && <button type="button" onClick={() => setCompare([])}><FiX /> Clear</button>}</div>
          {compared.length >= 2 && <div className="service-comparison vx-ring-surface"><div className="service-comparison-head"><div><span className="halcyon-eyebrow">Side-by-side</span><h2>Service comparison</h2></div></div><div className="service-comparison-grid">{compared.map((service) => <article key={service.id}><h3>{service.title}</h3><span>Best for</span><p>{service.bestFor}</p><span>Business result</span><p>{service.benefit}</p><span>Core stack</span><p>{service.technologies.join(' · ')}</p><span>Deliverables</span><ul>{service.deliverables.map((item) => <li key={item}><FiCheck />{item}</li>)}</ul><Link className="button-ghost" to={`/contact?service=${service.id}`}>Choose service <FiArrowUpRight /></Link></article>)}</div></div>}
        </div>
      </section>

      {/* CTA */}
      <section className="halcyon-cta">
        <div className="halcyon-cta-glow" aria-hidden="true" />
        <div className="halcyon-cta-inner">
          <span className="halcyon-eyebrow halcyon-eyebrow-amber">Get started</span>
          <h2 className="halcyon-cta-headline">
            Not sure which capability fits?<br />Start with the <em>problem.</em>
          </h2>
          <p className="halcyon-mist">
            A single conversation is usually enough to figure out where to start.
          </p>
          <div className="halcyon-cta-actions">
            <Link
              className="button-primary btn-glow-ring halcyon-amber-btn"
              to="/contact"
            >
              Talk to us <FiArrowUpRight />
            </Link>
          </div>
        </div>
        <div className="halcyon-watermark" aria-hidden="true">VIREXO</div>
      </section>
    </div>
  )
}
