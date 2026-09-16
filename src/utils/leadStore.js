const KEY = 'virexo-leads-v1'

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export const leadStore = {
  getAll: read,
  add(type, payload) {
    const lead = { id: `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`, type, status: 'New', createdAt: new Date().toISOString(), ...payload }
    localStorage.setItem(KEY, JSON.stringify([lead, ...read()].slice(0, 250)))
    window.dispatchEvent(new CustomEvent('virexo:lead-created', { detail: lead }))
    return lead
  },
  update(id, changes) {
    const next = read().map((lead) => lead.id === id ? { ...lead, ...changes } : lead)
    localStorage.setItem(KEY, JSON.stringify(next))
    window.dispatchEvent(new Event('virexo:leads-changed'))
  },
  subscribe(callback) {
    const listener = () => callback(read())
    window.addEventListener('virexo:lead-created', listener)
    window.addEventListener('virexo:leads-changed', listener)
    window.addEventListener('storage', listener)
    return () => { window.removeEventListener('virexo:lead-created', listener); window.removeEventListener('virexo:leads-changed', listener); window.removeEventListener('storage', listener) }
  },
}
