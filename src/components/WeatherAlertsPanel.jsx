import { useEffect, useState } from 'react'
import { fetchWeather } from '../utils/weather'
import { getAlertsFromWeather } from '../utils/alerts'

function formatAlertTime(date) {
  return date.toLocaleString([], {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function WeatherAlertsPanel({ favorites }) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (favorites.length === 0) {
      setAlerts([])
      return
    }

    let cancelled = false

    async function loadAlerts() {
      setLoading(true)
      setError('')
      try {
        const weatherResults = await Promise.all(
          favorites.slice(0, 5).map((item) => fetchWeather(item.city)),
        )
        if (cancelled) return
        const allAlerts = weatherResults.flatMap(getAlertsFromWeather)
        setAlerts(allAlerts)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load alerts')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadAlerts()
    return () => {
      cancelled = true
    }
  }, [favorites])

  return (
    <section className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
      <h3 className="font-semibold">Weather alerts</h3>
      <p className="mt-1 text-sm text-white/65">
        Storm and heavy-rain warnings for your saved cities (next 24 hours).
      </p>

      {favorites.length === 0 ? (
        <p className="mt-4 text-sm text-white/55">
          Save favorite cities to see alerts here.
        </p>
      ) : loading ? (
        <p className="mt-4 text-sm text-white/55">Checking favorites…</p>
      ) : error ? (
        <p className="mt-4 text-sm text-rose-200">{error}</p>
      ) : alerts.length === 0 ? (
        <p className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          No storm or heavy-rain alerts in the next 24 hours.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className={`rounded-xl border px-4 py-3 text-sm ${
                alert.severity === 'high'
                  ? 'border-rose-400/30 bg-rose-500/15 text-rose-100'
                  : 'border-amber-400/30 bg-amber-500/15 text-amber-100'
              }`}
            >
              <p className="font-medium">{alert.city}</p>
              <p className="mt-0.5">{alert.message}</p>
              <p className="mt-1 text-xs opacity-75">
                {formatAlertTime(alert.time)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
