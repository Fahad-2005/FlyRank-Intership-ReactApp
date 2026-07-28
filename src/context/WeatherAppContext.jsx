import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createFavorite,
  deleteFavorite,
  getFavorites,
  mapFavorite,
} from '../api/favorites'
import {
  clearRecentSearches,
  loadRecentSearches,
  saveRecentSearch,
} from '../utils/recentSearches'
import {
  fetchWeather,
  getWeatherBackground,
  WEATHER_BACKGROUNDS,
} from '../utils/weather'

const WeatherAppContext = createContext(null)

export function WeatherAppProvider({ children }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState([])
  const [favoritesLoading, setFavoritesLoading] = useState(true)
  const [favoritesError, setFavoritesError] = useState('')
  const [recentSearches, setRecentSearches] = useState(loadRecentSearches)

  useEffect(() => {
    let cancelled = false

    async function loadFavorites() {
      setFavoritesLoading(true)
      setFavoritesError('')
      try {
        const docs = await getFavorites()
        if (!cancelled) {
          setFavorites(docs.map(mapFavorite))
        }
      } catch (err) {
        if (!cancelled) {
          setFavoritesError(
            err instanceof Error
              ? err.message
              : 'Could not load favorites. Is the API running?',
          )
        }
      } finally {
        if (!cancelled) setFavoritesLoading(false)
      }
    }

    loadFavorites()
    return () => {
      cancelled = true
    }
  }, [])

  async function loadCity(cityName, { switchToWeather = true } = {}) {
    const city = cityName.trim()
    if (!city) {
      setError('Enter a city name to search.')
      return
    }

    setLoading(true)
    setError('')
    setQuery(city)

    try {
      const result = await fetchWeather(city)
      setWeather(result)
      setRecentSearches(saveRecentSearch(result.city, result.country || ''))
      if (switchToWeather) navigate('/')
    } catch (err) {
      setWeather(null)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(event) {
    event.preventDefault()
    await loadCity(query)
  }

  function isFavorite(city, country) {
    return favorites.some(
      (item) => item.city === city && item.country === (country || ''),
    )
  }

  async function toggleFavorite() {
    if (!weather) return

    const existing = favorites.find(
      (item) =>
        item.city === weather.city && item.country === (weather.country || ''),
    )

    setFavoritesError('')

    try {
      if (existing) {
        await deleteFavorite(existing.id)
        setFavorites((prev) => prev.filter((item) => item.id !== existing.id))
        return
      }

      const created = await createFavorite({
        city: weather.city,
        country: weather.country || '',
        temperature: weather.temperature,
        condition: weather.condition,
        weatherCode: weather.weatherCode,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        rainProbability: weather.rainProbability,
      })

      setFavorites((prev) => [mapFavorite(created), ...prev])
    } catch (err) {
      setFavoritesError(
        err instanceof Error ? err.message : 'Failed to update favorite',
      )
    }
  }

  async function removeFavorite(id) {
    setFavoritesError('')
    try {
      await deleteFavorite(id)
      setFavorites((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      setFavoritesError(
        err instanceof Error ? err.message : 'Failed to remove favorite',
      )
    }
  }

  function handleClearRecent() {
    setRecentSearches(clearRecentSearches())
  }

  const favorited = weather
    ? isFavorite(weather.city, weather.country)
    : false

  const backgroundImage = weather
    ? getWeatherBackground(weather.weatherCode)
    : WEATHER_BACKGROUNDS.Cloudy

  return (
    <WeatherAppContext.Provider
      value={{
        query,
        setQuery,
        weather,
        loading,
        error,
        favorites,
        favoritesLoading,
        favoritesError,
        recentSearches,
        favorited,
        backgroundImage,
        loadCity,
        handleSearch,
        toggleFavorite,
        removeFavorite,
        handleClearRecent,
      }}
    >
      {children}
    </WeatherAppContext.Provider>
  )
}

export function useWeatherApp() {
  const ctx = useContext(WeatherAppContext)
  if (!ctx) {
    throw new Error('useWeatherApp must be used within WeatherAppProvider')
  }
  return ctx
}
