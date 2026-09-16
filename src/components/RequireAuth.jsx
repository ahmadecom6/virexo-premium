import { useEffect, useRef } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

export default function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  const notify = useToast()
  const notified = useRef(false)

  useEffect(() => {
    if (!user && !notified.current) {
      notified.current = true
      notify('Please sign in to continue.')
    }
  }, [user, notify])

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children ?? <Outlet />
}
