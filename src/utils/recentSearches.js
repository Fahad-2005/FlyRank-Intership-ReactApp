const STORAGE_KEY = 'weather_recent_searches'
const MAX_ITEMS = 8

export function loadRecentSearches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveRecentSearch(city, country = '') {
  const label = country ? `${city}, ${country}` : city
  const entry = { city, country, label, searchedAt: new Date().toISOString() }
  const existing = loadRecentSearches().filter(
    (item) => !(item.city === city && item.country === country),
  )
  const updated = [entry, ...existing].slice(0, MAX_ITEMS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function clearRecentSearches() {
  localStorage.removeItem(STORAGE_KEY)
  return []
}
