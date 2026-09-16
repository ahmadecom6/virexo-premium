import { useEffect, useState } from 'react'
export default function useMotionPreference() {
  const read = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced'
  const [reduced, setReduced] = useState(read)
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(read())
    const observer = new MutationObserver(update)
    media.addEventListener('change', update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] })
    return () => { media.removeEventListener('change', update); observer.disconnect() }
  }, [])
  return reduced
}
