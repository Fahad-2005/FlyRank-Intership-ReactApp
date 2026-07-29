const STORAGE_KEY = 'weather_local_favorites'

export function loadLocalFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveLocalFavorites(favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  return favorites
}

export function addLocalFavorite(payload) {
  const current = loadLocalFavorites()
  const exists = current.some(
    (item) =>
      item.city === payload.city && item.country === (payload.country || ''),
  )
  if (exists) return current

  const next = [
    {
      id: `local-${payload.city}-${payload.country || ''}-${Date.now()}`,
      city: payload.city,
      country: payload.country || '',
      temperature: payload.temperature,
      condition: payload.condition,
      weatherCode: payload.weatherCode,
      humidity: payload.humidity,
      windSpeed: payload.windSpeed,
      rainProbability: payload.rainProbability,
    },
    ...current,
  ]
  return saveLocalFavorites(next)
}

export function removeLocalFavorite(id) {
  const next = loadLocalFavorites().filter((item) => item.id !== id)
  return saveLocalFavorites(next)
}
