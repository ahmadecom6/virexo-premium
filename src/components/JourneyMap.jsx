import React, { useEffect, useRef, useState } from 'react'

const milestones = [
  { id: 'm1', year: '2021', title: 'Founded', text: 'A small practice forms around digital products and thoughtful execution.', align: 'right', top: '10%' },
  { id: 'm2', year: '2023', title: 'Systems thinking', text: 'The work expands from pages to the connected systems behind them.', align: 'left', top: '30%' },
  { id: 'm3', year: '2024', title: 'First 50 clients', text: 'Achieved a major milestone in client partnerships and delivered projects.', align: 'right', top: '50%' },
  { id: 'm4', year: '2025', title: 'Team of 12', text: 'Expanded our talent pipeline with top-tier engineers and designers.', align: 'left', top: '70%' },
  { id: 'm5', year: '2026', title: 'Virexo OS launched', text: 'Brought design, engineering, and automation into one clearer offer.', align: 'right', top: '90%' },
]

export default function JourneyMap() {
  const containerRef = useRef(null)
  const pathRef = useRef(null)
  const markerRef = useRef(null)
  const progressPathRef = useRef(null)
  
  const [isMobile, setIsMobile] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Media query listener
  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    setIsMobile(mobileQuery.matches)
    setReducedMotion(motionQuery.matches)

    const handler = () => {
      setIsMobile(mobileQuery.matches)
      setReducedMotion(motionQuery.matches)
    }

    mobileQuery.addEventListener('change', handler)
    motionQuery.addEventListener('change', handler)
    
    return () => {
      mobileQuery.removeEventListener('change', handler)
      motionQuery.removeEventListener('change', handler)
    }
  }, [])

  // Milestone reveal logic via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { root: null, rootMargin: '0px 0px -15% 0px', threshold: 0.1 }
    )

    const cards = document.querySelectorAll('.journey-card')
    cards.forEach(c => observer.observe(c))

    return () => cards.forEach(c => observer.unobserve(c))
  }, [])

  // The path-progress and marker-positioning logic
  useEffect(() => {
    if (reducedMotion) return

    function initJourneyPath() {
      const container = containerRef.current
      const path = pathRef.current
      const progressPath = progressPathRef.current
      const marker = markerRef.current

      if (!container || !path || !progressPath || !marker) return

      let pathLength = 0
      
      // Calculate length and initialize SVG styling
      function setupPath() {
        pathLength = path.getTotalLength()
        progressPath.style.strokeDasharray = pathLength
        progressPath.style.strokeDashoffset = pathLength
      }

      setupPath()

      let ticking = false

      function onScroll() {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateProgress()
            ticking = false
          })
          ticking = true
        }
      }

      function updateProgress() {
        const rect = container.getBoundingClientRect()
        const viewportHeight = window.innerHeight

        // Calculate progress based on container position relative to viewport
        // Starts when top of container hits middle of screen, ends when bottom hits middle
        const startY = rect.top - (viewportHeight / 2)
        const totalScrollable = rect.height
        
        let progress = 0
        if (startY < 0) {
          progress = Math.min(1, Math.abs(startY) / totalScrollable)
        }

        // 1. Update the colored path
        const dashOffset = pathLength - (progress * pathLength)
        progressPath.style.strokeDashoffset = Math.max(0, dashOffset)

        // 2. Position the marker
        // We get the local SVG coordinates (which map nicely if SVG preserves aspect ratio or handles it)
        const pt = path.getPointAtLength(progress * pathLength)
        // Since marker is absolutely positioned over the SVG viewBox:
        marker.setAttribute('cx', pt.x)
        marker.setAttribute('cy', pt.y)
      }

      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', setupPath)
      
      // Initial trigger
      updateProgress()

      return () => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', setupPath)
      }
    }

    return initJourneyPath()
  }, [reducedMotion, isMobile])

  // Desktop Path: Winding S-curve. Mobile Path: Gentle wave.
  const pathD = isMobile 
    ? "M 500 0 Q 400 250, 500 500 T 500 1000 T 500 1500 T 500 2000"
    : "M 500 0 C 800 200, 800 300, 500 500 C 200 700, 200 800, 500 1000 C 800 1200, 800 1300, 500 1500 C 200 1700, 200 1800, 500 2000"

  return (
    <div className="journey-map-container" ref={containerRef}>
      
      {/* The SVG Track */}
      <svg 
        className="journey-svg" 
        viewBox="0 0 1000 2000" 
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Background Track */}
        <path 
          ref={pathRef}
          className="journey-path-track"
          d={pathD}
        />
        
        {/* Progress Track (Colored) */}
        {!reducedMotion && (
          <path 
            ref={progressPathRef}
            className="journey-path-progress"
            d={pathD}
          />
        )}
        
        {/* Traveling Marker */}
        {!reducedMotion && (
          <circle 
            ref={markerRef}
            className="journey-marker"
            r="16"
            cx="500"
            cy="0"
          />
        )}
      </svg>

      {/* The Milestone Cards */}
      <div className="journey-milestones">
        {milestones.map((m, i) => (
          <article 
            key={m.id} 
            className={`journey-card ${m.align === 'left' ? 'align-left' : 'align-right'}`}
            style={{ top: m.top }}
          >
            <div className="journey-card-content">
              <span className="journey-year">{m.year}</span>
              <h3 className="journey-title">{m.title}</h3>
              <p className="journey-text">{m.text}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
