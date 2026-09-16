import { useEffect, useState } from 'react'

export const COLOR_THEMES = {
  blue: {
    label: 'Blue',
    accent: '#38bdf8',
    accentBright: '#00f2fe',
    accentGlow: 'rgba(0,242,254,0.30)',
    accentSubtle: 'rgba(0,242,254,0.10)',
    accentGradient: 'linear-gradient(135deg,#00f2fe,#4facfe)',
    hex: '#38bdf8',
  },
  purple: {
    label: 'Purple',
    accent: '#a855f7',
    accentBright: '#c084fc',
    accentGlow: 'rgba(168,85,247,0.30)',
    accentSubtle: 'rgba(168,85,247,0.10)',
    accentGradient: 'linear-gradient(135deg,#a855f7,#6366f1)',
    hex: '#a855f7',
  },
  orange: {
    label: 'Orange',
    accent: '#f97316',
    accentBright: '#fb923c',
    accentGlow: 'rgba(249,115,22,0.30)',
    accentSubtle: 'rgba(249,115,22,0.10)',
    accentGradient: 'linear-gradient(135deg,#f97316,#fbbf24)',
    hex: '#f97316',
  },
  rose: {
    label: 'Rose',
    accent: '#f43f5e',
    accentBright: '#fb7185',
    accentGlow: 'rgba(244,63,94,0.30)',
    accentSubtle: 'rgba(244,63,94,0.10)',
    accentGradient: 'linear-gradient(135deg,#f43f5e,#ec4899)',
    hex: '#f43f5e',
  },
  emerald: {
    label: 'Emerald',
    accent: '#10b981',
    accentBright: '#34d399',
    accentGlow: 'rgba(16,185,129,0.30)',
    accentSubtle: 'rgba(16,185,129,0.10)',
    accentGradient: 'linear-gradient(135deg,#10b981,#06b6d4)',
    hex: '#10b981',
  },
}

function applyColorTheme(colorKey) {
  const theme = COLOR_THEMES[colorKey] || COLOR_THEMES.blue
  const root = document.documentElement
  root.style.setProperty('--theme-accent', theme.accent)
  root.style.setProperty('--theme-accent-bright', theme.accentBright)
  root.style.setProperty('--theme-accent-glow', theme.accentGlow)
  root.style.setProperty('--theme-accent-subtle', theme.accentSubtle)
  root.style.setProperty('--theme-accent-gradient', theme.accentGradient)
  root.dataset.colorTheme = colorKey
}

export function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = window.localStorage.getItem('virexo-theme')
    return saved ? saved !== 'light' : true
  })

  const [colorTheme, setColorTheme] = useState(() => {
    return window.localStorage.getItem('virexo-color-theme') || 'blue'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    window.localStorage.setItem('virexo-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    applyColorTheme(colorTheme)
    window.localStorage.setItem('virexo-color-theme', colorTheme)
  }, [colorTheme])

  return [dark, setDark, colorTheme, setColorTheme]
}
