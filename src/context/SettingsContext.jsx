import { createContext, useContext, useEffect, useState } from 'react'

const SettingsContext = createContext(null)

const DEFAULTS = {
  tempUnit: 'C',
  speedUnit: 'kmh',
  displayName: '',
}

function loadSettings() {
  try {
    const raw = localStorage.getItem('weather_settings')
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings)

  useEffect(() => {
    localStorage.setItem('weather_settings', JSON.stringify(settings))
  }, [settings])

  function setTempUnit(tempUnit) {
    setSettings((prev) => ({ ...prev, tempUnit }))
  }

  function setSpeedUnit(speedUnit) {
    setSettings((prev) => ({ ...prev, speedUnit }))
  }

  function setDisplayName(displayName) {
    setSettings((prev) => ({ ...prev, displayName }))
  }

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setTempUnit,
        setSpeedUnit,
        setDisplayName,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return ctx
}
