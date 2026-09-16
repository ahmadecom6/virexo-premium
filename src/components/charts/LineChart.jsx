import { useEffect, useRef } from 'react'
import { easeOutCubic, prefersReducedMotion } from '../../utils/motion'

export default function LineChart({ data, labels, height = 220 }) {
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

      const padding = { left: 38, right: 10, top: 14, bottom: 26 }
      const max = Math.max(...data) * 1.18
      const stepX = (index) => padding.left + ((width - padding.left - padding.right) * index) / (data.length - 1)
      const stepY = (value) => canvasHeight - padding.bottom - ((canvasHeight - padding.top - padding.bottom) * value) / max

      context.strokeStyle = colorFor('--border-color', 'rgba(148,163,184,0.2)')
      context.fillStyle = colorFor('--text-muted', '#94a3b8')
      context.font = '600 10px Manrope'
      context.textAlign = 'right'
      for (let grid = 0; grid <= 4; grid += 1) {
        const value = (max * grid) / 4
        const y = stepY(value)
        context.lineWidth = 1
        context.beginPath()
        context.moveTo(padding.left, y)
        context.lineTo(width - padding.right, y)
        context.stroke()
        context.fillText(Math.round(value), padding.left - 7, y + 3)
      }

      context.textAlign = 'center'
      labels.forEach((label, index) => context.fillText(label, stepX(index), canvasHeight - 8))

      const accent = colorFor('--cinema-mint', colorFor('--accent-primary', '#2ecc8f'))
      const visibleCount = progress * (data.length - 1)
      const fullIndex = Math.floor(visibleCount)

      context.beginPath()
      context.moveTo(stepX(0), stepY(data[0]))
      for (let index = 1; index <= Math.min(fullIndex, data.length - 1); index += 1) context.lineTo(stepX(index), stepY(data[index]))
      if (fullIndex < data.length - 1) {
        const fraction = visibleCount - fullIndex
        const x = stepX(fullIndex) + (stepX(fullIndex + 1) - stepX(fullIndex)) * fraction
        const y = stepY(data[fullIndex]) + (stepY(data[fullIndex + 1]) - stepY(data[fullIndex])) * fraction
        context.lineTo(x, y)
      }
      context.strokeStyle = accent
      context.lineWidth = 2.4
      context.lineJoin = 'round'
      context.stroke()

      context.lineTo(stepX(Math.min(visibleCount, data.length - 1)), canvasHeight - padding.bottom)
      context.lineTo(stepX(0), canvasHeight - padding.bottom)
      context.closePath()
      context.globalAlpha = 0.08
      context.fillStyle = accent
      context.fill()
      context.globalAlpha = 1

      for (let index = 0; index <= fullIndex; index += 1) {
        context.beginPath()
        context.arc(stepX(index), stepY(data[index]), 3, 0, Math.PI * 2)
        context.fillStyle = accent
        context.fill()
      }
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
  }, [data, labels])

  return <canvas ref={canvasRef} className="chart-canvas" style={{ height }} role="img" aria-label="Line chart" />
}
