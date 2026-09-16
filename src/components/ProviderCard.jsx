import { FiMapPin, FiStar } from 'react-icons/fi'

export default function ProviderCard({ provider, onView, onRequest }) {
  return (
    <article className="provider-card vx-ring-surface">
      <div className="provider-card-head">
        <span className="provider-avatar">{provider.name.split(' ').map((part) => part[0]).join('')}</span>
        <div>
          <h3>{provider.name}</h3>
          <p>{provider.title}</p>
        </div>
      </div>

      <div className="provider-card-meta">
        <span><FiStar aria-hidden="true" /> {provider.rating.toFixed(1)}</span>
        <span><FiMapPin aria-hidden="true" /> {provider.location}</span>
        <span>{provider.rate}</span>
      </div>

      <div className="tag-list">
        {provider.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="tag-item">{skill}</span>
        ))}
      </div>

      <div className="provider-card-actions">
        <button className="button-ghost" type="button" onClick={() => onView(provider)}>View profile</button>
        <button className="button-primary" type="button" onClick={() => onRequest(provider)}>Request provider</button>
      </div>
    </article>
  )
}
