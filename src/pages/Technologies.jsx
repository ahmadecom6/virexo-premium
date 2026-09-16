import { motion } from 'framer-motion'
import { technologyGroups } from '../data'
import CtaSection from '../components/CtaSection'

export default function Technologies() {
  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Technology / 04</span>
        <h1>Tools that disappear behind <em>good work.</em></h1>
        <p>Our stack is practical by design: proven enough to trust, flexible enough to fit the product and the people behind it.</p>
      </section>

      <section className="tech-stack page-section">
        {technologyGroups.map((group, groupIndex) => (
          <div className="tech-group" key={group.name}>
            <div className="tech-group-label">
              <span>0{groupIndex + 1}</span>
              <h2>{group.name}</h2>
            </div>

            <div className="tech-items">
              {group.items.map((item) => (
                <motion.article
                  key={item.name}
                  whileHover={{ y: -6, rotateX: 3, rotateY: -3 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                >
                  <span className="tech-symbol">{item.name.slice(0, 2).toUpperCase()}</span>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        ))}
      </section>

      <CtaSection title="Have a stack in mind? Let's make it work harder." />
    </>
  )
}
