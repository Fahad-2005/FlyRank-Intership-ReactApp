import { useState } from 'react'
import { fetchWeather } from '../utils/weather'
import { formatSpeed, formatTemp } from '../utils/units'
import { useSettings } from '../context/SettingsContext'
import { WeatherIcon } from './WeatherIcon'

export default function CompareCitiesPanel({ favorites }) {
  const { tempUnit, speedUnit } = useSettings()
  const [selected, setSelected] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleCity(id) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  async function handleCompare() {
    if (selected.length < 2) {
      setError('Select at least 2 cities to compare.')
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      const cities = favorites.filter((item) => selected.includes(item.id))
      const weatherResults = await Promise.all(
        cities.map((item) => fetchWeather(item.city)),
      )
      setResults(weatherResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare cities')
    } finally {
      setLoading(false)
    }
  }

  if (favorites.length < 2) {
    return (
      <section className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
        <h3 className="font-semibold">Compare cities</h3>
        <p className="mt-2 text-sm text-white/65">
          Save at least 2 favorite cities to compare them side by side.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
      <h3 className="font-semibold">Compare cities</h3>
      <p className="mt-1 text-sm text-white/65">
        Pick 2–3 favorites and compare live conditions.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {favorites.map((item) => {
          const active = selected.includes(item.id)
          const disabled = !active && selected.length >= 3
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => toggleCity(item.id)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                active
                  ? 'border-[#f0c35a]/60 bg-[#f0c35a]/20 text-[#f0c35a]'
                  : 'border-white/20 bg-black/25 text-white/80 hover:bg-white/10 disabled:opacity-40'
              }`}
            >
              {item.city}
              {item.country ? `, ${item.country}` : ''}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        disabled={loading || selected.length < 2}
        onClick={handleCompare}
        className="mt-4 rounded-xl bg-white/90 px-4 py-2 text-sm font-medium text-slate-900 disabled:opacity-50"
      >
        {loading ? 'Comparing…' : 'Compare selected'}
      </button>

      {error ? (
        <p className="mt-3 text-sm text-rose-200">{error}</p>
      ) : null}

      {results.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Temp</th>
                <th className="px-4 py-3">Humidity</th>
                <th className="px-4 py-3">Wind</th>
                <th className="px-4 py-3">Rain</th>
                <th className="px-4 py-3">Condition</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item) => (
                <tr key={`${item.city}-${item.country}`} className="border-t border-white/10">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <WeatherIcon code={item.weatherCode} className="h-6 w-6" />
                      {item.city}
                      {item.country ? `, ${item.country}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatTemp(item.temperature, tempUnit)}</td>
                  <td className="px-4 py-3">{item.humidity}%</td>
                  <td className="px-4 py-3">{formatSpeed(item.windSpeed, speedUnit)}</td>
                  <td className="px-4 py-3">{item.rainProbability ?? 0}%</td>
                  <td className="px-4 py-3 text-white/70">{item.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
