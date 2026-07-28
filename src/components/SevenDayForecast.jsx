import { useSettings } from '../context/SettingsContext'
import { formatClock, formatDayLabel, getWeatherDescription } from '../utils/weather'
import { formatSpeed, formatTemp } from '../utils/units'
import { WeatherIcon } from './WeatherIcon'

export default function SevenDayForecast({ weather }) {
  const { tempUnit, speedUnit } = useSettings()

  if (!weather?.days?.length) return null

  return (
    <section className="rounded-[24px] border border-white/15 bg-black/30 p-4 backdrop-blur-xl sm:p-5">
      <h3 className="text-xl font-semibold">7-day forecast</h3>
      <p className="mt-1 text-sm text-white/60">
        Daily highs, lows, sunrise, sunset, and wind for {weather.city}.
      </p>

      <div className="mt-4 space-y-2">
        {weather.days.map((day, index) => (
          <article
            key={day.dateKey}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <div className="min-w-[7rem]">
              <p className="font-medium">
                {formatDayLabel(day.date, index, weather.todayIndex)}
              </p>
              <p className="text-xs text-white/55">
                {getWeatherDescription(day.weatherCode)}
              </p>
            </div>
            <WeatherIcon code={day.weatherCode} className="h-8 w-8" />
            <div className="text-sm">
              <span className="font-semibold">
                {formatTemp(day.high, tempUnit)}
              </span>
              <span className="text-white/50"> / </span>
              <span className="text-white/75">
                {formatTemp(day.low, tempUnit)}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-white/60 sm:ml-auto">
              {day.sunrise ? (
                <span>↑ {formatClock(day.sunrise)}</span>
              ) : null}
              {day.sunset ? (
                <span>↓ {formatClock(day.sunset)}</span>
              ) : null}
              {day.maxWind != null ? (
                <span>Wind {formatSpeed(day.maxWind, speedUnit)}</span>
              ) : null}
              {day.avgHumidity != null ? (
                <span>Humidity {day.avgHumidity}%</span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
