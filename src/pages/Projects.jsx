import { useState } from 'react'
import { projects } from '../data'
import ProjectCard from '../components/ProjectCard'
import CtaSection from '../components/CtaSection'

const filters = ['All', 'Web Development', 'Full Stack', 'Automotive']

export default function Projects() {
  const [filter, setFilter] = useState('All')
  const visible = filter === 'All' ? projects : projects.filter((project) => project.category === filter)

  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Selected work / 02</span>
        <h1>Proof lives in the <em>details.</em></h1>
        <p>A small collection of product and platform work, designed to show how we think about clarity, momentum, and useful digital systems.</p>
      </section>

      <section className="page-section portfolio-section">
        <div className="filter-row" role="tablist" aria-label="Project categories">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              className={filter === item ? 'is-active' : ''}
              aria-selected={filter === item}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="project-grid">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <CtaSection title="Your next case study starts with a conversation." />
    </>
  )
}
