import { useEffect, useRef } from 'react'
import { easeOutCubic, prefersReducedMotion } from '../../utils/motion'

export default function DonutChart({ percent, label, height = 220 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const context = canvas.getContext('2d')
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

      const centerX = width / 2
      const centerY = canvasHeight / 2
      const radius = Math.min(width, canvasHeight) / 2 - 16
      const accent = colorFor('--cinema-mint', colorFor('--accent-primary', '#2ecc8f'))

      context.lineWidth = 13
      context.lineCap = 'round'
      context.strokeStyle = colorFor('--border-color', 'rgba(148,163,184,0.2)')
      context.beginPath()
      context.arc(centerX, centerY, radius, 0, Math.PI * 2)
      context.stroke()

      context.strokeStyle = accent
      context.beginPath()
      context.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (percent / 100) * progress)
      context.stroke()

      context.textAlign = 'center'
      context.fillStyle = colorFor('--text-primary', '#f5f7fa')
      context.font = "700 32px 'Space Grotesk'"
      context.fillText(`${Math.round(percent * progress)}%`, centerX, centerY + 4)
      context.fillStyle = colorFor('--text-muted', '#94a3b8')
      context.font = '600 11px Manrope'
      context.fillText(label, centerX, centerY + 24)
    }

    const animate = () => {
      if (prefersReducedMotion()) { draw(1); return }
      const start = performance.now()
      const duration = 1200
      const step = (now) => {
        const progress = Math.min(1, (now - start) / duration)
        draw(easeOutCubic(progress))
        if (progress < 1) frame = window.requestAnimationFrame(step)
      }
      frame = window.requestAnimationFrame(step)
    }

    animate()
    const resizeObserver = new ResizeObserver(() => draw(1))
    resizeObserver.observe(canvas)
    const themeObserver = new MutationObserver(() => draw(1))
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => { window.cancelAnimationFrame(frame); resizeObserver.disconnect(); themeObserver.disconnect() }
  }, [percent, label])

  return <canvas ref={canvasRef} className="chart-canvas" style={{ height }} role="img" aria-label="Donut chart" />
}
