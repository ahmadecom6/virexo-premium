import { useEffect, useRef } from 'react'
import { FiMapPin, FiStar } from 'react-icons/fi'

export default function ProviderModal({ provider, onClose, onRequest }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!provider) return undefined
    const previousFocus = document.activeElement
    closeRef.current?.focus()
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previousFocus?.focus?.()
    }
  }, [provider, onClose])

  if (!provider) return null

  return (
    <div className="case-modal" role="dialog" aria-modal="true" aria-label={`${provider.name} profile`}>
      <div className="case-modal-backdrop" onClick={onClose} />
      <div className="case-modal-dialog provider-modal-dialog">
        <button ref={closeRef} className="case-modal-close" type="button" aria-label="Close provider profile" onClick={onClose}>×</button>

        <div className="provider-modal-head">
          <span className="provider-avatar">{provider.name.split(' ').map((part) => part[0]).join('')}</span>
          <div>
            <span className="eyebrow">{provider.category}</span>
            <h2>{provider.name}</h2>
            <p className="provider-modal-title">{provider.title}</p>
          </div>
        </div>

        <div className="provider-modal-meta">
          <span><FiStar aria-hidden="true" /> {provider.rating.toFixed(1)} ({provider.reviews} reviews)</span>
          <span><FiMapPin aria-hidden="true" /> {provider.location}</span>
          <span>{provider.rate}</span>
        </div>

        <p>{provider.bio}</p>

        <div className="tag-list">
          {provider.skills.map((skill) => (
            <span key={skill} className="tag-item">{skill}</span>
          ))}
        </div>

        <button className="button-primary" type="button" onClick={() => onRequest(provider)}>Request this provider</button>
      </div>
    </div>
  )
}
