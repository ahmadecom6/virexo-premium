// Ultra-lightweight Web Audio API synthesizer for cyber micro-interactions.
// Zero external files, zero latency, runs offline.

let audioContext = null

function getContext() {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) audioContext = new AudioContextClass()
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {})
  }
  return audioContext
}

const MUTE_KEY = 'virexo-audio-muted'

export const soundEngine = {
  isMuted: () => {
    if (typeof window === 'undefined') return true
    return window.localStorage.getItem(MUTE_KEY) === 'true'
  },

  toggleMute: () => {
    if (typeof window === 'undefined') return true
    const current = soundEngine.isMuted()
    window.localStorage.setItem(MUTE_KEY, String(!current))
    return !current
  },

  playClick: () => {
    if (soundEngine.isMuted()) return
    const ctx = getContext()
    if (!ctx) return
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04)
      gain.gain.setValueAtTime(0.04, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.045)
    } catch {
      // Ignored
    }
  },

  playSuccess: () => {
    if (soundEngine.isMuted()) return
    const ctx = getContext()
    if (!ctx) return
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.06)
        gain.gain.setValueAtTime(0.05, ctx.currentTime + index * 0.06)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.06 + 0.22)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + index * 0.06)
        osc.stop(ctx.currentTime + index * 0.06 + 0.23)
      })
    } catch {
      // Ignored
    }
  },

  playScan: () => {
    if (soundEngine.isMuted()) return
    const ctx = getContext()
    if (!ctx) return
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(260, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.35)
      gain.gain.setValueAtTime(0.03, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.36)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.38)
    } catch {
      // Ignored
    }
  },

  playKudos: () => {
    if (soundEngine.isMuted()) return
    const ctx = getContext()
    if (!ctx) return
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12)
      gain.gain.setValueAtTime(0.06, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch {
      // Ignored
    }
  },
}
