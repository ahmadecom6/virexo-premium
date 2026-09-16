import { useEffect, useRef } from 'react'
import { easeOutCubic, prefersReducedMotion } from '../../utils/motion'

// Small ticking sparkline used inside the marketing hero's live portal preview card.
export default function Sparkline({ height = 56 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const context = canvas.getContext('2d')
    const points = Array.from({ length: 24 }, () => 0.4 + Math.random() * 0.5)
    let frame = 0
    const styles = getComputedStyle(document.documentElement)
    const colorFor = (name, fallback) => styles.getPropertyValue(name).trim() || fallback

    const draw = (progress) => {
      const ratio = Math.min(2, window.devicePixelRatio || 1)
      const width = canvas.clientWidth
      const canvasHeight = canvas.clientHeight
      canvas.width = width * ratio
      canvas.height = canvasHeight * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, canvasHeight)

      const accent = colorFor('--cinema-mint', colorFor('--accent-primary', '#2ecc8f'))
      const stepX = (index) => (width * index) / (points.length - 1)
      const stepY = (value) => canvasHeight - value * canvasHeight * progress

      context.beginPath()
      context.moveTo(stepX(0), stepY(points[0]))
      points.forEach((value, index) => context.lineTo(stepX(index), stepY(value)))
      context.strokeStyle = accent
      context.lineWidth = 2
      context.lineJoin = 'round'
      context.stroke()

      context.lineTo(stepX(points.length - 1), canvasHeight)
      context.lineTo(stepX(0), canvasHeight)
      context.closePath()
      context.globalAlpha = 0.14
      context.fillStyle = accent
      context.fill()
      context.globalAlpha = 1
    }

    if (prefersReducedMotion()) {
      draw(1)
      return undefined
    }

    let shift = 0
    const drift = () => {
      shift += 0.006
      points.shift()
      points.push(Math.max(0.25, Math.min(0.95, 0.6 + Math.sin(shift * 6) * 0.3 + (Math.random() - 0.5) * 0.15)))
      draw(easeOutCubic(1))
      frame = window.requestAnimationFrame(drift)
    }
    frame = window.requestAnimationFrame(drift)
    const resizeObserver = new ResizeObserver(() => draw(1))
    resizeObserver.observe(canvas)
    return () => { window.cancelAnimationFrame(frame); resizeObserver.disconnect() }
  }, [])

  return <canvas ref={canvasRef} className="sparkline-canvas" style={{ height }} role="img" aria-label="Live activity trend" />
}
