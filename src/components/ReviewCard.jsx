import { FiStar } from 'react-icons/fi'

export default function ReviewCard({ review }) {
  return (
    <article className="review-card vx-ring-surface">
      <div className="stars" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => (
          <FiStar key={index} className={index < review.rating ? 'filled' : ''} />
        ))}
      </div>
      <p>“{review.text.replace(/^Sample review:\s*/i, '')}”</p>
      <footer>
        <strong>{review.name}</strong>
        <span>{review.role}</span>
      </footer>
    </article>
  )
}
