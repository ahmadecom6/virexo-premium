import { useEffect, useRef } from 'react'
import { easeOutCubic, prefersReducedMotion } from '../../utils/motion'

export default function BarChart({ items, height = 220 }) {
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

      const padding = { left: 10, right: 10, top: 22, bottom: 30 }
      const barWidth = Math.min(64, ((width - padding.left - padding.right) / items.length) * 0.5)
      const max = Math.max(...items.map((item) => item.value)) * 1.15 || 1
      const accent = colorFor('--cinema-mint', colorFor('--accent-primary', '#2ecc8f'))

      context.textAlign = 'center'
      items.forEach((item, index) => {
        const centerX = padding.left + ((width - padding.left - padding.right) * (index + 0.5)) / items.length
        const barHeight = (canvasHeight - padding.top - padding.bottom) * (item.value / max) * progress
        const y = canvasHeight - padding.bottom - barHeight

        context.fillStyle = accent
        context.beginPath()
        context.roundRect(centerX - barWidth / 2, y, barWidth, barHeight, [8, 8, 0, 0])
        context.fill()

        context.globalAlpha = progress
        context.fillStyle = colorFor('--text-primary', '#f5f7fa')
        context.font = '700 11px Manrope'
        context.fillText(item.value, centerX, y - 7)
        context.globalAlpha = 1

        context.fillStyle = colorFor('--text-muted', '#94a3b8')
        context.font = '600 11px Manrope'
        context.fillText(item.label, centerX, canvasHeight - 9)
      })
    }

    const animate = () => {
      if (prefersReducedMotion()) { draw(1); return }
      const start = performance.now()
      const duration = 1100
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
  }, [items])

  return <canvas ref={canvasRef} className="chart-canvas" style={{ height }} role="img" aria-label="Bar chart" />
}
