import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useWeatherApp } from '../context/WeatherAppContext'

const NAV_ITEMS = [
  { to: '/', label: 'Weather', end: true },
  { to: '/favorites', label: 'Favorites' },
  { to: '/discover', label: 'Discover' },
  { to: '/health', label: 'Health' },
]

const TITLES = {
  '/': 'Hourly forecast',
  '/favorites': 'Favorite cities',
  '/discover': 'Discover more',
  '/health': 'System health',
}

function navClass({ isActive }) {
  return `rounded-full px-3.5 py-1.5 text-sm transition ${
    isActive
      ? 'bg-[var(--color-accent)] font-semibold text-[var(--color-accent-ink)]'
      : 'text-white/75 hover:bg-white/10'
  }`
}

function mobileNavClass({ isActive }) {
  return `text-sm ${
    isActive
      ? 'font-semibold text-[var(--color-accent)]'
      : 'text-white/70'
  }`
}

export default function RootLayout() {
  const { displayName } = useSettings()
  const { backgroundImage, favoritesError } = useWeatherApp()
  const { pathname } = useLocation()
  const title = TITLES[pathname] ?? 'Weather Discovery'

  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-[var(--color-bg)] bg-cover bg-center bg-no-repeat text-[var(--color-text)] transition-[background-image] duration-700"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-slate-950/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[var(--container-max)] flex-col gap-5 px-[var(--page-pad)] py-6 pb-28 sm:px-6 lg:py-8">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.2em] text-white/50 uppercase">
              Weather Discovery
              {displayName ? ` · ${displayName}` : ''}
            </p>
            <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
          </div>
          <div className="flex flex-wrap rounded-full border border-[var(--color-border)] bg-black/25 p-1 backdrop-blur-xl">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navClass}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {favoritesError ? (
          <p className="rounded-2xl border border-amber-300/30 bg-amber-500/15 px-4 py-3 text-sm text-amber-100">
            {favoritesError}
          </p>
        ) : null}

        <Outlet />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[var(--color-surface-strong)] px-4 py-3 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-[var(--container-max)] justify-around">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={mobileNavClass}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </main>
  )
}
