import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useWeatherApp } from '../context/WeatherAppContext'

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Weather',
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: '/favorites',
    label: 'Favorites',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/discover',
    label: 'Discover',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="m10 14 1.2-3.8L15 9l-1.2 3.8L10 14Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/health',
    label: 'Health',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M4 12h4l2-5 3 10 2-5h5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
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
  return `flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-0.5 text-[10px] ${
    isActive
      ? 'font-semibold text-[var(--color-accent)]'
      : 'text-white/65'
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

      {/* Bottom tab bar is the standard mobile pattern — keep it */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[var(--color-surface-strong)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-[var(--container-max)] justify-around">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={mobileNavClass}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </main>
  )
}
