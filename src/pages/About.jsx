import { FiArrowUpRight, FiCompass, FiHeart, FiShield } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import JourneyMap from '../components/JourneyMap'
import { soundEngine } from '../utils/audio'

const values = [
  ['01', FiCompass, 'Useful over ornamental', 'We care about the outcome behind the interface — not the interface itself.'],
  ['02', FiHeart, 'Curious by default', 'We ask better questions before reaching for familiar answers.'],
  ['03', FiShield, 'Built in the open', 'We keep progress visible so decisions stay shared and clear.'],
]

const timeline = [
  ['2021', 'Virexo begins', 'A small practice forms around digital products and thoughtful execution.'],
  ['2023', 'Systems thinking', 'The work expands from pages to the connected systems behind them.'],
  ['2026', 'The next chapter', 'Virexo brings design, engineering, and automation into one clearer offer.'],
]

const team = [
  {
    name: 'Rahat Maqsood',
    role: 'Founder & CEO',
    quote: 'Building systems that think.',
    initials: 'RM',
    color: 'linear-gradient(135deg, #00f2fe, #4facfe)',
  },
  {
    name: 'Sara Ali',
    role: 'Head of Design',
    quote: 'Every pixel earns its place.',
    initials: 'SA',
    color: 'linear-gradient(135deg, #a855f7, #6366f1)',
  },
  {
    name: 'Usman Tariq',
    role: 'Lead Engineer',
    quote: 'If it is not fast, it is not done.',
    initials: 'UT',
    color: 'linear-gradient(135deg, #10b981, #06b6d4)',
  },
]

export default function About() {
  return (
    <div className="halcyon-page">
      {/* Aurora */}
      <div className="halcyon-aurora" aria-hidden="true">
        <div className="aurora-blob aurora-blue" />
        <div className="aurora-blob aurora-indigo" />
        <div className="aurora-blob aurora-amber" />
      </div>

      {/* ── Hero ── */}
      <section className="halcyon-page-hero">
        <div className="halcyon-page-hero-inner halcyon-about-hero">
          <div>
            <span className="halcyon-eyebrow">About Virexo / 03</span>
            <h1 className="halcyon-display">
              Small enough to stay <em>thoughtful.</em>
            </h1>
          </div>
          <div className="halcyon-about-hero-aside">
            <p className="halcyon-lead">
              Virexo Innovations is an independent technology company helping ambitious businesses make
              digital work more useful, more human, and easier to grow.
            </p>
            <p className="halcyon-mist">
              We work across strategy, product design, and engineering — keeping the conversation in one
              room so fewer things fall between the cracks.
            </p>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="halcyon-section">
        <div className="halcyon-section-inner">
          <div className="halcyon-section-header">
            <span className="halcyon-eyebrow">Core values</span>
            <h2 className="halcyon-heading">How we choose to <em>work.</em></h2>
          </div>
          <div className="halcyon-values-grid">
            {values.map(([number, Icon, title, text]) => (
              <article key={number} className="halcyon-value-card">
                <div className="value-card-top">
                  <span className="value-number">{number}</span>
                  <span className="value-icon"><Icon /></span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission statement ── */}
      <section className="halcyon-mission">
        <div className="halcyon-section-inner">
          <span className="halcyon-eyebrow">Our point of view</span>
          <h2 className="halcyon-mission-headline">
            Technology is only valuable when it creates <em>momentum.</em>
          </h2>
          <p className="halcyon-mission-body">
            We bring strategy, product design, and engineering into the same conversation. That means fewer
            handoffs, clearer decisions, and digital experiences that respect both the people using them and
            the teams maintaining them.
          </p>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="halcyon-section">
        <div className="halcyon-section-inner">
          <div className="halcyon-section-header">
            <span className="halcyon-eyebrow">The team</span>
            <h2 className="halcyon-heading">People who care about <em>the work.</em></h2>
          </div>
          <div className="halcyon-team-grid">
            {team.map((member) => (
              <article key={member.name} className="halcyon-team-card vx-ring-surface">
                <div className="team-avatar" style={{ background: member.color }}>
                  {member.initials}
                </div>
                <div className="team-info">
                  <strong>{member.name}</strong>
                  <span>{member.role}</span>
                  <q>{member.quote}</q>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="halcyon-section">
        <div className="halcyon-section-inner">
          <div className="halcyon-section-header">
            <span className="halcyon-eyebrow">Company journey</span>
            <h2 className="halcyon-heading">Still early. Already <em>in motion.</em></h2>
          </div>
          <JourneyMap />
          </div>
        </section>

      {/* ── Amber CTA ── */}
      <section className="halcyon-cta">
        <div className="halcyon-cta-glow" aria-hidden="true" />
        <div className="halcyon-cta-inner">
          <span className="halcyon-eyebrow halcyon-eyebrow-amber">Partner with us</span>
          <h2 className="halcyon-cta-headline">
            Want a thoughtful<br />technology <em>partner?</em>
          </h2>
          <p className="halcyon-mist">
            We work with a small number of clients so each relationship gets the attention it deserves.
          </p>
          <div className="halcyon-cta-actions">
            <Link
              className="button-primary btn-glow-ring halcyon-amber-btn"
              to="/contact"
              onClick={() => soundEngine.playClick()}
            >
              Start the conversation <FiArrowUpRight />
            </Link>
          </div>
        </div>
        <div className="halcyon-watermark" aria-hidden="true">VIREXO</div>
      </section>
    </div>
  )
}

