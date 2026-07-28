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
  return `rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition ${
    isActive
      ? 'bg-[var(--color-accent)] font-semibold text-[var(--color-accent-ink)]'
      : 'text-white/75 hover:bg-white/10'
  }`
}

function mobileNavClass({ isActive }) {
  return `px-1 text-xs sm:text-sm ${
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
      className="relative min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[var(--color-bg)] bg-cover bg-center bg-no-repeat text-[var(--color-text)] transition-[background-image] duration-700"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-slate-950/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full min-w-0 max-w-[var(--container-max)] flex-col gap-4 px-[var(--page-pad)] py-5 pb-24 sm:gap-5 sm:px-6 sm:py-6 lg:py-8">
        <nav className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] tracking-[0.18em] text-white/50 uppercase sm:text-xs sm:tracking-[0.2em]">
              Weather Discovery
              {displayName ? ` · ${displayName}` : ''}
            </p>
            <h1 className="text-lg font-semibold sm:text-xl lg:text-2xl">
              {title}
            </h1>
          </div>

          {/* Desktop / tablet nav — hidden on small phones (bottom bar used instead) */}
          <div className="hidden max-w-full flex-wrap justify-end rounded-full border border-[var(--color-border)] bg-black/25 p-1 backdrop-blur-xl sm:flex">
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
          <p className="rounded-2xl border border-amber-300/30 bg-amber-500/15 px-3 py-3 text-sm text-amber-100 sm:px-4">
            {favoritesError}
          </p>
        ) : null}

        <div className="min-w-0 w-full">
          <Outlet />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[var(--color-surface-strong)] px-2 py-3 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-[var(--container-max)] justify-around gap-1">
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
