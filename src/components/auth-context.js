import { createContext } from 'react'

export const AuthContext = createContext({ user: null, login: () => ({ ok: false }), register: () => ({ ok: false }), logout: () => {} })
