import { apiUrl } from './config'

async function request(path, options = {}) {
  const response = await fetch(apiUrl(`/api${path}`), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(
      'API unavailable. Deploy the backend and set VITE_API_URL on Vercel.',
    )
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data
}

export async function getFavorites() {
  const data = await request('/favorites')
  if (!Array.isArray(data)) {
    throw new Error(
      'API unavailable. Deploy the backend and set VITE_API_URL on Vercel.',
    )
  }
  return data
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

export function getHealth() {
  return request('/health')
}

export function mapFavorite(doc) {
  return {
    id: doc._id ?? doc.id,
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
