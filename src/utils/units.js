export function cToF(celsius) {
  return (celsius * 9) / 5 + 32
}

export function kmhToMph(kmh) {
  return kmh * 0.621371
}

export function formatTemp(celsius, tempUnit = 'C') {
  if (celsius == null || Number.isNaN(celsius)) return '—'
  if (tempUnit === 'F') return `${Math.round(cToF(celsius))}°F`
  return `${Math.round(celsius)}°C`
}

export function formatSpeed(kmh, speedUnit = 'kmh') {
  if (kmh == null || Number.isNaN(kmh)) return '—'
  if (speedUnit === 'mph') return `${Math.round(kmhToMph(kmh))} mph`
  return `${Math.round(kmh)} km/h`
}

export function formatTempValue(celsius, tempUnit = 'C') {
  if (celsius == null || Number.isNaN(celsius)) return '—'
  if (tempUnit === 'F') return Math.round(cToF(celsius))
  return Math.round(celsius)
}

export function tempUnitSymbol(tempUnit = 'C') {
  return tempUnit === 'F' ? '°F' : '°C'
}

export function speedUnitLabel(speedUnit = 'kmh') {
  return speedUnit === 'mph' ? 'mph' : 'km/h'
}
