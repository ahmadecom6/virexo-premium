import { useMemo, useState } from 'react'
import { AuthContext } from './auth-context'
import { authStore } from '../utils/marketplaceStore'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStore.getSession())

  const login = (email, password) => {
    const account = authStore.getUsers().find((entry) => entry.email === email.trim().toLowerCase())
    if (!account || account.password !== authStore.hash(password)) return { ok: false, error: 'Incorrect email or password. Try the demo account.' }
    const session = { name: account.name, email: account.email }
    authStore.setSession(session)
    setUser(session)
    return { ok: true, session }
  }

  const register = (name, email, password) => {
    const users = authStore.getUsers()
    const normalizedEmail = email.trim().toLowerCase()
    if (users.some((entry) => entry.email === normalizedEmail)) return { ok: false, error: 'An account with this email already exists.' }
    const account = { name: name.trim(), email: normalizedEmail, password: authStore.hash(password) }
    authStore.saveUsers([...users, account])
    const session = { name: account.name, email: account.email }
    authStore.setSession(session)
    setUser(session)
    return { ok: true, session }
  }

  const logout = () => {
    authStore.clearSession()
    setUser(null)
  }

  const value = useMemo(() => ({ user, login, register, logout }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
