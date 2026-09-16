// Shared contract with the marketing site's floating accessibility panel (same localStorage key and dataset attributes).
const KEY = 'virexo-a11y'

export function readA11yPrefs() {
  try {
    return { textLevel: 0, contrast: false, motion: false, ...JSON.parse(window.localStorage.getItem(KEY) || '{}') }
  } catch {
    return { textLevel: 0, contrast: false, motion: false }
  }
}

export function applyA11yPrefs(prefs) {
  const root = document.documentElement
  root.dataset.textSize = prefs.textLevel ? String(prefs.textLevel) : ''
  root.dataset.contrast = prefs.contrast ? 'high' : ''
  root.dataset.motion = prefs.motion ? 'reduced' : ''
}

export function saveA11yPrefs(prefs) {
  window.localStorage.setItem(KEY, JSON.stringify(prefs))
}
