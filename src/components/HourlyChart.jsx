import { useEffect, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import {
  formatTempValue,
  speedUnitLabel,
  tempUnitSymbol,
} from '../utils/units'
import { DropIcon, WeatherIcon } from './WeatherIcon'
import {
  buildSmoothPath,
  formatClock,
  formatHourLabel,
  getClosestHourIndex,
  getMetricValue,
} from '../utils/weather'

function useIsNarrow(breakpoint = 640) {
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const update = () => setIsNarrow(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [breakpoint])

  return isNarrow
}

export default function HourlyChart({
  hours,
  metric,
  useFeelsLike,
  selectedIndex,
  onSelect,
  sunrise,
  sunset,
}) {
  const { tempUnit, speedUnit } = useSettings()
  const isNarrow = useIsNarrow()

  // Narrow viewBox keeps axis labels readable when scaled to ~375px screens
  const width = isNarrow ? 360 : 920
  const height = isNarrow ? 230 : 280
  const pad = isNarrow
    ? { top: 26, right: 10, bottom: 34, left: 38 }
    : { top: 28, right: 24, bottom: 36, left: 48 }
  const axisFont = isNarrow ? 12 : 12
  const chartW = width - pad.left - pad.right
  const chartH = height - pad.top - pad.bottom

  const values = hours.map((hour) => getMetricValue(hour, metric, useFeelsLike))
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const span = Math.max(maxVal - minVal, 1)
  const yMin = Math.floor(minVal - span * 0.15)
  const yMax = Math.ceil(maxVal + span * 0.2)

  const points = hours.map((hour, index) => {
    const x = pad.left + (index / Math.max(hours.length - 1, 1)) * chartW
    const y =
      pad.top +
      ((yMax - getMetricValue(hour, metric, useFeelsLike)) / (yMax - yMin || 1)) *
        chartH
    return { x, y, hour, index }
  })

  const linePath = buildSmoothPath(points)
  const areaPath = `${linePath} L ${points.at(-1).x} ${pad.top + chartH} L ${points[0].x} ${pad.top + chartH} Z`
  const selected = points[selectedIndex] ?? points[0]
  const rainStart = hours.findIndex((hour) => (hour.rainProbability ?? 0) >= 40)

  const yTicks = [yMin, Math.round((yMin + yMax) / 2), yMax]
  const labelStep = Math.max(1, Math.floor(hours.length / (isNarrow ? 5 : 8)))
  const nowIndex = getClosestHourIndex(hours)

  function eventMarker(date, label) {
    if (!date || hours.length < 2) return null
    const start = hours[0].date.getTime()
    const end = hours.at(-1).date.getTime()
    if (date.getTime() < start || date.getTime() > end) return null
    const ratio = (date.getTime() - start) / (end - start || 1)
    const x = pad.left + ratio * chartW
    return {
      x,
      label: isNarrow ? label : `${label} ${formatClock(date)}`,
    }
  }

  const sunsetMarker = eventMarker(sunset, 'Sunset')
  const sunriseMarker = eventMarker(sunrise, 'Sunrise')

  function formatChartValue(value) {
    if (metric === 'Overview') {
      return `${formatTempValue(value, tempUnit)}${tempUnitSymbol(tempUnit)}`
    }
    if (metric === 'Wind') {
      const display =
        speedUnit === 'mph' ? Math.round(value * 0.621371) : Math.round(value)
      return `${display} ${speedUnitLabel(speedUnit)}`
    }
    if (
      metric === 'Precipitation' ||
      metric === 'Humidity' ||
      metric === 'Cloud cover'
    ) {
      return `${Math.round(value)}%`
    }
    return String(Math.round(value))
  }

  function formatYTick(tick) {
    if (metric === 'Overview') {
      return `${formatTempValue(tick, tempUnit)}°`
    }
    if (metric === 'Wind') {
      const display =
        speedUnit === 'mph' ? Math.round(tick * 0.621371) : Math.round(tick)
      return String(display)
    }
    return String(tick)
  }

  return (
    <div className="relative min-w-0 w-full overflow-x-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto max-w-full w-full select-none"
        role="img"
        aria-label={`${metric} chart`}
      >
        <defs>
          <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4A574" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#D4A574" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="rainFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4B7CB8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4B7CB8" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = pad.top + ((yMax - tick) / (yMax - yMin || 1)) * chartH
          return (
            <g key={tick}>
              <line
                x1={pad.left}
                y1={y}
                x2={width - pad.right}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
              />
              <text
                x={pad.left - 8}
                y={y + 4}
                textAnchor="end"
                fill="rgba(255,255,255,0.7)"
                fontSize={axisFont}
                fontWeight="500"
              >
                {formatYTick(tick)}
              </text>
            </g>
          )
        })}

        {rainStart >= 0 ? (
          <rect
            x={points[rainStart].x}
            y={pad.top}
            width={points.at(-1).x - points[rainStart].x}
            height={chartH}
            fill="url(#rainFill)"
          />
        ) : null}

        {rainStart >= 0
          ? Array.from({ length: isNarrow ? 10 : 18 }).map((_, i) => {
              const x =
                points[rainStart].x +
                ((points.at(-1).x - points[rainStart].x) * (i + 0.5)) /
                  (isNarrow ? 10 : 18)
              return (
                <line
                  key={i}
                  x1={x}
                  y1={pad.top + 20}
                  x2={x - 4}
                  y2={pad.top + chartH - 10}
                  stroke="rgba(180,210,255,0.28)"
                  strokeWidth="1.2"
                />
              )
            })
          : null}

        <path d={areaPath} fill="url(#tempFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#E8C9A0"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {[sunsetMarker, sunriseMarker].filter(Boolean).map((marker) => (
          <g key={marker.label}>
            <circle cx={marker.x} cy={pad.top + chartH * 0.55} r="6" fill="#F0C35A" />
            {!isNarrow ? (
              <text
                x={marker.x}
                y={pad.top + chartH * 0.55 + 20}
                textAnchor="middle"
                fill="rgba(255,255,255,0.7)"
                fontSize="10"
              >
                {marker.label}
              </text>
            ) : null}
          </g>
        ))}

        <line
          x1={selected.x}
          y1={pad.top}
          x2={selected.x}
          y2={pad.top + chartH}
          stroke="rgba(255,255,255,0.55)"
          strokeDasharray="4 4"
        />
        <circle
          cx={selected.x}
          cy={selected.y}
          r="5"
          fill="#fff"
          stroke="#E8C9A0"
          strokeWidth="2"
        />

        {points.map((point) => (
          <rect
            key={point.hour.time}
            x={point.x - chartW / hours.length / 2}
            y={pad.top}
            width={chartW / hours.length}
            height={chartH}
            fill="transparent"
            className="cursor-pointer"
            onClick={() => onSelect(point.index)}
            onMouseEnter={() => onSelect(point.index)}
          />
        ))}

        {hours.map((hour, index) => {
          const showLabel =
            index === nowIndex ||
            index === hours.length - 1 ||
            index % labelStep === 0
          if (!showLabel) return null
          const x = points[index].x
          return (
            <g key={`label-${hour.time}`}>
              <foreignObject x={x - 14} y={2} width="28" height="22">
                <div className="flex justify-center">
                  <WeatherIcon code={hour.weatherCode} className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </foreignObject>
              <text
                x={x}
                y={height - 8}
                textAnchor="middle"
                fill="rgba(255,255,255,0.65)"
                fontSize={isNarrow ? 10 : 11}
              >
                {formatHourLabel(hour.date, { isNow: index === nowIndex })}
              </text>
            </g>
          )
        })}
      </svg>

      {selected ? (
        <div
          className="pointer-events-none absolute top-6 z-10 max-w-[min(90vw,18rem)] -translate-x-1/2 rounded-2xl border border-white/20 bg-black/45 px-2.5 py-1.5 shadow-2xl backdrop-blur-xl sm:top-8 sm:px-3 sm:py-2"
          style={{
            left: `${Math.min(Math.max((selected.x / width) * 100, 18), 82)}%`,
          }}
        >
          <div className="flex items-center gap-1.5 text-xs whitespace-nowrap sm:gap-2 sm:text-sm">
            <span className="text-white/70">
              {formatHourLabel(selected.hour.date, {
                isNow: selected.index === nowIndex,
              })}
            </span>
            <WeatherIcon code={selected.hour.weatherCode} className="h-5 w-5" />
            <span className="font-semibold">
              {formatChartValue(
                getMetricValue(selected.hour, metric, useFeelsLike),
              )}
            </span>
            <span className="flex items-center gap-1 text-[#7EB6FF]">
              <DropIcon />
              {selected.hour.rainProbability ?? 0}%
            </span>
          </div>
        </div>
      ) : null}

      <div className="mt-2 flex max-w-full items-end gap-1 overflow-x-auto rounded-2xl bg-[#2f6fbf]/85 px-2 py-2 sm:px-3">
        {hours.map((hour, index) => (
          <button
            key={`precip-${hour.time}`}
            type="button"
            onClick={() => onSelect(index)}
            className="flex min-w-[2.4rem] flex-1 flex-col items-center gap-1 text-[10px] text-white/95 sm:min-w-[2.75rem] sm:text-[11px]"
          >
            <DropIcon className="h-3 w-3" />
            <span>{hour.rainProbability ?? 0}%</span>
          </button>
        ))}
      </div>
    </div>
  )
}
