import { useEffect, useRef } from 'react'

export default function Modal({ open, onClose, label, children }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const previousFocus = document.activeElement
    closeRef.current?.focus()
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previousFocus?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="case-modal" role="dialog" aria-modal="true" aria-label={label}>
      <div className="case-modal-backdrop" onClick={onClose} />
      <div className="case-modal-dialog">
        <button ref={closeRef} className="case-modal-close" type="button" aria-label="Close dialog" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  )
}
