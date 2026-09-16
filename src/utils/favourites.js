const KEY = 'virexo-favourites-v1'
export const getFavourites = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
export function toggleFavourite(id) {
  const current = getFavourites()
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('virexo:favourites'))
  return next
}
