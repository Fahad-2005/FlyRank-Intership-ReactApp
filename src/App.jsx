import { useMemo, useState } from 'react'

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

const WEATHER_BACKGROUNDS = {
  Clear:
    'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=1920&q=85',
  Cloudy:
    'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=85',
  Rainy:
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1920&q=85',
  Snowy:
    'https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=1920&q=85',
}

const SCREENS = [
  { id: 'weather', label: 'Weather' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'discover', label: 'Discover' },
]

const METRIC_TABS = [
  'Overview',
  'Precipitation',
  'Wind',
  'Humidity',
  'Cloud cover',
]

function getWeatherDescription(code) {
  return WMO_WEATHER_CODES[code] ?? 'Unknown conditions'
}

function getWeatherBackground(weatherCode) {
  if ([0, 1].includes(weatherCode)) return WEATHER_BACKGROUNDS.Clear
  if ([2, 3, 45, 48].includes(weatherCode)) return WEATHER_BACKGROUNDS.Cloudy
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

function getWeatherCategory(code) {
  if ([0, 1].includes(code)) return 'clear'
  if ([2, 3, 45, 48].includes(code)) return 'cloudy'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow'
  if (
    (code >= 51 && code <= 67) ||
    [80, 81, 82, 95, 96, 99].includes(code)
  ) {
    return 'rain'
  }
  return 'cloudy'
}

function formatHourLabel(date, { isNow = false } = {}) {
  if (isNow) return 'Now'

  return date
    .toLocaleTimeString([], { hour: 'numeric' })
    .replace(':00', '')
}

function getClosestHourIndex(hours, now = Date.now()) {
  if (!hours.length) return 0

  let closestIndex = 0
  let smallestDiff = Infinity

  hours.forEach((hour, index) => {
    const diff = Math.abs(hour.date.getTime() - now)
    if (diff < smallestDiff) {
      smallestDiff = diff
      closestIndex = index
    }
  })

  return closestIndex
}

function formatDayLabel(date, index, todayIndex) {
  const dayNum = date.getDate()
  if (index === todayIndex) return `${dayNum} Today`
  if (index === todayIndex - 1) return `${dayNum} Yesterday`
  if (index === todayIndex + 1) return `${dayNum} Tomorrow`
  return `${dayNum} ${date.toLocaleDateString([], { weekday: 'short' })}`
}

function formatClock(date) {
  return date
    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    .replace(' ', '')
}

function buildSmoothPath(points) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i]
    const next = points[i + 1]
    const cx = (current.x + next.x) / 2
    path += ` C ${cx} ${current.y}, ${cx} ${next.y}, ${next.x} ${next.y}`
  }
  return path
}

function WeatherIcon({ code, className = 'h-8 w-8' }) {
  const category = getWeatherCategory(code)

  if (category === 'clear') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4.5" fill="#F5C542" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180
          const x1 = 12 + Math.cos(rad) * 7
          const y1 = 12 + Math.sin(rad) * 7
          const x2 = 12 + Math.cos(rad) * 10
          const y2 = 12 + Math.sin(rad) * 10
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#F5C542"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )
        })}
      </svg>
    )
  }

  if (category === 'rain') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
        <path
          d="M8 10a4 4 0 0 1 7.7-1.5A3.5 3.5 0 0 1 18 16H8.5A3.5 3.5 0 0 1 8 10Z"
          fill="#9DB4C8"
        />
        <path
          d="M9 17.5 8 20M12 17.5 11 20M15 17.5 14 20"
          stroke="#5BA4FF"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (category === 'snow') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
        <path
          d="M8 10a4 4 0 0 1 7.7-1.5A3.5 3.5 0 0 1 18 16H8.5A3.5 3.5 0 0 1 8 10Z"
          fill="#C9D7E8"
        />
        <circle cx="9" cy="18.5" r="1" fill="#E8F1FF" />
        <circle cx="12" cy="19.5" r="1" fill="#E8F1FF" />
        <circle cx="15" cy="18.5" r="1" fill="#E8F1FF" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M7.5 15.5a4 4 0 0 1 .4-7.9A5 5 0 0 1 17 9.5a3.5 3.5 0 0 1 .2 7H7.5Z"
        fill="#A8B8C8"
      />
    </svg>
  )
}

function DropIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="#7EB6FF" aria-hidden>
      <path d="M8 1.5C8 1.5 3.5 7 3.5 10a4.5 4.5 0 1 0 9 0C12.5 7 8 1.5 8 1.5Z" />
    </svg>
  )
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
    'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature',
  )
  forecastUrl.searchParams.set(
    'hourly',
    [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation_probability',
      'weather_code',
      'wind_speed_10m',
      'cloud_cover',
    ].join(','),
  )
  forecastUrl.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
  )
  forecastUrl.searchParams.set('forecast_days', '7')
  forecastUrl.searchParams.set('timezone', 'auto')

  const forecastResponse = await fetch(forecastUrl)
  if (!forecastResponse.ok) {
    throw new Error('Failed to fetch weather forecast.')
  }

  const forecastData = await forecastResponse.json()
  const { current, hourly, daily } = forecastData
  const now = Date.now()

  const hours = hourly.time.map((time, index) => ({
    time,
    date: new Date(time),
    temperature: hourly.temperature_2m[index],
    feelsLike: hourly.apparent_temperature[index],
    humidity: hourly.relative_humidity_2m[index],
    rainProbability: hourly.precipitation_probability[index],
    weatherCode: hourly.weather_code[index],
    windSpeed: hourly.wind_speed_10m[index],
    cloudCover: hourly.cloud_cover[index],
  }))

  let closestHourIndex = 0
  let smallestDiff = Infinity
  hours.forEach((hour, index) => {
    const diff = Math.abs(hour.date.getTime() - now)
    if (diff < smallestDiff) {
      smallestDiff = diff
      closestHourIndex = index
    }
  })

  const days = daily.time.map((time, index) => {
    const date = new Date(`${time}T12:00:00`)
    const dayHours = hours.filter(
      (hour) => hour.date.toDateString() === date.toDateString(),
    )
    const dominantCode =
      dayHours[Math.floor(dayHours.length / 2)]?.weatherCode ??
      daily.weather_code[index]

    return {
      dateKey: time,
      date,
      weatherCode: daily.weather_code[index],
      high: Math.round(daily.temperature_2m_max[index]),
      low: Math.round(daily.temperature_2m_min[index]),
      sunrise: daily.sunrise[index] ? new Date(daily.sunrise[index]) : null,
      sunset: daily.sunset[index] ? new Date(daily.sunset[index]) : null,
      hours: dayHours,
      previewCodes: [
        ...new Set(dayHours.map((hour) => getWeatherCategory(hour.weatherCode))),
      ]
        .slice(0, 2)
        .map((category) => {
          if (category === 'clear') return 0
          if (category === 'rain') return 61
          if (category === 'snow') return 71
          return 3
        }),
      dominantCode,
    }
  })

  const todayKey = new Date().toISOString().slice(0, 10)
  const todayIndex = Math.max(
    0,
    days.findIndex((day) => day.dateKey === todayKey),
  )

  return {
    city: location.name,
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude,
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    rainProbability: hours[closestHourIndex]?.rainProbability ?? null,
    weatherCode: current.weather_code,
    condition: getWeatherDescription(current.weather_code),
    observedAt: current.time,
    hours,
    days,
    todayIndex,
    currentHourIndex: closestHourIndex,
  }
}

function getMetricValue(hour, metric, useFeelsLike) {
  if (metric === 'Precipitation') return hour.rainProbability ?? 0
  if (metric === 'Wind') return hour.windSpeed ?? 0
  if (metric === 'Humidity') return hour.humidity ?? 0
  if (metric === 'Cloud cover') return hour.cloudCover ?? 0
  return useFeelsLike ? hour.feelsLike : hour.temperature
}

function getMetricUnit(metric) {
  if (metric === 'Precipitation' || metric === 'Humidity' || metric === 'Cloud cover') {
    return '%'
  }
  if (metric === 'Wind') return ' km/h'
  return '°'
}

function HourlyChart({
  hours,
  metric,
  useFeelsLike,
  selectedIndex,
  onSelect,
  sunrise,
  sunset,
}) {
  const width = 920
  const height = 280
  const pad = { top: 28, right: 24, bottom: 36, left: 44 }
  const chartW = width - pad.left - pad.right
  const chartH = height - pad.top - pad.bottom

  const values = hours.map((hour) => getMetricValue(hour, metric, useFeelsLike))
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const span = Math.max(maxVal - minVal, 1)
  const yMin = Math.floor(minVal - span * 0.15)
  const yMax = Math.ceil(maxVal + span * 0.2)

  const points = hours.map((hour, index) => {
    const x = pad.left + (index / Math.max(hours.length - 1, 1)) * chartW
    const y =
      pad.top +
      ((yMax - getMetricValue(hour, metric, useFeelsLike)) / (yMax - yMin || 1)) *
        chartH
    return { x, y, hour, index }
  })

  const linePath = buildSmoothPath(points)
  const areaPath = `${linePath} L ${points.at(-1).x} ${pad.top + chartH} L ${points[0].x} ${pad.top + chartH} Z`
  const selected = points[selectedIndex] ?? points[0]
  const rainStart = hours.findIndex((hour) => (hour.rainProbability ?? 0) >= 40)

  const yTicks = [yMin, Math.round((yMin + yMax) / 2), yMax]
  const labelStep = Math.max(1, Math.floor(hours.length / 8))
  const nowIndex = getClosestHourIndex(hours)

  function eventMarker(date, label) {
    if (!date || hours.length < 2) return null
    const start = hours[0].date.getTime()
    const end = hours.at(-1).date.getTime()
    if (date.getTime() < start || date.getTime() > end) return null
    const ratio = (date.getTime() - start) / (end - start || 1)
    const x = pad.left + ratio * chartW
    return { x, label: `${label} ${formatClock(date)}` }
  }

  const sunsetMarker = eventMarker(sunset, 'Sunset')
  const sunriseMarker = eventMarker(sunrise, 'Sunrise')

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full select-none"
        role="img"
        aria-label={`${metric} chart`}
      >
        <defs>
          <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4A574" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#D4A574" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="rainFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4B7CB8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4B7CB8" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y =
            pad.top + ((yMax - tick) / (yMax - yMin || 1)) * chartH
          return (
            <g key={tick}>
              <line
                x1={pad.left}
                y1={y}
                x2={width - pad.right}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
              />
              <text
                x={pad.left - 10}
                y={y + 4}
                textAnchor="end"
                fill="rgba(255,255,255,0.45)"
                fontSize="11"
              >
                {tick}
                {metric === 'Overview' ? '°' : ''}
              </text>
            </g>
          )
        })}

        {rainStart >= 0 ? (
          <rect
            x={points[rainStart].x}
            y={pad.top}
            width={points.at(-1).x - points[rainStart].x}
            height={chartH}
            fill="url(#rainFill)"
          />
        ) : null}

        {rainStart >= 0
          ? Array.from({ length: 18 }).map((_, i) => {
              const x =
                points[rainStart].x +
                ((points.at(-1).x - points[rainStart].x) * (i + 0.5)) / 18
              return (
                <line
                  key={i}
                  x1={x}
                  y1={pad.top + 20}
                  x2={x - 4}
                  y2={pad.top + chartH - 10}
                  stroke="rgba(180,210,255,0.28)"
                  strokeWidth="1.2"
                />
              )
            })
          : null}

        <path d={areaPath} fill="url(#tempFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#E8C9A0"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {[sunsetMarker, sunriseMarker].filter(Boolean).map((marker) => (
          <g key={marker.label}>
            <circle cx={marker.x} cy={pad.top + chartH * 0.55} r="7" fill="#F0C35A" />
            <text
              x={marker.x}
              y={pad.top + chartH * 0.55 + 22}
              textAnchor="middle"
              fill="rgba(255,255,255,0.7)"
              fontSize="10"
            >
              {marker.label}
            </text>
          </g>
        ))}

        <line
          x1={selected.x}
          y1={pad.top}
          x2={selected.x}
          y2={pad.top + chartH}
          stroke="rgba(255,255,255,0.55)"
          strokeDasharray="4 4"
        />
        <circle
          cx={selected.x}
          cy={selected.y}
          r="5"
          fill="#fff"
          stroke="#E8C9A0"
          strokeWidth="2"
        />

        {points.map((point, index) => (
          <rect
            key={point.hour.time}
            x={point.x - chartW / hours.length / 2}
            y={pad.top}
            width={chartW / hours.length}
            height={chartH}
            fill="transparent"
            className="cursor-pointer"
            onClick={() => onSelect(index)}
            onMouseEnter={() => onSelect(index)}
          />
        ))}

        {hours.map((hour, index) => {
          const showLabel =
            index === nowIndex ||
            index === hours.length - 1 ||
            index % labelStep === 0
          if (!showLabel) return null
          const x = points[index].x
          return (
            <g key={`label-${hour.time}`}>
              <foreignObject x={x - 18} y={2} width="36" height="24">
                <div className="flex justify-center">
                  <WeatherIcon code={hour.weatherCode} className="h-5 w-5" />
                </div>
              </foreignObject>
              <text
                x={x}
                y={height - 8}
                textAnchor="middle"
                fill="rgba(255,255,255,0.55)"
                fontSize="11"
              >
                {formatHourLabel(hour.date, { isNow: index === nowIndex })}
              </text>
            </g>
          )
        })}
      </svg>

      {selected ? (
        <div
          className="pointer-events-none absolute top-8 z-10 -translate-x-1/2 rounded-2xl border border-white/20 bg-black/45 px-3 py-2 shadow-2xl backdrop-blur-xl"
          style={{
            left: `${(selected.x / width) * 100}%`,
          }}
        >
          <div className="flex items-center gap-2 text-sm whitespace-nowrap">
            <span className="text-white/70">
              {formatHourLabel(selected.hour.date, {
                isNow: selected.index === nowIndex,
              })}
            </span>
            <WeatherIcon code={selected.hour.weatherCode} className="h-5 w-5" />
            <span className="font-semibold">
              {Math.round(getMetricValue(selected.hour, metric, useFeelsLike))}
              {getMetricUnit(metric).trim()}
            </span>
            <span className="flex items-center gap-1 text-[#7EB6FF]">
              <DropIcon />
              {selected.hour.rainProbability ?? 0}%
            </span>
          </div>
        </div>
      ) : null}

      <div className="mt-2 flex items-end gap-1 overflow-x-auto rounded-2xl bg-[#2f6fbf]/85 px-3 py-2">
        {hours.map((hour, index) => (
          <button
            key={`precip-${hour.time}`}
            type="button"
            onClick={() => onSelect(index)}
            className="flex min-w-[2.75rem] flex-1 flex-col items-center gap-1 text-[11px] text-white/95"
          >
            <DropIcon className="h-3 w-3" />
            <span>{hour.rainProbability ?? 0}%</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState('weather')
  const [query, setQuery] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [selectedHourIndex, setSelectedHourIndex] = useState(0)
  const [activeMetric, setActiveMetric] = useState('Overview')
  const [viewMode, setViewMode] = useState('Chart')
  const [useFeelsLike, setUseFeelsLike] = useState(false)
  const [favorites, setFavorites] = useState([])

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
      setSelectedDayIndex(result.todayIndex)
      const todayHours = result.days[result.todayIndex]?.hours ?? []
      const nowIndex = Math.max(
        0,
        todayHours.findIndex(
          (hour) => hour.time === result.hours[result.currentHourIndex]?.time,
        ),
      )
      setSelectedHourIndex(nowIndex === -1 ? 0 : nowIndex)
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
      (item) => item.city === city && item.country === country,
    )
  }

  function toggleFavorite() {
    if (!weather) return

    const exists = isFavorite(weather.city, weather.country)
    if (exists) {
      setFavorites((prev) =>
        prev.filter(
          (item) =>
            !(item.city === weather.city && item.country === weather.country),
        ),
      )
      return
    }

    setFavorites((prev) => [
      {
        id: `${weather.city}-${weather.country}-${Date.now()}`,
        city: weather.city,
        country: weather.country,
        temperature: weather.temperature,
        condition: weather.condition,
        weatherCode: weather.weatherCode,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        rainProbability: weather.rainProbability,
      },
      ...prev,
    ])
  }

  function removeFavorite(id) {
    setFavorites((prev) => prev.filter((item) => item.id !== id))
  }

  const selectedDay = weather?.days?.[selectedDayIndex]
  const dayHours = selectedDay?.hours ?? []

  const chartHours = useMemo(() => {
    if (dayHours.length === 0) return []
    const now = Date.now()
    const start = dayHours.findIndex(
      (hour) => hour.date.getTime() >= now - 2 * 60 * 60 * 1000,
    )
    const from = selectedDayIndex === weather?.todayIndex ? Math.max(0, start) : 0
    return dayHours.slice(from, from + 18)
  }, [dayHours, selectedDayIndex, weather?.todayIndex])

  const safeHourIndex = Math.min(
    selectedHourIndex,
    Math.max(chartHours.length - 1, 0),
  )
  const nowHourIndex = getClosestHourIndex(chartHours)
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

        {screen === 'weather' ? (
          <>
            <form
              onSubmit={handleSearch}
              className="flex gap-2 rounded-2xl border border-white/25 bg-white/10 p-2 shadow-xl backdrop-blur-xl"
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

            {!weather ? (
              <section className="rounded-3xl border border-white/25 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-2xl">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Search a city
                </h2>
                <p className="mt-2 text-white/70">
                  Live hourly chart, day cards, and weather-matched backgrounds.
                </p>
              </section>
            ) : (
              <section className="space-y-4 rounded-[28px] border border-white/20 bg-black/35 p-4 shadow-2xl backdrop-blur-2xl sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <p className="text-sm text-white/55">
                        {weather.city}
                        {weather.country ? `, ${weather.country}` : ''}
                      </p>
                      <h2 className="text-3xl font-semibold tracking-tight">
                        Hourly
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={toggleFavorite}
                      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                        favorited
                          ? 'border-[#f0c35a]/60 bg-[#f0c35a]/20 text-[#f0c35a]'
                          : 'border-white/20 bg-white/5 text-white/85 hover:bg-white/10'
                      }`}
                    >
                      {favorited ? '★ Saved' : '☆ Save favorite'}
                    </button>
                    <div className="flex flex-wrap gap-2">
                      {METRIC_TABS.map((tab) => {
                        const active = activeMetric === tab
                        return (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveMetric(tab)}
                            className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                              active
                                ? 'bg-[#f0c35a] font-semibold text-[#1a1a1a]'
                                : 'bg-white/5 text-white/80 hover:bg-white/10'
                            }`}
                          >
                            {tab}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex overflow-hidden rounded-full border border-white/10 bg-white/5 p-1">
                    {['Chart', 'List'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setViewMode(mode)}
                        className={`rounded-full px-4 py-1.5 text-sm transition ${
                          viewMode === mode
                            ? 'bg-white/15 text-white'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1">
                  {weather.days.map((day, index) => {
                    const active = index === selectedDayIndex
                    const label = formatDayLabel(
                      day.date,
                      index,
                      weather.todayIndex,
                    )
                    return (
                      <button
                        key={day.dateKey}
                        type="button"
                        onClick={() => {
                          setSelectedDayIndex(index)
                          setSelectedHourIndex(0)
                        }}
                        className={`min-w-[5.5rem] shrink-0 rounded-2xl border px-3 py-3 text-left transition ${
                          active
                            ? 'border-[#f0c35a]/55 bg-white/18 shadow-[0_0_24px_rgba(240,195,90,0.22)] backdrop-blur-md'
                            : 'border-white/10 bg-black/25 backdrop-blur-md hover:bg-white/10'
                        }`}
                      >
                        <p className="text-xs text-white/55">{label}</p>
                        <div className="mt-2 flex items-center gap-1">
                          {(active && day.previewCodes.length > 1
                            ? day.previewCodes
                            : [day.weatherCode]
                          ).map((code, iconIndex) => (
                            <WeatherIcon
                              key={`${day.dateKey}-${code}-${iconIndex}`}
                              code={code}
                              className="h-7 w-7"
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-sm font-medium">
                          {day.high}°/{day.low}°
                        </p>
                      </button>
                    )
                  })}
                </div>

                <div className="rounded-[24px] border border-white/15 bg-black/30 p-4 backdrop-blur-xl sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold">{activeMetric}</h3>
                    {activeMetric === 'Overview' ? (
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
                        <span>Feels like</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={useFeelsLike}
                          onClick={() => setUseFeelsLike((value) => !value)}
                          className={`relative h-6 w-11 rounded-full transition ${
                            useFeelsLike ? 'bg-[#f0c35a]' : 'bg-white/20'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${
                              useFeelsLike ? 'translate-x-5' : ''
                            }`}
                          />
                        </button>
                      </label>
                    ) : null}
                  </div>

                  {chartHours.length === 0 ? (
                    <p className="py-10 text-center text-white/60">
                      No hourly data for this day.
                    </p>
                  ) : viewMode === 'Chart' ? (
                    <HourlyChart
                      hours={chartHours}
                      metric={activeMetric}
                      useFeelsLike={useFeelsLike}
                      selectedIndex={safeHourIndex}
                      onSelect={setSelectedHourIndex}
                      sunrise={selectedDay?.sunrise}
                      sunset={selectedDay?.sunset}
                    />
                  ) : (
                    <div className="max-h-[22rem] space-y-2 overflow-y-auto">
                      {chartHours.map((hour, index) => (
                        <button
                          key={hour.time}
                          type="button"
                          onClick={() => setSelectedHourIndex(index)}
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                            index === safeHourIndex
                              ? 'border-[#f0c35a]/40 bg-white/10'
                              : 'border-white/5 bg-white/5 hover:bg-white/8'
                          }`}
                        >
                          <span className="w-16 text-white/70">
                            {formatHourLabel(hour.date, {
                              isNow: index === nowHourIndex,
                            })}
                          </span>
                          <WeatherIcon
                            code={hour.weatherCode}
                            className="h-7 w-7"
                          />
                          <span className="font-medium">
                            {Math.round(
                              getMetricValue(hour, activeMetric, useFeelsLike),
                            )}
                            {getMetricUnit(activeMetric)}
                          </span>
                          <span className="flex items-center gap-1 text-[#7EB6FF]">
                            <DropIcon />
                            {hour.rainProbability ?? 0}%
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-white/55">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#f0c35a]" />
                      {activeMetric === 'Overview' ? 'Temperature' : activeMetric}
                    </div>
                    <div className="flex items-center gap-2">
                      <span aria-hidden>☾</span>
                      <span>
                        Condition:{' '}
                        {getWeatherDescription(selectedDay?.weatherCode)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        ) : null}

        {screen === 'favorites' ? (
          <section className="space-y-4 rounded-[28px] border border-white/20 bg-black/35 p-5 shadow-2xl backdrop-blur-2xl">
            <div>
              <h2 className="text-2xl font-semibold">Your favorite cities</h2>
              <p className="mt-1 text-sm text-white/65">
                Saved in this session for now. MongoDB sync can come later.
              </p>
            </div>

            {favorites.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-10 text-center">
                <p className="text-white/80">No favorites yet.</p>
                <p className="mt-1 text-sm text-white/55">
                  Open Weather, search a city, then tap “Save favorite”.
                </p>
                <button
                  type="button"
                  onClick={() => setScreen('weather')}
                  className="mt-4 rounded-full bg-[#f0c35a] px-4 py-2 text-sm font-semibold text-[#1a1a1a]"
                >
                  Go to Weather
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {favorites.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
                    style={{
                      backgroundImage: `linear-gradient(rgba(10,14,24,0.55), rgba(10,14,24,0.72)), url(${getWeatherBackground(item.weatherCode)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {item.city}
                          {item.country ? `, ${item.country}` : ''}
                        </h3>
                        <p className="text-sm text-white/70">{item.condition}</p>
                      </div>
                      <WeatherIcon code={item.weatherCode} className="h-9 w-9" />
                    </div>
                    <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <dt className="text-white/55">Temp</dt>
                        <dd className="font-medium">{item.temperature}°C</dd>
                      </div>
                      <div>
                        <dt className="text-white/55">Humidity</dt>
                        <dd className="font-medium">{item.humidity}%</dd>
                      </div>
                      <div>
                        <dt className="text-white/55">Rain</dt>
                        <dd className="font-medium">
                          {item.rainProbability ?? 0}%
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => loadCity(item.city)}
                        className="flex-1 rounded-xl bg-white/90 px-3 py-2 text-sm font-medium text-slate-900"
                      >
                        Open forecast
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFavorite(item.id)}
                        className="rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-sm text-white/80"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {screen === 'discover' ? (
          <section className="space-y-4 rounded-[28px] border border-white/20 bg-black/35 p-5 shadow-2xl backdrop-blur-2xl">
            <div>
              <h2 className="text-2xl font-semibold">What we can add next</h2>
              <p className="mt-1 text-sm text-white/65">
                Ideas for more screens before MongoDB. Pick any later and we’ll
                build it.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: 'Compare cities',
                  body: 'Side-by-side temps and rain chance for 2–3 favorites.',
                },
                {
                  title: '7-day details',
                  body: 'Full daily page with sunrise, sunset, and wind summary.',
                },
                {
                  title: 'Alerts',
                  body: 'Highlight storm / heavy rain hours for saved cities.',
                },
                {
                  title: 'Unit settings',
                  body: 'Toggle °C/°F and km/h vs mph in one place.',
                },
                {
                  title: 'Recent searches',
                  body: 'Quick reopen of the last cities you looked up.',
                },
                {
                  title: 'Mongo sync',
                  body: 'Persist favorites & history across devices later.',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
                >
                  <h3 className="font-semibold">{card.title}</h3>
                  <p className="mt-1 text-sm text-white/65">{card.body}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <p className="text-sm text-white/70">Try a popular city quickly:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Lahore', 'London', 'Tokyo', 'Dubai', 'New York'].map(
                  (city) => (
                    <button
                      key={city}
                      type="button"
                      disabled={loading}
                      onClick={() => loadCity(city)}
                      className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-sm hover:bg-white/10"
                    >
                      {city}
                    </button>
                  ),
                )}
              </div>
            </div>
          </section>
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
                screen === item.id ? 'font-semibold text-[#f0c35a]' : 'text-white/70'
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
