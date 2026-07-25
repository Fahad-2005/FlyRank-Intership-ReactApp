const API_BASE = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

export function getFavorites() {
  return request('/favorites')
}

export function createFavorite(payload) {
  return request('/favorites', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function deleteFavorite(id) {
  return request(`/favorites/${id}`, {
    method: 'DELETE',
  })
}

export function mapFavorite(doc) {
  return {
    id: doc._id,
    city: doc.city,
    country: doc.country,
    temperature: doc.temperature,
    condition: doc.condition,
    weatherCode: doc.weatherCode,
    humidity: doc.humidity,
    windSpeed: doc.windSpeed,
    rainProbability: doc.rainProbability,
  }
}
