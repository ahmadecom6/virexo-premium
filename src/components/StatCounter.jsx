import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../utils/motion'

export default function StatCounter({ value, suffix = '', prefix = '', decimals = 0 }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState((0).toFixed(decimals))

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        observer.unobserve(node)
        if (prefersReducedMotion()) { setDisplay(value.toFixed(decimals)); return }
        const start = performance.now()
        const duration = 1300
        const step = (now) => {
          const progress = Math.min(1, (now - start) / duration)
          const eased = progress * progress * progress
          setDisplay((value * eased).toFixed(decimals))
          if (progress < 1) window.requestAnimationFrame(step)
        }
        window.requestAnimationFrame(step)
      })
    }, { threshold: 0.4 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [value, decimals])

  return <div className="stat-value" ref={ref}>{prefix}{display}{suffix}</div>
}
