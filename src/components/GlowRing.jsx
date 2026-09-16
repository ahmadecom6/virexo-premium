import { Link } from 'react-router-dom'
import { FiArrowUpRight } from 'react-icons/fi'

/** Stationary icon inside a rotating metallic light ring, matching the reference. */
export function GlowIcon({ icon: Icon = FiArrowUpRight, className = '' }) {
  return <span className={`vx-ring-icon ${className}`} aria-hidden="true"><Icon /></span>
}
export default function RingButton({ to, href, icon, children, className = '', ...props }) {
  const Tag = to ? Link : href ? 'a' : 'button'
  const destination = to ? { to } : href ? { href } : { type: 'button' }
  return <Tag {...destination} {...props} className={`vx-ring-button ${className}`}><GlowIcon icon={icon} /><span className="vx-ring-label">{children}</span></Tag>
}
