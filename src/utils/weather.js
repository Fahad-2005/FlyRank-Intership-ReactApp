export const WMO_WEATHER_CODES = {
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

export const WEATHER_BACKGROUNDS = {
  Clear:
    'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=1920&q=85',
  Cloudy:
    'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=85',
  Rainy:
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1920&q=85',
  Snowy:
    'https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=1920&q=85',
}

export const METRIC_TABS = [
  'Overview',
  'Precipitation',
  'Wind',
  'Humidity',
  'Cloud cover',
]

export function getWeatherDescription(code) {
  return WMO_WEATHER_CODES[code] ?? 'Unknown conditions'
}

export function getWeatherBackground(weatherCode) {
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

export function getWeatherCategory(code) {
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

export function formatHourLabel(date, { isNow = false } = {}) {
  if (isNow) return 'Now'

  return date
    .toLocaleTimeString([], { hour: 'numeric' })
    .replace(':00', '')
}

export function getClosestHourIndex(hours, now = Date.now()) {
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

export function formatDayLabel(date, index, todayIndex) {
  const dayNum = date.getDate()
  if (index === todayIndex) return `${dayNum} Today`
  if (index === todayIndex - 1) return `${dayNum} Yesterday`
  if (index === todayIndex + 1) return `${dayNum} Tomorrow`
  return `${dayNum} ${date.toLocaleDateString([], { weekday: 'short' })}`
}

export function formatClock(date) {
  return date
    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    .replace(' ', '')
}

export function buildSmoothPath(points) {
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

export function getMetricValue(hour, metric, useFeelsLike) {
  if (metric === 'Precipitation') return hour.rainProbability ?? 0
  if (metric === 'Wind') return hour.windSpeed ?? 0
  if (metric === 'Humidity') return hour.humidity ?? 0
  if (metric === 'Cloud cover') return hour.cloudCover ?? 0
  return useFeelsLike ? hour.feelsLike : hour.temperature
}

export function getMetricUnit(metric) {
  if (
    metric === 'Precipitation' ||
    metric === 'Humidity' ||
    metric === 'Cloud cover'
  ) {
    return '%'
  }
  if (metric === 'Wind') return ' km/h'
  return '°'
}

export async function fetchWeather(city) {
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

    return {
      dateKey: time,
      date,
      weatherCode: daily.weather_code[index],
      high: Math.round(daily.temperature_2m_max[index]),
      low: Math.round(daily.temperature_2m_min[index]),
      sunrise: daily.sunrise[index] ? new Date(daily.sunrise[index]) : null,
      sunset: daily.sunset[index] ? new Date(daily.sunset[index]) : null,
      maxWind: dayHours.length
        ? Math.max(...dayHours.map((hour) => hour.windSpeed ?? 0))
        : null,
      avgHumidity: dayHours.length
        ? Math.round(
            dayHours.reduce((sum, hour) => sum + (hour.humidity ?? 0), 0) /
              dayHours.length,
          )
        : null,
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
      dominantCode:
        dayHours[Math.floor(dayHours.length / 2)]?.weatherCode ??
        daily.weather_code[index],
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
