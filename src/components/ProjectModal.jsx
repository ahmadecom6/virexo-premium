import { FiX } from 'react-icons/fi'

export default function ProjectModal({ project, onClose }) {
  if (!project) return null
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><section className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title" onClick={(event) => event.stopPropagation()}><button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close case study"><FiX /></button><span className="project-visual project-visual-modal">{project.image}</span><span className="eyebrow-number">{project.category}</span><h2 id="project-modal-title">{project.title}</h2><p>{project.description}</p><div className="project-modal-grid"><div><strong>Technology</strong><span>{project.technologies.join(' / ')}</span></div><div><strong>Features</strong><span>{project.features.join(' / ')}</span></div></div></section></div>
}
