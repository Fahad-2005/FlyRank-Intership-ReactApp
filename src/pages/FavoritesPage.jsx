import { Link } from 'react-router-dom'
import { WeatherIcon } from '../components/WeatherIcon'
import { useSettings } from '../context/SettingsContext'
import { formatTemp } from '../utils/units'
import { getWeatherBackground } from '../utils/weather'

export default function FavoritesPage({
  favorites,
  loading,
  onOpenCity,
  onRemoveFavorite,
}) {
  const { tempUnit } = useSettings()

  return (
    <section className="space-y-4 rounded-[28px] border border-white/20 bg-black/35 p-5 shadow-2xl backdrop-blur-2xl">
      <div>
        <h2 className="text-2xl font-semibold">Your favorite cities</h2>
        <p className="mt-1 text-sm text-white/65">
          Synced with MongoDB — favorites stay after refresh.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-10 text-center">
          <p className="text-white/80">No favorites yet.</p>
          <p className="mt-1 text-sm text-white/55">
            Open Weather, search a city, then tap “Save favorite”.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-full bg-[#f0c35a] px-4 py-2 text-sm font-semibold text-[#1a1a1a]"
          >
            Go to Weather
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(Array.isArray(favorites) ? favorites : []).map((item) => (
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
                  <dd className="font-medium">
                    {formatTemp(item.temperature, tempUnit)}
                  </dd>
                </div>
                <div>
                  <dt className="text-white/55">Humidity</dt>
                  <dd className="font-medium">{item.humidity}%</dd>
                </div>
                <div>
                  <dt className="text-white/55">Rain</dt>
                  <dd className="font-medium">{item.rainProbability ?? 0}%</dd>
                </div>
              </dl>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => onOpenCity(item.city)}
                  className="flex-1 rounded-xl bg-white/90 px-3 py-2 text-sm font-medium text-slate-900"
                >
                  Open forecast
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveFavorite(item.id)}
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
  )
}
