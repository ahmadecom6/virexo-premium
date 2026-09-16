import { faqs } from '../data'
import FAQAccordion from '../components/FAQAccordion'
import CtaSection from '../components/CtaSection'

export default function Faq() {
  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">FAQ / 06</span>
        <h1>Clear answers before <em>the first call.</em></h1>
        <p>A few practical answers about how we work, what we build, and what a useful first step looks like.</p>
      </section>

      <section className="faq-section page-section">
        <div className="section-heading">
          <span className="eyebrow">Frequently asked</span>
          <h2>Keep the unknowns <em>small.</em></h2>
        </div>
        <FAQAccordion items={faqs} />
      </section>

      <CtaSection title="Still have a question? Let's talk it through." />
    </>
  )
}
