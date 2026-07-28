import { getWeatherDescription } from './weather'

const STORM_CODES = [95, 96, 99]
const HEAVY_RAIN_CODES = [65, 67, 82]

export function getAlertsFromWeather(weather) {
  if (!weather?.hours?.length) return []

  const cityLabel = weather.country
    ? `${weather.city}, ${weather.country}`
    : weather.city
  const now = Date.now()
  const next24h = weather.hours.filter(
    (hour) =>
      hour.date.getTime() >= now &&
      hour.date.getTime() < now + 24 * 60 * 60 * 1000,
  )

  const alerts = []

  for (const hour of next24h) {
    if (STORM_CODES.includes(hour.weatherCode)) {
      alerts.push({
        id: `${cityLabel}-storm-${hour.time}`,
        type: 'storm',
        severity: 'high',
        city: cityLabel,
        time: hour.date,
        message: `Thunderstorm — ${getWeatherDescription(hour.weatherCode)}`,
      })
    } else if (HEAVY_RAIN_CODES.includes(hour.weatherCode)) {
      alerts.push({
        id: `${cityLabel}-heavy-${hour.time}`,
        type: 'rain',
        severity: 'high',
        city: cityLabel,
        time: hour.date,
        message: `Heavy rain — ${getWeatherDescription(hour.weatherCode)}`,
      })
    } else if ((hour.rainProbability ?? 0) >= 70) {
      alerts.push({
        id: `${cityLabel}-rain-${hour.time}`,
        type: 'rain',
        severity: 'medium',
        city: cityLabel,
        time: hour.date,
        message: `${hour.rainProbability}% chance of rain`,
      })
    }
  }

  return alerts.slice(0, 8)
}
