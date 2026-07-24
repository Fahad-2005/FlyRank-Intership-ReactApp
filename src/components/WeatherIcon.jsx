import { getWeatherCategory } from '../utils/weather'

export function WeatherIcon({ code, className = 'h-8 w-8' }) {
  const category = getWeatherCategory(code)

  if (category === 'clear') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4.5" fill="#F5C542" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180
          const x1 = 12 + Math.cos(rad) * 7
          const y1 = 12 + Math.sin(rad) * 7
          const x2 = 12 + Math.cos(rad) * 10
          const y2 = 12 + Math.sin(rad) * 10
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#F5C542"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )
        })}
      </svg>
    )
  }

  if (category === 'rain') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
        <path
          d="M8 10a4 4 0 0 1 7.7-1.5A3.5 3.5 0 0 1 18 16H8.5A3.5 3.5 0 0 1 8 10Z"
          fill="#9DB4C8"
        />
        <path
          d="M9 17.5 8 20M12 17.5 11 20M15 17.5 14 20"
          stroke="#5BA4FF"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (category === 'snow') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
        <path
          d="M8 10a4 4 0 0 1 7.7-1.5A3.5 3.5 0 0 1 18 16H8.5A3.5 3.5 0 0 1 8 10Z"
          fill="#C9D7E8"
        />
        <circle cx="9" cy="18.5" r="1" fill="#E8F1FF" />
        <circle cx="12" cy="19.5" r="1" fill="#E8F1FF" />
        <circle cx="15" cy="18.5" r="1" fill="#E8F1FF" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M7.5 15.5a4 4 0 0 1 .4-7.9A5 5 0 0 1 17 9.5a3.5 3.5 0 0 1 .2 7H7.5Z"
        fill="#A8B8C8"
      />
    </svg>
  )
}

export function DropIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="#7EB6FF" aria-hidden>
      <path d="M8 1.5C8 1.5 3.5 7 3.5 10a4.5 4.5 0 1 0 9 0C12.5 7 8 1.5 8 1.5Z" />
    </svg>
  )
}
