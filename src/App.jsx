import { useEffect, useState } from 'react'
import {
  createFavorite,
  deleteFavorite,
  getFavorites,
  mapFavorite,
} from './api/favorites'
import DiscoverPage from './pages/DiscoverPage'
import FavoritesPage from './pages/FavoritesPage'
import HomePage from './pages/HomePage'
import {
  fetchWeather,
  getWeatherBackground,
  WEATHER_BACKGROUNDS,
} from './utils/weather'

const SCREENS = [
  { id: 'weather', label: 'Weather' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'discover', label: 'Discover' },
]

function App() {
  const [screen, setScreen] = useState('weather')
  const [query, setQuery] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState([])
  const [favoritesLoading, setFavoritesLoading] = useState(true)
  const [favoritesError, setFavoritesError] = useState('')

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
      if (switchToWeather) setScreen('weather')
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

  const favorited = weather
    ? isFavorite(weather.city, weather.country)
    : false

  const backgroundImage = weather
    ? getWeatherBackground(weather.weatherCode)
    : WEATHER_BACKGROUNDS.Cloudy

  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-slate-950 bg-cover bg-center bg-no-repeat text-white transition-[background-image] duration-700"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-slate-950/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 px-4 py-6 pb-28 sm:px-6 lg:py-8">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.2em] text-white/50 uppercase">
              Weather Discovery
            </p>
            <h1 className="text-xl font-semibold sm:text-2xl">
              {screen === 'weather' && 'Hourly forecast'}
              {screen === 'favorites' && 'Favorite cities'}
              {screen === 'discover' && 'Discover more'}
            </h1>
          </div>
          <div className="flex rounded-full border border-white/20 bg-black/25 p-1 backdrop-blur-xl">
            {SCREENS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setScreen(item.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                  screen === item.id
                    ? 'bg-[#f0c35a] font-semibold text-[#1a1a1a]'
                    : 'text-white/75 hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {favoritesError ? (
          <p className="rounded-2xl border border-amber-300/30 bg-amber-500/15 px-4 py-3 text-sm text-amber-100">
            {favoritesError}
          </p>
        ) : null}

        {screen === 'weather' ? (
          <HomePage
            query={query}
            setQuery={setQuery}
            weather={weather}
            loading={loading}
            error={error}
            onSearch={handleSearch}
            favorited={favorited}
            onToggleFavorite={toggleFavorite}
          />
        ) : null}

        {screen === 'favorites' ? (
          <FavoritesPage
            favorites={favorites}
            loading={loading || favoritesLoading}
            onOpenCity={loadCity}
            onRemoveFavorite={removeFavorite}
            onGoHome={() => setScreen('weather')}
          />
        ) : null}

        {screen === 'discover' ? (
          <DiscoverPage loading={loading} onOpenCity={loadCity} />
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/50 px-4 py-3 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-6xl justify-around">
          {SCREENS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setScreen(item.id)}
              className={`text-sm ${
                screen === item.id
                  ? 'font-semibold text-[#f0c35a]'
                  : 'text-white/70'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}

export default App
