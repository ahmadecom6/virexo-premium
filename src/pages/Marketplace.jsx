import { useMemo, useState } from 'react'
import { FiArrowUpRight, FiCheckCircle, FiDownload, FiSearch, FiShield, FiStar, FiZap } from 'react-icons/fi'
import PageHeader from '../components/PageHeader'
import FormField from '../components/FormField'
import Button from '../components/Button'
import ProviderCard from '../components/ProviderCard'
import ProviderModal from '../components/ProviderModal'
import CtaSection from '../components/CtaSection'
import { useToast } from '../components/useToast'
import { marketplaceCategories, providers } from '../data'
import { dataStore } from '../utils/marketplaceStore'
import { downloadPdf } from '../utils/documents'
import { soundEngine } from '../utils/audio'

const tabs = ['All Providers', 'Top Rated', 'New Providers']
const requestCategories = marketplaceCategories.filter((item) => item !== 'All Categories')
const initialRequest = {
  name: '',
  email: '',
  phone: '',
  provider: '',
  category: '',
  budget: '',
  timeline: '',
  complexity: 'Basic',
  description: '',
  consent: false,
}
const complexityMultipliers = { Basic: 1, Standard: 1.8, Advanced: 2.6 }
const categoryBasePrices = {
  'Web Development': 2800,
  'Mobile Apps': 3200,
  'UI/UX Design': 1900,
  Marketing: 1400,
  'Data & AI': 3600,
  Writing: 900,
}
const formatCurrency = (amount) => `$${Math.round(amount).toLocaleString('en-US')}`

export default function Marketplace() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Categories')
  const [tab, setTab] = useState(tabs[0])
  const [activeProvider, setActiveProvider] = useState(null)
  const [values, setValues] = useState(initialRequest)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const notify = useToast()

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    return providers.filter((provider) => {
      const matchesCategory = category === 'All Categories' || provider.category === category
      const matchesSearch =
        !query || [provider.name, provider.title, ...provider.skills].join(' ').toLowerCase().includes(query)
      const matchesTab =
        tab === 'All Providers' ||
        (tab === 'Top Rated' && provider.rating >= 4.8) ||
        (tab === 'New Providers' && provider.completed <= 12)
      return matchesCategory && matchesSearch && matchesTab
    })
  }, [search, category, tab])

  const update = (event) => {
    const { name, value, type, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const requestProvider = (provider) => {
    soundEngine.playClick()
    setValues((current) => ({ ...current, provider: provider.name, category: provider.category }))
    setActiveProvider(null)
    document.getElementById('marketplace-request')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const validate = () => {
    const next = {}
    if (!values.name.trim()) next.name = 'Full name is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Enter a valid email address.'
    if (!/^[+\d][\d\s().-]{7,}$/.test(values.phone)) next.phone = 'Enter a valid phone number.'
    if (!values.category) next.category = 'Choose a category.'
    if (!values.budget) next.budget = 'Choose a budget range.'
    if (!values.timeline) next.timeline = 'Choose a timeline.'
    if (!values.description.trim()) next.description = 'Project description is required.'
    if (!values.consent) next.consent = 'Please confirm consent.'
    return next
  }

  const estimate = useMemo(() => {
    const base = categoryBasePrices[values.category] || 2000
    const multiplier = complexityMultipliers[values.complexity] || 1
    const matchedProvider = providers.find(
      (provider) => provider.name.toLowerCase() === values.provider.trim().toLowerCase()
    )
    const hasPremium = Boolean(matchedProvider && matchedProvider.rating >= 4.8)
    const total = base * multiplier * (hasPremium ? 1.15 : 1)
    return { base, multiplier, total, premiumLabel: hasPremium ? `+15% (${matchedProvider.name})` : '—' }
  }, [values.category, values.complexity, values.provider])

  const downloadEstimate = () => {
    soundEngine.playClick()
    downloadPdf('virexo-nexus-estimate.pdf', 'Virexo Nexus - Solution Estimate', [
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Client: ${values.name || '(add your name)'}`,
      `Email: ${values.email || '-'}`,
      `Service Category: ${values.category || '-'}`,
      `Provider: ${values.provider || 'Open Match'}`,
      `Complexity: ${values.complexity}${estimate.premiumLabel !== '—' ? ' + top-rated premium' : ''}`,
      '',
      `Estimated total: ${formatCurrency(estimate.total)}`,
      `Likely range: ${formatCurrency(estimate.total * 0.85)} - ${formatCurrency(estimate.total * 1.2)}`,
      '',
      'This estimate is indicative. A final proposal follows a short discovery call.',
      'nexus@virexoinnovations.com',
    ])
    notify('Virexo Nexus estimate PDF downloaded.')
  }

  const submit = (event) => {
    event.preventDefault()
    soundEngine.playClick()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length) return

    dataStore.addRequest({
      id: `VX-${1041 + dataStore.getRequests().length}`,
      name: values.name.trim(),
      email: values.email.trim(),
      category: values.category,
      provider: values.provider || 'Open match',
      complexity: values.complexity,
      total: Math.round(estimate.total),
      createdAt: Date.now(),
    })
    setSent(true)
    soundEngine.playSuccess()
    notify('Nexus request sent. A matching lead partner will reach out within 24 hours.')
  }

  return (
    <>
      <PageHeader
        eyebrow="Virexo Nexus / Talent & Solutions Exchange"
        title="Virexo Nexus: The Elite <em>Talent & Solutions</em> Network."
        description="Deploy verified top-tier engineers, UI/UX virtuosos, and AI practitioners. Compare algorithmic ratings, get instant project estimates, and scale momentum."
      />

      {/* Nexus Highlights Strip */}
      <section className="nexus-highlights-strip">
        <div className="nexus-highlight-chip chip-cyan">
          <FiZap />
          <span>99.4% Verified SLA</span>
        </div>
        <div className="nexus-highlight-chip chip-purple">
          <FiStar />
          <span>4.96★ Average Rating</span>
        </div>
        <div className="nexus-highlight-chip chip-emerald">
          <FiShield />
          <span>Zero-Risk Escrow Guarantee</span>
        </div>
        <div className="nexus-highlight-chip chip-gold">
          <FiCheckCircle />
          <span>SOC 2 Type II Compliant</span>
        </div>
      </section>

      <section className="page-section marketplace-browse">
        <div className="marketplace-toolbar">
          <div className="marketplace-search">
            <FiSearch aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by provider name, role, or stack (e.g. React, Figma, AI)..."
              aria-label="Search providers"
            />
          </div>

          <div className="filter-row" role="tablist" aria-label="Provider categories">
            {marketplaceCategories.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                className={`nexus-cat-btn ${category === item ? 'is-active' : ''}`}
                onClick={() => {
                  soundEngine.playClick()
                  setCategory(item)
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="marketplace-tabs" role="tablist" aria-label="Provider lists">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              className={tab === item ? 'is-active' : ''}
              onClick={() => {
                soundEngine.playClick()
                setTab(item)
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {visible.length ? (
          <div className="provider-grid">
            {visible.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onView={(p) => {
                  soundEngine.playClick()
                  setActiveProvider(p)
                }}
                onRequest={requestProvider}
              />
            ))}
          </div>
        ) : (
          <div className="marketplace-empty">
            <p>No Nexus providers match this search yet. Try a different category or keyword.</p>
            <Button
              variant="ghost"
              onClick={() => {
                setCategory('All Categories')
                setSearch('')
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </section>

      <section id="marketplace-request" className="page-section marketplace-request">
        <div className="section-heading">
          <span className="eyebrow">Algorithmic Project Estimator</span>
          <h2>
            Get a live estimate <em>before you commit.</em>
          </h2>
          <p>
            Fill the brief — the estimator updates in real time, and the request is synchronized to the operations
            dashboard with an instant tracking ID.
          </p>
        </div>

        <div className="marketplace-request-grid">
          <aside className="estimator-panel">
            <span className="eyebrow">Estimated Project Total</span>
            <div className="estimator-total">{formatCurrency(estimate.total)}</div>
            <div className="estimator-rows">
              <div>
                <span>Category Base</span>
                <strong>{formatCurrency(estimate.base)}</strong>
              </div>
              <div>
                <span>Complexity Factor</span>
                <strong>
                  ×{estimate.multiplier} ({values.complexity})
                </strong>
              </div>
              <div>
                <span>Top-Rated Premium</span>
                <strong>{estimate.premiumLabel}</strong>
              </div>
            </div>
            <p className="mut small">
              Likely delivery range: {formatCurrency(estimate.total * 0.85)} – {formatCurrency(estimate.total * 1.2)}
            </p>
            <Button variant="ghost" type="button" onClick={downloadEstimate}>
              <FiDownload /> Download Estimate (PDF)
            </Button>
          </aside>

          {sent ? (
            <div className="form-success" role="status">
              <span className="success-icon">✓</span>
              <h2>Nexus Request Synchronized.</h2>
              <p>We will review your project parameters and connect you with a matching provider lead shortly.</p>
              <Button
                variant="ghost"
                onClick={() => {
                  soundEngine.playClick()
                  setSent(false)
                  setValues(initialRequest)
                }}
              >
                Send Another Inquiry
              </Button>
            </div>
          ) : (
            <form className="request-form" onSubmit={submit} noValidate>
              <div className="form-row">
                <FormField
                  label="Full Name"
                  name="name"
                  value={values.name}
                  error={errors.name}
                  onChange={update}
                  placeholder="Your full name"
                />
                <FormField
                  label="Work Email"
                  name="email"
                  type="email"
                  value={values.email}
                  error={errors.email}
                  onChange={update}
                  placeholder="you@company.com"
                />
              </div>

              <div className="form-row">
                <FormField
                  label="Phone / WhatsApp"
                  name="phone"
                  value={values.phone}
                  error={errors.phone}
                  onChange={update}
                  placeholder="+92 300 1234567"
                />
                <FormField
                  label="Category"
                  name="category"
                  type="select"
                  value={values.category}
                  error={errors.category}
                  onChange={update}
                  options={['', ...requestCategories]}
                />
              </div>

              <div className="form-row">
                <FormField
                  label="Preferred Provider (Optional)"
                  name="provider"
                  value={values.provider}
                  onChange={update}
                  placeholder="Leave blank for automatic best match"
                />
                <FormField
                  label="Architecture Complexity"
                  name="complexity"
                  type="select"
                  value={values.complexity}
                  onChange={update}
                  options={['Basic', 'Standard', 'Advanced']}
                />
              </div>

              <div className="form-row">
                <FormField
                  label="Budget Range"
                  name="budget"
                  type="select"
                  value={values.budget}
                  error={errors.budget}
                  onChange={update}
                  options={['', '< $2,500', '$2,500 - $5,000', '$5,000 - $10,000', '$10,000+']}
                />
                <FormField
                  label="Timeline"
                  name="timeline"
                  type="select"
                  value={values.timeline}
                  error={errors.timeline}
                  onChange={update}
                  options={['', 'Immediate (1-2 weeks)', '1 Month', '2-3 Months', 'Ongoing Retainer']}
                />
              </div>

              <FormField
                label="Project Description & Scope"
                name="description"
                type="textarea"
                value={values.description}
                error={errors.description}
                onChange={update}
                placeholder="Briefly describe the product, users, integrations, and desired outcomes..."
              />

              <div className="form-consent">
                <label>
                  <input
                    type="checkbox"
                    name="consent"
                    checked={values.consent}
                    onChange={update}
                  />
                  <span>I agree to receive a technical scoping estimate and project brief follow-up.</span>
                </label>
                {errors.consent && <small className="field-error">{errors.consent}</small>}
              </div>

              <Button type="submit">
                Submit Request to Virexo Nexus <FiArrowUpRight />
              </Button>
            </form>
          )}
        </div>
      </section>

      <ProviderModal
        open={Boolean(activeProvider)}
        onClose={() => setActiveProvider(null)}
        provider={activeProvider}
        onRequest={requestProvider}
      />

      <CtaSection title="Ready to assemble your dream technical team?" />
    </>
  )
}
