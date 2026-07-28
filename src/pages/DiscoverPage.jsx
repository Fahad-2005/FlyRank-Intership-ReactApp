import CompareCitiesPanel from '../components/CompareCitiesPanel'
import RecentSearchesPanel from '../components/RecentSearchesPanel'
import UnitSettingsPanel from '../components/UnitSettingsPanel'
import UserProfilePanel from '../components/UserProfilePanel'
import WeatherAlertsPanel from '../components/WeatherAlertsPanel'

const QUICK_CITIES = ['Lahore', 'London', 'Tokyo', 'Dubai', 'New York']

export default function DiscoverPage({
  loading,
  favorites,
  recentSearches,
  onOpenCity,
  onClearRecent,
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-white/20 bg-black/35 p-5 shadow-2xl backdrop-blur-2xl">
        <h2 className="text-2xl font-semibold">Discover</h2>
        <p className="mt-1 text-sm text-white/65">
          Tools and settings to get more from your weather dashboard.
        </p>
      </section>

      <UserProfilePanel />
      <UnitSettingsPanel />
      <RecentSearchesPanel
        recentSearches={recentSearches}
        loading={loading}
        onOpenCity={onOpenCity}
        onClear={onClearRecent}
      />
      <CompareCitiesPanel favorites={favorites} />
      <WeatherAlertsPanel favorites={favorites} />

      <section className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
        <h3 className="font-semibold">7-day forecast</h3>
        <p className="mt-1 text-sm text-white/65">
          Search any city on the Weather tab — the full 7-day breakdown with
          sunrise, sunset, and wind appears below the hourly chart.
        </p>
      </section>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-4">
        <p className="text-sm text-white/70">Try a popular city quickly:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              disabled={loading}
              onClick={() => onOpenCity(city)}
              className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-sm hover:bg-white/10"
            >
              {city}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
