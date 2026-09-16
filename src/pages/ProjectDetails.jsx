import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiArrowUpRight, FiExternalLink, FiGithub } from 'react-icons/fi'
import { projects } from '../data'

function isEmbeddedVideo(url) {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(url)
}

function VideoGallery({ videoUrl, labels, fallback }) {
  const [frames, setFrames] = useState([])

  useEffect(() => {
    let cancelled = false
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    video.muted = true
    video.preload = 'metadata'
    video.src = videoUrl

    const captureFrames = () => {
      if (!video.duration || !video.videoWidth) return
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const moments = labels.map((_, index) => video.duration * ((index + 1) / (labels.length + 1)))
      const captures = []
      let frameIndex = 0
      const captureCurrentFrame = () => {
        const context = canvas.getContext('2d')
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        captures.push(canvas.toDataURL('image/jpeg', 0.82))
        frameIndex += 1
        if (frameIndex < moments.length) video.currentTime = moments[frameIndex]
        else if (!cancelled) setFrames(captures)
      }
      video.addEventListener('seeked', captureCurrentFrame)
      video.currentTime = moments[0]
    }

    video.addEventListener('loadedmetadata', captureFrames)
    return () => {
      cancelled = true
      video.removeAttribute('src')
      video.load()
    }
  }, [videoUrl, labels])

  return labels.map((label, index) => (
    <div className="project-gallery-item" key={label}>
      {frames[index] ? <img src={frames[index]} alt={`${label} preview`} /> : <div className="project-visual project-visual-large">{fallback}</div>}
      <span>{index + 1}. {label}</span>
    </div>
  ))
}

export default function ProjectDetails() {
  const { projectId } = useParams()
  const project = projects.find((item) => item.id === projectId)
  const [reveal, setReveal] = useState(52)

  if (!project) {
    return (
      <section className="page-hero not-found">
        <span className="eyebrow">Project / Missing</span>
        <h1>This project is not available yet.</h1>
        <p>We could not find the case study you requested. Use the portfolio to explore the current work.</p>
        <Link className="button-primary" to="/projects">Return to portfolio</Link>
      </section>
    )
  }

  const hasLiveDemo = Boolean(project.liveDemo && project.liveDemo !== '#')
  const hasSourceCode = Boolean(project.sourceCode && project.sourceCode !== '#')

  return (
    <>
      <section className="page-hero project-detail-hero">
        <div className="project-detail-header">
          <span className="eyebrow">Portfolio / Case study</span>
          <h1>{project.title}</h1>
          <p>{project.overview}</p>
        </div>
      </section>

      <section className="page-section project-detail-page">
        <div className="project-detail-topbar">
          <Link className="back-link" to="/projects"><FiArrowLeft /> Back to portfolio</Link>
          <div className="project-actions">
            {hasLiveDemo ? <a className="button-ghost" href={project.liveDemo} target="_blank" rel="noreferrer">Live demo <FiExternalLink /></a> : <span className="button-ghost button-disabled" aria-label="Live demo is not deployed">Demo not deployed</span>}
            {hasSourceCode ? <a className="button-primary" href={project.sourceCode} target="_blank" rel="noreferrer">Source code <FiGithub /></a> : <span className="button-primary button-disabled" aria-label="Source code is not public">Source unavailable</span>}
          </div>
        </div>

        {project.videoUrl && <section className="project-video-panel detail-panel project-video-featured">
          <span className="eyebrow">Project walkthrough</span>
          <h2>See the product in motion</h2>
          <div className="project-video-frame">
            {isEmbeddedVideo(project.videoUrl) ? <iframe src={project.videoUrl} title={`${project.title} walkthrough`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <video controls preload="metadata" playsInline src={project.videoUrl} />}
          </div>
        </section>}

        <div className="project-detail-grid">
          <article className="detail-panel">
            <span className="eyebrow">Overview</span>
            <h2>Project overview</h2>
            <p>{project.overview}</p>
          </article>

          <article className="detail-panel">
            <span className="eyebrow">Problem</span>
            <h2>Challenge</h2>
            <p>{project.problem}</p>
          </article>

          <article className="detail-panel">
            <span className="eyebrow">Solution</span>
            <h2>Approach</h2>
            <p>{project.solution}</p>
          </article>

          <article className="detail-panel">
            <span className="eyebrow">Features</span>
            <h2>Main features</h2>
            <ul className="check-list">
              {project.features.map((feature) => (
                <li key={feature}><FiArrowUpRight /> {feature}</li>
              ))}
            </ul>
          </article>
        </div>

        <section className="project-before-after detail-panel">
          <span className="eyebrow">Before / After</span><h2>Drag to compare the transformation</h2>
          <div className="before-after-stage" style={{ '--reveal': `${reveal}%` }}>
            <div className="before-after-side before"><small>BEFORE</small><h3>Fragmented experience</h3><p>{project.problem}</p></div>
            <div className="before-after-side after"><small>AFTER</small><h3>Connected product system</h3><p>{project.solution}</p></div>
          </div>
          <label className="before-after-control"><span>Before</span><input type="range" min="15" max="85" value={reveal} onChange={(event) => setReveal(event.target.value)} aria-label="Reveal before and after comparison" /><span>After</span></label>
        </section>

        <div className="project-detail-rows">
          <div className="detail-panel">
            <span className="eyebrow">Technologies</span>
            <h3>Stack used</h3>
            <div className="tag-list">
              {project.technologies.map((technology) => (
                <span key={technology} className="tag-item">{technology}</span>
              ))}
            </div>
          </div>

          <div className="detail-panel">
            <span className="eyebrow">Challenges</span>
            <h3>Development challenges</h3>
            <ul className="bullet-list">
              {project.challenges.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>

          <div className="detail-panel">
            <span className="eyebrow">Resolution</span>
            <h3>Solution to those challenges</h3>
            <ul className="bullet-list">
              {project.challengeSolutions.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>

          <div className="detail-panel">
            <span className="eyebrow">Outcome</span>
            <h3>Learning outcome</h3>
            <p>{project.learningOutcome}</p>
          </div>
        </div>

        <div className="gallery-panel detail-panel">
          <span className="eyebrow">Gallery</span>
          <h3>Project image gallery</h3>
          <div className="project-gallery-grid">
            {project.videoUrl ? <VideoGallery videoUrl={project.videoUrl} labels={project.gallery} fallback={project.image} /> : project.gallery.map((item, index) => <div key={item} className="project-gallery-item"><div className="project-visual project-visual-large">{project.image}</div><span>{index + 1}. {item}</span></div>)}
          </div>
        </div>
      </section>
    </>
  )
}
