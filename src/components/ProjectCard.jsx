import { Link } from 'react-router-dom'
import { useState } from 'react'
import { FiArrowUpRight, FiHeart } from 'react-icons/fi'
import { getFavourites, toggleFavourite } from '../utils/favourites'

export default function ProjectCard({ project }) {
  const favouriteId = `project:${project.id}`
  const [saved, setSaved] = useState(() => getFavourites().includes(favouriteId))
  return (
    <article className="project-card vx-ring-surface">
      <div className="project-visual">{project.image}<span>{project.category}</span><button className={`vx-favourite${saved ? ' is-saved' : ''}`} type="button" aria-pressed={saved} aria-label={saved ? 'Remove from favourites' : 'Save to favourites'} onClick={() => setSaved(toggleFavourite(favouriteId).includes(favouriteId))}><FiHeart /></button></div>
      <div className="project-card-body">
        <span className="eyebrow-number">{project.category}</span>
        <h2>{project.title}</h2>
        <p>{project.description}</p>
        <div className="project-tags">
          {project.technologies.slice(0, 3).map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
        <Link className="inline-link" to={`/projects/${project.id}`}>
          View case study <FiArrowUpRight />
        </Link>
      </div>
    </article>
  )
}
