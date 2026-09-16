import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../utils/motion'

// Drifting sine-wave lines behind the full-screen auth gate.
export default function AuthWaveCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const context = canvas.getContext('2d')
    let frame = 0
    const styles = getComputedStyle(document.documentElement)
    const colorFor = (name, fallback) => styles.getPropertyValue(name).trim() || fallback

    const resize = () => {
      const ratio = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = canvas.clientWidth * ratio
      canvas.height = canvas.clientHeight * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const waves = [
      { amplitude: 26, wavelength: 260, speed: 0.012, offset: 0, color: colorFor('--cinema-mint', '#2ecc8f'), alpha: 0.35 },
      { amplitude: 34, wavelength: 320, speed: 0.008, offset: 2, color: colorFor('--cinema-blue', '#3b82f6'), alpha: 0.28 },
      { amplitude: 18, wavelength: 190, speed: 0.016, offset: 4, color: colorFor('--cinema-mint', '#2ecc8f'), alpha: 0.18 },
    ]

    const draw = (time) => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      context.clearRect(0, 0, width, height)
      waves.forEach((wave, index) => {
        const baseline = height * (0.35 + index * 0.22)
        context.beginPath()
        for (let x = 0; x <= width; x += 6) {
          const y = baseline + Math.sin(x / wave.wavelength + time * wave.speed + wave.offset) * wave.amplitude
          if (x === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        }
        context.strokeStyle = wave.color
        context.globalAlpha = wave.alpha
        context.lineWidth = 1.6
        context.stroke()
      })
      context.globalAlpha = 1
    }

    resize()
    if (prefersReducedMotion()) {
      draw(0)
      const onResize = () => { resize(); draw(0) }
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }

    const loop = (time) => { draw(time / 40); frame = window.requestAnimationFrame(loop) }
    frame = window.requestAnimationFrame(loop)
    const onResize = () => resize()
    window.addEventListener('resize', onResize)
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener('resize', onResize) }
  }, [])

  return <canvas ref={canvasRef} className="auth-wave-canvas" aria-hidden="true" />
}
