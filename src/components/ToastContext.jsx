import { useMemo, useState } from 'react'
import { ToastContext } from './toast-context'

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 3600)
  }
  const value = useMemo(() => notify, [])
  return <ToastContext.Provider value={value}>{children}{toast && <div className="toast" role="status">{toast}</div>}</ToastContext.Provider>
}

