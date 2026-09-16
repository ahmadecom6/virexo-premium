import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowUpRight, FiCode, FiCpu, FiPenTool, FiShoppingCart, FiLayers, FiTool, FiPlus, FiMinus } from 'react-icons/fi'
import { GlowIcon } from './GlowRing'

const types = [
  ['full-stack', FiCode, 'Development'], ['ai-', FiCpu, 'Intelligence'],
  ['ui-', FiPenTool, 'Experience'], ['ecommerce', FiShoppingCart, 'Commerce'],
  ['api-', FiLayers, 'Integration'], ['website-', FiTool, 'Support'],
]
export default function ServiceCard({ service, compact = false }) {
  const [expanded, setExpanded] = useState(false)
  const id = useId()
  const [, icon, label] = types.find(([prefix]) => service.id.startsWith(prefix)) || ['', FiCode, 'Capability']
  return <article className={`service-card vx-service-card vx-ring-surface ${compact ? 'service-card-compact' : ''}`}>
    <div className="vx-service-top"><GlowIcon icon={icon} /><span>{label}</span></div>
    <h3>{service.title}</h3>
    <p>{service.short}</p>
    {!compact && <>
      <div className="service-card-meta"><span>{service.technologies?.slice(0, 2).join(' / ')}</span><Link to={`/services?service=${service.id}`} aria-label={`Explore ${service.title}`}>Explore <FiArrowUpRight /></Link></div>
      <button className="vx-service-toggle" type="button" onClick={() => setExpanded(v => !v)} aria-expanded={expanded} aria-controls={id}>What’s included {expanded ? <FiMinus /> : <FiPlus />}</button>
      <ul id={id} className="vx-deliverables" hidden={!expanded}>{service.deliverables?.map(item => <li key={item}>{item}</li>)}</ul>
    </>}
  </article>
}
