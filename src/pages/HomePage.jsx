import { useEffect, useMemo, useState } from 'react'
import HourlyChart from '../components/HourlyChart'
import SevenDayForecast from '../components/SevenDayForecast'
import { DropIcon, WeatherIcon } from '../components/WeatherIcon'
import { useSettings } from '../context/SettingsContext'
import {
  formatTempValue,
  speedUnitLabel,
  tempUnitSymbol,
} from '../utils/units'
import {
  formatDayLabel,
  formatHourLabel,
  getClosestHourIndex,
  getMetricValue,
  getWeatherDescription,
  METRIC_TABS,
} from '../utils/weather'

export default function HomePage({
  query,
  setQuery,
  weather,
  loading,
  error,
  onSearch,
  favorited,
  onToggleFavorite,
}) {
  const { tempUnit, speedUnit } = useSettings()
  const [selectedDayIndex, setSelectedDayIndex] = useState(
    weather?.todayIndex ?? 0,
  )
  const [selectedHourIndex, setSelectedHourIndex] = useState(0)
  const [activeMetric, setActiveMetric] = useState('Overview')
  const [viewMode, setViewMode] = useState('Chart')
  const [useFeelsLike, setUseFeelsLike] = useState(false)

  const cityKey = weather
    ? `${weather.city}-${weather.country}-${weather.observedAt}`
    : ''

  useEffect(() => {
    if (!weather) return

    setSelectedDayIndex(weather.todayIndex)
    const todayHours = weather.days[weather.todayIndex]?.hours ?? []
    const nowIndex = Math.max(
      0,
      todayHours.findIndex(
        (hour) => hour.time === weather.hours[weather.currentHourIndex]?.time,
      ),
    )
    setSelectedHourIndex(nowIndex === -1 ? 0 : nowIndex)
  }, [cityKey, weather])


  const selectedDay = weather?.days?.[selectedDayIndex]
  const dayHours = selectedDay?.hours ?? []

  const chartHours = useMemo(() => {
    if (dayHours.length === 0) return []
    const now = Date.now()
    const start = dayHours.findIndex(
      (hour) => hour.date.getTime() >= now - 2 * 60 * 60 * 1000,
    )
    const from =
      selectedDayIndex === weather?.todayIndex ? Math.max(0, start) : 0
    return dayHours.slice(from, from + 18)
  }, [dayHours, selectedDayIndex, weather?.todayIndex])

  const safeHourIndex = Math.min(
    selectedHourIndex,
    Math.max(chartHours.length - 1, 0),
  )
  const nowHourIndex = getClosestHourIndex(chartHours)

  function formatMetricDisplay(hour, metric) {
    const value = getMetricValue(hour, metric, useFeelsLike)
    if (metric === 'Overview') {
      return `${formatTempValue(value, tempUnit)}${tempUnitSymbol(tempUnit)}`
    }
    if (metric === 'Wind') {
      const display =
        speedUnit === 'mph' ? Math.round(value * 0.621371) : Math.round(value)
      return `${display} ${speedUnitLabel(speedUnit)}`
    }
    if (metric === 'Precipitation' || metric === 'Humidity' || metric === 'Cloud cover') {
      return `${Math.round(value)}%`
    }
    return String(value)
  }

  return (
    <>
      <form
        onSubmit={onSearch}
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
          <h2 className="text-3xl font-semibold tracking-tight">Search a city</h2>
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
                <h2 className="text-3xl font-semibold tracking-tight">Hourly</h2>
              </div>
              <button
                type="button"
                onClick={onToggleFavorite}
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
              const label = formatDayLabel(day.date, index, weather.todayIndex)
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
                    {formatTempValue(day.high, tempUnit)}°/
                    {formatTempValue(day.low, tempUnit)}°
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
                    <WeatherIcon code={hour.weatherCode} className="h-7 w-7" />
                    <span className="font-medium">
                      {formatMetricDisplay(hour, activeMetric)}
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
                  Condition: {getWeatherDescription(selectedDay?.weatherCode)}
                </span>
              </div>
            </div>
          </div>

          <SevenDayForecast weather={weather} />
        </section>
      )}
    </>
  )
}
