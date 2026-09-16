import { createContext, useContext } from 'react'
export const VexContext = createContext(null)
export const useVex = () => useContext(VexContext)
