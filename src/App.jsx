import { useState } from 'react'

const WMO_WEATHER_CODES = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
}

function getWeatherDescription(code) {
  return WMO_WEATHER_CODES[code] ?? 'Unknown conditions'
}

const WEATHER_BACKGROUNDS = {
  Clear:
    'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=1920&q=80',
  Cloudy:
    'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80',
  Rainy:
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1920&q=80',
  Snowy:
    'https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=1920&q=80',
}

function getWeatherBackground(weatherCode) {
  if ([0, 1].includes(weatherCode)) {
    return WEATHER_BACKGROUNDS.Clear
  }

  if ([2, 3, 45, 48].includes(weatherCode)) {
    return WEATHER_BACKGROUNDS.Cloudy
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return WEATHER_BACKGROUNDS.Snowy
  }

  if (
    (weatherCode >= 51 && weatherCode <= 67) ||
    [80, 81, 82, 95, 96, 99].includes(weatherCode)
  ) {
    return WEATHER_BACKGROUNDS.Rainy
  }

  return WEATHER_BACKGROUNDS.Cloudy
}

function getCurrentRainProbability(hourly) {
  if (!hourly?.time?.length || !hourly?.precipitation_probability) {
    return null
  }

  const now = Date.now()
  let closestIndex = 0
  let smallestDiff = Infinity

  hourly.time.forEach((time, index) => {
    const diff = Math.abs(new Date(time).getTime() - now)
    if (diff < smallestDiff) {
      smallestDiff = diff
      closestIndex = index
    }
  })

  return hourly.precipitation_probability[closestIndex] ?? null
}

async function fetchWeather(city) {
  const geocodeUrl = new URL('https://geocoding-api.open-meteo.com/v1/search')
  geocodeUrl.searchParams.set('name', city)
  geocodeUrl.searchParams.set('count', '1')
  geocodeUrl.searchParams.set('language', 'en')
  geocodeUrl.searchParams.set('format', 'json')

  const geocodeResponse = await fetch(geocodeUrl)
  if (!geocodeResponse.ok) {
    throw new Error('Failed to look up city coordinates.')
  }

  const geocodeData = await geocodeResponse.json()
  const location = geocodeData.results?.[0]

  if (!location) {
    throw new Error(`No results found for "${city}".`)
  }

  const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast')
  forecastUrl.searchParams.set('latitude', String(location.latitude))
  forecastUrl.searchParams.set('longitude', String(location.longitude))
  forecastUrl.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
  )
  forecastUrl.searchParams.set('hourly', 'precipitation_probability')
  forecastUrl.searchParams.set('forecast_days', '1')
  forecastUrl.searchParams.set('timezone', 'auto')

  const forecastResponse = await fetch(forecastUrl)
  if (!forecastResponse.ok) {
    throw new Error('Failed to fetch weather forecast.')
  }

  const forecastData = await forecastResponse.json()
  const { current, hourly } = forecastData

  return {
    city: location.name,
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude,
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    rainProbability: getCurrentRainProbability(hourly),
    weatherCode: current.weather_code,
    condition: getWeatherDescription(current.weather_code),
    observedAt: current.time,
  }
}

function App() {
  const [query, setQuery] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(event) {
    event.preventDefault()

    const city = query.trim()
    if (!city) {
      setError('Enter a city name to search.')
      setWeather(null)
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await fetchWeather(city)
      setWeather(result)
    } catch (err) {
      setWeather(null)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const backgroundImage = weather
    ? getWeatherBackground(weather.weatherCode)
    : WEATHER_BACKGROUNDS.Cloudy

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat text-white transition-[background-image] duration-700"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-slate-950/55" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-8 px-4 py-10">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight drop-shadow-sm">
            Weather Discovery Dashboard
          </h1>
          <p className="text-white/75">
            Search any city for live conditions via Open-Meteo.
          </p>
        </header>

        <form
          onSubmit={handleSearch}
          className="flex gap-2 rounded-2xl border border-white/20 bg-white/10 p-2 shadow-xl backdrop-blur-xl"
        >
          <label htmlFor="city-search" className="sr-only">
            City search
          </label>
          <input
            id="city-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search city (e.g. London)"
            className="flex-1 rounded-xl border-0 bg-transparent px-4 py-2.5 text-white placeholder:text-white/55 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-white/90 px-4 py-2.5 font-medium text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>

        {error ? (
          <p className="rounded-2xl border border-rose-300/30 bg-rose-500/20 px-4 py-3 text-rose-100 shadow-xl backdrop-blur-xl">
            {error}
          </p>
        ) : null}

        {weather ? (
          <section className="space-y-6 rounded-3xl border border-white/25 bg-white/15 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
            <div>
              <h2 className="text-3xl font-semibold drop-shadow-sm">
                {weather.city}
                {weather.country ? `, ${weather.country}` : ''}
              </h2>
              <p className="mt-1 text-white/80">{weather.condition}</p>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <dt className="text-white/70">Temperature</dt>
                <dd className="mt-1 text-2xl font-medium">{weather.temperature}°C</dd>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <dt className="text-white/70">Humidity</dt>
                <dd className="mt-1 text-2xl font-medium">{weather.humidity}%</dd>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <dt className="text-white/70">Wind speed</dt>
                <dd className="mt-1 text-2xl font-medium">{weather.windSpeed} km/h</dd>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <dt className="text-white/70">Rain probability</dt>
                <dd className="mt-1 text-2xl font-medium">
                  {weather.rainProbability == null
                    ? 'N/A'
                    : `${weather.rainProbability}%`}
                </dd>
              </div>
            </dl>
          </section>
        ) : null}
      </div>
    </main>
  )
}

export default App
